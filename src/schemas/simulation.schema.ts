import { z } from "zod";
import { SimulationEventType } from "@/types/simulation";

export const SimulationEventSchema = z.object({
  id: z.string().min(1),
  type: z.nativeEnum(SimulationEventType),
  timestamp: z.number().min(0),
  actorId: z.string().min(1),
  targetActorId: z.string().optional(),
  policyId: z.string().optional(),
  description: z.string().min(1),
  metadata: z.record(z.unknown()),
});

export const SimulationStateSchema = z.object({
  currentEventIndex: z.number().int().min(0),
  approvals: z.record(
    z.object({
      approved: z.boolean(),
      actorId: z.string(),
      timestamp: z.number(),
    })
  ),
  delegations: z.array(
    z.object({
      fromId: z.string(),
      toId: z.string(),
      timestamp: z.number(),
    })
  ),
  escalations: z.array(
    z.object({
      policyId: z.string(),
      toRoleIds: z.array(z.string()),
      timestamp: z.number(),
    })
  ),
  isFinalized: z.boolean(),
  outcome: z.enum(["approved", "denied", "pending"]),
});

export const SimulationRunSchema = z.object({
  id: z.string().min(1),
  scenarioId: z.string().min(1),
  seed: z.number(),
  events: z.array(SimulationEventSchema).min(1),
  states: z.array(SimulationStateSchema).min(1),
  startedAt: z.number(),
  completedAt: z.number().optional(),
  outcome: z.enum(["approved", "denied"]),
});
