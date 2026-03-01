import type { Node, Edge } from "@xyflow/react";
import type { Actor } from "./organization";
import type { Policy } from "./policy";

export type SimulationNodeStatus =
  | "idle"
  | "requesting"
  | "approving"
  | "approved"
  | "denied"
  | "delegating"
  | "escalating"
  | "expired"
  | "waiting"
  | "manual-step";

export type PolicyRole = "owner" | "approver" | "delegate" | "escalation";

export interface AccumulateIdentityHint {
  pills: string[];
}

export interface SimNodeData {
  actor: Actor;
  policy?: Policy;
  policyRole?: PolicyRole;
  accumulateIdentity?: AccumulateIdentityHint;
  simulationStatus: SimulationNodeStatus;
  isHighlighted: boolean;
  isActive: boolean;
  frictionDescription?: string;
  receiveRipple?: number;
  [key: string]: unknown;
}

export interface SimEdgeData {
  type: "authority" | "delegation";
  isAnimating: boolean;
  flowDirection?: "forward" | "reverse";
  flowLabel?: string;
  flowColor?: string;
  [key: string]: unknown;
}

export type SimNode = Node<SimNodeData>;
export type SimEdge = Edge<SimEdgeData>;
