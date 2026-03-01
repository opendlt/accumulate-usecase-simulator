import { z } from "zod";
import { ActorSchema } from "./organization.schema";
import { PolicySchema } from "./policy.schema";
import { FrictionProfileSchema } from "./friction.schema";

export const WorkflowDefinitionSchema = z.object({
  name: z.string().min(1),
  initiatorRoleId: z.string().min(1),
  targetAction: z.string().min(1),
  description: z.string().min(1),
});

export const ComparisonMetricsSchema = z.object({
  manualTimeHours: z.number().min(0),
  riskExposureDays: z.number().min(0),
  auditGapCount: z.number().int().min(0),
  approvalSteps: z.number().int().min(1),
});

export const ScenarioTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  actors: z.array(ActorSchema).min(1),
  policies: z.array(PolicySchema).min(1),
  edges: z.array(
    z.object({
      sourceId: z.string().min(1),
      targetId: z.string().min(1),
      type: z.enum(["authority", "delegation"]),
    })
  ),
  defaultWorkflow: WorkflowDefinitionSchema,
  beforeMetrics: ComparisonMetricsSchema,
  industryId: z.string().optional(),
  archetypeId: z.string().optional(),
  prompt: z.string().optional(),
  todayFriction: FrictionProfileSchema.optional(),
  todayPolicies: z.array(PolicySchema).optional(),
  tags: z.array(z.string()).optional(),
});
