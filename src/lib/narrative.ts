import { SimulationEventType } from "@/types/simulation";
import type { SimulationEvent } from "@/types/simulation";
import type { Actor } from "@/types/organization";
import type { ComparisonMetrics } from "@/types/scenario";

export interface NarrativeLine {
  text: string;
  color?: string;
}

function actorName(actorId: string, actors: Actor[]): string {
  const actor = actors.find((a) => a.id === actorId);
  return actor?.label ?? "Unknown";
}

export function eventToNarrative(
  event: SimulationEvent,
  actors: Actor[],
  side: "today" | "accumulate"
): NarrativeLine {
  const actor = actorName(event.actorId, actors);
  const target = event.targetActorId ? actorName(event.targetActorId, actors) : "";

  if (side === "today") {
    switch (event.type) {
      case SimulationEventType.REQUEST_CREATED:
        return { text: `${actor} submits the request...` };
      case SimulationEventType.MANUAL_STEP:
        return { text: `Manual step required: ${event.description}`, color: "#EF4444" };
      case SimulationEventType.WAITING:
        return { text: `Waiting... ${event.description}`, color: "#F59E0B" };
      case SimulationEventType.APPROVAL_REQUESTED:
        return { text: `Forwarded to ${target || actor} for review...` };
      case SimulationEventType.APPROVED:
        return { text: `${actor} finally approves.` };
      case SimulationEventType.DENIED:
        return { text: `${actor} denies the request.`, color: "#EF4444" };
      case SimulationEventType.EXPIRED:
        return { text: "Authority expired before approval.", color: "#EF4444" };
      case SimulationEventType.DELEGATED:
        return { text: `${actor} delegates to ${target}...` };
      case SimulationEventType.ESCALATED:
        return { text: `Escalated to ${target}...`, color: "#F59E0B" };
      case SimulationEventType.FINALIZED:
        return { text: event.description || "Process finalized." };
      default:
        return { text: event.description };
    }
  }

  // Accumulate side: clean and efficient
  switch (event.type) {
    case SimulationEventType.REQUEST_CREATED:
      return { text: "Request submitted." };
    case SimulationEventType.APPROVAL_REQUESTED:
      return { text: `Policy routes to ${target || actor}.` };
    case SimulationEventType.APPROVED:
      return { text: `${actor} approves.` };
    case SimulationEventType.DENIED:
      return { text: `${actor} denies.`, color: "#EF4444" };
    case SimulationEventType.DELEGATED:
      return { text: `Delegated to ${target}.` };
    case SimulationEventType.ESCALATED:
      return { text: `Escalated to ${target}.` };
    case SimulationEventType.EXPIRED:
      return { text: "Authority expired.", color: "#EF4444" };
    case SimulationEventType.FINALIZED:
      return { text: "Cryptographic proof generated. Done." };
    default:
      return { text: event.description };
  }
}

export function completionSummary(
  side: "today" | "accumulate",
  beforeMetrics?: ComparisonMetrics,
  manualSteps?: number
): NarrativeLine {
  if (side === "today") {
    const hours = beforeMetrics?.manualTimeHours ?? 72;
    const steps = manualSteps ?? beforeMetrics?.approvalSteps ?? 4;
    const gaps = beforeMetrics?.auditGapCount ?? 3;
    return {
      text: `Total: ${hours}+ hours, ${steps} manual steps, ${gaps} audit gaps`,
      color: "#EF4444",
    };
  }
  return {
    text: "Total: 18 seconds. Zero manual steps. Full audit trail.",
    color: "#22C55E",
  };
}
