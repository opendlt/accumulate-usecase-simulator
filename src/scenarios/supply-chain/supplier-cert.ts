import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * Supplier ISO Certification & Risk-Based Onboarding
 *
 * Models the multi-function supplier onboarding workflow at a global manufacturer.
 * Procurement initiates onboarding through the Supplier Lifecycle Management (SLM)
 * platform, routing the request to Quality (ISO certification scope verification)
 * and Compliance (accreditation body validation, denied party screening, financial
 * risk assessment). Until all required functions approve, the ERP system maintains
 * a purchasing block on the vendor master record -- no purchase orders can be issued.
 *
 * Key governance controls modeled:
 * - 2-of-3 threshold with QA Manager as mandatory approver (ISO scope verification
 *   cannot be bypassed)
 * - Intra-function delegation from Compliance Officer to Senior Risk Analyst
 *   (not cross-functional to Quality)
 * - Escalation to VP of Supply Chain when approval stalls during audit season
 * - Delegation constrained to standard-risk suppliers only
 * - SLM system as the technical control point gating ERP vendor activation
 *
 * Real-world references: SAP S/4HANA vendor master block, SAP Ariba SLP,
 * Jaggaer supplier management, IAF CertSearch, CB online directories (BSI,
 * TUV SUD, Bureau Veritas, SGS)
 */
