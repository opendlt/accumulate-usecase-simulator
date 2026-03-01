import type { Policy } from "@/types/policy";

interface ApprovalRecord {
  approved: boolean;
  actorId: string;
  timestamp: number;
}

export function evaluateThreshold(
  policy: Policy,
  approvals: Record<string, ApprovalRecord>
): { met: boolean; currentCount: number; required: number } {
  const validApprovals = Object.values(approvals).filter(
    (a) => a.approved && policy.threshold.approverRoleIds.includes(a.actorId)
  );
  return {
    met: validApprovals.length >= policy.threshold.k,
    currentCount: validApprovals.length,
    required: policy.threshold.k,
  };
}

export function evaluateExpiry(
  policy: Policy,
  currentTimestamp: number,
  requestTimestamp: number
): { expired: boolean; remainingSeconds: number } {
  if (policy.expirySeconds === 0) {
    return { expired: false, remainingSeconds: Infinity };
  }
  const elapsed = currentTimestamp - requestTimestamp;
  const remaining = policy.expirySeconds - elapsed;
  return {
    expired: remaining <= 0,
    remainingSeconds: Math.max(0, remaining),
  };
}

export function evaluateDelegation(
  policy: Policy,
  delegatorId: string,
  delegateId: string
): { allowed: boolean; reason: string } {
  if (!policy.delegationAllowed) {
    return { allowed: false, reason: "Delegation not allowed by policy" };
  }
  if (!policy.threshold.approverRoleIds.includes(delegatorId)) {
    return { allowed: false, reason: "Delegator is not an authorized approver" };
  }
  if (policy.delegateToRoleId && policy.delegateToRoleId !== delegateId) {
    return {
      allowed: false,
      reason: `Delegation only allowed to ${policy.delegateToRoleId}`,
    };
  }
  return { allowed: true, reason: "Delegation permitted" };
}

export function evaluateEscalation(
  policy: Policy,
  currentTimestamp: number,
  requestTimestamp: number
): { shouldEscalate: boolean; escalateToRoleIds: string[] } {
  if (!policy.escalation) {
    return { shouldEscalate: false, escalateToRoleIds: [] };
  }
  const elapsed = currentTimestamp - requestTimestamp;
  return {
    shouldEscalate: elapsed >= policy.escalation.afterSeconds,
    escalateToRoleIds: policy.escalation.toRoleIds,
  };
}

export function evaluateConstraints(
  policy: Policy,
  context: { amount?: number; environment?: string }
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  if (policy.constraints?.amountMax !== undefined && context.amount !== undefined) {
    if (context.amount > policy.constraints.amountMax) {
      violations.push(
        `Amount $${context.amount} exceeds maximum $${policy.constraints.amountMax}`
      );
    }
  }

  if (policy.constraints?.environment && context.environment) {
    if (
      policy.constraints.environment !== "any" &&
      policy.constraints.environment !== context.environment
    ) {
      violations.push(
        `Environment "${context.environment}" not allowed (requires "${policy.constraints.environment}")`
      );
    }
  }

  return { passed: violations.length === 0, violations };
}
