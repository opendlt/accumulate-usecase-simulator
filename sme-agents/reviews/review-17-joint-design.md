# SME Review #17: Joint Design Review & Cross-Organization Engineering Change Governance

**Reviewer:** Senior Aerospace Engineering Change Management, PLM/Configuration Management, and Cross-Organization OEM-Supplier Governance Subject Matter Expert

**Date:** 2026-02-28

**Scenario:** `src/scenarios/supply-chain/joint-design.ts`

**Narrative:** Section 3 of `docs/scenario-journeys/supply-chain-scenarios.md`

---

## 1. Executive Assessment

### Overall Credibility Score: D+

This scenario captures the broad contour of a bilateral design review problem -- cross-org coordination delays, version drift, IP exposure -- but fails to model the actual governance mechanisms, role structures, change classification, and configuration management controls that define how aerospace engineering changes are managed. It reads like a sketch written by someone who has heard about bilateral design reviews but has never sat in a Configuration Management Board meeting or processed an Engineering Change Order through Teamcenter. Compared to the corrected supplier-cert and quality-inspection scenarios in this same project, this scenario is dramatically under-developed: no inline regulatory context, no mandatory approvers, no delegation constraints, no escalation path, no system actor, no CMB, no change classification, and an actor ID (`ip-counsel`) that contradicts its label (`Chief Engineer`). A VP of Engineering at a major OEM or an AS9100D auditor would reject this as a credible representation of aerospace engineering change governance.

### Top 3 Most Critical Issues

1. **CRITICAL -- Actor ID `ip-counsel` maps to "Chief Engineer."** The actor ID `ip-counsel` (suggesting IP counsel / intellectual property attorney) is used for the Chief Engineer role. This is a fundamental naming inconsistency that would confuse any developer consuming the scenario data. The delegation edge `design-lead-oem -> ip-counsel` reads as "OEM Design Lead delegates to IP Counsel" -- which is a delegation of engineering authority to a legal function, an absurd proposition for safety-critical design change approval. The ID must be `chief-engineer`.

2. **CRITICAL -- No Configuration Management Board (CMB) or Change Control Board (CCB).** In aerospace, engineering changes to safety-critical components are NEVER approved by individual engineers alone. They are reviewed and dispositioned by a formal Configuration Management Board comprising Engineering, Quality, Manufacturing, Program Management, Reliability, and (for Class I changes) the customer's engineering authority. The absence of a CMB is the single largest credibility gap in this scenario. At minimum, the CMB should be represented as a governance step; ideally, it should be modeled as a System actor (analogous to the SLM/ERP System in supplier-cert and MES/ERP System in quality-inspection).

3. **CRITICAL -- `regulatoryContext: REGULATORY_DB["supply-chain"]` imports generic supply-chain regulations (EAR section 764, ISO 9001:2015 Clause 8.4) that have nothing to do with engineering change management or configuration management.** EAR section 764 governs export enforcement violations -- not design change governance. ISO 9001:2015 Clause 8.4 governs evaluation of external providers -- not configuration change control. The directly applicable frameworks are AS9100D Clause 8.5.6 (Configuration Management), SAE EIA-649-C (Configuration Control), ARP4754A (Systems Development for civil aircraft), and ITAR 22 CFR 120-130 (if defense article). This must be replaced with inline regulatory context.

### Top 3 Strengths

1. **Correct identification of the bilateral coordination problem.** The scenario correctly identifies that cross-org design reviews create 3-10 day delays, version drift across separate PLM systems, and IP exposure through uncontrolled communication channels. These are real, pervasive problems in OEM-supplier engineering change workflows.

2. **Appropriate archetype selection.** The `cross-org-boundary` archetype is the correct classification for a bilateral engineering change scenario. The friction profile (unavailabilityRate: 0.35, delayMultiplierMax: 6) is reasonable for cross-org coordination.

3. **Correct delegation direction.** The delegation from OEM Design Lead to Chief Engineer (within the OEM) is directionally correct -- delegation of engineering approval authority stays within the engineering function at the OEM. The corrected scenario refines this with proper constraints and organizational placement.

---

## 2. Line-by-Line Findings

### Finding 1: Actor ID `ip-counsel` for Chief Engineer

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, lines 71-78 (actor definition), line 91 (`delegateToRoleId`), line 99 (edge), line 100 (delegation edge)
- **Issue Type:** Inconsistency / Jargon Error
- **Severity:** Critical
- **Current Text:**
  ```typescript
  {
    id: "ip-counsel",
    type: NodeType.Role,
    label: "Chief Engineer",
    description: "Delegate authority — senior engineering authority who can evaluate safety-critical design changes when OEM Design Lead is unavailable",
    parentId: "oem-corp",
    organizationId: "oem-corp",
    color: "#94A3B8",
  },
  ```
- **Problem:** The actor ID `ip-counsel` semantically maps to "Intellectual Property Counsel" -- a legal function. The label and description describe a "Chief Engineer" -- an engineering authority. In aerospace, the Chief Engineer (or Design Authority / Lead Engineer) is the senior technical authority who approves design changes under the engineering delegation of authority matrix. IP Counsel is a legal function that reviews technology licensing, patent filings, and ITAR technical data agreements. These are entirely different roles. The delegation edge `design-lead-oem -> ip-counsel` reads as engineering authority being delegated to a legal function, which would violate any engineering delegation matrix at an OEM. Additionally, the Chief Engineer is placed directly under `oem-corp` (the organization) rather than under the Engineering department, which is organizationally incorrect.
- **Corrected Text:**
  ```typescript
  {
    id: "chief-engineer",
    type: NodeType.Role,
    label: "Chief Engineer / Design Authority",
    description:
      "Senior engineering authority (Design Approval Holder representative) who serves as delegate for the OEM Design Lead on Class I engineering changes. Reviews safety-critical design modifications against airworthiness requirements, configuration baseline impact, and design assurance level (DAL) allocation. Authorized to approve design changes affecting form, fit, and function under the OEM engineering delegation matrix.",
    parentId: "engineering",
    organizationId: "oem-corp",
    color: "#94A3B8",
  },
  ```
