import { useEffect, useRef, useCallback } from "react";
import { useSimulationStore, useCanvasStore, useScenarioStore } from "@/store";
import { SimulationStatus, PlaybackSpeed } from "@/types/simulation";
import type { ScenarioTemplate } from "@/types/scenario";
import { runSimulation, buildEvidenceBundle } from "@/engine/simulation-engine";
import { SIMULATION_BASE_DELAY_MS } from "@/lib/constants";
import { applyEventToCanvas } from "@/lib/playback-utils";

export function useSimulationPlayback() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    run,
    status,
    currentEventIndex,
    speed,
    useRandomSeed,
    setRun,
    setEvidence,
    setStatus,
    setCurrentEventIndex,
  } = useSimulationStore();

  const { activeScenario } = useScenarioStore();
  const { policies } = useScenarioStore();
  const { updateNodeSimStatus, updateEdgeAnimation, updateNodeActive, resetSimStates, edges } = useCanvasStore();

  const startSimulation = useCallback(async () => {
    if (!activeScenario) return;

    try {
      resetSimStates();

      // Build a complete scenario from canvas state for custom orgs
      const { nodes: canvasNodes, edges: canvasEdges } = useCanvasStore.getState();
      const actors = canvasNodes.map((n) => n.data.actor);
      const scenarioEdges = canvasEdges.map((e) => ({
        sourceId: e.source,
        targetId: e.target,
        type: (e.data?.type ?? "authority") as "authority" | "delegation",
      }));

      // Determine initiator: use template's if set, otherwise pick first "role" node or first node
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

      const seed = useRandomSeed ? Date.now() : 42;
      const simRun = runSimulation(assembledScenario, policies, seed);
      setRun(simRun);
      setCurrentEventIndex(-1);
      setStatus(SimulationStatus.Running);

      // Build evidence bundle
      const evidence = await buildEvidenceBundle(simRun, assembledScenario, policies);
      setEvidence(evidence);
    } catch {
      setStatus(SimulationStatus.Failed);
    }
  }, [activeScenario, policies, useRandomSeed, setRun, setEvidence, setStatus, setCurrentEventIndex, resetSimStates]);

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

  // Step-backward: replay events 0..currentEventIndex when index changes while not running
  useEffect(() => {
    if (status === SimulationStatus.Running || !run || currentEventIndex < 0) return;

    resetSimStates();

    // Re-read edges after reset
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

  return { startSimulation };
}
