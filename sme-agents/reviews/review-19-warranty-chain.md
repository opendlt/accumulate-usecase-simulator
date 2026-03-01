# SME Review: Warranty Claim Authorization & Fraud Reduction

**Reviewer:** Senior Automotive Warranty Operations, Claims Management, Fraud Analytics & Dealer Network Governance SME
**Date:** 2026-02-28
**Scenario File:** `src/scenarios/supply-chain/warranty-chain.ts`
**Narrative File:** `docs/scenario-journeys/supply-chain-scenarios.md` (Section 5, lines 296-357)
**Regulatory Source:** `src/lib/regulatory-data.ts` (lines 83-102, `supply-chain` entries)

---

## 1. Executive Assessment

**Overall Credibility Score: D+**

This is the weakest scenario in the supply chain set by a significant margin. While Scenarios 1-4 have been corrected to a professional standard with inline regulatory context, detailed actor descriptions, mandatory approvers, delegation constraints, escalation rules, constraints, enumerated audit gaps, and richly detailed narrative journeys, Scenario 5 reads like a first draft that was never revisited. A VP of Warranty Operations at a major OEM would immediately identify this as written by someone who has never worked inside a warranty claims operation. The scenario name promises "Fraud Reduction" but delivers zero fraud detection capability. The narrative journey is approximately 20% the length of the corrected Scenarios 1-4 and contains no domain-specific technical detail.

### Top 3 Most Critical Issues

1. **[Critical] Generic regulatory context from REGULATORY_DB is entirely inapplicable.** The scenario imports `REGULATORY_DB["supply-chain"]` which contains EAR section 764 (export control enforcement) and ISO 9001:2015 Clause 8.4 (external provider evaluation). Neither has any relevance to warranty claim authorization. The directly applicable frameworks -- Magnuson-Moss Warranty Act, FTC Warranty Rules, NHTSA TREAD Act, IFRS 15/ASC 606 warranty reserves -- are completely absent. An automotive warranty compliance professional would immediately flag this as evidence of no domain understanding.

2. **[Critical] "Fraud Reduction" is in the scenario name but there is zero fraud detection capability modeled.** No Warranty Management System (WMS) actor, no fraud analytics engine, no SIU (Special Investigations Unit), no risk scoring, no fraud pattern detection rules. The scenario description mentions "repeat claims on the same VIN, labor time inflation, anomalous parts replacement rates" but none of these are represented in the actor model, policies, or workflow. Every other corrected supply chain scenario includes a System actor as the technical enforcement point.

3. **[Critical] The claims authorization hierarchy is a dramatic oversimplification.** At major automotive OEMs, 60-80% of standard claims are auto-adjudicated by the WMS rules engine with zero human review. The remaining claims go through a tiered authority structure: Claims Adjuster ($0-$2K), Senior Claims Analyst ($2K-$10K), Regional Warranty Manager ($10K-$50K), Warranty Director ($50K+). Modeling a 1-of-1 from Warranty Director for all claims fundamentally misrepresents how warranty claims are processed at scale. The Warranty Director does not review individual claims unless they exceed $50K or involve systemic issues.

### Top 3 Strengths

1. **Correct archetype selection.** The `"delegated-authority"` archetype is appropriate for the warranty claim delegation scenario -- the core problem is indeed a primary authority (Warranty Director) being unavailable and needing formal delegation to a Regional Manager.

2. **The actor hierarchy is directionally correct.** The organizational structure (Auto Manufacturer > Warranty Operations + Claims Center, with Warranty Director, Regional Manager, and Claims Adjuster roles, plus an external Dealer) is a reasonable simplification of the real-world OEM warranty organizational structure.

3. **The delegation model captures the right friction.** The todayPolicies correctly model the "no delegation" bottleneck, and the improved policy correctly enables delegation from Warranty Director to Regional Manager. This is the right governance improvement to demonstrate.

---

## 2. Line-by-Line Findings

### Finding 1: REGULATORY_DB import and reference -- entirely wrong regulatory context

- **Location:** `warranty-chain.ts`, line 4 (import) and line 138 (usage)
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:**
  ```typescript
  import { REGULATORY_DB } from "@/lib/regulatory-data";
  ```
  and
  ```typescript
  regulatoryContext: REGULATORY_DB["supply-chain"],
  ```
- **Problem:** `REGULATORY_DB["supply-chain"]` contains two entries: (1) EAR section 764 -- Export Administration enforcement penalties for controlled goods shipment without authorization, and (2) ISO 9001:2015 Clause 8.4 -- External Providers evaluation. Neither relates to warranty claims. EAR governs export controls, not warranty claims. ISO 9001 Clause 8.4 governs supplier evaluation, not warranty claim authorization. The directly applicable regulatory frameworks are: Magnuson-Moss Warranty Act (15 USC 2301-2312) governing consumer warranty terms and OEM obligations, FTC Warranty Rules (16 CFR 700-703) governing warranty disclosure and dispute resolution, NHTSA TREAD Act (49 USC 30118-30120) requiring warranty claims data reporting for safety defect early warning, and IFRS 15 / ASC 606 governing warranty reserve accounting. All four corrected scenarios (supplier-cert, quality-inspection, joint-design, export-control) use inline `regulatoryContext` arrays with scenario-specific frameworks. This scenario should follow the same pattern.
- **Corrected Text:** Remove the `REGULATORY_DB` import entirely and replace line 138 with an inline `regulatoryContext` array. See Corrected Scenario section for the full replacement.
- **Source/Rationale:** Magnuson-Moss Warranty Act (15 USC 2301-2312); FTC 16 CFR Parts 700-703; NHTSA TREAD Act (49 USC 30118-30120, 49 CFR Part 579); IFRS 15 / ASC 606 warranty accrual guidance. All corrected sibling scenarios use inline regulatoryContext.

