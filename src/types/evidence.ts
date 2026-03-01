import type { SimulationEventType } from "./simulation";

export interface AuditLogEntry {
  index: number;
  timestamp: number;
  eventType: SimulationEventType;
  actor: string;
  action: string;
  policyRef?: string;
  result: "success" | "failure" | "pending";
}

export interface TimelineEntry {
  timestamp: number;
  label: string;
  description: string;
  status: "completed" | "active" | "pending" | "failed";
}

export interface SimulatedSignature {
  roleId: string;
  roleName: string;
  signatureHash: string;
  timestamp: number;
}

export interface MerkleReceipt {
  rootHash: string;
  leafHash: string;
  path: { hash: string; position: "left" | "right" }[];
}

export interface ProofArtifact {
  version: "1.0";
  scenarioId: string;
  runId: string;
  canonicalJson: string;
  hash: string;
  signatures: SimulatedSignature[];
  merkleReceipt: MerkleReceipt;
  generatedAt: string;
}

export interface VerificationQuery {
  question: string;
  answer: string;
  evidence: string[];
}

export interface BeforeAfterComparison {
  metric: string;
  before: string | number;
  after: string | number;
  improvement: string;
}

export interface EvidenceBundle {
  auditLog: AuditLogEntry[];
  timeline: TimelineEntry[];
  proofArtifact: ProofArtifact;
  verification: VerificationQuery[];
  beforeAfter: BeforeAfterComparison[];
}
