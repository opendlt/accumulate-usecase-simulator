import { describe, it, expect } from "vitest";
import {
  ScenarioTemplateSchema,
  ActorSchema,
  PolicySchema,
} from "@/schemas";
import { vendorAccessScenario } from "@/scenarios/vendor-access";
import { treasuryTransferScenario } from "@/scenarios/treasury-transfer";
import { incidentEscalationScenario } from "@/scenarios/incident-escalation";
import { NodeType } from "@/types/organization";

describe("ScenarioTemplateSchema", () => {
  it("validates vendor-access scenario", () => {
    expect(() => ScenarioTemplateSchema.parse(vendorAccessScenario)).not.toThrow();
  });

  it("validates treasury-transfer scenario", () => {
    expect(() => ScenarioTemplateSchema.parse(treasuryTransferScenario)).not.toThrow();
  });

  it("validates incident-escalation scenario", () => {
    expect(() => ScenarioTemplateSchema.parse(incidentEscalationScenario)).not.toThrow();
  });

  it("rejects scenario with empty name", () => {
    const bad = { ...vendorAccessScenario, name: "" };
    expect(() => ScenarioTemplateSchema.parse(bad)).toThrow();
  });

  it("rejects scenario with no actors", () => {
    const bad = { ...vendorAccessScenario, actors: [] };
    expect(() => ScenarioTemplateSchema.parse(bad)).toThrow();
  });

  it("rejects scenario with no policies", () => {
    const bad = { ...vendorAccessScenario, policies: [] };
    expect(() => ScenarioTemplateSchema.parse(bad)).toThrow();
  });
});

describe("ActorSchema", () => {
  it("validates a valid actor", () => {
    const actor = {
      id: "test-actor",
      type: NodeType.Role,
      label: "Test Actor",
      parentId: null,
      organizationId: "org-1",
      color: "#3B82F6",
    };
    expect(() => ActorSchema.parse(actor)).not.toThrow();
  });

  it("rejects actor with empty id", () => {
    const bad = {
      id: "",
      type: NodeType.Role,
      label: "Test",
      parentId: null,
      organizationId: "org-1",
      color: "#fff",
    };
    expect(() => ActorSchema.parse(bad)).toThrow();
  });
});

describe("PolicySchema", () => {
  it("validates a valid policy", () => {
    const policy = {
      id: "pol-1",
      actorId: "actor-1",
      threshold: { k: 2, n: 3, approverRoleIds: ["a", "b", "c"] },
      expirySeconds: 3600,
      delegationAllowed: false,
    };
    expect(() => PolicySchema.parse(policy)).not.toThrow();
  });

  it("rejects policy with k=0 threshold", () => {
    const bad = {
      id: "pol-1",
      actorId: "actor-1",
      threshold: { k: 0, n: 3, approverRoleIds: ["a", "b", "c"] },
      expirySeconds: 3600,
      delegationAllowed: false,
    };
    expect(() => PolicySchema.parse(bad)).toThrow();
  });

  it("rejects policy with empty approverRoleIds", () => {
    const bad = {
      id: "pol-1",
      actorId: "actor-1",
      threshold: { k: 1, n: 1, approverRoleIds: [] },
      expirySeconds: 0,
      delegationAllowed: false,
    };
    expect(() => PolicySchema.parse(bad)).toThrow();
  });
});
