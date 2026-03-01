# SME Review #15: Supplier ISO Certification & Risk-Based Onboarding

**Reviewer:** Hyper-SME Agent -- Senior Supply Chain Procurement Governance, Supplier Quality Management, and ISO/Accreditation Compliance Expert
**Date:** 2026-02-28
**Scenario:** `supply-chain-supplier-cert` -- Supplier ISO Certification & Risk-Based Onboarding
**Primary File:** `src/scenarios/supply-chain/supplier-cert.ts`
**Narrative File:** `docs/scenario-journeys/supply-chain-scenarios.md` (Section 1, lines 5-65)

---

## 1. Executive Assessment

### Overall Credibility Score: C+

The scenario captures the correct core pain point -- multi-function supplier onboarding delayed by sequential approvals that block ERP vendor activation -- and correctly identifies the three functional domains involved (Procurement, Quality, Compliance). The 2-of-3 threshold model is a defensible simplification. The narrative reads plausibly at a surface level.

However, the scenario falls short on nearly every dimension of depth and rigor that a VP of Supply Chain Quality or an ISO Lead Auditor would expect. The organizational structure is incomplete (no Compliance department), the delegation model is cross-functional in a way that no Compliance Officer would accept, there is no escalation path, no delegation constraints, no mandatory approvers, no risk-tier constraints, the regulatory context is generic and not specific to supplier certification governance, and the metrics conflate wall-clock elapsed time with active manual effort. The scenario reads like a first draft by someone who understands the general shape of supplier onboarding but has not operated the process.

### Top 3 Most Critical Issues

| # | Issue | Severity |
|---|-------|----------|
| 1 | **Cross-functional delegation from Compliance Officer to QA Manager** -- Compliance and Quality are separate disciplines with different competencies. A Compliance Officer would delegate to a Senior Risk Analyst or Deputy Compliance Officer, never to the Quality Manager. This would be immediately challenged by both a Compliance Officer and a Quality Manager. | Critical |
| 2 | **No Compliance/GRC department** -- The Compliance Officer reports directly to the manufacturer organization node with no parent department. Every other corrected scenario places roles under departments. This is structurally incorrect and breaks the organizational hierarchy pattern. | High |
| 3 | **`regulatoryContext` imports generic `REGULATORY_DB["supply-chain"]` instead of inline supplier-certification-specific frameworks** -- The EAR SS764 entry is about export control (not supplier onboarding), and the ISO 9001:2015 Clause 8.4 entry is generic ("External Providers") rather than specific to certification verification, accreditation body recognition, or supplier qualification. A SOC 2 auditor reviewing this scenario would note the lack of specificity. | High |

### Top 3 Strengths

1. **Correct identification of the three-function approval model** -- Procurement, Quality, and Compliance is the standard multi-function onboarding workflow at global manufacturers. The 2-of-3 threshold simplification is reasonable for a simulation.
2. **Correct identification of ERP vendor activation as the control point** -- The scenario accurately describes that purchase orders cannot be issued until the vendor master is fully approved, which is how SAP S/4HANA (and most enterprise ERPs) actually work.
3. **The "supplier bypass" risk narrative is real and well-articulated** -- The pressure to issue purchase orders to unapproved suppliers when onboarding is delayed and production schedules are at risk is a genuine and significant compliance problem.

---

## 2. Line-by-Line Findings

### Finding F15-01: Compliance Officer has no parent department

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, lines 44-51 (actor `compliance-officer`)
- **Issue Type:** Missing Element / Inconsistency
- **Severity:** High
- **Current Text:**
  ```typescript
  {
    id: "compliance-officer",
    type: NodeType.Role,
    label: "Compliance Officer",
    description: "Risk authority -- validates accreditation body recognition, expiry status, and audit history across external registries",
    parentId: "manufacturer",
    organizationId: "manufacturer",
    color: "#94A3B8",
  },
  ```
- **Problem:** The Compliance Officer role has `parentId: "manufacturer"`, placing it directly under the organization node with no intermediate department. Every other corrected scenario (vendor-access, privileged-access) places roles under department nodes. At a global manufacturer, the Compliance Officer sits within a Compliance, GRC, or Risk Management department -- never as a free-floating role under the corporate entity. This also means there is no natural home for a within-function delegate (e.g., Senior Risk Analyst), which forces the cross-functional delegation in F15-02.
- **Corrected Text:** Add a `compliance-dept` department node and re-parent the Compliance Officer under it. Add a Senior Risk Analyst role under the same department as the proper delegation target.
- **Source/Rationale:** Standard organizational design at global manufacturers (Bosch, Honeywell, Parker Hannifin, Eaton); corrected SaaS scenarios all follow department-then-role hierarchy.

