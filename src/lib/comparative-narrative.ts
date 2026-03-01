import { SimulationEventType } from "@/types/simulation";
import type { SimulationEvent } from "@/types/simulation";
import type { Actor } from "@/types/organization";

/**
 * Generate comparative narrative for Act 2 events by cross-referencing
 * friction descriptions collected during Act 1.
 */
export function generateComparativeNarrative(
  accEvent: SimulationEvent,
  actors: Actor[],
  todayFrictionDescriptions: string[],
): { text: string; comparison?: string } {
  const actorLabel =
    actors.find((a) => a.id === accEvent.actorId)?.label ?? "Unknown";
  const targetLabel = accEvent.targetActorId
    ? actors.find((a) => a.id === accEvent.targetActorId)?.label
    : undefined;

  // Try to find a matching friction description from Act 1
  const matchingFriction = todayFrictionDescriptions.find((desc) => {
    const lower = desc.toLowerCase();
    const actorLower = actorLabel.toLowerCase();
    const targetLower = targetLabel?.toLowerCase() ?? "";
    // Match by actor name or keyword overlap
    return (
      lower.includes(actorLower) ||
      lower.includes(targetLower) ||
      (accEvent.targetActorId && lower.includes("approval")) ||
      lower.includes("phone") ||
      lower.includes("email") ||
      lower.includes("manual")
    );
  });

  switch (accEvent.type) {
    case SimulationEventType.APPROVAL_REQUESTED: {
      const comparison = matchingFriction
        ? `vs Today: ${summarizeFriction(matchingFriction)}`
        : undefined;
      return {
        text: `Policy routes to ${targetLabel || actorLabel}.`,
        comparison,
      };
    }

    case SimulationEventType.APPROVED:
      return {
        text: `${actorLabel} approves.`,
        comparison: matchingFriction
          ? `vs Today: ${summarizeFriction(matchingFriction)}`
          : undefined,
      };

    case SimulationEventType.FINALIZED: {
      const totalFriction = todayFrictionDescriptions.length;
      return {
        text: "Cryptographic proof generated. Done.",
        comparison:
          totalFriction > 0
            ? `vs Today: ${totalFriction} manual steps`
            : undefined,
      };
    }

    default:
      return { text: accEvent.description };
  }
}

/**
 * Shorten a friction description for inline comparison display.
 */
function summarizeFriction(desc: string): string {
  // Truncate to a reasonable display length
  if (desc.length <= 40) return desc;
  return desc.slice(0, 37) + "...";
}
