# SME Review #16: Incoming Material Inspection & Conditional Release

**Reviewer Profile:** Senior Manufacturing Quality Control, Incoming Inspection Management, and MES/ERP Integration Subject Matter Expert (CQE, CQI, Six Sigma MBB, ISO 9001/IATF 16949/AS9100D Lead Auditor, cGMP Certified)

**Scenario Under Review:** `src/scenarios/supply-chain/quality-inspection.ts` and Section 2 of `docs/scenario-journeys/supply-chain-scenarios.md`

**Review Date:** 2026-02-28

---

## 1. Executive Assessment

### Overall Credibility Score: C+

This scenario captures the general shape of the incoming material inspection bottleneck -- a real and universal problem in manufacturing -- but stumbles on critical details that any plant quality professional would immediately flag. The escalation model bypasses quality function independence by routing conditional release authority directly to the Plant Manager (production authority) instead of the Quality Manager (quality disposition authority). The regulatory context is imported wholesale from a shared database whose entries (EAR section 764 and ISO 9001:2015 Clause 8.4) are not specific to incoming inspection governance. The scenario lacks a Quality Manager role entirely, which is the single most important actor in the conditional release decision. The MES/ERP system description is thin to the point of being decorative. The policy lacks delegationConstraints, mandatoryApprovers, and constraints -- all of which are present in the corrected SaaS scenarios and are structurally important for demonstrating governance sophistication. The todayPolicies lack explanatory comments. The scenario is functional but would not survive scrutiny from a VP of Quality Operations, an ISO 9001 Lead Auditor, or an MES implementation specialist.

### Top 3 Most Critical Issues

1. **CRITICAL -- Escalation bypasses quality function independence.** The scenario escalates directly from QC Inspector to Plant Manager for conditional release authorization. In every manufacturing facility governed by ISO 9001:2015, the quality disposition decision (accept, reject, conditional release/concession) is made by the Quality Manager or Material Review Board (MRB), not by production management. The Plant Manager has production authority but not quality disposition authority. ISO 9001:2015 Clause 5.3 requires that the responsibilities and authorities for relevant roles are assigned and communicated, including ensuring the integrity of the quality management system -- which means the quality function must retain independence from production pressure. Having the Plant Manager directly authorize conditional release is the exact governance failure that ISO 9001 is designed to prevent. An auditor would flag this as a major nonconformity.

2. **CRITICAL -- Missing Quality Manager role.** Between the QC Inspector and the Plant Manager, every manufacturing facility has a Quality Manager (or QC Supervisor) who: (a) authorizes conditional release when inspection cannot be completed in time, (b) makes disposition decisions on borderline results, (c) convenes the Material Review Board for complex quality issues, and (d) documents the risk acceptance and traceability controls for conditionally released material. The absence of this role is not a minor omission -- it is the central governance actor in the scenario's core conflict (conditional release under production pressure). Without the Quality Manager, the scenario's escalation model is structurally broken.

3. **HIGH -- Regulatory context is generic and inapplicable.** The scenario imports `REGULATORY_DB["supply-chain"]`, which contains EAR section 764 (Export Administration Regulations -- export controls) and ISO 9001:2015 Clause 8.4 (External Providers -- supplier evaluation). Neither framework is directly applicable to incoming material inspection and conditional release. The directly applicable frameworks are: ISO 9001:2015 Clause 8.6 (Release of Products and Services), ISO 9001:2015 Clause 8.7 (Control of Nonconforming Outputs), and IATF 16949 Clause 8.6.4 (Verification of Externally Provided Products). EAR section 764 governs export enforcement -- it has nothing to do with whether a QC Inspector should release incoming raw materials from inspection hold. This would be immediately obvious to any quality professional.

### Top 3 Strengths

1. **The 4-8 hour inspection delay is realistic and well-calibrated.** At a high-throughput facility receiving 50-200+ shipments per day, a single QC Inspector with 20-40+ inspection lots in their MES queue during a peak shift will accumulate a 4-8 hour backlog when arrival rate exceeds inspection capacity. The scenario accurately identifies the peak-shift triggers: Monday morning after weekend delivery queuing, end-of-month supplier shipping surges, and shift change handoff gaps. The `manualTimeHours: 6` metric is squarely within this range.

2. **The production loss framing ($25K-$100K/hr) is reasonable for mid-to-high-value manufacturing.** While automotive assembly line stoppages cost $22K-$50K per minute (making $25K-$100K/hr dramatically understated for automotive), the stated range is reasonable for industrial/general manufacturing ($10K-$50K/hr), high-volume electronics ($5K-$25K/hr extended to $25K-$100K/hr for critical components), and aerospace subassembly ($10K-$50K/hr). The scenario does not claim to be automotive-specific, so the range is defensible as a general manufacturing scenario.

3. **The friction model (archetype spread with custom manualSteps) is structurally sound.** The use of `ARCHETYPES["threshold-escalation"].defaultFriction` with overridden `manualSteps` correctly captures the manufacturing-specific inspection workflow: PA system paging (after-request), CoA review at loading dock (before-approval), and peak-shift inspector backlog (on-unavailable). The trigger progression is logically correct.

