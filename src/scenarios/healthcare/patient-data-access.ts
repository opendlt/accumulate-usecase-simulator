import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const patientDataAccessScenario: ScenarioTemplate = {
  id: "healthcare-patient-data-access",
  name: "VIP-Restricted Record Access Governance",
  description:
    "A cardiologist consulting on a patient flagged as VIP/employee health activates EHR break-glass to access the restricted record for an urgent treatment decision. Break-glass provides immediate access — the governance gap is that break-glass events are only reviewed retrospectively in weekly batch reports, with generic reason codes that lack clinical context, audit trails siloed across EHR, IAM, and PACS, and no real-time anomaly detection for insider snooping or credential compromise. The Privacy Officer reviews break-glass logs days or weeks after the event. There is no concurrent governance verification and no after-hours governance authority coverage.",
  icon: "Heartbeat",
  industryId: "healthcare",
  archetypeId: "emergency-break-glass",
  prompt:
    "What happens when a cardiologist activates break-glass for a VIP-restricted patient record but the governance review is retrospective-only, audit trails are siloed across EHR, IAM, and PACS, and there is no concurrent verification to distinguish legitimate clinical access from insider snooping?",
  actors: [
    {
      id: "hospital",
      type: NodeType.Organization,
      label: "Metro Health Medical Center",
      parentId: null,
      organizationId: "hospital",
      color: "#EF4444",
    },
    {
      id: "cardiology",
      type: NodeType.Department,
      label: "Cardiology",
      description:
        "Consulting department — cardiologist added to patient care team via consult order, but VIP restriction blocks chart access even for care team members",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#06B6D4",
    },
    {
      id: "cardiologist",
      type: NodeType.Role,
      label: "Cardiologist",
      description:
        "Attending cardiologist on the patient's care team — activates EHR break-glass to access VIP-restricted record for urgent treatment decision",
      parentId: "cardiology",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "privacy-officer",
      type: NodeType.Role,
      label: "Privacy Officer",
      description:
        "HIPAA-designated privacy official (45 CFR §164.530(a)) — oversees break-glass event review, privacy monitoring tools, and investigation of potential unauthorized access",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "oncall-supervisor",
      type: NodeType.Role,
      label: "On-Call Administrative Supervisor",
      description:
        "After-hours governance authority — provides concurrent break-glass verification and administrative coverage outside business hours",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "cmo",
      type: NodeType.Role,
      label: "Chief Medical Officer",
      description:
        "Escalation backstop for clinical governance decisions — contacted when both Privacy Officer and On-Call Supervisor are unavailable",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "ehr-system",
      type: NodeType.System,
      label: "EHR System",
      description:
        "Electronic Health Records with role-based access control, VIP patient restriction flags, break-glass override capability, and PACS integration for radiology imaging access",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-vip-access-governance",
      // Policy attached to EHR system — VIP restriction is a system-level control, not departmental
      actorId: "ehr-system",
      // Concurrent governance verification: 1-of-2 (Privacy Officer or On-Call Supervisor)
      // Break-glass access is immediate — this policy governs the concurrent verification, not the access grant
      threshold: {
        k: 1,
        n: 2,
        approverRoleIds: ["privacy-officer", "oncall-supervisor"],
      },
      // 8-hour authority window — scoped to one clinical shift
      // Real-world: access expires at end of shift; re-request required for subsequent shifts
      expirySeconds: 28800,
      delegationAllowed: true,
      delegateToRoleId: "oncall-supervisor",
      delegationConstraints:
        "Privacy Officer delegates concurrent verification to On-Call Supervisor during off-hours; delegation is pre-configured and does not require per-event authorization",
      // Escalation to CMO if both Privacy Officer and On-Call Supervisor are unavailable
      // 20 simulation seconds ≈ 20 minutes real-world before CMO escalation
      escalation: { afterSeconds: 20, toRoleIds: ["cmo"] },
    },
  ],
  edges: [
    { sourceId: "hospital", targetId: "cardiology", type: "authority" },
    { sourceId: "hospital", targetId: "privacy-officer", type: "authority" },
    {
      sourceId: "hospital",
      targetId: "oncall-supervisor",
      type: "authority",
    },
    { sourceId: "hospital", targetId: "cmo", type: "authority" },
    { sourceId: "hospital", targetId: "ehr-system", type: "authority" },
    { sourceId: "cardiology", targetId: "cardiologist", type: "authority" },
    // Delegation edge: Privacy Officer delegates concurrent verification to On-Call Supervisor
    {
      sourceId: "privacy-officer",
      targetId: "oncall-supervisor",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "Concurrent governance verification for VIP-restricted break-glass access",
    initiatorRoleId: "cardiologist",
    targetAction:
      "Break-Glass Access to VIP-Restricted Patient Record with Concurrent Governance Verification",
    description:
      "Cardiologist activates EHR break-glass for a VIP-restricted patient record — access is granted immediately. Concurrently, Accumulate requests governance verification from the Privacy Officer (business hours) or On-Call Administrative Supervisor (after hours) to create a real-time attestation record with clinical context. Access window scoped to one clinical shift (8 hours) with automatic expiry.",
  },
  beforeMetrics: {
    // Break-glass access is immediate (seconds); the 168 hours represents the governance gap —
    // time from break-glass event to first privacy review cycle (weekly batch review)
    manualTimeHours: 168,
    // 7-day window from break-glass event to privacy review — during which unauthorized access
    // (snooping, credential compromise) is indistinguishable from legitimate clinical access
    riskExposureDays: 7,
    // 4 audit gaps: (1) generic break-glass reason codes lack clinical context,
    // (2) audit trails siloed across EHR, IAM, and PACS,
    // (3) no real-time anomaly detection for break-glass overuse or snooping patterns,
    // (4) break-glass access duration unconstrained (no automatic expiry)
    auditGapCount: 4,
    // 2 governance steps: (1) clinician activates break-glass with reason code,
    // (2) privacy team reviews batch log days/weeks later
    approvalSteps: 2,
  },
  todayFriction: {
    ...ARCHETYPES["emergency-break-glass"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        // Real-world: ~30 seconds for the clinician to click through the break-glass dialog
        description:
          "EHR VIP restriction flag blocks chart access — clinician activates break-glass, selects generic reason code from dropdown (Emergency / Treatment / Self / Patient Requested), and gains immediate access",
        delaySeconds: 12,
      },
      {
        trigger: "before-approval",
        // Real-world: 24-168 hours (1-7 days) until the privacy team reviews the break-glass log
        description:
          "Break-glass event logged in EHR with minimal context (user ID, patient ID, reason code, timestamp) — privacy team will review via weekly batch report from FairWarning/Imprivata; audit trails siloed across EHR, IAM, and PACS; no real-time anomaly detection",
        delaySeconds: 10,
      },
      {
        trigger: "on-unavailable",
        // Real-world: no after-hours governance coverage; clinician proceeds with break-glass regardless
        description:
          "No after-hours governance authority available — Privacy Officer operates business hours only; no On-Call Supervisor coverage for privacy governance; break-glass proceeds without any concurrent verification",
        delaySeconds: 6,
      },
    ],
    narrativeTemplate:
      "Break-glass self-service override with retrospective-only batch review and siloed audit trails",
  },
  todayPolicies: [
    {
      id: "policy-vip-access-today",
      actorId: "ehr-system",
      // Today: no concurrent governance verification for break-glass events
      // Break-glass is self-service; the only "approval" is the post-hoc privacy review
      // Modeled as 1-of-1 from Privacy Officer to represent the batch review step
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["privacy-officer"],
      },
      // Short expiry represents the tight review window that doesn't actually exist today
      // The privacy review happens days/weeks later, not in real time
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "HIPAA",
      displayName: "HIPAA Security Rule §164.312(a)(1) & §164.312(b)",
      clause: "Access Controls & Audit Controls",
      violationDescription:
        "Insufficient access controls and audit mechanisms for VIP-restricted ePHI — generic break-glass reason codes, siloed audit trails, and retrospective-only review enable impermissible access (snooping) to be disguised as legitimate break-glass use; failure to implement audit controls that record and examine access to ePHI as required by §164.312(b)",
      fineRange:
        "Up to $2.07M per violation category per year (2024 CPI-adjusted); Resolution Agreements typically $100K — $5.1M based on scope and duration; see UCLA Health ($865K, 2011), Shasta Regional ($275K, 2013), Memorial Hermann ($2.4M, 2017)",
      severity: "critical",
      safeguardDescription:
        "Accumulate provides concurrent governance verification alongside EHR break-glass events — real-time clinical context capture, on-call supervisor attestation, and unified cryptographic audit trail across EHR, IAM, and PACS, without blocking or delaying clinical access to PHI",
    },
    {
      framework: "HITECH",
      displayName: "HITECH Act §13402",
      clause: "Breach Notification & Enforcement",
      violationDescription:
        "Inadequate break-glass monitoring may result in undetected impermissible access (snooping) that constitutes a breach of unsecured PHI, triggering breach notification obligations under §13402 and potential OCR investigation; batch review delays reduce the ability to meet the 60-day notification deadline",
      fineRange:
        "State attorneys general may bring civil actions for HITECH violations (§13410(e)); OCR enforcement up to $2.07M per violation category per year; breach notification costs (individual notice, media notice, HHS notification) per §13402(a)-(e)",
      severity: "high",
      safeguardDescription:
        "Real-time governance verification enables immediate detection of impermissible access patterns — reducing breach detection time from weeks to minutes and supporting timely breach notification compliance",
    },
    {
      framework: "HIPAA Privacy Rule",
      displayName: "HIPAA Privacy Rule §164.530(c)",
      clause: "Administrative Safeguards for PHI",
      violationDescription:
        "Failure to implement appropriate administrative safeguards to protect VIP patient privacy — including inadequate workforce access governance, insufficient post-access review procedures, and lack of concurrent verification for break-glass events",
      fineRange:
        "Included in HIPAA penalty structure; privacy safeguard deficiencies frequently cited in OCR Resolution Agreements as contributing factors",
      severity: "high",
      safeguardDescription:
        "Policy-enforced governance workflows with pre-configured delegation paths, clinical context requirements, and automatic access expiry provide administrative safeguards that are verifiable and auditable",
    },
  ],
  tags: [
    "healthcare",
    "hipaa",
    "break-glass",
    "vip-restriction",
    "patient-privacy",
    "concurrent-verification",
    "ehr",
    "pacs",
    "privacy-monitoring",
    "audit-trail",
    "ocr-audit",
  ],
};
