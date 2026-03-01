import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * Joint Design Review & Cross-Organization Engineering Change Governance
 *
 * Models the bilateral engineering change process between an aerospace OEM
 * and a Tier-1 supplier for a Class I design change (form/fit/function)
 * affecting a safety-critical component. The core governance challenge is
 * that Class I changes require bilateral approval across separate
 * Configuration Management Boards (CMBs), separate PLM systems (e.g.,
 * Teamcenter at the OEM, Windchill at the supplier), and separate
 * engineering delegation matrices.
 *
 * Key governance controls modeled:
 * - 2-of-3 threshold with Supplier Design Lead as mandatory approver
 *   (bilateral approval cannot be bypassed -- SAE EIA-649-1 Class I requirement)
 * - Delegation from OEM Design Lead to Chief Engineer / Design Authority
 *   (within the OEM engineering function, constrained to Minor changes per FAR 21.93)
 * - Escalation to VP of Engineering when bilateral approval stalls beyond
 *   the 5-business-day authority window
 * - PLM / CMB System actor as the configuration baseline enforcement point
 * - Delegation constrained to Minor class changes only (Major changes
 *   requiring STC or amended TC cannot be delegated)
 *
 * Change classification (SAE EIA-649-C / EIA-649-1):
 * - Class I: affects form, fit, function, or interface -- requires bilateral
 *   OEM and supplier CMB approval. This scenario models a Class I change.
 * - Class II: editorial, non-functional (drawing format, document updates) --
 *   approved unilaterally by the originating organization. Not modeled here.
 *
 * Real-world references: SAE EIA-649-C (Configuration Control), AS9100D
 * Clause 8.5.6 (Configuration Management), ARP4754A (Systems Development),
 * FAR 21.93 (Changes to type design), Boeing D6-54551 (CM Standard),
 * Siemens Teamcenter ECM, PTC Windchill Change Management
 */