### Finding F15-02: Cross-functional delegation from Compliance Officer to QA Manager

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, line 91 (`delegateToRoleId: "qa-manager"`) and line 100 (delegation edge)
- **Issue Type:** Incorrect Workflow
- **Severity:** Critical
- **Current Text:**
  ```typescript
  delegateToRoleId: "qa-manager",
  ```
  and:
  ```typescript
  { sourceId: "compliance-officer", targetId: "qa-manager", type: "delegation" },
  ```
- **Problem:** This delegates Compliance Officer authority to the QA Manager, who sits in a completely different function (Quality). Compliance and Quality are separate disciplines with different competencies:
  - **Compliance Officer** verifies: accreditation body recognition (IAF MLA signatory verification), denied party screening (BIS Entity List, OFAC SDN, EU sanctions), financial risk assessment (D&B rating), export control classification, insurance coverage.
  - **QA Manager** verifies: ISO certification validity (certificate number lookup), scope alignment (certified scope covers procured products), audit findings (no major nonconformities), supplier capability assessment, PPAP/FAI readiness.

  A QA Manager does not have the training, access, or authority to perform denied party screening or validate accreditation body recognition. A Compliance Officer would delegate to a Senior Risk Analyst or Deputy Compliance Officer within the Compliance/GRC function. This delegation would be immediately rejected by both a Compliance Officer ("that's not their competency") and a QA Manager ("that's not my responsibility").
- **Corrected Text:** Change `delegateToRoleId` to `"senior-risk-analyst"` and add a Senior Risk Analyst role under the Compliance department. Update the delegation edge accordingly.
- **Source/Rationale:** ISO 9001:2015 Clause 5.3 (Organizational Roles, Responsibilities, and Authorities) requires clear role definition. Industry practice at Fortune 500 manufacturers separates Compliance/Risk from Quality in the organizational chart. Cross-functional delegation would create a SOC 2 CC1.3 (Established Roles and Responsibilities) finding.

### Finding F15-03: No escalation path defined

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, lines 80-92 (policy definition)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `escalation` field in the policy.
- **Problem:** If both the Compliance Officer and the delegate (currently QA Manager, should be Senior Risk Analyst) are unavailable -- which happens during audit season (September-December) when quality and compliance teams are overwhelmed with internal and customer audits -- there is no escalation path. The corrected SaaS scenarios all include an `escalation` rule. For supplier onboarding at a global manufacturer, the VP of Supply Chain or Chief Procurement Officer (CPO) is the escalation authority for urgent onboarding when standard approvers are unavailable.
- **Corrected Text:** Add `escalation: { afterSeconds: 20, toRoleIds: ["vp-supply-chain"] }` to the policy, and add a VP of Supply Chain role to the actor list.
- **Source/Rationale:** Standard practice at global manufacturers; corrected SaaS scenarios (privileged-access) all include escalation rules with defined timeouts and target roles.

### Finding F15-04: No delegationConstraints defined

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, lines 80-92 (policy definition)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `delegationConstraints` field in the policy.
- **Problem:** The delegation is completely unconstrained -- the delegate can approve any supplier onboarding regardless of risk tier, commodity category, or spend level. In practice, delegation for supplier onboarding is always scoped: a Senior Risk Analyst can approve standard-risk suppliers (preferred/approved tier) but not critical or sole-source suppliers, and not suppliers in sanctioned countries or with financial distress flags. Without constraints, the delegation is a blank check that no Compliance Officer would grant.
- **Corrected Text:** Add `delegationConstraints: "Delegation from Compliance Officer to Senior Risk Analyst is limited to standard-risk and preferred-tier supplier onboarding where denied party screening is clear and financial risk rating is acceptable. Critical suppliers, sole-source suppliers, suppliers in sanctioned or high-risk countries, and suppliers with adverse financial indicators require Compliance Officer direct review."`.
- **Source/Rationale:** Risk-based supplier classification frameworks (ISO 9001:2015 Clause 8.4.1, IATF 16949 Clause 8.4.1.2); corrected SaaS scenarios (vendor-access, privileged-access) all include specific delegation constraints.

### Finding F15-05: No mandatoryApprovers defined

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, lines 80-92 (policy definition)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No `mandatoryApprovers` field in the policy.
- **Problem:** With a 2-of-3 threshold and no mandatory approvers, it is theoretically possible for the Procurement Lead and the Compliance Officer to approve without the QA Manager ever verifying ISO certification scope alignment. At a global manufacturer, the QA Manager's verification of ISO certification validity, scope alignment, and audit findings is non-negotiable -- you cannot onboard a supplier without Quality sign-off. The QA Manager should be a mandatory approver.
- **Corrected Text:** Add `mandatoryApprovers: ["qa-manager"]` to the policy.
- **Source/Rationale:** ISO 9001:2015 Clause 8.4.1 requires evaluation of external providers based on their ability to provide processes, products, or services in accordance with requirements. IATF 16949 Clause 8.4.1.2 requires a documented supplier selection process including quality management system assessment. This is a Quality function responsibility that cannot be bypassed.