---

## 2. Line-by-Line Findings

### Finding 1: Escalation Target Is Plant Manager -- Should Be Quality Manager

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, lines 62-68 (plant-manager actor), lines 91-93 (escalation rule), line 110 (workflow description)
- **Issue Type:** Incorrect Workflow
- **Severity:** Critical
- **Current Text:** `"Escalation authority for conditional release -- becomes involved only after significant delay threatens production"` and `toRoleIds: ["plant-manager"]`
- **Problem:** The Plant Manager has production authority but not quality disposition authority. ISO 9001:2015 Clause 5.3 requires quality function independence. The Quality Manager or Material Review Board (MRB) authorizes conditional release -- not the Plant Manager. The Plant Manager may escalate production urgency to the Quality Manager, but the quality disposition decision remains with the quality function. Having the Plant Manager directly authorize conditional release is the exact conflict-of-interest that ISO 9001 is designed to prevent. An ISO 9001 auditor would flag this as a major nonconformity: the person with the most incentive to bypass inspection (Plant Manager -- responsible for production targets) is the person authorizing the bypass of inspection (conditional release).
- **Corrected Text:** Add a Quality Manager role as the primary escalation target for conditional release. Plant Manager becomes a second-tier escalation only if Quality Manager is also unavailable, and even then, the Plant Manager's conditional release must be ratified by the Quality Manager within a defined timeframe.
- **Source/Rationale:** ISO 9001:2015 Clause 5.3 (Organizational Roles, Responsibilities and Authorities), Clause 8.6 (Release of Products and Services -- "unless otherwise approved by a relevant authority"), Clause 8.7 (Control of Nonconforming Outputs). IATF 16949:2016 Clause 5.3.2 specifically requires a quality representative with authority and responsibility independent of production management.

### Finding 2: Missing Quality Manager / QC Supervisor Role

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, actors array (lines 16-78)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** Actors include QC Inspector, Receiving Manager, Plant Manager, and MES/ERP System -- no Quality Manager.
- **Problem:** The scenario models the incoming inspection workflow with only three human actors. In every manufacturing facility, between the QC Inspector and Plant Manager sits the Quality Manager (or QC Supervisor), who is the most critical governance actor in the conditional release decision. The Quality Manager: (a) has quality disposition authority (accept, reject, concession/conditional release), (b) authorizes conditional release with documented risk acceptance and traceability controls, (c) convenes the Material Review Board for complex or recurring quality issues, (d) ensures customer notification if contractually required for conditional release, and (e) maintains the independence of the quality function from production pressure. Without this role, the scenario's governance model is structurally incomplete.
- **Corrected Text:** Add a Quality Manager role under the Quality Control department with quality disposition authority for conditional release decisions.
- **Source/Rationale:** ISO 9001:2015 Clause 5.3, IATF 16949:2016 Clause 5.3.2 (Customer Representative / Quality Representative). Standard manufacturing org chart: QC Inspector reports to Quality Manager/QC Supervisor, who reports to VP Quality or Plant Manager.

### Finding 3: Regulatory Context Imports Generic supply-chain Entries (EAR section 764 and ISO 9001:2015 8.4)

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, line 140; `src/lib/regulatory-data.ts`, lines 83-102
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `regulatoryContext: REGULATORY_DB["supply-chain"]` which resolves to EAR section 764 (Export Administration) and ISO 9001:2015 Clause 8.4 (External Providers).
- **Problem:** EAR section 764 governs export enforcement penalties -- it has zero applicability to incoming material inspection and conditional release at a manufacturing facility. ISO 9001:2015 Clause 8.4 governs the evaluation and selection of external providers (suppliers) -- it is upstream of the incoming inspection process (supplier qualification) and is not the clause that governs the inspection hold and release workflow. The directly applicable frameworks are: (1) ISO 9001:2015 Clause 8.6 -- Release of Products and Services (the exact control governing inspection hold and release), (2) ISO 9001:2015 Clause 8.7 -- Control of Nonconforming Outputs (governs disposition of material that fails inspection), (3) IATF 16949:2016 Clause 8.6.4 -- Verification and Acceptance of Externally Provided Products (automotive-specific incoming inspection requirements). For pharmaceutical or medical device manufacturing, FDA 21 CFR 211.84 (Testing and Approval of Components) and 21 CFR 820.80 (Receiving Acceptance) would also apply.
- **Corrected Text:** Replace with inline `regulatoryContext` array containing ISO 9001:2015 Clause 8.6, ISO 9001:2015 Clause 8.7, and IATF 16949 Clause 8.6.4, each with specific violation descriptions, fine ranges, and safeguard descriptions tailored to the incoming inspection and conditional release workflow.
- **Source/Rationale:** ISO 9001:2015 Clause 8.6 states: "The release of products and services to the customer shall not proceed until the planned arrangements have been satisfactorily completed, unless otherwise approved by a relevant authority." This is the exact standard that governs whether materials in inspection hold can be released to production. The corrected SaaS scenarios (vendor-access.ts, privileged-access.ts) both use inline regulatoryContext with specific, scenario-tailored frameworks.