export const jointDesignScenario: ScenarioTemplate = {
  id: "supply-chain-joint-design",
  name: "Joint Design Review & Cross-Organization Engineering Change Governance",
  description:
    "An aerospace OEM and Tier-1 supplier must process a Class I engineering change (form/fit/function modification) to a safety-critical component through bilateral Configuration Management Board (CMB) review. The Engineering Change Request (ECR) is initiated in the OEM's PLM system and routed to the supplier via supplier portal or TDP exchange. Both organizations must independently assess cost, schedule, weight, reliability, and manufacturing impact before their respective CMBs can approve. Cross-org coordination typically adds 5-15 business days to the change cycle, with risk of version drift between separate PLM configuration baselines and IP exposure through uncontrolled technical data exchange. Component release delays cascade across the Integrated Master Schedule (IMS) and production rate commitments.",
  icon: "Truck",
  industryId: "supply-chain",
  archetypeId: "cross-org-boundary",
  prompt:
    "What happens when a Class I engineering change to a safety-critical component requires bilateral CMB approval across separate PLM systems but key engineering personnel unavailability delays the approval cycle by 5-15 business days with version drift accumulating between configuration baselines?",

  // Program delay cost for aerospace: $50K-$200K per day depending on program
  // size, production rate, and supply chain impact. $100K/day is calibrated for
  // a mid-tier aerospace program (single-aisle commercial aircraft subassembly
  // or military platform subsystem).
  costPerHourDefault: 4200,

  actors: [
    // --- Aerospace OEM (the organization initiating the engineering change) ---
    {
      id: "oem-corp",
      type: NodeType.Organization,
      label: "Aerospace OEM",
      parentId: null,
      organizationId: "oem-corp",
      color: "#F59E0B",
    },

    // --- Tier-1 Supplier (bilateral partner with separate PLM and CMB) ---
    {
      id: "tier1-supplier",
      type: NodeType.Partner,
      label: "Tier-1 Supplier",
      description:
        "Partner organization with separate PLM environment (e.g., PTC Windchill), separate Configuration Management Board (CMB), and independent engineering delegation matrix. Maintains its own configuration baseline for the affected component. Class I changes require bilateral approval from the supplier's engineering authority per the Supplier Technical Requirements Document (STRD) and SAE EIA-649-1.",
      parentId: null,
      organizationId: "tier1-supplier",
      color: "#3B82F6",
    },

    // --- OEM Engineering Department ---
    // Owns the OEM's configuration baseline and PLM environment. Houses the
    // Design Lead, Chief Engineer, and the OEM's side of the CMB.
    {
      id: "engineering",
      type: NodeType.Department,
      label: "Engineering",
      description:
        "Manages the OEM's PLM environment (Siemens Teamcenter, Dassault 3DEXPERIENCE) and configuration baselines for all programs. Houses the Engineering Change Management workflow, Design Authority delegation matrix, and the OEM's Configuration Management Board (CMB) membership. Responsible for ECR/ECN origination, affected-items analysis, and configuration status accounting.",
      parentId: "oem-corp",
      organizationId: "oem-corp",
      color: "#06B6D4",
    },

    // --- OEM Design Lead ---
    // Initiates the ECR in PLM, prepares the change package (drawing revisions,
    // BOM updates, affected-items list), and is one of the three approvers.
    {
      id: "design-lead-oem",
      type: NodeType.Role,
      label: "OEM Design Lead",
      description:
        "Initiates the Engineering Change Request (ECR) in the PLM system, prepares the design change package (drawing revisions, BOM updates, affected-items list, interchangeability determination), and presents the change to the OEM CMB. Approval authority for Class I engineering changes within designated systems scope per the OEM engineering delegation matrix.",
      parentId: "engineering",
      organizationId: "oem-corp",
      color: "#94A3B8",
    },

    // --- Chief Engineer / Design Authority (OEM) ---
    // Delegate for OEM Design Lead -- senior engineering authority who can
    // approve Class I changes classified as Minor under FAR 21.93.
    {
      id: "chief-engineer",
      type: NodeType.Role,
      label: "Chief Engineer / Design Authority",
      description:
        "Senior engineering authority (Design Approval Holder representative) who serves as delegate for the OEM Design Lead on Class I engineering changes. Reviews safety-critical design modifications against airworthiness requirements, configuration baseline impact, and Design Assurance Level (DAL) allocation per ARP4754A. Authorized to approve Class I changes classified as Minor under FAR 21.93 within the OEM engineering delegation matrix.",
      parentId: "engineering",
      organizationId: "oem-corp",
      color: "#94A3B8",
    },

    // --- Supplier Engineering Department ---
    {
      id: "supplier-engineering",
      type: NodeType.Department,
      label: "Supplier Engineering",
      description:
        "Manages the supplier's PLM environment (PTC Windchill), configuration baselines, and engineering change impact assessment. Reviews OEM-initiated Class I changes for manufacturing process impact, tooling requirements, material availability, and supplier certification status. Coordinates with the supplier's CMB for bilateral approval.",
      parentId: "tier1-supplier",
      organizationId: "tier1-supplier",
      color: "#06B6D4",
    },

    // --- Supplier Design Lead ---
    // Bilateral approval authority -- the supplier's engineering representative
    // who independently assesses the design change impact and approves on
    // behalf of the supplier's CMB.
    {
      id: "design-lead-supplier",
      type: NodeType.Role,
      label: "Supplier Design Lead",
      description:
        "Bilateral approval authority -- independently assesses the Class I design change impact on the supplier's configuration baseline, manufacturing processes, tooling, material specifications, and certification status. Presents the change to the supplier's CMB and provides bilateral approval (or rejection with technical rationale) on behalf of the supplier's engineering authority. Mandatory approver per SAE EIA-649-1.",
      parentId: "supplier-engineering",
      organizationId: "tier1-supplier",
      color: "#3B82F6",
    },

    // --- Program Manager (OEM) ---
    // Assesses schedule and cost impact against the IMS and EVM baseline.
    {
      id: "program-manager",
      type: NodeType.Role,
      label: "Program Manager",
      description:
        "Assesses schedule and cost impact of engineering changes against the Integrated Master Schedule (IMS) and Earned Value Management (EVM) baseline. Evaluates production rate impact, tooling modification lead times, and supply chain disruption. Coordinates effectivity planning (production lot or serial number cutover) with Manufacturing and Supply Chain. Participant in the OEM CMB.",
      parentId: "oem-corp",
      organizationId: "oem-corp",
      color: "#94A3B8",
    },

    // --- VP of Engineering (OEM) -- escalation authority ---
    // Escalation target when the bilateral approval stalls beyond the
    // authority window. Can convene an executive-level bilateral review.
    {
      id: "vp-engineering",
      type: NodeType.Role,
      label: "VP of Engineering",
      description:
        "Escalation authority for stalled bilateral engineering changes. Chairs the OEM's executive Configuration Management Board. Can convene an executive-level bilateral review with the supplier's VP of Engineering to unblock Class I changes affecting program milestones. Has authority to issue conditional approval with risk mitigation plan for production-critical changes.",
      parentId: "oem-corp",
      organizationId: "oem-corp",
      color: "#94A3B8",
    },

    // --- PLM / Configuration Management System ---
    // The technical enforcement point that maintains configuration baselines,
    // routes ECR/ECN workflows, and locks the baseline until bilateral
    // approval is recorded. Analogous to SLM/ERP System in supplier-cert
    // and MES/ERP System in quality-inspection.
    {
      id: "plm-cmb-system",
      type: NodeType.System,
      label: "PLM / Configuration Management System",
      description:
        "Product Lifecycle Management system (Siemens Teamcenter ECM, PTC Windchill Change Management, Dassault 3DEXPERIENCE ENOVIA Change Action) managing the engineering change workflow. Routes ECR/ECN through CMB review, maintains configuration baselines, generates affected-items lists, manages BOM updates and drawing revisions, and tracks configuration status accounting. Cross-org integration via supplier portal (Boeing Exostar, Lockheed Martin SDN) or controlled TDP exchange (STEP AP242, 3D PDF). Enforces configuration baseline lock until bilateral CMB approval is recorded.",
      parentId: "oem-corp",
      organizationId: "oem-corp",
      color: "#8B5CF6",
    },
  ],

  policies: [
    {
      id: "policy-joint-design",
      // Policy attached to the OEM organization, which is the originator
      // of the engineering change and the owner of the ECR/ECN workflow
      // in the PLM system. The PLM system enforces the policy by maintaining
      // the configuration baseline lock until bilateral approval is recorded.
      actorId: "oem-corp",
      threshold: {
        // 2-of-3: bilateral approval from OEM Design Lead, Supplier Design Lead,
        // and Program Manager. The Supplier Design Lead is mandatory (bilateral
        // requirement). In practice, the CMB review includes additional
        // participants (Quality, Manufacturing, Reliability), but the scenario
        // models the three primary engineering approval authorities.
        k: 2,
        n: 3,
        approverRoleIds: [
          "design-lead-oem",
          "design-lead-supplier",
          "program-manager",
        ],
      },
      // 5 business days (432,000 seconds) -- bilateral Class I engineering changes
      // require independent impact assessments from both OEM and supplier
      // engineering teams (cost, schedule, weight, reliability, manufacturing,
      // tooling), CMB review on each side, and bilateral approval recording.
      // Standard Class I changes take 5-15 business days; 5 days represents
      // an aggressive but achievable target with governance automation.
      expirySeconds: 432000,
      delegationAllowed: true,
      // Delegation within the OEM: Design Lead delegates to Chief Engineer /
      // Design Authority. This is within the OEM engineering function only --
      // the supplier's bilateral approval cannot be delegated to an OEM role.
      delegateToRoleId: "chief-engineer",
      // Supplier Design Lead is mandatory -- bilateral approval requires the
      // supplier's engineering authority to independently assess impact to
      // their configuration baseline, manufacturing processes, tooling, and
      // certification status. Per SAE EIA-649-1, Class I changes (form/fit/
      // function) ALWAYS require bilateral OEM and supplier approval.
      mandatoryApprovers: ["design-lead-supplier"],
      // Delegation constrained to Minor class changes per FAR 21.93. Major
      // changes requiring STC or amended TC cannot be delegated from the
      // Design Lead to the Chief Engineer -- they require the Design Approval
      // Holder's (DAH) formal authority.
      delegationConstraints:
        "Delegation from OEM Design Lead to Chief Engineer / Design Authority is limited to Class I changes classified as Minor under FAR 21.93 (design changes that do not appreciably affect weight, balance, structural strength, reliability, operational characteristics, noise, fuel venting, exhaust emissions, or airworthiness). Major changes requiring Supplemental Type Certificate (STC) or amended Type Certificate require Design Approval Holder (DAH) authority and cannot be delegated. Delegation is further limited to components within the Chief Engineer's designated systems scope under the OEM engineering delegation matrix.",
      escalation: {
        // Simulation-compressed: 30 seconds represents real-world escalation
        // after the 5-business-day authority window expires without bilateral
        // threshold being met. VP of Engineering can convene an executive-level
        // bilateral review with the supplier's VP of Engineering.
        afterSeconds: 30,
        toRoleIds: ["vp-engineering"],
      },
      // Engineering changes are approved against the production configuration
      // baseline in the PLM system. Development/test baselines follow separate
      // change processes with different authority requirements.
      constraints: {
        environment: "production",
      },
    },
  ],

  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "oem-corp", targetId: "engineering", type: "authority" },
    { sourceId: "oem-corp", targetId: "program-manager", type: "authority" },
    { sourceId: "oem-corp", targetId: "vp-engineering", type: "authority" },
    { sourceId: "oem-corp", targetId: "plm-cmb-system", type: "authority" },
    {
      sourceId: "engineering",
      targetId: "design-lead-oem",
      type: "authority",
    },
    { sourceId: "engineering", targetId: "chief-engineer", type: "authority" },
    {
      sourceId: "tier1-supplier",
      targetId: "supplier-engineering",
      type: "authority",
    },
    {
      sourceId: "supplier-engineering",
      targetId: "design-lead-supplier",
      type: "authority",
    },
    // --- Delegation edge (intra-function, within OEM Engineering) ---
    // OEM Design Lead delegates to Chief Engineer -- same department,
    // same engineering function, constrained to Minor class changes.
    {
      sourceId: "design-lead-oem",
      targetId: "chief-engineer",
      type: "delegation",
    },
  ],

  defaultWorkflow: {
    name: "Class I bilateral engineering change with CMB review and PLM configuration baseline update",
    initiatorRoleId: "design-lead-oem",
    targetAction:
      "Approve Class I Engineering Change to Safety-Critical Component via Bilateral CMB Review",
    description:
      "OEM Design Lead initiates an Engineering Change Request (ECR) in the PLM system for a Class I modification (form/fit/function change) to a safety-critical component. The change package includes drawing revisions, BOM updates, affected-items list, and interchangeability determination. Bilateral approval required: both OEM and supplier CMBs must independently assess cost, schedule, weight, reliability, and manufacturing impact. Cross-org coordination adds 5-15 business days to the change cycle. Version drift risk accumulates between separate PLM configuration baselines. Chief Engineer available as delegate for the OEM Design Lead on Minor class changes. VP of Engineering available as escalation authority when bilateral approval stalls.",
  },

  beforeMetrics: {
    // Wall-clock elapsed time from ECR initiation to ECO release is typically
    // 10-20 business days (2-4 weeks) for a Class I bilateral change. Active
    // manual effort across all participants is approximately 40 hours:
    //   - OEM Design Lead: 8-12 hours (change package preparation, drawing
    //     revision, BOM update, affected-items analysis, interchangeability
    //     determination)
    //   - Supplier Design Lead: 8-12 hours (independent impact assessment,
    //     manufacturing process review, tooling impact, cost estimate,
    //     supplier CMB presentation)
    //   - Program Manager: 4-6 hours (IMS impact, EVM baseline adjustment,
    //     production rate impact, effectivity planning)
    //   - OEM CMB preparation and review: 4-6 hours (review package,
    //     action item resolution, approval recording)
    //   - Configuration management: 4-6 hours (baseline update, status
    //     accounting, affected-items list, drawing release)
    // The 40-hour figure represents active effort; the 2-4 week wall-clock
    // time includes queue waits, cross-org routing, and CMB scheduling.
    manualTimeHours: 40,
    // 14 days (2 weeks / 10 business days) of risk exposure from ECR
    // initiation to ECO release. During this period: (1) production line
    // may be building to the old configuration baseline while the change
    // is pending, (2) version drift accumulates between OEM and supplier
    // PLM configuration baselines, (3) IP-sensitive technical data (drawings,
    // specs, test data) is in transit across organizational boundaries with
    // incomplete access controls, (4) interchangeability/replaceability
    // status is uncertain -- production may install parts that become
    // non-interchangeable after the change is incorporated.
    riskExposureDays: 14,
    // Six audit gaps in the current manual bilateral change process:
    // (1) ECR initiated via email or phone call rather than PLM workflow --
    //     no formal change request record linking the engineering need to
    //     the change package
    // (2) Impact assessment conducted informally (email exchanges, phone
    //     calls) with no structured cost/schedule/weight/reliability
    //     assessment template linked to the ECR in the PLM system
    // (3) CMB review not formally documented -- verbal approvals at
    //     engineering meetings with no recorded disposition, action items,
    //     or dissenting opinions
    // (4) Version drift between OEM and supplier PLM configuration baselines
    //     -- no automated synchronization, manual TDP exchange via email or
    //     file share with no version control or receipt confirmation
    // (5) IP-sensitive technical data (NDA-stamped drawings, proprietary
    //     manufacturing specifications) shared via email attachments with
    //     no access controls, no download tracking, and no ITAR/export
    //     control verification for defense articles
    // (6) Effectivity not formally defined in PLM -- production cutover
    //     coordinated verbally between Engineering and Manufacturing with
    //     no system-enforced effectivity record
    auditGapCount: 6,
    // Eight manual process steps in the current bilateral change workflow:
    // (1) OEM Design Lead prepares change package (drawings, BOM, specs)
    // (2) Change package emailed to supplier with NDA-stamped attachments
    // (3) Supplier Design Lead reviews impact in separate PLM environment
    // (4) Supplier returns impact assessment via email
    // (5) OEM Design Lead presents to OEM CMB (informal meeting)
    // (6) Program Manager assesses schedule/cost impact manually
    // (7) Bilateral approval communicated via email chain
    // (8) Configuration baseline manually updated in both PLM systems
    approvalSteps: 8,
  },

  todayFriction: {
    ...ARCHETYPES["cross-org-boundary"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Engineering Change Request (ECR) emailed to supplier with NDA-stamped drawing package and BOM markup -- routed across separate PLM environments and governance frameworks with no automated cross-org workflow integration. Supplier must manually import the change package into their PLM system.",
        // Simulation-compressed: represents 1-2 business days real-world
        // elapsed time for change package preparation, cross-org routing,
        // and supplier acknowledgment
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        description:
          "Supplier Design Lead conducting independent impact assessment -- reviewing design change against supplier's configuration baseline in separate PLM environment, assessing manufacturing process impact, tooling modification requirements, material availability, and cost estimate. Cross-referencing supplier BOM against OEM affected-items list for interchangeability determination. Digital thread traceability gaps between PLM systems.",
        // Simulation-compressed: represents 2-5 business days real-world
        // elapsed time for thorough bilateral impact assessment
        delaySeconds: 7,
      },
      {
        trigger: "on-unavailable",
        description:
          "OEM Design Lead unavailable (at supplier site, on factory floor, or supporting flight test) -- Class I change package sitting in PLM workflow queue. Version drift risk growing as supplier continues manufacturing to the old configuration baseline. IP-sensitive technical data sitting in email inboxes with no access controls or download tracking.",
        // Simulation-compressed: represents 2-5 business days real-world
        // delay while primary engineering authority is unavailable
        delaySeconds: 10,
      },
    ],
    narrativeTemplate:
      "Email-based bilateral engineering change routing across separate PLM systems with no automated cross-org workflow, manual impact assessment, and version drift between configuration baselines",
  },

  todayPolicies: [
    {
      id: "policy-joint-design-today",
      actorId: "oem-corp",
      threshold: {
        // Today: all 3 of 3 must approve. No exceptions. This is the root
        // cause of the bottleneck -- a single unavailable approver (OEM Design
        // Lead on factory floor, supplier engineer at capacity, Program Manager
        // in milestone review) blocks the entire bilateral change process.
        k: 3,
        n: 3,
        approverRoleIds: [
          "design-lead-oem",
          "design-lead-supplier",
          "program-manager",
        ],
      },
      // Simulation-compressed: 25 seconds represents the real-world condition
      // where the approval request sits in queue for days because the 3-of-3
      // requirement with no delegation means every approver must be available
      // and completed their independent review. In practice, this is an
      // open-ended process that takes 2-4 weeks for Class I bilateral changes.
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to aerospace engineering change management
  // and configuration management. The shared REGULATORY_DB["supply-chain"] entries
  // (EAR §764 and ISO 9001:2015 Clause 8.4) are not applicable -- EAR §764
  // governs export enforcement violations, and Clause 8.4 governs external
  // provider evaluation, not design change control.
  regulatoryContext: [
    {
      framework: "AS9100D",
      displayName: "AS9100D Clause 8.5.6",
      clause: "Configuration Management",
      violationDescription:
        "Engineering change to safety-critical component processed without formal configuration management process -- no documented ECR/ECN workflow, no configuration baseline update, no affected-items analysis, no interchangeability determination, and no formal CMB review. Configuration status accounting gaps prevent traceability from design change to production effectivity.",
      fineRange:
        "AS9100D certification major nonconformity (potential suspension); DCMA surveillance finding; FAA/EASA airworthiness directive if safety-critical component configuration is uncertain; customer contract penalties for configuration non-compliance",
      severity: "critical",
      safeguardDescription:
        "Accumulate enforces policy-driven bilateral engineering change workflow with mandatory CMB approval routing, configuration baseline lock until bilateral threshold is met, affected-items tracking, and cryptographic proof of every approval step -- satisfying AS9100D Clause 8.5.6 configuration control requirements",
    },
    {
      framework: "SAE EIA-649-C",
      displayName: "SAE EIA-649-C Section 5.3",
      clause: "Configuration Control",
      violationDescription:
        "Class I engineering change (form/fit/function modification) approved without formal change evaluation process -- no documented impact assessment (cost, schedule, weight, reliability, manufacturing), no bilateral approval from affected organizations, and no configuration status accounting update. Violates the Configuration Control function requirement for formal evaluation, coordination, and approval of changes to configuration-controlled items.",
      fineRange:
        "Contract non-compliance (SAE EIA-649-C is incorporated by reference in most aerospace/defense contracts); audit finding; potential configuration baseline corruption requiring full Physical Configuration Audit (PCA) to resolve ($500K-$5M+ depending on program scope)",
      severity: "critical",
      safeguardDescription:
        "Policy-enforced Class I change workflow with structured impact assessment template, bilateral approval routing with mandatory supplier engineering authority, and automated configuration status accounting -- all captured in cryptographic proof chain satisfying EIA-649-C Configuration Control requirements",
    },
    {
      framework: "ARP4754A",
      displayName: "ARP4754A Section 5.4",
      clause: "Change Management in Systems Development",
      violationDescription:
        "Design change to safety-critical system component processed without evaluating impact on system safety assessment, Design Assurance Level (DAL) allocation, or derived safety requirements. Changes to DAL A/B components require updated Functional Hazard Assessment (FHA) and Fault Tree Analysis (FTA) that are not triggered without a formal change management process.",
      fineRange:
        "FAA/EASA certification finding; potential grounding or airworthiness limitation if safety assessment is outdated; DER/ODA finding; product liability exposure",
      severity: "critical",
      safeguardDescription:
        "Engineering change workflow includes mandatory safety impact assessment gate -- changes to DAL A/B components trigger policy-enforced safety review requirement before bilateral approval can proceed, with cryptographic proof of safety assessment completion",
    },
    {
      framework: "ITAR",
      displayName: "ITAR 22 CFR 120-130",
      clause: "Technical Data Controls for Defense Articles",
      violationDescription:
        "Technical data in engineering change package (drawings, specifications, test data for defense articles) shared with Tier-1 supplier without verification of valid Technical Assistance Agreement (TAA) or Manufacturing License Agreement (MLA) coverage. NDA-stamped drawings emailed across organizational boundaries without ITAR access controls or export classification verification.",
      fineRange:
        "Up to $1M per violation (civil) or $1M and 20 years imprisonment per violation (criminal) under AECA 22 USC 2778; debarment from government contracting; facility security clearance revocation",
      severity: "critical",
      safeguardDescription:
        "Policy engine verifies TAA/MLA coverage and export classification before routing technical data across organizational boundaries. Cryptographic access controls ensure only authorized personnel at the supplier can access ITAR-controlled change package data. Complete audit trail of technical data access satisfies ITAR compliance record requirements.",
    },
  ],

  tags: [
    "supply-chain",
    "cross-org",
    "design-review",
    "bilateral",
    "aerospace",
    "plm",
    "safety-critical",
    "configuration-management",
    "digital-thread",
    "version-drift",
    "engineering-change",
    "ecr-ecn",
    "class-i-change",
    "cmb",
    "as9100d",
    "eia-649",
    "arp4754a",
    "itar",
    "teamcenter",
    "windchill",
  ],
};