### Finding F15-06: No constraints defined

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, lines 80-92 (policy definition)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No `constraints` field in the policy.
- **Problem:** The corrected SaaS scenarios include constraints (e.g., `environment: "production"`). For supplier onboarding, the equivalent constraint is the supplier's risk tier or the ERP environment. The `constraints` interface currently supports `amountMax` and `environment`. While neither maps perfectly to supplier risk tier, the `environment` field can be used to indicate the ERP production environment where vendor activation occurs (SAP production client vs. sandbox). Alternatively, this is an acknowledged limitation of the current type system.
- **Corrected Text:** Add `constraints: { environment: "sap-enclave" }` to indicate that vendor master activation occurs in the SAP production environment, which is a controlled enclave requiring governance controls.
- **Source/Rationale:** Corrected SaaS scenarios all include constraints; SAP vendor master activation in a production client is a controlled operation requiring governance.

### Finding F15-07: `manualTimeHours: 48` conflates wall-clock and active effort

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, line 110
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `manualTimeHours: 48`
- **Problem:** 48 hours could be interpreted as 48 hours of active manual effort, which is wildly overstated. Typical active manual effort for supplier onboarding across all three functions is 8-16 hours, spread across 3-7 business days of wall-clock time. The narrative (line 34 of supply-chain-scenarios.md) says "48+ hours of delay," which is wall-clock elapsed time, not active manual effort. The field name `manualTimeHours` suggests active effort, not elapsed time. The corrected SaaS scenarios include comments clarifying this distinction (e.g., privileged-access uses `manualTimeHours: 3` with a comment explaining wall-clock vs. active effort). A more defensible value for wall-clock elapsed time during a normal onboarding cycle is 24-40 hours (3-5 business days). During audit season, 80-120 hours (2-3 weeks) is realistic. 48 hours (2 business days) is actually on the low end for standard onboarding if we mean wall-clock time, but on the very high end if we mean active effort.
- **Corrected Text:** `manualTimeHours: 36` with a comment clarifying this is wall-clock elapsed time, not active effort. Active manual effort is approximately 10-14 hours spread across the 3-5 business day elapsed window.
- **Source/Rationale:** Agent brief section on "3-7 business day onboarding timeline"; corrected SaaS scenarios include comments distinguishing wall-clock from active effort.

### Finding F15-08: `riskExposureDays: 14` inconsistent with narrative

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, line 111
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `riskExposureDays: 14`
- **Problem:** 14 days implies the onboarding takes 2 full weeks. During normal periods, 3-7 business days is typical. During audit season, 2-3 weeks (10-15 business days) is realistic. The scenario description mentions "3-7 business days" as the typical timeline. If the scenario is about a normal onboarding that is delayed by the Compliance Officer traveling, 7-10 days of risk exposure is more defensible. If the scenario is explicitly about audit season, 14 days is justifiable but should be stated as such in a comment. The narrative in `supply-chain-scenarios.md` says "14 days of risk exposure" but does not specify audit season context.
- **Corrected Text:** `riskExposureDays: 10` with a comment explaining: "10 days of risk exposure represents the period from onboarding initiation to ERP vendor activation, during which the manufacturer either cannot source from the supplier or faces pressure to bypass the approval process. Standard 3-7 business day onboarding extends to 7-10 business days when key approvers are traveling or in audit season."
- **Source/Rationale:** Agent brief section on typical onboarding timeline; industry practice at global manufacturers.

### Finding F15-09: `auditGapCount: 4` -- gaps not enumerated

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, line 112
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `auditGapCount: 4`
- **Problem:** The number 4 is stated but the four audit gaps are not enumerated in comments. The corrected SaaS scenarios (privileged-access, lines 153-157) include detailed comments enumerating each gap. For supplier onboarding, the four gaps should be specific to the SLM/ISO verification process.
- **Corrected Text:** Add comments enumerating the gaps:
  ```
  // (1) ISO certificate scope alignment not systematically verified -- manual browser lookup
  //     against CB directory with no record of which certificate was checked
  // (2) Accreditation body recognition (IAF MLA signatory) not verified or documented --
  //     reviewer may not know to check this step
  // (3) Denied party screening results not linked to the onboarding record -- screening
  //     done in a separate system (OFAC SDN, BIS Entity List) with no audit trail connection
  // (4) Delegation from Compliance Officer is informal (email/call) with no system record --
  //     auditor cannot verify who actually performed the compliance review
  ```
- **Source/Rationale:** Corrected SaaS scenarios enumerate every audit gap; ISO 9001:2015 Clause 8.4.1 requires documented evaluation of external providers.

