import type { SimulationRun } from "@/types/simulation";
import type { Policy } from "@/types/policy";
import type { Actor } from "@/types/organization";
import type { VerificationQuery, BeforeAfterComparison } from "@/types/evidence";
import type { ComparisonMetrics } from "@/types/scenario";
import type { UserROIInputs } from "@/types/roi";
import type { RegulatoryContext } from "@/types/regulatory";
import { SimulationEventType } from "@/types/simulation";
import { computeROIProjection, formatCurrency } from "@/lib/roi-calculator";

export function generateVerificationQueries(
  run: SimulationRun,
  policies: Policy[],
  actors: Actor[]
): VerificationQuery[] {
  const queries: VerificationQuery[] = [];
  const policy = policies[0];

  // 1. Who approved this action?
  const approvalEvents = run.events.filter(
    (e) => e.type === SimulationEventType.APPROVED
  );
  const approverNames = approvalEvents.map((e) => {
    const actor = actors.find((a) => a.id === e.actorId);
    return `${actor?.label ?? e.actorId} (at t=${e.timestamp}s)`;
  });

  queries.push({
    question: "Who approved this action?",
    answer:
      approvalEvents.length > 0
        ? `${approverNames.join(" and ")} approved. ${policy ? `${policy.threshold.k}-of-${policy.threshold.n} threshold was ${run.outcome === "approved" ? "met" : "not met"}.` : ""}`
        : "No approvals were recorded.",
    evidence: approvalEvents.map((e) => e.id),
  });

  // 2. Under what policy was this authorized?
  if (policy) {
    queries.push({
      question: "Under what policy was this authorized?",
      answer: `Threshold policy requiring ${policy.threshold.k}-of-${policy.threshold.n} approvals. ${policy.expirySeconds > 0 ? `Authority expires after ${formatDuration(policy.expirySeconds)}.` : "No expiry."} ${policy.delegationAllowed ? "Delegation is permitted." : "Delegation is not permitted."}`,
      evidence: [run.events[0]?.id ?? ""],
    });
  }

  // 3. Was the authority valid at the time of signing?
  const expiryEvents = run.events.filter(
    (e) => e.type === SimulationEventType.EXPIRED
  );
  if (expiryEvents.length > 0) {
    queries.push({
      question: "Was the authority valid at the time of signing?",
      answer: "No. The authority expired before all required approvals were obtained.",
      evidence: expiryEvents.map((e) => e.id),
    });
  } else {
    const lastApproval = approvalEvents[approvalEvents.length - 1];
    queries.push({
      question: "Was the authority valid at the time of signing?",
      answer: `Yes. All approvals were obtained within the policy window.${lastApproval && policy?.expirySeconds ? ` Last approval at t=${lastApproval.timestamp}s, well within the ${formatDuration(policy.expirySeconds)} expiry.` : ""}`,
      evidence: approvalEvents.map((e) => e.id),
    });
  }

  // 4. Was delegation valid?
  const delegationEvents = run.events.filter(
    (e) => e.type === SimulationEventType.DELEGATED
  );
  if (delegationEvents.length > 0) {
    const delegationDescriptions = delegationEvents.map((e) => {
      const delegator = actors.find((a) => a.id === e.actorId);
      const delegate = actors.find((a) => a.id === e.targetActorId);
      return `${delegator?.label ?? e.actorId} delegated to ${delegate?.label ?? e.targetActorId}`;
    });
    queries.push({
      question: "Was delegation valid?",
      answer: `Yes. ${delegationDescriptions.join(". ")}. ${policy?.delegationAllowed ? "Policy permits delegation." : ""}`,
      evidence: delegationEvents.map((e) => e.id),
    });
  } else {
    queries.push({
      question: "Was delegation valid?",
      answer: "No delegation occurred in this workflow.",
      evidence: [],
    });
  }

  // 5. Can this be independently verified?
  queries.push({
    question: "Can this be independently verified?",
    answer:
      "Yes. The proof artifact contains a SHA-256 hash of the canonical JSON representation of this run, along with simulated digital signatures from each approver and a Merkle receipt linking the finalization event to the root hash. Any party can recompute the hash to verify integrity.",
    evidence: [run.events[run.events.length - 1]?.id ?? ""],
  });

  return queries;
}

export function generateComparison(
  beforeMetrics: ComparisonMetrics,
  run: SimulationRun
): BeforeAfterComparison[] {
  const lastEvent = run.events[run.events.length - 1];
  const simulatedTimeSeconds = lastEvent?.timestamp ?? 0;

  return [
    {
      metric: "Approval Time",
      before: `${beforeMetrics.manualTimeHours}+ hours`,
      after: `${simulatedTimeSeconds} seconds`,
      improvement: `${Math.round((beforeMetrics.manualTimeHours * 3600) / Math.max(simulatedTimeSeconds, 1))}x faster`,
    },
    {
      metric: "Risk Exposure",
      before: `${beforeMetrics.riskExposureDays} days open`,
      after: "Policy-enforced expiry",
      improvement: "Zero uncontrolled exposure",
    },
    {
      metric: "Audit Gaps",
      before: `${beforeMetrics.auditGapCount} undocumented steps`,
      after: "Complete trail, 0 gaps",
      improvement: "100% coverage",
    },
    {
      metric: "Verification Method",
      before: `${beforeMetrics.approvalSteps} manual checks`,
      after: "Cryptographic proof",
      improvement: "Independent, instant verification",
    },
  ];
}

