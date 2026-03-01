export enum SimulationEventType {
  REQUEST_CREATED = "REQUEST_CREATED",
  APPROVAL_REQUESTED = "APPROVAL_REQUESTED",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
  DELEGATED = "DELEGATED",
  ESCALATED = "ESCALATED",
  EXPIRED = "EXPIRED",
  FINALIZED = "FINALIZED",
  MANUAL_STEP = "MANUAL_STEP",
  WAITING = "WAITING",
}

export enum SimulationStatus {
  Idle = "idle",
  Running = "running",
  Paused = "paused",
  Completed = "completed",
  Failed = "failed",
}

export enum PlaybackSpeed {
  Slow = 0.5,
  Normal = 1,
  Fast = 2,
  Instant = 0,
}

export interface SimulationEvent {
  id: string;
  type: SimulationEventType;
  timestamp: number;
  actorId: string;
  targetActorId?: string;
  policyId?: string;
  description: string;
  metadata: Record<string, unknown>;
}

export interface SimulationState {
  currentEventIndex: number;
  approvals: Record<string, { approved: boolean; actorId: string; timestamp: number }>;
  delegations: { fromId: string; toId: string; timestamp: number }[];
  escalations: { policyId: string; toRoleIds: string[]; timestamp: number }[];
  isFinalized: boolean;
  outcome: "approved" | "denied" | "pending";
}

export interface SimulationRun {
  id: string;
  scenarioId: string;
  seed: number;
  events: SimulationEvent[];
  states: SimulationState[];
  startedAt: number;
  completedAt?: number;
  outcome: "approved" | "denied";
}