### Finding F15-10: `expirySeconds: 86400` (24 hours) is short for multi-day onboarding

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, line 89
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `expirySeconds: 86400`
- **Problem:** 24 hours (86,400 seconds) is a tight approval window for supplier onboarding. The QA Manager needs time to verify ISO certification scope alignment (certificate number lookup in CB online directory, scope review, audit finding review), and the Compliance Officer needs time to complete denied party screening and financial risk assessment. These are typically 1-2 business days per function, with review happening asynchronously. A 24-hour window would mean the approval expires before the QA Manager has had time to complete a thorough certification review, especially across time zones. A more defensible window is 72 hours (3 business days) for the Accumulate policy, representing a significant improvement over the "until someone remembers" open-ended window in today's process.
- **Corrected Text:** `expirySeconds: 259200` (72 hours / 3 business days) with a comment: "72-hour approval window accommodates multi-day asynchronous review across Procurement, Quality, and Compliance functions. QA Manager needs 1-2 days for ISO certification scope verification; Compliance needs 1-2 days for denied party screening and accreditation body validation. 72 hours is a significant compression from the current open-ended process."
- **Source/Rationale:** Agent brief section on "3-7 business day" timeline; industry practice for multi-function supplier onboarding.

### Finding F15-11: Policy `actorId` is `"manufacturer"` instead of the ERP/SLM system

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, line 83
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** `actorId: "manufacturer"`
- **Problem:** The corrected SaaS scenarios attach the policy to the technical control point: `vendor-access` attaches it to `"customer-security"` (the GRC department that gates access), and `privileged-access` attaches it to `"platform-team"` (the team that owns PAM governance). For supplier onboarding, the control point is the SLM platform or ERP system that gates vendor activation. The manufacturer organization is too broad -- it is the parent of everything. Adding an SLM/ERP system actor and attaching the policy to it would be consistent with the corrected patterns and would correctly model that the ERP system is what enforces the approval gate (purchase order block until vendor master is activated).
- **Corrected Text:** Add an SLM/ERP system actor and change `actorId` to `"slm-system"`. If an SLM system actor is too heavy for the scenario, attaching the policy to the Procurement department (which owns the SLM workflow) is an acceptable alternative: `actorId: "procurement"`.
- **Source/Rationale:** Corrected SaaS scenario patterns; agent brief notes on ERP vendor master governance.

### Finding F15-12: `regulatoryContext` references generic `REGULATORY_DB["supply-chain"]` instead of inline supplier-certification-specific frameworks

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, line 137
- **Issue Type:** Inaccuracy / Missing Element
- **Severity:** High
- **Current Text:** `regulatoryContext: REGULATORY_DB["supply-chain"]`
- **Problem:** The `REGULATORY_DB["supply-chain"]` array contains two entries: (1) EAR SS764, which is about export administration -- not supplier onboarding, and (2) ISO 9001:2015 Clause 8.4, which is generic ("External Providers") rather than specific to certification verification or accreditation body recognition. The corrected SaaS scenarios use inline `regulatoryContext` arrays with 4-5 entries, each highly specific to the scenario's governance domain. For supplier ISO certification onboarding, the directly applicable frameworks are:
  - **ISO 9001:2015 Clause 8.4.1** -- Evaluation of External Providers: requires documented evaluation and selection of suppliers based on their ability to provide conforming products/services.
  - **IATF 16949 Clause 8.4.1.2** -- Supplier Selection Process: requires documented supplier selection including QMS assessment, risk analysis, and past performance evaluation.
  - **ISO/IEC 17021-1:2015** -- Accreditation body recognition: the standard used by accreditation bodies to accredit certification bodies. Failure to verify that the CB is accredited by an IAF MLA signatory means the ISO certificate may not be internationally recognized.
  - **AS9100D Clause 8.4.1** (for aerospace) or **ISO 13485 Clause 7.4** (for medical device) -- industry-specific QMS supplier qualification requirements.

  The import of `REGULATORY_DB` should also be removed in favor of inline context, consistent with the corrected SaaS scenarios.
- **Corrected Text:** Replace with inline `regulatoryContext` array containing 4 entries specific to supplier certification governance. See corrected scenario below.
- **Source/Rationale:** Corrected SaaS scenarios all use inline regulatoryContext; ISO 9001:2015, IATF 16949, ISO/IEC 17021-1, AS9100D are the directly applicable frameworks.

### Finding F15-13: `todayPolicies` lacks compression comments

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, lines 124-136
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:**
  ```typescript
  todayPolicies: [
    {
      id: "policy-supplier-cert-today",
      actorId: "manufacturer",
      threshold: {
        k: 3,
        n: 3,
        approverRoleIds: ["compliance-officer", "qa-manager", "procurement-lead"],
      },
      expirySeconds: 30,
      delegationAllowed: false,
    },
  ],
  ```
