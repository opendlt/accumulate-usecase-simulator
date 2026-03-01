import { describe, it, expect } from "vitest";
import { runSimulation, buildAuditLog, buildTimeline } from "../simulation-engine";
import { vendorAccessScenario } from "@/scenarios/vendor-access";
import { treasuryTransferScenario } from "@/scenarios/treasury-transfer";
import { incidentEscalationScenario } from "@/scenarios/incident-escalation";

describe("runSimulation", () => {
  it("returns a valid SimulationRun for vendor access", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    expect(run.id).toBeTruthy();
    expect(run.scenarioId).toBe("vendor-access");
    expect(run.events.length).toBeGreaterThan(0);
    expect(["approved", "denied"]).toContain(run.outcome);
  });

  it("returns a valid SimulationRun for treasury transfer", () => {
    const run = runSimulation(treasuryTransferScenario, treasuryTransferScenario.policies, 42);
    expect(run.scenarioId).toBe("treasury-transfer");
    expect(run.events.length).toBeGreaterThan(0);
    expect(["approved", "denied"]).toContain(run.outcome);
  });

  it("returns a valid SimulationRun for incident escalation", () => {
    const run = runSimulation(incidentEscalationScenario, incidentEscalationScenario.policies, 42);
    expect(run.scenarioId).toBe("incident-escalation");
    expect(run.events.length).toBeGreaterThan(0);
    expect(["approved", "denied"]).toContain(run.outcome);
  });

  it("is deterministic with the same seed", () => {
    const run1 = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const run2 = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    expect(run1.outcome).toBe(run2.outcome);
    expect(run1.events.length).toBe(run2.events.length);
  });

  it("outcome is never undefined", () => {
    for (let seed = 0; seed < 20; seed++) {
      const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, seed);
      expect(run.outcome).toBeDefined();
      expect(["approved", "denied"]).toContain(run.outcome);
    }
  });

  it("completedAt matches last event timestamp", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const lastEvent = run.events[run.events.length - 1];
    expect(run.completedAt).toBe(lastEvent?.timestamp);
  });
});

describe("buildAuditLog", () => {
  it("produces entries for each event", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const log = buildAuditLog(run, vendorAccessScenario.actors);
    expect(log.length).toBe(run.events.length);
  });

  it("entries have correct index ordering", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const log = buildAuditLog(run, vendorAccessScenario.actors);
    for (let i = 0; i < log.length; i++) {
      expect(log[i]?.index).toBe(i);
    }
  });

  it("entries have valid result values", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const log = buildAuditLog(run, vendorAccessScenario.actors);
    for (const entry of log) {
      expect(["success", "failure", "pending"]).toContain(entry.result);
    }
  });
});

describe("buildTimeline", () => {
  it("produces entries for each event", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const timeline = buildTimeline(run, vendorAccessScenario.actors);
    expect(timeline.length).toBe(run.events.length);
  });

  it("entries have valid status values", () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const timeline = buildTimeline(run, vendorAccessScenario.actors);
    for (const entry of timeline) {
      expect(["completed", "active", "pending", "failed"]).toContain(entry.status);
    }
  });
});
