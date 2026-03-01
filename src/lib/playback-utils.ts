import { SimulationEventType } from "@/types/simulation";
import type { SimulationEvent } from "@/types/simulation";
import type { SimulationNodeStatus } from "@/types/canvas";
import type { SimEdge } from "@/types/canvas";

export function eventToFlowPacket(type: SimulationEventType): { label: string; color: string } | null {
  switch (type) {
    case SimulationEventType.APPROVAL_REQUESTED:
      return { label: "Request", color: "#3B82F6" };
    case SimulationEventType.APPROVED:
      return { label: "Approved", color: "#22C55E" };
    case SimulationEventType.DENIED:
      return { label: "Denied", color: "#EF4444" };
    case SimulationEventType.DELEGATED:
      return { label: "Delegate", color: "#F59E0B" };
    case SimulationEventType.ESCALATED:
      return { label: "Escalate", color: "#F59E0B" };
    default:
      return null;
  }
}

export function eventTypeToNodeStatus(type: SimulationEventType): SimulationNodeStatus {
  switch (type) {
    case SimulationEventType.REQUEST_CREATED:
      return "requesting";
    case SimulationEventType.APPROVAL_REQUESTED:
      return "approving";
    case SimulationEventType.APPROVED:
      return "approved";
    case SimulationEventType.DENIED:
      return "denied";
    case SimulationEventType.DELEGATED:
      return "delegating";
    case SimulationEventType.ESCALATED:
      return "escalating";
    case SimulationEventType.EXPIRED:
      return "expired";
    case SimulationEventType.FINALIZED:
      return "approved";
    case SimulationEventType.MANUAL_STEP:
      return "manual-step";
    case SimulationEventType.WAITING:
      return "waiting";
    default:
      return "idle";
  }
}

export function findEdgeId(edges: SimEdge[], sourceId: string, targetId: string): string | undefined {
  return edges.find(
    (e) =>
      (e.source === sourceId && e.target === targetId) ||
      (e.source === targetId && e.target === sourceId)
  )?.id;
}

export function applyEventToCanvas(
  event: SimulationEvent,
  edges: SimEdge[],
  updateNodeSimStatus: (id: string, status: SimulationNodeStatus) => void,
  updateEdgeAnimation: (id: string, animating: boolean) => void,
  updateNodeFrictionDescription?: (id: string, description?: string) => void,
  clearAllFlowPackets?: () => void,
  updateEdgeFlowPacket?: (id: string, label?: string, color?: string) => void,
  triggerNodeReceiveRipple?: (id: string) => void,
) {
  const nodeStatus = eventTypeToNodeStatus(event.type);
  updateNodeSimStatus(event.actorId, nodeStatus);

  // Set or clear friction description
  if (updateNodeFrictionDescription) {
    if (event.type === SimulationEventType.MANUAL_STEP || event.type === SimulationEventType.WAITING) {
      updateNodeFrictionDescription(event.actorId, event.description);
    } else {
      updateNodeFrictionDescription(event.actorId, undefined);
    }
  }

  if (event.targetActorId) {
    if (event.type === SimulationEventType.DELEGATED) {
      updateNodeSimStatus(event.targetActorId, "approving");
    } else if (event.type === SimulationEventType.ESCALATED) {
      updateNodeSimStatus(event.targetActorId, "escalating");
    }
  }

  if (
    event.type === SimulationEventType.FINALIZED &&
    event.metadata.outcome === "denied"
  ) {
    updateNodeSimStatus(event.actorId, "denied");
  }

  // Edge animations
  if (event.type === SimulationEventType.APPROVAL_REQUESTED && event.targetActorId) {
    const edgeId = findEdgeId(edges, event.actorId, event.targetActorId);
    if (edgeId) updateEdgeAnimation(edgeId, true);
  } else if (
    (event.type === SimulationEventType.APPROVED || event.type === SimulationEventType.DENIED) &&
    event.targetActorId
  ) {
    const edgeId = findEdgeId(edges, event.actorId, event.targetActorId);
    if (edgeId) updateEdgeAnimation(edgeId, true);
  } else if (event.type === SimulationEventType.DELEGATED && event.targetActorId) {
    const edgeId = findEdgeId(edges, event.actorId, event.targetActorId);
    if (edgeId) updateEdgeAnimation(edgeId, true);
  } else if (event.type === SimulationEventType.FINALIZED) {
    for (const edge of edges) {
      if (edge.data?.isAnimating) {
        updateEdgeAnimation(edge.id, false);
      }
    }
    clearAllFlowPackets?.();
  }

  // Flow packet logic
  if (clearAllFlowPackets) {
    clearAllFlowPackets();
  }
  if (event.targetActorId && updateEdgeFlowPacket) {
    const packet = eventToFlowPacket(event.type);
    if (packet) {
      const edgeId = findEdgeId(edges, event.actorId, event.targetActorId);
      if (edgeId) {
        updateEdgeFlowPacket(edgeId, packet.label, packet.color);
      }
      triggerNodeReceiveRipple?.(event.targetActorId);
    }
  }
}