- **Source/Rationale:** In aerospace OEMs (Boeing, Lockheed Martin, Raytheon, Northrop Grumman), the Chief Engineer or Design Authority is a defined engineering role under the engineering delegation matrix (per AS9100D Clause 8.1 and FAR 21.263 for design approval authority). The Chief Engineer is always placed within the Engineering organization, not at the corporate level.

### Finding 2: Missing Configuration Management Board (CMB)

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, actors array (lines 16-78)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** No CMB or CCB actor exists in the scenario.
- **Problem:** Aerospace engineering changes to safety-critical components are reviewed and dispositioned by a formal Configuration Management Board (CMB) or Configuration Control Board (CCB). Per SAE EIA-649-C (Configuration Control function) and AS9100D Clause 8.5.6, engineering changes affecting form, fit, function, or interface (Class I changes) must be reviewed by a multi-disciplinary board. The CMB is the governance body -- not individual engineers. The corrected supplier-cert and quality-inspection scenarios include System actors (SLM/ERP System, MES/ERP System) as technical enforcement points. This scenario describes PLM systems extensively in its description but models no System actor and no CMB. At minimum, a PLM/CMB System actor should be included.
- **Corrected Text:** Add a PLM / CMB System actor:
  ```typescript
  {
    id: "plm-cmb-system",
    type: NodeType.System,
    label: "PLM / Configuration Management System",
    description:
      "Product Lifecycle Management system (Siemens Teamcenter, PTC Windchill, Dassault 3DEXPERIENCE) with Engineering Change Management module. Manages Engineering Change Requests (ECRs), Engineering Change Orders (ECOs/ECNs), configuration baselines, affected-items lists, BOM updates, and CMB review routing. Cross-org integration via supplier portal or TDP exchange. Enforces configuration baseline lock until bilateral CMB approval is recorded.",
    parentId: "oem-corp",
    organizationId: "oem-corp",
    color: "#8B5CF6",
  },
  ```
- **Source/Rationale:** SAE EIA-649-C Section 5.3 (Configuration Control) requires a formal change evaluation and approval process. AS9100D Clause 8.5.6 requires a configuration management process including change control. Every major aerospace OEM operates a PLM-based CMB workflow (Boeing uses Teamcenter, Lockheed Martin uses Windchill, Airbus uses 3DEXPERIENCE).

### Finding 3: Generic Regulatory Context from REGULATORY_DB

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, line 137
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:**
  ```typescript
  regulatoryContext: REGULATORY_DB["supply-chain"],
  ```
- **Problem:** `REGULATORY_DB["supply-chain"]` contains two entries: (1) EAR section 764 -- "Shipment of controlled goods without verified authorization chain" and (2) ISO 9001:2015 Clause 8.4 -- "Supplier certification gap in documented verification trail." Neither is applicable to engineering change management or configuration management. EAR section 764 is about export administration enforcement, not engineering changes. ISO 9001:2015 Clause 8.4 is about external provider evaluation, not design change control. The directly applicable frameworks for bilateral engineering change governance are AS9100D Clause 8.5.6 (Configuration Management), SAE EIA-649-C (Configuration Control), ARP4754A (Systems Development), and ITAR 22 CFR 120-130 (if defense article). The corrected supplier-cert and quality-inspection scenarios both use inline `regulatoryContext` arrays with scenario-specific regulatory entries.
- **Corrected Text:** Replace with inline regulatory context (see Section 4 for complete corrected scenario).
- **Source/Rationale:** AS9100D Clause 8.5.6, SAE EIA-649-C Section 5.3, ARP4754A Section 5.4, ITAR 22 CFR 120.17 (technical data definition).

### Finding 4: `expirySeconds: 72000` (20 hours) is Unrealistically Short for Bilateral Design Review

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, line 89
- **Issue Type:** Understatement
- **Severity:** High
- **Current Text:**
  ```typescript
  expirySeconds: 72000,
  ```
- **Problem:** 72,000 seconds = 20 hours. For a bilateral cross-org engineering change affecting safety-critical components, 20 hours is unrealistically short. The scenario's own description says "3-10 day delays" and the `beforeMetrics` claims 120 hours (5 days) of manual time and 21 days of risk exposure. A Class I engineering change (form/fit/function) requires independent impact assessments from both OEM and supplier (2-5 business days each), CMB review (1-2 business days), and bilateral approval (additional 1-3 business days). Standard Class I changes take 5-15 business days. Even with the Accumulate governance model compressing this, a 20-hour authority window is insufficient. The corrected supplier-cert scenario uses 259,200 seconds (72 hours = 3 business days). For a bilateral cross-org design review, 5 business days (432,000 seconds = 120 hours) is a reasonable compressed target.
- **Corrected Text:**
  ```typescript
  // 5 business days (432,000 seconds) -- bilateral Class I engineering changes require
  // independent impact assessments from both OEM and supplier engineering teams
  // (cost, schedule, weight, reliability, manufacturing, tooling), CMB review,
  // and bilateral approval. Standard Class I changes take 5-15 business days;
  // 5 days represents an aggressive but achievable target with governance automation.
  expirySeconds: 432000,
  ```