### Finding 4: No delegationConstraints Documented

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, lines 80-95 (policy definition)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Policy has `delegationAllowed: false` with no `delegationConstraints` field.
- **Problem:** Even when delegation is not allowed, the corrected SaaS scenarios document why delegation is not allowed using the `delegationConstraints` field. For incoming inspection, the rationale should explain that inspection requires certified inspector qualifications (ISO 9001:2015 Clause 7.2 -- Competence) and that the QC Inspector's inspection authority cannot be delegated to non-qualified personnel. However, the corrected scenario should actually allow delegation to a backup QC Inspector (another qualified inspector who can take over the inspection backlog). Delegation of inspection authority (to a qualified backup inspector) is different from escalation for conditional release (to the Quality Manager for disposition authority). Both mechanisms should be present.
- **Corrected Text:** Set `delegationAllowed: true` with `delegateToRoleId: "backup-qc-inspector"` and add `delegationConstraints` explaining that delegation is limited to ASQ CQI-certified inspectors with current qualification for the specific material category and inspection type (visual, dimensional, chemical).
- **Source/Rationale:** ISO 9001:2015 Clause 7.2 (Competence) requires that inspection personnel be qualified based on education, training, or experience. ANSI/ASQ Z1.4 requires that inspectors be trained on the sampling plan and acceptance criteria for the specific inspection type.

### Finding 5: No mandatoryApprovers

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, lines 80-95 (policy definition)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No `mandatoryApprovers` field in the policy.
- **Problem:** In the corrected scenario with a Quality Manager role, the Quality Manager should be a mandatory approver for conditional release decisions. The QC Inspector performs the inspection, but the Quality Manager must authorize any conditional release (material released to production before inspection is complete or with accepted deviations). This mirrors the corrected SaaS scenario where the Security Analyst is mandatory for vendor access.
- **Corrected Text:** Add `mandatoryApprovers: ["quality-manager"]` to the conditional release policy.
- **Source/Rationale:** ISO 9001:2015 Clause 8.6 requires release by a "relevant authority." IATF 16949 Clause 5.3.2 requires a quality representative with authority independent of production.

### Finding 6: No constraints Field

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, lines 80-95 (policy definition)
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:** No `constraints` field in the policy.
- **Problem:** The corrected SaaS scenarios include `constraints: { environment: "production" }`. For the incoming inspection scenario, the `environment: "production"` constraint is directly applicable -- the conditional release decision specifically governs whether materials enter the production environment. The constraint makes explicit that this policy governs production material flow, not non-production or laboratory material.
- **Corrected Text:** Add `constraints: { environment: "production" }` to indicate the policy governs material release into the production environment.
- **Source/Rationale:** Consistency with corrected SaaS scenarios (vendor-access.ts, privileged-access.ts). The constraint is semantically correct: the inspection hold prevents material from entering production.

### Finding 7: riskExposureDays: 2 -- Potentially Overstated

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, line 114
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `riskExposureDays: 2`
- **Problem:** A single 4-8 hour inspection delay (captured by `manualTimeHours: 6`) resolves within a single shift or at most within 24 hours. A `riskExposureDays` of 2 implies that the risk exposure from an inspection delay persists for 2 calendar days. This is defensible only if: (a) the scenario implies recurring delays across multiple shipments over multiple days, (b) the conditionally released material remains in production for up to 2 days before the follow-up inspection is completed and the usage decision is finalized, or (c) the risk window includes the time to trace and potentially recall conditionally released material if the follow-up inspection fails. Interpretation (b) is the strongest justification -- conditionally released material may be in production for 1-2 days while the QC Inspector completes the deferred inspection, during which time non-conforming material could be incorporated into finished goods. I will retain `riskExposureDays: 2` with a comment explaining interpretation (b), but note that `riskExposureDays: 1` would be more conservative and equally defensible.
- **Corrected Text:** Retain `riskExposureDays: 2` with an explanatory comment documenting that the 2-day window covers the period from conditional release until follow-up inspection completion and usage decision finalization.
- **Source/Rationale:** Industry practice: conditionally released material typically requires follow-up inspection within 24-48 hours. The risk window is the period during which non-conforming material is in production without a final disposition decision.

### Finding 8: auditGapCount: 3 -- Gaps Not Enumerated

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, line 115
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `auditGapCount: 3` with no comments enumerating the gaps.
- **Problem:** The corrected SaaS scenarios (privileged-access.ts lines 153-157) enumerate each audit gap with numbered comments. For the incoming inspection scenario, the 3 gaps are not identified. Based on the scenario description, the audit gaps are likely: (1) no documented conditional release authorization trail -- Plant Manager verbal approval not recorded in MES/ERP, (2) paper-based CoA/CoC comparison with no digital verification record linking CoA to inspection lot, (3) no traceability linkage between conditionally released material and the follow-up inspection disposition. These should be enumerated in comments.
- **Corrected Text:** In the corrected scenario, I increase `auditGapCount` to 4 and enumerate: (1) paper CoA comparison with no digital record, (2) PA system paging with no documented notification trail, (3) conditional release verbal authorization not recorded in MES/QMS, (4) no traceability link between conditionally released material and deferred inspection outcome.
- **Source/Rationale:** ISO 9001:2015 Clause 7.5 (Documented Information) requires records of inspection results and disposition decisions. IATF 16949 Clause 8.6.4 requires documented evidence of verification of externally provided products.

