import { NodeType } from "@/types/organization";
import type { Actor } from "@/types/organization";
import type { Policy } from "@/types/policy";
import type { ScenarioTemplate, ComparisonMetrics } from "@/types/scenario";
import type { FrictionProfile } from "@/types/friction";
import type { IndustryId } from "@/types/industry";
import { ARCHETYPES } from "@/scenarios/archetypes";
import { getRegulatoryContext } from "@/lib/regulatory-data";

export interface OrgBuilderConfig {
  orgName: string;
  industryId: IndustryId;
  departments: string[];
  roles: Record<string, string[]>; // department name -> role names
  policy: {
    threshold: number;
    expiryHours: number;
    delegationAllowed: boolean;
  };
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function buildCustomScenario(config: OrgBuilderConfig): ScenarioTemplate {
  const orgId = slugify(config.orgName);
  const actors: Actor[] = [];
  const edges: { sourceId: string; targetId: string; type: "authority" | "delegation" }[] = [];

  // Organization node
  actors.push({
    id: orgId,
    type: NodeType.Organization,
    label: config.orgName,
    parentId: null,
    organizationId: orgId,
    color: "#3B82F6",
  });

  const allRoleIds: string[] = [];
  let delegateRoleId: string | undefined;

  // Departments + roles
  for (const dept of config.departments) {
    const deptId = `${orgId}-${slugify(dept)}`;
    actors.push({
      id: deptId,
      type: NodeType.Department,
      label: dept,
      parentId: orgId,
      organizationId: orgId,
      color: "#06B6D4",
    });
    edges.push({ sourceId: orgId, targetId: deptId, type: "authority" });

    const deptRoles = config.roles[dept] ?? [];
    for (const role of deptRoles) {
      const roleId = `${orgId}-${slugify(role)}`;
      actors.push({
        id: roleId,
        type: NodeType.Role,
        label: role,
        parentId: deptId,
        organizationId: orgId,
        color: "#94A3B8",
      });
      edges.push({ sourceId: deptId, targetId: roleId, type: "authority" });
      allRoleIds.push(roleId);
    }
  }

  // Pick approvers (first N roles for threshold, last role as potential delegate)
  const approverCount = Math.min(config.policy.threshold + 1, allRoleIds.length);
  const approverIds = allRoleIds.slice(0, approverCount);
  if (allRoleIds.length > approverCount) {
    delegateRoleId = allRoleIds[allRoleIds.length - 1];
  }

  // First role is the initiator
  const initiatorId = allRoleIds[0] ?? orgId;
  // Approvers are everyone except the initiator
  const policyApproverIds = approverIds.filter((id) => id !== initiatorId);
  if (policyApproverIds.length === 0 && allRoleIds.length > 1) {
    policyApproverIds.push(allRoleIds[1]!);
  }

  const n = policyApproverIds.length;
  const k = Math.min(config.policy.threshold, n) || 1;

  // Add delegation edge if allowed
  if (config.policy.delegationAllowed && delegateRoleId && policyApproverIds[0]) {
    edges.push({ sourceId: policyApproverIds[0], targetId: delegateRoleId, type: "delegation" });
  }

  const policyId = `policy-${orgId}-custom`;
  const policy: Policy = {
    id: policyId,
    actorId: orgId,
    threshold: { k, n, approverRoleIds: policyApproverIds },
    expirySeconds: config.policy.expiryHours * 3600,
    delegationAllowed: config.policy.delegationAllowed,
    delegateToRoleId: config.policy.delegationAllowed ? delegateRoleId : undefined,
  };

  // Pick an archetype-based friction profile
  const archetypeKey = k >= 2 ? "multi-party-approval" : "time-bound-authority";
  const friction: FrictionProfile = ARCHETYPES[archetypeKey].defaultFriction;

  // Today policies — same structure but with shorter expiry and no delegation
  const todayPolicy: Policy = {
    ...policy,
    id: `${policyId}-today`,
    expirySeconds: Math.min(policy.expirySeconds, 25),
    delegationAllowed: false,
    delegateToRoleId: undefined,
  };

  const beforeMetrics: ComparisonMetrics = {
    manualTimeHours: Math.max(2, config.policy.expiryHours),
    riskExposureDays: Math.max(1, Math.round(config.policy.expiryHours / 8)),
    auditGapCount: Math.max(2, policyApproverIds.length + 1),
    approvalSteps: Math.max(2, policyApproverIds.length + 2),
  };

  return {
    id: `custom-${orgId}-${Date.now()}`,
    name: `${config.orgName} Custom Authorization`,
    description: `Custom authorization scenario for ${config.orgName}. Requires ${k}-of-${n} approval with ${config.policy.expiryHours}h expiry window.${config.policy.delegationAllowed ? " Delegation is permitted." : ""}`,
    icon: "Buildings",
    actors,
    policies: [policy],
    edges,
    defaultWorkflow: {
      name: `${config.orgName} authorization workflow`,
      initiatorRoleId: initiatorId,
      targetAction: `${config.orgName} Authorization Request`,
      description: `Authorization request initiated within ${config.orgName} requiring ${k}-of-${n} approval.`,
    },
    beforeMetrics,
    industryId: config.industryId,
    archetypeId: archetypeKey,
    todayFriction: friction,
    todayPolicies: [todayPolicy],
    regulatoryContext: getRegulatoryContext(config.industryId),
    tags: ["custom", config.industryId, orgId],
  };
}
