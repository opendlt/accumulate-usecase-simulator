import { create } from "zustand";
import { SimulationStatus, PlaybackSpeed } from "@/types/simulation";
import type { SimulationRun } from "@/types/simulation";
import type { EvidenceBundle } from "@/types/evidence";

interface SimulationStore {
  run: SimulationRun | null;
  evidence: EvidenceBundle | null;
  status: SimulationStatus;
  currentEventIndex: number;
  speed: PlaybackSpeed;
  useRandomSeed: boolean;

  // Dual-run slots
  activeMode: "today" | "accumulate";
  todayRun: SimulationRun | null;
  todayEvidence: EvidenceBundle | null;
  accumulateRun: SimulationRun | null;
  accumulateEvidence: EvidenceBundle | null;

  setRun: (run: SimulationRun) => void;
  setEvidence: (evidence: EvidenceBundle) => void;
  setStatus: (status: SimulationStatus) => void;
  setCurrentEventIndex: (index: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  toggleRandomSeed: () => void;
  resetSimulation: () => void;

  // Dual-run actions
  commitRunToSlot: () => void;
  switchToMode: (mode: "today" | "accumulate") => void;
  resetDualRun: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  run: null,
  evidence: null,
  status: SimulationStatus.Idle,
  currentEventIndex: -1,
  speed: PlaybackSpeed.Normal,
  useRandomSeed: false,

  activeMode: "today",
  todayRun: null,
  todayEvidence: null,
  accumulateRun: null,
  accumulateEvidence: null,

  setRun: (run) => set({ run }),
  setEvidence: (evidence) => set({ evidence }),
  setStatus: (status) => set({ status }),
  setCurrentEventIndex: (index) => set({ currentEventIndex: index }),

  stepForward: () => {
    const { run, currentEventIndex } = get();
    if (run && currentEventIndex < run.events.length - 1) {
      set({ currentEventIndex: currentEventIndex + 1 });
    }
  },

  stepBackward: () => {
    const { currentEventIndex } = get();
    if (currentEventIndex > 0) {
      set({ currentEventIndex: currentEventIndex - 1 });
    }
  },

  setSpeed: (speed) => set({ speed }),

  toggleRandomSeed: () => set((s) => ({ useRandomSeed: !s.useRandomSeed })),

  resetSimulation: () =>
    set({
      run: null,
      evidence: null,
      status: SimulationStatus.Idle,
      currentEventIndex: -1,
    }),

  commitRunToSlot: () => {
    const { activeMode, run, evidence } = get();
    if (activeMode === "today") {
      set({ todayRun: run, todayEvidence: evidence });
    } else {
      set({ accumulateRun: run, accumulateEvidence: evidence });
    }
  },

  switchToMode: (mode) => {
    const state = get();
    const targetRun = mode === "today" ? state.todayRun : state.accumulateRun;
    const targetEvidence = mode === "today" ? state.todayEvidence : state.accumulateEvidence;
    set({
      activeMode: mode,
      run: targetRun,
      evidence: targetEvidence,
      currentEventIndex: targetRun ? targetRun.events.length - 1 : -1,
      status: targetRun ? SimulationStatus.Completed : SimulationStatus.Idle,
    });
  },

  resetDualRun: () =>
    set({
      run: null,
      evidence: null,
      status: SimulationStatus.Idle,
      currentEventIndex: -1,
      activeMode: "today",
      todayRun: null,
      todayEvidence: null,
      accumulateRun: null,
      accumulateEvidence: null,
    }),
}));
