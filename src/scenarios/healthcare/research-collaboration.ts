import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const researchCollaborationScenario: ScenarioTemplate = {
  id: "healthcare-research-collaboration",
  name: "Secure Multi-Institution Research Data Sharing",
  description:
    "A principal investigator at State University requests access to a limited data set from the Academic Medical Center for a federally funded, IRB-approved multi-institution study. Governance is fragmented across the HRPP/IRB office, the Research Data Governance office, legal counsel, and the Privacy Officer — each operating in separate systems with no shared workflow. The DUA must be negotiated between legal offices, the Privacy Officer must validate the limited data set preparation methodology, and the Data Governance Director must approve the institutional data release. These processes run in silos, often sequentially by default rather than by design. Cross-institutional auditability is limited, and data provenance is lost after transfer.",
  icon: "Heartbeat",
  industryId: "healthcare",
  archetypeId: "cross-org-boundary",
  prompt:
    "What happens when a multi-institution research data sharing request requires parallel governance approvals from separate institutional offices (IRB, legal, privacy, data governance) but these offices operate in silos with no shared workflow, and a key approver is unavailable?",
  actors: [
    {
      id: "hospital",
      type: NodeType.Organization,
      label: "Academic Medical Center",
      parentId: null,
      organizationId: "hospital",
      color: "#EF4444",
    },
    {
      id: "university",
      type: NodeType.Partner,
      label: "State University",
      description:
        "External academic research partner requesting limited data set access for a federally funded, IRB-approved study",
      parentId: null,
      organizationId: "university",
      color: "#8B5CF6",
    },
    {
      id: "hrpp-office",
      type: NodeType.Department,
      label: "HRPP / IRB Office",
      description:
        "Human Research Protection Program — manages IRB protocol submissions, reviews, and determinations; the IRB is a federally mandated committee within this office",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#06B6D4",
    },
    {
      id: "data-governance",
      type: NodeType.Department,
      label: "Research Data Governance",
      description:
        "Manages institutional data access requests, data use agreements, honest broker services, and research data releases",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#06B6D4",
    },
    {
      id: "data-governance-director",
      type: NodeType.Role,
      label: "Data Governance Director",
      description:
        "Director of Research Data Governance — reviews and approves institutional data access requests, coordinates DUA lifecycle with legal counsel, and oversees honest broker operations",
      parentId: "data-governance",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "privacy-officer",
      type: NodeType.Role,
      label: "Privacy Officer",
      description:
        "HIPAA Privacy Officer — validates limited data set preparation methodology, reviews de-identification compliance under HIPAA Safe Harbor or Expert Determination, and approves waivers of authorization when required",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "deputy-privacy-officer",
      type: NodeType.Role,
      label: "Deputy Privacy Officer",
      description:
        "Designated backup for the Privacy Officer — authorized to perform HIPAA privacy validation and waiver of authorization review during Privacy Officer absence",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "legal-counsel",
      type: NodeType.Role,
      label: "Research Legal Counsel",
      description:
        "Office of General Counsel — negotiates and executes data use agreements, reviews liability and indemnification terms, and ensures institutional legal protections for research data sharing",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "data-custodian",
      type: NodeType.Role,
      label: "Data Custodian / Honest Broker",
      description:
        "Extracts data from the clinical data warehouse, applies limited data set preparation per validated methodology, and executes the data release after all governance approvals are obtained",
      parentId: "data-governance",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "university-pi",
      type: NodeType.Role,
      label: "Principal Investigator",
      description:
        "Lead researcher at State University requesting limited data set access from the Academic Medical Center for a federally funded, IRB-approved multi-institution study",
      parentId: "university",
      organizationId: "university",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      // Data governance approval: 1-of-2 authorized reviewers can approve
      // This models the threshold benefit — Data Governance Director or designated backup
      id: "policy-data-governance-approval",
      actorId: "data-governance",
      threshold: {
        k: 1,
        n: 2,
        approverRoleIds: ["data-governance-director", "data-custodian"],
      },
      // 14-day window for internal governance approvals to be collected
      expirySeconds: 1209600,
      delegationAllowed: true,
      delegateToRoleId: "data-custodian",
    },
    {
      // Privacy validation: MANDATORY — cannot be bypassed by threshold
      // Privacy Officer or Deputy Privacy Officer must validate
      id: "policy-privacy-validation",
      actorId: "hospital",
      threshold: {
        k: 1,
        n: 2,
        approverRoleIds: ["privacy-officer", "deputy-privacy-officer"],
      },
      expirySeconds: 1209600,
      delegationAllowed: true,
      delegateToRoleId: "deputy-privacy-officer",
      // Privacy validation is mandatory — this is the key control that prevents
      // release of improperly prepared limited data sets
      mandatoryApprovers: ["privacy-officer"],
    },
  ],
  edges: [
    { sourceId: "hospital", targetId: "hrpp-office", type: "authority" },
    { sourceId: "hospital", targetId: "data-governance", type: "authority" },
    { sourceId: "hospital", targetId: "privacy-officer", type: "authority" },
    {
      sourceId: "hospital",
      targetId: "deputy-privacy-officer",
      type: "authority",
    },
    { sourceId: "hospital", targetId: "legal-counsel", type: "authority" },
    {
      sourceId: "data-governance",
      targetId: "data-governance-director",
      type: "authority",
    },
    {
      sourceId: "data-governance",
      targetId: "data-custodian",
      type: "authority",
    },
    { sourceId: "university", targetId: "university-pi", type: "authority" },
    // Delegation: Privacy Officer to Deputy Privacy Officer
    {
      sourceId: "privacy-officer",
      targetId: "deputy-privacy-officer",
      type: "delegation",
    },
    // Delegation: Data Governance Director to Data Custodian for approval function
    {
      sourceId: "data-governance-director",
      targetId: "data-custodian",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "Multi-institution limited data set access with parallel governance",
    initiatorRoleId: "university-pi",
    targetAction:
      "Access to Limited Data Set from Academic Medical Center for Federally Funded Multi-Institution Study",
    description:
      "Principal Investigator at State University requests access to a limited data set from the Academic Medical Center for a federally funded, IRB-approved study. Requires parallel governance approvals: Data Governance Director approves the institutional data release, Privacy Officer validates the limited data set preparation methodology, and Legal Counsel executes the DUA. Today these run in silos — often sequentially by default — with no shared workflow or cross-institutional visibility.",
  },
  beforeMetrics: {
    // 40 hours of active coordination effort spread over 60-180 days elapsed
    manualTimeHours: 40,
    // 90 days: realistic median elapsed time for multi-institution data access
    // including DUA negotiation (the dominant bottleneck)
    riskExposureDays: 90,
    // 6 enumerated audit gaps:
    // (1) no cross-institutional audit trail
    // (2) DUA compliance not tracked against actual data use
    // (3) de-identification/LDS validation not linked to specific release
    // (4) IRB approval status not verified at time of data release
    // (5) data provenance lost after institutional transfer
    // (6) DUA expiration and data destruction not monitored
    auditGapCount: 6,
    // 9 steps enumerated in narrative
    approvalSteps: 9,
  },
  todayFriction: {
    ...ARCHETYPES["cross-org-boundary"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        // Real-world: days to weeks for initial routing through institutional silos
        description:
          "Data access request submitted to Research Data Governance office — governance coordinator must separately route to legal counsel, Privacy Officer, and IRB office through disconnected systems; each office operates on its own timeline with no shared workflow",
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        // Real-world: weeks for Privacy Officer review of LDS methodology
        description:
          "Privacy Officer reviewing limited data set preparation methodology — verifying that appropriate identifiers are removed per HIPAA Safe Harbor requirements; must cross-reference against the specific variables requested by the PI",
        delaySeconds: 8,
      },
      {
        trigger: "on-unavailable",
        // Real-world: weeks to months if Privacy Officer is sole authority
        description:
          "Privacy Officer on extended leave — no designated Deputy Privacy Officer is configured in the governance workflow; DUA negotiation with legal also stalled awaiting privacy validation before legal will finalize terms",
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Parallel governance processes running sequentially by default in disconnected institutional silos",
  },
  todayPolicies: [
    {
      // Today: Privacy Officer is the sole authority — no backup configured
      // This is the realistic bottleneck: single point of failure
      id: "policy-research-collaboration-today",
      actorId: "hospital",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["privacy-officer"],
      },
      // Short simulation window representing tight institutional approval cycle
      expirySeconds: 30,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "Common Rule",
      displayName: "Common Rule (45 CFR Part 46)",
      clause: "Subpart A / Section 46.114 (Single IRB Mandate)",
      violationDescription:
        "Failure to obtain IRB review for research involving identifiable private information, or failure to use a single IRB for federally funded multi-site research as required under the revised Common Rule",
      fineRange:
        "Institutional debarment from federal research funding; suspension of all federally funded research protocols; OHRP compliance determination letters",
      severity: "critical",
      safeguardDescription:
        "Accumulate provides cryptographic proof that IRB approval was active at the time of data release and maintains a verifiable record of single IRB reliance across institutions",
    },
    {
      framework: "HIPAA",
      displayName: "HIPAA §164.512(i) / §164.514(e)",
      clause:
        "Research Use & Disclosure / Limited Data Sets and Data Use Agreements",
      violationDescription:
        "Disclosure of a limited data set for research without a valid data use agreement, or release of data that does not meet de-identification or limited data set standards, constituting unauthorized disclosure of PHI",
      fineRange:
        "$137 - $68,928 per violation (Tier 1-3); $2,067,813 annual cap per identical violation category; willful neglect penalties up to $2M+ per violation category (adjusted annually for inflation per 45 CFR 160.404)",
      severity: "critical",
      safeguardDescription:
        "Accumulate enforces policy-driven data release authorization requiring validated Privacy Officer approval of limited data set methodology and executed DUA before data release, with cryptographic proof of the complete authorization chain",
    },
    {
      framework: "HITECH",
      displayName: "HITECH Act §13402",
      clause: "Breach Notification",
      violationDescription:
        "Release of improperly de-identified data constituting a breach of unsecured PHI — triggers notification obligations to affected individuals, HHS, and (for breaches affecting 500+) media",
      fineRange:
        "$100K - $1.5M per violation category; state attorney general actions; OCR enforcement (e.g., Advocate Health $5.55M, Memorial Hermann $2.4M)",
      severity: "high",
      safeguardDescription:
        "Accumulate's mandatory Privacy Officer validation gate ensures limited data set preparation methodology is certified before data release, preventing improperly de-identified data from being released and triggering breach notification",
    },
  ],
  tags: [
    "healthcare",
    "research",
    "cross-org",
    "hipaa",
    "irb",
    "common-rule",
    "limited-data-set",
    "data-use-agreement",
    "single-irb",
    "privacy-validation",
    "multi-institution",
  ],
};