### Finding 2: Missing Warranty Management System (WMS) as System actor

- **Location:** `warranty-chain.ts`, lines 16-80 (actors array)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** No System actor present in the actors array.
- **Problem:** Every corrected supply chain scenario includes a System actor as the technical enforcement point: supplier-cert has "SLM / ERP System" (`NodeType.System`), quality-inspection has "MES / ERP System" (`NodeType.System`), joint-design has "PLM / Configuration Management System" (`NodeType.System`), export-control has "Export Compliance System" (`NodeType.System`). The Warranty Management System (WMS) -- DealerConnect (GM), GlobalConnect (Stellantis), OASIS 2 (Ford), TIS (Toyota), B2B Connect (Hyundai-Kia) -- is the system that processes dealer claims, enforces auto-adjudication rules, manages Prior Authorization (PA) workflows, routes claims requiring human review, integrates with fraud analytics engines, and processes dealer payments. Without the WMS, the scenario has no technical enforcement mechanism.
- **Corrected Text:** Add a WMS System actor. See Corrected Scenario.
- **Source/Rationale:** All corrected sibling scenarios include a System actor. Every major automotive OEM operates a WMS for claims processing. The WMS is the system of record for warranty claim lifecycle management.

### Finding 3: Missing Fraud Analytics / SIU representation

- **Location:** `warranty-chain.ts`, lines 16-80 (actors array)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** No fraud analytics or Special Investigations Unit actor.
- **Problem:** The scenario name is "Warranty Claim Authorization & Fraud Reduction." The description mentions "fraud analytics integration," "claim leakage and abuse patterns -- repeat claims on the same VIN, labor time inflation, anomalous parts replacement rates." Yet there is zero representation of fraud detection capability in the actor model. Major OEMs lose $2B-$5B+ annually to warranty fraud and claim leakage. Fraud analytics platforms (Tavant warranty.ai, SAS Warranty Analytics, IBM Warranty Analytics, DXC warranty analytics) are deployed at every major OEM. The SIU (Special Investigations Unit) investigates flagged dealers and recovers fraudulent claims. Promising "Fraud Reduction" in the name and delivering nothing is a credibility-destroying gap.
- **Corrected Text:** Add a Fraud Analytics Engine as a System-type actor or integrate fraud screening into the WMS actor description. See Corrected Scenario.
- **Source/Rationale:** Major OEM warranty fraud programs; Tavant warranty.ai; SAS Warranty Analytics; IBM Warranty Analytics; industry reports on $2B-$5B+ annual warranty fraud losses.

### Finding 4: 1-of-1 Warranty Director approval oversimplifies the claims hierarchy

- **Location:** `warranty-chain.ts`, lines 81-93 (policies)
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text:**
  ```typescript
  threshold: {
    k: 1,
    n: 1,
    approverRoleIds: ["warranty-director"],
  },
  ```
- **Problem:** At major automotive OEMs, 60-80% of standard warranty claims are auto-adjudicated by the WMS rules engine with zero human review. The auto-adjudication engine validates coverage (VIN within warranty period and mileage, component covered under basic/powertrain/extended warranty), checks labor time against the OEM flat-rate guide, verifies parts replaced against the causal complaint, and approves the claim automatically. Only claims that fail auto-adjudication rules are routed to human review. The human review hierarchy is tiered by dollar amount: Claims Adjuster ($0-$2K), Senior Claims Analyst ($2K-$10K), Regional Warranty Manager ($10K-$50K), Warranty Director ($50K+). Modeling a 1-of-1 from Warranty Director for all claims implies the Warranty Director personally reviews every claim. This is only accurate for very high-value claims (engine replacement, hybrid battery, ADAS module) exceeding $50K. The scenario should model high-value claims requiring Prior Authorization (PA) where the Warranty Director is the bottleneck, with the Claims Adjuster and WMS handling routine claims.
- **Corrected Text:** The policy should model the Prior Authorization (PA) workflow for high-value claims. The threshold can remain 1-of-1 from Warranty Director (for claims above the PA threshold), but `mandatoryApprovers` and `delegationConstraints` should be added. See Corrected Scenario.
- **Source/Rationale:** Standard OEM claims authorization hierarchy at GM, Ford, Stellantis, Toyota, VW Group, Hyundai-Kia. PA workflow is the real-world bottleneck for high-value claims.

### Finding 5: No `mandatoryApprovers`

- **Location:** `warranty-chain.ts`, lines 81-93 (policies)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `mandatoryApprovers` field.
- **Problem:** For high-value claims requiring Prior Authorization (engine, transmission, hybrid battery, ADAS components), the Warranty Director (or Senior Claims Analyst) should be a mandatory approver -- these claims involve significant financial exposure ($5K-$50K+) and potential fraud risk. The Regional Manager should be able to act as a delegate but with constraints. All corrected sibling scenarios include `mandatoryApprovers`. supplier-cert has `["qa-manager"]`, export-control has `["empowered-official"]`.
- **Corrected Text:** Add `mandatoryApprovers: ["warranty-director"]` to the policy. See Corrected Scenario.
- **Source/Rationale:** OEM claims authority structures; corrected sibling scenario patterns.

### Finding 6: No `delegationConstraints`

