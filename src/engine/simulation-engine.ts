import type { ScenarioTemplate } from "@/types/scenario";
import type { Policy } from "@/types/policy";
import type { SimulationRun } from "@/types/simulation";
import type { Actor } from "@/types/organization";
import type { FrictionProfile } from "@/types/friction";
import type {
  EvidenceBundle,
  AuditLogEntry,
  TimelineEntry,
} from "@/types/evidence";
import { SimulationEventType } from "@/types/simulation";
import { EvidenceBundleSchema } from "@/schemas";
import { generateEvents } from "./event-generator";
import { generateProofArtifact } from "./proof-generator";
import { generateVerificationQueries, generateComparison } from "./verification";

export function runSimulation(
  scenario: ScenarioTemplate,
  policies: Policy[],
  seed: number,
  friction?: FrictionProfile
): SimulationRun {
  const { events, states } = generateEvents(
    scenario.actors,
    policies,
    scenario.defaultWorkflow,
    seed,
    friction,
    scenario.regulatoryContext
  );

  const lastState = states[states.length - 1];
  const lastEvent = events[events.length - 1];

  return {
    id: `run-${scenario.id}-${seed}`,
    scenarioId: scenario.id,
    seed,
    events,
    states,
    startedAt: 0,
    completedAt: lastEvent?.timestamp,
    outcome: lastState?.outcome === "approved" ? "approved" : "denied",
  };
}

export function runDualSimulation(
  scenario: ScenarioTemplate,
  accumulatePolicies: Policy[],
  todayPolicies: Policy[],
  seed: number,
  friction: FrictionProfile
): { todayRun: SimulationRun; accumulateRun: SimulationRun } {
  // "Today" run: with friction and todayPolicies
  const todayRun = runSimulation(scenario, todayPolicies, seed, friction);
  todayRun.id = `run-today-${scenario.id}-${seed}`;

  // "Accumulate" run: clean policies, no friction, same seed for comparable results
  const accumulateRun = runSimulation(scenario, accumulatePolicies, seed);
  accumulateRun.id = `run-accumulate-${scenario.id}-${seed}`;

  return { todayRun, accumulateRun };
}

export function buildAuditLog(
  run: SimulationRun,
  actors: Actor[]
): AuditLogEntry[] {
  return run.events.map((event, index) => {
    const actor = actors.find((a) => a.id === event.actorId);
    let result: "success" | "failure" | "pending" = "pending";

    if (
      event.type === SimulationEventType.APPROVED ||
      event.type === SimulationEventType.DELEGATED
    ) {
      result = "success";
    } else if (
      event.type === SimulationEventType.DENIED ||
      event.type === SimulationEventType.EXPIRED
    ) {
      result = "failure";
    } else if (event.type === SimulationEventType.FINALIZED) {
      result = event.metadata.outcome === "approved" ? "success" : "failure";
    } else if (event.type === SimulationEventType.MANUAL_STEP) {
      result = "pending";
    } else if (event.type === SimulationEventType.WAITING) {
      result = "pending";
    }

    return {
      index,
      timestamp: event.timestamp,
      eventType: event.type,
      actor: actor?.label ?? event.actorId,
      action: event.description,
      policyRef: event.policyId,
      result,
    };
  });
}

export function buildTimeline(
  run: SimulationRun,
  actors: Actor[]
): TimelineEntry[] {
  return run.events.map((event) => {
    const actor = actors.find((a) => a.id === event.actorId);
    let status: TimelineEntry["status"] = "completed";

    if (
      event.type === SimulationEventType.DENIED ||
      event.type === SimulationEventType.EXPIRED
    ) {
      status = "failed";
    } else if (
      event.type === SimulationEventType.APPROVAL_REQUESTED ||
      event.type === SimulationEventType.ESCALATED
    ) {
      status = "pending";
    } else if (
      event.type === SimulationEventType.MANUAL_STEP ||
      event.type === SimulationEventType.WAITING
    ) {
      status = "active";
    }

    return {
      timestamp: event.timestamp,
      label: `${actor?.label ?? event.actorId} — ${event.type.replace(/_/g, " ")}`,
      description: event.description,
      status,
    };
  });
}

export async function buildEvidenceBundle(
  run: SimulationRun,
  scenario: ScenarioTemplate,
  policies: Policy[]
): Promise<EvidenceBundle> {
  const auditLog = buildAuditLog(run, scenario.actors);
  const timeline = buildTimeline(run, scenario.actors);
  const proofArtifact = await generateProofArtifact(run, scenario.actors);
  const verification = generateVerificationQueries(run, policies, scenario.actors);
  const beforeAfter = generateComparison(scenario.beforeMetrics, run);

  const bundle: EvidenceBundle = {
    auditLog,
    timeline,
    proofArtifact,
    verification,
    beforeAfter,
  };

  // Validate the evidence bundle at the data boundary
  EvidenceBundleSchema.parse(bundle);

  return bundle;
}
