import type { Actor } from "@/types/organization";
import type { Policy } from "@/types/policy";
import type { WorkflowDefinition } from "@/types/scenario";
import type { FrictionProfile } from "@/types/friction";
import type { RegulatoryContext } from "@/types/regulatory";
import { SimulationEventType } from "@/types/simulation";
import type { SimulationEvent, SimulationState } from "@/types/simulation";
import { SeededRandom } from "./seeded-random";
import {
  evaluateThreshold,
  evaluateDelegation,
  evaluateEscalation,
  evaluateExpiry,
} from "./policy-evaluator";

let eventSeq = 0;
function eventId(): string {
  eventSeq += 1;
  return `evt-${eventSeq}`;
}

function makeInitialState(): SimulationState {
  return {
    currentEventIndex: 0,
    approvals: {},
    delegations: [],
    escalations: [],
    isFinalized: false,
    outcome: "pending",
  };
}

function cloneState(state: SimulationState, eventIndex: number): SimulationState {
  return {
    currentEventIndex: eventIndex,
    approvals: { ...state.approvals },
    delegations: [...state.delegations],
    escalations: [...state.escalations],
    isFinalized: state.isFinalized,
    outcome: state.outcome,
  };
}

function findActor(actors: Actor[], id: string): Actor | undefined {
  return actors.find((a) => a.id === id);
}

function findPolicyForApproval(policies: Policy[], _actors: Actor[]): Policy | undefined {
  return policies[0];
}

