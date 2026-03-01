import { create } from "zustand";
import type { ScenarioTemplate } from "@/types/scenario";
import type { Policy } from "@/types/policy";
import type { Industry } from "@/types/industry";

interface ScenarioStore {
  activeScenario: ScenarioTemplate | null;
  policies: Policy[];
  activeIndustry: Industry | null;
  todayPolicies: Policy[];

  setActiveScenario: (scenario: ScenarioTemplate | null) => void;
  setPolicies: (policies: Policy[]) => void;
  updatePolicy: (policyId: string, updates: Partial<Policy>) => void;
  addPolicy: (policy: Policy) => void;
  setActiveIndustry: (industry: Industry | null) => void;
  loadScenarioForDualRun: (scenario: ScenarioTemplate) => void;
}

export const useScenarioStore = create<ScenarioStore>((set) => ({
  activeScenario: null,
  policies: [],
  activeIndustry: null,
  todayPolicies: [],

  setActiveScenario: (scenario) =>
    set({
      activeScenario: scenario,
      policies: scenario?.policies ?? [],
    }),

  setPolicies: (policies) => set({ policies }),

  updatePolicy: (policyId, updates) =>
    set((state) => ({
      policies: state.policies.map((p) =>
        p.id === policyId ? { ...p, ...updates } : p
      ),
    })),

  addPolicy: (policy) =>
    set((state) => ({ policies: [...state.policies, policy] })),

  setActiveIndustry: (industry) => set({ activeIndustry: industry }),

  loadScenarioForDualRun: (scenario) =>
    set({
      activeScenario: scenario,
      policies: scenario.policies,
      todayPolicies: scenario.todayPolicies ?? scenario.policies,
    }),
}));
