import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * Export Control & ITAR/EAR Compliance Authorization
 *
 * Models the export authorization workflow at a defense contractor shipping
 * ITAR-controlled defense articles or EAR-controlled dual-use items
 * internationally. The core governance challenge is the legally mandated
 * Empowered Official (EO) signatory requirement under ITAR (22 CFR 120.67)
 * combined with time-critical shipping windows that close if authorization
 * is not obtained in time.
 *
 * Key governance controls modeled:
 * - Empowered Official (EO) as mandatory approver -- only the EO or DEO
 *   can sign ITAR export authorizations under 22 CFR 120.67
 * - 2-of-3 analytical review threshold (Export Officer, Legal Counsel,
 *   Export Classification Analyst) for the authorization package
 * - EO delegates to DEO (same legal authority, different person) when
 *   EO is at a trade compliance seminar
 * - Auto-escalation to VP of Trade Compliance when shipping window is
 *   at risk and signatory is unavailable
 * - Delegation constrained to pre-classified shipments with clear
 *   denied party screening and approved destinations only
 *
 * ITAR authority model:
 *   Export Officer (analyst) PREPARES authorization package
 *   --> Empowered Official (signatory) SIGNS authorization
 *   --> Deputy Empowered Official (alternate signatory) SIGNS when EO unavailable
 *   Legal Counsel REVIEWS legal sufficiency (does NOT sign)
 *
 * Real-world references: DDTC EASE system, BIS SNAP-R, Visual Compliance,
 * Descartes MK DPS, SAP GTS, ACE/AES for EEI filing, OFAC SDN/BIS Entity
 * List screening
 */
