import { z } from "zod";
import { SimulationEventType } from "@/types/simulation";

export const AuditLogEntrySchema = z.object({
  index: z.number().int().min(0),
  timestamp: z.number().min(0),
  eventType: z.nativeEnum(SimulationEventType),
  actor: z.string().min(1),
  action: z.string().min(1),
  policyRef: z.string().optional(),
  result: z.enum(["success", "failure", "pending"]),
});

export const TimelineEntrySchema = z.object({
  timestamp: z.number().min(0),
  label: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["completed", "active", "pending", "failed"]),
});

export const SimulatedSignatureSchema = z.object({
  roleId: z.string().min(1),
  roleName: z.string().min(1),
  signatureHash: z.string().min(1),
  timestamp: z.number().min(0),
});

export const MerkleReceiptSchema = z.object({
  rootHash: z.string().min(1),
  leafHash: z.string().min(1),
  path: z.array(
    z.object({
      hash: z.string().min(1),
      position: z.enum(["left", "right"]),
    })
  ),
});

export const ProofArtifactSchema = z.object({
  version: z.literal("1.0"),
  scenarioId: z.string().min(1),
  runId: z.string().min(1),
  canonicalJson: z.string().min(1),
  hash: z.string().length(64),
  signatures: z.array(SimulatedSignatureSchema),
  merkleReceipt: MerkleReceiptSchema,
  generatedAt: z.string().min(1),
});

export const VerificationQuerySchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  evidence: z.array(z.string()),
});

export const BeforeAfterComparisonSchema = z.object({
  metric: z.string().min(1),
  before: z.union([z.string(), z.number()]),
  after: z.union([z.string(), z.number()]),
  improvement: z.string().min(1),
});

export const EvidenceBundleSchema = z.object({
  auditLog: z.array(AuditLogEntrySchema),
  timeline: z.array(TimelineEntrySchema),
  proofArtifact: ProofArtifactSchema,
  verification: z.array(VerificationQuerySchema),
  beforeAfter: z.array(BeforeAfterComparisonSchema),
});