- **Problem:** The corrected SaaS scenarios include comments explaining what the `expirySeconds` value represents in simulation-compressed vs. real-world terms (e.g., "Simulation-compressed: represents real-world 24-48h practical window"). The `expirySeconds: 30` here has no comment explaining what real-world timeline it represents.
- **Corrected Text:** Add a comment: `// Simulation-compressed: represents the real-world scenario where the approval window is effectively open-ended (days to weeks) because the 3-of-3 requirement with no delegation means the request sits in queue until the Compliance Officer returns from travel.`
- **Source/Rationale:** Corrected SaaS scenarios consistently include simulation-compression comments.

### Finding F15-14: Narrative journey (Section 1) is thin -- no enumerated audit gaps, no SLM/ERP tooling references

- **Location:** `docs/scenario-journeys/supply-chain-scenarios.md`, lines 5-65
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** The takeaway table has only 5 rows. No mention of specific SLM platforms (SAP Ariba, Jaggaer, Coupa), ERP systems (SAP S/4HANA), or verification tools (CB online directories, IAF CertSearch). No enumeration of the 4 audit gaps.
- **Problem:** The corrected SaaS scenario narratives include 7-8 row takeaway tables, specific tooling references, and detailed descriptions of each workflow step. The supply chain narrative reads like a summary rather than a detailed journey. A Senior Procurement Manager reading this would expect to see the specific SLM and ERP terminology they use daily.
- **Corrected Text:** See corrected narrative journey below with 8-row takeaway table, specific tooling references, and enumerated audit gaps.
- **Source/Rationale:** Corrected SaaS scenario narratives; industry-standard SLM/ERP terminology.

### Finding F15-15: No SLM/ERP system actor

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, actors array (lines 16-78)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No `NodeType.System` actor in the scenario.
- **Problem:** The corrected SaaS scenarios include system actors (PAM System in both vendor-access and privileged-access) because the system is the technical control point that enforces the policy. For supplier onboarding, the SLM platform (SAP Ariba, Jaggaer, Coupa) and/or the ERP system (SAP S/4HANA) is the control point that gates vendor master activation. The scenario describes ERP activation as the gate but does not model the ERP/SLM system as an actor.
- **Corrected Text:** Add an SLM/ERP system actor. See corrected scenario below.
- **Source/Rationale:** Corrected SaaS scenarios model the technical control point as a system actor; SAP S/4HANA vendor master block is the actual enforcement mechanism.

### Finding F15-16: Manual step delay values lack real-world mapping comments

- **Location:** `src/scenarios/supply-chain/supplier-cert.ts`, lines 117-121 (todayFriction.manualSteps)
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:**
  ```typescript
  { trigger: "after-request", description: "...", delaySeconds: 8 },
  { trigger: "before-approval", description: "...", delaySeconds: 6 },
  { trigger: "on-unavailable", description: "...", delaySeconds: 10 },
  ```
- **Problem:** The corrected SaaS scenarios include inline comments mapping simulation-compressed delay values to real-world durations (e.g., `// Simulation-compressed; represents 1-2 hours real-world TPRM validation`). The supply chain scenario has no such mapping. 8 seconds compressed represents what real-world duration? This should be documented.
- **Corrected Text:** Add comments mapping each delay to real-world duration. See corrected scenario below.
- **Source/Rationale:** Corrected SaaS scenarios consistently include simulation-compression comments.

---

## 3. Missing Elements

### ME-01: Compliance/GRC Department node
The scenario lacks a Compliance or GRC department to house the Compliance Officer and the Senior Risk Analyst (delegation target). This is a structural gap that breaks the department-then-role hierarchy used in all corrected scenarios.

### ME-02: Senior Risk Analyst role (proper intra-function delegate)
The Compliance Officer needs a within-function delegate. The current cross-functional delegation to the QA Manager is incorrect. A Senior Risk Analyst under the Compliance department is the standard delegation target.

### ME-03: VP of Supply Chain / CPO escalation role
When both the Compliance Officer and the delegate are unavailable (audit season), there is no escalation path. The VP of Supply Chain or CPO is the standard escalation authority at global manufacturers.

### ME-04: SLM/ERP System actor
The technical control point (SLM platform / ERP system) that enforces the vendor activation gate is not modeled as an actor. The corrected SaaS scenarios model the PAM system as an actor.

### ME-05: `mandatoryApprovers` -- QA Manager should be mandatory
ISO 9001:2015 Clause 8.4.1 requires documented supplier evaluation. The QA Manager's verification of ISO certification scope alignment cannot be bypassed in any approval combination.

### ME-06: `delegationConstraints` -- delegation scope limits
The delegation should be constrained to standard-risk suppliers. Critical/sole-source suppliers and suppliers in sanctioned countries must require the Compliance Officer directly.

### ME-07: `escalation` rule with timeout
Auto-escalation to VP of Supply Chain when the approval threshold is not met within a defined window.

### ME-08: `constraints` -- environment or risk-tier scoping
The policy should indicate the ERP environment context (production SAP client) where vendor activation occurs.

