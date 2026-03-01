import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";
import { REGULATORY_DB } from "@/lib/regulatory-data";

export const classifiedDelegationScenario: ScenarioTemplate = {
  id: "defense-authority-delegation",
  name: "Continuity of Authority During Surge Operations",
  description:
    "A Navy Reserve unit receives mobilization activation from higher authority (SecNav/SecDef under 10 USC 12301-12304). The Commanding Officer is traveling with limited NSIPS access, and the Executive Officer — who holds broad inherent authority under Navy Regulations and the unit's Standard Organization and Regulations Manual (SORM) — needs to process mobilization administrative actions: recall notifications, NSIPS/NROWS personnel readiness updates, and gaining command coordination. However, IT system permissions have not been updated to reflect the XO's standing authority, stalling administrative processing during a time-critical mobilization window.",
  icon: "ShieldCheck",
  industryId: "defense",
  archetypeId: "time-bound-authority",
  prompt:
    "What happens when the CO is traveling during mobilization activation and the XO needs to process recall notifications and NSIPS/NROWS updates but system permissions don't reflect the XO's inherent authority under Navy Regulations?",
  actors: [
    {
      id: "command-hq",
      type: NodeType.Organization,
      label: "Navy Reserve Unit",
      parentId: null,
      organizationId: "command-hq",
      color: "#22C55E",
    },
    {
      id: "senior-officer",
      type: NodeType.Role,
      label: "Commanding Officer",
      description: "CO traveling with limited NSIPS/NROWS access during mobilization activation — primary approval authority for personnel administrative actions under the unit's SORM",
      parentId: "command-hq",
      organizationId: "command-hq",
      color: "#94A3B8",
    },
    {
      id: "deputy-officer",
      type: NodeType.Role,
      label: "Executive Officer",
      description: "XO with broad inherent authority under Navy Regulations (OPNAVINST 3120.32/SORM) — IT system permissions not yet updated to reflect standing authority for mobilization administrative processing",
      parentId: "command-hq",
      organizationId: "command-hq",
      color: "#94A3B8",
    },
    {
      id: "operations",
      type: NodeType.Department,
      label: "Operations Department",
      description: "Coordinates mobilization recall execution, gaining command liaison, and operational readiness reporting",
      parentId: "command-hq",
      organizationId: "command-hq",
      color: "#06B6D4",
    },
    {
      id: "admin-dept",
      type: NodeType.Department,
      label: "Admin/Personnel",
      description: "Processes personnel readiness updates in NSIPS, reserve order writing in NROWS, and mobilization administrative records",
      parentId: "command-hq",
      organizationId: "command-hq",
      color: "#06B6D4",
    },
    {
      id: "admin-officer",
      type: NodeType.Role,
      label: "Admin Officer",
      description: "Initiates mobilization administrative actions — recall notifications, NSIPS/NROWS entries, personnel readiness updates — requires CO or XO authorization to execute in personnel systems",
      parentId: "admin-dept",
      organizationId: "command-hq",
      color: "#94A3B8",
    },
    {
      id: "rlso-attorney",
      type: NodeType.Role,
      label: "RLSO Attorney",
      description: "Region Legal Service Office attorney providing legal review of delegation authority scope and mobilization administrative compliance under SECNAVINST 5216.5 and Navy Regulations",
      parentId: "command-hq",
      organizationId: "command-hq",
      color: "#94A3B8",
    },
  ],
  policies: [
    {
      id: "policy-authority-delegation",
      actorId: "command-hq",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["senior-officer"],
      },
      expirySeconds: 45,
      delegationAllowed: true,
      delegateToRoleId: "deputy-officer",
    },
    {
      id: "policy-legal-review",
      actorId: "command-hq",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["rlso-attorney"],
      },
      expirySeconds: 60,
      delegationAllowed: false,
    },
  ],
  edges: [
    { sourceId: "command-hq", targetId: "senior-officer", type: "authority" },
    { sourceId: "command-hq", targetId: "deputy-officer", type: "authority" },
    { sourceId: "command-hq", targetId: "operations", type: "authority" },
    { sourceId: "command-hq", targetId: "admin-dept", type: "authority" },
    { sourceId: "command-hq", targetId: "rlso-attorney", type: "authority" },
    { sourceId: "admin-dept", targetId: "admin-officer", type: "authority" },
    { sourceId: "senior-officer", targetId: "deputy-officer", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "CO delegates mobilization administrative authority during surge",
    initiatorRoleId: "admin-officer",
    targetAction: "Process Mobilization Administrative Actions — Recall Notifications, NSIPS/NROWS Updates, and Gaining Command Coordination",
    description:
      "Admin Officer initiates mobilization administrative processing requiring CO authorization. CO pre-configures time-bound delegation to XO before traveling. XO receives formally documented system permissions matching inherent authority under Navy Regulations and SORM. RLSO Attorney validates delegation scope under SECNAVINST 5216.5. Authority expires automatically after the mobilization window.",
  },
  beforeMetrics: {
    manualTimeHours: 12,
    riskExposureDays: 7,
    auditGapCount: 3,
    approvalSteps: 4,
  },
  todayFriction: {
    ...ARCHETYPES["time-bound-authority"].defaultFriction,
    expiryOverride: 20,
    manualSteps: [
      { trigger: "after-request", description: "Admin Officer submits mobilization actions requiring CO authorization — CO traveling with limited NSIPS/NROWS access at transit point", delaySeconds: 8 },
      { trigger: "before-approval", description: "RLSO Attorney reviewing delegation authority scope and verifying XO's inherent authority under Navy Regulations and SORM covers the requested administrative actions", delaySeconds: 5 },
      { trigger: "on-unavailable", description: "CO unreachable — NSIPS/NROWS personnel readiness updates and recall notifications on hold, mobilization processing timeline slipping against activation order deadline", delaySeconds: 12 },
    ],
    narrativeTemplate: "NSIPS/NROWS routing with manual delegation letter verification and system permission gap during CO travel",
  },
  todayPolicies: [
    {
      id: "policy-authority-delegation-today",
      actorId: "command-hq",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["senior-officer"],
      },
      expirySeconds: 20,
      delegationAllowed: false,
    },
    {
      id: "policy-legal-review-today",
      actorId: "command-hq",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["rlso-attorney"],
      },
      expirySeconds: 20,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: REGULATORY_DB.defense,
  tags: ["defense", "mobilization", "delegation", "surge", "navy-reserve", "continuity-of-authority", "nsips", "nrows", "sorm", "navy-regulations", "secnavinst"],
};
