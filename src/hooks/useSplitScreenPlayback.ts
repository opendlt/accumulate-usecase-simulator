import { useEffect, useRef, useCallback, useState } from "react";
import type { StoreApi } from "zustand";
import { useSimulationStore, useScenarioStore, useUIStore } from "@/store";
import type { CanvasStore } from "@/store";
import { SimulationStatus, SimulationEventType, PlaybackSpeed } from "@/types/simulation";
import type { SimulationRun, SimulationEvent } from "@/types/simulation";
import type { ScenarioTemplate } from "@/types/scenario";
import type { Actor } from "@/types/organization";
import { runSimulation, buildEvidenceBundle } from "@/engine/simulation-engine";
import { SIMULATION_BASE_DELAY_MS } from "@/lib/constants";
import { applyEventToCanvas } from "@/lib/playback-utils";

export interface SplitScreenProgress {
  todayIndex: number;
  todayTotal: number;
  accIndex: number;
  accTotal: number;
  todayComplete: boolean;
  accComplete: boolean;
  bothComplete: boolean;
  todayManualSteps: number;
  fraction: number;
  isPaused: boolean;
}

function computeFraction(
  todayIndex: number,
  todayTotal: number,
  accIndex: number,
  accTotal: number
): number {
  if (todayTotal === 0 && accTotal === 0) return 0;
  const todayProgress = todayTotal > 0 ? (todayIndex + 1) / todayTotal : 1;
  const accProgress = accTotal > 0 ? (accIndex + 1) / accTotal : 1;
  return Math.max(todayProgress, accProgress);
}

