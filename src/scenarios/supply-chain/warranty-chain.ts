import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * Warranty Claim Authorization, Fraud Reduction & Dealer Network Governance
 *
 * Models the warranty claim Prior Authorization (PA) workflow at a global
 * automotive OEM processing warranty claims across a 5,000+ dealer network.
 * The core governance challenge is the centralized Warranty Director approval
 * requirement for high-value claims (engine, transmission, hybrid battery,
 * ADAS components) combined with high-volume periods that create PA backlogs.
 *
 * Key governance controls modeled:
 * - Warranty Director as mandatory approver for high-value PA claims
 *   (above the auto-adjudication threshold, typically $5K+)
 * - Delegation from Warranty Director to Regional Warranty Manager for
 *   claims within the Regional Manager's authority limit
 * - Delegation constrained by dollar threshold, claim type, and dealer
 *   SIU (Special Investigations Unit) audit status
 * - Auto-escalation to VP of Warranty Operations when both Warranty
 *   Director and Regional Manager are unavailable during high-volume periods
 * - WMS (Warranty Management System) as the technical control point
 *   enforcing auto-adjudication rules and fraud analytics integration
 * - Technical Service Manager as escalation for complex diagnostic claims
 *
 * Real-world references: DealerConnect (GM), GlobalConnect (Stellantis),
 * OASIS 2 (Ford), TIS (Toyota), B2B Connect (Hyundai-Kia), SAP Warranty
 * Management, Oracle Warranty Management, Tavant warranty.ai, SAS Warranty
 * Analytics, CDK Global DMS, Reynolds & Reynolds DMS
 *
 * Warranty claim lifecycle modeled:
 *   Dealer submits claim via dealer portal (DealerConnect / GlobalConnect)
 *   --> WMS auto-adjudication engine validates coverage, labor time, parts
 *   --> Claims rejected by rules engine routed to Claims Adjuster
 *   --> High-value claims (>$5K) require Prior Authorization (PA)
 *   --> PA reviewed by Warranty Director (or Regional Manager as delegate)
 *   --> Fraud analytics engine flags anomalous patterns before payment
 *   --> Parts Return Authorization (PRA) issued for causal parts
 *   --> Dealer payment processed (credit memo: parts + labor + sublet)
 *
 * Fraud detection patterns:
 *   - Repeat VIN claims (same vehicle with unusually high claim frequency)
 *   - Labor time inflation (dealer claims exceeding OEM flat-rate guide)
 *   - Parts harvesting (new OEM parts replaced with used/aftermarket)
 *   - Causal part substitution / shotgunning (multiple parts replaced
 *     to mask root cause and inflate parts cost)
 *   - Phantom repairs (repairs never actually performed)
 *   - Out-of-warranty claims (VIN past warranty expiration date/mileage)
 *   - Anomalous dealer CPV (Claims Per Vehicle) vs. regional average
 */