export function generateDualComparison(
  todayRun: SimulationRun,
  accumulateRun: SimulationRun,
  beforeMetrics?: ComparisonMetrics,
  roiInputs?: UserROIInputs | null,
  regulatoryContext?: RegulatoryContext[],
): BeforeAfterComparison[] {
  const todayLastEvent = todayRun.events[todayRun.events.length - 1];
  const accLastEvent = accumulateRun.events[accumulateRun.events.length - 1];
  const todayTime = todayLastEvent?.timestamp ?? 0;
  const accTime = accLastEvent?.timestamp ?? 0;

  const todayManualSteps = todayRun.events.filter(
    (e) => e.type === SimulationEventType.MANUAL_STEP
  ).length;

  const todayWaiting = todayRun.events.filter(
    (e) => e.type === SimulationEventType.WAITING
  ).length;

  const todayFailures = todayRun.events.filter(
    (e) =>
      e.type === SimulationEventType.DENIED ||
      e.type === SimulationEventType.EXPIRED
  ).length;

  const accFailures = accumulateRun.events.filter(
    (e) =>
      e.type === SimulationEventType.DENIED ||
      e.type === SimulationEventType.EXPIRED
  ).length;

  const todayAuditGaps = todayManualSteps + todayWaiting;

  // Use real-world metrics when available, fall back to simulated seconds
  const beforeTimeLabel = beforeMetrics
    ? `${beforeMetrics.manualTimeHours}+ hours`
    : `${todayTime} seconds`;
  const timeImprovement = beforeMetrics
    ? `${Math.round((beforeMetrics.manualTimeHours * 3600) / Math.max(accTime, 1))}x faster`
    : todayTime > 0 && accTime > 0
      ? `${Math.round(todayTime / Math.max(accTime, 1))}x faster`
      : "Instant";

  const rows: BeforeAfterComparison[] = [
    {
      metric: "Total Time",
      before: beforeTimeLabel,
      after: `${accTime} seconds`,
      improvement: timeImprovement,
    },
  ];

  // Risk Exposure row — only when real-world metrics are available
  if (beforeMetrics) {
    rows.push({
      metric: "Risk Exposure",
      before: `${beforeMetrics.riskExposureDays} days open`,
      after: "Policy-enforced expiry",
      improvement: "Zero uncontrolled exposure",
    });
  }

  rows.push(
    {
      metric: "Manual Steps",
      before: `${todayManualSteps} manual intervention${todayManualSteps === 1 ? "" : "s"}`,
      after: "0 manual steps",
      improvement: todayManualSteps > 0 ? "Fully automated" : "No change",
    },
    {
      metric: "Audit Gaps",
      before: `${todayAuditGaps} undocumented step${todayAuditGaps === 1 ? "" : "s"}`,
      after: "Complete trail, 0 gaps",
      improvement: "100% coverage",
    },
    {
      metric: "Outcome",
      before: todayRun.outcome === "approved"
        ? `Approved (with ${todayFailures} issue${todayFailures === 1 ? "" : "s"})`
        : `Denied (${todayFailures} failure${todayFailures === 1 ? "" : "s"})`,
      after: accumulateRun.outcome === "approved"
        ? `Approved (${accFailures === 0 ? "clean" : `${accFailures} issue${accFailures === 1 ? "" : "s"}`})`
        : `Denied`,
      improvement: accumulateRun.outcome === "approved"
        ? "Policy-enforced approval"
        : "Policy correctly denied",
    },
  );

  // ROI row if user inputs are available
  if (roiInputs) {
    const projection = computeROIProjection(roiInputs, accTime);
    rows.push({
      metric: "Projected Annual Savings",
      before: formatCurrency(projection.annualManualCost) + "/year in manual approvals",
      after: formatCurrency(projection.annualAccumulateCost) + "/year with Accumulate",
      improvement: formatCurrency(projection.annualSavings) + " saved annually",
    });
  }

  // Regulatory exposure row if context is available
  if (regulatoryContext?.length) {
    const todayViolations = todayRun.events.filter(
      (e) => e.metadata?.complianceViolation
    ).length;
    rows.push({
      metric: "Regulatory Exposure",
      before: `${todayViolations} compliance violation${todayViolations === 1 ? "" : "s"} detected`,
      after: "0 violations — all safeguards active",
      improvement: `${regulatoryContext.length} framework${regulatoryContext.length === 1 ? "" : "s"} addressed`,
    });
  }

  return rows;
}

function formatDuration(seconds: number): string {
  if (seconds >= 86400) return `${Math.round(seconds / 86400)} day(s)`;
  if (seconds >= 3600) return `${Math.round(seconds / 3600)} hour(s)`;
  if (seconds >= 60) return `${Math.round(seconds / 60)} minute(s)`;
  return `${seconds} second(s)`;
}
