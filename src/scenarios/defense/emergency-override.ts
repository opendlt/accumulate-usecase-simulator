import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";
import { REGULATORY_DB } from "@/lib/regulatory-data";

export const emergencyOverrideScenario: ScenarioTemplate = {
  id: "defense-emergency-override",
  name: "Mission-Impact Authorization During Active Cyber Compromise",
  description:
    "A cyber defense team detects active lateral movement in a classified network enclave supporting a mission-critical operational system. Standard DCO containment actions (host isolation, credential revocation, signature deployment) proceed immediately under pre-delegated standing authorities per the Commander's OPORD. However, the adversary's persistence mechanisms require full enclave isolation — which would degrade the supported mission-critical system. This mission-impact authorization resides with the Senior Commander, who is in transit with limited secure communications. The tension between network defense urgency and mission assurance grows as adversary dwell time increases.",
  icon: "ShieldCheck",
  industryId: "defense",
  archetypeId: "emergency-break-glass",
  prompt:
    "What happens when active lateral movement in a classified enclave requires full enclave isolation but the Senior Commander is unreachable to authorize the mission impact on a supported operational system?",
  actors: [
    {
      id: "operations-center",
      type: NodeType.Organization,
      label: "Cyber Operations Center",
      parentId: null,
      organizationId: "operations-center",
      color: "#22C55E",
    },
    {
      id: "cyber-command",
      type: NodeType.Department,
      label: "Cyber Defense Team",
      description: "Defensive cyber operations team responsible for classified enclave monitoring, threat detection, and incident containment under pre-delegated standing authorities",
      parentId: "operations-center",
      organizationId: "operations-center",
      color: "#06B6D4",
    },
    {
      id: "watch-officer",
      type: NodeType.Role,
      label: "Crew Commander",
      description: "DCO crew commander with pre-delegated authority for standard containment actions (host isolation, credential revocation, signature deployment) — requires mission-impact authorization from Senior Commander for full enclave isolation affecting mission-critical systems",
      parentId: "cyber-command",
      organizationId: "operations-center",
      color: "#94A3B8",
    },
    {
      id: "commander",
      type: NodeType.Role,
      label: "Senior Commander",
      description: "Authorizes mission-impact decisions — specifically, accepting degradation of supported mission-critical systems in exchange for full network containment per Commander's OPORD and pre-delegated defensive authorities",
      parentId: "operations-center",
      organizationId: "operations-center",
      color: "#94A3B8",
    },
    {
      id: "duty-officer",
      type: NodeType.Role,
      label: "Deputy Commander",
      description: "Second-in-command authorized as delegation fallback for mission-impact decisions when the Senior Commander is unreachable — per unit succession SOP",
      parentId: "operations-center",
      organizationId: "operations-center",
      color: "#94A3B8",
    },
    {
      id: "audit-system",
      type: NodeType.System,
      label: "SIEM / Audit Log",
      description: "Security Information and Event Management system recording all containment actions and authorization decisions for post-incident review and OPREP-3 reporting",
      parentId: "operations-center",
      organizationId: "operations-center",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-emergency-override",
      actorId: "operations-center",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["commander"],
      },
      expirySeconds: 900,
      delegationAllowed: true,
      delegateToRoleId: "duty-officer",
      escalation: {
        afterSeconds: 15,
        toRoleIds: ["duty-officer"],
      },
    },
  ],
  edges: [
    { sourceId: "operations-center", targetId: "cyber-command", type: "authority" },
    { sourceId: "operations-center", targetId: "commander", type: "authority" },
    { sourceId: "operations-center", targetId: "duty-officer", type: "authority" },
    { sourceId: "operations-center", targetId: "audit-system", type: "authority" },
    { sourceId: "cyber-command", targetId: "watch-officer", type: "authority" },
    { sourceId: "commander", targetId: "duty-officer", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Mission-impact authorization for classified enclave isolation",
    initiatorRoleId: "watch-officer",
    targetAction: "Mission-Impact Authorization — Classified Enclave Isolation During Active Compromise",
    description:
      "Crew Commander has executed pre-authorized standard containment actions (host isolation, credential revocation, signature deployment) but adversary persistence mechanisms require full enclave isolation. Because isolation would degrade a supported mission-critical operational system, mission-impact authorization is required from the Senior Commander (1-of-1). If Commander is unreachable, delegation auto-routes to the Deputy Commander. All actions logged to SIEM for OPREP-3 reporting and post-incident review.",
  },
  beforeMetrics: {
    manualTimeHours: 4,
    riskExposureDays: 7,
    auditGapCount: 5,
    approvalSteps: 4,
  },
  todayFriction: {
    ...ARCHETYPES["emergency-break-glass"].defaultFriction,
    blockEscalation: true,
    manualSteps: [
      { trigger: "after-request", description: "Crew Commander contacts Senior Commander via STE/secure voice for mission-impact authorization — Commander in transit, no response on primary or alternate secure lines", delaySeconds: 10 },
      { trigger: "before-approval", description: "Reviewing Commander's OPORD to confirm scope of pre-delegated containment authorities and whether full enclave isolation exceeds standing authority", delaySeconds: 6 },
      { trigger: "on-unavailable", description: "Commander unreachable — no formal delegation path for mission-impact decisions exists in authorization systems, adversary dwell time increasing as partial containment proves insufficient", delaySeconds: 14 },
    ],
    narrativeTemplate: "STE/secure voice with manual OPORD review while adversary lateral movement continues across classified enclave",
  },
  todayPolicies: [
    {
      id: "policy-emergency-override-today",
      actorId: "operations-center",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["commander"],
      },
      expirySeconds: 20,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: REGULATORY_DB.defense,
  tags: ["defense", "emergency", "break-glass", "cyber", "dco", "containment", "lateral-movement", "incident-response", "mission-impact", "delegation", "oprep-3"],
};