export const warrantyChainScenario: ScenarioTemplate = {
  id: "supply-chain-warranty-chain",
  name: "Warranty Claim Authorization & Fraud Reduction",
  description:
    "A global automotive OEM processes warranty claims across a 5,000+ dealer network through the Warranty Management System (WMS). High-value claims (engine, transmission, hybrid battery, ADAS components) exceeding the auto-adjudication threshold require Prior Authorization (PA) from the Warranty Director before the dealer can proceed with the repair. The Warranty Director is handling a high-volume backlog during summer driving season. Manual PA review without integrated fraud analytics allows claim leakage and abuse patterns -- repeat VIN claims, labor time inflation, parts harvesting, phantom repairs, and anomalous dealer CPV (Claims Per Vehicle) -- to go undetected. Delayed PA turnaround keeps customer vehicles in dealer service bays, contributing to lemon law 'days out of service' exposure and degrading dealer satisfaction scores. Annual warranty fraud losses at major OEMs range from $2B-$5B+.",
  icon: "Truck",
  industryId: "supply-chain",
  archetypeId: "delegated-authority",
  prompt:
    "What happens when high-value warranty claims requiring Prior Authorization pile up across a global dealer network because the Warranty Director is the centralized bottleneck, fraud analytics are not integrated into the PA review workflow, and delayed authorizations keep customer vehicles in dealer service bays -- contributing to lemon law exposure, dealer dissatisfaction, and undetected claim fraud?",

  // costPerHourDefault: cost impact of a delayed PA authorization. Includes:
  // - Dealer labor bay opportunity cost: $100-$200/hr (vehicle occupying a
  //   service bay that could be generating customer-pay revenue)
  // - Customer satisfaction impact: JD Power CSI score degradation, Net
  //   Promoter Score reduction (OEMs track warranty repair cycle time as
  //   a key CSI driver)
  // - Lemon law exposure: vehicle "days out of service" accumulating toward
  //   state lemon law thresholds (typically 15-30 cumulative days)
  // $250/hr is a conservative mid-range estimate combining dealer bay
  // opportunity cost and warranty operations overhead for a single
  // high-value PA claim.
  costPerHourDefault: 250,

  actors: [
    // --- Auto Manufacturer (the OEM processing warranty claims) ---
    {
      id: "auto-manufacturer",
      type: NodeType.Organization,
      label: "Auto Manufacturer",
      description:
        "Global automotive OEM processing $3B-$8B in annual warranty accruals across a 5,000+ dealer network in 60+ countries. Warranty cost of sales (WCOS) is a top-5 operating expense line item, directly impacting operating margin and IFRS 15 / ASC 606 warranty reserve adequacy.",
      parentId: null,
      organizationId: "auto-manufacturer",
      color: "#F59E0B",
    },

    // --- Warranty Operations Department ---
    // The functional department responsible for warranty claim policy,
    // claims authorization hierarchy, dealer performance management,
    // fraud investigation (SIU), and technical warranty escalation.
    {
      id: "warranty-dept",
      type: NodeType.Department,
      label: "Warranty Operations",
      description:
        "Centralized warranty function managing claims policy, Prior Authorization (PA) workflow, dealer performance scorecards (CPV, CPC, repair order completion rate), fraud analytics program (SIU -- Special Investigations Unit), technical warranty escalation, and warranty reserve forecasting. Oversees the claims authority hierarchy: auto-adjudication (60-80% of claims), Claims Adjuster ($0-$2K), Senior Claims Analyst ($2K-$10K), Regional Warranty Manager ($10K-$50K), Warranty Director ($50K+).",
      parentId: "auto-manufacturer",
      organizationId: "auto-manufacturer",
      color: "#06B6D4",
    },

    // --- Claims Center ---
    // The operational unit that processes claim submissions from the dealer
    // network. Handles 500,000+ claims per year at a major OEM. Claims
    // Adjusters perform first-line human review of claims rejected by the
    // WMS auto-adjudication engine.
    {
      id: "claims-center",
      type: NodeType.Department,
      label: "Claims Center",
      description:
        "Operational claims processing unit handling 500,000+ warranty claims per year from the global dealer network. Claims Adjusters perform first-line human review of claims rejected by WMS auto-adjudication rules. Manages Prior Authorization (PA) requests for high-value repairs, parts return tracking (PRA -- Parts Return Authorization), and dealer payment processing (credit memo: parts markup + labor reimbursement + sublet charges).",
      parentId: "auto-manufacturer",
      organizationId: "auto-manufacturer",
      color: "#06B6D4",
    },

    // --- Warranty Director ---
    // The senior claims authority for high-value PA claims exceeding $50K.
    // In the real OEM hierarchy, the Warranty Director oversees the entire
    // claims authorization program but only personally reviews very high-value
    // claims (engine/transmission assembly replacement, hybrid battery pack,
    // ADAS module, fleet/recall claims, systemic issue authorizations).
    // In this scenario, the Warranty Director is handling a high-volume
    // PA backlog during summer driving season, creating the bottleneck.
    {
      id: "warranty-director",
      type: NodeType.Role,
      label: "Warranty Director",
      description:
        "Senior claims authority for high-value Prior Authorization (PA) claims exceeding $50K (engine/transmission assembly replacement, hybrid battery pack, ADAS module replacement). Reviews PA requests with DTC (Diagnostic Trouble Code) data, repair history, TSB (Technical Service Bulletin) applicability, and fraud risk score from the WMS analytics engine. Currently handling high-volume PA backlog during summer driving season -- PA turnaround degraded from standard 2-4 hours to 24-48+ hours.",
      parentId: "warranty-dept",
      organizationId: "auto-manufacturer",
      color: "#94A3B8",
    },

    // --- Regional Warranty Manager ---
    // Delegation target for the Warranty Director. Manages dealer warranty
    // performance in a 200+ dealer region. Has authority to approve PA
    // claims within their delegation limit ($10K-$50K) for dealers not
    // flagged by the SIU. Cannot approve claims above their limit, claims
    // from SIU-flagged dealers, or claims with safety defect indicators.
    {
      id: "regional-manager",
      type: NodeType.Role,
      label: "Regional Warranty Manager",
      description:
        "Delegated regional authority managing dealer warranty performance across a 200+ dealer region. Maintains dealer scorecards (CPV -- Claims Per Vehicle, CPC -- Cost Per Claim, PRA compliance rate, repair order completion rate). Authorized to approve PA claims within delegation limit ($10K-$50K) for dealers not flagged by SIU. Conducts dealer warranty audits and claims adjuster training. Cannot approve claims from SIU-flagged dealers, claims with safety defect indicators requiring TREAD Act evaluation, or goodwill/policy adjustments above $5K.",
      parentId: "warranty-dept",
      organizationId: "auto-manufacturer",
      color: "#94A3B8",
    },

    // --- Claims Adjuster ---
    // First-line human reviewer for claims that fail WMS auto-adjudication.
    // Validates claim data (DTC codes, labor operations, parts replaced) and
    // processes PA requests from the dealer network. This is the workflow
    // initiator -- the Claims Adjuster submits the PA request to the
    // Warranty Director when the claim exceeds their authority limit.
    {
      id: "claims-adjuster",
      type: NodeType.Role,
      label: "Claims Adjuster",
      description:
        "First-line claims reviewer who processes claims rejected by WMS auto-adjudication: validates DTC (Diagnostic Trouble Code) data against OEM scan tool records, verifies labor time against OEM flat-rate guide, checks parts replaced against the causal complaint and repair order documentation, and validates warranty coverage (VIN within warranty period and mileage, component covered under basic/powertrain/extended/emissions warranty). Initiates Prior Authorization (PA) requests to Warranty Director for high-value repairs exceeding the auto-adjudication threshold.",
      parentId: "claims-center",
      organizationId: "auto-manufacturer",
      color: "#94A3B8",
    },

    // --- Technical Service Manager ---
    // Escalation role for complex technical claims requiring diagnostic
    // verification, TSB validation, and root cause analysis. Reviews
    // DTC data, OEM scan tool logs, and repair procedures to confirm
    // the diagnosis before PA authorization. Also responsible for
    // identifying potential safety defects for TREAD Act reporting.
    {
      id: "tech-service-manager",
      type: NodeType.Role,
      label: "Technical Service Manager",
      description:
        "Field Service Engineer who reviews complex technical PA claims (engine/transmission failure root cause, hybrid battery degradation diagnostics, ADAS calibration failures). Verifies DTC data against OEM scan tool logs, validates TSB (Technical Service Bulletin) applicability, confirms repair procedure correctness, and performs root cause analysis for emerging quality issues feeding the TREAD Act early warning system. Escalation target for Claims Adjusters handling technically complex PA requests.",
      parentId: "warranty-dept",
      organizationId: "auto-manufacturer",
      color: "#94A3B8",
    },

    // --- VP of Warranty Operations (escalation authority) ---
    // Escalation target when both Warranty Director and Regional Warranty
    // Manager are unavailable during high-volume periods. Can authorize
    // expedited PA processing, invoke emergency claims review procedures,
    // or approve systemic issue authorizations affecting multiple dealers.
    {
      id: "vp-warranty",
      type: NodeType.Role,
      label: "VP of Warranty Operations",
      description:
        "Escalation authority for high-value PA claims when both Warranty Director and Regional Warranty Manager are unavailable during high-volume periods (summer driving season, post-recall spikes, end-of-month claim surges). Can authorize expedited PA processing, approve systemic issue authorizations affecting multiple dealers, and invoke emergency claims review procedures. Oversees warranty reserve adequacy ($3B-$8B annual accruals) and warranty cost reduction (WCR) program.",
      parentId: "auto-manufacturer",
      organizationId: "auto-manufacturer",
      color: "#94A3B8",
    },

    // --- Warranty Management System (WMS) ---
    // The enterprise claims processing platform that enforces auto-adjudication
    // rules, manages dealer portal interactions, integrates fraud analytics,
    // and processes dealer payments. This is the technical enforcement mechanism.
    {
      id: "wms-system",
      type: NodeType.System,
      label: "Warranty Management System",
      description:
        "Enterprise WMS (DealerConnect / GlobalConnect / OASIS 2 / TIS / B2B Connect) integrated with SAP Warranty Management or Oracle Warranty Management. Enforces auto-adjudication rules (coverage validation, flat-rate labor time verification, parts-to-complaint matching) -- auto-approves 60-80% of standard claims with zero human review. Routes rejected claims to Claims Adjuster queue. Manages Prior Authorization (PA) workflow for high-value repairs. Integrates fraud analytics engine (Tavant warranty.ai / SAS Warranty Analytics / IBM Warranty Analytics) for real-time claim risk scoring, dealer anomaly detection (CPV, CPC, labor time deviation), and SIU case management. Processes dealer payments (credit memo: parts markup + labor reimbursement + sublet) and Parts Return Authorizations (PRA).",
      parentId: "auto-manufacturer",
      organizationId: "auto-manufacturer",
      color: "#8B5CF6",
    },

    // --- Dealer (franchised partner) ---
    // The external franchised dealer that submits warranty claims through
    // the dealer portal. Dealers are independently owned and operated
    // businesses under a franchise agreement with the OEM. They are
    // partners in the retail distribution channel, not vendors/suppliers.
    {
      id: "dealer",
      type: NodeType.Partner,
      label: "Dealer",
      description:
        "Franchised dealer submitting warranty claims through the dealer portal (DealerConnect / GlobalConnect / OASIS 2 / TIS / B2B Connect) with repair order data: VIN, mileage, DTC codes from OEM scan tool, labor operation codes (OEM flat-rate), causal part number, parts replaced, sublet charges. Subject to dealer performance scorecard (CPV, CPC, PRA compliance rate) and periodic warranty audits. Dealer labor reimbursement rates governed by franchise/dealer agreement (parts markup, labor rate, sublet rate).",
      parentId: null,
      organizationId: "dealer",
      color: "#F59E0B",
    },
  ],
  policies: [
    {
      id: "policy-warranty-claim",
      // Policy attached to the Warranty Operations department, which owns
      // the claims authorization hierarchy and PA workflow. The WMS enforces
      // auto-adjudication rules; this policy governs the human authorization
      // tier for high-value claims that exceed the auto-adjudication threshold.
      actorId: "warranty-dept",
      threshold: {
        // 1-of-1: Warranty Director is the sole human authority for PA
        // claims above $50K. This models the high-value claim bottleneck
        // where centralized director approval is required. Standard claims
        // ($0-$2K) are auto-adjudicated by the WMS or approved by Claims
        // Adjusters -- they never reach this policy. Claims $2K-$50K are
        // handled by the tiered authority structure below the director.
        // This policy specifically models the PA authorization for the
        // highest-value claims where the director is the bottleneck.
        k: 1,
        n: 1,
        approverRoleIds: ["warranty-director"],
      },
      // 24 hours (86,400 seconds) -- represents the PA authority window for
      // high-value claims. Standard PA turnaround is 2-4 hours for routine
      // requests, 24-48 hours for complex requests requiring technical
      // escalation (Field Service Engineer review, DTC data analysis, TSB
      // validation). 24 hours accommodates the standard PA review cycle
      // while remaining time-bound. During high-volume periods, the actual
      // PA turnaround may exceed this window, triggering delegation or
      // escalation.
      expirySeconds: 86400,
      delegationAllowed: true,
      // Delegation: Warranty Director delegates to Regional Warranty Manager.
      // This is the standard OEM delegation model -- Regional Managers have
      // delegated authority within their region and dollar limit.
      delegateToRoleId: "regional-manager",
      // Warranty Director is mandatory for PA claims above $50K. The
      // Regional Manager can handle claims within their delegation limit
      // ($10K-$50K), but the Warranty Director (or VP of Warranty via
      // escalation) must authorize the highest-value claims.
      mandatoryApprovers: ["warranty-director"],
      // Delegation from Warranty Director to Regional Warranty Manager
      // is constrained by dollar threshold, claim type, dealer SIU status,
      // and safety defect indicators. The Regional Manager CANNOT approve:
      // - Claims above their authority limit ($50K+)
      // - Claims from dealers flagged by SIU for investigation or audit
      // - Claims with potential safety defect indicators (must be escalated
      //   to Technical Service Manager for TREAD Act evaluation)
      // - Goodwill/policy adjustments above $5K
      // - Fleet or recall-related claims (handled by Warranty Director
      //   or dedicated recall claims team)
      delegationConstraints:
        "Delegation from Warranty Director to Regional Warranty Manager is limited to PA claims within the Regional Manager's authority limit ($10K-$50K), from dealers not flagged by the SIU (Special Investigations Unit) for investigation or audit, with no safety defect indicators requiring TREAD Act evaluation, and no goodwill/policy adjustments above $5K. Claims above $50K, claims from SIU-flagged dealers, claims with potential safety defect indicators, fleet/recall-related claims, and goodwill adjustments above $5K require Warranty Director or VP of Warranty direct review.",
      escalation: {
        // Simulation-compressed: 20 seconds represents real-world escalation
        // trigger of approximately 4 hours after the PA request is submitted
        // without authorization. During high-volume periods (summer driving
        // season, post-recall spikes), both the Warranty Director and Regional
        // Manager may be overwhelmed. Auto-escalation to VP of Warranty
        // Operations ensures high-value PA claims are not blocked indefinitely.
        // The VP can: (a) authorize expedited PA processing, (b) approve the
        // claim directly (VP typically holds $100K+ authority), or (c) invoke
        // emergency claims review procedures for systemic issues.
        afterSeconds: 20,
        toRoleIds: ["vp-warranty"],
      },
      // Claims are processed in the production WMS environment. The dollar
      // amount cap ($50,000) represents the Regional Manager's maximum
      // delegation authority. Claims above this amount require Warranty
      // Director or VP of Warranty direct authorization.
      constraints: {
        amountMax: 50000,
        environment: "production",
      },
    },
  ],
  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "auto-manufacturer", targetId: "warranty-dept", type: "authority" },
    { sourceId: "auto-manufacturer", targetId: "claims-center", type: "authority" },
    { sourceId: "auto-manufacturer", targetId: "vp-warranty", type: "authority" },
    { sourceId: "auto-manufacturer", targetId: "wms-system", type: "authority" },
    { sourceId: "warranty-dept", targetId: "warranty-director", type: "authority" },
    { sourceId: "warranty-dept", targetId: "regional-manager", type: "authority" },
    { sourceId: "warranty-dept", targetId: "tech-service-manager", type: "authority" },
    { sourceId: "claims-center", targetId: "claims-adjuster", type: "authority" },
    // --- Delegation edge (Warranty Director -> Regional Warranty Manager) ---
    // Warranty Director delegates PA authorization to Regional Warranty Manager
    // within the delegation constraints (dollar limit, non-SIU dealers, no
    // safety defects).
    {
      sourceId: "warranty-director",
      targetId: "regional-manager",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "High-value warranty claim Prior Authorization with fraud analytics integration and dealer performance validation",
    initiatorRoleId: "claims-adjuster",
    targetAction:
      "Authorize High-Value Warranty Claim Prior Authorization with Fraud Risk Scoring, DTC Verification, and Dealer Performance Validation",
    description:
      "Claims Adjuster initiates Prior Authorization (PA) request for a high-value warranty claim from the dealer network. The WMS auto-adjudication engine has already validated basic coverage (VIN within warranty period, component covered) and flagged the claim for human PA review because the repair cost exceeds the auto-adjudication threshold ($5K+). Claims Adjuster verifies DTC data, labor time against OEM flat-rate guide, and parts-to-complaint matching. Fraud analytics engine provides real-time risk score (dealer CPV anomaly, repeat VIN pattern, labor time deviation). Warranty Director (or Regional Warranty Manager as delegate) reviews the PA request with fraud risk data, DTC verification, TSB applicability, and dealer performance scorecard. PA authorization releases the dealer to proceed with the repair and triggers Parts Return Authorization (PRA) for the causal part.",
  },
  beforeMetrics: {
    // Wall-clock elapsed time from PA request initiation to authorization,
    // including asynchronous review cycles, approver unavailability, and
    // queue wait time. Active manual effort is approximately 6-10 hours:
    //   - Claims Adjuster: 2-3 hours (claim validation, DTC review, labor
    //     time verification, parts-to-complaint matching, PA request
    //     preparation with supporting documentation)
    //   - Warranty Director: 1-2 hours (PA review against coverage terms,
    //     fraud risk data, TSB applicability, dealer performance scorecard)
    //   - Technical Service Manager (if escalated): 2-4 hours (complex
    //     diagnostic review, root cause analysis, TSB validation)
    //   - Parts Return processing: 0.5-1 hour (PRA issuance and tracking)
    // The 24-hour wall-clock figure represents PA turnaround during high-volume
    // periods when the Warranty Director is handling a backlog. Standard PA
    // turnaround is 2-4 hours for routine requests, but degrades to 24-48+
    // hours during summer driving season, post-recall spikes, or end-of-month
    // claim surges.
    manualTimeHours: 24,
    // 7 days of risk exposure represents the systemic impact of PA delays
    // across the dealer network during high-volume periods:
    // - Customer vehicles sitting in dealer service bays accumulate "days
    //   out of service" toward state lemon law thresholds (typically 15-30
    //   cumulative days trigger lemon law remedies)
    // - Delayed safety-related claims create TREAD Act reporting exposure
    //   (warranty claims indicating potential safety defects must be reported
    //   to NHTSA within the OEM's early warning reporting cycle)
    // - Dealer satisfaction scores (OEM dealer satisfaction surveys) degrade
    //   when PA turnaround exceeds 4 hours, impacting dealer retention and
    //   franchise relationship health
    // - Fraud risk: claims sitting in the PA queue without fraud analytics
    //   screening may be paid without pattern detection, increasing claim
    //   leakage during high-volume periods when review rigor is reduced
    riskExposureDays: 7,
    // Five audit gaps in the current manual PA process:
    // (1) No fraud analytics integration -- PA claims reviewed and approved
    //     without real-time risk scoring, dealer CPV anomaly detection, or
    //     pattern matching (repeat VIN, labor time inflation, parts harvesting).
    //     Fraud patterns detected only retroactively during annual dealer audits.
    // (2) No DTC/TSB cross-reference in PA workflow -- repair diagnosis not
    //     validated against known issues (Technical Service Bulletins) or
    //     verified against OEM scan tool DTC data before PA authorization.
    //     Dealer may claim a different repair than what the DTC data supports.
    // (3) Delegation authority not documented -- Regional Manager approves PA
    //     claims without system record of delegation scope, dollar authority
    //     limit, or whether the dealer is flagged by SIU. Auditor cannot
    //     verify the delegate had authority for the specific claim.
    // (4) No Parts Return tracking linked to PA claim -- Parts Return
    //     Authorization (PRA) compliance not verified before dealer payment.
    //     Dealers may be paid for parts they never returned, enabling parts
    //     harvesting fraud.
    // (5) No dealer performance scoring in PA workflow -- high-CPV dealers
    //     (anomalous claims-per-vehicle rate compared to regional average)
    //     treated identically to compliant dealers. SIU-flagged dealers not
    //     blocked from delegation pathway.
    auditGapCount: 5,
    // Five manual steps in the current high-value PA process:
    // (1) Dealer submits claim via dealer portal with repair order, DTC data,
    //     and parts documentation
    // (2) Claims Adjuster validates claim data (coverage, labor time, parts)
    //     and prepares PA request
    // (3) Warranty Director reviews PA request against coverage terms and
    //     repair documentation (no fraud data, no dealer scorecard)
    // (4) PA authorized -- dealer proceeds with repair (or PA denied with
    //     reason code, sent back to dealer for correction)
    // (5) Parts Return Authorization issued -- dealer must return causal
    //     part to OEM parts return center within 15-30 days
    approvalSteps: 5,
  },
  todayFriction: {
    ...ARCHETYPES["delegated-authority"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Dealer submits warranty claim through dealer portal (DealerConnect / GlobalConnect / OASIS 2 / TIS) with repair order data: VIN, mileage, DTC codes from OEM scan tool, labor operation codes (OEM flat-rate), causal part number, parts replaced. Claims Adjuster manually validates claim data -- coverage verification, labor time against OEM flat-rate guide, parts-to-complaint matching -- and prepares PA request for Warranty Director review. No integrated fraud risk score or dealer performance data in the PA request.",
        // Simulation-compressed: represents 2-4 hours real-world elapsed time
        // for dealer claim submission, Claims Adjuster validation, and PA
        // request preparation
        delaySeconds: 5,
      },
      {
        trigger: "before-approval",
        description:
          "Warranty Director reviewing PA request against warranty coverage terms -- checking VIN warranty status (basic, powertrain, extended, emissions), repair cost estimate, and DTC data. No fraud analytics dashboard, no dealer CPV/CPC scorecard, no repeat VIN history, no labor time deviation analysis. Review based on repair order documentation alone, without risk intelligence from the WMS fraud analytics engine.",
        // Simulation-compressed: represents 2-4 hours standard PA turnaround
        // for routine requests; 24-48 hours for complex technical claims
        // requiring Field Service Engineer escalation
        delaySeconds: 6,
      },
      {
        trigger: "on-unavailable",
        description:
          "Warranty Director handling high-volume PA backlog during summer driving season -- 200+ PA requests in queue. Regional Warranty Manager's authority unclear without system-enforced delegation. Dealers calling regional offices seeking PA status. Customer vehicles sitting in dealer service bays accumulating days-out-of-service toward lemon law thresholds. Fraud patterns (repeat VIN claims, labor time inflation, anomalous dealer CPV) undetected in the PA backlog -- review rigor degrades under volume pressure.",
        // Simulation-compressed: represents 8-24 hours real-world delay when
        // Warranty Director is overwhelmed during high-volume periods and no
        // formal delegation to Regional Manager is configured
        delaySeconds: 10,
      },
    ],
    narrativeTemplate:
      "Centralized PA review without fraud analytics, dealer performance scoring, or DTC/TSB cross-reference -- manual claims processing with delegation authority unclear and SIU intelligence not integrated into the approval workflow",
  },
  todayPolicies: [
    {
      id: "policy-warranty-claim-today",
      // Today's policy: 1-of-1 from Warranty Director with no delegation,
      // no escalation, and no fraud analytics integration. Every high-value
      // claim must wait for the Warranty Director regardless of the backlog.
      actorId: "warranty-dept",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["warranty-director"],
      },
      // Simulation-compressed: represents the practical effect of the PA
      // request expiring (stalling) because the Warranty Director is
      // overwhelmed during high-volume periods. The short expiry models
      // the dealer experience: the PA request effectively times out
      // because the Warranty Director cannot review it in time.
      expirySeconds: 20,
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to warranty claims authorization,
  // fraud reduction, and dealer network governance. The shared
  // REGULATORY_DB["supply-chain"] entries (EAR section 764, ISO 9001
  // Clause 8.4) are not applicable to warranty claims. The directly
  // applicable frameworks are Magnuson-Moss (consumer warranty obligations),
  // FTC Warranty Rules (warranty disclosure and dispute resolution),
  // NHTSA TREAD Act (safety-related warranty claims data reporting),
  // and IFRS 15 / ASC 606 (warranty reserve accounting).
  regulatoryContext: [
    {
      framework: "Magnuson-Moss",
      displayName: "Magnuson-Moss Warranty Act (15 USC 2301-2312)",
      clause: "Full/Limited Warranty Obligations & Anti-Tying",
      violationDescription:
        "Systematic delay in processing legitimate warranty claims or denial of claims without documented basis -- OEM fails to honor warranty terms offered to consumers. Delayed PA authorization contributes to customer vehicles being out of service beyond reasonable repair time, creating Magnuson-Moss exposure when consumers are deprived of the benefit of the warranty through OEM process failures.",
      fineRange:
        "Federal cause of action for breach of warranty; consumer class action liability ($10M-$500M+ in settlements for systematic denial patterns); state attorney general enforcement actions; FTC investigation under Section 5 for unfair trade practices",
      severity: "critical",
      safeguardDescription:
        "Accumulate enforces time-bound PA authorization with delegation and escalation rules, ensuring warranty claims are processed within the OEM's committed turnaround SLA. Cryptographic proof of PA authorization timing, delegation chain, and claim disposition satisfies Magnuson-Moss documentation requirements and provides evidence of good-faith warranty performance.",
    },
    {
      framework: "TREAD Act",
      displayName: "NHTSA TREAD Act (49 USC 30118-30120)",
      clause: "Early Warning Reporting -- Warranty Claims Data",
      violationDescription:
        "Failure to report warranty claims data indicating potential safety defects to NHTSA within the Early Warning Reporting (EWR) cycle (49 CFR Part 579). Warranty claims for safety-critical components (brakes, steering, fuel system, airbags, electronic stability control) must be aggregated and reported. Delayed PA processing for safety-related claims delays the OEM's ability to identify emerging safety defect patterns and meet TREAD Act reporting obligations.",
      fineRange:
        "Civil penalties up to $26,315 per violation, maximum $131,564,183 per related series of violations (adjusted annually per 49 CFR Part 578). Criminal penalties for concealment of safety defects. NHTSA consent order and monitorship.",
      severity: "critical",
      safeguardDescription:
        "WMS fraud analytics engine flags claims with safety-critical component codes (brakes, steering, fuel system, airbags, ESC) for mandatory Technical Service Manager review before PA authorization. Safety defect indicators are routed to the TREAD Act early warning reporting system with cryptographic proof of detection timestamp and escalation chain.",
    },
    {
      framework: "FTC Warranty Rules",
      displayName: "FTC 16 CFR Parts 700-703",
      clause: "Warranty Disclosure & Dispute Settlement",
      violationDescription:
        "Failure to comply with Pre-Sale Availability Rule (Part 702), Disclosure Rule (Part 701), or informal dispute settlement mechanisms (Part 703) in the warranty claim handling process. Systematic claim processing delays or inconsistent adjudication standards across the dealer network may constitute unfair or deceptive trade practices under FTC Act Section 5 (15 USC 45).",
      fineRange:
        "FTC enforcement action; consumer redress order; civil penalties up to $50,120 per violation (adjusted annually); consent decree with ongoing compliance monitoring",
      severity: "high",
      safeguardDescription:
        "Policy-enforced claim adjudication with consistent authorization standards, delegation constraints, and audit trail satisfying FTC disclosure and dispute settlement requirements. Cryptographic proof of claim disposition, denial reason codes, and appeal path documentation.",
    },
    {
      framework: "IFRS 15 / ASC 606",
      displayName: "IFRS 15 / ASC 606",
      clause: "Warranty Accrual & Reserve Adequacy",
      violationDescription:
        "Warranty fraud and claim leakage inflating warranty cost of sales (WCOS) beyond actuarially projected warranty reserve levels. Undetected fraud patterns (repeat VIN claims, phantom repairs, parts harvesting) cause warranty accrual shortfalls. Inadequate fraud detection program results in material misstatement of warranty reserves under IFRS 15 / ASC 606, with potential restatement risk.",
      fineRange:
        "SEC enforcement action for material misstatement of warranty reserves; auditor qualification of financial statements; SOX Section 302/404 internal control material weakness finding; shareholder derivative litigation",
      severity: "high",
      safeguardDescription:
        "Integrated fraud analytics with real-time claim risk scoring, dealer anomaly detection, and SIU case management. Cryptographic proof of fraud screening for every paid claim supports warranty reserve adequacy testing and ICFR (Internal Controls over Financial Reporting) documentation.",
    },
  ],
  tags: [
    "supply-chain",
    "warranty",
    "delegation",
    "claims",
    "fraud-analytics",
    "dealer-network",
    "regional-delegation",
    "claims-management",
    "dealer-performance",
    "prior-authorization",
    "wms",
    "magnuson-moss",
    "tread-act",
    "lemon-law",
    "cpv",
    "siu",
    "dtc",
    "tsb",
    "parts-return",
  ],
};