### Finding 9: MES/ERP System Description Is Thin

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, lines 71-78 (erp-system actor)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `"Manufacturing Execution System with ERP batch traceability -- materials registered and held pending inspector release"`
- **Problem:** The MES/ERP system is the technical backbone of the incoming inspection workflow, but the description provides almost no detail about its functional role. A proper description should cover: goods receipt posting (SAP MIGO or equivalent), inspection lot creation (SAP QM automatic lot creation on goods receipt to inspection stock), inspection stock management (material blocked in "quality inspection" inventory type), CoA/CoC digital verification (no longer paper-based in modern MES), statistical sampling plan enforcement (AQL calculation per ANSI/ASQ Z1.4), usage decision recording (QA11 in SAP QM), and production stock release (unrestricted stock posting on acceptance). Compare to the PAM System description in privileged-access.ts (lines 87-93), which names specific platforms (CyberArk, Teleport, HashiCorp Vault) and describes functional capabilities in detail.
- **Corrected Text:** Expand the MES/ERP description to cover goods receipt posting, inspection lot creation, inspection stock management, CoA digital verification, sampling plan enforcement, usage decision recording, and production stock release, with named platform examples (SAP QM/PP, Siemens Opcenter, Rockwell FactoryTalk ProductionCentre).
- **Source/Rationale:** SAP QM incoming inspection workflow: MIGO (goods receipt) -> QA32 (inspection lot worklist) -> QA11 (results recording and usage decision) -> stock release. Siemens Opcenter Execution: material receipt event -> inspection task creation -> data collection -> disposition -> stock status update.

### Finding 10: No todayPolicies Compression Comments

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, lines 127-139
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:** `todayPolicies` array with `expirySeconds: 20` and no comments.
- **Problem:** The corrected SaaS scenarios include comments on `todayPolicies` explaining how the simulation-compressed value maps to real-world conditions. For example, privileged-access.ts lines 199-203 include a comment: "Simulation-compressed: represents real-world scenario where approval stalls for hours while Platform Engineering Lead is unavailable and informal delegation has no system-enforced authority." The quality inspection scenario's `expirySeconds: 20` represents a real-world condition where the QC Inspector is at capacity and the inspection request effectively expires (goes unanswered) within the shift, but this mapping is not documented.
- **Corrected Text:** Add comments to `todayPolicies` explaining the simulation compression.
- **Source/Rationale:** Consistency with corrected SaaS scenario patterns.

### Finding 11: Certificate of Analysis (CoA) vs. Certificate of Conformance (CoC) Not Clarified

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, line 122 (manualSteps); `docs/scenario-journeys/supply-chain-scenarios.md`, line 91
- **Issue Type:** Jargon Error
- **Severity:** Low
- **Current Text:** `"Inspector reviewing Certificate of Analysis against batch records and statistical QC thresholds at loading dock"`
- **Problem:** The scenario mentions "Certificate of Analysis" (CoA) but does not clarify the distinction between CoA and Certificate of Conformance (CoC). A CoA includes actual test results (e.g., chemical composition, mechanical properties, dimensional measurements) and is compared against purchase specification requirements. A CoC is a supplier declaration that the material conforms to specified requirements without providing the actual test data. Incoming inspection of raw materials typically involves CoA review (comparing actual test values against specification limits), not just CoC review. The scenario correctly uses "CoA" but should make the distinction explicit for credibility with quality professionals.
- **Corrected Text:** The corrected scenario uses "Certificate of Analysis (CoA)" with a description that specifies comparison of actual test results against purchase specification limits.
- **Source/Rationale:** ASTM A6/A6M (steel products), ASTM E1338 (standard for CoA), ISO/IEC 17025 (testing laboratory accreditation). In practice, the CoA is generated by the supplier's testing laboratory and lists actual measured values for each test parameter, which the QC Inspector compares against the purchase order specification limits.