- **Source/Rationale:** Industry practice at major OEMs: Class I change cycle times average 10-20 business days at Boeing, Lockheed Martin, and Airbus. 5 business days is at the fast end and represents a significant improvement from the status quo, which is the point of the Accumulate scenario.

### Finding 5: No `mandatoryApprovers`

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, lines 80-92 (policy definition)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `mandatoryApprovers` field in the policy.
- **Problem:** For a safety-critical component design change, at least one engineering authority must be mandatory. In aerospace, the Supplier Design Lead's bilateral approval is mandatory for Class I changes -- the OEM cannot unilaterally approve a change that affects the supplier's hardware. The 2-of-3 threshold without mandatory approvers means that the Program Manager + OEM Design Lead could approve a safety-critical design change without the Supplier Design Lead ever reviewing it. This bypasses the bilateral approval requirement, which is the entire governance premise of the scenario. The corrected supplier-cert scenario includes `mandatoryApprovers: ["qa-manager"]` and the corrected quality-inspection scenario includes `mandatoryApprovers: ["quality-manager"]`.
- **Corrected Text:**
  ```typescript
  // Supplier Design Lead is mandatory -- bilateral approval requires the supplier's
  // engineering authority to independently assess impact to their configuration
  // baseline, manufacturing processes, tooling, and certification status.
  // Per SAE EIA-649-1, Class I changes (form/fit/function) ALWAYS require
  // customer (OEM) and supplier bilateral approval.
  mandatoryApprovers: ["design-lead-supplier"],
  ```
- **Source/Rationale:** SAE EIA-649-1 (Configuration Management Requirements for Defense Contracts) requires bilateral approval for Class I changes. Commercial aerospace programs have equivalent bilateral change clauses in their Supplier Technical Requirements Documents (STRDs) or Special Conditions.

### Finding 6: No `delegationConstraints`

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, lines 80-92
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `delegationConstraints` field in the policy.
- **Problem:** The delegation from OEM Design Lead to Chief Engineer is unconstrained. In practice, the Chief Engineer's delegation authority is scoped under the engineering delegation matrix. The Chief Engineer can approve Class I changes within specific DAL (Design Assurance Level) ranges, weight budgets, and systems -- but typically cannot approve major changes requiring airworthiness certification updates (FAR 21.93 Major changes) without the Design Approval Holder's (DAH) formal sign-off. The corrected supplier-cert scenario includes detailed delegation constraints limiting delegation to standard-risk suppliers; the corrected quality-inspection scenario constrains delegation to qualified inspectors with specific material category competence.
- **Corrected Text:**
  ```typescript
  delegationConstraints:
    "Delegation from OEM Design Lead to Chief Engineer is limited to Class I changes classified as Minor under FAR 21.93 (design changes that do not appreciably affect weight, balance, structural strength, reliability, operational characteristics, noise, fuel venting, exhaust emissions, or airworthiness). Major changes requiring Supplemental Type Certificate (STC) or amended Type Certificate require Design Approval Holder (DAH) authority and cannot be delegated. Delegation is further limited to components within the Chief Engineer's designated systems scope under the OEM engineering delegation matrix.",
  ```
- **Source/Rationale:** FAR 21.93 (Classification of changes in type design), AS9100D Clause 8.1 (engineering delegation), OEM engineering delegation matrices.

### Finding 7: No `escalation` Rule

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, lines 80-92
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `escalation` field in the policy.
- **Problem:** When a bilateral design review stalls (common when supplier engineering teams are at capacity or OEM and supplier CMBs are on different review cycles), there must be an escalation path. In aerospace programs, stalled engineering changes escalate to the Program Director / VP of Engineering (OEM side) and the Supplier Program Manager / VP of Engineering (supplier side). The corrected supplier-cert scenario escalates to VP of Supply Chain after 48 hours; the corrected quality-inspection scenario escalates to Quality Manager after 1 hour. This scenario has no escalation mechanism at all.
- **Corrected Text:**
  ```typescript
  escalation: {
    // Simulation-compressed: 30 seconds represents real-world escalation after
    // 5 business days (the expiry window) without bilateral threshold being met.
    // Escalation to VP of Engineering (OEM) who can convene an executive-level
    // bilateral review with the supplier's VP of Engineering to unblock the change.
    afterSeconds: 30,
    toRoleIds: ["vp-engineering"],
  },
  ```
- **Source/Rationale:** Standard escalation practice at OEMs: stalled Class I changes escalate through the program management chain (Program Manager -> Program Director -> VP of Engineering) with defined SLAs at each tier.

### Finding 8: No `constraints`

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, lines 80-92
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No `constraints` field in the policy.
- **Problem:** The corrected supplier-cert scenario constrains vendor activation to `"sap-enclave"` and the corrected quality-inspection scenario constrains conditional release to `"production"` environment. For a PLM engineering change, the appropriate constraint is the PLM production environment -- engineering changes are approved against the production configuration baseline, not a sandbox or test environment.
- **Corrected Text:**
  ```typescript
  constraints: {
    environment: "production",
  },
  ```
- **Source/Rationale:** PLM configuration management: engineering changes are released to the production baseline (not a development or test environment). AS9100D Clause 8.5.6 requires changes to be managed against the identified configuration baseline.

### Finding 9: Program Manager Orphaned from Department

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, lines 63-69
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:**
  ```typescript
  {
    id: "program-manager",
    type: NodeType.Role,
    label: "Program Manager",
    description: "Tracks schedule impact — component release delays cascade across production and program milestones",
    parentId: "oem-corp",
    ...
  },
  ```
