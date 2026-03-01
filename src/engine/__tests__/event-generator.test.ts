import { describe, it, expect } from "vitest";
import { generateEvents } from "../event-generator";
import { vendorAccessScenario } from "@/scenarios/vendor-access";
import { treasuryTransferScenario } from "@/scenarios/treasury-transfer";
import { incidentEscalationScenario } from "@/scenarios/incident-escalation";
import { SimulationEventType } from "@/types/simulation";

describe("generateEvents", () => {
  it("produces events for vendor access scenario", () => {
    const { events } = generateEvents(
      vendorAccessScenario.actors,
      vendorAccessScenario.policies,
      vendorAccessScenario.defaultWorkflow,
      42
    );
    expect(events.length).toBeGreaterThan(0);
  });

  it("first event is always REQUEST_CREATED", () => {
    const { events } = generateEvents(
      vendorAccessScenario.actors,
      vendorAccessScenario.policies,
      vendorAccessScenario.defaultWorkflow,
      42
    );
    expect(events[0]?.type).toBe(SimulationEventType.REQUEST_CREATED);
  });

  it("last event is always FINALIZED", () => {
    const { events } = generateEvents(
      vendorAccessScenario.actors,
      vendorAccessScenario.policies,
      vendorAccessScenario.defaultWorkflow,
      42
    );
    expect(events[events.length - 1]?.type).toBe(SimulationEventType.FINALIZED);
  });

  it("events are ordered by timestamp", () => {
    const { events } = generateEvents(
      vendorAccessScenario.actors,
      vendorAccessScenario.policies,
      vendorAccessScenario.defaultWorkflow,
      42
    );
    for (let i = 1; i < events.length; i++) {
      expect(events[i]!.timestamp).toBeGreaterThanOrEqual(events[i - 1]!.timestamp);
    }
  });

  it("is deterministic with the same seed", () => {
    const run1 = generateEvents(
      vendorAccessScenario.actors,
      vendorAccessScenario.policies,
      vendorAccessScenario.defaultWorkflow,
      42
    );
    const run2 = generateEvents(
      vendorAccessScenario.actors,
      vendorAccessScenario.policies,
      vendorAccessScenario.defaultWorkflow,
      42
    );
    expect(run1.events.length).toBe(run2.events.length);
    for (let i = 0; i < run1.events.length; i++) {
      expect(run1.events[i]!.type).toBe(run2.events[i]!.type);
      expect(run1.events[i]!.timestamp).toBe(run2.events[i]!.timestamp);
    }
  });

  it("produces different results with different seeds", () => {
    const run1 = generateEvents(
      vendorAccessScenario.actors,
      vendorAccessScenario.policies,
      vendorAccessScenario.defaultWorkflow,
      42
    );
    const run2 = generateEvents(
      vendorAccessScenario.actors,
      vendorAccessScenario.policies,
      vendorAccessScenario.defaultWorkflow,
      123
    );
    // Different seeds should produce different timing at least
    const times1 = run1.events.map((e) => e.timestamp);
    const times2 = run2.events.map((e) => e.timestamp);
    expect(times1).not.toEqual(times2);
  });

  it("produces events for treasury transfer scenario", () => {
    const { events } = generateEvents(
      treasuryTransferScenario.actors,
      treasuryTransferScenario.policies,
      treasuryTransferScenario.defaultWorkflow,
      42
    );
    expect(events.length).toBeGreaterThan(0);
    expect(events[events.length - 1]?.type).toBe(SimulationEventType.FINALIZED);
  });

  it("produces events for incident escalation scenario", () => {
    const { events } = generateEvents(
      incidentEscalationScenario.actors,
      incidentEscalationScenario.policies,
      incidentEscalationScenario.defaultWorkflow,
      42
    );
    expect(events.length).toBeGreaterThan(0);
    expect(events[events.length - 1]?.type).toBe(SimulationEventType.FINALIZED);
  });

  it("states array has same length as events", () => {
    const { events, states } = generateEvents(
      vendorAccessScenario.actors,
      vendorAccessScenario.policies,
      vendorAccessScenario.defaultWorkflow,
      42
    );
    expect(states.length).toBe(events.length);
  });

  it("produces a DENIED outcome with certain seeds", () => {
    // Try multiple seeds to find a denial
    let foundDenied = false;
    for (let seed = 0; seed < 100; seed++) {
      const { events } = generateEvents(
        vendorAccessScenario.actors,
        vendorAccessScenario.policies,
        vendorAccessScenario.defaultWorkflow,
        seed
      );
      const last = events[events.length - 1];
      if (last?.metadata.outcome === "denied") {
        foundDenied = true;
        break;
      }
    }
    expect(foundDenied).toBe(true);
  });
});