- **Location:** `warranty-chain.ts`, lines 81-93 (policies)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `delegationConstraints` field.
- **Problem:** The Regional Manager's delegation authority should be explicitly scoped. In real OEM warranty operations, a Regional Manager typically CANNOT approve: (a) claims above their authority limit (e.g., $25K-$50K), (b) claims from dealers flagged by the SIU for investigation or audit, (c) claims involving potential safety defects (must be escalated to Technical Warranty / Engineering and reported under the TREAD Act), (d) goodwill/policy adjustments above a set dollar or percentage threshold, (e) fleet or recall-related claims. Without delegation constraints, the Regional Manager has unbounded authority, which is not how OEM delegation works.
- **Corrected Text:** Add delegation constraints. See Corrected Scenario.
- **Source/Rationale:** OEM claims authority matrix; SIU audit flags; NHTSA TREAD Act safety defect reporting requirements.

### Finding 7: No `escalation` rule

- **Location:** `warranty-chain.ts`, lines 81-93 (policies)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `escalation` field.
- **Problem:** What happens when both the Warranty Director and Regional Manager are unavailable? During high-volume periods (summer driving season, post-recall spikes, end-of-month claim surges), both may be overwhelmed. There should be an escalation path to a VP of Warranty Operations or the Technical Service Manager for claims with safety implications. All corrected sibling scenarios include escalation rules.
- **Corrected Text:** Add escalation rule. See Corrected Scenario.
- **Source/Rationale:** OEM claims escalation procedures; corrected sibling scenario patterns.

### Finding 8: No `constraints`

- **Location:** `warranty-chain.ts`, lines 81-93 (policies)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No `constraints` field.
- **Problem:** Corrected sibling scenarios include constraints (supplier-cert uses `environment: "sap-enclave"`, export-control uses `environment: "production"`). For warranty claims, delegation should have an `amountMax` constraint limiting the Regional Manager's dollar authority, and the environment should reflect that claims are processed in the production WMS, not a test system.
- **Corrected Text:** Add constraints. See Corrected Scenario.
- **Source/Rationale:** OEM claims authority dollar limits; corrected sibling scenario patterns.

### Finding 9: Dealer typed as `NodeType.Vendor` -- should be `NodeType.Partner`

- **Location:** `warranty-chain.ts`, lines 72-79
- **Issue Type:** Jargon Error
- **Severity:** Medium
- **Current Text:**
  ```typescript
  type: NodeType.Vendor,
  ```
- **Problem:** Automotive dealers are NOT vendors or suppliers. Dealers are independently owned and operated franchised businesses operating under a franchise agreement with the OEM. The OEM-dealer relationship is a franchise partnership, not a vendor/supplier relationship. In the type system, `NodeType.Partner` is available and is used for the Tier-1 Supplier in the joint-design scenario. While neither `Vendor` nor `Partner` is a perfect fit (a dedicated `Franchisee` type would be ideal), `Partner` is more accurate because: (a) dealers do not supply goods or services TO the manufacturer (the direction is reversed -- the manufacturer sells vehicles TO dealers), (b) dealers are partners in the retail distribution channel, and (c) the franchise relationship is legally distinct from a vendor/supplier relationship (governed by state dealer franchise laws, not procurement contracts).
- **Corrected Text:** `type: NodeType.Partner,`
- **Source/Rationale:** Automotive franchise law (state dealer franchise acts); OEM franchise/dealer agreements; NodeType enum in `src/types/organization.ts`.

### Finding 10: `manualTimeHours: 24` -- overstated for routine claims, reasonable for high-value PA claims

- **Location:** `warranty-chain.ts`, line 111
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `manualTimeHours: 24`
- **Problem:** 24 hours of manual time for a single warranty claim is overstated for routine claims (which take 2-8 hours including PA turnaround) but reasonable for complex claims requiring technical escalation (powertrain failure root cause analysis, hybrid battery diagnostic review). If the scenario models high-value PA claims (which it should, given the Warranty Director bottleneck), 24 hours is defensible but needs context. The comment should explain what is included: PA request preparation (1-2 hours), PA review and authorization (2-4 hours for routine, 24-48 hours for complex), claim submission (1-2 hours), claim adjudication (1-2 hours for manual review), parts return processing (1-2 hours). However, much of this time is elapsed/waiting time, not active manual effort. Active manual effort for a high-value PA claim is closer to 8-12 hours. I will keep 24 hours as the wall-clock elapsed time (consistent with how the other scenarios define it) but add comments explaining the breakdown.
- **Corrected Text:** Keep 24 hours but add detailed comments. See Corrected Scenario.
- **Source/Rationale:** OEM PA turnaround benchmarks: 2-4 hours routine, 24-48 hours complex; industry claims processing time studies.

### Finding 11: `riskExposureDays: 7` -- defensible for systemic delays

- **Location:** `warranty-chain.ts`, line 112
- **Issue Type:** Overstatement (marginal)
- **Severity:** Low
- **Current Text:** `riskExposureDays: 7`
- **Problem:** 7 days of risk exposure from a single delayed claim is overstated in isolation. However, if the scenario implies systemic delays across many claims during high-volume periods (which the description suggests), 7 days is reasonable. Vehicles sitting in dealer service bays contribute to "days out of service" calculations under state lemon laws, and systematic delays can trigger lemon law exposure across the dealer network. Additionally, delayed safety-related claims create TREAD Act reporting exposure. I will keep 7 days but add comments explaining the systemic risk.
- **Corrected Text:** Keep 7 days with explanatory comments. See Corrected Scenario.
- **Source/Rationale:** State lemon law "days out of service" thresholds (typically 15-30 cumulative days); NHTSA TREAD Act early warning reporting.

### Finding 12: `auditGapCount: 3` -- gaps not enumerated