export function generateEvents(
  actors: Actor[],
  policies: Policy[],
  workflow: WorkflowDefinition,
  seed: number,
  friction?: FrictionProfile,
  regulatoryContext?: RegulatoryContext[],
): { events: SimulationEvent[]; states: SimulationState[] } {
  eventSeq = 0;
  const rng = new SeededRandom(seed);
  const events: SimulationEvent[] = [];
  const states: SimulationState[] = [];

  const initiator = findActor(actors, workflow.initiatorRoleId);
  const policy = findPolicyForApproval(policies, actors);

  if (!initiator || !policy) {
    return { events: [], states: [] };
  }

  // Apply expiry override from friction if set
  const effectivePolicy: Policy = friction?.expiryOverride !== undefined
    ? { ...policy, expirySeconds: friction.expiryOverride }
    : policy;

  // Compliance violation tagger — rotates through available regulatory contexts
  let regIndex = 0;
  const tagCompliance = (isFrictionRun: boolean): Record<string, unknown> => {
    if (!isFrictionRun || !regulatoryContext?.length) return {};
    const reg = regulatoryContext[regIndex % regulatoryContext.length]!;
    regIndex++;
    return {
      complianceViolation: {
        framework: reg.framework,
        displayName: reg.displayName,
        clause: reg.clause ?? "",
        description: reg.violationDescription,
        fineRange: reg.fineRange,
        severity: reg.severity,
      },
    };
  };
  const isFriction = !!friction;

  let currentState = makeInitialState();
  let currentTime = 0;

  // Friction parameters (defaults match original behavior)
  const unavailabilityRate = friction?.unavailabilityRate ?? 0.25;
  const approvalProbability = friction?.approvalProbability ?? 0.85;
  const delayMultMin = friction?.delayMultiplierMin ?? 1;
  const delayMultMax = friction?.delayMultiplierMax ?? 1;

  // 1. REQUEST_CREATED
  events.push({
    id: eventId(),
    type: SimulationEventType.REQUEST_CREATED,
    timestamp: currentTime,
    actorId: initiator.id,
    policyId: effectivePolicy.id,
    description: `${initiator.label} requests: ${workflow.targetAction}`,
    metadata: { action: workflow.targetAction },
  });
  states.push(cloneState(currentState, 0));

  // Inject "after-request" manual steps
  if (friction?.manualSteps) {
    for (const step of friction.manualSteps) {
      if (step.trigger === "after-request") {
        currentTime += step.delaySeconds;
        events.push({
          id: eventId(),
          type: SimulationEventType.MANUAL_STEP,
          timestamp: currentTime,
          actorId: initiator.id,
          policyId: effectivePolicy.id,
          description: step.description,
          metadata: { manualStep: true, trigger: step.trigger, ...tagCompliance(isFriction) },
        });
        states.push(cloneState(currentState, events.length - 1));
      }
    }
  }

  // 2. APPROVAL_REQUESTED
  currentTime += 1;
  const approverIds = [...effectivePolicy.threshold.approverRoleIds];
  const approverNames = approverIds
    .map((id) => findActor(actors, id)?.label ?? id)
    .join(", ");

  events.push({
    id: eventId(),
    type: SimulationEventType.APPROVAL_REQUESTED,
    timestamp: currentTime,
    actorId: effectivePolicy.actorId,
    description: `Approval requested from: ${approverNames}`,
    policyId: effectivePolicy.id,
    metadata: { approverIds },
  });
  states.push(cloneState(currentState, events.length - 1));

  // 3. Process each approver
  const requestTimestamp = 0;
  let approvalCount = 0;
  let denied = false;
  let escalated = false;

  for (let i = 0; i < approverIds.length; i++) {
    const approverId = approverIds[i]!;
    const approver = findActor(actors, approverId);
    if (!approver) continue;

    // Inject "before-approval" manual steps
    if (friction?.manualSteps) {
      for (const step of friction.manualSteps) {
        if (step.trigger === "before-approval") {
          currentTime += step.delaySeconds;
          events.push({
            id: eventId(),
            type: SimulationEventType.MANUAL_STEP,
            timestamp: currentTime,
            actorId: approverId,
            policyId: effectivePolicy.id,
            description: step.description,
            metadata: { manualStep: true, trigger: step.trigger, ...tagCompliance(isFriction) },
          });
          states.push(cloneState(currentState, events.length - 1));
        }
      }
    }

    // Simulate delay (multiplied by friction)
    const baseDelay = rng.nextDelay(3, 15);
    const multiplier = delayMultMin + rng.next() * (delayMultMax - delayMultMin);
    const delay = Math.round(baseDelay * multiplier);
    currentTime += delay;

    // Check expiry
    const expiryResult = evaluateExpiry(effectivePolicy, currentTime, requestTimestamp);
    if (expiryResult.expired) {
      events.push({
        id: eventId(),
        type: SimulationEventType.EXPIRED,
        timestamp: currentTime,
        actorId: approverId,
        policyId: effectivePolicy.id,
        description: friction
          ? `No response received after ${effectivePolicy.expirySeconds}s — ${approver.label}'s approval window closed`
          : `Authority expired after ${effectivePolicy.expirySeconds}s — ${approver.label}'s window closed`,
        metadata: { expirySeconds: effectivePolicy.expirySeconds, ...tagCompliance(isFriction) },
      });
      currentState = cloneState(currentState, events.length - 1);
      states.push(currentState);

      currentState.isFinalized = true;
      currentState.outcome = "denied";

      events.push({
        id: eventId(),
        type: SimulationEventType.FINALIZED,
        timestamp: currentTime,
        actorId: effectivePolicy.actorId,
        description: friction
          ? "Request denied — timed out waiting for required approvals"
          : "Request denied — authority expired before threshold met",
        policyId: effectivePolicy.id,
        metadata: { outcome: "denied", reason: "expired" },
      });
      states.push(cloneState(currentState, events.length - 1));
      return { events, states };
    }

    // Check escalation
    const escalationResult = evaluateEscalation(effectivePolicy, currentTime, requestTimestamp);
    if (escalationResult.shouldEscalate && !escalated) {
      // If friction blocks escalation, skip and inject a WAITING event
      if (friction?.blockEscalation) {
        events.push({
          id: eventId(),
          type: SimulationEventType.WAITING,
          timestamp: currentTime,
          actorId: approverId,
          policyId: effectivePolicy.id,
          description: friction
            ? `No one available to escalate to — waiting for manual intervention`
            : `Escalation blocked — no escalation path available, waiting...`,
          metadata: { blockedEscalation: true, ...tagCompliance(isFriction) },
        });
        currentState = cloneState(currentState, events.length - 1);
        states.push(currentState);
        // Add extra delay for waiting
        currentTime += rng.nextDelay(5, 15);
      } else {
        escalated = true;
        const escalateToNames = escalationResult.escalateToRoleIds
          .map((id) => findActor(actors, id)?.label ?? id)
          .join(", ");

        events.push({
          id: eventId(),
          type: SimulationEventType.ESCALATED,
          timestamp: currentTime,
          actorId: approverId,
          targetActorId: escalationResult.escalateToRoleIds[0],
          policyId: effectivePolicy.id,
          description: friction
            ? `Delay exceeded ${effectivePolicy.escalation!.afterSeconds}s — manually escalated to ${escalateToNames}`
            : `Delay exceeded ${effectivePolicy.escalation!.afterSeconds}s — escalated to ${escalateToNames}`,
          metadata: { escalateToRoleIds: escalationResult.escalateToRoleIds },
        });
        currentState = cloneState(currentState, events.length - 1);
        currentState.escalations.push({
          policyId: effectivePolicy.id,
          toRoleIds: escalationResult.escalateToRoleIds,
          timestamp: currentTime,
        });
        states.push(currentState);

        // Escalation target approves quickly
        const escalationTarget = findActor(
          actors,
          escalationResult.escalateToRoleIds[0]!
        );
        if (escalationTarget) {
          currentTime += rng.nextDelay(2, 8);
          events.push({
            id: eventId(),
            type: SimulationEventType.APPROVED,
            timestamp: currentTime,
            actorId: escalationTarget.id,
            policyId: effectivePolicy.id,
            description: `${escalationTarget.label} approved (escalation response)`,
            metadata: { escalation: true },
          });
          currentState = cloneState(currentState, events.length - 1);
          currentState.approvals[escalationTarget.id] = {
            approved: true,
            actorId: escalationTarget.id,
            timestamp: currentTime,
          };
          approvalCount++;
          states.push(currentState);
        }

        // Check threshold after escalation approval
        const thresholdCheck = evaluateThreshold(effectivePolicy, currentState.approvals);
        if (thresholdCheck.met) {
          currentState.isFinalized = true;
          currentState.outcome = "approved";
          events.push({
            id: eventId(),
            type: SimulationEventType.FINALIZED,
            timestamp: currentTime,
            actorId: effectivePolicy.actorId,
            description: friction
              ? `Required approvals received — request approved`
              : `${thresholdCheck.currentCount}-of-${effectivePolicy.threshold.n} threshold met — request approved`,
            policyId: effectivePolicy.id,
            metadata: { outcome: "approved", thresholdMet: true },
          });
          states.push(cloneState(currentState, events.length - 1));
          return { events, states };
        }
        continue;
      }
    }

    // Check if approver is "unavailable" and delegation applies
    const isUnavailable = rng.nextBool(unavailabilityRate);
    if (isUnavailable) {
      // If friction blocks delegation, inject MANUAL_STEP and WAITING
      if (friction?.blockDelegation || !effectivePolicy.delegationAllowed || !effectivePolicy.delegateToRoleId) {
        // Inject on-unavailable manual steps
        if (friction?.manualSteps) {
          for (const step of friction.manualSteps) {
            if (step.trigger === "on-unavailable") {
              currentTime += step.delaySeconds;
              events.push({
                id: eventId(),
                type: SimulationEventType.MANUAL_STEP,
                timestamp: currentTime,
                actorId: approverId,
                policyId: effectivePolicy.id,
                description: step.description,
                metadata: { manualStep: true, trigger: step.trigger, ...tagCompliance(isFriction) },
              });
              states.push(cloneState(currentState, events.length - 1));
            }
          }
        }

        if (friction?.blockDelegation && effectivePolicy.delegationAllowed) {
          events.push({
            id: eventId(),
            type: SimulationEventType.WAITING,
            timestamp: currentTime,
            actorId: approverId,
            policyId: effectivePolicy.id,
            description: friction
              ? `${approver.label} unavailable — no backup approver on file, waiting...`
              : `${approver.label} unavailable — no delegation fallback, waiting for response...`,
            metadata: { blockedDelegation: true, ...tagCompliance(isFriction) },
          });
          currentState = cloneState(currentState, events.length - 1);
          states.push(currentState);

          // Eventually they respond (slowly)
          currentTime += rng.nextDelay(8, 25);
          const willApprove = rng.nextBool(approvalProbability);
          if (willApprove) {
            events.push({
              id: eventId(),
              type: SimulationEventType.APPROVED,
              timestamp: currentTime,
              actorId: approverId,
              policyId: effectivePolicy.id,
              description: `${approver.label} approved (delayed response)`,
              metadata: { delayed: true },
            });
            currentState = cloneState(currentState, events.length - 1);
            currentState.approvals[approverId] = {
              approved: true,
              actorId: approverId,
              timestamp: currentTime,
            };
            approvalCount++;
            states.push(currentState);
          } else {
            denied = true;
            events.push({
              id: eventId(),
              type: SimulationEventType.DENIED,
              timestamp: currentTime,
              actorId: approverId,
              policyId: effectivePolicy.id,
              description: `${approver.label} denied the request (delayed response)`,
              metadata: { delayed: true },
            });
            currentState = cloneState(currentState, events.length - 1);
            currentState.approvals[approverId] = {
              approved: false,
              actorId: approverId,
              timestamp: currentTime,
            };
            states.push(currentState);
          }
        } else {
          // Original behavior: unavailable but no delegation configured
          const willApprove = rng.nextBool(approvalProbability);
          if (willApprove) {
            events.push({
              id: eventId(),
              type: SimulationEventType.APPROVED,
              timestamp: currentTime,
              actorId: approverId,
              policyId: effectivePolicy.id,
              description: `${approver.label} approved`,
              metadata: {},
            });
            currentState = cloneState(currentState, events.length - 1);
            currentState.approvals[approverId] = {
              approved: true,
              actorId: approverId,
              timestamp: currentTime,
            };
            approvalCount++;
            states.push(currentState);
          } else {
            denied = true;
            events.push({
              id: eventId(),
              type: SimulationEventType.DENIED,
              timestamp: currentTime,
              actorId: approverId,
              policyId: effectivePolicy.id,
              description: `${approver.label} denied the request`,
              metadata: {},
            });
            currentState = cloneState(currentState, events.length - 1);
            currentState.approvals[approverId] = {
              approved: false,
              actorId: approverId,
              timestamp: currentTime,
            };
            states.push(currentState);
          }
        }
      } else {
        // Delegation path (original behavior)
        const delegateId = effectivePolicy.delegateToRoleId;
        const delegationResult = evaluateDelegation(effectivePolicy, approverId, delegateId);

        if (delegationResult.allowed) {
          const delegate = findActor(actors, delegateId);
          if (delegate) {
            events.push({
              id: eventId(),
              type: SimulationEventType.DELEGATED,
              timestamp: currentTime,
              actorId: approverId,
              targetActorId: delegateId,
              policyId: effectivePolicy.id,
              description: `${approver.label} delegates to ${delegate.label} (${approver.label} unavailable)`,
              metadata: { delegatorId: approverId, delegateId },
            });
            currentState = cloneState(currentState, events.length - 1);
            currentState.delegations.push({
              fromId: approverId,
              toId: delegateId,
              timestamp: currentTime,
            });
            states.push(currentState);

            // Delegate approves
            currentTime += rng.nextDelay(2, 8);
            events.push({
              id: eventId(),
              type: SimulationEventType.APPROVED,
              timestamp: currentTime,
              actorId: delegateId,
              policyId: effectivePolicy.id,
              description: `${delegate.label} approved (acting as delegate for ${approver.label})`,
              metadata: { delegatedFrom: approverId },
            });
            currentState = cloneState(currentState, events.length - 1);
            // Count delegate approval under the original approver's slot
            currentState.approvals[approverId] = {
              approved: true,
              actorId: delegateId,
              timestamp: currentTime,
            };
            approvalCount++;
            states.push(currentState);
          }
        }
      }
    } else {
      // Normal approval or denial
      const willApprove = rng.nextBool(approvalProbability);

      if (willApprove) {
        events.push({
          id: eventId(),
          type: SimulationEventType.APPROVED,
          timestamp: currentTime,
          actorId: approverId,
          policyId: effectivePolicy.id,
          description: `${approver.label} approved`,
          metadata: {},
        });
        currentState = cloneState(currentState, events.length - 1);
        currentState.approvals[approverId] = {
          approved: true,
          actorId: approverId,
          timestamp: currentTime,
        };
        approvalCount++;
        states.push(currentState);
      } else {
        denied = true;
        events.push({
          id: eventId(),
          type: SimulationEventType.DENIED,
          timestamp: currentTime,
          actorId: approverId,
          policyId: effectivePolicy.id,
          description: `${approver.label} denied the request`,
          metadata: {},
        });
        currentState = cloneState(currentState, events.length - 1);
        currentState.approvals[approverId] = {
          approved: false,
          actorId: approverId,
          timestamp: currentTime,
        };
        states.push(currentState);
      }
    }

    // Check threshold after each approval
    const thresholdResult = evaluateThreshold(effectivePolicy, currentState.approvals);
    if (thresholdResult.met) {
      currentState.isFinalized = true;
      currentState.outcome = "approved";
      events.push({
        id: eventId(),
        type: SimulationEventType.FINALIZED,
        timestamp: currentTime,
        actorId: effectivePolicy.actorId,
        description: friction
          ? `Required approvals received — request approved`
          : `${thresholdResult.currentCount}-of-${effectivePolicy.threshold.n} threshold met — request approved`,
        policyId: effectivePolicy.id,
        metadata: { outcome: "approved", thresholdMet: true },
      });
      states.push(cloneState(currentState, events.length - 1));
      return { events, states };
    }
  }

  // All approvers processed, threshold not met
  currentState.isFinalized = true;
  currentState.outcome = denied ? "denied" : approvalCount >= effectivePolicy.threshold.k ? "approved" : "denied";

  events.push({
    id: eventId(),
    type: SimulationEventType.FINALIZED,
    timestamp: currentTime,
    actorId: effectivePolicy.actorId,
    description: currentState.outcome === "approved"
      ? (friction ? `Required approvals received — request approved` : `Threshold met — request approved`)
      : (friction
          ? `Not enough approvals (${approvalCount} of ${effectivePolicy.threshold.k} needed) — request denied`
          : `Threshold not met (${approvalCount}/${effectivePolicy.threshold.k}) — request denied`),
    policyId: effectivePolicy.id,
    metadata: { outcome: currentState.outcome, approvalCount },
  });
  states.push(cloneState(currentState, events.length - 1));

  return { events, states };
}
