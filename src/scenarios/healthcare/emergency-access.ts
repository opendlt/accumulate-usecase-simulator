import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const emergencyAccessScenario: ScenarioTemplate = {
  id: "healthcare-emergency-access",
  name: "42 CFR Part 2 Emergency Access Governance",
  description:
    "A Level I Trauma Center activates a trauma team for a multi-vehicle collision patient. The trauma team (ER physician, trauma surgeon, anesthesiologist, nurses) gains immediate access to the patient's standard medical records via care team auto-assignment. However, the patient's EHR contains 42 CFR Part 2-segmented substance use disorder treatment records from a prior opioid treatment program — these records carry federal protections stricter than HIPAA and require break-glass even for auto-assigned care team members. Each trauma team member independently activates break-glass, generating 5-8 simultaneous break-glass events. The governance gap: these events are batch-reviewed weeks later with no way to verify that each person who accessed the SUD records was actually on the trauma team at the time, no correlation of simultaneous break-glass events to a single trauma activation, and no documentation of the medical emergency exception required by 42 CFR Part 2.",
  icon: "Heartbeat",
  industryId: "healthcare",
  archetypeId: "emergency-break-glass",
  prompt:
    "What happens when a trauma team of 5-8 providers each activate break-glass for 42 CFR Part 2 SUD-restricted records but the batch review weeks later cannot correlate these events to the same trauma activation, verify each accessor was on the trauma team, or document the medical emergency exception?",
  actors: [
    {
      id: "hospital",
      type: NodeType.Organization,
      label: "City Trauma Medical Center",
      parentId: null,
      organizationId: "hospital",
      color: "#EF4444",
    },
    {
      id: "emergency-dept",
      type: NodeType.Department,
      label: "Emergency Department",
      description:
        "Level I Trauma Center emergency department — trauma activations generate multi-provider break-glass events for 42 CFR Part 2-restricted records; care team auto-assignment provides access to standard records but not SUD-segmented records",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#06B6D4",
    },
    {
      id: "trauma-team-leader",
      type: NodeType.Role,
      label: "Trauma Team Leader",
      description:
        "Attending trauma surgeon or ER attending directing the resuscitation — knows which team members are clinically necessary and can verify the treatment relationship for 42 CFR Part 2 medical emergency access",
      parentId: "emergency-dept",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "er-physician",
      type: NodeType.Role,
      label: "ER Physician",
      description:
        "Emergency medicine physician on the trauma team — activates break-glass for 42 CFR Part 2-segmented SUD treatment records when the patient's substance use history is clinically relevant to trauma resuscitation (e.g., methadone interactions with anesthesia, overdose risk)",
      parentId: "emergency-dept",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "oncall-supervisor",
      type: NodeType.Role,
      label: "On-Call Administrative Supervisor",
      // Hospital-wide role, NOT an ED-specific role — covers all departments after hours
      description:
        "Hospital-wide after-hours administrative authority — currently handles operational and staffing decisions but does not participate in break-glass governance; Accumulate expands this role to include concurrent governance verification for 42 CFR Part 2 break-glass events",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "privacy-officer",
      type: NodeType.Role,
      label: "Privacy Officer",
      description:
        "HIPAA-designated privacy official (45 CFR Section 164.530(a)) — reviews break-glass events via privacy monitoring tools (FairWarning/Protenus risk scoring); manages 42 CFR Part 2 compliance for emergency SUD record access; currently relies on weekly batch reports with no ability to correlate multi-provider break-glass events to a single trauma activation",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "cmo",
      type: NodeType.Role,
      label: "Chief Medical Officer",
      description:
        "Senior clinical governance authority — escalation backstop when both Privacy Officer and On-Call Supervisor are unavailable; makes clinical appropriateness determination for 42 CFR Part 2 emergency access",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "ehr-system",
      type: NodeType.System,
      label: "EHR System",
      description:
        "Electronic Health Records with role-based access control, 42 CFR Part 2 SUD record segmentation, break-glass override capability, trauma activation care team auto-assignment, and audit logging with limited clinical context capture",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-sud-emergency-access",
      // Policy attached to EHR system — 42 CFR Part 2 segmentation is a system-level control
      actorId: "ehr-system",
      // Concurrent governance verification: 1-of-2 (Privacy Officer or On-Call Supervisor)
      // Break-glass access is immediate — this policy governs the concurrent verification, not the access grant
      // For trauma team access: a single verification covers the entire team for the activation event
      threshold: {
        k: 1,
        n: 2,
        approverRoleIds: ["privacy-officer", "oncall-supervisor"],
      },
      // 12-hour authority window — scoped to one trauma team shift rotation
      // Real-world: trauma teams typically work 12-hour shifts; access expires at end of shift
      // Re-request required for subsequent shifts or team handoffs
      expirySeconds: 43200,
      delegationAllowed: true,
      delegateToRoleId: "oncall-supervisor",
      delegationConstraints:
        "Privacy Officer delegates concurrent verification to On-Call Supervisor during off-hours; delegation is pre-configured and does not require per-event authorization; On-Call Supervisor verification includes Trauma Team Leader attestation of team composition",
      // Escalation to CMO if both Privacy Officer and On-Call Supervisor are unavailable
      // 10 simulation seconds ~ 10 minutes real-world; faster than VIP scenario due to multi-provider trauma urgency
      escalation: { afterSeconds: 10, toRoleIds: ["cmo"] },
    },
  ],
  edges: [
    { sourceId: "hospital", targetId: "emergency-dept", type: "authority" },
    { sourceId: "hospital", targetId: "privacy-officer", type: "authority" },
    { sourceId: "hospital", targetId: "oncall-supervisor", type: "authority" },
    { sourceId: "hospital", targetId: "cmo", type: "authority" },
    { sourceId: "hospital", targetId: "ehr-system", type: "authority" },
    {
      sourceId: "emergency-dept",
      targetId: "trauma-team-leader",
      type: "authority",
    },
    { sourceId: "emergency-dept", targetId: "er-physician", type: "authority" },
    // Delegation edge: Privacy Officer delegates concurrent verification to On-Call Supervisor
    {
      sourceId: "privacy-officer",
      targetId: "oncall-supervisor",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "Concurrent governance verification for 42 CFR Part 2 trauma team break-glass access",
    initiatorRoleId: "er-physician",
    targetAction:
      "Multi-Provider Break-Glass Access to 42 CFR Part 2 SUD Records During Trauma Activation with Concurrent Governance Verification",
    description:
      "Trauma team activates EHR break-glass for 42 CFR Part 2-segmented SUD records during trauma resuscitation — each team member gains immediate access. Concurrently, Accumulate correlates all break-glass events to the trauma activation, requests governance verification from the Privacy Officer (business hours) or On-Call Supervisor (after hours), and captures the Trauma Team Leader's attestation of team composition. A single verification covers the entire team for the activation event. 42 CFR Part 2 medical emergency exception is documented with clinical context. 12-hour authority window scoped to one trauma team shift.",
  },
  beforeMetrics: {
    // 336 hours = 14 days = 2 weeks; represents the governance gap for multi-provider
    // SUD record access events — longer than standard break-glass review (168 hours)
    // because 42 CFR Part 2 compliance review requires additional investigation steps:
    // (1) verify each team member was on the trauma team at time of access,
    // (2) confirm medical emergency exception documentation,
    // (3) verify no redisclosure of SUD information occurred
    manualTimeHours: 336,
    // 14-day window from break-glass to SUD-specific compliance review —
    // longer than VIP break-glass (7 days) because 42 CFR Part 2 investigation
    // involves SAMHSA compliance framework in addition to HIPAA
    riskExposureDays: 14,
    // 5 audit gaps specific to multi-provider SUD record access:
    // (1) break-glass reason codes do not capture 42 CFR Part 2 medical emergency justification,
    // (2) no correlation of simultaneous break-glass events to a single trauma activation,
    // (3) no verification that each accessor was on the trauma team at time of access,
    // (4) audit trails siloed across EHR, IAM, and behavioral health module,
    // (5) no documentation of redisclosure restrictions per 42 CFR Part 2
    auditGapCount: 5,
    // 2 governance steps: (1) each team member activates individual break-glass with reason code,
    // (2) privacy team batch-reviews all events weeks later (but cannot correlate to single activation)
    // Note: the multiplied volume (5-8 events per activation) is the governance challenge, not the step count
    approvalSteps: 2,
  },
  todayFriction: {
    ...ARCHETYPES["emergency-break-glass"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        // Real-world: ~30 seconds per team member to click through break-glass dialog
        // For a 6-person trauma team, this is ~3 minutes of aggregate interaction time
        // Each individual access is immediate — no delay to patient care
        description:
          "Trauma team members individually activate break-glass for 42 CFR Part 2-segmented SUD records — each selects generic reason code ('Emergency') and gains immediate access; 5-8 separate break-glass events generated for one trauma activation with no system-level correlation",
        delaySeconds: 12,
      },
      {
        trigger: "on-unavailable",
        // Real-world: 42 CFR Part 2 medical emergency exception requires documentation
        // that a bona fide medical emergency exists and patient cannot consent —
        // today this documentation is a free-text note in the EHR, often completed retroactively
        description:
          "Break-glass events logged in EHR with minimal context — reason code only, no 42 CFR Part 2 medical emergency documentation, no trauma activation correlation, no care team roster verification; SUD record access appears as 5-8 unrelated break-glass events in the weekly batch report",
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        // Real-world: 7-14 days until the privacy team reviews the break-glass batch report;
        // additional 7-14 days for 42 CFR Part 2-specific compliance investigation
        description:
          "Privacy Officer batch-reviews break-glass logs weekly — must manually correlate 5-8 individual events to the same trauma activation, contact Trauma Team Leader to verify team composition, confirm medical emergency exception documentation, and verify no redisclosure of SUD information; investigation takes 2-4 weeks per multi-provider event",
        delaySeconds: 6,
      },
    ],
    narrativeTemplate:
      "Multi-provider break-glass with uncorrelated events, no 42 CFR Part 2 emergency documentation, and 2-4 week retrospective investigation",
  },
  todayPolicies: [
    {
      id: "policy-sud-access-today",
      actorId: "ehr-system",
      // Today: no concurrent governance for SUD record break-glass events
      // Break-glass is self-service; the only governance is the post-hoc Privacy Officer review
      // Modeled as 1-of-1 from Privacy Officer to represent the batch review step
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["privacy-officer"],
      },
      // Short expiry represents the lack of real-time governance
      // Actual break-glass access duration is unconstrained today
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "42 CFR Part 2",
      displayName: "42 CFR Part 2 (SUD Record Confidentiality)",
      clause: "Medical Emergency Exception (Section 2.51) & Consent Requirements (Section 2.31)",
      violationDescription:
        "Disclosure of 42 CFR Part 2-protected SUD treatment records without patient consent or documentation of a bona fide medical emergency — Part 2 is MORE restrictive than HIPAA and prohibits disclosure even within the same covered entity without consent; the medical emergency exception (Section 2.51) permits disclosure only when: (a) an immediate threat to health exists, (b) the patient is unable to consent, and (c) disclosure is limited to treating providers; inadequate documentation of the emergency exception converts permitted emergency access into an unauthorized disclosure",
      fineRange:
        "Up to $500 first offense, $5,000 subsequent offenses under 42 CFR Section 2.4; SAMHSA 2024 Final Rule subjects Part 2 violations to HIPAA enforcement tiers (up to $2.07M per violation category per year) when the disclosure also constitutes a HIPAA violation",
      severity: "critical",
      safeguardDescription:
        "Accumulate provides concurrent governance verification alongside emergency SUD record access — automatically documents the 42 CFR Part 2 medical emergency exception, correlates multi-provider break-glass events to the trauma activation, captures Trauma Team Leader attestation of team composition, and creates a unified audit trail that satisfies both Part 2 and HIPAA audit requirements, without blocking or delaying clinical access",
    },
    {
      framework: "HIPAA",
      displayName: "HIPAA Security Rule Section 164.312(a)(2)(ii) & Section 164.312(b)",
      clause: "Emergency Access Procedure & Audit Controls",
      violationDescription:
        "Insufficient emergency access procedures and audit controls for SUD-segmented ePHI — break-glass events logged with generic reason codes that do not capture 42 CFR Part 2 medical emergency justification; multi-provider break-glass events uncorrelated in audit trail; no mechanism to verify that each accessor had a treatment relationship with the patient at the time of access; failure to implement audit controls that record and examine access to ePHI as required by Section 164.312(b)",
      fineRange:
        "Up to $2.07M per violation category per year (2024 CPI-adjusted); Resolution Agreements for access control failures typically $100K-$5.1M; see UCLA Health ($865K, 2011), Memorial Hermann ($2.4M, 2017)",
      severity: "critical",
      safeguardDescription:
        "Concurrent governance verification satisfies the emergency access procedure requirement (Section 164.312(a)(2)(ii)) by providing documented emergency access with clinical context — access remains immediate while the governance layer captures treatment relationship verification, team composition attestation, and 42 CFR Part 2 emergency exception documentation in a unified, cryptographically signed audit trail",
    },
    {
      framework: "EMTALA",
      displayName: "EMTALA (42 USC Section 1395dd)",
      clause: "Emergency Screening & Stabilization Obligation",
      violationDescription:
        "Any access governance mechanism that delays emergency screening or stabilization treatment creates EMTALA liability — if a trauma team member cannot access clinically relevant SUD treatment records (e.g., methadone dosing, buprenorphine interactions with anesthesia) due to access restrictions, and the patient suffers harm, the hospital faces EMTALA liability for failure to stabilize",
      fineRange:
        "Up to $119,942 per violation (2024 CPI-adjusted) for hospitals; up to $119,942 per violation for physicians; Medicare provider agreement termination; private right of action for patient harm",
      severity: "high",
      safeguardDescription:
        "Accumulate operates concurrently with EHR break-glass — access to SUD records is NEVER delayed or blocked; the governance verification runs alongside the clinical access, creating a compliance record without any impact on emergency treatment delivery; EMTALA obligations are fully preserved",
    },
  ],
  tags: [
    "healthcare",
    "42-cfr-part-2",
    "sud-records",
    "hipaa",
    "emtala",
    "break-glass",
    "trauma-activation",
    "multi-provider",
    "emergency-access",
    "concurrent-verification",
    "samhsa",
    "audit-trail",
  ],
};