- **Location:** `warranty-chain.ts`, line 113
- **Issue Type:** Inconsistency
- **Severity:** High
- **Current Text:** `auditGapCount: 3`
- **Problem:** All corrected sibling scenarios enumerate every audit gap with specific descriptions in code comments. supplier-cert enumerates 5 gaps, export-control enumerates 5 gaps. This scenario provides a raw number with no enumeration. The actual audit gaps in the current manual warranty claim process are: (1) no fraud analytics integration -- claims approved without risk scoring or dealer performance data, (2) no DTC/TSB cross-reference -- repair diagnosis not validated against known issues, (3) delegation authority not documented -- Regional Manager approval has no system record of authority scope, (4) no parts return tracking linked to claim -- PRA compliance not verified before payment, (5) no dealer performance scoring in the approval workflow -- high-CPV dealers treated the same as compliant dealers. The count should be 5, not 3, with full enumeration.
- **Corrected Text:** `auditGapCount: 5` with enumerated comments. See Corrected Scenario.
- **Source/Rationale:** OEM warranty audit findings; ISO 10002 complaint handling requirements; corrected sibling scenario pattern.

### Finding 13: `expirySeconds: 7200` (2 hours) -- too short for real PA turnaround

- **Location:** `warranty-chain.ts`, line 90
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `expirySeconds: 7200`
- **Problem:** 2 hours (7,200 seconds) as the authority window is too short. In real warranty operations, the PA turnaround is 2-4 hours for routine requests and 24-48 hours for complex requests requiring technical escalation. If the authority window expires after 2 hours, it would expire before many legitimate PA reviews are complete. The corrected sibling scenarios use longer windows: supplier-cert uses 72 hours (259,200 seconds), export-control uses 12 hours (43,200 seconds). For high-value warranty PA claims, a 24-hour authority window (86,400 seconds) is more realistic -- it accommodates the standard PA turnaround while still being time-bound.
- **Corrected Text:** `expirySeconds: 86400` (24 hours) with comments. See Corrected Scenario.
- **Source/Rationale:** OEM PA turnaround benchmarks; corrected sibling scenario authority window patterns.

### Finding 14: Missing `costPerHourDefault`

- **Location:** `warranty-chain.ts` (entire file -- field absent)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No `costPerHourDefault` field.
- **Problem:** The export-control scenario sets `costPerHourDefault: 15000`. For warranty claims, the cost of delay is the dealer's lost labor bay utilization ($100-$200/hour per bay, but across a network of 5,000+ dealers), customer satisfaction impact (JD Power CSI scores, Net Promoter Score), and vehicle "days out of service" contributing to lemon law exposure. A single delayed high-value claim ties up a dealer service bay and keeps a customer without their vehicle. A conservative per-claim cost is $150-$300/hour (dealer labor bay opportunity cost plus customer satisfaction impact). However, the systemic cost across the dealer network during high-volume periods is much higher.
- **Corrected Text:** `costPerHourDefault: 250` with comments. See Corrected Scenario.
- **Source/Rationale:** Dealer labor bay utilization rates ($100-$200/hr); JD Power Customer Service Index impact; OEM warranty cost models.

### Finding 15: Missing Technical Service Manager / Field Service Engineer actor

- **Location:** `warranty-chain.ts`, lines 16-80 (actors array)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No Technical Service Manager or Field Service Engineer actor.
- **Problem:** For complex technical claims (engine/transmission failure, hybrid battery degradation, ADAS malfunction), a technical specialist reviews the claim to verify the diagnosis, check for related Technical Service Bulletins (TSBs), confirm the repair procedure was correct, and determine whether the failure indicates a potential safety defect requiring TREAD Act reporting. This is a common escalation path in the PA workflow. Without this actor, there is no technical review capability for complex claims.
- **Corrected Text:** Add a Technical Service Manager role. See Corrected Scenario.
- **Source/Rationale:** OEM warranty technical escalation procedures; NHTSA TREAD Act early warning requirements.

### Finding 16: Narrative journey (Section 5) is dramatically thin

- **Location:** `docs/scenario-journeys/supply-chain-scenarios.md`, lines 296-357
- **Issue Type:** Inconsistency
- **Severity:** High
- **Current Text:** Section 5 is approximately 60 lines. The Setting is 2 sentences. Players section has 4 bullet points with minimal detail. Today's Process has 5 numbered steps with 1-2 sentences each and no technical detail. With Accumulate has 5 steps with 1-2 sentences each. Takeaway table has 6 rows.
- **Problem:** Compare with corrected Sections 1-4: Setting is a full paragraph with system names, technical context, and cost figures. Players section has 6-10 entries with detailed role descriptions. Today's Process has 5 numbered steps with multiple sentences each, including specific technical details (CB directory names, USML categories, DTCs, etc.) and timing annotations. Takeaway tables have 8-10 rows. Section 5 has no fraud analytics discussion, no DTC/TSB references, no OEM warranty system names (DealerConnect, GlobalConnect, OASIS 2, TIS), no enumerated audit gaps, no specific dollar figures for warranty costs, no reference to Magnuson-Moss or TREAD Act. It reads like a placeholder.
- **Corrected Text:** Complete rewrite. See Corrected Narrative Journey section.
- **Source/Rationale:** Corrected Sections 1-4 set the quality standard. Section 5 does not meet it.

### Finding 17: Description mentions "fraud analytics" but todayFriction does not model fraud detection gap