### Finding 12: Conditional Release Workflow Not Detailed

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, line 110 (workflow description); `docs/scenario-journeys/supply-chain-scenarios.md`, lines 109-111
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** `"Escalation to Plant Manager for conditional release under predefined risk thresholds"` and "The Plant Manager reviews the Certificate of Analysis data (integrated into the request) and authorizes the materials to enter production with conditional acceptance."
- **Problem:** Conditional release (concession) is the core governance challenge of this scenario, but the workflow does not describe what conditional release actually entails. ISO 9001:2015 Clause 8.6 allows release before all planned arrangements are complete "unless otherwise approved by a relevant authority" -- but this requires: (a) authorization from a relevant authority with quality disposition authority (Quality Manager, not Plant Manager), (b) customer approval if contractually required (many automotive and aerospace contracts require customer notification before conditional release), (c) traceability controls -- the conditionally released material must be identifiable and traceable so it can be segregated, reworked, or recalled if the deferred inspection finds non-conformance, (d) documented risk acceptance -- a formal record of the risk accepted by releasing material before inspection is complete, (e) time-bound follow-up -- a defined deadline for completing the deferred inspection and making the final usage decision. None of these elements are described in the current scenario.
- **Corrected Text:** The corrected scenario includes a detailed conditional release workflow with: Quality Manager authorization, traceability tagging of conditionally released lots, documented risk acceptance, time-bound follow-up inspection requirement (24-48 hours), and customer notification trigger for contractually required notification.
- **Source/Rationale:** ISO 9001:2015 Clause 8.6 Note, Clause 8.7.1 (dealing with nonconforming outputs), IATF 16949 Clause 8.7.1.1 (customer authorization for concession). AS9100D Clause 8.7.1 requires nonconforming product to be clearly identified to prevent unintended use.

### Finding 13: Narrative Journey (Section 2) Has Only 6 Rows in Takeaway Table

- **Location:** `docs/scenario-journeys/supply-chain-scenarios.md`, lines 121-128
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Takeaway table has 6 rows: Alert method, CoA verification, When inspector is busy, Production line impact, Time to release, Inspection record.
- **Problem:** The corrected SaaS scenario narratives have 7-8 rows in their takeaway tables. The quality inspection takeaway table is missing rows for: conditional release governance, traceability/lot tracking, quality function authority, and regulatory compliance posture. These are the dimensions that differentiate the "with Accumulate" scenario from the "today" scenario for a quality professional audience.
- **Corrected Text:** Expand the takeaway table to 9 rows covering: Alert/notification method, CoA verification, When inspector is at capacity, Conditional release governance, Material traceability, Production line impact, Time to release, Quality disposition authority, and Audit/compliance record.
- **Source/Rationale:** Consistency with corrected SaaS scenario takeaway tables.

### Finding 14: "Receiving Manager" Title May Be Misleading

- **Location:** `src/scenarios/supply-chain/quality-inspection.ts`, lines 53-59; `docs/scenario-journeys/supply-chain-scenarios.md`, line 77
- **Issue Type:** Jargon Error
- **Severity:** Low
- **Current Text:** `"Receiving Manager"` with description `"Initiates inspection request when materials arrive -- production continuity at risk during inspection hold"`
- **Problem:** In most manufacturing facilities, the person who initiates the inspection workflow at the receiving dock is the Receiving Clerk or Receiving Coordinator -- the person who physically scans the material barcode and creates the goods receipt in ERP. The "Receiving Manager" is a supervisory role who typically does not perform the scanning and goods receipt transaction. The scenario description (line 10) correctly says "receiving clerk" in the friction steps (line 121 says "receiving clerk paging QC Inspector"), but the actor is labeled "Receiving Manager." This inconsistency is minor but would be noticed by someone familiar with dock operations. I retain "Receiving Manager" in the corrected scenario since it represents a named Role actor (not a generic clerk), but the description should clarify that this role oversees the receiving process and initiates inspection requests, not that they personally scan material.
- **Corrected Text:** Retain "Receiving Manager" but update description to: "Oversees receiving dock operations -- initiates inspection requests in MES/ERP when materials arrive and monitors inspection hold status against production schedule requirements."
- **Source/Rationale:** Standard manufacturing receiving dock org chart: Receiving Clerks (scan and goods-receipt) report to Receiving Manager/Supervisor, who reports to Materials Manager or Plant Manager.

### Finding 15: Narrative Journey "With Accumulate" Section Has Plant Manager Authorizing CoA Review

- **Location:** `docs/scenario-journeys/supply-chain-scenarios.md`, lines 109-111
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text:** "The Plant Manager reviews the Certificate of Analysis data (integrated into the request) and authorizes the materials to enter production with conditional acceptance."
- **Problem:** This compounds the escalation target error (Finding 1). The Plant Manager is not qualified to review CoA data against purchase specifications -- that requires quality/engineering expertise (understanding of material specifications, acceptable test value ranges, and the risk assessment for borderline results). In the corrected scenario, the Quality Manager reviews CoA data and makes the conditional release decision, because the Quality Manager has the domain expertise and the quality disposition authority. The Plant Manager's role in the escalation chain is to authorize expedited resource allocation (e.g., pulling a backup inspector from another area, authorizing overtime for the QC team) -- not to make the quality disposition decision.
- **Corrected Text:** Replace with Quality Manager reviewing CoA data and authorizing conditional release with traceability controls.
- **Source/Rationale:** ISO 9001:2015 Clause 7.2 (Competence) -- the person making the quality disposition decision must be competent to evaluate the inspection data. A Plant Manager's competence is in production management, not material quality assessment.

---

## 3. Missing Elements

1. **Quality Manager / QC Supervisor role** -- The most critical missing element. This role holds quality disposition authority for conditional release decisions. Without it, the scenario's governance model is fundamentally broken.