### ME-09: Inline `regulatoryContext` with supplier-certification-specific frameworks
ISO 9001:2015 Clause 8.4.1, IATF 16949 Clause 8.4.1.2, ISO/IEC 17021-1, and AS9100D Clause 8.4.1 are all directly applicable and should be inline, not imported from the generic REGULATORY_DB.

### ME-10: Enumerated audit gap comments on `auditGapCount`
Each of the 4 (corrected to 5) audit gaps should be enumerated in comments, following the corrected SaaS pattern.

### ME-11: Simulation-compression comments on all delay values and `expirySeconds`
All time-compressed values should include comments mapping to real-world durations.

---

## 4. Corrected Scenario

### Corrected TypeScript (`supplier-cert.ts`)

```typescript
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
    { sourceId: "compliance-dept", targetId: "compliance-officer", type: "authority" },
    { sourceId: "compliance-dept", targetId: "senior-risk-analyst", type: "authority" },
    // --- Delegation edge (intra-function, within Compliance/GRC) ---
    // Compliance Officer delegates to Senior Risk Analyst -- same department,
    // same competency area, constrained to standard-risk suppliers.
    { sourceId: "compliance-officer", targetId: "senior-risk-analyst", type: "delegation" },
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
```

---

### Corrected Narrative Journey (supply-chain-scenarios.md, Section 1)