- **Location:** `warranty-chain.ts`, lines 118-123 (todayFriction manualSteps)
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** The manualSteps mention "no fraud analytics or dealer performance data in review workflow" but this is only a narrative description -- there is no actor, system, or policy element that would actually provide fraud analytics in the improved state.
- **Problem:** The gap between the "today" state and the improved state should demonstrate a concrete improvement: today, claims are reviewed without fraud risk scores or dealer performance data; with Accumulate, the WMS fraud analytics engine provides real-time risk scoring and flags anomalous patterns before the claim reaches human review. Without a WMS or fraud analytics actor, the improvement is purely narrative -- there is nothing structural in the scenario to demonstrate it.
- **Corrected Text:** Add WMS and fraud analytics actors and integrate them into the workflow. See Corrected Scenario.
- **Source/Rationale:** OEM warranty fraud analytics programs; Tavant, SAS, IBM warranty analytics platforms.

### Finding 18: Actor descriptions lack domain-specific detail

- **Location:** `warranty-chain.ts`, lines 16-80 (all actor descriptions)
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** Example: Warranty Director description is "Centralized approval authority -- bottleneck during high-volume periods, fraud patterns not surfaced in review workflow." Claims Adjuster description is "Validates claim submission, repair documentation, and parts authorization from dealer network."
- **Problem:** Compare with corrected sibling scenarios. The supplier-cert QA Manager description is 3 sentences with specific system names (BSI, TUV SUD, Bureau Veritas, SGS), verification steps, and mandatory approver designation. The export-control Empowered Official description includes the specific CFR citation (22 CFR 120.67), document types (DSP-5, DSP-73, DSP-85, TAAs, MLAs), penalty exposure ($1M per violation, 20 years imprisonment), and scenario context (at a trade compliance seminar). The warranty-chain actor descriptions are generic and contain no domain-specific detail -- no system names, no claim types, no dollar thresholds, no specific warranty terms.
- **Corrected Text:** Rewrite all actor descriptions with domain-specific detail. See Corrected Scenario.
- **Source/Rationale:** Corrected sibling scenario actor description quality standard.

---

## 3. Missing Elements

1. **Warranty Management System (WMS) as a System actor** -- The technical enforcement mechanism for the entire claims workflow. Every corrected sibling scenario has one.

2. **Fraud analytics / SIU representation** -- The scenario promises "Fraud Reduction" in the name but delivers nothing. A fraud analytics engine (or integrated WMS capability) should flag anomalous claim patterns before payment.

3. **Technical Service Manager / Field Service Engineer** -- Escalation role for complex technical claims requiring DTC verification, TSB validation, and root cause analysis.

4. **VP of Warranty Operations as escalation target** -- Required for the escalation rule when both Warranty Director and Regional Manager are unavailable.

5. **Inline `regulatoryContext` with warranty-specific frameworks** -- Magnuson-Moss, FTC Warranty Rules, NHTSA TREAD Act, IFRS 15/ASC 606.

6. **`mandatoryApprovers`** -- Warranty Director should be mandatory for high-value PA claims.

7. **`delegationConstraints`** -- Regional Manager's authority should be scoped by dollar threshold, claim type, and dealer SIU status.

8. **`escalation` rule** -- Auto-escalation when both primary approver and delegate are unavailable.

9. **`constraints`** -- Dollar amount cap and production environment for the WMS.

10. **`costPerHourDefault`** -- Dealer labor bay opportunity cost and customer satisfaction impact.

11. **Enumerated audit gaps** -- The 3 gaps should be expanded to 5 with specific descriptions in code comments.

12. **Detailed code comments** -- Corrected sibling scenarios have extensive comments explaining every metric value, policy parameter, and design decision. This scenario has none.

13. **Prior Authorization (PA) workflow context** -- The PA process is the real-world bottleneck for high-value claims. The scenario description should reference it explicitly.

14. **DTC, TSB, and OEM scan tool references** -- These are fundamental to the warranty claim diagnostic process.

15. **Dealer Performance Scorecard references** -- CPV (Claims Per Vehicle), CPC (Cost Per Claim), repair order completion rate -- these are how OEMs evaluate dealer warranty performance.

---

## 4. Corrected Scenario

### Corrected TypeScript (`warranty-chain.ts`)

```typescript
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
```

### Corrected Narrative Journey (Section 5 of `supply-chain-scenarios.md`)

Replace lines 296-357 with:

```markdown
## 5. Warranty Claim Authorization, Fraud Reduction & Dealer Network Governance

**Setting:** A global Auto Manufacturer processes warranty claims across a 5,000+ dealer network through the Warranty Management System (WMS -- DealerConnect / GlobalConnect / OASIS 2 / TIS / B2B Connect). The WMS auto-adjudication engine automatically approves 60-80% of standard claims (coverage validation, flat-rate labor time verification, parts-to-complaint matching) with zero human review. High-value claims -- engine or transmission assembly replacement, hybrid battery pack, ADAS module -- exceeding the auto-adjudication threshold ($5K+) require Prior Authorization (PA) from the Warranty Director before the dealer can proceed with the repair. The Warranty Director is handling a high-volume PA backlog during summer driving season. The Claims Adjuster in the Claims Center has prepared the PA request with DTC (Diagnostic Trouble Code) data, repair order documentation, and parts authorization, but without integrated fraud analytics, the PA review lacks risk scoring, dealer performance data, and pattern detection for repeat VIN claims, labor time inflation, or parts harvesting. Meanwhile, the customer's vehicle sits in the dealer service bay, accumulating "days out of service" toward state lemon law thresholds, and the dealer's labor bay is tied up instead of generating customer-pay revenue at $100-$200/hour.

**Players:**
- **Auto Manufacturer** (organization)
  - Warranty Operations Department
    - Warranty Director -- primary PA authority for high-value claims ($50K+); handling summer backlog
    - Regional Warranty Manager -- delegated authority for PA claims within $10K-$50K for non-SIU-flagged dealers
    - Technical Service Manager -- escalation for complex diagnostic claims (engine/transmission failure root cause, hybrid battery degradation, ADAS calibration)
  - Claims Center
    - Claims Adjuster -- first-line human reviewer; validates DTC data, labor time, parts-to-complaint matching; initiates PA requests
  - VP of Warranty Operations -- escalation authority when both Warranty Director and Regional Manager are unavailable
  - Warranty Management System (WMS) -- auto-adjudication engine, dealer portal management, fraud analytics integration (Tavant warranty.ai / SAS Warranty Analytics), PA workflow routing, dealer payment processing, Parts Return Authorization (PRA) tracking
- **Dealer** (franchised partner -- submitting claims through dealer portal, waiting for PA authorization)

**Action:** Claims Adjuster initiates Prior Authorization (PA) request for a high-value warranty claim from the dealer network. Requires 1-of-1 from Warranty Director (mandatory for claims above $50K), with formal delegation to Regional Warranty Manager for claims within the delegation limit ($10K-$50K). Delegation constrained: Regional Manager cannot approve claims from SIU-flagged dealers, claims with safety defect indicators (TREAD Act evaluation required), or goodwill adjustments above $5K. Auto-escalation to VP of Warranty Operations after 4 hours if PA authorization not obtained.

---

### Today's Process

**Policy:** 1-of-1 from Warranty Director. No delegation. No escalation. No fraud analytics integration. Short expiry.

1. **Claim submitted via dealer portal.** The Dealer submits the warranty claim through the dealer portal (DealerConnect / GlobalConnect / OASIS 2 / TIS / B2B Connect) with repair order data: VIN, mileage, DTC codes from the OEM scan tool, labor operation codes (OEM flat-rate), causal part number, parts replaced, and sublet charges. The Claims Adjuster manually validates the claim data -- coverage verification (is the VIN within the warranty period and mileage? is the component covered under basic, powertrain, extended, or emissions warranty?), labor time against the OEM flat-rate guide, and parts replaced against the causal complaint. No integrated fraud risk score or dealer performance data in the PA request. *(~5 sec delay; represents 2-4 hours real-world elapsed time for dealer submission and Claims Adjuster validation)*

2. **Warranty Director reviewing PA request.** The Warranty Director reviews the PA request against warranty coverage terms -- checking VIN warranty status, repair cost estimate, and DTC data. No fraud analytics dashboard is available: no dealer CPV (Claims Per Vehicle) anomaly detection, no repeat VIN history, no labor time deviation analysis, no parts harvesting indicators. The review is based on repair order documentation alone, without risk intelligence from the WMS fraud analytics engine. During standard periods, PA turnaround is 2-4 hours. During summer driving season, the Warranty Director has 200+ PA requests in queue. *(~6 sec delay; represents 2-4 hours standard, degrading to 24-48+ hours during high-volume periods)*

3. **Warranty Director overwhelmed -- PA backlog.** The Warranty Director is handling the high-volume PA backlog during summer driving season. The Regional Warranty Manager is available but unsure whether they have authority to approve -- no system-enforced delegation exists. Dealers are calling regional offices seeking PA status. The customer's vehicle sits in the dealer service bay, accumulating days-out-of-service toward state lemon law thresholds (typically 15-30 cumulative days). Fraud patterns -- repeat VIN claims on the same vehicle, labor time inflation by specific dealers, anomalous dealer CPV compared to regional averages -- go undetected in the PA backlog as review rigor degrades under volume pressure. *(~10 sec delay; represents 8-24 hours real-world delay during high-volume periods)*

4. **PA delayed -- dealer and customer impact.** With the Warranty Director as the sole PA authority and no delegation or escalation configured, high-value claims wait until the Warranty Director can review them. The dealer's labor bay is occupied by the vehicle (opportunity cost $100-$200/hr), the customer is without their vehicle, and the OEM's warranty fraud exposure increases with every unscreened claim that eventually gets rubber-stamped during the backlog clearance. Claims involving safety-critical components (brakes, steering, fuel system, airbags) are not differentiated from routine claims -- TREAD Act early warning data is not being generated from the PA queue.

5. **Outcome:** 24+ hours of wall-clock delay per PA claim during high-volume periods. 7 days of systemic risk exposure across the dealer network. Five audit gaps: (1) no fraud analytics integration -- claims approved without risk scoring or dealer anomaly detection, (2) no DTC/TSB cross-reference in PA workflow -- repair diagnosis not validated against known issues, (3) delegation authority not documented -- Regional Manager approval has no system record of authority scope, (4) no Parts Return tracking linked to PA claim -- PRA compliance not verified before dealer payment, (5) no dealer performance scoring in PA workflow -- SIU-flagged dealers not differentiated. Customer vehicles stuck in service bays. Dealer satisfaction declining. Warranty fraud undetected. An ISO 10002 auditor would flag the absence of documented complaint handling timelines. A TREAD Act audit would flag the failure to flag safety-related claims for early warning reporting.

**Metrics:** ~24 hours of delay (during high-volume periods), 7 days of risk exposure, 5 audit gaps, 5 manual steps.

---

### With Accumulate

**Policy:** 1-of-1 from Warranty Director (mandatory for claims above $50K). Formal delegation to Regional Warranty Manager for claims $10K-$50K from non-SIU-flagged dealers. Auto-escalation to VP of Warranty Operations after 4 hours. 24-hour authority window. Production WMS constraint. Delegation constrained by dollar threshold, dealer SIU status, and safety defect indicators.

1. **Claim submitted through WMS.** The Dealer submits the warranty claim through the dealer portal. The WMS auto-adjudication engine validates basic coverage (VIN within warranty period and mileage, component covered under applicable warranty), verifies labor time against the OEM flat-rate guide, and checks parts replaced against the causal complaint. The claim exceeds the auto-adjudication threshold ($5K+) and is routed to the Claims Adjuster for PA preparation. The WMS fraud analytics engine (Tavant warranty.ai / SAS Warranty Analytics) generates a real-time risk score: dealer CPV anomaly detection, repeat VIN history, labor time deviation analysis, and parts replacement pattern matching. The risk score is attached to the PA request.

2. **Claims Adjuster prepares PA with fraud intelligence.** The Claims Adjuster reviews the claim with integrated data: DTC codes verified against OEM scan tool records, TSB (Technical Service Bulletin) applicability checked, dealer performance scorecard (CPV, CPC, PRA compliance rate) displayed, and fraud risk score highlighted. The PA request is submitted to the Warranty Director with complete risk intelligence -- not just repair order documentation.

3. **Warranty Director unavailable -- auto-delegate to Regional Manager.** The Warranty Director is handling the high-volume PA backlog. The Accumulate policy engine detects the PA request has not been actioned within the response SLA and automatically invokes the pre-configured delegation to the Regional Warranty Manager. The delegation is constrained: the system verifies that (a) the claim is within the Regional Manager's authority limit ($10K-$50K), (b) the dealer is not flagged by the SIU for investigation or audit, (c) the claim does not involve safety-critical components requiring TREAD Act evaluation, and (d) the claim is not a goodwill/policy adjustment above $5K. If any constraint fails, the delegation is blocked and the claim escalates instead.

4. **Regional Manager approves with full context.** The Regional Warranty Manager receives the delegated PA request with full context: claim details, fraud risk score, dealer performance scorecard, DTC verification results, and TSB applicability. The Regional Manager approves the PA within their delegated authority. Cryptographic proof captures the delegation chain, fraud risk score at time of approval, dealer performance data, and authorization decision.

5. **Safety-related claims routed to Technical Service Manager.** If the WMS fraud analytics engine or Claims Adjuster identifies the claim as involving a safety-critical component (brakes, steering, fuel system, airbags, electronic stability control), the claim is automatically routed to the Technical Service Manager for diagnostic review before PA authorization. The Technical Service Manager validates the DTC data, confirms the repair procedure, and determines whether the failure pattern indicates a potential safety defect requiring TREAD Act early warning reporting to NHTSA.

6. **PA authorized -- dealer proceeds.** Parts and labor are authorized. The dealer receives PA authorization through the dealer portal and proceeds with the repair. The WMS issues a Parts Return Authorization (PRA) for the causal part -- the dealer must return the part to the OEM parts return center within 15-30 days. PRA compliance is tracked and linked to the claim record. Dealer payment (credit memo: parts markup + labor reimbursement + sublet) is processed upon PRA compliance verification.

7. **Outcome:** PA authorized within minutes (delegation) to hours (complex claims with Technical Service Manager review) instead of 24-48+ hours during high-volume periods. Customer vehicle repaired and returned faster. Dealer satisfaction preserved. Fraud analytics integrated into every PA decision -- real-time risk scoring, dealer anomaly detection, and SIU intelligence. Safety-related claims flagged for TREAD Act reporting. Full warranty audit trail with cryptographic proof of PA authorization, delegation chain, fraud risk score, dealer performance data, DTC verification, and PRA compliance.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Claim submission and validation | Dealer portal submission with manual Claims Adjuster review -- no fraud risk score, no dealer performance data | WMS auto-adjudication for standard claims; PA requests enriched with fraud risk score, dealer CPV/CPC scorecard, and DTC verification |
| Fraud analytics | Not integrated -- fraud patterns (repeat VIN, labor inflation, parts harvesting) detected only retroactively during annual dealer audits | Real-time fraud risk scoring via WMS analytics engine (Tavant warranty.ai / SAS Warranty Analytics) attached to every PA request |
| When Warranty Director is overwhelmed | PA claims queue indefinitely -- no delegation, no escalation | Auto-delegation to Regional Warranty Manager (constrained by dollar limit, SIU status, safety indicators) + auto-escalation to VP of Warranty |
| Dealer SIU status | SIU-flagged dealers treated identically to compliant dealers in PA workflow | Delegation blocked for SIU-flagged dealers -- claims routed to Warranty Director or VP for direct review |
| Safety-critical claims | No differentiation -- same PA queue as routine claims, no TREAD Act flagging | Automatic routing to Technical Service Manager for diagnostic review; safety defect indicators reported to TREAD Act early warning system |
| DTC/TSB cross-reference | Repair diagnosis not validated against known issues or OEM scan tool data | DTC data verified against OEM scan tool records; TSB applicability checked before PA authorization |
| Parts Return compliance | PRA not tracked or linked to claim -- dealers may be paid without returning parts | PRA issuance, tracking, and compliance verification linked to claim record and dealer payment |
| Dealer experience | Frustrated -- 24-48+ hour PA turnaround during peak periods, vehicles stuck in bays | PA authorized in minutes (delegation) to hours (complex); dealer labor bay freed faster |
| Customer impact | Vehicle in service bay accumulating days-out-of-service toward lemon law thresholds | Repaired and returned faster; days-out-of-service minimized |
| Delegation governance | Unclear authority -- Regional Manager unsure if they can approve, no system record | Formal delegation with constraints (dollar limit, SIU status, safety indicators), cryptographic proof of authority chain |
| Audit / compliance record | Portal submission logs, shared spreadsheet, no fraud data, no delegation record | Cryptographic proof chain: PA authorization, delegation chain, fraud risk score, DTC verification, dealer scorecard, PRA compliance, TREAD Act flagging |
```

