import { describe, it, expect } from "vitest";
import { generateVerificationQueries, generateComparison } from "../verification";
import { runSimulation } from "../simulation-engine";
import { vendorAccessScenario } from "@/scenarios/vendor-access";

describe("generateVerificationQueries", () => {
  it("generates at least 5 verification queries", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const queries = generateVerificationQueries(
      run,
      vendorAccessScenario.policies,
      vendorAccessScenario.actors
    );
    expect(queries.length).toBeGreaterThanOrEqual(5);
  });

  it("includes 'Who approved this action?' query", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const queries = generateVerificationQueries(
      run,
      vendorAccessScenario.policies,
      vendorAccessScenario.actors
    );
    const whoApproved = queries.find((q) => q.question === "Who approved this action?");
    expect(whoApproved).toBeTruthy();
    expect(whoApproved!.answer).toBeTruthy();
  });

  it("includes 'Under what policy?' query", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const queries = generateVerificationQueries(
      run,
      vendorAccessScenario.policies,
      vendorAccessScenario.actors
    );
    const policy = queries.find((q) =>
      q.question.includes("Under what policy")
    );
    expect(policy).toBeTruthy();
    expect(policy!.answer).toContain("2-of-3");
  });

  it("includes 'Can this be independently verified?' query", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const queries = generateVerificationQueries(
      run,
      vendorAccessScenario.policies,
      vendorAccessScenario.actors
    );
    const verify = queries.find((q) =>
      q.question.includes("independently verified")
    );
    expect(verify).toBeTruthy();
    expect(verify!.answer).toContain("SHA-256");
  });

  it("all queries have non-empty answers", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const queries = generateVerificationQueries(
      run,
      vendorAccessScenario.policies,
      vendorAccessScenario.actors
    );
    for (const q of queries) {
      expect(q.question).toBeTruthy();
      expect(q.answer).toBeTruthy();
    }
  });
});

describe("generateComparison", () => {
  it("generates 4 comparison metrics", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const comparison = generateComparison(vendorAccessScenario.beforeMetrics, run);
    expect(comparison).toHaveLength(4);
  });

  it("includes Approval Time comparison", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const comparison = generateComparison(vendorAccessScenario.beforeMetrics, run);
    const time = comparison.find((c) => c.metric === "Approval Time");
    expect(time).toBeTruthy();
    expect(time!.before).toContain("hours");
    expect(time!.after).toContain("seconds");
  });

  it("all comparisons have improvement text", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const comparison = generateComparison(vendorAccessScenario.beforeMetrics, run);
    for (const c of comparison) {
      expect(c.improvement).toBeTruthy();
    }
  });
});