2. **Backup QC Inspector role** -- Delegation of inspection authority to a qualified backup inspector is the standard first response to inspector capacity constraints. The scenario only models escalation (conditional release), not delegation (backup inspection).

3. **Inline regulatoryContext with inspection-specific frameworks** -- ISO 9001:2015 Clause 8.6 (Release of Products and Services), Clause 8.7 (Control of Nonconforming Outputs), and IATF 16949 Clause 8.6.4 (Verification of Externally Provided Products) should replace the generic supply-chain entries.

4. **delegationConstraints field** -- Even if delegation is structurally allowed, the constraints document the boundary conditions (inspector qualification requirements, material category limitations).

5. **mandatoryApprovers field** -- The Quality Manager should be a mandatory approver for conditional release.

6. **constraints field** -- `{ environment: "production" }` is directly applicable.

7. **Enumerated audit gap comments** -- Each of the counted audit gaps should be identified and explained in comments.

8. **todayPolicies compression comments** -- Explain how the simulation-compressed values map to real-world conditions.

9. **Conditional release traceability controls** -- The workflow should describe how conditionally released material is tagged, tracked, and subject to time-bound follow-up inspection.

10. **costPerHourDefault field** -- The scenario repeatedly references $25K-$100K/hr production losses but does not use the `costPerHourDefault` field available in the `ScenarioTemplate` interface. Setting this to a mid-range value (e.g., 50000) would integrate the production loss metric into the scenario data model.

11. **Delegation edge** -- If delegation to a Backup QC Inspector is added, a corresponding delegation edge should connect the QC Inspector to the Backup QC Inspector.

---

## 4. Corrected Scenario

### Corrected TypeScript (`quality-inspection.ts`)

```typescript
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
    { sourceId: "quality-control", targetId: "backup-qc-inspector", type: "authority" },
    { sourceId: "receiving", targetId: "receiving-manager", type: "authority" },
    { sourceId: "factory", targetId: "plant-manager", type: "authority" },
    { sourceId: "factory", targetId: "mes-erp-system", type: "authority" },
    // Delegation edge: QC Inspector can delegate inspection execution to
    // the Backup QC Inspector when at capacity (not conditional release authority)
    { sourceId: "qc-inspector", targetId: "backup-qc-inspector", type: "delegation" },
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
```

### Corrected Narrative Journey (Section 2 of `supply-chain-scenarios.md`)

