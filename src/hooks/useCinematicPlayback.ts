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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CinematicAct =
  | "idle"
  | "prerun"
  | "act1"
  | "transition12"
  | "provisioning"
  | "act2"
  | "transition2r"
  | "resolution";

export interface CinematicProgress {
  act: CinematicAct;
  todayIndex: number;
  todayTotal: number;
  accIndex: number;
  accTotal: number;
  todayComplete: boolean;
  accComplete: boolean;
  bothComplete: boolean;
  todayManualSteps: number;
  fraction: number;           // 0–1 across BOTH acts combined
  isPaused: boolean;
  todayFrictionDescriptions: string[];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCinematicPlayback(
  todayStoreApi: StoreApi<CanvasStore>,
  accStoreApi: StoreApi<CanvasStore>,
) {
  // ---- refs ----
  const todayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionStartRef = useRef<number>(0);
  const transitionRemainingRef = useRef<number>(0);
  const todayIndexRef = useRef(-1);
  const accIndexRef = useRef(-1);
  const todayRunRef = useRef<SimulationRun | null>(null);
  const accRunRef = useRef<SimulationRun | null>(null);
  const actorsRef = useRef<Actor[]>([]);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const actRef = useRef<CinematicAct>("idle");
  const frictionDescsRef = useRef<string[]>([]);

  // ---- state ----
  const [todayEvents, setTodayEvents] = useState<SimulationEvent[]>([]);
  const [accEvents, setAccEvents] = useState<SimulationEvent[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);

  const [progress, setProgress] = useState<CinematicProgress>({
    act: "idle",
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
    todayFrictionDescriptions: [],
  });

  const { activeScenario, policies, todayPolicies } = useScenarioStore();
  const { setDualRunPhase, completeCinematic } = useUIStore();

  // ---- helpers ----

  const clearTimers = useCallback(() => {
    if (todayTimerRef.current) {
      clearTimeout(todayTimerRef.current);
      todayTimerRef.current = null;
    }
    if (accTimerRef.current) {
      clearTimeout(accTimerRef.current);
      accTimerRef.current = null;
    }
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const setAct = useCallback((act: CinematicAct) => {
    actRef.current = act;
    setProgress((p) => ({ ...p, act }));
  }, []);

  const computeFraction = useCallback(
    (todayIdx: number, todayTotal: number, accIdx: number, accTotal: number) => {
      const total = todayTotal + accTotal;
      if (total === 0) return 0;
      const todayDone = Math.max(0, todayIdx + 1);
      const accDone = Math.max(0, accIdx + 1);
      return (todayDone + accDone) / total;
    },
    [],
  );

  const applyEvent = useCallback(
    (storeApi: StoreApi<CanvasStore>, run: SimulationRun, index: number) => {
      const event = run.events[index];
      if (!event) return;
      const state = storeApi.getState();
      applyEventToCanvas(
        event,
        state.edges,
        state.updateNodeSimStatus,
        state.updateEdgeAnimation,
        state.updateNodeFrictionDescription,
        state.clearAllFlowPackets,
        state.updateEdgeFlowPacket,
        state.triggerNodeReceiveRipple,
      );
      state.updateNodeActive(event.actorId, true);
    },
    [],
  );

  // ---- transition helpers ----

  const startTransition2r = useCallback(() => {
    setAct("transition2r");
    const duration = 1000;
    transitionRemainingRef.current = duration;
    transitionStartRef.current = Date.now();
    transitionTimerRef.current = setTimeout(() => {
      transitionTimerRef.current = null;
      setAct("resolution");
      isRunningRef.current = false;

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
      completeCinematic();
      setProgress((p) => ({ ...p, act: "resolution", bothComplete: true, fraction: 1 }));
    }, duration);
  }, [setAct, setDualRunPhase, completeCinematic]);

  // ---- Accumulate timer chain ----

  const advanceAccumulate = useCallback(() => {
    if (!isRunningRef.current || !accRunRef.current || isPausedRef.current) return;

    const run = accRunRef.current;
    const nextIndex = accIndexRef.current + 1;

    if (nextIndex >= run.events.length) {
      // Accumulate complete
      accIndexRef.current = run.events.length - 1;
      setProgress((p) => {
        const next = {
          ...p,
          accIndex: run.events.length - 1,
          accComplete: true,
        };
        next.fraction = computeFraction(next.todayIndex, next.todayTotal, next.accIndex, next.accTotal);
        return next;
      });
      // Start transition to resolution
      startTransition2r();
      return;
    }

    applyEvent(accStoreApi, run, nextIndex);
    accIndexRef.current = nextIndex;

    setProgress((p) => {
      const next = { ...p, accIndex: nextIndex };
      next.fraction = computeFraction(next.todayIndex, next.todayTotal, next.accIndex, next.accTotal);
      return next;
    });

    const evt = run.events[nextIndex];
    const isApprovalReq = evt?.type === SimulationEventType.APPROVAL_REQUESTED;
    const currentSpeed = useSimulationStore.getState().speed;
    const baseDelay =
      currentSpeed === PlaybackSpeed.Instant
        ? 50
        : SIMULATION_BASE_DELAY_MS / (currentSpeed || 1);
    const dwellExtra = isApprovalReq && currentSpeed !== PlaybackSpeed.Instant ? 800 / (currentSpeed || 1) : 0;

    accTimerRef.current = setTimeout(advanceAccumulate, baseDelay + dwellExtra);
  }, [accStoreApi, applyEvent, computeFraction, startTransition2r]);

  // ---- Transition 1→2 ----

  const startTransition12 = useCallback(() => {
    setAct("transition12");
    const duration = 2500; // longer pause for Act 1 summary interstitial
    transitionRemainingRef.current = duration;
    transitionStartRef.current = Date.now();
    transitionTimerRef.current = setTimeout(() => {
      transitionTimerRef.current = null;
      // Provisioning phase: install Accumulate identities on all nodes
      setAct("provisioning");
      if (activeScenario) {
        accStoreApi.getState().provisionIdentities(activeScenario, policies);
      }
      // Dwell on provisioning state, then start Act 2
      transitionTimerRef.current = setTimeout(() => {
        transitionTimerRef.current = null;
        setAct("act2");
        // Start accumulate timer chain
        accTimerRef.current = setTimeout(advanceAccumulate, 300);
      }, 1500);
    }, duration);
  }, [setAct, advanceAccumulate, activeScenario, policies, accStoreApi]);

  // ---- Today timer chain ----

  const advanceToday = useCallback(() => {
    if (!isRunningRef.current || !todayRunRef.current || isPausedRef.current) return;

    const run = todayRunRef.current;
    const nextIndex = todayIndexRef.current + 1;

    if (nextIndex >= run.events.length) {
      // Today complete — collect friction descriptions then transition
      todayIndexRef.current = run.events.length - 1;

      // Collect friction descriptions for Act 2 cross-references
      const frictionDescs: string[] = [];
      for (const evt of run.events) {
        if (
          evt.type === SimulationEventType.MANUAL_STEP ||
          evt.type === SimulationEventType.WAITING
        ) {
          frictionDescs.push(evt.description);
        }
      }
      frictionDescsRef.current = frictionDescs;

      setProgress((p) => {
        const next = {
          ...p,
          todayIndex: run.events.length - 1,
          todayComplete: true,
          todayFrictionDescriptions: frictionDescs,
        };
        next.fraction = computeFraction(next.todayIndex, next.todayTotal, next.accIndex, next.accTotal);
        return next;
      });

      // Start transition to Act 2
      startTransition12();
      return;
    }

    applyEvent(todayStoreApi, run, nextIndex);
    todayIndexRef.current = nextIndex;

    const evt = run.events[nextIndex];
    const isManual =
      evt?.type === SimulationEventType.MANUAL_STEP ||
      evt?.type === SimulationEventType.WAITING;

    setProgress((p) => {
      const next = {
        ...p,
        todayIndex: nextIndex,
        todayManualSteps: isManual ? p.todayManualSteps + 1 : p.todayManualSteps,
      };
      next.fraction = computeFraction(next.todayIndex, next.todayTotal, next.accIndex, next.accTotal);
      return next;
    });

    // Today runs slower (1.8x base delay) — friction events get an extra dwell
    const currentSpeed = useSimulationStore.getState().speed;
    const baseDelay =
      currentSpeed === PlaybackSpeed.Instant
        ? 80
        : (SIMULATION_BASE_DELAY_MS * 1.8) / (currentSpeed || 1);
    const dwellExtra = isManual && currentSpeed !== PlaybackSpeed.Instant ? 2000 / (currentSpeed || 1) : 0;

    todayTimerRef.current = setTimeout(advanceToday, baseDelay + dwellExtra);
  }, [todayStoreApi, applyEvent, computeFraction, startTransition12]);

  // ---- Public API ----

  const loadPreview = useCallback(() => {
    if (!activeScenario) return;
    const todayStore = todayStoreApi.getState();
    const accStore = accStoreApi.getState();
    todayStore.loadScenarioForRun(activeScenario, null);
    accStore.loadScenarioForRun(activeScenario, null);
    setAct("prerun");
  }, [activeScenario, todayStoreApi, accStoreApi, setAct]);

  const startCinematic = useCallback(() => {
    if (!activeScenario) return;

    // Reset
    clearTimers();
    isRunningRef.current = false;
    isPausedRef.current = false;
    todayIndexRef.current = -1;
    accIndexRef.current = -1;
    frictionDescsRef.current = [];

    useSimulationStore.getState().resetDualRun();

    // Load scenario into both stores (today = no pills, accumulate = no pills initially — provisioned later)
    const todayStore = todayStoreApi.getState();
    const accStore = accStoreApi.getState();
    todayStore.loadScenarioForRun(activeScenario, null);
    accStore.loadScenarioForRun(activeScenario, null);

    // Build assembled scenario
    const { nodes: canvasNodes, edges: canvasEdges } = todayStoreApi.getState();
    const actorList = canvasNodes.map((n) => n.data.actor);
    const scenarioEdges = canvasEdges.map((e) => ({
      sourceId: e.source,
      targetId: e.target,
      type: (e.data?.type ?? "authority") as "authority" | "delegation",
    }));

    let initiatorRoleId = activeScenario.defaultWorkflow.initiatorRoleId;
    if (!initiatorRoleId && actorList.length > 0) {
      const roleNode = actorList.find((a) => a.type === "role");
      initiatorRoleId = roleNode?.id ?? actorList[0]!.id;
    }

    const assembledScenario: ScenarioTemplate = {
      ...activeScenario,
      actors: actorList,
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
      friction,
    );
    todayRun.id = `run-today-${activeScenario.id}-${seed}`;

    const accRun = runSimulation(assembledScenario, policies, seed);
    accRun.id = `run-accumulate-${activeScenario.id}-${seed}`;

    todayRunRef.current = todayRun;
    accRunRef.current = accRun;
    actorsRef.current = actorList;

    setTodayEvents(todayRun.events);
    setAccEvents(accRun.events);
    setActors(actorList);

    setProgress({
      act: "act1",
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
      todayFrictionDescriptions: [],
    });

    // Build evidence async (non-blocking)
    buildEvidenceBundle(
      todayRun,
      assembledScenario,
      todayPolicies.length > 0 ? todayPolicies : policies,
    ).then((todayEvidence) => {
      useSimulationStore.setState({ todayEvidence });
    });
    buildEvidenceBundle(accRun, assembledScenario, policies).then((accEvidence) => {
      useSimulationStore.setState({ accumulateEvidence: accEvidence, evidence: accEvidence });
    });

    // Set phase & start Act 1 ONLY — default to slower speed for first viewing
    setDualRunPhase("split-running");
    useSimulationStore.setState({
      activeMode: "today",
      status: SimulationStatus.Running,
      todayRun: null,
      accumulateRun: null,
      speed: 0.6 as PlaybackSpeed,
    });
    isRunningRef.current = true;
    actRef.current = "act1";

    todayTimerRef.current = setTimeout(advanceToday, 300);
  }, [
    activeScenario,
    policies,
    todayPolicies,
    todayStoreApi,
    accStoreApi,
    clearTimers,
    setDualRunPhase,
    advanceToday,
  ]);

  const skipToResults = useCallback(() => {
    if (!todayRunRef.current || !accRunRef.current) return;

    clearTimers();

    // Apply all events for Today
    const todayRun = todayRunRef.current;
    const todayState = todayStoreApi.getState();
    todayState.resetSimStates();
    const todayEdges = todayStoreApi.getState().edges;
    const frictionDescs: string[] = [];
    for (let i = 0; i < todayRun.events.length; i++) {
      const event = todayRun.events[i]!;
      applyEventToCanvas(
        event,
        todayEdges,
        todayState.updateNodeSimStatus,
        todayState.updateEdgeAnimation,
        todayState.updateNodeFrictionDescription,
      );
      if (
        event.type === SimulationEventType.MANUAL_STEP ||
        event.type === SimulationEventType.WAITING
      ) {
        frictionDescs.push(event.description);
      }
    }

    // Provision identities on accumulate canvas before applying events
    if (activeScenario) {
      accStoreApi.getState().provisionIdentities(activeScenario, policies);
    }

    // Apply all events for Accumulate
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
        accState.updateNodeFrictionDescription,
      );
    }

    const manualSteps = todayRun.events.filter(
      (e) =>
        e.type === SimulationEventType.MANUAL_STEP ||
        e.type === SimulationEventType.WAITING,
    ).length;

    todayIndexRef.current = todayRun.events.length - 1;
    accIndexRef.current = accRun.events.length - 1;
    frictionDescsRef.current = frictionDescs;
    isRunningRef.current = false;
    actRef.current = "resolution";

    setProgress({
      act: "resolution",
      todayIndex: todayRun.events.length - 1,
      todayTotal: todayRun.events.length,
      accIndex: accRun.events.length - 1,
      accTotal: accRun.events.length,
      todayComplete: true,
      accComplete: true,
      bothComplete: true,
      todayManualSteps: manualSteps,
      fraction: 1,
      isPaused: false,
      todayFrictionDescriptions: frictionDescs,
    });

    // Store runs
    useSimulationStore.setState({
      todayRun,
      accumulateRun: accRun,
      run: accRun,
      status: SimulationStatus.Completed,
      activeMode: "accumulate",
    });
    setDualRunPhase("accumulate-done");
    completeCinematic();
  }, [todayStoreApi, accStoreApi, clearTimers, setDualRunPhase, completeCinematic, activeScenario, policies]);

  // ---- Pause / Resume ----

  const pause = useCallback(() => {
    isPausedRef.current = true;

    // If we're in a transition or provisioning, track remaining time
    if (
      transitionTimerRef.current &&
      (actRef.current === "transition12" || actRef.current === "transition2r" || actRef.current === "provisioning")
    ) {
      const elapsed = Date.now() - transitionStartRef.current;
      transitionRemainingRef.current = Math.max(0, transitionRemainingRef.current - elapsed);
    }

    clearTimers();
    setProgress((p) => ({ ...p, isPaused: true }));
  }, [clearTimers]);

  const resume = useCallback(() => {
    if (!isRunningRef.current || progress.bothComplete) return;

    isPausedRef.current = false;
    setProgress((p) => ({ ...p, isPaused: false }));

    const act = actRef.current;

    // If paused during a transition, resume the remaining transition time
    if (act === "transition12") {
      const remaining = transitionRemainingRef.current;
      transitionStartRef.current = Date.now();
      transitionTimerRef.current = setTimeout(() => {
        transitionTimerRef.current = null;
        setAct("provisioning");
        if (activeScenario) {
          accStoreApi.getState().provisionIdentities(activeScenario, policies);
        }
        transitionTimerRef.current = setTimeout(() => {
          transitionTimerRef.current = null;
          setAct("act2");
          accTimerRef.current = setTimeout(advanceAccumulate, 300);
        }, 1500);
      }, remaining);
      return;
    }

    if (act === "provisioning") {
      // Resume from provisioning — just finish the dwell and start Act 2
      transitionTimerRef.current = setTimeout(() => {
        transitionTimerRef.current = null;
        setAct("act2");
        accTimerRef.current = setTimeout(advanceAccumulate, 300);
      }, transitionRemainingRef.current);
      return;
    }

    if (act === "transition2r") {
      const remaining = transitionRemainingRef.current;
      transitionStartRef.current = Date.now();
      transitionTimerRef.current = setTimeout(() => {
        transitionTimerRef.current = null;
        setAct("resolution");
        isRunningRef.current = false;
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
        completeCinematic();
        setProgress((p) => ({ ...p, act: "resolution", bothComplete: true, fraction: 1 }));
      }, remaining);
      return;
    }

    // Resume normal playback
    const currentSpeed = useSimulationStore.getState().speed;

    if (act === "act1" && !progress.todayComplete && todayRunRef.current) {
      const delay =
        currentSpeed === PlaybackSpeed.Instant
          ? 80
          : (SIMULATION_BASE_DELAY_MS * 1.8) / (currentSpeed || 1);
      todayTimerRef.current = setTimeout(advanceToday, delay);
    }

    if (act === "act2" && !progress.accComplete && accRunRef.current) {
      const delay =
        currentSpeed === PlaybackSpeed.Instant
          ? 50
          : SIMULATION_BASE_DELAY_MS / (currentSpeed || 1);
      accTimerRef.current = setTimeout(advanceAccumulate, delay);
    }
  }, [
    progress.bothComplete,
    progress.todayComplete,
    progress.accComplete,
    advanceToday,
    advanceAccumulate,
    setAct,
    setDualRunPhase,
    completeCinematic,
    activeScenario,
    policies,
    accStoreApi,
  ]);

  // ---- Seek ----

  const seekTo = useCallback(
    (fraction: number) => {
      const todayRun = todayRunRef.current;
      const accRun = accRunRef.current;
      if (!todayRun || !accRun) return;

      clearTimers();

      const totalEvents = todayRun.events.length + accRun.events.length;
      if (totalEvents === 0) return;

      const absoluteIndex = Math.round(fraction * (totalEvents - 1));

      let todayTarget: number;
      let accTarget: number;
      let newAct: CinematicAct;

      if (absoluteIndex < todayRun.events.length) {
        // In Act 1 range
        todayTarget = absoluteIndex;
        accTarget = -1;
        newAct = todayTarget >= todayRun.events.length - 1 ? "transition12" : "act1";
      } else {
        // In Act 2 range
        todayTarget = todayRun.events.length - 1;
        accTarget = absoluteIndex - todayRun.events.length;
        if (accTarget >= accRun.events.length - 1) {
          accTarget = accRun.events.length - 1;
          newAct = "resolution";
        } else {
          newAct = "act2";
        }
      }

      // Reset and replay Today
      const todayState = todayStoreApi.getState();
      todayState.resetSimStates();
      const todayEdges = todayStoreApi.getState().edges;
      let todayManualSteps = 0;
      const frictionDescs: string[] = [];
      for (let i = 0; i <= todayTarget && i < todayRun.events.length; i++) {
        const event = todayRun.events[i]!;
        applyEventToCanvas(
          event,
          todayEdges,
          todayState.updateNodeSimStatus,
          todayState.updateEdgeAnimation,
          todayState.updateNodeFrictionDescription,
        );
        if (
          event.type === SimulationEventType.MANUAL_STEP ||
          event.type === SimulationEventType.WAITING
        ) {
          todayManualSteps++;
          frictionDescs.push(event.description);
        }
      }

      // Provision identities on accumulate canvas before replaying
      if (activeScenario) {
        accStoreApi.getState().provisionIdentities(activeScenario, policies);
      }

      // Reset and replay Accumulate
      const accState = accStoreApi.getState();
      accState.resetSimStates();
      if (accTarget >= 0) {
        const accEdges = accStoreApi.getState().edges;
        for (let i = 0; i <= accTarget && i < accRun.events.length; i++) {
          const event = accRun.events[i]!;
          applyEventToCanvas(
            event,
            accEdges,
            accState.updateNodeSimStatus,
            accState.updateEdgeAnimation,
            accState.updateNodeFrictionDescription,
          );
        }
      }

      todayIndexRef.current = todayTarget;
      accIndexRef.current = accTarget;
      frictionDescsRef.current = frictionDescs;
      actRef.current = newAct;

      const todayComplete = todayTarget >= todayRun.events.length - 1;
      const accComplete = accTarget >= accRun.events.length - 1;
      const bothComplete = todayComplete && accComplete;

      setProgress({
        act: newAct,
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
        todayFrictionDescriptions: frictionDescs,
      });

      if (bothComplete) {
        isRunningRef.current = false;
        // Store runs
        useSimulationStore.setState({
          todayRun,
          accumulateRun: accRun,
          run: accRun,
          status: SimulationStatus.Completed,
          activeMode: "accumulate",
        });
        setDualRunPhase("accumulate-done");
        completeCinematic();
      } else if (!isPausedRef.current && isRunningRef.current) {
        // Restart the appropriate timer chain
        const currentSpeed = useSimulationStore.getState().speed;

        if (newAct === "act1" && !todayComplete) {
          const delay =
            currentSpeed === PlaybackSpeed.Instant
              ? 80
              : (SIMULATION_BASE_DELAY_MS * 1.8) / (currentSpeed || 1);
          todayTimerRef.current = setTimeout(advanceToday, delay);
        } else if (newAct === "act2" && !accComplete) {
          const delay =
            currentSpeed === PlaybackSpeed.Instant
              ? 50
              : SIMULATION_BASE_DELAY_MS / (currentSpeed || 1);
          accTimerRef.current = setTimeout(advanceAccumulate, delay);
        }
      }
    },
    [
      todayStoreApi,
      accStoreApi,
      clearTimers,
      computeFraction,
      advanceToday,
      advanceAccumulate,
      setDualRunPhase,
      completeCinematic,
      activeScenario,
      policies,
    ],
  );

  // ---- Reset (return to prerun with org chart visible) ----

  const resetCinematic = useCallback(() => {
    clearTimers();
    isRunningRef.current = false;
    isPausedRef.current = false;
    todayIndexRef.current = -1;
    accIndexRef.current = -1;
    todayRunRef.current = null;
    accRunRef.current = null;
    frictionDescsRef.current = [];
    actRef.current = "idle";

    setTodayEvents([]);
    setAccEvents([]);
    setActors([]);

    // Reset both canvas stores
    todayStoreApi.getState().resetSimStates();
    accStoreApi.getState().resetSimStates();

    setProgress({
      act: "idle",
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
      todayFrictionDescriptions: [],
    });

    // Reload the org chart preview (acc canvas without pills — provisioned during cinematic)
    if (activeScenario) {
      todayStoreApi.getState().loadScenarioForRun(activeScenario, null);
      accStoreApi.getState().loadScenarioForRun(activeScenario, null);
      setAct("prerun");
    }
  }, [clearTimers, todayStoreApi, accStoreApi, activeScenario, setAct]);

  // ---- Cleanup ----

  useEffect(() => {
    return () => {
      clearTimers();
      isRunningRef.current = false;
    };
  }, [clearTimers]);

  return {
    loadPreview,
    startCinematic,
    progress,
    skipToResults,
    todayEvents,
    accEvents,
    actors,
    pause,
    resume,
    seekTo,
    resetCinematic,
  };
}