---

## 5. Credibility Risk Assessment

### VP of Warranty Operations ($5B+ annual warranty accruals, 5,000+ dealer network)

**Would challenge in ORIGINAL:**
- "Where is the WMS? You cannot describe our warranty claims operation without the system that processes 500,000+ claims a year."
- "The Warranty Director does not review individual claims. That is what auto-adjudication and Claims Adjusters are for. The Director handles systemic issues and $50K+ PA claims."
- "You say 'Fraud Reduction' but there is nothing here -- no SIU, no analytics, no risk scoring. We lose $3B+ a year to warranty fraud. This is not a credible representation of our fraud program."
- "EAR section 764 and ISO 9001 Clause 8.4 have nothing to do with warranty claims. Where is Magnuson-Moss? Where is TREAD Act?"

**Would accept in CORRECTED:**
- The tiered claims authority hierarchy (auto-adjudication, Claims Adjuster, Senior Claims Analyst, Regional Manager, Director) is accurately described.
- The delegation constraints (dollar limit, SIU status, safety defect indicators) reflect real OEM delegation matrices.
- The fraud analytics integration (CPV anomaly detection, repeat VIN, labor time deviation) matches the capability of deployed platforms (Tavant, SAS, IBM).
- Magnuson-Moss, TREAD Act, FTC Rules, and IFRS 15/ASC 606 are the correct regulatory frameworks.

