import { useEffect, useRef, useCallback } from "react";
import { useSimulationStore, useCanvasStore, useScenarioStore, useUIStore } from "@/store";
import { SimulationStatus, PlaybackSpeed } from "@/types/simulation";
import type { ScenarioTemplate } from "@/types/scenario";
import { runSimulation, buildEvidenceBundle } from "@/engine/simulation-engine";
import { SIMULATION_BASE_DELAY_MS } from "@/lib/constants";
import { applyEventToCanvas } from "@/lib/playback-utils";

export function useDualSimulationPlayback() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    run,
    status,
    currentEventIndex,
    speed,
    setRun,
    setEvidence,
    setStatus,
    setCurrentEventIndex,
    commitRunToSlot,
    resetDualRun,
  } = useSimulationStore();

  const { activeScenario, policies, todayPolicies } = useScenarioStore();
  const { dualRunPhase, setDualRunPhase, markRunCompleted } = useUIStore();
  const { updateNodeSimStatus, updateEdgeAnimation, updateNodeActive, resetSimStates, edges, loadScenario } = useCanvasStore();

  const startDualSimulation = useCallback(async () => {
    if (!activeScenario) return;

    try {
      // Reset everything
      resetDualRun();
      resetSimStates();

      // Phase 1: Run "Today" simulation
      setDualRunPhase("today-running");
      useSimulationStore.setState({ activeMode: "today" });

      const { nodes: canvasNodes, edges: canvasEdges } = useCanvasStore.getState();
      const actors = canvasNodes.map((n) => n.data.actor);
      const scenarioEdges = canvasEdges.map((e) => ({
        sourceId: e.source,
        targetId: e.target,
        type: (e.data?.type ?? "authority") as "authority" | "delegation",
      }));

      let initiatorRoleId = activeScenario.defaultWorkflow.initiatorRoleId;
      if (!initiatorRoleId && actors.length > 0) {
        const roleNode = actors.find((a) => a.type === "role");
        initiatorRoleId = roleNode?.id ?? actors[0]!.id;
      }

      const assembledScenario: ScenarioTemplate = {
        ...activeScenario,
        actors,
        edges: scenarioEdges,
        defaultWorkflow: {
          ...activeScenario.defaultWorkflow,
          initiatorRoleId,
        },
      };

      const seed = 42;
      const friction = activeScenario.todayFriction;

      // Run "Today" with friction
      const todayRun = runSimulation(
        assembledScenario,
        todayPolicies.length > 0 ? todayPolicies : policies,
        seed,
        friction
      );
      todayRun.id = `run-today-${activeScenario.id}-${seed}`;

      setRun(todayRun);
      setCurrentEventIndex(-1);
      setStatus(SimulationStatus.Running);

      const todayEvidence = await buildEvidenceBundle(
        todayRun,
        assembledScenario,
        todayPolicies.length > 0 ? todayPolicies : policies
      );
      setEvidence(todayEvidence);

    } catch {
      setStatus(SimulationStatus.Failed);
      setDualRunPhase("idle");
    }
  }, [activeScenario, policies, todayPolicies, setRun, setEvidence, setStatus, setCurrentEventIndex, resetSimStates, resetDualRun, setDualRunPhase]);

  // Auto-advance playback
  useEffect(() => {
    if (status !== SimulationStatus.Running || !run) return;

    const delay =
      speed === PlaybackSpeed.Instant
        ? 50
        : SIMULATION_BASE_DELAY_MS / (speed || 1);

    timerRef.current = setTimeout(() => {
      const nextIndex = currentEventIndex + 1;

      if (nextIndex >= run.events.length) {
        setStatus(SimulationStatus.Completed);
        return;
      }

      const event = run.events[nextIndex];
      if (event) {
        applyEventToCanvas(event, edges, updateNodeSimStatus, updateEdgeAnimation);
        updateNodeActive(event.actorId, true);
      }

      setCurrentEventIndex(nextIndex);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status, currentEventIndex, run, speed, edges, setStatus, setCurrentEventIndex, updateNodeSimStatus, updateEdgeAnimation, updateNodeActive]);

  // Handle phase transitions when a run completes
  useEffect(() => {
    if (status !== SimulationStatus.Completed) return;

    if (dualRunPhase === "today-running") {
      commitRunToSlot();
      setDualRunPhase("today-done");
    } else if (dualRunPhase === "accumulate-running") {
      commitRunToSlot();
      setDualRunPhase("accumulate-done");
      markRunCompleted();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, dualRunPhase]);

  // When today-done, start Accumulate run after a brief pause
  useEffect(() => {
    if (dualRunPhase !== "today-done") return;

    transitionTimerRef.current = setTimeout(async () => {
      if (!activeScenario) return;

      try {
        resetSimStates();
        setDualRunPhase("accumulate-running");
        useSimulationStore.setState({ activeMode: "accumulate" });

        // Reload canvas for clean state
        loadScenario(activeScenario);

        const { nodes: canvasNodes, edges: canvasEdges } = useCanvasStore.getState();
        const actors = canvasNodes.map((n) => n.data.actor);
        const scenarioEdges = canvasEdges.map((e) => ({
          sourceId: e.source,
          targetId: e.target,
          type: (e.data?.type ?? "authority") as "authority" | "delegation",
        }));

        const assembledScenario: ScenarioTemplate = {
          ...activeScenario,
          actors,
          edges: scenarioEdges,
        };

        const seed = 42;

        // Run "Accumulate" — no friction, proper policies
        const accRun = runSimulation(assembledScenario, policies, seed);
        accRun.id = `run-accumulate-${activeScenario.id}-${seed}`;

        setRun(accRun);
        setCurrentEventIndex(-1);
        setStatus(SimulationStatus.Running);

        const accEvidence = await buildEvidenceBundle(accRun, assembledScenario, policies);
        setEvidence(accEvidence);
      } catch {
        setStatus(SimulationStatus.Failed);
        setDualRunPhase("idle");
      }
    }, 2000);

    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dualRunPhase]);

  // Step-backward: replay events 0..currentEventIndex when index changes while not running
  useEffect(() => {
    if (status === SimulationStatus.Running || !run || currentEventIndex < 0) return;

    resetSimStates();

    const freshEdges = useCanvasStore.getState().edges;

    for (let i = 0; i <= currentEventIndex; i++) {
      const event = run.events[i];
      if (event) {
        applyEventToCanvas(event, freshEdges, updateNodeSimStatus, updateEdgeAnimation);
        if (i === currentEventIndex) {
          updateNodeActive(event.actorId, true);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEventIndex, status]);

  return { startDualSimulation };
}