```markdown
## 2. Incoming Material Inspection & Conditional Release

**Setting:** A shipment of critical raw materials has arrived at the Manufacturing Plant's receiving dock. Before the materials can enter production, they must be goods-receipted into the MES/ERP system (inspection stock posting), and a QC Inspector must perform an incoming inspection per the ANSI/ASQ Z1.4 sampling plan -- visual check, dimensional measurement, Certificate of Analysis (CoA) verification against purchase specification limits, and sample testing. The QC Inspector is handling a peak-shift backlog of 20-40+ inspection lots. Production losses mount at $25K-$100K per hour while materials sit in inspection hold.

**Players:**
- **Manufacturing Plant** (organization)
  - Quality Control Department
    - Quality Manager -- quality disposition authority for conditional release decisions (ISO 9001:2015 Clause 8.6); convenes MRB for recurring issues
    - QC Inspector -- performs inspection and makes usage decision (accept/reject); occupied with peak-shift backlog
    - Backup QC Inspector -- qualified alternate for inspection delegation (ASQ CQI-certified)
  - Receiving Department
    - Receiving Manager -- initiates inspection request when materials arrive
  - Plant Manager -- second-tier escalation (production authority, not quality disposition authority)
  - MES / ERP System (e.g., SAP QM/PP, Siemens Opcenter) -- goods receipt, inspection lot creation, CoA verification, sampling plan enforcement, usage decision recording, stock release

**Action:** Receiving Manager creates goods receipt in ERP (inspection stock posting) and initiates inspection request. Requires 1-of-1 inspection by QC Inspector, with delegation to Backup QC Inspector if at capacity and auto-escalation to Quality Manager for conditional release if inspection cannot be completed within the production-critical window. Quality Manager is mandatory approver for any conditional release.

---

### Today's Process

**Policy:** 1-of-1 from QC Inspector. No delegation to backup inspector. No automated escalation. Short expiry (20 sec simulation-compressed). Quality Manager not in the workflow.

1. **PA page.** The receiving clerk pages the QC Inspector over the factory PA system. No digital notification trail -- inspector may not hear the page or may be at a remote inspection bay. *(~6 sec delay)*

2. **Paper CoA review.** When the inspector arrives, they must manually compare the paper Certificate of Analysis (CoA) actual test values -- chemical composition, mechanical properties, dimensional tolerances -- against the purchase specification limits at the loading dock. No digital verification record in MES. *(~5 sec delay)*

3. **Inspector at capacity.** The QC Inspector has 20-40+ inspection lots in their MES work queue from the peak-shift backlog (Monday morning after weekend deliveries, end-of-month supplier shipping surge). No qualified backup inspector is available or routed by the system. Materials sit in the inspection hold area with physical hold tags. *(~8 sec delay)*

4. **Production line impact.** The production line needs these materials. Every hour the shipment sits in inspection hold is $25K-$100K in production losses. The Plant Manager pressures for release, but there is no formal conditional release mechanism -- the Plant Manager verbally authorizes "just use it," bypassing the quality function's disposition authority. No documented risk acceptance. No lot traceability tagging. No follow-up inspection scheduled.

5. **Outcome:** ~6 hours of delay. Materials conditionally released without quality function authorization. 2 days of risk exposure while deferred inspection is pending. 4 audit gaps: (1) paper CoA comparison with no digital record, (2) PA paging with no notification trail, (3) verbal conditional release not documented in QMS, (4) no traceability link between conditionally released lots and production batches. An ISO 9001 auditor would flag the Plant Manager's direct conditional release as a major nonconformity -- quality function independence compromised.

**Metrics:** ~6 hours of delay, 2 days of risk exposure, 4 audit gaps, 4 manual steps.

---

### With Accumulate

**Policy:** 1-of-1 from QC Inspector. Delegation to Backup QC Inspector. Auto-escalation to Quality Manager after 20 seconds (simulation-compressed; ~1 hour real-world). Quality Manager is mandatory approver for conditional release. 1-hour authority window. Production environment constraint.

1. **Request submitted.** Receiving Manager creates goods receipt in ERP (inspection stock posting). MES automatically creates inspection lot and routes to QC Inspector's work queue with production-priority classification. Digital CoA data is integrated into the inspection request -- no paper comparison needed.

2. **Inspector at capacity -- delegation.** The system detects the QC Inspector has not responded within the threshold. It automatically delegates the inspection lot to the Backup QC Inspector, who is pre-qualified for this material category and inspection type.

3. **If delegation unavailable -- auto-escalation to Quality Manager.** If neither inspector can complete the inspection within the production-critical window, the system auto-escalates to the Quality Manager for conditional release evaluation. The Quality Manager reviews the integrated CoA data, supplier quality history, and material risk classification.

4. **Conditional release with traceability controls.** The Quality Manager authorizes conditional release with: (a) documented risk acceptance in the QMS, (b) lot traceability tagging linking conditionally released material to downstream production batches, (c) mandatory follow-up inspection within 24-48 hours, and (d) customer notification trigger if contractually required (automotive/aerospace OEM contracts). Cryptographic proof captures the authorization chain, CoA verification, and conditional release terms.

5. **Follow-up inspection.** QC Inspector (or Backup) completes the deferred inspection. Results are linked to the conditional release record. If non-conformance is found, the traceability system identifies all production batches using the affected material for containment or recall.

6. **Outcome:** Production line unaffected -- materials released through governance, not through pressure. Quality function retains disposition authority. Full inspection audit trail in MES/ERP with cryptographic proof. Conditional release is governed, documented, and traceable -- not a verbal workaround.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Alert/notification | Factory PA system (no trail) | Digital MES routing with priority classification |
| CoA verification | Paper comparison at loading dock | Integrated digital CoA data with specification comparison |
| When inspector is at capacity | Materials sit in hold, no backup routing | Auto-delegation to qualified Backup QC Inspector |
| Conditional release governance | Plant Manager verbal authorization (bypasses quality) | Quality Manager authorization with documented risk acceptance |
| Material traceability | No link between released lots and production batches | Lot traceability tagging for containment/recall capability |
| Production line impact | Risk of stoppage ($25K-$100K/hr) | Eliminated through delegation and governed conditional release |
| Time to release | ~6 hours | Minutes (delegation) to 1 hour (conditional release) |
| Quality disposition authority | Bypassed -- Plant Manager decides | Preserved -- Quality Manager decides per ISO 9001 Clause 8.6 |
| Audit/compliance record | Paper form (may be lost), verbal authorization | Cryptographic proof with CoA hash, authorization chain, and traceability |
```

---

## 5. Credibility Risk Assessment

### Audience 1: VP of Quality Operations at a Global Manufacturer

**Would challenge in ORIGINAL:**
- "Why is the Plant Manager authorizing conditional release? That is my job -- or my Quality Manager's job. The Plant Manager has every incentive to release material without inspection because their KPIs are production throughput and on-time delivery. My KPIs are quality yield, customer quality escapes, and audit readiness. If I saw this scenario, I would immediately question whether the author has ever worked in a quality-managed manufacturing facility."
- "Where is the Quality Manager? In my organization, there is always a Quality Manager or QC Supervisor between the inspector and the Plant Manager. The inspector does not escalate directly to the Plant Manager -- ever."
- "The MES/ERP description is too thin. I run SAP QM across 15 plants. The system does inspection lot creation, sampling plan enforcement, usage decision recording, and stock release. Saying 'materials registered and held pending inspector release' does not capture the actual workflow."

**Would accept in CORRECTED:**
- Quality Manager as the conditional release authority with documented risk acceptance and traceability controls.
- Backup QC Inspector delegation for capacity management.
- ANSI/ASQ Z1.4 sampling plan references and CoA verification detail.
- 4 enumerated audit gaps that match the real-world gaps in paper-based incoming inspection.