```markdown
## 1. Supplier ISO Certification & Risk-Based Onboarding

**Setting:** A Global Manufacturer needs to onboard a new Supplier into its approved vendor list through the enterprise Supplier Lifecycle Management (SLM) platform (SAP Ariba / Jaggaer / Coupa). Before the Supplier can receive purchase orders, their ISO certification must be verified by three independent functions: Procurement validates commercial terms, Quality verifies ISO certification validity and scope alignment, and Compliance validates accreditation body recognition and conducts denied party screening. The ERP system (SAP S/4HANA) maintains a purchasing block on the vendor master record until all approvals are collected.

**Players:**
- **Global Manufacturer** (organization)
  - Procurement Department
    - Procurement Lead -- initiator and approver; validates commercial terms
  - Quality Department
    - Quality Manager (SQE) -- mandatory approver; verifies ISO certification scope alignment in CB directory (BSI, TUV SUD, Bureau Veritas, SGS)
  - Compliance / GRC Department
    - Compliance Officer -- approver (traveling to supplier audit); validates accreditation body recognition (IAF MLA signatory), denied party screening (OFAC SDN, BIS Entity List)
    - Senior Risk Analyst -- intra-function delegate for standard-risk suppliers
  - VP of Supply Chain -- escalation authority for urgent onboarding
  - SLM / ERP System -- enforces purchasing block until vendor master is activated
- **Supplier** (external vendor)

**Action:** Procurement Lead initiates ISO certification verification and supplier onboarding through the SLM platform. Requires 2-of-3 approval from Compliance Officer, Quality Manager (mandatory), and Procurement Lead. Delegation from Compliance Officer to Senior Risk Analyst for standard-risk suppliers. Auto-escalation to VP of Supply Chain after 48 hours if threshold not met.

---

### Today's Process

**Policy:** All 3 of 3 must approve. No delegation. No escalation. Informal workflow.

1. **Document submission via email/portal.** The Supplier's ISO certificate package is emailed to Compliance, Quality, and Procurement as scanned PDFs -- or uploaded to the SLM portal where it sits in a shared queue. Procurement Lead reviews commercial terms and manually routes the onboarding request to Quality and Compliance. *(~8 sec delay; represents 4-8 hours real-world elapsed time)*

2. **Manual ISO certification verification.** The QA Manager must manually verify the ISO certificate: (a) look up the certificate number in the certification body's online directory (BSI, TUV SUD, Bureau Veritas, SGS), (b) check that the certified scope covers the specific products/processes being procured, (c) verify that the CB is accredited by an IAF MLA signatory accreditation body, (d) confirm the certificate is current (not expired, not suspended). Each step requires a separate browser session with no system record of what was checked. *(~6 sec delay; represents 1-2 business days real-world elapsed time)*

3. **Compliance Officer traveling.** The Compliance Officer is traveling to a supplier audit at another site. The onboarding request sits in the SLM workflow queue. There is no system-enforced delegation to the Senior Risk Analyst -- the request simply waits. Meanwhile, the production team is escalating informally to Procurement, asking them to issue purchase orders to the unapproved supplier (supplier bypass / maverick sourcing). *(~10 sec delay; represents 2-3 business days real-world queue wait)*

4. **ERP purchasing block active.** With 3-of-3 required and no delegation or escalation, the vendor master purchasing block cannot be removed. No purchase orders can be created. The production line is at risk of material shortage. The Procurement Lead faces pressure to find a workaround.

5. **Outcome:** 36+ hours of wall-clock delay (active effort ~10-14 hours across three functions). 10 days of risk exposure. Five audit gaps: (1) ISO certificate scope verification not documented, (2) accreditation body recognition not verified, (3) denied party screening not linked to onboarding record, (4) informal delegation with no system record, (5) ERP vendor activation not linked to approval workflow. Production line at risk of supplier bypass.

**Metrics:** ~36 hours elapsed delay (10-14 hours active effort), 10 days of risk exposure, 5 audit gaps, 7 manual steps.

---

### With Accumulate

**Policy:** 2-of-3 threshold (Compliance Officer, Quality Manager [mandatory], Procurement Lead). Intra-function delegation from Compliance Officer to Senior Risk Analyst for standard-risk suppliers. Auto-escalation to VP of Supply Chain after 48 hours. 72-hour authority window. SAP production enclave constraint.

1. **Certification submitted through SLM.** Procurement Lead submits the ISO verification and onboarding request through the SLM platform. The Accumulate policy engine routes the request to all three approvers with the supplier's ISO certificate data, CB accreditation status, and denied party screening results pre-populated.

2. **Quality Manager verifies (mandatory).** The Quality Manager reviews the ISO certificate scope alignment, confirms the certified scope covers the procured products/processes, and verifies audit finding status. This approval is mandatory and cannot be bypassed by any threshold combination.

3. **Threshold met via delegation.** The Compliance Officer is traveling, but the policy automatically invokes the pre-configured delegation to the Senior Risk Analyst (same department, same competency). The Senior Risk Analyst completes the accreditation body verification and denied party screening. With the QA Manager (mandatory) and the Senior Risk Analyst (delegated from Compliance) both approving, the 2-of-3 threshold is met.

4. **ERP vendor master activated.** The SLM system receives the cryptographic approval proof and removes the ERP purchasing block. Purchase orders can now be issued. The approval chain, ISO certificate hash, accreditation body verification, and denied party screening results are all captured in the immutable audit trail.

5. **Compliance Officer reviews on return.** The Compliance Officer reviews the delegation record when they return from travel, adding their approval to strengthen the compliance record. The delegation chain is fully auditable.

6. **Outcome:** Supplier onboarded in 1-2 business days instead of 5-10. Production line unaffected. Full ISO compliance audit trail with cryptographic proof of every verification step. No supplier bypass risk.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| ISO certificate verification | Manual CB directory browser lookup per reviewer -- no record of what was checked | Integrated verification with certificate hash, scope match, and CB accreditation status |
| Accreditation body recognition | May not be checked at all -- reviewer may not know to verify IAF MLA signatory status | Policy precondition: CB accreditation by IAF MLA signatory verified before routing |
| When Compliance Officer travels | Onboarding blocked -- request sits in queue for days | Intra-function delegation to Senior Risk Analyst (standard-risk suppliers) |
| Denied party screening | Done in separate system (OFAC SDN, BIS Entity List) -- results not linked to onboarding record | Integrated screening with results captured in the approval chain |
| ERP vendor activation | Manual purchasing block removal after informally collecting approvals | System-enforced: block removed only when cryptographic approval proof received |
| Production line impact | Risk of material shortage and supplier bypass (maverick sourcing) | Unaffected -- onboarding completes in 1-2 business days |
| Time to onboarding | ~36 hours elapsed (5-10 business days with delays) | 1-2 business days |
| Audit trail | Email chain with scanned PDFs, no linked screening records, informal delegation | Cryptographic proof chain: ISO certificate hash, scope verification, CB accreditation, denied party screening, delegation chain, approval timestamps |
```

---

## 5. Credibility Risk Assessment

### Target Audience: VP of Supply Chain Quality at a Global Manufacturer

**Would challenge in ORIGINAL:**
- Cross-functional delegation from Compliance to Quality: "Compliance and Quality are completely different functions. My QA Manager does not have access to denied party screening tools and would refuse this delegation."
- `manualTimeHours: 48` without distinguishing wall-clock vs. active effort: "48 hours of active manual effort to onboard one supplier? That's a full work-week for one person. Something is wrong with this number."
- No Compliance department: "Where does my Compliance Officer sit organizationally? They can't just float under the corporate entity."
- No SLM/ERP system actor: "The entire point of this scenario is that the ERP purchasing block gates vendor activation. Where is the ERP system in this model?"

**Would accept in CORRECTED:**
- Intra-function delegation to Senior Risk Analyst under Compliance/GRC department.
- 36-hour wall-clock metric with 10-14 hours active effort comment.
- QA Manager as mandatory approver (ISO scope verification is non-negotiable).
- VP of Supply Chain as escalation authority for audit season.
- SLM/ERP system actor as the technical control point.

### Target Audience: ISO 9001 / IATF 16949 / AS9100D Lead Auditor

