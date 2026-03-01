import { z } from "zod";

export const ManualFrictionStepSchema = z.object({
  trigger: z.enum(["before-approval", "after-request", "on-unavailable"]),
  description: z.string().min(1),
  delaySeconds: z.number().min(0),
});

export const FrictionProfileSchema = z.object({
  unavailabilityRate: z.number().min(0).max(1),
  approvalProbability: z.number().min(0).max(1),
  delayMultiplierMin: z.number().min(0),
  delayMultiplierMax: z.number().min(0),
  blockDelegation: z.boolean(),
  blockEscalation: z.boolean(),
  expiryOverride: z.number().optional(),
  manualSteps: z.array(ManualFrictionStepSchema),
  narrativeTemplate: z.string().min(1),
});