export const exportControlScenario: ScenarioTemplate = {
  id: "supply-chain-export-control",
  name: "Export Control & ITAR/EAR Compliance Authorization",
  description:
    "A defense contractor must authorize international shipment of ITAR-controlled defense articles (22 CFR 121 USML) or EAR-controlled dual-use items (15 CFR 774 CCL). The Empowered Official (EO) -- the only person with legal authority to sign export authorizations under 22 CFR 120.67 -- is at a trade compliance seminar. The Export Officer has prepared the authorization package (export classification, denied party screening, license determination, end-user certificate review), but cannot sign it. The Deputy Empowered Official (DEO) is the designated alternate signatory. Meanwhile, the international shipping window closes in hours, and missed windows result in carrier rebooking costs ($5K-$25K), FMS late delivery penalties ($50K-$500K+), and customer production line impacts.",
  icon: "Truck",
  industryId: "supply-chain",
  archetypeId: "regulatory-compliance",
  prompt:
    "What happens when an ITAR-controlled shipment is ready for export but the Empowered Official is at a trade compliance seminar, the authorization package is prepared but unsigned, and the international shipping window closes -- resulting in FMS late delivery penalties and regulatory risk from pressure to ship without proper authorization?",

  // costPerHourDefault: shipping window delay cost including carrier rebooking
  // fees, FMS penalty accruals, and customer production line impact. Defense
  // shipments vary widely: $5K-$25K/hr for standard commercial shipments,
  // $25K-$100K+/hr for FMS/DCS shipments with contractual penalty clauses.
  // $15,000/hr is a conservative mid-range estimate for a standard defense
  // commercial export.
  costPerHourDefault: 15000,

  actors: [
    // --- Defense Contractor (the ITAR-registered organization) ---
    {
      id: "defense-contractor",
      type: NodeType.Organization,
      label: "Defense Contractor",
      parentId: null,
      organizationId: "defense-contractor",
      color: "#F59E0B",
    },

    // --- Export Control Office ---
    // The functional department responsible for all export compliance activities:
    // jurisdiction/classification determination, license management, denied party
    // screening, EO/DEO signatory coordination, and AES/EEI filing. At major
    // defense contractors, this is typically a 5-20+ person team under the VP
    // of Trade Compliance.
    {
      id: "export-control-office",
      type: NodeType.Department,
      label: "Export Control Office",
      description:
        "Manages all export compliance functions: export classification (USML category for ITAR, ECCN for EAR), commodity jurisdiction (CJ) determinations, denied party screening (OFAC SDN, BIS Entity List, BIS Unverified List, BIS Denied Persons), license application management (DSP-5, BIS-748P), license exception evaluation (EAR Part 740), AES/EEI filing in ACE, and Empowered Official signatory coordination",
      parentId: "defense-contractor",
      organizationId: "defense-contractor",
      color: "#06B6D4",
    },

    // --- Legal Department ---
    // Provides legal review of export authorization packages, TAA/MLA
    // negotiation, voluntary disclosure management, and sanctions/embargo
    // legal analysis. Legal Counsel does NOT have Empowered Official
    // authority and cannot sign ITAR export authorizations.
    {
      id: "legal",
      type: NodeType.Department,
      label: "Legal",
      description:
        "Trade compliance legal support: ITAR/EAR legal review of export authorization packages, voluntary disclosure (VD) management under 22 CFR 127.12, TAA/MLA legal review and negotiation, commodity jurisdiction (CJ) determination appeals, sanctions and embargo legal analysis, and compliance program oversight",
      parentId: "defense-contractor",
      organizationId: "defense-contractor",
      color: "#06B6D4",
    },

    // --- Logistics / Shipping Department ---
    // Manages physical shipment logistics: carrier coordination, customs
    // brokerage, freight forwarding, packing/crating, and shipment tracking.
    // Initiates export authorization requests but has NO compliance approval
    // authority.
    {
      id: "logistics-dept",
      type: NodeType.Department,
      label: "Logistics / Shipping",
      description:
        "Manages physical shipment logistics for defense articles and dual-use items: carrier coordination, customs brokerage, freight forwarding, packing/crating to MIL-STD-2073-1 standards, and shipment tracking. Initiates export authorization requests but has no compliance approval authority.",
      parentId: "defense-contractor",
      organizationId: "defense-contractor",
      color: "#06B6D4",
    },

    // --- Empowered Official (EO) ---
    // THE critical role in ITAR export compliance. Under 22 CFR 120.67, the EO
    // is a designated officer of the registrant who has been empowered to sign
    // license applications (DSP-5, DSP-73, DSP-85), Technical Assistance
    // Agreements (TAAs), Manufacturing License Agreements (MLAs), and export
    // authorizations. The EO has personal criminal liability -- up to $1M per
    // violation and 20 years imprisonment under 22 CFR 127.
    //
    // In this scenario, the EO is at a trade compliance seminar (ECTI, BIS
    // Update Conference, SIA Export Controls Conference), creating the
    // bottleneck that necessitates DEO delegation.
    {
      id: "empowered-official",
      type: NodeType.Role,
      label: "Empowered Official",
      description:
        "Designated Empowered Official under 22 CFR 120.67 -- the ONLY officer with legal authority to sign ITAR export license applications (DSP-5, DSP-73, DSP-85), Technical Assistance Agreements (TAAs), Manufacturing License Agreements (MLAs), and export authorizations. Registered with DDTC. Carries personal criminal liability (up to $1M per violation and 20 years imprisonment under 22 CFR 127). Currently at a trade compliance seminar.",
      parentId: "export-control-office",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- Deputy Empowered Official (DEO) ---
    // Designated alternate EO under 22 CFR 120.67. Has the SAME legal authority
    // as the primary EO and can sign the same documents. Activated when the EO
    // is unavailable (travel, seminar, leave).
    {
      id: "deputy-empowered-official",
      type: NodeType.Role,
      label: "Deputy Empowered Official",
      description:
        "Designated alternate Empowered Official under 22 CFR 120.67 -- authorized to sign ITAR export license applications (DSP-5, DSP-73, DSP-85), TAAs, MLAs, and export authorizations when the primary Empowered Official is unavailable. Registered with DDTC. Carries the same legal authority and personal criminal liability as the primary EO.",
      parentId: "export-control-office",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- Export Officer (Export Compliance Analyst) ---
    // The analytical role that reviews export classifications, performs denied
    // party screening, evaluates license requirements, and PREPARES the export
    // authorization package. Does NOT have signatory authority -- the EO/DEO
    // signs. In this scenario, the Export Officer is at a trade compliance
    // seminar with the EO (or handling another complex case).
    {
      id: "export-officer",
      type: NodeType.Role,
      label: "Export Officer",
      description:
        "Export Compliance Analyst who reviews export classification (ECCN for EAR items, USML category for ITAR items), performs denied party screening (OFAC SDN, BIS Entity List, BIS Unverified List, BIS Denied Persons), evaluates license requirements and license exception availability (EAR Part 740), reviews end-user/end-use certificates (DSP-83), and prepares the export authorization package for Empowered Official signature. Does NOT have signatory authority. Currently reviewing a complex classification case.",
      parentId: "export-control-office",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- Legal Counsel (Trade Compliance Counsel) ---
    // Provides legal review of the authorization package. Does NOT have
    // Empowered Official authority and CANNOT sign ITAR export authorizations
    // under any delegation arrangement.
    {
      id: "legal-counsel",
      type: NodeType.Role,
      label: "Legal Counsel",
      description:
        "Trade Compliance Counsel -- provides ITAR/EAR legal review of export authorization packages, end-user/end-use certificate analysis, voluntary disclosure (VD) management under 22 CFR 127.12, TAA/MLA legal review, sanctions and embargo legal analysis, and compliance program oversight. Does NOT have Empowered Official signatory authority -- cannot sign ITAR export authorizations.",
      parentId: "legal",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- VP of Trade Compliance (escalation authority) ---
    // Escalation target when both EO and DEO are unavailable (rare but
    // possible during major trade compliance conferences or emergencies).
    // May also hold EO designation at some organizations. Can expedite
    // authorization or invoke emergency procedures.
    {
      id: "vp-trade-compliance",
      type: NodeType.Role,
      label: "VP of Trade Compliance",
      description:
        "Escalation authority for time-critical export authorizations when both the Empowered Official and Deputy Empowered Official are unavailable. May hold EO designation. Can expedite authorization processing, invoke emergency procedures, or authorize shipment hold with customer notification to prevent unauthorized export.",
      parentId: "defense-contractor",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- Logistics Coordinator ---
    // Initiates the shipment authorization request. Has no compliance
    // approval authority -- only logistics coordination.
    {
      id: "logistics-coordinator",
      type: NodeType.Role,
      label: "Logistics Coordinator",
      description:
        "Initiates export authorization requests when shipments are ready for international dispatch. Coordinates carrier scheduling, customs broker engagement, and freight forwarding. Monitors shipping window deadlines. Has NO compliance approval authority -- only logistics coordination and shipment initiation.",
      parentId: "logistics-dept",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- Export Compliance / Customs System ---
    // The integrated compliance platform that supports the entire export
    // authorization workflow.
    {
      id: "customs-system",
      type: NodeType.System,
      label: "Export Compliance System",
      description:
        "Integrated export compliance management platform (Visual Compliance, SAP GTS, Descartes MK DPS, or equivalent): denied party screening against all applicable lists (OFAC SDN, BIS Denied Persons, BIS Entity List, BIS Unverified List, UN sanctions, EU restrictive measures), export classification database (USML/CCL lookup), license tracking and license exception management, AES/EEI filing in ACE (ITN generation), end-user certificate management, and export authorization workflow routing.",
      parentId: "defense-contractor",
      organizationId: "defense-contractor",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-export-control",
      // Policy attached to the Export Control Office, which owns the export
      // authorization workflow
      actorId: "export-control-office",
      threshold: {
        // 2-of-3 analytical review: Export Officer, Legal Counsel, and
        // Export Officer review the authorization package from different
        // perspectives. But the EO/DEO signature is MANDATORY regardless
        // of which 2-of-3 analytical reviewers approve.
        //
        // Note: The EO is in mandatoryApprovers, not in the threshold pool.
        // This is because the EO signature is legally required -- it cannot
        // be bypassed by any combination of analyst approvals. The threshold
        // governs the analytical review; the mandatoryApprovers governs the
        // legal signatory requirement.
        k: 2,
        n: 3,
        approverRoleIds: ["export-officer", "legal-counsel", "deputy-empowered-official"],
      },
      // 12 hours (43,200 seconds) -- represents the typical shipping window
      // urgency for international defense shipments. Carrier cutoff times
      // for ocean freight (most defense articles are shipped ocean due to
      // weight/size) are typically 24-48 hours before vessel departure.
      // 12 hours is the authorization deadline to allow time for AES filing,
      // customs clearance, and carrier documentation.
      expirySeconds: 43200,
      delegationAllowed: true,
      // Delegation: EO delegates to DEO. The DEO has the same legal authority
      // under 22 CFR 120.67 and can sign any document the EO can sign.
      // This is NOT delegation from analyst to signatory -- it is delegation
      // from primary signatory to alternate signatory.
      delegateToRoleId: "deputy-empowered-official",
      // Empowered Official is MANDATORY. Under ITAR (22 CFR 120.67, 22 CFR 123),
      // every export authorization for defense articles requires the EO or DEO
      // signature. This cannot be bypassed by any threshold combination.
      // If neither the EO nor DEO is available, the export CANNOT proceed --
      // it must be held until a qualified signatory is available, or escalated
      // to the VP of Trade Compliance (who may hold EO designation).
      mandatoryApprovers: ["empowered-official"],
      // Delegation from EO to DEO is constrained to:
      // - Pre-classified items (USML category or ECCN already determined and
      //   documented in the export classification database)
      // - Denied party screening completed with no adverse results (no hits
      //   against OFAC SDN, BIS Entity List, or other restricted party lists)
      // - Approved destination countries only (NOT 22 CFR 126.1 proscribed
      //   countries: Belarus, Cuba, Iran, DPRK, Syria, Venezuela)
      // - Within the DEO's designated program scope
      // - Existing license or license exception available (no new license
      //   application required)
      // Complex cases (new classifications, CJ determinations, proscribed
      // country waivers, new license applications) require the primary EO.
      delegationConstraints:
        "Delegation from Empowered Official to Deputy Empowered Official is limited to pre-classified items (USML category or ECCN already determined), shipments with completed denied party screening showing no adverse results, approved destination countries (not 22 CFR 126.1 proscribed), items covered by existing licenses or license exceptions (EAR Part 740), and shipments within the DEO's designated program scope. New commodity jurisdiction (CJ) determinations, proscribed country waiver requests, voluntary disclosures, and new license applications (DSP-5, BIS-748P) require primary Empowered Official review.",
      escalation: {
        // Simulation-compressed: 20 seconds represents real-world escalation
        // trigger of approximately 4 hours before shipping window closure.
        // When neither the EO nor DEO has signed the authorization within
        // the escalation window, the system auto-escalates to the VP of
        // Trade Compliance, who can: (a) locate the DEO for expedited
        // signature, (b) sign the authorization if they hold EO designation,
        // or (c) authorize a shipment hold with customer notification to
        // prevent unauthorized export while preserving the carrier booking.
        afterSeconds: 20,
        toRoleIds: ["vp-trade-compliance"],
      },
      // Export authorizations are executed in the production export compliance
      // system (Visual Compliance, SAP GTS), not in test/sandbox environments.
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "defense-contractor", targetId: "export-control-office", type: "authority" },
    { sourceId: "defense-contractor", targetId: "legal", type: "authority" },
    { sourceId: "defense-contractor", targetId: "logistics-dept", type: "authority" },
    { sourceId: "defense-contractor", targetId: "vp-trade-compliance", type: "authority" },
    { sourceId: "defense-contractor", targetId: "customs-system", type: "authority" },
    { sourceId: "export-control-office", targetId: "empowered-official", type: "authority" },
    { sourceId: "export-control-office", targetId: "deputy-empowered-official", type: "authority" },
    { sourceId: "export-control-office", targetId: "export-officer", type: "authority" },
    { sourceId: "legal", targetId: "legal-counsel", type: "authority" },
    { sourceId: "logistics-dept", targetId: "logistics-coordinator", type: "authority" },
    // --- Delegation edge (EO -> DEO, same legal authority level) ---
    // The Empowered Official delegates signatory authority to the Deputy
    // Empowered Official. This is legally permitted under 22 CFR 120.67
    // because the DEO is also a designated empowered official.
    {
      sourceId: "empowered-official",
      targetId: "deputy-empowered-official",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "ITAR/EAR controlled shipment authorization with Empowered Official signature, denied party screening, and AES filing",
    initiatorRoleId: "logistics-coordinator",
    targetAction: "Authorize International Shipment of ITAR/EAR-Controlled Defense Articles with Empowered Official Signature",
    description:
      "Logistics Coordinator initiates export authorization request when controlled shipment is ready for international dispatch. Export Officer reviews the authorization package: (1) export classification verification (USML category for ITAR, ECCN for EAR), (2) denied party screening of all transaction parties (OFAC SDN, BIS Entity List, BIS Unverified List, BIS Denied Persons), (3) license determination (license required? license exception available? existing license coverage?), (4) end-user/end-use certificate review (DSP-83 if applicable). Legal Counsel provides legal sufficiency review. Empowered Official (or Deputy Empowered Official as delegate) signs the authorization -- this signature is legally mandatory under 22 CFR 120.67 and cannot be bypassed. AES/EEI filing in ACE generates the ITN for carrier documentation. 2-of-3 analytical review with EO/DEO as mandatory signatory. Auto-escalation to VP of Trade Compliance if shipping window is at risk.",
  },
  beforeMetrics: {
    // Wall-clock elapsed time from shipment authorization request to export
    // clearance, including asynchronous review cycles, approver unavailability,
    // and queue wait time. Active manual effort is approximately 6-10 hours:
    //   - Export Officer: 2-4 hours (classification verification, denied party
    //     screening, license determination, documentation preparation)
    //   - Legal Counsel: 1-2 hours (legal sufficiency review, end-user cert
    //     analysis, sanctions/embargo check)
    //   - EO/DEO: 0.5-1 hour (authorization review and signature)
    //   - AES/EEI filing: 0.5-1 hour (filing in ACE, ITN generation)
    //   - Documentation: 1-2 hours (SLI, commercial invoice, packing list)
    // The 36-hour wall-clock figure represents 2-3 business days with
    // approver travel (EO at seminar), queue delays, and the Export Officer
    // handling concurrent complex cases. Standard pre-classified shipments
    // with existing licenses take 4-8 hours; complex cases requiring new
    // license applications can take weeks to months.
    manualTimeHours: 36,
    // 10 days of risk exposure represents the period from missed shipping
    // window to the next available carrier slot. International defense
    // shipments (ocean freight for heavy defense articles) typically have
    // carrier frequency of 1-2 sailings per week on major trade lanes
    // (US East Coast to Middle East, US West Coast to Asia-Pacific).
    // A missed window plus rebooking, re-filing AES, and revalidating
    // denied party screening (screening results expire after 30-90 days
    // at most companies) can extend to 7-14 days. 10 days is a realistic
    // midpoint for Middle East / Asia-Pacific defense shipments.
    riskExposureDays: 10,
    // Five audit gaps in the current manual process:
    // (1) Export classification verification not linked to authorization
    //     record -- classification done in a separate database lookup with
    //     no system-enforced link to the specific shipment authorization
    // (2) Denied party screening results not integrated into the
    //     authorization workflow -- screening done in Visual Compliance or
    //     Descartes MK DPS with results printed or emailed separately
    // (3) EO/DEO signature captured on paper form or wet-ink document
    //     with no cryptographic verification or timestamped audit trail
    // (4) AES/EEI filing done in ACE separately from the authorization
    //     workflow -- no system-enforced link between the ITN and the
    //     export authorization record
    // (5) Delegation from EO to DEO is informal (phone call or email)
    //     with no system record of delegation scope, constraints, or
    //     the specific authorization delegated
    auditGapCount: 5,
    // Seven manual steps in the current export authorization process:
    // (1) Logistics Coordinator initiates shipment authorization request
    // (2) Export Officer verifies export classification (USML/ECCN)
    // (3) Export Officer performs denied party screening
    // (4) Export Officer evaluates license requirement and prepares package
    // (5) Legal Counsel reviews legal sufficiency
    // (6) EO/DEO reviews and signs authorization
    // (7) AES/EEI filing in ACE and documentation preparation
    approvalSteps: 7,
  },
  todayFriction: {
    ...ARCHETYPES["regulatory-compliance"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Logistics Coordinator submits export authorization request via email with export classification sheet, shipment details, and end-user information. Export Compliance System initiates automated denied party screening against OFAC SDN, BIS Entity List, BIS Unverified List, and BIS Denied Persons lists. Request routed to Export Officer's queue.",
        // Simulation-compressed: represents 2-4 hours real-world elapsed time
        // for request submission, initial screening, and queue routing
        delaySeconds: 8,
      },
      {
        trigger: "before-approval",
        description:
          "Export Officer manually verifying export classification -- cross-referencing USML category (22 CFR 121) for ITAR items or ECCN against Commerce Control List (15 CFR 774) for EAR items. Checking license determination: is a specific license required (DSP-5 for ITAR, BIS-748P for EAR), is a license exception available (EAR Part 740: STA, TMP, RPL, GOV, TSR), or is the item NLR? Reviewing end-user/end-use certificate (DSP-83) and evaluating destination country controls.",
        // Simulation-compressed: represents 2-4 hours real-world elapsed time
        // for thorough classification verification and license determination,
        // especially for complex multi-item shipments or dual-jurisdiction items
        delaySeconds: 7,
      },
      {
        trigger: "on-unavailable",
        description:
          "Empowered Official at a trade compliance seminar (ECTI / BIS Update Conference). Authorization package prepared by Export Officer but cannot be signed. DEO not immediately reachable. Shipping window closing -- carrier cutoff in hours. Customer penalties accruing under FMS LOA or DCS contract terms. Logistics Coordinator escalating informally to find a signatory.",
        // Simulation-compressed: represents 8-16 hours real-world elapsed time
        // while the EO is at the seminar and the DEO is being located
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Manual export classification review with EO at seminar, unsigned authorization package, closing shipping window, and informal escalation to locate DEO signatory",
  },
  todayPolicies: [
    {
      id: "policy-export-control-today",
      actorId: "export-control-office",
      threshold: {
        // Today: all 3 of 3 must approve AND the EO must sign. In practice,
        // the all-3-of-3 analytical review plus the EO signature requirement
        // means a single unavailable person blocks the entire authorization.
        // With the EO at a seminar, nothing moves.
        k: 3,
        n: 3,
        approverRoleIds: ["export-officer", "legal-counsel", "empowered-official"],
      },
      // Simulation-compressed: represents the real-world condition where
      // the authorization window effectively expires because the EO is
      // at a seminar and the 3-of-3 requirement with no delegation means
      // the package sits unsigned until the EO returns. The short simulation
      // expiry models the practical effect: the shipping window closes
      // before the authorization can be obtained.
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to ITAR/EAR export authorization
  // governance. The shared REGULATORY_DB["supply-chain"] entries (EAR section
  // 764 enforcement penalties, ISO 9001:2015 Clause 8.4 supplier evaluation)
  // are not specific enough for this scenario. ITAR 22 CFR 120.67 (EO
  // authority), ITAR 22 CFR 127 (violations), OFAC sanctions, and FTR
  // AES filing requirements are the directly applicable frameworks.
  regulatoryContext: [
    {
      framework: "ITAR",
      displayName: "ITAR 22 CFR 120.67 / 22 CFR 123",
      clause: "Empowered Official & Export Licenses",
      violationDescription:
        "Export of ITAR-controlled defense articles without proper Empowered Official authorization -- export authorization signed by a person who is not the designated EO or DEO, or export authorization package incomplete (missing classification verification, denied party screening, or end-user certification)",
      fineRange:
        "Criminal: up to $1M per violation and 20 years imprisonment (22 CFR 127.3). Civil: consent agreements commonly $10M-$100M+ for systemic violations (22 CFR 127.10). Debarment from all future ITAR exports.",
      severity: "critical",
      safeguardDescription:
        "Accumulate enforces mandatory Empowered Official (or DEO delegate) signature as a policy precondition for export authorization, with cryptographic proof of EO/DEO identity, delegation chain, classification verification, and denied party screening results -- satisfying 22 CFR 120.67 and 22 CFR 123 documentation requirements",
    },
    {
      framework: "EAR",
      displayName: "EAR 15 CFR 764",
      clause: "Enforcement and Penalties",
      violationDescription:
        "Export of EAR-controlled items without required license or valid license exception, or without completing denied party screening against BIS Entity List (Supplement No. 4 to 15 CFR 744) and BIS Denied Persons List",
      fineRange:
        "Civil: up to $300K per violation or 2x the transaction value (whichever is greater). Criminal: up to $1M per violation and 20 years imprisonment. Denial of export privileges.",
      severity: "critical",
      safeguardDescription:
        "Policy-enforced export authorization workflow ensures license determination, license exception evaluation (EAR Part 740), and denied party screening are completed and verified before authorization -- all captured in cryptographic proof chain",
    },
    {
      framework: "OFAC",
      displayName: "OFAC 31 CFR 500 series",
      clause: "Sanctions and SDN Screening",
      violationDescription:
        "Export transaction involving a Specially Designated National (SDN), blocked person, or sanctioned entity -- failure to screen all parties to the transaction (consignee, intermediate consignee, end-user, freight forwarder, financial institutions) against the OFAC SDN list before export",
      fineRange:
        "Civil: up to $307,922 per violation (adjusted annually) or 2x the transaction value. Criminal: up to $1M per violation and 20 years imprisonment. Potential asset seizure and forfeiture.",
      severity: "critical",
      safeguardDescription:
        "Automated denied party screening integrated into the authorization workflow -- all transaction parties screened against OFAC SDN, BIS lists, UN sanctions, and EU restrictive measures with screening results cryptographically linked to the export authorization record",
    },
    {
      framework: "FTR",
      displayName: "FTR 15 CFR Part 30",
      clause: "AES/EEI Filing Requirements",
      violationDescription:
        "Failure to file Electronic Export Information (EEI) through the Automated Export System (AES) in ACE before export of controlled items or items requiring export license -- missing or late AES filing, incorrect Schedule B classification, or failure to provide ITN to carrier",
      fineRange:
        "Civil: up to $10,000 per violation for late filing; up to $10,000 per day for failure to file. Criminal: up to $10,000 and 5 years imprisonment for knowingly filing false EEI.",
      severity: "high",
      safeguardDescription:
        "Export authorization workflow includes mandatory AES/EEI filing checkpoint -- the policy engine does not generate final authorization proof until AES filing is confirmed and ITN is recorded in the authorization record",
    },
  ],
  tags: [
    "supply-chain",
    "export-control",
    "compliance",
    "itar",
    "ear",
    "usml",
    "eccn",
    "empowered-official",
    "denied-party-screening",
    "ofac-sdn",
    "bis-entity-list",
    "customs",
    "shipping-window",
    "aes-filing",
    "defense-contractor",
    "fms",
    "22-cfr-120-67",
    "dsp-5",
    "license-determination",
  ],
};
