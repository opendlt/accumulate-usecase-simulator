import { describe, it, expect } from "vitest";
import {
  evaluateThreshold,
  evaluateExpiry,
  evaluateDelegation,
  evaluateEscalation,
  evaluateConstraints,
} from "../policy-evaluator";
import type { Policy } from "@/types/policy";

const basePolicy: Policy = {
  id: "test-policy",
  actorId: "dept-1",
  threshold: {
    k: 2,
    n: 3,
    approverRoleIds: ["role-a", "role-b", "role-c"],
  },
  expirySeconds: 86400,
  delegationAllowed: true,
  delegateToRoleId: "role-d",
};

describe("evaluateThreshold", () => {
  it("returns met=true when k approvals received", () => {
    const approvals = {
      "role-a": { approved: true, actorId: "role-a", timestamp: 5 },
      "role-b": { approved: true, actorId: "role-b", timestamp: 10 },
    };
    const result = evaluateThreshold(basePolicy, approvals);
    expect(result.met).toBe(true);
    expect(result.currentCount).toBe(2);
    expect(result.required).toBe(2);
  });

  it("returns met=false with k-1 approvals", () => {
    const approvals = {
      "role-a": { approved: true, actorId: "role-a", timestamp: 5 },
    };
    const result = evaluateThreshold(basePolicy, approvals);
    expect(result.met).toBe(false);
    expect(result.currentCount).toBe(1);
  });

  it("does not count denied approvals", () => {
    const approvals = {
      "role-a": { approved: true, actorId: "role-a", timestamp: 5 },
      "role-b": { approved: false, actorId: "role-b", timestamp: 10 },
    };
    const result = evaluateThreshold(basePolicy, approvals);
    expect(result.met).toBe(false);
    expect(result.currentCount).toBe(1);
  });

  it("ignores approvals from non-authorized roles", () => {
    const approvals = {
      "role-a": { approved: true, actorId: "role-a", timestamp: 5 },
      "role-x": { approved: true, actorId: "role-x", timestamp: 10 },
    };
    const result = evaluateThreshold(basePolicy, approvals);
    expect(result.met).toBe(false);
    expect(result.currentCount).toBe(1);
  });
});

describe("evaluateExpiry", () => {
  it("returns expired=false when within window", () => {
    const result = evaluateExpiry(basePolicy, 100, 0);
    expect(result.expired).toBe(false);
    expect(result.remainingSeconds).toBe(86300);
  });

  it("returns expired=true when past window", () => {
    const result = evaluateExpiry(basePolicy, 86500, 0);
    expect(result.expired).toBe(true);
    expect(result.remainingSeconds).toBe(0);
  });

  it("returns expired=false when expirySeconds is 0 (no expiry)", () => {
    const noExpiryPolicy = { ...basePolicy, expirySeconds: 0 };
    const result = evaluateExpiry(noExpiryPolicy, 999999, 0);
    expect(result.expired).toBe(false);
    expect(result.remainingSeconds).toBe(Infinity);
  });
});

describe("evaluateDelegation", () => {
  it("allows delegation to authorized delegate", () => {
    const result = evaluateDelegation(basePolicy, "role-a", "role-d");
    expect(result.allowed).toBe(true);
  });

  it("denies delegation when not allowed by policy", () => {
    const noDelegatePolicy = { ...basePolicy, delegationAllowed: false };
    const result = evaluateDelegation(noDelegatePolicy, "role-a", "role-d");
    expect(result.allowed).toBe(false);
  });

  it("denies delegation from non-authorized approver", () => {
    const result = evaluateDelegation(basePolicy, "role-x", "role-d");
    expect(result.allowed).toBe(false);
  });

  it("denies delegation to wrong delegate", () => {
    const result = evaluateDelegation(basePolicy, "role-a", "role-x");
    expect(result.allowed).toBe(false);
  });
});

describe("evaluateEscalation", () => {
  const escalationPolicy: Policy = {
    ...basePolicy,
    escalation: { afterSeconds: 60, toRoleIds: ["exec"] },
  };

  it("does not escalate before timeout", () => {
    const result = evaluateEscalation(escalationPolicy, 30, 0);
    expect(result.shouldEscalate).toBe(false);
  });

  it("escalates after timeout", () => {
    const result = evaluateEscalation(escalationPolicy, 65, 0);
    expect(result.shouldEscalate).toBe(true);
    expect(result.escalateToRoleIds).toEqual(["exec"]);
  });

  it("does not escalate when no escalation rule", () => {
    const result = evaluateEscalation(basePolicy, 999, 0);
    expect(result.shouldEscalate).toBe(false);
  });
});

describe("evaluateConstraints", () => {
  const constraintPolicy: Policy = {
    ...basePolicy,
    constraints: { amountMax: 1000000, environment: "production" },
  };

  it("passes when within constraints", () => {
    const result = evaluateConstraints(constraintPolicy, {
      amount: 500000,
      environment: "production",
    });
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("fails when amount exceeds max", () => {
    const result = evaluateConstraints(constraintPolicy, {
      amount: 2000000,
      environment: "production",
    });
    expect(result.passed).toBe(false);
    expect(result.violations).toHaveLength(1);
  });

  it("fails when environment mismatches", () => {
    const result = evaluateConstraints(constraintPolicy, {
      amount: 500000,
      environment: "non-production",
    });
    expect(result.passed).toBe(false);
    expect(result.violations).toHaveLength(1);
  });
});