export const supplierCertScenario: ScenarioTemplate = {
  id: "supply-chain-supplier-cert",
  name: "Supplier ISO Certification & Risk-Based Onboarding",
  description:
    "A global manufacturer needs to onboard a new supplier through the enterprise Supplier Lifecycle Management (SLM) process. Procurement initiates onboarding and routes approval through Quality and Compliance, who must verify ISO certification validity, scope alignment, and accreditation body recognition (IAF MLA signatory). Approvals queue in workflow for 2-3 business days during audit season. Until all functions approve, the ERP system maintains a purchasing block on the vendor master -- purchase orders cannot be issued. Typical onboarding takes 3-7 business days, and urgent programs risk unapproved supplier bypass (maverick sourcing).",
  icon: "Truck",
  industryId: "supply-chain",
  archetypeId: "regulatory-compliance",
  prompt:
    "What happens when a critical supplier onboarding is blocked because approvals are queued across Procurement, Quality, and Compliance while the ERP purchasing block prevents purchase orders and production schedules are at risk of supplier bypass?",
  actors: [
    // --- Global Manufacturer (the organization performing supplier onboarding) ---
    {
      id: "manufacturer",
      type: NodeType.Organization,
      label: "Global Manufacturer",
      parentId: null,
      organizationId: "manufacturer",
      color: "#F59E0B",
    },

    // --- Procurement Department ---
    // Owns the SLM process and initiates supplier onboarding. Manages commercial
    // terms (pricing, lead time, MOQ, incoterms) and supplier relationship.
    {
      id: "procurement",
      type: NodeType.Department,
      label: "Procurement",
      description:
        "Owns the Supplier Lifecycle Management (SLM) process -- initiates onboarding, manages commercial terms (pricing, lead time, MOQ, incoterms), and uploads supplier documentation to the SLM platform (SAP Ariba, Jaggaer, Coupa)",
      parentId: "manufacturer",
      organizationId: "manufacturer",
      color: "#06B6D4",
    },
    // Procurement Lead / Category Manager -- initiates the SLM onboarding request,
    // validates commercial terms, and is one of the three approvers.
    {
      id: "procurement-lead",
      type: NodeType.Role,
      label: "Procurement Lead",
      description:
        "Category Manager who initiates the SLM onboarding request, validates commercial terms (pricing, lead time, MOQ, incoterms), uploads supplier documentation to the SLM platform, and serves as one of three onboarding approvers",
      parentId: "procurement",
      organizationId: "manufacturer",
      color: "#94A3B8",
    },

    // --- Quality Department ---
    // Verifies ISO certification validity, scope alignment with component program
    // requirements, and supplier audit findings. For automotive: IATF 16949.
    // For aerospace: AS9100D + NADCAP.
    {
      id: "quality-dept",
      type: NodeType.Department,
      label: "Quality",
      description:
        "Verifies ISO certification scope alignment with component requirements, audit finding status (no open major nonconformities), and supplier capability assessment. Owns PPAP/FAI for safety-critical components.",
      parentId: "manufacturer",
      organizationId: "manufacturer",
      color: "#06B6D4",
    },
    // QA Manager / Supplier Quality Engineer (SQE) -- performs the ISO certification
    // verification: certificate number lookup in CB online directory, scope alignment,
    // audit finding review. This is a MANDATORY approver -- ISO scope verification
    // cannot be bypassed.
    {
      id: "qa-manager",
      type: NodeType.Role,
      label: "Quality Manager",
      description:
        "Supplier Quality Engineer (SQE) who verifies ISO certification validity (certificate number lookup in CB directory -- BSI, TUV SUD, Bureau Veritas, SGS), scope alignment (certified scope covers procured products/processes), and audit findings (no open major nonconformities, surveillance audits current). Mandatory approver -- ISO scope verification cannot be bypassed.",
      parentId: "quality-dept",
      organizationId: "manufacturer",
      color: "#94A3B8",
    },

    // --- Compliance / GRC Department ---
    // Validates accreditation body recognition, conducts denied party screening,
    // evaluates financial risk, and reviews insurance coverage. Separate from Quality.
    {
      id: "compliance-dept",
      type: NodeType.Department,
      label: "Compliance / GRC",
      description:
        "Validates accreditation body recognition (IAF MLA signatory verification), conducts denied party screening (BIS Entity List, OFAC SDN, EU sanctions), evaluates financial risk (D&B rating, credit check), and reviews insurance coverage (product liability, general liability)",
      parentId: "manufacturer",
      organizationId: "manufacturer",
      color: "#06B6D4",
    },
    // Compliance Officer -- the primary risk authority for supplier onboarding.
    // Currently traveling to a supplier audit, creating the approval bottleneck.
    {
      id: "compliance-officer",
      type: NodeType.Role,
      label: "Compliance Officer",
      description:
        "Risk authority who validates accreditation body recognition (IAF MLA signatory), denied party screening (OFAC SDN, BIS Entity List, EU sanctions), financial risk assessment (D&B rating), and export control classification. Currently traveling to a supplier audit site.",
      parentId: "compliance-dept",
      organizationId: "manufacturer",
      color: "#94A3B8",
    },
    // Senior Risk Analyst -- intra-function delegate for the Compliance Officer.
    // Can handle standard-risk supplier onboarding but NOT critical/sole-source
    // suppliers or suppliers in sanctioned countries.
    {
      id: "senior-risk-analyst",
      type: NodeType.Role,
      label: "Senior Risk Analyst",
      description:
        "Intra-function delegate for the Compliance Officer -- can complete denied party screening, accreditation body verification, and financial risk assessment for standard-risk and preferred-tier suppliers. Cannot approve critical suppliers, sole-source suppliers, or suppliers in sanctioned/high-risk countries.",
      parentId: "compliance-dept",
      organizationId: "manufacturer",
      color: "#94A3B8",
    },

    // --- VP of Supply Chain (escalation authority) ---
    // Escalation target when both Compliance Officer and Senior Risk Analyst
    // are unavailable (e.g., during audit season September-December).
    {
      id: "vp-supply-chain",
      type: NodeType.Role,
      label: "VP of Supply Chain",
      description:
        "Escalation authority for urgent supplier onboarding when Compliance and Quality approvers are unavailable (audit season). Can issue conditional approval with risk mitigation plan for production-critical suppliers.",
      parentId: "manufacturer",
      organizationId: "manufacturer",
      color: "#94A3B8",
    },

    // --- SLM / ERP System (technical control point) ---
    // The SLM platform and ERP system that gates vendor master activation.
    // Purchase orders cannot be issued until the purchasing block is removed.
    // This is the enforcement mechanism -- the system that says "no" until
    // all approvals are collected.
    {
      id: "slm-system",
      type: NodeType.System,
      label: "SLM / ERP System",
      description:
        "Supplier Lifecycle Management platform (SAP Ariba, Jaggaer, Coupa) integrated with ERP (SAP S/4HANA). Maintains purchasing block on vendor master until all onboarding approvals are collected. Enforces the vendor activation gate -- no purchase orders can be created or released until the block is removed.",
      parentId: "manufacturer",
      organizationId: "manufacturer",
      color: "#8B5CF6",
    },

    // --- External Supplier (the vendor being onboarded) ---
    // Uploads ISO certificates and supporting documentation to the supplier portal.
    // Has no approval authority -- only provides documentation.
    {
      id: "supplier",
      type: NodeType.Vendor,
      label: "Supplier",
      description:
        "External vendor being onboarded -- uploads ISO certificates, insurance documentation, financial references, and completed self-assessment questionnaire to the supplier portal for qualification review",
      parentId: null,
      organizationId: "supplier",
      color: "#F59E0B",
    },
  ],
  policies: [
    {
      id: "policy-supplier-cert",
      // Policy attached to the Procurement department, which owns the SLM workflow
      // and is the functional owner of the supplier onboarding process. The SLM system
      // enforces the policy by maintaining the ERP purchasing block until approvals
      // are collected.
      actorId: "procurement",
      threshold: {
        k: 2,
        n: 3,
        approverRoleIds: ["compliance-officer", "qa-manager", "procurement-lead"],
      },
      // 72 hours (3 business days) -- accommodates multi-day asynchronous review
      // across three functions. QA Manager needs 1-2 days for ISO certification
      // scope verification (CB directory lookup, scope review, audit finding review).
      // Compliance needs 1-2 days for denied party screening and accreditation body
      // validation. 72 hours is a significant compression from the current open-ended
      // process (which can take 2-3 weeks during audit season).
      expirySeconds: 259200,
      delegationAllowed: true,
      // Delegation is intra-function: Compliance Officer delegates to Senior Risk
      // Analyst within the Compliance/GRC department. NOT cross-functional to Quality.
      delegateToRoleId: "senior-risk-analyst",
      // QA Manager is mandatory -- ISO certification scope verification cannot be
      // bypassed in any approval combination. ISO 9001:2015 Clause 8.4.1 requires
      // documented evaluation of external providers' ability to provide conforming
      // products/services. This is a Quality function responsibility.
      mandatoryApprovers: ["qa-manager"],
      // Delegation is scoped to standard-risk suppliers only. Critical suppliers,
      // sole-source suppliers, and suppliers in sanctioned countries require the
      // Compliance Officer's direct review.
      delegationConstraints:
        "Delegation from Compliance Officer to Senior Risk Analyst is limited to standard-risk and preferred-tier supplier onboarding where denied party screening is clear and financial risk rating (D&B) is acceptable. Critical suppliers, sole-source suppliers, suppliers in sanctioned or high-risk countries, and suppliers with adverse financial indicators require Compliance Officer direct review.",
      escalation: {
        // Simulation-compressed: represents 48-hour real-world timeout before
        // escalating to VP of Supply Chain. In practice, if 2 business days pass
        // without the approval threshold being met (e.g., during September-December
        // audit season), the VP of Supply Chain can issue a conditional approval
        // with a risk mitigation plan for production-critical suppliers.
        afterSeconds: 20,
        toRoleIds: ["vp-supply-chain"],
      },
      // Vendor master activation occurs in the SAP production environment (production
      // client), which is a controlled enclave requiring governance controls.
      constraints: {
        environment: "sap-enclave",
      },
    },
  ],
  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "manufacturer", targetId: "procurement", type: "authority" },
    { sourceId: "manufacturer", targetId: "quality-dept", type: "authority" },
    { sourceId: "manufacturer", targetId: "compliance-dept", type: "authority" },
    { sourceId: "manufacturer", targetId: "vp-supply-chain", type: "authority" },
    { sourceId: "manufacturer", targetId: "slm-system", type: "authority" },
    { sourceId: "procurement", targetId: "procurement-lead", type: "authority" },
    { sourceId: "quality-dept", targetId: "qa-manager", type: "authority" },
    {
      sourceId: "compliance-dept",
      targetId: "compliance-officer",
      type: "authority",
    },
    {
      sourceId: "compliance-dept",
      targetId: "senior-risk-analyst",
      type: "authority",
    },
    // --- Delegation edge (intra-function, within Compliance/GRC) ---
    // Compliance Officer delegates to Senior Risk Analyst -- same department,
    // same competency area, constrained to standard-risk suppliers.
    {
      sourceId: "compliance-officer",
      targetId: "senior-risk-analyst",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "Supplier onboarding through SLM with ISO certification verification and risk-based approval",
    initiatorRoleId: "procurement-lead",
    targetAction:
      "Activate Supplier in ERP Vendor Master After ISO Certification Scope Verification, Accreditation Body Validation, and Denied Party Screening",
    description:
      "Procurement Lead initiates SLM onboarding for a critical component supplier. Quality Manager verifies ISO certification validity (certificate number lookup in CB directory), scope alignment (certified scope covers procured products), and audit findings. Compliance Officer validates accreditation body recognition (IAF MLA signatory), conducts denied party screening (OFAC SDN, BIS Entity List), and evaluates financial risk (D&B rating). 2-of-3 threshold with QA Manager mandatory. Until all required approvals are collected, the ERP purchasing block prevents purchase order creation -- 3-7 business day standard timeline with supplier bypass risk on urgent programs.",
  },
  beforeMetrics: {
    // Wall-clock elapsed time from SLM request initiation to ERP vendor activation,
    // including asynchronous review cycles, approver unavailability, and queue wait
    // time. Active manual effort is approximately 10-14 hours:
    //   - Procurement Lead: 2-3 hours (SLM request, document upload, commercial review)
    //   - QA Manager: 3-5 hours (CB directory lookup, scope verification, audit review)
    //   - Compliance Officer: 3-4 hours (denied party screening, accreditation check,
    //     financial risk assessment)
    //   - ERP team: 1-2 hours (vendor master creation, data entry, block removal)
    // The 36-hour wall-clock figure represents 4-5 business days with approver
    // travel and queue delays.
    manualTimeHours: 36,
    // 10 days of risk exposure represents the period from onboarding initiation to
    // ERP vendor activation, during which the manufacturer either cannot source from
    // the supplier or faces pressure to bypass the approval process (maverick sourcing).
    // Standard 3-7 business day onboarding extends to 7-10 business days when key
    // approvers are traveling or during audit season (September-December).
    riskExposureDays: 10,
    // Five audit gaps in the current manual process:
    // (1) ISO certificate scope alignment not systematically verified -- manual browser
    //     lookup against CB directory with no record of which certificate was checked
    //     or whether the scope actually covers the procured products/processes
    // (2) Accreditation body recognition (IAF MLA signatory) not verified or documented --
    //     reviewer may accept a certificate from a non-IAF-MLA-accredited CB without
    //     knowing this is a gap
    // (3) Denied party screening results not linked to the onboarding record -- screening
    //     done in a separate system (OFAC SDN list, BIS Entity List) with no audit trail
    //     connecting the screening result to the specific supplier onboarding request
    // (4) Delegation from Compliance Officer is informal (email or phone call) with no
    //     system record -- auditor cannot verify who actually performed the compliance
    //     review or whether the delegate had authority
    // (5) ERP vendor master activation not linked to approval record -- the purchasing
    //     block is removed manually with no system-enforced link to the completed
    //     approval workflow
    auditGapCount: 5,
    // Seven manual steps in the current process:
    // (1) Supplier uploads documents to portal/email
    // (2) Procurement Lead reviews commercial terms and routes to Quality/Compliance
    // (3) QA Manager looks up certificate in CB online directory
    // (4) QA Manager reviews scope alignment and audit findings
    // (5) Compliance Officer checks denied party lists in separate screening tool
    // (6) Compliance Officer validates accreditation body in IAF database
    // (7) ERP team manually removes purchasing block after collecting approvals
    approvalSteps: 7,
  },
  todayFriction: {
    ...ARCHETYPES["regulatory-compliance"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Supplier uploads ISO certificate package to SLM portal (or emails scanned PDFs) -- Procurement Lead reviews documents and manually routes the onboarding request through the SLM workflow queue to Quality and Compliance",
        // Simulation-compressed: represents 4-8 hours real-world elapsed time for
        // supplier document submission, Procurement Lead review, and manual routing
        // across functions
        delaySeconds: 8,
      },
      {
        trigger: "before-approval",
        description:
          "QA Manager cross-validating ISO certification: (1) certificate number lookup in CB online directory (BSI, TUV SUD, Bureau Veritas, SGS), (2) scope alignment check -- does the certified scope cover the specific products/processes being procured?, (3) accreditation body recognition -- is the CB accredited by an IAF MLA signatory?, (4) certificate expiry and surveillance audit status",
        // Simulation-compressed: represents 1-2 business days real-world elapsed time
        // for thorough ISO certification verification, especially when the QA Manager
        // is reviewing multiple supplier onboarding requests simultaneously
        delaySeconds: 6,
      },
      {
        trigger: "on-unavailable",
        description:
          "Compliance Officer traveling to a supplier audit site -- onboarding request sitting in SLM workflow queue for 2-3 business days. No system-enforced delegation to Senior Risk Analyst. ERP purchasing block remains active -- purchase orders cannot be created. Production team escalating informally to Procurement asking for supplier bypass.",
        // Simulation-compressed: represents 2-3 business days (16-24 hours active
        // business hours) of queue wait while Compliance Officer is traveling
        delaySeconds: 10,
      },
    ],
    narrativeTemplate:
      "SLM workflow queue with manual CB directory lookup, no system-enforced delegation, and blocked ERP vendor activation",
  },
  todayPolicies: [
    {
      id: "policy-supplier-cert-today",
      // Today's policy is attached to the manufacturer organization because there
      // is no system-enforced policy engine -- the SLM workflow is manual and the
      // "policy" is an informal business rule that all three functions must approve
      actorId: "manufacturer",
      threshold: {
        // Today: all 3 of 3 must approve. No exceptions. This is the root cause
        // of the bottleneck -- a single unavailable approver blocks the entire
        // onboarding process.
        k: 3,
        n: 3,
        approverRoleIds: ["compliance-officer", "qa-manager", "procurement-lead"],
      },
      // Simulation-compressed: represents the real-world scenario where the
      // approval window is effectively open-ended (days to weeks) because the
      // 3-of-3 requirement with no delegation means the request sits in queue
      // until all three approvers are available and have reviewed. The short
      // simulation expiry models the practical effect: the request "expires"
      // (stalls) quickly because the Compliance Officer is traveling.
      expirySeconds: 30,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "ISO 9001",
      displayName: "ISO 9001:2015 Clause 8.4.1",
      clause: "Evaluation of External Providers",
      violationDescription:
        "Supplier onboarded without documented evaluation of ISO certification validity, scope alignment with procured products/processes, or verification that the certification body is accredited by an IAF MLA signatory -- violates the requirement to evaluate and select external providers based on their ability to provide conforming products and services",
      fineRange:
        "ISO 9001 certification nonconformity (major finding if systematic); customer audit finding; potential loss of preferred supplier status with OEM customers who require ISO 9001 compliance from their supply chain",
      severity: "high",
      safeguardDescription:
        "Accumulate enforces policy-driven supplier onboarding with mandatory QA Manager verification of ISO certification scope alignment, certificate validity, and audit findings -- cryptographic proof of each verification step satisfies Clause 8.4.1 documentation requirements",
    },
    {
      framework: "IATF 16949",
      displayName: "IATF 16949 Clause 8.4.1.2",
      clause: "Supplier Selection Process",
      violationDescription:
        "Supplier selected and onboarded without a documented supplier selection process including QMS assessment, risk analysis, and past quality/delivery/cost performance evaluation -- violates the automotive-specific requirement for a documented supplier selection process",
      fineRange:
        "IATF 16949 certification major nonconformity; OEM customer-specific requirement (CSR) violation; potential removal from OEM approved supplier list; product recall liability if quality issue traces to unqualified supplier",
      severity: "critical",
      safeguardDescription:
        "Policy-enforced supplier selection workflow with mandatory QMS assessment (ISO certification scope verification), risk classification, and multi-function approval captured in immutable audit trail satisfying IATF 16949 Clause 8.4.1.2 and OEM CSR requirements",
    },
    {
      framework: "ISO/IEC 17021-1",
      displayName: "ISO/IEC 17021-1:2015",
      clause: "Accreditation Body Recognition",
      violationDescription:
        "Supplier's ISO certificate accepted without verifying that the certification body (CB) is accredited by an IAF MLA signatory accreditation body -- certificate may not be internationally recognized, undermining the entire supplier qualification basis",
      fineRange:
        "Customer audit finding (OEM customers routinely verify supplier ISO certificates during second-party audits); ISO 9001 Clause 8.4.1 nonconformity for inadequate supplier evaluation; supply chain disruption if the certificate is later found to be invalid",
      severity: "high",
      safeguardDescription:
        "Compliance Officer (or delegated Senior Risk Analyst) verifies accreditation body recognition as a policy precondition -- the Accumulate policy engine integrates with IAF CertSearch to verify that the CB is accredited by an IAF MLA signatory before routing the approval request",
    },
    {
      framework: "AS9100D",
      displayName: "AS9100D Clause 8.4.1",
      clause: "External Provider Evaluation (Aerospace)",
      violationDescription:
        "Aerospace supplier onboarded without verification that the QMS certification is issued by a CB accredited under the IAQG OASIS database, or without verifying NADCAP accreditation for special processes (welding, heat treatment, NDT, surface treatment)",
      fineRange:
        "AS9100D certification major nonconformity; DCMA (Defense Contract Management Agency) surveillance finding; potential loss of government contract eligibility; product safety liability for safety-critical aerospace components",
      severity: "critical",
      safeguardDescription:
        "Policy-enforced aerospace supplier qualification with mandatory OASIS database verification, NADCAP accreditation check for special processes, and multi-function approval chain with cryptographic proof satisfying AS9100D and DCMA surveillance requirements",
    },
  ],
  tags: [
    "supply-chain",
    "compliance",
    "iso",
    "supplier-onboarding",
    "slm",
    "erp",
    "accreditation",
    "iaf-mla",
    "supplier-risk",
    "supplier-bypass",
    "vendor-master",
    "iso-9001",
    "iatf-16949",
    "as9100d",
    "denied-party-screening",
  ],
};