export function useSplitScreenPlayback(
  todayStoreApi: StoreApi<CanvasStore>,
  accStoreApi: StoreApi<CanvasStore>
) {
  const todayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const todayIndexRef = useRef(-1);
  const accIndexRef = useRef(-1);
  const todayRunRef = useRef<SimulationRun | null>(null);
  const accRunRef = useRef<SimulationRun | null>(null);
  const actorsRef = useRef<Actor[]>([]);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);

  const [todayEvents, setTodayEvents] = useState<SimulationEvent[]>([]);
  const [accEvents, setAccEvents] = useState<SimulationEvent[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);

  const [progress, setProgress] = useState<SplitScreenProgress>({
    todayIndex: -1,
    todayTotal: 0,
    accIndex: -1,
    accTotal: 0,
    todayComplete: false,
    accComplete: false,
    bothComplete: false,
    todayManualSteps: 0,
    fraction: 0,
    isPaused: false,
  });

  const { activeScenario, policies, todayPolicies } = useScenarioStore();
  const { setDualRunPhase, markRunCompleted } = useUIStore();

  const clearTimers = useCallback(() => {
    if (todayTimerRef.current) {
      clearTimeout(todayTimerRef.current);
      todayTimerRef.current = null;
    }
    if (accTimerRef.current) {
      clearTimeout(accTimerRef.current);
      accTimerRef.current = null;
    }
  }, []);

  // Apply a single event to a given store
  const applyEvent = useCallback((storeApi: StoreApi<CanvasStore>, run: SimulationRun, index: number) => {
    const event = run.events[index];
    if (!event) return;

    const state = storeApi.getState();
    applyEventToCanvas(
      event,
      state.edges,
      state.updateNodeSimStatus,
      state.updateEdgeAnimation,
      state.updateNodeFrictionDescription
    );
    state.updateNodeActive(event.actorId, true);
  }, []);

  // Today timer chain
  const advanceToday = useCallback(() => {
    if (!isRunningRef.current || !todayRunRef.current || isPausedRef.current) return;

    const run = todayRunRef.current;
    const nextIndex = todayIndexRef.current + 1;

    if (nextIndex >= run.events.length) {
      // Today side complete
      setProgress((p) => {
        const next = { ...p, todayIndex: nextIndex - 1, todayComplete: true };
        next.bothComplete = next.todayComplete && next.accComplete;
        next.fraction = computeFraction(next.todayIndex, next.todayTotal, next.accIndex, next.accTotal);
        return next;
      });
      return;
    }

    applyEvent(todayStoreApi, run, nextIndex);
    todayIndexRef.current = nextIndex;

    // Count manual steps
    const evt = run.events[nextIndex];
    const isManual = evt?.type === SimulationEventType.MANUAL_STEP || evt?.type === SimulationEventType.WAITING;

    setProgress((p) => {
      const next = {
        ...p,
        todayIndex: nextIndex,
        todayManualSteps: isManual ? p.todayManualSteps + 1 : p.todayManualSteps,
      };
      next.fraction = computeFraction(next.todayIndex, next.todayTotal, next.accIndex, next.accTotal);
      return next;
    });

    // Schedule next — Today runs slower (1.8x base delay)
    const currentSpeed = useSimulationStore.getState().speed;
    const delay = currentSpeed === PlaybackSpeed.Instant
      ? 80
      : (SIMULATION_BASE_DELAY_MS * 1.8) / (currentSpeed || 1);

    todayTimerRef.current = setTimeout(advanceToday, delay);
  }, [todayStoreApi, applyEvent]);

  // Accumulate timer chain
  const advanceAccumulate = useCallback(() => {
    if (!isRunningRef.current || !accRunRef.current || isPausedRef.current) return;

    const run = accRunRef.current;
    const nextIndex = accIndexRef.current + 1;

    if (nextIndex >= run.events.length) {
      setProgress((p) => {
        const next = { ...p, accIndex: nextIndex - 1, accComplete: true };
        next.bothComplete = next.todayComplete && next.accComplete;
        next.fraction = computeFraction(next.todayIndex, next.todayTotal, next.accIndex, next.accTotal);
        return next;
      });
      return;
    }

    applyEvent(accStoreApi, run, nextIndex);
    accIndexRef.current = nextIndex;

    setProgress((p) => {
      const next = { ...p, accIndex: nextIndex };
      next.fraction = computeFraction(next.todayIndex, next.todayTotal, next.accIndex, next.accTotal);
      return next;
    });

    // Accumulate runs at normal speed
    const currentSpeed = useSimulationStore.getState().speed;
    const delay = currentSpeed === PlaybackSpeed.Instant
      ? 50
      : SIMULATION_BASE_DELAY_MS / (currentSpeed || 1);

    accTimerRef.current = setTimeout(advanceAccumulate, delay);
  }, [accStoreApi, applyEvent]);

  // Watch for both complete
  useEffect(() => {
    if (progress.bothComplete && isRunningRef.current) {
      isRunningRef.current = false;
      clearTimers();

      // Store runs in simulation store for evidence/comparison
      const todayRun = todayRunRef.current;
      const accRun = accRunRef.current;
      if (todayRun && accRun) {
        useSimulationStore.setState({
          todayRun,
          accumulateRun: accRun,
          run: accRun,
          status: SimulationStatus.Completed,
          activeMode: "accumulate",
        });
      }

      setDualRunPhase("accumulate-done");
      markRunCompleted();
    }
  }, [progress.bothComplete, clearTimers, setDualRunPhase, markRunCompleted]);

  // --- Pause / Resume / Seek ---

  const pause = useCallback(() => {
    isPausedRef.current = true;
    clearTimers();
    setProgress((p) => ({ ...p, isPaused: true }));
  }, [clearTimers]);

  const resume = useCallback(() => {
    if (!isRunningRef.current && !progress.bothComplete) {
      // Not started yet or already complete
      return;
    }
    if (progress.bothComplete) return;

    isPausedRef.current = false;
    setProgress((p) => ({ ...p, isPaused: false }));

    // Restart timer chains from current positions
    const currentSpeed = useSimulationStore.getState().speed;

    if (!progress.todayComplete && todayRunRef.current) {
      const delay = currentSpeed === PlaybackSpeed.Instant
        ? 80
        : (SIMULATION_BASE_DELAY_MS * 1.8) / (currentSpeed || 1);
      todayTimerRef.current = setTimeout(advanceToday, delay);
    }

    if (!progress.accComplete && accRunRef.current) {
      const delay = currentSpeed === PlaybackSpeed.Instant
        ? 50
        : SIMULATION_BASE_DELAY_MS / (currentSpeed || 1);
      accTimerRef.current = setTimeout(advanceAccumulate, delay);
    }
  }, [progress.bothComplete, progress.todayComplete, progress.accComplete, clearTimers, advanceToday, advanceAccumulate]);

  const seekTo = useCallback((fraction: number) => {
    const todayRun = todayRunRef.current;
    const accRun = accRunRef.current;
    if (!todayRun || !accRun) return;

    clearTimers();

    // Compute target indices from fraction
    const todayTarget = todayRun.events.length > 0
      ? Math.round(fraction * (todayRun.events.length - 1))
      : -1;
    const accTarget = accRun.events.length > 0
      ? Math.round(fraction * (accRun.events.length - 1))
      : -1;

    // Reset and replay Today
    const todayState = todayStoreApi.getState();
    todayState.resetSimStates();
    const todayEdges = todayStoreApi.getState().edges;
    let todayManualSteps = 0;
    for (let i = 0; i <= todayTarget && i < todayRun.events.length; i++) {
      const event = todayRun.events[i]!;
      applyEventToCanvas(
        event,
        todayEdges,
        todayState.updateNodeSimStatus,
        todayState.updateEdgeAnimation,
        todayState.updateNodeFrictionDescription
      );
      if (event.type === SimulationEventType.MANUAL_STEP || event.type === SimulationEventType.WAITING) {
        todayManualSteps++;
      }
    }

    // Reset and replay Accumulate
    const accState = accStoreApi.getState();
    accState.resetSimStates();
    const accEdges = accStoreApi.getState().edges;
    for (let i = 0; i <= accTarget && i < accRun.events.length; i++) {
      const event = accRun.events[i]!;
      applyEventToCanvas(
        event,
        accEdges,
        accState.updateNodeSimStatus,
        accState.updateEdgeAnimation,
        accState.updateNodeFrictionDescription
      );
    }

    // Update refs
    todayIndexRef.current = todayTarget;
    accIndexRef.current = accTarget;

    const todayComplete = todayTarget >= todayRun.events.length - 1;
    const accComplete = accTarget >= accRun.events.length - 1;
    const bothComplete = todayComplete && accComplete;

    setProgress({
      todayIndex: todayTarget,
      todayTotal: todayRun.events.length,
      accIndex: accTarget,
      accTotal: accRun.events.length,
      todayComplete,
      accComplete,
      bothComplete,
      todayManualSteps,
      fraction: computeFraction(todayTarget, todayRun.events.length, accTarget, accRun.events.length),
      isPaused: isPausedRef.current,
    });

    if (bothComplete) {
      isRunningRef.current = false;
    } else if (!isPausedRef.current && isRunningRef.current) {
      // Restart timer chains
      const currentSpeed = useSimulationStore.getState().speed;

      if (!todayComplete) {
        const delay = currentSpeed === PlaybackSpeed.Instant
          ? 80
          : (SIMULATION_BASE_DELAY_MS * 1.8) / (currentSpeed || 1);
        todayTimerRef.current = setTimeout(advanceToday, delay);
      }

      if (!accComplete) {
        const delay = currentSpeed === PlaybackSpeed.Instant
          ? 50
          : SIMULATION_BASE_DELAY_MS / (currentSpeed || 1);
        accTimerRef.current = setTimeout(advanceAccumulate, delay);
      }
    }
  }, [todayStoreApi, accStoreApi, clearTimers, advanceToday, advanceAccumulate]);

  const startSplitSimulation = useCallback(() => {
    if (!activeScenario) return;

    // Reset
    clearTimers();
    isRunningRef.current = false;
    isPausedRef.current = false;
    todayIndexRef.current = -1;
    accIndexRef.current = -1;

    useSimulationStore.getState().resetDualRun();

    // Build scenario from active scenario
    const todayStore = todayStoreApi.getState();
    const accStore = accStoreApi.getState();

    // Load scenario into both stores
    todayStore.loadScenario(activeScenario);
    accStore.loadScenario(activeScenario);

    const { nodes: canvasNodes, edges: canvasEdges } = todayStoreApi.getState();
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

    // Pre-compute both runs synchronously
    const todayRun = runSimulation(
      assembledScenario,
      todayPolicies.length > 0 ? todayPolicies : policies,
      seed,
      friction
    );
    todayRun.id = `run-today-${activeScenario.id}-${seed}`;

    const accRun = runSimulation(assembledScenario, policies, seed);
    accRun.id = `run-accumulate-${activeScenario.id}-${seed}`;

    todayRunRef.current = todayRun;
    accRunRef.current = accRun;
    actorsRef.current = actors;

    setTodayEvents(todayRun.events);
    setAccEvents(accRun.events);
    setActors(actors);

    setProgress({
      todayIndex: -1,
      todayTotal: todayRun.events.length,
      accIndex: -1,
      accTotal: accRun.events.length,
      todayComplete: false,
      accComplete: false,
      bothComplete: false,
      todayManualSteps: 0,
      fraction: 0,
      isPaused: false,
    });

    // Build evidence for both runs (async, non-blocking)
    buildEvidenceBundle(todayRun, assembledScenario, todayPolicies.length > 0 ? todayPolicies : policies).then(
      (todayEvidence) => {
        useSimulationStore.setState({ todayEvidence });
      }
    );
    buildEvidenceBundle(accRun, assembledScenario, policies).then(
      (accEvidence) => {
        useSimulationStore.setState({ accumulateEvidence: accEvidence, evidence: accEvidence });
      }
    );

    // Start both timer chains
    setDualRunPhase("split-running");
    useSimulationStore.setState({
      activeMode: "today",
      status: SimulationStatus.Running,
      todayRun: null,
      accumulateRun: null,
    });
    isRunningRef.current = true;

    // Small initial delay for both
    todayTimerRef.current = setTimeout(advanceToday, 300);
    accTimerRef.current = setTimeout(advanceAccumulate, 300);
  }, [
    activeScenario,
    policies,
    todayPolicies,
    todayStoreApi,
    accStoreApi,
    clearTimers,
    setDualRunPhase,
    advanceToday,
    advanceAccumulate,
  ]);

  const skipToResults = useCallback(() => {
    if (!todayRunRef.current || !accRunRef.current) return;

    clearTimers();

    // Apply all remaining events for Today
    const todayRun = todayRunRef.current;
    const todayState = todayStoreApi.getState();
    todayState.resetSimStates();
    const todayEdges = todayStoreApi.getState().edges;
    for (let i = 0; i < todayRun.events.length; i++) {
      const event = todayRun.events[i]!;
      applyEventToCanvas(
        event,
        todayEdges,
        todayState.updateNodeSimStatus,
        todayState.updateEdgeAnimation,
        todayState.updateNodeFrictionDescription
      );
    }

    // Apply all remaining events for Accumulate
    const accRun = accRunRef.current;
    const accState = accStoreApi.getState();
    accState.resetSimStates();
    const accEdges = accStoreApi.getState().edges;
    for (let i = 0; i < accRun.events.length; i++) {
      const event = accRun.events[i]!;
      applyEventToCanvas(
        event,
        accEdges,
        accState.updateNodeSimStatus,
        accState.updateEdgeAnimation,
        accState.updateNodeFrictionDescription
      );
    }

    // Count manual steps
    const manualSteps = todayRun.events.filter(
      (e) => e.type === SimulationEventType.MANUAL_STEP || e.type === SimulationEventType.WAITING
    ).length;

    todayIndexRef.current = todayRun.events.length - 1;
    accIndexRef.current = accRun.events.length - 1;

    setProgress({
      todayIndex: todayRun.events.length - 1,
      todayTotal: todayRun.events.length,
      accIndex: accRun.events.length - 1,
      accTotal: accRun.events.length,
      todayComplete: true,
      accComplete: true,
      bothComplete: true,
      todayManualSteps: manualSteps,
      fraction: 1,
      isPaused: isPausedRef.current,
    });
  }, [todayStoreApi, accStoreApi, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      isRunningRef.current = false;
    };
  }, [clearTimers]);

  return {
    startSplitSimulation,
    progress,
    skipToResults,
    todayEvents,
    accEvents,
    actors,
    pause,
    resume,
    seekTo,
  };
}
