import { z } from "zod";

export const ThresholdPolicySchema = z.object({
  k: z.number().int().min(1),
  n: z.number().int().min(1),
  approverRoleIds: z.array(z.string().min(1)).min(1),
});

export const EscalationRuleSchema = z.object({
  afterSeconds: z.number().min(0),
  toRoleIds: z.array(z.string().min(1)).min(1),
});

export const PolicySchema = z.object({
  id: z.string().min(1),
  actorId: z.string().min(1),
  threshold: ThresholdPolicySchema,
  expirySeconds: z.number().min(0),
  delegationAllowed: z.boolean(),
  delegateToRoleId: z.string().optional(),
  escalation: EscalationRuleSchema.optional(),
  constraints: z
    .object({
      amountMax: z.number().optional(),
      environment: z.enum(["production", "non-production", "sap-enclave", "any"]).optional(),
    })
    .optional(),
});