### Audience 2: ISO 9001 / IATF 16949 / AS9100D Lead Auditor

**Would challenge in ORIGINAL:**
- "Clause 8.6 says 'unless otherwise approved by a relevant authority.' The Plant Manager is not a relevant quality authority for material disposition. I would write a major nonconformity for this escalation model."
- "Where is the documented risk acceptance for conditional release? Clause 8.6 requires documented authorization. A verbal instruction from the Plant Manager is not documented authorization."
- "EAR section 764 is an export control regulation. It has nothing to do with incoming material inspection. Why is it in the regulatory context for this scenario?"
- "No reference to Clause 8.7 (nonconforming outputs). When you conditionally release material and the follow-up inspection finds non-conformance, that material is a nonconforming output that must be controlled per Clause 8.7."

**Would accept in CORRECTED:**
- ISO 9001:2015 Clause 8.6, Clause 8.7, and IATF 16949 Clause 8.6.4 as the regulatory framework -- these are the exact clauses that govern this workflow.
- Quality Manager as the "relevant authority" for conditional release per Clause 8.6.
- Traceability controls for conditionally released material per Clause 8.7.
- Independence of quality function per Clause 5.3.

### Audience 3: Plant Quality Manager

**Would challenge in ORIGINAL:**
- "I have lived this exact scenario every Monday morning for 15 years. The 4-8 hour backlog is real. The $25K-$100K/hr production losses are real. But the solution is not to escalate to the Plant Manager -- the solution is to have me (Quality Manager) authorize a conditional release with traceability controls and a follow-up inspection deadline. That is literally my job."
- "Where is the backup inspector? When my inspector is buried, I pull a qualified backup from another area. That is delegation of inspection authority, not escalation for conditional release. These are two different mechanisms."
- "The scenario says 'conditional release under predefined risk thresholds' but does not describe what those thresholds are or what controls are applied. In my facility, conditional release requires: lot tagging, production batch linkage, 24-hour follow-up inspection deadline, and customer notification for safety-critical components."

**Would accept in CORRECTED:**
- Delegation to Backup QC Inspector as the first response to capacity constraints.
- Quality Manager as conditional release authority with specific controls enumerated.
- Distinction between delegation (inspection authority to backup inspector) and escalation (conditional release authority to Quality Manager).
- Plant Manager as second-tier escalation with ratification requirement.

### Audience 4: MES/ERP Implementation Specialist

**Would challenge in ORIGINAL:**
- "The MES/ERP description says 'materials registered and held pending inspector release.' That is one sentence describing a system that does: goods receipt with inspection stock posting, automatic inspection lot creation, inspector work queue routing, CoA/CoC digital verification, statistical sampling plan enforcement, results recording, usage decision, and stock release. This is the core workflow of SAP QM (transactions MIGO, QA32, QA11) or Siemens Opcenter Execution. Reducing it to one sentence is not credible."
- "No mention of inspection stock vs. unrestricted stock. In SAP, material in inspection hold is in 'quality inspection stock' -- it is physically available but inventory-blocked from production consumption. When the inspector makes the usage decision (UD), the system posts to unrestricted stock. This is the technical mechanism that the scenario is describing but not naming."

**Would accept in CORRECTED:**
- Named platforms (SAP QM/PP/MM, Siemens Opcenter, Rockwell FactoryTalk ProductionCentre).
- Specific functional capabilities enumerated in the system description.
- Inspection stock vs. unrestricted stock concepts referenced.
- Digital CoA verification replacing paper comparison.

### Audience 5: Six Sigma Master Black Belt

**Would challenge in ORIGINAL:**
- "The scenario mentions 'statistical QC thresholds' in the friction step description but does not reference the actual standard -- ANSI/ASQ Z1.4 (ISO 2859-1) for sampling by attributes, or the AQL (Acceptable Quality Level) framework. Any quality professional would expect these references."
- "The metrics (manualTimeHours: 6, riskExposureDays: 2) are stated without derivation. In a Six Sigma DMAIC analysis, I would expect the metric values to be traceable to a process capability study or at least to documented industry benchmarks."

**Would accept in CORRECTED:**
- ANSI/ASQ Z1.4 / ISO 2859-1 sampling plan references.
- Detailed comments deriving each metric value from industry benchmarks.
- AQL framework referenced in the inspection process description.
- Enumerated audit gaps with specific descriptions traceable to process gaps.

---

*Review complete. The corrected scenario addresses all 15 key issues identified in the agent brief, adds the missing Quality Manager and Backup QC Inspector roles, replaces the generic regulatory context with inspection-specific frameworks (ISO 9001:2015 Clauses 8.6 and 8.7, IATF 16949 Clause 8.6.4), restructures the escalation model to preserve quality function independence, adds delegation for inspector capacity management, and includes detailed comments on all metric values, policy parameters, and design decisions. The corrected TypeScript compiles cleanly with correct imports, NodeType enum values, and inline regulatoryContext.*