- **Problem:** The Program Manager has `parentId: "oem-corp"` (directly under the organization) rather than being placed in a department. The corrected supplier-cert scenario places the VP of Supply Chain under the manufacturer organization, but that is an executive escalation role. For the Program Manager, who is a working-level program management function, placement under a Program Management Office (PMO) department would be more organizationally accurate. However, for simplicity and consistency with the other corrected scenarios, placement under the organization is acceptable if the scenario does not define a PMO department. The larger issue is that the description is thin -- it should reference integrated master schedule (IMS) impact, earned value management (EVM) implications, and production rate impact assessment.
- **Corrected Text:**
  ```typescript
  {
    id: "program-manager",
    type: NodeType.Role,
    label: "Program Manager",
    description:
      "Assesses schedule and cost impact of engineering changes against the Integrated Master Schedule (IMS) and Earned Value Management (EVM) baseline. Evaluates production rate impact, tooling modification requirements, and supply chain disruption. Coordinates effectivity planning (production lot or serial number cutover) with Manufacturing and Supply Chain.",
    parentId: "oem-corp",
    organizationId: "oem-corp",
    color: "#94A3B8",
  },
  ```
- **Source/Rationale:** Program management at aerospace OEMs: the Program Manager's role in engineering change governance is primarily schedule/cost impact assessment and effectivity planning, not just "tracking" delays.

### Finding 10: `manualTimeHours: 120` (5 Days Active Effort) is Overstated

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, line 110
- **Issue Type:** Overstatement
- **Severity:** High
- **Current Text:**
  ```typescript
  manualTimeHours: 120,
  ```
- **Problem:** 120 hours = 5 full business days (8 hours/day x 15 days, or 24 hours/day x 5 days). The narrative says "120+ hours (5 days) of delay," conflating wall-clock elapsed time with active manual effort. In practice, a bilateral design change review involves approximately 30-60 hours of active manual effort across all participants: OEM Design Lead (8-12 hours for change package preparation, BOM update, drawing revision), Supplier Design Lead (8-12 hours for independent impact assessment), Program Manager (4-6 hours for schedule/cost impact assessment), OEM CMB review preparation (4-6 hours), and supplier CMB review (4-6 hours). The remaining time is wall-clock wait time (approver unavailability, cross-org routing delays, queue time). The corrected supplier-cert scenario uses 36 hours (with detailed breakdown of 10-14 hours active effort). For this scenario, 40 hours of active manual effort is realistic, with 2-3 weeks of wall-clock elapsed time.
- **Corrected Text:**
  ```typescript
  // Wall-clock elapsed time from ECR initiation to ECO release is typically
  // 10-20 business days (2-4 weeks) for a Class I bilateral change. Active
  // manual effort across all participants is approximately 40 hours:
  //   - OEM Design Lead: 8-12 hours (change package preparation, drawing
  //     revision, BOM update, affected-items analysis)
  //   - Supplier Design Lead: 8-12 hours (independent impact assessment,
  //     manufacturing process review, tooling impact, cost estimate)
  //   - Program Manager: 4-6 hours (IMS impact, EVM baseline adjustment,
  //     production rate impact, effectivity planning)
  //   - CMB preparation and review: 4-6 hours (OEM and supplier CMB review
  //     packages, action item resolution)
  //   - Configuration management: 4-6 hours (baseline update, status
  //     accounting, affected-items list, interchangeability determination)
  // The 40-hour figure represents active effort; the 2-4 week wall-clock
  // time includes queue waits, cross-org routing, and CMB scheduling.
  manualTimeHours: 40,
  ```
- **Source/Rationale:** Industry benchmarks: bilateral Class I change cycle time at major OEMs averages 10-20 business days elapsed, with 30-60 hours of active effort across all participants. 40 hours is a realistic midpoint.

### Finding 11: `riskExposureDays: 21` is Plausible but Needs Qualification

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, line 111
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:**
  ```typescript
  riskExposureDays: 21,
  ```
- **Problem:** 21 days (3 weeks) of risk exposure from a single design change is plausible for a production-impacting Class I change but is at the high end. Risk exposure in this context means the period during which the production baseline is out of sync with the intended design (version drift), the configuration baseline is uncertain, and the production line is either building to the old design or waiting for the change to be incorporated. For a standard Class I change, 10-15 business days of risk exposure is typical. 21 days (15 business days) is realistic for complex changes requiring airworthiness re-evaluation. Keeping 21 days is acceptable but should be justified in a comment.
- **Corrected Text:**
  ```typescript
  // 14 days (2 weeks / 10 business days) of risk exposure from ECR initiation
  // to ECO release. During this period: (1) production line may be building to
  // the old configuration baseline while the change is pending, (2) version drift
  // accumulates between OEM and supplier PLM systems, (3) IP-sensitive design data
  // is in transit across organizational boundaries with incomplete access controls,
  // (4) interchangeability/replaceability status is uncertain. For complex changes
  // requiring airworthiness assessment updates, risk exposure can extend to 21+ days.
  riskExposureDays: 14,
  ```
- **Source/Rationale:** Standard Class I change cycle at major OEMs: 10-20 business day total cycle, with risk exposure concentrated in the assessment and approval phases (roughly 50-75% of the cycle).

### Finding 12: `auditGapCount: 5` is Not Enumerated

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, line 112
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:**
  ```typescript
  auditGapCount: 5,
  ```
- **Problem:** The corrected supplier-cert and quality-inspection scenarios include detailed comments enumerating each audit gap. This scenario provides a bare number with no explanation. Five audit gaps is reasonable but should be enumerated.
- **Corrected Text:** See Section 4 for the complete corrected scenario with enumerated audit gaps.
- **Source/Rationale:** Consistency with corrected scenarios in this project.

### Finding 13: `todayPolicies` Has `expirySeconds: 25` -- Needs Comment

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, line 133
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:**
  ```typescript
  expirySeconds: 25,
  ```
