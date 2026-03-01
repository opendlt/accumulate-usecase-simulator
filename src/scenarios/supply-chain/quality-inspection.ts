import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * Scenario: Incoming Material Inspection & Conditional Release
 *
 * Models the governance friction in incoming material inspection at a
 * high-throughput manufacturing facility. The core conflict is between
 * production continuity (materials needed on the line) and quality
 * assurance (materials must be inspected before entering production).
 *
 * Key governance mechanisms:
 * - Delegation: QC Inspector -> Backup QC Inspector (inspection authority)
 * - Escalation: QC Inspector -> Quality Manager (conditional release authority)
 * - Second-tier escalation: Quality Manager -> Plant Manager (if Quality Manager unavailable)
 *
 * Regulatory foundation:
 * - ISO 9001:2015 Clause 8.6: Release of Products and Services
 * - ISO 9001:2015 Clause 8.7: Control of Nonconforming Outputs
 * - IATF 16949:2016 Clause 8.6.4: Verification of Externally Provided Products
 */
export const qualityInspectionScenario: ScenarioTemplate = {
  id: "supply-chain-quality-inspection",
  name: "Incoming Material Inspection & Conditional Release",
  description:
    "A high-throughput manufacturing facility receives critical raw materials that must be inspected and released through MES/ERP before entering production. During peak shifts, QC Inspector workload creates 4-8 hour release delays. Materials sit in inspection hold (quality inspection stock) while production risks slowing or stopping -- losses range from $25K-$100K per hour in mid-to-high-value manufacturing. When the QC Inspector cannot clear the backlog, the Quality Manager must decide whether to authorize conditional release with traceability controls and documented risk acceptance, or to hold material pending full inspection. Informal workarounds emerge under production pressure, bypassing the quality function's disposition authority.",
  icon: "Truck",
  industryId: "supply-chain",
  archetypeId: "threshold-escalation",
  prompt:
    "What happens when critical raw materials are scanned into MES but the QC Inspector is handling peak-shift workload and materials sit in inspection hold while production losses mount at $25K-$100K per hour -- and conditional release authority sits with the Quality Manager, not the production team pressuring for release?",

  // costPerHourDefault: mid-range of the $25K-$100K/hr production loss estimate.
  // Automotive assembly would be higher ($22K-$50K per *minute*); electronics
  // would be lower ($5K-$25K/hr). This is calibrated for mid-to-high-value
  // discrete manufacturing (industrial equipment, heavy machinery, aerospace
  // subassembly).
  costPerHourDefault: 50000,

  actors: [
    {
      id: "factory",
      type: NodeType.Organization,
      label: "Manufacturing Plant",
      parentId: null,
      organizationId: "factory",
      color: "#F59E0B",
    },
    {
      id: "quality-control",
      type: NodeType.Department,
      label: "Quality Control",
      description:
        "Manages incoming inspection workflow, statistical quality control (SQC), and material disposition (accept/reject/conditional release) through MES/QMS integration. Owns quality disposition authority independent of production management per ISO 9001:2015 Clause 5.3.",
      parentId: "factory",
      organizationId: "factory",
      color: "#06B6D4",
    },
    {
      id: "receiving",
      type: NodeType.Department,
      label: "Receiving",
      description:
        "Operates the receiving dock -- goods receipt posting in ERP (inspection stock), material identification and staging in the inspection hold area, and initial Certificate of Analysis (CoA) document collection from carriers.",
      parentId: "factory",
      organizationId: "factory",
      color: "#06B6D4",
    },
    {
      id: "quality-manager",
      type: NodeType.Role,
      label: "Quality Manager",
      description:
        "Quality disposition authority for conditional release decisions -- authorizes material release to production before inspection is complete under ISO 9001:2015 Clause 8.6, with documented risk acceptance, lot traceability controls, and time-bound follow-up inspection requirement. Convenes Material Review Board (MRB) for recurring or complex quality issues. Reports independently of production management per IATF 16949 Clause 5.3.2.",
      parentId: "quality-control",
      organizationId: "factory",
      color: "#94A3B8",
    },
    {
      id: "qc-inspector",
      type: NodeType.Role,
      label: "QC Inspector",
      description:
        "ASQ CQI-certified inspector -- performs incoming material inspection per ANSI/ASQ Z1.4 sampling plan: visual check, dimensional measurement, Certificate of Analysis (CoA) comparison against purchase specification limits, and sample testing. Prioritizes inspection lots by risk classification and production demand. Workload creates 4-8 hour backlogs during peak shifts (Monday mornings, end-of-month shipping surges, shift changes).",
      parentId: "quality-control",
      organizationId: "factory",
      color: "#94A3B8",
    },
    {
      id: "backup-qc-inspector",
      type: NodeType.Role,
      label: "Backup QC Inspector",
      description:
        "Qualified alternate inspector (ASQ CQI-certified, trained on relevant material categories) who can take over inspection lots when the primary QC Inspector is at capacity. Delegation of inspection authority requires current qualification for the specific inspection type (visual, dimensional, chemical) per ISO 9001:2015 Clause 7.2 (Competence).",
      parentId: "quality-control",
      organizationId: "factory",
      color: "#94A3B8",
    },
    {
      id: "receiving-manager",
      type: NodeType.Role,
      label: "Receiving Manager",
      description:
        "Oversees receiving dock operations -- initiates inspection requests in MES/ERP when materials arrive and monitors inspection hold status against production schedule requirements. Escalates production-critical inspection delays to Quality Manager.",
      parentId: "receiving",
      organizationId: "factory",
      color: "#94A3B8",
    },
    {
      id: "plant-manager",
      type: NodeType.Role,
      label: "Plant Manager",
      description:
        "Second-tier escalation authority -- becomes involved only when the Quality Manager is also unavailable. Has production authority but not quality disposition authority. Can authorize expedited resource allocation (overtime, backup inspector redeployment) but conditional release decisions must be ratified by Quality Manager within 24 hours per ISO 9001:2015 Clause 5.3.",
      parentId: "factory",
      organizationId: "factory",
      color: "#94A3B8",
    },
    {
      id: "mes-erp-system",
      type: NodeType.System,
      label: "MES / ERP System",
      description:
        "Manufacturing Execution System integrated with ERP (e.g., SAP QM/PP/MM, Siemens Opcenter Execution, Rockwell FactoryTalk ProductionCentre). Manages: goods receipt posting to inspection stock, automatic inspection lot creation, inspector work queue routing by material risk classification, CoA/CoC digital verification against purchase specifications, statistical sampling plan enforcement (ANSI/ASQ Z1.4 / ISO 2859-1 AQL calculations), usage decision recording (accept/reject/conditional release), and production stock release on acceptance.",
      parentId: "factory",
      organizationId: "factory",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-quality-inspection",
      actorId: "quality-control",
      threshold: {
        // 1-of-1: QC Inspector must complete inspection and make usage decision
        // (accept/reject). For conditional release (material released before
        // inspection is complete), the Quality Manager is the mandatory approver.
        k: 1,
        n: 1,
        approverRoleIds: ["qc-inspector"],
      },
      // 1 hour (3600 seconds) -- represents the maximum acceptable inspection
      // turnaround time for production-critical material before conditional
      // release escalation should be triggered. Calibrated against the 4-8 hour
      // peak-shift backlog: 1 hour is the threshold at which production impact
      // becomes significant enough to warrant Quality Manager involvement.
      expirySeconds: 3600,
      delegationAllowed: true,
      // Delegation of inspection authority to a qualified backup QC Inspector
      // when the primary inspector is at capacity. This is delegation of
      // inspection execution, not delegation of quality disposition authority.
      delegateToRoleId: "backup-qc-inspector",
      // Quality Manager is mandatory for any conditional release decision.
      // The QC Inspector can accept or reject material, but conditional release
      // (releasing material to production before inspection is complete or with
      // accepted deviations) requires Quality Manager authorization per
      // ISO 9001:2015 Clause 8.6.
      mandatoryApprovers: ["quality-manager"],
      delegationConstraints:
        "Delegation limited to ASQ CQI-certified inspectors with current qualification for the specific material category and inspection type (visual, dimensional, chemical). Backup inspector must be trained on the applicable sampling plan (ANSI/ASQ Z1.4 / ISO 2859-1) and have access to the relevant purchase specifications. Delegation covers inspection execution only -- conditional release (concession) decisions require Quality Manager authorization regardless of delegation status.",
      escalation: {
        // Simulation-compressed: 20 seconds represents the real-world threshold
        // (approximately 1 hour) at which an unresponded inspection request
        // triggers automatic escalation to the Quality Manager for conditional
        // release evaluation. The Quality Manager assesses whether to: (a) assign
        // a backup inspector, (b) authorize conditional release with traceability
        // controls, or (c) hold material pending full inspection.
        afterSeconds: 20,
        toRoleIds: ["quality-manager"],
      },
      // Conditional release policy governs material entering the production
      // environment. Non-production material (lab samples, R&D material) follows
      // a different inspection pathway with different authority requirements.
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    { sourceId: "factory", targetId: "quality-control", type: "authority" },
    { sourceId: "factory", targetId: "receiving", type: "authority" },
    { sourceId: "quality-control", targetId: "quality-manager", type: "authority" },
    { sourceId: "quality-control", targetId: "qc-inspector", type: "authority" },
    {
      sourceId: "quality-control",
      targetId: "backup-qc-inspector",
      type: "authority",
    },
    { sourceId: "receiving", targetId: "receiving-manager", type: "authority" },
    { sourceId: "factory", targetId: "plant-manager", type: "authority" },
    { sourceId: "factory", targetId: "mes-erp-system", type: "authority" },
    // Delegation edge: QC Inspector can delegate inspection execution to
    // the Backup QC Inspector when at capacity (not conditional release authority)
    {
      sourceId: "qc-inspector",
      targetId: "backup-qc-inspector",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "Incoming material inspection and conditional release through MES/ERP with quality disposition authority",
    initiatorRoleId: "receiving-manager",
    targetAction: "Release Incoming Materials from Inspection Hold for Production",
    description:
      "Receiving Manager creates goods receipt in ERP (inspection stock posting) and initiates inspection request in MES. QC Inspector must perform inspection per ANSI/ASQ Z1.4 sampling plan and make usage decision (accept/reject). During peak shifts, 4-8 hour backlogs develop. If QC Inspector is at capacity, inspection can be delegated to a qualified Backup QC Inspector. If inspection cannot be completed within the production-critical window, auto-escalation to Quality Manager for conditional release evaluation -- authorizing material release to production with documented risk acceptance, lot traceability controls, and mandatory follow-up inspection within 24-48 hours. Plant Manager is second-tier escalation if Quality Manager is unavailable.",
  },
  beforeMetrics: {
    // 6 hours: average peak-shift inspection delay. Composed of:
    // - 0.5-1 hour: material sits in inspection hold before QC Inspector is paged
    // - 2-4 hours: QC Inspector working through backlog (20-40 lots ahead in queue,
    //   15-45 minutes per inspection depending on complexity)
    // - 1-2 hours: when production pressure escalates, informal workaround time
    //   (calling Plant Manager, verbal conditional release, no documentation)
    // Range: 4-8 hours. 6 hours is the midpoint and represents a typical
    // peak-shift Monday morning or end-of-month scenario.
    manualTimeHours: 6,
    // 2 days: risk exposure window from conditional release to follow-up
    // inspection completion. When material is conditionally released to
    // production, non-conforming material may be incorporated into work-in-
    // progress or finished goods for up to 48 hours before the deferred
    // inspection is completed and the final usage decision is made. If the
    // follow-up inspection reveals non-conformance, the facility must trace
    // and potentially recall all affected production batches.
    riskExposureDays: 2,
    // 4 audit gaps:
    // (1) Paper CoA/CoC comparison at loading dock -- no digital record linking
    //     actual test values to purchase specification limits in MES/QMS
    // (2) PA system paging for QC Inspector -- no documented notification trail
    //     or timestamp in MES showing when inspector was notified
    // (3) Conditional release authorized verbally by Plant Manager -- no
    //     documented risk acceptance, no quality disposition record in QMS,
    //     no evidence of quality function involvement
    // (4) No traceability link between conditionally released material lots
    //     and the deferred follow-up inspection outcome -- if follow-up
    //     inspection finds non-conformance, no systematic way to identify
    //     which production batches used the conditionally released material
    auditGapCount: 4,
    // 4 approval/processing steps:
    // (1) Receiving Clerk scans material and creates goods receipt
    // (2) QC Inspector paged via PA system
    // (3) Inspector performs inspection (CoA review, sampling, measurement)
    // (4) Inspector makes usage decision (accept/reject/conditional release)
    // Note: in the "today" scenario, conditional release bypasses the Quality
    // Manager and goes directly to Plant Manager verbal authorization, which
    // is counted as an informal step, not a formal approval step.
    approvalSteps: 4,
  },
  todayFriction: {
    ...ARCHETYPES["threshold-escalation"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Materials scanned at receiving dock -- goods receipt posted to inspection stock in ERP. Receiving Clerk pages QC Inspector via factory PA system. No digital notification trail in MES -- inspector may not hear page or may be at a remote inspection bay.",
        // Simulation-compressed: represents 30-60 minutes real-world delay
        // between material arrival and inspector acknowledgment during peak shift
        delaySeconds: 6,
      },
      {
        trigger: "before-approval",
        description:
          "QC Inspector reviewing paper Certificate of Analysis (CoA) against purchase specification limits at loading dock -- manual comparison of actual test values (chemical composition, mechanical properties, dimensional tolerances) with no digital verification record. Inspector also performing visual inspection and pulling samples per ANSI/ASQ Z1.4 sampling plan.",
        // Simulation-compressed: represents 15-45 minutes real-world inspection
        // time per lot depending on complexity (simple CoA review vs. full
        // dimensional measurement with sampling)
        delaySeconds: 5,
      },
      {
        trigger: "on-unavailable",
        description:
          "QC Inspector handling peak-shift backlog -- 20-40+ inspection lots queued in MES work list. Materials sit in inspection hold area with physical hold tags. Production line at risk of stoppage ($25K-$100K/hr losses). No qualified backup inspector available. Plant Manager pressures for verbal conditional release, bypassing Quality Manager disposition authority.",
        // Simulation-compressed: represents 2-4 hours real-world backlog
        // during peak-shift conditions (Monday morning, end-of-month surge,
        // shift change handoff)
        delaySeconds: 8,
      },
    ],
    narrativeTemplate:
      "PA system paging with paper CoA review, peak-shift inspector backlog, and informal conditional release bypassing quality disposition authority",
  },
  todayPolicies: [
    {
      id: "policy-quality-inspection-today",
      actorId: "quality-control",
      threshold: {
        // Today: 1-of-1 from QC Inspector with no delegation and no
        // formal escalation. When the inspector is at capacity, materials
        // sit in inspection hold until the inspector clears the backlog
        // or the Plant Manager verbally authorizes conditional release
        // (bypassing the quality function).
        k: 1,
        n: 1,
        approverRoleIds: ["qc-inspector"],
      },
      // Simulation-compressed: 20 seconds represents the real-world condition
      // where the inspection request effectively expires (goes unanswered)
      // within the shift because the QC Inspector's queue is full and there
      // is no automatic escalation or delegation mechanism. In practice,
      // the request sits for 4-8 hours until the inspector reaches it in
      // FIFO order or production pressure forces an informal workaround.
      expirySeconds: 20,
      // No delegation in today's process: there is no backup inspector
      // pre-qualified and available, and the MES/ERP system has no
      // delegation routing configured.
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to incoming material inspection and
  // conditional release governance. The shared REGULATORY_DB["supply-chain"]
  // entries (EAR section 764, ISO 9001:2015 8.4) are not applicable to this
  // scenario -- EAR section 764 governs export enforcement, and Clause 8.4
  // governs supplier evaluation, not incoming inspection.
  regulatoryContext: [
    {
      framework: "ISO 9001",
      displayName: "ISO 9001:2015 Clause 8.6",
      clause: "Release of Products and Services",
      violationDescription:
        "Materials released to production without completion of planned inspection arrangements and without documented authorization from a relevant quality authority -- conditional release without risk acceptance documentation, traceability controls, or quality function involvement",
      fineRange:
        "ISO 9001 certification nonconformity (major finding); customer contract penalties for non-conforming material in finished goods; potential product recall costs ($500K-$50M+ depending on distribution scope)",
      severity: "critical",
      safeguardDescription:
        "Accumulate enforces policy-driven inspection release requiring QC Inspector usage decision or Quality Manager conditional release authorization with documented risk acceptance, lot traceability controls, and time-bound follow-up inspection -- all captured in cryptographic proof chain",
    },
    {
      framework: "ISO 9001",
      displayName: "ISO 9001:2015 Clause 8.7",
      clause: "Control of Nonconforming Outputs",
      violationDescription:
        "Nonconforming material not identified, segregated, or controlled after conditional release -- material that fails deferred follow-up inspection cannot be traced to production batches for containment or recall",
      fineRange:
        "ISO 9001 major nonconformity; customer quality escapes; warranty claim exposure; potential safety recall liability in automotive/aerospace ($1M-$100M+)",
      severity: "high",
      safeguardDescription:
        "Conditional release authorization includes mandatory lot traceability tagging -- every conditionally released lot is linked to downstream production batches, enabling systematic containment and recall if follow-up inspection reveals non-conformance",
    },
    {
      framework: "IATF 16949",
      displayName: "IATF 16949:2016 Clause 8.6.4",
      clause: "Verification and Acceptance of Externally Provided Products",
      violationDescription:
        "Incoming material verification process does not assure quality of externally provided products -- inspection backlogs lead to conditional release without adequate verification, sampling plan not enforced, CoA/CoC verification not documented",
      fineRange:
        "IATF 16949 certification suspension or withdrawal; OEM customer-specific requirement (CSR) violations; potential removal from OEM approved supplier list",
      severity: "high",
      safeguardDescription:
        "Policy engine enforces inspection workflow with statistical sampling plan (ANSI/ASQ Z1.4) compliance, digital CoA verification against purchase specifications, and documented usage decision for every incoming lot -- with delegation to qualified backup inspectors to prevent backlog-driven shortcuts",
    },
  ],
  tags: [
    "supply-chain",
    "quality",
    "inspection",
    "incoming-inspection",
    "conditional-release",
    "concession",
    "escalation",
    "delegation",
    "mes",
    "erp",
    "sap-qm",
    "batch-traceability",
    "production-stoppage",
    "iso-9001",
    "iatf-16949",
    "coa-verification",
    "sampling-plan",
    "material-disposition",
  ],
};