**Would challenge in ORIGINAL:**
- Generic `regulatoryContext` with EAR SS764 (export control) for a supplier onboarding scenario: "EAR SS764 is about export administration, not supplier qualification. Where is ISO 9001 Clause 8.4.1? Where is IATF 16949 Clause 8.4.1.2?"
- No mention of accreditation body hierarchy (IAF MLA) in the regulatory context: "The entire certification verification process depends on IAF MLA signatory recognition. This is the foundational check that determines whether an ISO certificate is internationally recognized."
- No distinction between certification body and accreditation body in the scenario: "These are different entities in the ISO ecosystem. The scenario conflates them."
- `auditGapCount: 4` without enumeration: "Which four gaps? Show me the specific audit trail deficiencies."

**Would accept in CORRECTED:**
- Inline regulatoryContext with ISO 9001:2015 Clause 8.4.1, IATF 16949 Clause 8.4.1.2, ISO/IEC 17021-1, and AS9100D Clause 8.4.1.
- Five enumerated audit gaps with specific references to CB directory lookup, IAF MLA verification, denied party screening linkage, delegation documentation, and ERP-to-approval linkage.
- Mandatory QA Manager approver reflecting Clause 8.4.1 requirements.

### Target Audience: Senior Procurement Manager

**Would challenge in ORIGINAL:**
- No mention of specific SLM platforms (SAP Ariba, Jaggaer, Coupa) or ERP systems (SAP S/4HANA): "This reads like someone who has never used an SLM platform. Where are the specific tools we use every day?"
- No mention of purchasing block mechanism: "The scenario talks about 'ERP cannot issue purchase orders' but doesn't describe the actual mechanism -- the vendor master purchasing block."
- No mention of commodity category or supplier risk tier: "Not all suppliers go through the same onboarding rigor. A preferred-tier machining supplier is different from a critical sole-source electronics supplier."
- "Supplier bypass" mentioned but not contextualized with the term "maverick sourcing": "We call it maverick sourcing and it's a KPI in our procurement scorecard."

**Would accept in CORRECTED:**
- Specific SLM platform references (SAP Ariba, Jaggaer, Coupa) and ERP reference (SAP S/4HANA).
- Explicit purchasing block mechanism described in the SLM/ERP system actor.
- Delegation constrained to standard-risk suppliers (implying risk-tier awareness).
- "Maverick sourcing" terminology included alongside "supplier bypass."

### Target Audience: Compliance / Risk Manager

**Would challenge in ORIGINAL:**
- Cross-functional delegation to QA Manager: "I would never delegate my denied party screening and accreditation body verification responsibilities to the Quality Manager. They don't have access to OFAC SDN or the BIS Entity List screening tools."
- No `delegationConstraints`: "You're telling me my delegate can approve any supplier, including a sole-source supplier in a sanctioned country? That's a compliance violation waiting to happen."
- No denied party screening in the regulatory context: "Denied party screening (OFAC SDN, BIS Entity List) is the single most critical compliance check in supplier onboarding. It's not even mentioned in the regulatory context."
- No financial risk assessment mention (D&B): "Financial risk assessment is a standard part of supplier onboarding. If the supplier goes bankrupt mid-contract, we have a supply chain disruption."

**Would accept in CORRECTED:**
- Intra-function delegation to Senior Risk Analyst with explicit delegation constraints (standard-risk only, not critical/sole-source, not sanctioned countries).
- Denied party screening explicitly referenced in Compliance Officer description and delegation constraints.
- ISO/IEC 17021-1 in the regulatory context (accreditation body recognition).
- Financial risk assessment (D&B rating) referenced in actor descriptions.

### Target Audience: SOC 2 / ISO 27001 Auditor

**Would challenge in ORIGINAL:**
- Generic EAR SS764 regulatory context for a non-export-control scenario: "This regulatory context doesn't match the scenario. EAR SS764 is about export administration. Where are the supplier qualification standards?"
- No documentation of delegation authority: "The delegation from Compliance Officer to QA Manager -- is this documented? Is there an audit trail? Who authorized this delegation?"
- No enumeration of audit gaps: "You claim 4 audit gaps but don't list them. As an auditor, I need to see the specific control deficiencies to assess risk."
- No `mandatoryApprovers`: "So Procurement Lead and Compliance Officer could approve without Quality ever verifying the ISO certificate? That's a material weakness in your supplier qualification controls."

**Would accept in CORRECTED:**
- Inline regulatory context with four entries specific to supplier qualification governance.
- Five enumerated audit gaps with specific control deficiency descriptions.
- Mandatory QA Manager approver preventing ISO scope verification bypass.
- Intra-function delegation with explicit constraints documented in the policy.
- Delegation edge in the graph providing an auditable delegation chain.

---

*Review complete. All 15 key issues investigated. 16 findings documented. 11 missing elements identified. Corrected TypeScript and narrative journey provided as copy-paste-ready replacements.*
