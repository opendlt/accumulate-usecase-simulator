export interface FrictionProfile {
  unavailabilityRate: number;
  approvalProbability: number;
  delayMultiplierMin: number;
  delayMultiplierMax: number;
  blockDelegation: boolean;
  blockEscalation: boolean;
  expiryOverride?: number;
  manualSteps: ManualFrictionStep[];
  narrativeTemplate: string;
}

export interface ManualFrictionStep {
  trigger: "before-approval" | "after-request" | "on-unavailable";
  description: string;
  delaySeconds: number;
}
