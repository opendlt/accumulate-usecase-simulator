import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const trialProtocolScenario: ScenarioTemplate = {
  id: "healthcare-trial-protocol",
  name: "Clinical Trial Protocol Amendment Governance",
  description:
    "A Sponsor Medical Monitor initiates a protocol amendment modifying the dosing regimen for a Phase II clinical trial at a research hospital investigator site. The amendment requires site-level PI acceptance and IRB approval before implementation — both are regulatory requirements under ICH E6(R2) and 21 CFR Part 56. Authorization sign-off is distributed across the sponsor's clinical portal, the site's eTMF/eISF, and the institution's IRB electronic system — three separate systems with no integrated version control or authorization status tracking. The CRO implements the amendment operationally but does not approve it. Version control fragmentation, weak electronic signatures at some sites, and disconnected audit trails across systems create compliance risks for 21 CFR Part 11 and FDA BIMO inspection readiness.",
  icon: "Heartbeat",
  industryId: "healthcare",
  archetypeId: "multi-party-approval",
  prompt:
    "What happens when a protocol amendment requires site PI acceptance and IRB approval but authorization status is tracked across three disconnected systems, electronic signatures don't meet 21 CFR Part 11 standards, and version control is fragmented between the sponsor portal, site eTMF, and IRB system?",
  actors: [
    {
      id: "research-hospital",
      type: NodeType.Organization,
      label: "Research Hospital",
      parentId: null,
      organizationId: "research-hospital",
      color: "#EF4444",
    },
    {
      id: "clinical-trials-unit",
      type: NodeType.Department,
      label: "Clinical Trials Unit",
      description:
        "Manages active trial operations, site activation for protocol amendments, and coordination between investigators, CRO, and sponsor",
      parentId: "research-hospital",
      organizationId: "research-hospital",
      color: "#06B6D4",
    },
    {
      id: "irb-office",
      type: NodeType.Department,
      label: "IRB / HRPP Office",
      description:
        "Institutional Review Board and Human Research Protection Program — provides independent ethical oversight for protocol amendments per 21 CFR Part 56; operates on a biweekly or monthly meeting cycle for full board review",
      parentId: "research-hospital",
      organizationId: "research-hospital",
      color: "#06B6D4",
    },
    {
      id: "regulatory-affairs",
      type: NodeType.Department,
      label: "Regulatory Affairs",
      description:
        "Manages regulatory document submissions, 21 CFR Part 11 compliance for e-signatures in the eISF, and IND amendment correspondence with FDA",
      parentId: "research-hospital",
      organizationId: "research-hospital",
      color: "#06B6D4",
    },
    {
      id: "principal-investigator",
      type: NodeType.Role,
      label: "Principal Investigator",
      description:
        "Lead investigator responsible for site-level protocol integrity — must review and accept each protocol amendment per ICH E6(R2) Section 4.5.2 before it can be implemented at this site",
      parentId: "clinical-trials-unit",
      organizationId: "research-hospital",
      color: "#94A3B8",
    },
    {
      id: "sub-investigator",
      type: NodeType.Role,
      label: "Sub-Investigator",
      description:
        "PI-designated backup physician listed on FDA Form 1572 and site delegation log — authorized to review and accept protocol amendments when PI is unavailable per ICH E6(R2) Section 4.2.5",
      parentId: "clinical-trials-unit",
      organizationId: "research-hospital",
      color: "#94A3B8",
    },
    {
      id: "clinical-research-coordinator",
      type: NodeType.Role,
      label: "Clinical Research Coordinator",
      description:
        "Hospital-employed coordinator managing day-to-day trial operations — receives amendments, submits IRB applications, coordinates re-consent, and manages site activation",
      parentId: "clinical-trials-unit",
      organizationId: "research-hospital",
      color: "#94A3B8",
    },
    {
      id: "irb-reviewer",
      type: NodeType.Role,
      label: "IRB Designated Reviewer",
      description:
        "IRB committee member or full board — reviews and approves protocol amendments per 21 CFR 56.108(a)(4); dosing regimen changes typically require full board review, not expedited review",
      parentId: "irb-office",
      organizationId: "research-hospital",
      color: "#94A3B8",
    },
    {
      id: "reg-affairs-specialist",
      type: NodeType.Role,
      label: "Regulatory Affairs Specialist",
      description:
        "Site-level regulatory coordinator — manages regulatory binder, eISF document filing, and coordinates IND amendment correspondence with sponsor regulatory team",
      parentId: "regulatory-affairs",
      organizationId: "research-hospital",
      color: "#94A3B8",
    },
    {
      id: "sponsor-medical-monitor",
      type: NodeType.Partner,
      label: "Sponsor Medical Monitor",
      description:
        "Sponsor-side physician who initiates protocol amendments based on safety data, DSMB recommendations, or regulatory authority requests — the amendment has already been reviewed and approved internally by the sponsor before distribution to sites",
      parentId: null,
      organizationId: "sponsor",
      color: "#F59E0B",
    },
    {
      id: "cro",
      type: NodeType.Partner,
      label: "CRO (Contract Research Organization)",
      description:
        "External organization contracted by the sponsor to manage trial operations — reviews amendments for operational impact (CRF changes, monitoring plan updates) and implements sponsor decisions; does NOT approve protocol amendments",
      parentId: null,
      organizationId: "cro",
      color: "#F59E0B",
    },
    {
      id: "etmf-system",
      type: NodeType.System,
      label: "eTMF / eISF System",
      description:
        "Electronic Trial Master File and electronic Investigator Site File (Veeva Vault, Florence eBinders) — document repository for protocol amendments, PI signatures, IRB approval letters, and regulatory correspondence; Part 11-compliant e-signatures for document sign-off",
      parentId: "research-hospital",
      organizationId: "research-hospital",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-trial-protocol",
      // Policy attached to the Clinical Trials Unit — site-level amendment governance
      actorId: "clinical-trials-unit",
      // 2-of-2 threshold: both PI and IRB must approve (both are mandatory)
      // Supplementary verification from Regulatory Affairs Specialist is operational, not governance
      threshold: {
        k: 2,
        n: 2,
        approverRoleIds: ["principal-investigator", "irb-reviewer"],
      },
      // Mandatory approvers: PI and IRB approval cannot be bypassed
      mandatoryApprovers: ["principal-investigator", "irb-reviewer"],
      // 21-day authority window — represents the realistic amendment review cycle
      // Real-world: IRB review alone can take 14-28 days depending on meeting cadence
      expirySeconds: 259200, // 3 days in simulation; represents 21-day real-world cycle
      delegationAllowed: true,
      // PI delegates to Sub-Investigator (physician on FDA Form 1572 and delegation log)
      delegateToRoleId: "sub-investigator",
      delegationConstraints:
        "PI delegates amendment review to Sub-Investigator listed on FDA Form 1572 and site delegation of authority log per ICH E6(R2) Section 4.2.5; Sub-I must have medical qualifications to assess clinical implications of the dosing regimen change",
      // Escalation: if both PI and Sub-I are unavailable for 48 hours (20 sim seconds),
      // escalate to the site's Department Head / Division Chief
      escalation: { afterSeconds: 20, toRoleIds: ["reg-affairs-specialist"] },
    },
  ],
  edges: [
    { sourceId: "research-hospital", targetId: "clinical-trials-unit", type: "authority" },
    { sourceId: "research-hospital", targetId: "irb-office", type: "authority" },
    { sourceId: "research-hospital", targetId: "regulatory-affairs", type: "authority" },
    { sourceId: "research-hospital", targetId: "etmf-system", type: "authority" },
    { sourceId: "clinical-trials-unit", targetId: "principal-investigator", type: "authority" },
    { sourceId: "clinical-trials-unit", targetId: "sub-investigator", type: "authority" },
    { sourceId: "clinical-trials-unit", targetId: "clinical-research-coordinator", type: "authority" },
    { sourceId: "irb-office", targetId: "irb-reviewer", type: "authority" },
    { sourceId: "regulatory-affairs", targetId: "reg-affairs-specialist", type: "authority" },
    // Delegation edge: PI delegates amendment review to Sub-Investigator
    { sourceId: "principal-investigator", targetId: "sub-investigator", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Protocol amendment with 21 CFR Part 11 authorization tracking",
    initiatorRoleId: "sponsor-medical-monitor",
    targetAction:
      "Site-Level Protocol Amendment Acceptance with Cross-System Authorization Tracking",
    description:
      "Sponsor Medical Monitor distributes a protocol amendment modifying the dosing regimen. Site-level governance requires PI acceptance (ICH E6(R2) Section 4.5.2) and IRB approval (21 CFR 56.108(a)(4)) before implementation. Today, authorization status is tracked across three disconnected systems: sponsor clinical portal, site eTMF/eISF, and IRB electronic system. E-signatures are inconsistently Part 11-compliant, and there is no unified view of authorization status across organizations.",
  },
  beforeMetrics: {
    // Active coordination effort: PI review (2-4 hrs), CRC admin/IRB submission (4-8 hrs),
    // IRB review (2-4 hrs), regulatory notification (2-4 hrs), site activation (4-8 hrs)
    // Total active effort: ~20-30 hours. Elapsed calendar time: 14-28 days (IRB meeting cycle)
    manualTimeHours: 40,
    // 21 days of risk exposure: time from amendment distribution to site implementation
    // During this period, enrolled subjects continue on the original dosing regimen
    // For safety-related amendments, this delay has direct patient impact
    riskExposureDays: 21,
    // 6 audit gaps:
    // (1) amendment version not controlled across sponsor portal, site eTMF, and IRB system
    // (2) e-signatures not Part 11-compliant (email confirmations, PDF annotations at some sites)
    // (3) no audit trail linking PI review to specific amendment document version
    // (4) IRB approval letter not linked to exact document version reviewed
    // (5) date/time of signature not captured per Part 11 §11.50 (printed name, date/time, meaning)
    // (6) no cryptographic verification that the signed document matches the distributed version
    auditGapCount: 6,
    // 9 steps in the amendment lifecycle:
    // (1) Sponsor distributes amendment via clinical portal
    // (2) CRC receives and logs in site eTMF
    // (3) PI reviews amendment and assesses impact on enrolled subjects
    // (4) CRC prepares and submits IRB amendment application
    // (5) IRB reviews and approves (expedited or full board)
    // (6) PI signs amended protocol in eISF
    // (7) Site activation: procedures, pharmacy manual, re-consent if applicable
    // (8) Regulatory notification: IND amendment filed with FDA if required
    // (9) CRO updates monitoring plan and CRF specifications
    approvalSteps: 9,
  },
  todayFriction: {
    ...ARCHETYPES["multi-party-approval"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        // Real-world: 1-3 days for amendment to be distributed, received, and logged at site
        description:
          "Protocol amendment distributed via sponsor clinical portal — CRC logs in site eTMF, PI reviews in separate system, IRB submission through institution's IRB electronic system — three systems with no integrated version control or authorization status tracking",
        delaySeconds: 8,
      },
      {
        trigger: "before-approval",
        // Real-world: 2-4 weeks for IRB review cycle (dependent on board meeting schedule)
        description:
          "PI reviewing amendment against current protocol and assessing impact on enrolled subjects — IRB application submitted but queued for next scheduled board meeting (biweekly/monthly cadence); e-signatures partially outside validated Part 11 systems",
        delaySeconds: 6,
      },
      {
        trigger: "on-unavailable",
        // Real-world: 1-2 weeks additional delay when PI is unavailable and no Sub-I delegation
        description:
          "PI traveling to conference — no Sub-Investigator delegation configured; amendment review stalls; CRC cannot submit IRB application without PI assessment; sign-off status tracked in shared spreadsheet across sponsor, site, and CRO",
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Sequential amendment review across disconnected systems with weak e-signatures and IRB meeting cycle delays",
  },
  todayPolicies: [
    {
      id: "policy-trial-protocol-today",
      actorId: "clinical-trials-unit",
      // Today: both PI and IRB must approve sequentially (no threshold bypass)
      // But process is sequential, not parallel — IRB submission waits for PI review
      threshold: {
        k: 2,
        n: 2,
        approverRoleIds: ["principal-investigator", "irb-reviewer"],
      },
      // Simulation-compressed: represents tight timeline pressure where delays cascade
      expirySeconds: 30,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "21 CFR Part 11",
      displayName: "21 CFR Part 11",
      clause: "Electronic Records and Electronic Signatures",
      violationDescription:
        "Protocol amendment sign-off via email confirmations and PDF annotations does not meet Part 11 requirements for electronic signatures (Section 11.50: printed name, date/time, meaning; Section 11.70: signature-record linking) or audit trails (Section 11.10(e): who, what, when, before/after values); amendment version integrity not cryptographically verified across systems",
      fineRange:
        "FDA 483 observation + potential Warning Letter; Part 11 deficiencies cited in BIMO inspection findings; systemic Part 11 failures may contribute to clinical hold or IND termination",
      severity: "critical",
      safeguardDescription:
        "Accumulate provides cryptographic authorization records that support Part 11 audit trail requirements — capturing who authorized, when, which document version (via document hash), and the authorization meaning. When integrated with validated eTMF/eISF systems, these records strengthen Part 11 compliance for the amendment approval phase",
    },
    {
      framework: "21 CFR Part 312",
      displayName: "21 CFR §312.30",
      clause: "Protocol Amendments to an IND",
      violationDescription:
        "Failure to implement protocol amendments through proper regulatory channels — amendment implemented at site before IRB approval (21 CFR 56.108(a)(4)) or before required FDA notification (21 CFR 312.30); inadequate documentation of amendment approval chain for BIMO inspection",
      fineRange:
        "FDA 483 observation + Warning Letter; repeated violations may result in clinical hold (21 CFR 312.42), IND termination (21 CFR 312.44), or investigator disqualification (21 CFR 312.70)",
      severity: "critical",
      safeguardDescription:
        "Policy-enforced mandatory approver gates ensure PI acceptance and IRB approval are verified before site implementation proceeds; cross-system authorization tracking provides a unified audit trail linking sponsor distribution, PI review, IRB approval, and site activation",
    },
    {
      framework: "ICH E6(R2)",
      displayName: "ICH E6(R2) GCP",
      clause: "Protocol Compliance (Section 4.5) and Monitoring (Section 5.18)",
      violationDescription:
        "Investigator implements protocol amendment without documented IRB approval or without proper assessment of impact on enrolled subjects; version control gaps result in site implementing a superseded amendment version; monitoring findings indicate amendment documentation not filed in eTMF per ICH E8(R1)",
      fineRange:
        "GCP non-compliance findings in sponsor audit or regulatory inspection; repeated findings may lead to site disqualification, sponsor Warning Letter, or marketing application deficiency",
      severity: "high",
      safeguardDescription:
        "Cryptographic document hash verification ensures all parties are reviewing the same amendment version; mandatory approver enforcement prevents implementation before required governance gates are satisfied; complete authorization chain filed as verifiable audit artifact in eTMF",
    },
    {
      framework: "21 CFR Part 56",
      displayName: "21 CFR Part 56",
      clause: "IRB Review of Protocol Amendments (Section 56.108(a)(4))",
      violationDescription:
        "Protocol amendment implemented at site without prior IRB review and approval — particularly for substantial changes such as dosing regimen modifications that affect participant safety; IRB approval not documented with the specific amendment version reviewed",
      fineRange:
        "FDA 483 observation citing IRB non-compliance; investigator disqualification proceedings (21 CFR 312.70); institutional corrective action requirements",
      severity: "high",
      safeguardDescription:
        "IRB approval modeled as a mandatory gate that cannot be bypassed via threshold — the policy engine will not mark the amendment as approved for implementation until IRB review is complete; authorization record links IRB approval to specific document version",
    },
  ],
  tags: [
    "healthcare",
    "clinical-trial",
    "protocol-amendment",
    "fda",
    "irb",
    "21-cfr-part-11",
    "21-cfr-part-312",
    "ich-e6-r2",
    "gcp",
    "electronic-signature",
    "etmf",
    "version-control",
    "multi-party",
    "cross-org",
  ],
};
