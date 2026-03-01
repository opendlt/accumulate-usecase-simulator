import { create } from "zustand";
import type { IndustryId } from "@/types/industry";

type MobilePanel = "canvas" | "policy" | "simulation" | "evidence";
export type ScreenId = "hero" | "industry-picker" | "scenario-selector" | "simulation" | "evidence" | "sandbox" | "org-builder";
export type DualRunPhase = "idle" | "today-running" | "today-done" | "accumulate-running" | "accumulate-done" | "split-running";

interface UIStore {
  theme: "dark" | "light";
  screen: ScreenId;
  selectedIndustry: IndustryId | null;
  dualRunPhase: DualRunPhase;
  hasCompletedRun: boolean;
  advancedMode: boolean;
  showCtaBar: boolean;
  showHelpDrawer: boolean;
  guidedTourStep: number;
  guidedTourActive: boolean;
  evidenceTab: number;
  activeMobilePanel: MobilePanel;
  cinematicActive: boolean;
  showPilotInterestModal: boolean;
  pilotInterestSubmitted: boolean;
  showShareResultsModal: boolean;

  // Backward compat
  showLandingOverlay: boolean;

  navigateTo: (screen: ScreenId) => void;
  selectIndustry: (id: IndustryId) => void;
  setDualRunPhase: (phase: DualRunPhase) => void;
  markRunCompleted: () => void;
  completeCinematic: () => void;
  enterAdvancedMode: () => void;
  exitAdvancedMode: () => void;
  toggleTheme: () => void;
  setShowLandingOverlay: (show: boolean) => void;
  setShowHelpDrawer: (show: boolean) => void;
  setGuidedTourStep: (step: number) => void;
  setGuidedTourActive: (active: boolean) => void;
  setEvidenceTab: (tab: number) => void;
  setActiveMobilePanel: (panel: MobilePanel) => void;
  setCinematicActive: (active: boolean) => void;
  setShowPilotInterestModal: (show: boolean) => void;
  setPilotInterestSubmitted: (submitted: boolean) => void;
  setShowShareResultsModal: (show: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: "dark",
  screen: "hero",
  selectedIndustry: null,
  dualRunPhase: "idle",
  hasCompletedRun: false,
  advancedMode: false,
  showCtaBar: false,
  showHelpDrawer: false,
  guidedTourStep: 0,
  guidedTourActive: false,
  evidenceTab: 0,
  activeMobilePanel: "canvas",
  cinematicActive: false,
  showPilotInterestModal: false,
  pilotInterestSubmitted: !!localStorage.getItem("aas-pilot-submitted"),
  showShareResultsModal: false,

  // Backward compat computed
  get showLandingOverlay() {
    return true; // overridden below
  },

  navigateTo: (screen) => set({ screen }),

  selectIndustry: (id) => set({ selectedIndustry: id }),

  setDualRunPhase: (phase) => set({ dualRunPhase: phase }),

  markRunCompleted: () => set({ hasCompletedRun: true, showCtaBar: true }),

  completeCinematic: () =>
    set({ hasCompletedRun: true, showCtaBar: true, cinematicActive: false }),

  enterAdvancedMode: () => set({ advancedMode: true, screen: "sandbox" }),

  exitAdvancedMode: () => set({ advancedMode: false, screen: "hero" }),

  toggleTheme: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      if (next === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
      return { theme: next };
    }),

  // Backward compat: setShowLandingOverlay(false) → navigateTo("simulation")
  setShowLandingOverlay: (show) =>
    set(show ? { screen: "hero" } : { screen: "simulation" }),

  setShowHelpDrawer: (show) => set({ showHelpDrawer: show }),
  setGuidedTourStep: (step) => set({ guidedTourStep: step }),
  setGuidedTourActive: (active) => set({ guidedTourActive: active }),
  setEvidenceTab: (tab) => set({ evidenceTab: tab }),
  setActiveMobilePanel: (panel) => set({ activeMobilePanel: panel }),
  setCinematicActive: (active) => set({ cinematicActive: active }),
  setShowPilotInterestModal: (show) => set({ showPilotInterestModal: show }),
  setPilotInterestSubmitted: (submitted) => set({ pilotInterestSubmitted: submitted }),
  setShowShareResultsModal: (show) => set({ showShareResultsModal: show }),
}));

// Override showLandingOverlay as a derived value via subscribe
// Components can use useUIStore(s => s.screen !== "simulation" && s.screen !== "evidence" && s.screen !== "sandbox")
// For backward compat, we keep showLandingOverlay in sync
useUIStore.subscribe((state) => {
  const shouldShow = state.screen !== "simulation" && state.screen !== "evidence" && state.screen !== "sandbox" && state.screen !== "org-builder";
  if (state.showLandingOverlay !== shouldShow) {
    useUIStore.setState({ showLandingOverlay: shouldShow });
  }
});
