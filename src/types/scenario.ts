import type { Actor } from "./organization";
import type { Policy } from "./policy";
import type { IndustryId } from "./industry";
import type { FrictionProfile } from "./friction";
import type { RegulatoryContext } from "./regulatory";

export interface WorkflowDefinition {
  name: string;
  initiatorRoleId: string;
  targetAction: string;
  description: string;
}

export interface ComparisonMetrics {
  manualTimeHours: number;
  riskExposureDays: number;
  auditGapCount: number;
  approvalSteps: number;
}

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  actors: Actor[];
  policies: Policy[];
  edges: { sourceId: string; targetId: string; type: "authority" | "delegation" }[];
  defaultWorkflow: WorkflowDefinition;
  beforeMetrics: ComparisonMetrics;
  industryId?: IndustryId;
  archetypeId?: string;
  prompt?: string;
  todayFriction?: FrictionProfile;
  todayPolicies?: Policy[];
  tags?: string[];
  regulatoryContext?: RegulatoryContext[];
  costPerHourDefault?: number;
}