### Director of Claims Management (500,000+ claims/year)

**Would challenge in ORIGINAL:**
- "24 hours of manual time for a single claim? Our Claims Adjusters process 20-30 claims per day. Even a complex PA claim does not take 24 hours of active manual effort."
- "Where is the Prior Authorization workflow? That is the bottleneck for high-value claims -- not the Warranty Director reviewing routine claims."
- "3 audit gaps is too few and they are not enumerated. I can name 5 from our last internal audit."
- "The Claims Adjuster description says 'validates claim submission, repair documentation, and parts authorization.' That is too vague. What are they actually doing? Checking DTC codes? Verifying flat-rate labor time? Matching parts to the causal complaint?"

**Would accept in CORRECTED:**
- The PA workflow is explicitly modeled as the bottleneck for high-value claims.
- The Claims Adjuster description includes specific validation activities (DTC verification, flat-rate labor time, parts-to-complaint matching).
- Five audit gaps are enumerated with specific descriptions matching common internal audit findings.
- The 24-hour metric is explained as wall-clock elapsed time during high-volume periods, not active manual effort.

### Warranty Fraud Investigator / SIU Manager

**Would challenge in ORIGINAL:**
- "The scenario promises fraud reduction but delivers nothing. Where is my analytics engine? Where is the SIU? Where are the fraud patterns we detect?"
- "No mention of CPV, CPC, repeat VIN, labor time inflation, parts harvesting, or phantom repairs in the actor model or policies. These are the fundamental fraud detection metrics."
- "The description mentions 'claim leakage and abuse patterns' but the improved state has no structural mechanism to detect them. This is marketing copy, not a governance model."

**Would accept in CORRECTED:**
- The WMS system actor explicitly includes fraud analytics integration with named platforms (Tavant warranty.ai, SAS Warranty Analytics).
- Specific fraud patterns are referenced in the workflow (repeat VIN, labor time inflation, parts harvesting, phantom repairs, dealer CPV anomaly).
- Delegation constraints include SIU status check -- claims from SIU-flagged dealers cannot be delegated to Regional Manager.
- The narrative journey describes fraud risk scoring attached to every PA request.

### Regional Warranty Manager (200+ dealer region)

**Would challenge in ORIGINAL:**
- "The Regional Manager description says 'processes claims within policy-bound thresholds.' What thresholds? What dollar limit? Can I approve a $100K engine claim? Obviously not."
- "No mention of dealer scorecards (CPV, CPC, PRA compliance). That is how I manage my dealers."
- "No mention of dealer warranty audits, which I conduct quarterly."
- "Can I approve claims from a dealer that my SIU team is investigating? In the current model, there is no constraint preventing that."

**Would accept in CORRECTED:**
- Specific delegation constraints with dollar limits ($10K-$50K), SIU status check, and safety defect exclusion.
- Dealer scorecard references (CPV, CPC, PRA compliance rate) in the Regional Manager description.
- Dealer warranty audit mentioned in the Regional Manager role description.
- SIU-flagged dealers explicitly excluded from the delegation pathway.

### Warranty Systems Manager (DealerConnect/GlobalConnect implementation)

**Would challenge in ORIGINAL:**
- "There is no WMS in this scenario. DealerConnect, GlobalConnect, OASIS 2, TIS -- none of these are mentioned. How can you model warranty claims without the system that processes them?"
- "No mention of auto-adjudication. At our OEM, the WMS auto-approves 70% of claims with zero human touch. The scenario implies every claim goes to the Warranty Director."
- "No fraud analytics engine. We deployed Tavant warranty.ai two years ago and it catches $50M+ in fraudulent claims annually. This is not represented."
- "No DMS integration (CDK Global, Reynolds & Reynolds). The dealer's DMS is where the claim originates."

**Would accept in CORRECTED:**
- WMS system actor with specific platform references (DealerConnect, GlobalConnect, OASIS 2, TIS, B2B Connect) and integration points (SAP Warranty Management, Oracle Warranty Management).
- Auto-adjudication explicitly described (60-80% of standard claims auto-approved).
- Fraud analytics engine integrated into the WMS with named platforms (Tavant warranty.ai, SAS Warranty Analytics, IBM Warranty Analytics).
- Dealer portal and DMS references throughout actor descriptions and narrative.
