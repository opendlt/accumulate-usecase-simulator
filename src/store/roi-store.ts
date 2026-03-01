import { create } from "zustand";
import type { UserROIInputs } from "@/types/roi";
import { INDUSTRY_DEFAULTS } from "@/types/roi";

const STORAGE_KEY = "aas-roi-inputs";

function loadFromStorage(): UserROIInputs | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as UserROIInputs;
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(inputs: UserROIInputs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    // ignore
  }
}

interface ROIStore {
  inputs: UserROIInputs | null;
  drawerOpen: boolean;

  setInputs: (inputs: UserROIInputs) => void;
  clearInputs: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  loadDefaults: (industryId: string) => void;
}

export const useROIStore = create<ROIStore>((set) => ({
  inputs: loadFromStorage(),
  drawerOpen: false,

  setInputs: (inputs) => {
    saveToStorage(inputs);
    set({ inputs });
  },

  clearInputs: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ inputs: null });
  },

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),

  loadDefaults: (industryId: string) => {
    const defaults = INDUSTRY_DEFAULTS[industryId];
    if (defaults) {
      const inputs: UserROIInputs = {
        monthlyWorkflows: defaults.monthlyWorkflows ?? 200,
        avgTimePerApprovalHours: defaults.avgTimePerApprovalHours ?? 4,
        avgHourlyCost: defaults.avgHourlyCost ?? 85,
        annualAuditFindings: defaults.annualAuditFindings ?? 10,
      };
      saveToStorage(inputs);
      set({ inputs });
    }
  },
}));