- **Problem:** The simulation-compressed expiry of 25 seconds has no comment explaining what real-world duration it represents. The corrected scenarios include detailed comments explaining the simulation compression (e.g., supplier-cert's `expirySeconds: 30` includes a comment explaining it represents the open-ended queue wait).
- **Corrected Text:** See Section 4 for the complete corrected scenario with simulation compression comments.
- **Source/Rationale:** Consistency with corrected scenarios.

### Finding 14: Tier-1 Supplier Hierarchy is Flat

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, lines 27-33 and 53-59
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** The Tier-1 Supplier has only one child: `design-lead-supplier` placed directly under `tier1-supplier`.
- **Problem:** The Tier-1 Supplier has no Engineering department, no Configuration Manager, and no Quality representative. In a real bilateral design review, the supplier side mirrors the OEM: there is a supplier Engineering department, a supplier Design Lead, a supplier Configuration Manager (who maintains the supplier's configuration baseline), and a supplier Quality representative (who assesses the change's impact on manufacturing quality and inspection requirements). Adding a full supplier hierarchy adds realism without complexity.
- **Corrected Text:** Add a supplier Engineering department:
  ```typescript
  {
    id: "supplier-engineering",
    type: NodeType.Department,
    label: "Supplier Engineering",
    description:
      "Manages the supplier's configuration baseline, PLM environment, and engineering change impact assessment. Reviews OEM-initiated changes for manufacturing impact, tooling requirements, and certification status.",
    parentId: "tier1-supplier",
    organizationId: "tier1-supplier",
    color: "#06B6D4",
  },
  ```
- **Source/Rationale:** Standard Tier-1 supplier organizational structure at Spirit AeroSystems, GE Aviation, Safran, Collins Aerospace.

### Finding 15: Narrative Journey (Section 3) is Thin and Generic

- **Location:** `docs/scenario-journeys/supply-chain-scenarios.md`, lines 148-209
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** The entire Section 3 is 61 lines with a 6-row takeaway table, no enumerated audit gaps, no PLM tooling references, no change classification terminology, no configuration management vocabulary.
- **Problem:** Compared to Section 1 (Supplier Cert, 74 lines, 8-row table, detailed CB/accreditation references) and Section 2 (Quality Inspection, 82 lines, 9-row table, detailed MES/ERP and ISO clause references), Section 3 is dramatically under-developed. It uses generic language ("NDA-stamped email," "manual BOM review") without the specific industry terminology expected for an aerospace engineering change scenario (ECR/ECN, Class I/Class II, configuration baseline, CMB, effectivity, interchangeability, affected-items list, design assurance level). The takeaway table has only 6 rows versus 8-9 rows in the corrected scenarios.
- **Corrected Text:** See Section 4 for the complete corrected narrative.
- **Source/Rationale:** Consistency with Sections 1 and 2, and expected level of detail for an aerospace engineering change governance scenario.

### Finding 16: Delegation Edge Points to Wrong ID and Wrong Parent

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, line 100
- **Issue Type:** Logic Error
- **Severity:** High
- **Current Text:**
  ```typescript
  { sourceId: "design-lead-oem", targetId: "ip-counsel", type: "delegation" },
  ```
- **Problem:** The delegation edge references `ip-counsel` which is the misnamed Chief Engineer. Additionally, the authority edge on line 99 (`{ sourceId: "oem-corp", targetId: "ip-counsel", type: "authority" }`) places the Chief Engineer directly under the organization, not under the Engineering department. This means the organizational hierarchy shows the Chief Engineer reporting to the organization, not to Engineering -- which is inconsistent with aerospace organizational structures where the Chief Engineer reports through the Engineering chain.
- **Corrected Text:**
  ```typescript
  { sourceId: "engineering", targetId: "chief-engineer", type: "authority" },
  { sourceId: "design-lead-oem", targetId: "chief-engineer", type: "delegation" },
  ```
- **Source/Rationale:** Organizational hierarchy: Chief Engineer reports through the Engineering function at all major OEMs.

### Finding 17: No Change Classification (Class I vs. Class II)

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, throughout
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No mention of change classification anywhere in the TypeScript file.
- **Problem:** SAE EIA-649-C and EIA-649-1 define two classes of engineering changes: Class I (affects form, fit, function, or interface -- requires bilateral approval) and Class II (editorial, non-functional -- approved unilaterally). The scenario describes a Class I change (safety-critical component modification affecting form/fit/function) but never uses the terminology. Without change classification, the policy cannot distinguish between changes that require bilateral approval and changes that can be approved unilaterally. The description, workflow name, and comments should explicitly reference Class I change classification.
- **Corrected Text:** See Section 4 for the complete corrected scenario with Class I terminology.
- **Source/Rationale:** SAE EIA-649-C Section 5.3 (Configuration Control), SAE EIA-649-1 (Class I/Class II change classification).

### Finding 18: Missing VP of Engineering Escalation Role

- **Location:** `src/scenarios/supply-chain/joint-design.ts`, actors array
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No escalation authority is defined.
- **Problem:** The corrected supplier-cert scenario includes a VP of Supply Chain as escalation authority. The corrected quality-inspection scenario includes a Plant Manager as second-tier escalation. This scenario has no escalation authority at all. For bilateral engineering change governance, the VP of Engineering (OEM side) is the standard escalation authority when CMB-level changes stall.
- **Corrected Text:** Add VP of Engineering actor. See Section 4.
- **Source/Rationale:** Standard OEM escalation chain for engineering changes: Design Lead -> Chief Engineer -> VP of Engineering.

---

## 3. Missing Elements

1. **Configuration Management Board (CMB) or PLM System actor.** The scenario describes PLM systems and configuration management extensively but models no PLM system actor and no CMB governance body. The corrected supplier-cert and quality-inspection scenarios both include System actors.

2. **Change classification (Class I vs. Class II).** The foundational taxonomy of aerospace engineering change management is completely absent.

3. **Impact assessment step.** Before bilateral approval, both OEM and supplier must independently assess cost, schedule, weight, reliability, manufacturing, and tooling impact. This formal process step (2-5 business days) is not modeled.

4. **Effectivity definition.** After an ECO is approved, the effectivity (production lot number or serial number at which the change becomes effective) must be defined. This is a critical configuration management step that is absent.

5. **Interchangeability/replaceability determination.** When a design change modifies a component, the engineering team must determine whether the new revision is interchangeable (can replace the old part without other changes) or non-interchangeable (requires coordinated changes to mating parts, tooling, or test procedures). This determination drives production planning and logistics.

6. **Affected-items list.** An ECO generates an affected-items list in the PLM system -- all parts, assemblies, drawings, specifications, and test procedures impacted by the change. This is the mechanism that prevents version drift.

7. **Supplier-side Configuration Manager.** The supplier organization should include a Configuration Manager role who maintains the supplier's configuration baseline and ensures the supplier's PLM system is synchronized with the OEM's change.

8. **ITAR/export control consideration.** If the component is a defense article, all technical data in the design change package (drawings, specifications, test data) must be shared under a valid TAA or MLA. The scenario mentions "IP exposure" and "NDA-stamped drawings" but does not model export control governance.

9. **Bill of Materials (BOM) update and drawing revision.** The ECO process includes formal BOM updates and drawing revisions in the PLM system. These are configuration identification activities that maintain the configuration baseline.

10. **`costPerHourDefault`.** The corrected quality-inspection scenario includes a `costPerHourDefault: 50000`. The joint design scenario should include a cost estimate for production line delays caused by engineering change delays. For aerospace, program delay costs range from $50K-$500K per day depending on the program.

---

## 4. Corrected Scenario

### Corrected TypeScript (`joint-design.ts`)

```typescript
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
```

### Corrected Narrative Journey (Markdown)

The following replaces Section 3 ("Joint Design Review") of `docs/scenario-journeys/supply-chain-scenarios.md` starting at line 148:

```markdown
## 3. Joint Design Review & Cross-Organization Engineering Change Governance

**Setting:** An Aerospace OEM needs to process a Class I engineering change (form/fit/function modification) to a safety-critical component manufactured by a Tier-1 Supplier. The Engineering Change Request (ECR) is initiated in the OEM's PLM system (Siemens Teamcenter) and must be routed to the supplier, who operates a separate PLM environment (PTC Windchill) with a separate Configuration Management Board (CMB). Both organizations must independently assess the design change impact -- cost, schedule, weight, reliability, manufacturing processes, and tooling -- before their respective CMBs can approve. Under SAE EIA-649-C and AS9100D Clause 8.5.6, Class I changes (affecting form, fit, function, or interface) require bilateral approval from both the OEM's and supplier's engineering authorities. The PLM / Configuration Management System maintains a configuration baseline lock on the affected component until bilateral approval is recorded. Cross-org coordination adds 5-15 business days to the change cycle, during which version drift accumulates between PLM configuration baselines and IP-sensitive technical data sits in uncontrolled email channels.

**Players:**
- **Aerospace OEM** (organization)
  - Engineering Department
    - OEM Design Lead -- initiates ECR in PLM, prepares change package (drawing revisions, BOM updates, affected-items list), presents to OEM CMB
    - Chief Engineer / Design Authority -- delegate for OEM Design Lead on Minor class changes per FAR 21.93
  - Program Manager -- assesses IMS and EVM impact, coordinates effectivity planning
  - VP of Engineering -- escalation authority for stalled bilateral changes
  - PLM / Configuration Management System -- maintains configuration baseline, routes ECR/ECN workflow, enforces baseline lock until bilateral approval
- **Tier-1 Supplier** (external partner)
  - Supplier Engineering Department
    - Supplier Design Lead -- mandatory bilateral approver; independently assesses impact to supplier's configuration baseline, manufacturing processes, and tooling

**Action:** OEM Design Lead initiates a Class I Engineering Change Request in the PLM system for a safety-critical component modification. Requires 2-of-3 bilateral approval from OEM Design Lead, Supplier Design Lead (mandatory), and Program Manager. Delegation from OEM Design Lead to Chief Engineer for Minor class changes. Auto-escalation to VP of Engineering after 5 business days if bilateral threshold is not met.

---

### Today's Process

**Policy:** All 3 of 3 must approve. No delegation. No escalation. No PLM workflow enforcement.

1. **ECR emailed to supplier.** The OEM Design Lead prepares a design change package -- drawing revisions, BOM markup, and a written engineering rationale -- and emails it to the Supplier Design Lead with NDA-stamped attachments. The supplier must manually import the change package into their separate PLM system (Windchill). There is no automated cross-org ECR routing between PLM systems. *(~10 sec delay; represents 1-2 business days real-world elapsed time for package preparation, cross-org routing, and supplier acknowledgment)*

2. **Manual bilateral impact assessment.** The Supplier Design Lead must independently assess the design change impact: cross-referencing the OEM's affected-items list against the supplier's BOM in their PLM, evaluating manufacturing process impact (CNC programs, tooling, fixtures), material specification changes, and cost estimate. The OEM engineer must context-switch between the OEM's PLM and the supplier's portal (or emailed responses) to reconcile the two impact assessments. No structured impact assessment template links the assessment to the ECR in either PLM system. *(~7 sec delay; represents 2-5 business days real-world elapsed time)*

3. **OEM Design Lead unavailable.** The OEM Design Lead is on the factory floor supporting a production issue. The Class I change package sits in the PLM workflow queue. No delegation to the Chief Engineer is configured in the system. Someone calls the front desk to relay a message. Meanwhile, version drift accumulates -- the supplier is continuing to manufacture to the old configuration baseline because the ECO has not been formally released. *(~10 sec delay; represents 2-5 business days real-world delay)*

4. **Engineering change blocked.** With 3-of-3 required across organizational boundaries, no delegation, and no escalation, the Class I engineering change is blocked. The production timeline for the component slips. The Integrated Master Schedule (IMS) shows a 2-3 week delay cascading to downstream assembly operations. NDA-stamped drawings and proprietary manufacturing specifications sit in email inboxes with no access controls, no download tracking, and no ITAR/export control verification.

5. **Outcome:** 40+ hours of active manual effort (2-4 weeks wall-clock elapsed time). 14 days of risk exposure with version drift between PLM configuration baselines. 6 audit gaps: (1) ECR initiated via email -- no formal PLM change request record, (2) impact assessment conducted informally with no structured template linked to ECR, (3) CMB review not documented -- verbal approvals with no recorded disposition, (4) version drift between OEM and supplier PLM baselines with no automated synchronization, (5) IP-sensitive technical data shared via email with no access controls or ITAR verification, (6) effectivity not formally defined in PLM -- production cutover coordinated verbally. An AS9100D auditor would flag the absence of a formal configuration management process (Clause 8.5.6) as a major nonconformity. An SAE EIA-649-C auditor would cite missing Configuration Control function (formal change evaluation, coordination, and bilateral approval).

**Metrics:** ~40 hours active effort (2-4 weeks elapsed), 14 days of risk exposure, 6 audit gaps, 8 manual steps.

---

### With Accumulate

**Policy:** 2-of-3 threshold (OEM Design Lead, Supplier Design Lead [mandatory], Program Manager). Delegation from OEM Design Lead to Chief Engineer / Design Authority for Minor class changes. Auto-escalation to VP of Engineering after 5 business days. 5-business-day authority window. Production environment constraint.

1. **ECR submitted through PLM.** OEM Design Lead initiates the Engineering Change Request in the PLM system with the complete change package (drawing revisions, BOM updates, affected-items list, interchangeability determination). The Accumulate policy engine routes the ECR across the organizational boundary to all three approvers, including cross-org routing to the Supplier Design Lead via the supplier portal integration. ITAR/export control classification is verified before technical data is shared across the organizational boundary.

2. **Supplier Design Lead reviews (mandatory).** The Supplier Design Lead receives the change package through the controlled supplier portal. They conduct their independent impact assessment using a structured template that links to the ECR record. Their assessment covers manufacturing process impact, tooling modification, material availability, cost estimate, and certification status. This approval is mandatory and cannot be bypassed by any threshold combination -- per SAE EIA-649-1, bilateral approval is required for all Class I changes.

3. **Threshold met via delegation.** The OEM Design Lead is on the factory floor, but the policy automatically invokes the pre-configured delegation to the Chief Engineer / Design Authority (same department, same engineering function). The Chief Engineer reviews the safety-critical design modification against airworthiness requirements and Design Assurance Level allocation per ARP4754A. With the Supplier Design Lead (mandatory) and the Chief Engineer (delegated from OEM Design Lead) both approving, the 2-of-3 threshold is met. The Program Manager adds their schedule/cost assessment within the authority window, strengthening the approval record.

4. **Configuration baseline updated.** The PLM / Configuration Management System records the bilateral approval, releases the ECO, updates the configuration baseline in both the OEM and supplier PLM systems (via supplier portal synchronization), and generates the updated affected-items list. Effectivity is defined (production lot or serial number cutover). Interchangeability/replaceability determination is recorded. Cryptographic proof captures the bilateral approval chain, drawing revision hashes, BOM change records, impact assessments, and ITAR compliance verification.

5. **VP of Engineering monitors.** If the bilateral threshold had not been met within 5 business days, the system would have auto-escalated to the VP of Engineering, who can convene an executive-level bilateral review with the supplier's VP of Engineering.

6. **Outcome:** Class I engineering change approved in 3-5 business days instead of 2-4 weeks. Configuration baselines synchronized across PLM systems. No version drift. IP-sensitive technical data controlled through supplier portal with access controls and ITAR verification. Full configuration management audit trail with cryptographic proof of bilateral approval.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| ECR initiation and routing | Email with NDA-stamped attachments across org boundary | PLM-integrated ECR with automated cross-org routing via supplier portal |
| Change classification | No Class I / Class II distinction | Class I bilateral change workflow enforced by policy |
| Bilateral impact assessment | Informal email exchange, no structured template | Structured assessment template linked to ECR with bilateral review |
| CMB / configuration management | No formal CMB review -- verbal approvals | PLM-enforced CMB approval routing with configuration baseline lock |
| When OEM Design Lead is unavailable | Change blocked -- no delegation, no escalation | Delegation to Chief Engineer (Minor class) + auto-escalation to VP Engineering |
| Version drift across PLM systems | Manual TDP exchange -- baseline divergence between OEM and supplier | Supplier portal synchronization with cryptographic baseline hashes |
| IP / export control protection | NDA-stamped email attachments with no access controls | Controlled supplier portal with ITAR classification verification and access logging |
| Effectivity and interchangeability | Verbal coordination -- no PLM record | Formal effectivity and interchangeability determination in PLM |
| Time to approval | ~40 hours active (2-4 weeks elapsed) | 3-5 business days |
| Audit / compliance record | Email chain with NDA-stamped attachments, no linked impact assessments | Cryptographic proof chain: ECR, bilateral impact assessments, CMB approvals, configuration baseline update, drawing revision hashes, ITAR verification |
```

---

## 5. Credibility Risk Assessment

### Audience 1: VP of Engineering at a Major Aerospace OEM (15+ years chairing CMBs)

**Would challenge in the ORIGINAL:**
- "Where is the CMB? No aerospace OEM approves Class I changes through individual engineer sign-off. I have chaired CMBs for 15 years -- every Class I change goes through the board."
- "The actor `ip-counsel` is labeled Chief Engineer? IP Counsel is our Legal department. The Chief Engineer is Engineering. These are completely different functions."
- "No change classification? We process 500+ ECRs per year -- the first thing we determine is Class I or Class II. This scenario does not distinguish."
- "20-hour authority window for a bilateral Class I change? Our standard cycle is 10-15 business days. 20 hours is not serious."
- "No mandatory supplier approval? The entire point of bilateral governance is that the supplier MUST independently approve Class I changes. If our Program Manager and Design Lead can approve without the supplier, we have bypassed the bilateral requirement."

**Would accept in the CORRECTED:**
- 2-of-3 threshold with mandatory supplier approval correctly models bilateral governance
- Class I change classification with FAR 21.93 Minor/Major distinction
- 5-business-day authority window is aggressive but achievable with automation
- Delegation constrained to Minor class changes within the engineering delegation matrix
- PLM / CMB System actor as the enforcement point
- Escalation to VP of Engineering for stalled bilateral changes

### Audience 2: AS9100D / SAE EIA-649 Lead Auditor

**Would challenge in the ORIGINAL:**
- "AS9100D Clause 8.5.6 requires a formal configuration management process. This scenario has no CM process -- no ECR/ECN workflow, no configuration baseline, no affected-items analysis, no status accounting."
- "SAE EIA-649-C Configuration Control function requires formal evaluation, coordination, and approval of changes. This scenario shows an email chain, not a formal change process."
- "The regulatory context references EAR section 764 and ISO 9001 Clause 8.4. Neither applies to engineering change governance. Where is AS9100D 8.5.6? Where is EIA-649-C?"
- "No audit gaps are enumerated. I need to see exactly what the gaps are to assess compliance impact."

**Would accept in the CORRECTED:**
- Inline regulatory context citing AS9100D Clause 8.5.6, SAE EIA-649-C, ARP4754A, and ITAR
- Six enumerated audit gaps mapping to specific configuration management requirements
- CMB/PLM System actor enforcing configuration baseline lock
- Detailed descriptions using correct CM terminology (ECR/ECN, configuration baseline, affected-items list, effectivity, interchangeability)

### Audience 3: Chief Engineer / Design Authority

**Would challenge in the ORIGINAL:**
- "The delegation is from Design Lead to `ip-counsel`? I am the Chief Engineer. I am not IP Counsel. This naming is wrong."
- "There are no delegation constraints. As Chief Engineer, I can approve Class I Minor changes within my designated systems scope. I cannot approve Major changes requiring STC -- that requires DAH authority. The scenario does not model this."
- "Where is the safety assessment gate? If this is a DAL A/B component, a design change requires updated FHA and FTA per ARP4754A. The scenario does not mention design assurance level."

**Would accept in the CORRECTED:**
- Chief Engineer properly placed under Engineering department with correct ID
- Delegation constrained to Minor class changes per FAR 21.93 with systems scope limitation
- ARP4754A regulatory context referencing DAL A/B safety assessment requirements
- Description referencing airworthiness requirements and design assurance level allocation

### Audience 4: PLM Architect (Teamcenter/Windchill cross-org implementation)

**Would challenge in the ORIGINAL:**
- "The scenario talks about PLM systems extensively in the description but has no System actor. The supplier-cert scenario has an SLM/ERP System. The quality-inspection scenario has an MES/ERP System. This scenario needs a PLM System actor."
- "No mention of the cross-org integration mechanism. Is it supplier portal? OSLC? TDP exchange? Manual file exchange? The integration pattern matters for the version drift problem."
- "No affected-items list, no BOM update, no drawing revision hash, no configuration baseline concept. These are the core PLM data objects in an engineering change workflow."

**Would accept in the CORRECTED:**
- PLM / Configuration Management System actor with specific platform references (Teamcenter ECM, Windchill CM, 3DEXPERIENCE ENOVIA)
- Supplier portal integration explicitly modeled (Boeing Exostar, Lockheed Martin SDN)
- Affected-items list, BOM updates, drawing revision hashes, and configuration baseline lock referenced throughout
- Cross-org synchronization described with specific mechanisms

### Audience 5: Program Manager (IMS/EVM assessment)

**Would challenge in the ORIGINAL:**
- "The description says 'tracks schedule impact' -- that is not what a Program Manager does on a CMB. I assess the impact of the engineering change against the Integrated Master Schedule and Earned Value Management baseline. I evaluate production rate impact, tooling modification lead times, and supply chain disruption. I coordinate effectivity planning."
- "`manualTimeHours: 120` is 5 full days of active effort? For a single design change? I spend 4-6 hours on my impact assessment. 120 hours total across all participants is overstated."
- "`riskExposureDays: 21` -- plausible for a production-impacting change, but the narrative says '120+ hours (5 days) of delay' and then jumps to '21 days of schedule risk.' These numbers are inconsistent."

**Would accept in the CORRECTED:**
- Program Manager description references IMS, EVM, production rate impact, and effectivity planning
- 40 hours of active manual effort with detailed breakdown across participants
- 14 days of risk exposure with clear explanation of what creates the risk (version drift, configuration uncertainty, production continuity)
- Effectivity planning and interchangeability determination included as formal process steps
