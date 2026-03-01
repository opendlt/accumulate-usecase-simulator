# SME Review #20 — DAO Treasury Governance: Multisig Coordination, Spending Controls & On-Chain Audit Trail

**Reviewer:** DAO Treasury Operations, Multisig Governance & On-Chain Spending Controls SME
**Scenario:** `web3-treasury-governance`
**Files Reviewed:**
- `src/scenarios/web3/treasury-governance.ts` (primary)
- `docs/scenario-journeys/web3-scenarios.md` Section 1 (primary)
- `src/lib/regulatory-data.ts` (web3 entries)
- `src/scenarios/archetypes.ts`
- `src/types/policy.ts`
- `src/types/scenario.ts`
- `src/types/organization.ts`
- `src/types/regulatory.ts`
- `src/scenarios/supply-chain/supplier-cert.ts` (corrected reference)
- `src/scenarios/supply-chain/warranty-chain.ts` (corrected reference)

---

## 1. Executive Assessment

**Overall Credibility Score: D+**

This scenario reads like a first-draft sketch by someone who has read about DAO treasury operations but has never served on a Treasury Committee, executed a Safe multisig transaction, or coordinated a signing ceremony across time zones. The fundamental governance concepts are directionally correct -- multisig threshold, timelock, signer unavailability -- but the implementation is shallow, inconsistent, and missing critical governance infrastructure that any experienced DAO operator would immediately flag. The scenario would not survive scrutiny from a Treasury Committee Lead at a top-20 DAO, a Safe power user, or a governance platform engineer.

### Top 3 Most Critical Issues

1. **CRITICAL: `REGULATORY_DB.web3` is generic and inapplicable to DAO treasury governance.** MiCA Art. 68 governs CASPs (crypto-asset service providers), not DAOs. SEC Rule 206(4)-2 governs investment advisers, not DAOs. Neither framework addresses the specific regulatory risks of DAO treasury disbursements: FATF Travel Rule for cross-border payments, OFAC sanctions screening for destination wallets, or IRS 1099 reporting for contributor payments. A compliance officer advising a DAO treasury would reject this as a regulatory non-answer.

2. **CRITICAL: Delegation to "Community Oversight" (community-multisig) is a fabricated governance pattern.** No production DAO delegates spending authority to a vague "Community Oversight" body. Treasury delegation in real DAOs goes to a Sub-Committee multisig (Grants Council, OpEx Committee) with defined spending caps and scope restrictions. "Community Oversight" in DAO governance is a veto/cancellation mechanism (Optimistic Governance, Zodiac Reality Module), not a delegation target for treasury disbursements.

3. **CRITICAL: Missing `mandatoryApprovers`, `delegationConstraints`, `escalation`, and `costPerHourDefault`.** The policy is a bare skeleton with only threshold, expiry, delegation, and a single constraint. Corrected reference scenarios (supplier-cert, warranty-chain) demonstrate the full policy model with mandatory approvers, delegation scope constraints, escalation paths, and cost-per-hour estimates. This scenario's policy would be rejected by any DAO governance framework designer as incomplete and unenforceable.

### Top 3 Strengths

1. **Correct archetype selection.** `"key-ceremony"` is the appropriate archetype for Safe multisig signing ceremonies requiring coordinated scheduling across time zones with hardware wallet verification.

2. **Timelock Contract as a System actor.** Correctly models the TimelockController as a separate system actor rather than embedding it into the Treasury Committee, which accurately reflects the architectural separation between multisig approval and timelock-delayed execution.

3. **todayPolicies correctly models the broken state.** The `todayPolicies` array uses k:3, n:3 (unanimous) to represent the current broken state where a single unavailable signer blocks all treasury operations, while the main policy uses k:2, n:3 for the improved state.

---

## 2. Line-by-Line Findings

### Finding 1: Import of REGULATORY_DB

- **Location:** `treasury-governance.ts`, line 4
- **Issue Type:** Inconsistency
- **Severity:** Critical
- **Current Text:** `import { REGULATORY_DB } from "@/lib/regulatory-data";`
- **Problem:** The scenario imports `REGULATORY_DB` and uses the generic `REGULATORY_DB.web3` entries. Corrected reference scenarios (supplier-cert.ts, warranty-chain.ts) use inline `regulatoryContext` arrays with scenario-specific regulatory entries. The generic web3 entries (MiCA Art. 68 for CASPs, SEC Rule 206(4)-2 for investment advisers) are tangentially related to DAO treasury governance at best and misleading at worst. A DAO is not a CASP and a DAO treasury committee is not an investment adviser. The applicable frameworks are FATF Recommendation 16 (Travel Rule for cross-border disbursements), OFAC sanctions compliance (SDN list screening for destination wallets), EU MiCA Art. 67 organizational requirements (for DAO-adjacent foundations operating in the EU), and IRS/HMRC tax reporting obligations for contributor payments.
- **Corrected Text:** Remove the `REGULATORY_DB` import entirely. Replace `regulatoryContext: REGULATORY_DB.web3` with an inline `regulatoryContext` array containing treasury-governance-specific entries.
- **Source/Rationale:** MiCA Regulation 2023/1114 Art. 68 explicitly applies to CASPs, not DAOs. SEC Rule 206(4)-2 applies to investment advisers with custody of client assets. FATF Recommendation 16 applies to VASPs conducting transfers above $1,000. OFAC SDN list screening is required for all US-nexus treasury operations.

### Finding 2: Treasury Committee description embeds today-state threshold

- **Location:** `treasury-governance.ts`, line 29
- **Issue Type:** Inconsistency
- **Severity:** High
- **Current Text:** `"3-of-3 Safe multisig with 48-hour timelock and spending caps for treasury disbursements"`
- **Problem:** The actor description says "3-of-3" but the main policy (the "with Accumulate" state) uses k:2, n:3. The description embeds the today-state threshold into the actor itself, creating confusion about what the scenario is modeling. The actor description should be neutral about the specific threshold since the threshold is defined by the policy, not the actor. The actor should describe what the Treasury Committee IS (a multisig-governed treasury governance body), not what its current broken threshold is.
- **Corrected Text:** `"Elected 3-member Treasury Committee governing DAO treasury disbursements via Safe multisig with TimelockController and spending cap enforcement. Manages treasury diversification, grant program disbursements, and service provider payments."`
- **Source/Rationale:** Safe multisig threshold is a policy parameter, not an inherent property of the committee. Actor descriptions should describe the role and function, not embed policy state.

### Finding 3: Signer labels are generic

- **Location:** `treasury-governance.ts`, lines 37-59
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** `"Signer A"`, `"Signer B"`, `"Signer C"`
- **Problem:** In production DAO treasury committees, signers have distinct operational roles. A Treasury Lead drafts proposals and coordinates signing ceremonies. A Security-focused signer reviews contract risk, calldata verification, and destination wallet screening. A Finance-focused signer reviews spending caps, burn rate projections, and budget conformance. Generic "Signer A/B/C" labels fail to convey the multi-competency governance model that makes multisig committees effective. Corrected reference scenarios use descriptive role labels (e.g., "Procurement Lead", "Quality Manager", "Compliance Officer").
- **Corrected Text:** Rename to "Treasury Lead" (drafts proposals, coordinates signing), "Security Signer" (contract risk, calldata verification, destination screening), "Finance Signer" (spending caps, burn rate, budget conformance). Update descriptions accordingly.
- **Source/Rationale:** Real DAO treasury committees at Uniswap, Aave, Arbitrum, Optimism assign distinct competency areas to committee members. Treasury Lead is a standard role title in DAO governance.

### Finding 4: "Community Oversight" as delegation target

- **Location:** `treasury-governance.ts`, lines 72-78
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `label: "Community Oversight"`, `description: "Community oversight layer -- audit trail fragmented across governance forum, Safe UI, Discord, and Snapshot"`
- **Problem:** (1) "Community Oversight" is not a delegation target for treasury spending authority in any production DAO governance framework. Community oversight in DAOs manifests as veto power (Optimistic Governance), cancellation authority (TimelockController CANCELLER_ROLE), or advisory input (governance forum discussion). Spending authority is delegated to Sub-Committees with defined mandates: Grants Council (grant disbursements), OpEx Committee (operational expenses), or a dedicated Sub-Committee multisig with lower spending caps. (2) The description describes audit trail fragmentation, which is an observation about the today-state problem, not a description of the actor's function. (3) Using NodeType.Department for what should be a sub-committee multisig is acceptable but the label and description are misleading.
- **Corrected Text:** Rename to "Grants Sub-Committee" with a description reflecting its role as a delegated spending authority for grant disbursements within defined parameters. Alternatively, rename to "OpEx Sub-Committee" for operational expense delegation.
- **Source/Rationale:** Uniswap Foundation delegates to the Grants Council. Arbitrum DAO delegates to the Grants and Incentives Committee (GIC). Optimism Collective delegates to the Grants Council and Builders sub-committees. None of these are called "Community Oversight."

### Finding 5: Missing governance system actor

- **Location:** `treasury-governance.ts`, actors array
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No governance system actor present.
- **Problem:** The workflow description references "governance proposal posted" but there is no actor representing the governance system (Snapshot for off-chain signaling, Tally/Governor for on-chain voting, or the governance forum). In DAO treasury operations, a governance vote is a prerequisite for Treasury Committee action -- the committee executes governance-approved spending, it does not unilaterally decide to spend. The governance system should be represented as a System actor that authorizes the Treasury Committee's spending mandate.
- **Corrected Text:** Add a System actor for "Governance System" with description referencing Snapshot for signaling votes and/or on-chain Governor for binding votes.
- **Source/Rationale:** Every major DAO (Uniswap, Aave, Compound, Arbitrum, Optimism, ENS) requires a governance proposal and vote before treasury disbursements. The Treasury Committee does not self-authorize.

### Finding 6: No `mandatoryApprovers`

- **Location:** `treasury-governance.ts`, line 80-95 (policy)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Policy has no `mandatoryApprovers` field.
- **Problem:** For high-value treasury disbursements ($200K in this scenario), most DAO treasury committees require the Treasury Lead to be among the k approvers. The Treasury Lead is responsible for proposal drafting, Tenderly simulation review, and calldata verification -- bypassing the Treasury Lead undermines the governance model. The `Policy` interface supports `mandatoryApprovers?: string[]` and corrected reference scenarios use it (supplier-cert: QA Manager mandatory; warranty-chain: Warranty Director mandatory).
- **Corrected Text:** Add `mandatoryApprovers: ["treasury-lead"]` to the policy.
- **Source/Rationale:** DAO treasury frameworks at Aave, Uniswap, and Arbitrum require the Treasury Lead or designated primary signer to approve high-value disbursements. The `Policy` type interface explicitly supports this field.

### Finding 7: No `delegationConstraints`

- **Location:** `treasury-governance.ts`, line 80-95 (policy)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Policy has no `delegationConstraints` field.
- **Problem:** Delegation to a sub-committee without constraints is a governance failure. The delegation should be scoped by: amount threshold (sub-committee only handles disbursements under a certain amount, e.g., $50K), recipient category (grants only, not service provider payments or treasury diversification), and proposal type (routine grant disbursements, not strategic treasury operations). Without constraints, the sub-committee could theoretically approve any disbursement up to the $500K cap -- this would never be acceptable in a production DAO.
- **Corrected Text:** Add `delegationConstraints: "Delegation from Treasury Committee to Grants Sub-Committee is limited to governance-approved grant disbursements under $50K to recipients who have passed OFAC SDN screening. Service provider payments, treasury diversification, protocol-owned liquidity operations, and strategic treasury actions require direct Treasury Committee approval."`.
- **Source/Rationale:** Grants Council mandates at Uniswap, Arbitrum, and Optimism are explicitly scoped by dollar amount, recipient type, and program category.

### Finding 8: No `escalation`

- **Location:** `treasury-governance.ts`, line 80-95 (policy)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Policy has no `escalation` field.
- **Problem:** When the Treasury Committee cannot reach the 2-of-3 threshold within the 24-hour expiry window (e.g., two signers traveling simultaneously), there is no escalation path. In production DAOs, escalation options include: emergency governance vote via Snapshot, activation of a backup multisig with different signers, or escalation to a DAO-wide governance council. Without escalation, the treasury is frozen when quorum cannot be reached.
- **Corrected Text:** Add `escalation: { afterSeconds: 20, toRoleIds: ["governance-system"] }` (simulation-compressed; represents real-world escalation to emergency governance vote after 12 hours of quorum failure).
- **Source/Rationale:** Optimism Collective has a Security Council as an escalation backstop. Arbitrum DAO can invoke emergency governance proposals. The `Policy` type interface explicitly supports the `escalation` field.

### Finding 9: No `costPerHourDefault`

- **Location:** `treasury-governance.ts`, scenario root
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No `costPerHourDefault` field present.
- **Problem:** The `ScenarioTemplate` interface supports `costPerHourDefault?: number` and the corrected warranty-chain scenario uses it ($250/hr). Delayed DAO treasury disbursements have measurable costs: grant recipient project delays (opportunity cost of blocked engineering work, typically $5K-$20K/day for a funded team), service provider payment term violations (net-30 terms breached, relationship damage), DeFi yield opportunity cost on idle treasury assets (stablecoin yield at 3-5% APY on $200K = $16-$27/day), and contributor morale impact. A conservative estimate would be $100-$300/hr for a $200K disbursement delay.
- **Corrected Text:** Add `costPerHourDefault: 200`.
- **Source/Rationale:** Grant teams at Uniswap and Arbitrum report 1-2 week delays in treasury disbursements causing engineering team productivity losses. The corrected warranty-chain scenario provides a precedent at $250/hr.

### Finding 10: `manualTimeHours: 48` accuracy

- **Location:** `treasury-governance.ts`, line 114
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `manualTimeHours: 48`
- **Problem:** 48 hours of wall-clock elapsed time is within the plausible range (24-72 hours is typical for DAO treasury disbursements with timezone coordination), but the metric conflates wall-clock elapsed time with manual effort time. The active manual effort for a 3-signer Safe multisig ceremony is approximately 8-12 hours: governance proposal drafting (2-3 hours), Tenderly simulation preparation and review (1-2 hours), three signers each spending 1-2 hours on verification and signing (3-6 hours), and timelock queuing/execution (1 hour). The remaining 36-40 hours are waiting time (timezone coordination, signer availability). The metric should be justified with a comment explaining whether it represents wall-clock or active manual time.
- **Corrected Text:** Keep `manualTimeHours: 48` but add a comment explaining the breakdown: wall-clock elapsed time including 8-12 hours active manual effort plus 36-40 hours of timezone coordination and signer availability waiting.
- **Source/Rationale:** Safe multisig ceremony timing data from Aave, Compound, and Uniswap governance proposal execution reports. 48 hours is plausible for wall-clock elapsed time, especially with a traveling signer.

### Finding 11: `riskExposureDays: 7` not justified

- **Location:** `treasury-governance.ts`, line 115
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `riskExposureDays: 7`
- **Problem:** 7 days of risk exposure is stated but not justified. What exactly is at risk during this 7-day window? Plausible interpretations include: (a) the window during which a stale governance approval (Snapshot vote passed weeks ago) could be exploited through market condition changes, (b) the period during which a pending treasury disbursement creates an information asymmetry (community knows funds will be disbursed but the timing is uncertain), (c) the cumulative delay across multiple failed signing attempts. A comment should enumerate the specific risks that justify the 7-day figure.
- **Corrected Text:** Keep `riskExposureDays: 7` with a detailed comment explaining: governance approval staleness (market conditions may change between vote and execution), grant recipient project delays accumulating, service provider payment term violations, and DeFi yield opportunity cost on idle treasury assets.
- **Source/Rationale:** DAO governance proposal execution reports show 3-14 day gaps between governance approval and Safe multisig execution, with 7 days being a reasonable mid-range estimate.

### Finding 12: `auditGapCount: 4` not enumerated

- **Location:** `treasury-governance.ts`, line 116
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `auditGapCount: 4`
- **Problem:** The 4 audit gaps are mentioned in the description ("audit trail fragmented across governance forum, Safe UI, Discord, and Snapshot") but not enumerated as distinct audit gaps with specific descriptions. Corrected reference scenarios enumerate every audit gap with detailed explanations in comments. The four gaps should be: (1) governance proposal discussion in forum not linked to Safe transaction, (2) Tenderly simulation results not captured in the approval record, (3) signer coordination via Discord with no audit trail, (4) Snapshot vote result not cryptographically linked to Safe execution. A fifth gap is plausible: OFAC/sanctions screening of the destination wallet is performed manually with no record linking the screening result to the specific disbursement.
- **Corrected Text:** Increase to `auditGapCount: 5` with detailed comments enumerating each gap.
- **Source/Rationale:** Audit gap enumeration pattern established in corrected supplier-cert (5 gaps) and warranty-chain (5 gaps) scenarios.

### Finding 13: `approvalSteps: 6` not enumerated

- **Location:** `treasury-governance.ts`, line 117
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `approvalSteps: 6`
- **Problem:** The 6 approval steps are not enumerated in comments. Based on the description, they should be: (1) post governance proposal in forum, (2) Snapshot signaling vote (if applicable), (3) prepare Safe transaction with Tenderly simulation, (4) Signer A verifies and signs, (5) Signer B verifies and signs, (6) Signer C verifies and signs (or if 2-of-3, queue in timelock after threshold met). However, the timelock queuing and execution are separate steps that should be counted. The step count should be validated and enumerated.
- **Corrected Text:** Increase to `approvalSteps: 7` with detailed comments: (1) governance proposal posted in forum, (2) Snapshot signaling vote, (3) Safe transaction prepared with Tenderly simulation, (4) each signer verifies simulation output and signs (x3), (5) timelock queued after threshold met, (6) OFAC/sanctions screening of destination wallet, (7) timelock execution after delay period.
- **Source/Rationale:** DAO treasury disbursement workflow documentation from Aave, Compound, and Uniswap governance processes.

### Finding 14: `expirySeconds: 86400` (24 hours)

- **Location:** `treasury-governance.ts`, line 89
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:** `expirySeconds: 86400`
- **Problem:** 24 hours (86,400 seconds) is a reasonable simulation-compressed expiry for a DAO treasury approval window. However, the value lacks a comment explaining the rationale. In production DAO treasury operations, the effective approval window is typically the governance proposal execution deadline (often 72 hours to 14 days after vote passage), not a fixed 24-hour window. The 24-hour expiry in the simulation compresses this to create realistic approval pressure.
- **Corrected Text:** Add a comment explaining that 86,400 seconds (24 hours) is simulation-compressed and represents the real-world governance proposal execution deadline (typically 72 hours to 14 days after vote passage).
- **Source/Rationale:** OpenZeppelin TimelockController standard configurations use 24-hour to 72-hour delays. Governor contracts use 48-hour to 14-day voting and execution windows.

### Finding 15: `todayPolicies` expirySeconds: 30

- **Location:** `treasury-governance.ts`, line 138
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:** `expirySeconds: 30`
- **Problem:** The 30-second expiry in the today policy lacks a comment explaining the simulation compression rationale. Corrected reference scenarios include detailed comments explaining how short simulation expiries model the real-world effect of approval windows collapsing due to signer unavailability.
- **Corrected Text:** Add a comment explaining that the short expiry models the practical effect of the signing window collapsing when a signer is traveling: the coordinated timezone overlap is brief and expires quickly.
- **Source/Rationale:** Pattern established in corrected supplier-cert and warranty-chain scenarios.

### Finding 16: Thin actor descriptions

- **Location:** `treasury-governance.ts`, lines 18-78
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** DAO organization has no `description` field. Signer descriptions are 1 sentence each. Community Oversight description describes a problem, not the actor's function.
- **Problem:** Compared to corrected reference scenarios where every actor has a detailed multi-sentence description explaining their role, responsibilities, tools used, and organizational context, these descriptions are skeletal. The DAO organization should describe the DAO's governance structure, treasury size, and operational context. Each signer should describe their specific verification responsibilities, tools (Tenderly, Etherscan, Safe UI), and timezone. The delegation target should describe its mandate, spending authority, and scope restrictions.
- **Corrected Text:** See corrected TypeScript below for full actor descriptions.
- **Source/Rationale:** Description depth and quality established in corrected supplier-cert (10+ actors with multi-sentence descriptions) and warranty-chain (10+ actors with multi-sentence descriptions) scenarios.

### Finding 17: Missing edge from Timelock Contract in workflow

- **Location:** `treasury-governance.ts`, lines 97-105
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:** Edge `{ sourceId: "dao-org", targetId: "timelock-contract", type: "authority" }` exists, but no delegation edge from treasury-committee to timelock-contract.
- **Problem:** The workflow describes the Safe multisig approving a transaction that then enters the timelock queue. The authority edge from DAO to timelock-contract is correct (the DAO deploys and owns the timelock), but there should be a clear workflow connection from the treasury-committee to the timelock-contract. The current edge model does not reflect that the treasury-committee's approved transactions flow through the timelock. While this is an edge modeling question and not strictly a bug, the corrected version should ensure the edges clearly represent the operational flow.
- **Corrected Text:** Keep the existing authority edge but note in comments that the operational flow is: Treasury Committee -> Safe approval -> TimelockController -> execution.
- **Source/Rationale:** Standard OpenZeppelin TimelockController architecture: Governor or Safe holds PROPOSER_ROLE, TimelockController holds the actual execution authority.

### Finding 18: Narrative takeaway table has only 5 rows

- **Location:** `web3-scenarios.md`, lines 58-64
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** 5-row takeaway table covering: Coordination model, Signing ceremony, When a signer is traveling, Time to authorization, Audit trail.
- **Problem:** Corrected reference scenarios have 8-9 row takeaway tables with dimensions covering: delegation, escalation, regulatory compliance, cost impact, governance record specifics, and more. The current table misses: delegation mechanics, spending cap enforcement, regulatory compliance (OFAC screening, Travel Rule), cost of delay, escalation path, and governance proposal linkage.
- **Corrected Text:** See corrected narrative below for full 9-row takeaway table.
- **Source/Rationale:** Takeaway table depth established in corrected supplier-cert and warranty-chain narrative sections.

### Finding 19: Narrative lacks DAO-specific tooling references

- **Location:** `web3-scenarios.md`, lines 5-65
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Narrative mentions "Safe multisig", "Tenderly simulation", "Snapshot", but only in passing. No detailed discussion of Safe transaction builder, EIP-712 typed data signing, Zodiac Modules, or TimelockController interaction patterns.
- **Problem:** A DAO treasury governance scenario should reference the specific tooling that treasury committees use daily: Safe{Wallet} UI for transaction composition, Safe Transaction Builder for batch transactions, Tenderly for simulation verification, Snapshot for signaling votes, Tally for on-chain Governor votes, and Zodiac Roles Modifier for scoped permissions. The narrative reads as a generic description rather than a domain-specific scenario grounded in real-world tooling.
- **Corrected Text:** See corrected narrative below with specific tooling references throughout.
- **Source/Rationale:** DAO treasury operations use Safe{Wallet}, Tenderly, Snapshot, Tally, and Zodiac daily. These are not niche tools -- they are the standard operational stack.

### Finding 20: Narrative "Action" section inconsistency

- **Location:** `web3-scenarios.md`, line 18
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** `"Signer A initiates a $200K treasury disbursement. Requires 2-of-3 signatures from council signers before the Timelock Contract queues execution. Amount capped at $500K."`
- **Problem:** The Action section describes the "with Accumulate" policy (2-of-3) but this is in the scenario-level introduction, which should describe the overall scenario context, not the improved state. The Action should describe the general action (authorize a $200K disbursement) without specifying the threshold, since the threshold differs between today (3-of-3) and with Accumulate (2-of-3).
- **Corrected Text:** `"Signer A initiates a $200K treasury disbursement requiring multisig approval from council signers before the Timelock Contract queues execution."`
- **Source/Rationale:** The Today's Process and With Accumulate sections each define their own policy details. The Action section should be threshold-agnostic.

---

## 3. Missing Elements

1. **Missing `mandatoryApprovers`:** Treasury Lead should be mandatory for high-value disbursements. The Policy interface supports this.

2. **Missing `delegationConstraints`:** Delegation to sub-committee should be scoped by amount, recipient category, and proposal type. The Policy interface supports this.

3. **Missing `escalation`:** No escalation path when Treasury Committee cannot reach quorum. The Policy interface supports this.

4. **Missing `costPerHourDefault`:** No cost-per-hour estimate for delayed disbursements. The ScenarioTemplate interface supports this.

5. **Missing governance system actor:** No representation of the governance proposal/voting system (Snapshot, Governor, Tally) that authorizes Treasury Committee action.

6. **Missing OFAC/sanctions screening in workflow:** DAO treasury disbursements to service providers and grant recipients require OFAC SDN list screening. This is not represented in the actors, workflow, or regulatory context.

7. **Missing audit gap enumeration:** 4 audit gaps stated but not enumerated in comments.

8. **Missing approval step enumeration:** 6 approval steps stated but not enumerated in comments.

9. **Missing inline regulatory context:** Generic `REGULATORY_DB.web3` used instead of treasury-governance-specific regulatory entries.

10. **Missing detailed actor descriptions:** DAO organization, signers, and delegation target lack the detailed descriptions seen in corrected reference scenarios.

11. **Missing block-level comments:** Corrected reference scenarios include extensive block-level comments explaining policy rationale, metric derivation, simulation compression, and operational context. This scenario has almost no comments.

12. **Missing docstring comment block:** Corrected reference scenarios include a top-level JSDoc comment block explaining the scenario context, key governance controls modeled, and real-world references. This scenario has none.

---

## 4. Corrected Scenario

### Corrected TypeScript (`treasury-governance.ts`)

```typescript
import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * DAO Treasury Governance — Multisig Coordination, Spending Controls & On-Chain Audit Trail
 *
 * Models the DAO treasury disbursement workflow for a mid-to-large DAO ($50M-$500M
 * AUM) with a 3-member elected Treasury Committee operating a Safe (formerly Gnosis
 * Safe) multisig with a 48-hour TimelockController delay. The core governance
 * challenge is coordinating hardware wallet signing ceremonies across globally
 * distributed signers while maintaining a verifiable audit trail that links
 * governance approval (Snapshot/Governor vote) to Safe multisig execution to
 * timelock-delayed on-chain settlement.
 *
 * Key governance controls modeled:
 * - 2-of-3 threshold with Treasury Lead as mandatory approver (proposal
 *   drafting, Tenderly simulation review, and calldata verification cannot
 *   be bypassed)
 * - Delegation from Treasury Committee to Grants Sub-Committee for
 *   governance-approved grant disbursements under $50K
 * - Delegation constrained by amount, recipient type (grants only), and
 *   OFAC SDN screening clearance
 * - Escalation to Governance System (emergency governance vote) when
 *   Treasury Committee cannot reach quorum within the approval window
 * - TimelockController as a separate system actor enforcing the 48-hour
 *   delay between multisig approval and on-chain execution
 * - Governance System (Snapshot/Tally) as the prerequisite authorization
 *   layer that mandates the Treasury Committee to execute
 *
 * Real-world references: Safe{Wallet} UI, Safe Transaction Builder, Tenderly
 * simulation platform, Snapshot (off-chain signaling votes), Tally (on-chain
 * Governor frontend), OpenZeppelin TimelockController, Zodiac Roles Modifier,
 * Chainalysis / TRM Labs sanctions screening, EIP-712 typed data signing
 *
 * DAO treasury committee operational patterns referenced:
 *   Uniswap Foundation Treasury Committee, Aave Grants DAO, Arbitrum
 *   Foundation Operations, Optimism Collective Grants Council, ENS DAO
 *   Treasury Management, Compound Grants Program, Lido DAO Treasury
 */
export const treasuryGovernanceScenario: ScenarioTemplate = {
  id: "web3-treasury-governance",
  name: "DAO Treasury Governance",
  description:
    "A mid-to-large DAO ($50M-$500M AUM) Treasury Committee must approve a $200K grant disbursement through a Safe multisig with a 48-hour TimelockController delay. Three elected signers -- Treasury Lead, Security Signer, and Finance Signer -- are geographically distributed across UTC-5, UTC+1, and UTC+9. Each signer must independently verify the Tenderly simulation output, destination wallet OFAC screening, contract interaction risk, and spending cap conformance in the Safe{Wallet} UI before signing with their hardware wallet. Coordination across time zones delays approval by 24-72 hours when a signer is traveling. The audit trail is fragmented across the governance forum (proposal discussion), Snapshot (signaling vote), Safe{Wallet} UI (transaction signatures), Discord (signer coordination), and Tenderly (simulation results) -- no single system links the governance approval to the multisig execution to the timelock settlement.",
  icon: "CubeFocus",
  industryId: "web3",
  archetypeId: "key-ceremony",
  prompt:
    "What happens when a $200K DAO treasury disbursement requires Safe multisig approval but signers must independently verify Tenderly simulations, OFAC destination screening, and spending cap conformance across three time zones -- with the audit trail fragmented across governance forum, Snapshot, Safe UI, Discord, and Tenderly?",

  // costPerHourDefault: cost impact of a delayed DAO treasury disbursement.
  // Includes:
  // - Grant recipient project delay: funded engineering team unable to
  //   start or continue work ($5K-$20K/day for a 3-5 person team at
  //   market rates, or roughly $200-$800/hr)
  // - Service provider payment term violation: net-30 payment terms
  //   breached, relationship damage, potential late payment penalties
  // - DeFi yield opportunity cost: idle treasury assets not earning
  //   stablecoin yield (Aave, Compound, MakerDAO DSR at 3-5% APY on
  //   $200K = ~$16-$27/day, or ~$1/hr -- negligible at this scale)
  // - Contributor morale impact: contributors waiting for compensation
  //   may disengage or seek alternative funding
  // $200/hr is a conservative estimate dominated by grant recipient
  // project delay cost for a single $200K disbursement.
  costPerHourDefault: 200,

  actors: [
    // --- DAO Organization ---
    // The decentralized autonomous organization governing a protocol treasury.
    // Treasury size $50M-$500M across stablecoins (USDC, DAI), native tokens,
    // and protocol-owned liquidity. Governance structure includes token-weighted
    // voting (Snapshot/Governor), elected Treasury Committee (Safe multisig),
    // and delegated sub-committees (Grants Council, OpEx).
    {
      id: "dao-org",
      type: NodeType.Organization,
      label: "DAO",
      description:
        "Decentralized autonomous organization governing a $50M-$500M protocol treasury. Governance operates through token-weighted voting (Snapshot signaling + on-chain Governor), with treasury execution delegated to an elected Treasury Committee operating a Safe multisig. Treasury assets include stablecoins (USDC, DAI), native governance tokens, and protocol-owned liquidity positions.",
      parentId: null,
      organizationId: "dao-org",
      color: "#06B6D4",
    },

    // --- Treasury Committee ---
    // The elected 3-member body authorized by governance vote to execute
    // treasury disbursements via Safe multisig. The committee's spending
    // mandate, signer composition, and spending caps are defined by a
    // governance proposal and ratified by token holder vote. The committee
    // does not self-authorize -- it executes governance-approved spending.
    {
      id: "treasury-committee",
      type: NodeType.Department,
      label: "Treasury Committee",
      description:
        "Elected 3-member Treasury Committee authorized by governance vote to execute DAO treasury disbursements via Safe multisig with TimelockController. Manages grant program disbursements, service provider payments, contributor compensation, and treasury diversification operations. Spending mandate, signer composition, and per-transaction caps defined by ratified governance proposal. Does not self-authorize -- executes governance-approved spending only.",
      parentId: "dao-org",
      organizationId: "dao-org",
      color: "#06B6D4",
    },

    // --- Treasury Lead (Signer A) ---
    // The primary operational signer who drafts governance proposals,
    // prepares Safe transactions via the Transaction Builder, runs
    // Tenderly simulations, and coordinates signing ceremonies across
    // time zones. In most DAO treasury committees, the Treasury Lead
    // is the initiator and the coordinator -- they ensure the transaction
    // is correct before routing to other signers for verification.
    // Mandatory approver -- proposal drafting and simulation verification
    // cannot be bypassed.
    {
      id: "treasury-lead",
      type: NodeType.Role,
      label: "Treasury Lead",
      description:
        "Primary operational signer (UTC-5) who drafts governance proposals with risk justification, prepares Safe transactions via the Transaction Builder, runs Tenderly simulations to verify expected state changes, coordinates signing ceremonies across time zones via Discord/Telegram, and verifies destination wallet OFAC SDN screening results. Mandatory approver -- proposal drafting and simulation verification cannot be bypassed for any disbursement.",
      parentId: "treasury-committee",
      organizationId: "dao-org",
      color: "#94A3B8",
    },

    // --- Security Signer (Signer B) ---
    // The security-focused signer responsible for contract interaction
    // risk assessment: calldata verification (does the transaction do
    // what the proposal says it does?), destination wallet screening
    // (OFAC SDN list, Chainalysis/TRM Labs), proxy contract verification,
    // and reentrancy/delegate call risk assessment. Currently traveling
    // in UTC+9, creating the timezone coordination bottleneck.
    {
      id: "security-signer",
      type: NodeType.Role,
      label: "Security Signer",
      description:
        "Security-focused signer (UTC+9, currently traveling) responsible for contract interaction risk assessment: verifies transaction calldata against the governance proposal (byte-by-byte comparison in Safe UI), screens destination wallet against OFAC SDN list and Chainalysis/TRM Labs sanctions database, checks for proxy contract upgrade risk, and reviews delegatecall patterns in the transaction. Traveling signer creates the timezone coordination bottleneck that delays 24-72 hours.",
      parentId: "treasury-committee",
      organizationId: "dao-org",
      color: "#94A3B8",
    },

    // --- Finance Signer (Signer C) ---
    // The finance-focused signer responsible for spending cap conformance,
    // burn rate projection, budget adherence, and treasury exposure review.
    // Verifies that the disbursement amount is within the governance-approved
    // spending cap, checks the DAO's remaining budget for the current period,
    // and reviews previous disbursements to the same recipient.
    {
      id: "finance-signer",
      type: NodeType.Role,
      label: "Finance Signer",
      description:
        "Finance-focused signer (UTC+1) responsible for spending cap conformance: verifies disbursement amount against governance-approved per-transaction cap ($500K) and period budget, reviews burn rate projections and remaining treasury runway, checks previous disbursements to the same recipient for duplicate payment risk, and confirms token denomination and amount precision in the Safe UI before signing with hardware wallet.",
      parentId: "treasury-committee",
      organizationId: "dao-org",
      color: "#94A3B8",
    },

    // --- Governance System ---
    // The governance stack (Snapshot for off-chain signaling votes,
    // Tally/Governor for on-chain binding votes, governance forum for
    // proposal discussion) that authorizes the Treasury Committee to
    // execute treasury disbursements. A passed governance vote is a
    // prerequisite for Treasury Committee action -- the committee does
    // not self-authorize.
    {
      id: "governance-system",
      type: NodeType.System,
      label: "Governance System",
      description:
        "Governance stack authorizing Treasury Committee spending: governance forum (Commonwealth/Discourse) for proposal discussion, Snapshot for off-chain gasless signaling votes with token-weighted delegation, and Tally/Governor for on-chain binding votes. A passed governance vote is a prerequisite for Treasury Committee execution. Snapshot delegation is space-specific, has no built-in expiry, and is revocable only by the delegator.",
      parentId: "dao-org",
      organizationId: "dao-org",
      color: "#8B5CF6",
    },

    // --- Timelock Contract ---
    // OpenZeppelin TimelockController with a 48-hour delay. After the
    // Safe multisig reaches the approval threshold, the approved
    // transaction is schedule()'d in the timelock with the minDelay.
    // After 48 hours, any address with EXECUTOR_ROLE can execute()
    // the transaction. During the 48-hour window, addresses with
    // CANCELLER_ROLE can cancel the pending transaction (community
    // safety mechanism). The timelock is a non-improvable delay --
    // Accumulate cannot compress it because it is an on-chain
    // security mechanism.
    {
      id: "timelock-contract",
      type: NodeType.System,
      label: "Timelock Contract",
      description:
        "OpenZeppelin TimelockController with 48-hour minDelay. After Safe multisig approval, the transaction is schedule()'d in the timelock queue. After the 48-hour delay, any EXECUTOR_ROLE address can execute(). CANCELLER_ROLE holders (community veto) can cancel pending transactions during the delay window. The 48-hour delay is a non-improvable on-chain security mechanism -- Accumulate optimizes the pre-timelock coordination, not the timelock itself.",
      parentId: "dao-org",
      organizationId: "dao-org",
      color: "#8B5CF6",
    },

    // --- Grants Sub-Committee ---
    // Delegated sub-committee authorized by governance vote to execute
    // routine grant disbursements within defined parameters. Operates
    // a separate Safe multisig (2-of-3 or 3-of-5) with lower spending
    // caps. Delegation from Treasury Committee to Grants Sub-Committee
    // is constrained by amount ($50K max), recipient type (governance-
    // approved grant recipients only), and OFAC screening clearance.
    // This is NOT "Community Oversight" -- it is a spending authority
    // sub-committee with a defined mandate, not a veto/cancellation body.
    {
      id: "grants-subcommittee",
      type: NodeType.Department,
      label: "Grants Sub-Committee",
      description:
        "Delegated sub-committee authorized by governance vote to execute routine grant disbursements under $50K. Operates a separate Safe multisig (2-of-3) with lower spending caps and a narrower mandate than the Treasury Committee. Reviews grant applications, milestone deliverables, and recipient KYC/OFAC screening before approving disbursement. Cannot approve service provider payments, treasury diversification, protocol-owned liquidity operations, or disbursements above the delegation cap.",
      parentId: "dao-org",
      organizationId: "dao-org",
      color: "#06B6D4",
    },
  ],
  policies: [
    {
      id: "policy-treasury-governance",
      // Policy attached to the Treasury Committee, which owns the Safe
      // multisig and is the functional owner of the treasury disbursement
      // process. The TimelockController adds a 48-hour delay AFTER the
      // multisig approval threshold is met -- the timelock is downstream
      // of this policy.
      actorId: "treasury-committee",
      threshold: {
        // 2-of-3: Treasury Lead plus either Security Signer or Finance
        // Signer. This allows the Treasury Committee to execute when one
        // signer is traveling or unavailable, while still requiring
        // multi-party verification. The key improvement over the today
        // state (3-of-3 unanimous) is that a single unavailable signer
        // no longer blocks all treasury operations.
        k: 2,
        n: 3,
        approverRoleIds: ["treasury-lead", "security-signer", "finance-signer"],
      },
      // 86,400 seconds (24 hours) -- simulation-compressed representation
      // of the real-world governance proposal execution deadline. In
      // production DAOs, the execution window is typically 72 hours to
      // 14 days after governance vote passage. The 24-hour simulation
      // window creates realistic approval pressure while accommodating
      // timezone coordination across UTC-5, UTC+1, and UTC+9.
      expirySeconds: 86400,
      delegationAllowed: true,
      // Delegation: Treasury Committee delegates to Grants Sub-Committee
      // for routine grant disbursements within the sub-committee's mandate.
      // This models real-world DAO delegation patterns: Uniswap Foundation
      // -> Grants Council, Arbitrum DAO -> Grants and Incentives Committee,
      // Optimism Collective -> Grants Council.
      delegateToRoleId: "grants-subcommittee",
      // Treasury Lead is mandatory for all disbursements above the
      // sub-committee delegation threshold. The Treasury Lead is
      // responsible for proposal drafting, Tenderly simulation verification,
      // and calldata confirmation -- these functions cannot be bypassed.
      // In the 2-of-3 approval model, the Treasury Lead must always be
      // one of the two approvers.
      mandatoryApprovers: ["treasury-lead"],
      // Delegation scope constraints: the Grants Sub-Committee can only
      // execute governance-approved grant disbursements under $50K to
      // recipients who have passed OFAC SDN screening. All other treasury
      // operations require direct Treasury Committee multisig approval.
      delegationConstraints:
        "Delegation from Treasury Committee to Grants Sub-Committee is limited to governance-approved grant disbursements under $50K to recipients who have passed OFAC SDN screening and completed KYC verification. Service provider payments, contributor compensation above $10K, treasury diversification operations, protocol-owned liquidity management, and strategic treasury actions require direct Treasury Committee 2-of-3 multisig approval. Grants Sub-Committee cannot modify the Safe multisig configuration, add/remove signers, or change the TimelockController parameters.",
      escalation: {
        // Simulation-compressed: 20 seconds represents real-world
        // escalation after 12 hours of quorum failure. If the Treasury
        // Committee cannot reach the 2-of-3 threshold (e.g., two signers
        // traveling simultaneously), the system escalates to the
        // Governance System to trigger an emergency governance vote or
        // activate a backup signing procedure.
        afterSeconds: 20,
        toRoleIds: ["governance-system"],
      },
      constraints: {
        // $500K per-transaction cap as defined by governance vote.
        // Disbursements above $500K require a separate governance
        // proposal with enhanced community review (longer voting period,
        // higher quorum threshold).
        amountMax: 500000,
      },
    },
  ],
  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "dao-org", targetId: "treasury-committee", type: "authority" },
    { sourceId: "dao-org", targetId: "grants-subcommittee", type: "authority" },
    { sourceId: "dao-org", targetId: "governance-system", type: "authority" },
    { sourceId: "dao-org", targetId: "timelock-contract", type: "authority" },
    { sourceId: "treasury-committee", targetId: "treasury-lead", type: "authority" },
    { sourceId: "treasury-committee", targetId: "security-signer", type: "authority" },
    { sourceId: "treasury-committee", targetId: "finance-signer", type: "authority" },
    // --- Delegation edge (Treasury Committee -> Grants Sub-Committee) ---
    // Treasury Committee delegates routine grant disbursements to the
    // Grants Sub-Committee within delegation constraints (amount, recipient
    // type, OFAC screening).
    { sourceId: "treasury-committee", targetId: "grants-subcommittee", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Authorize $200K treasury disbursement through Safe multisig with TimelockController",
    initiatorRoleId: "treasury-lead",
    targetAction:
      "Release $200,000 Grant Disbursement from DAO Treasury via Safe Multisig Approval, OFAC Destination Screening, and 48-Hour TimelockController Execution",
    description:
      "Treasury Lead drafts a governance proposal with risk justification and budget conformance analysis. After governance vote passage (Snapshot signaling or on-chain Governor), Treasury Lead prepares the Safe transaction via the Transaction Builder with Tenderly simulation verification. Each signer independently verifies: (1) Tenderly simulation output matches expected state changes, (2) destination wallet clears OFAC SDN screening, (3) transaction calldata matches the governance proposal, (4) disbursement amount is within the $500K per-transaction cap and period budget. 2-of-3 threshold with Treasury Lead mandatory. After threshold met, transaction is schedule()'d in the 48-hour TimelockController. Audit trail links governance vote -> Safe signatures -> timelock execution in a single cryptographic proof chain.",
  },
  beforeMetrics: {
    // Wall-clock elapsed time from governance vote passage to Safe multisig
    // execution (excluding the 48-hour timelock delay, which is a fixed
    // non-improvable component). Active manual effort is approximately
    // 8-12 hours:
    //   - Treasury Lead: 3-4 hours (governance proposal drafting, Safe
    //     transaction preparation via Transaction Builder, Tenderly
    //     simulation, signer coordination via Discord)
    //   - Security Signer: 2-3 hours (calldata verification, OFAC
    //     destination screening via Chainalysis/TRM Labs, proxy contract
    //     review, hardware wallet signing)
    //   - Finance Signer: 2-3 hours (spending cap verification, budget
    //     conformance review, burn rate projection, hardware wallet signing)
    //   - Timelock interaction: 0.5-1 hour (schedule() transaction,
    //     monitoring during delay period, execute() transaction)
    // The 48-hour wall-clock figure represents the full elapsed time
    // including timezone coordination delays (24-72 hours) when the
    // Security Signer is traveling in UTC+9.
    manualTimeHours: 48,
    // 7 days of risk exposure represents the cumulative governance risk
    // window from governance vote passage to on-chain settlement:
    // (1) Governance approval staleness: market conditions may change
    //     between vote passage and execution, making the approved
    //     disbursement amount inadequate or excessive (e.g., token price
    //     volatility affecting USD-denominated grant amounts)
    // (2) Grant recipient project delays: funded teams cannot start or
    //     continue work, accumulating 5-7 days of engineering productivity
    //     loss
    // (3) Service provider payment term violations: net-30 terms breached,
    //     relationship damage with legal/audit/infrastructure providers
    // (4) Information asymmetry: community knows funds will be disbursed
    //     but timing is uncertain, creating speculation and governance
    //     fatigue
    // (5) DeFi yield opportunity cost: idle treasury stablecoins not
    //     earning DSR/Aave/Compound yield during the delay period
    riskExposureDays: 7,
    // Five audit gaps in the current fragmented process:
    // (1) Governance proposal discussion (forum) not linked to Safe
    //     transaction -- the forum thread references a proposal ID but
    //     there is no cryptographic binding between the governance vote
    //     result and the Safe transaction that executes it
    // (2) Tenderly simulation results not captured in the approval record
    //     -- signers review simulations in the Tenderly UI but the
    //     simulation output (expected state changes, gas estimates,
    //     token transfer events) is not attached to the Safe transaction
    //     as a verifiable artifact
    // (3) Signer coordination via Discord/Telegram with no audit trail
    //     -- timezone coordination, signing window negotiation, and
    //     availability confirmations happen in ephemeral chat messages
    //     that are not captured in any governance record
    // (4) Snapshot vote result not cryptographically linked to Safe
    //     execution -- the Snapshot vote is off-chain (IPFS-stored) and
    //     the Safe transaction is on-chain, with no system-enforced
    //     binding between the two
    // (5) OFAC/sanctions screening performed manually with no record
    //     linking the screening result to the specific disbursement --
    //     destination wallet screened in Chainalysis/TRM Labs but the
    //     screening result is not attached to the Safe transaction or
    //     governance record
    auditGapCount: 5,
    // Seven manual steps in the current treasury disbursement process:
    // (1) Treasury Lead drafts governance proposal in forum with risk
    //     justification, budget conformance, and recipient details
    // (2) Snapshot signaling vote (or on-chain Governor vote) with
    //     token-weighted voting and delegation
    // (3) Treasury Lead prepares Safe transaction via Transaction Builder
    //     with Tenderly simulation
    // (4) Treasury Lead verifies simulation output and signs with
    //     hardware wallet in Safe{Wallet} UI
    // (5) Security Signer independently verifies calldata, OFAC
    //     screening, and contract risk, then signs with hardware wallet
    // (6) Finance Signer verifies spending cap, budget conformance,
    //     and burn rate, then signs with hardware wallet
    // (7) After 2-of-3 (or 3-of-3 today) threshold met, transaction
    //     is schedule()'d in TimelockController and monitored for
    //     48 hours before execute()
    approvalSteps: 7,
  },
  todayFriction: {
    ...ARCHETYPES["key-ceremony"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Treasury Lead drafts governance proposal and posts in governance forum with risk justification. After Snapshot signaling vote passes, Treasury Lead prepares Safe transaction via Transaction Builder and runs Tenderly simulation. Coordinates signing window across UTC-5, UTC+1, and UTC+9 via Discord -- finding an overlapping window for 3-of-3 unanimous signing can take 12-24 hours.",
        // Simulation-compressed: represents 12-24 hours real-world elapsed
        // time for governance proposal, Snapshot vote, Safe transaction
        // preparation, Tenderly simulation, and timezone coordination
        delaySeconds: 15,
      },
      {
        trigger: "before-approval",
        description:
          "Finance Signer verifying disbursement in Safe{Wallet} UI: checking spending cap conformance ($500K per-transaction cap), reviewing burn rate projections and remaining period budget, confirming destination wallet address and token denomination, cross-referencing with governance proposal details, and signing EIP-712 typed data with hardware wallet retrieved from secure storage.",
        // Simulation-compressed: represents 2-4 hours real-world elapsed
        // time for thorough financial verification and hardware wallet
        // signing ceremony
        delaySeconds: 10,
      },
      {
        trigger: "on-unavailable",
        description:
          "Security Signer traveling in UTC+9 -- cannot access hardware wallet at a secure location. Team attempts to coordinate remote signing via video call with screen-share verification of Tenderly simulation output and OFAC screening results. The 3-of-3 unanimous requirement means the entire $200K disbursement is blocked until the Security Signer is available. Grant recipients and service providers waiting for payment. Narrow timezone overlap window collapses.",
        // Simulation-compressed: represents 24-72 hours real-world delay
        // when a signer is traveling and 3-of-3 unanimous approval is
        // required with no delegation or escalation path
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Governance forum proposal with Snapshot vote, Safe/Tenderly verification across three time zones, 3-of-3 unanimous hardware wallet signing ceremony, and fragmented audit trail across forum, Snapshot, Safe UI, Discord, and Tenderly",
  },
  todayPolicies: [
    {
      id: "policy-treasury-governance-today",
      // Today's policy: 3-of-3 unanimous approval with no delegation,
      // no escalation, and no mandatory approver differentiation. This
      // is the root cause of the bottleneck -- a single unavailable
      // signer blocks ALL treasury operations. The 3-of-3 threshold
      // is a known anti-pattern for production DAO treasuries; most
      // production committees use 3-of-5, 4-of-7, or 5-of-9 for
      // operational resilience.
      actorId: "treasury-committee",
      threshold: {
        // 3-of-3 unanimous: every signer must approve. A single
        // unavailable signer (traveling, sick, hardware wallet
        // inaccessible) blocks the entire treasury. This models the
        // "broken" state that Accumulate's threshold policy resolves.
        k: 3,
        n: 3,
        approverRoleIds: ["treasury-lead", "security-signer", "finance-signer"],
      },
      // Simulation-compressed: represents the practical effect of the
      // signing window collapsing when the Security Signer is traveling.
      // The coordinated timezone overlap (UTC-5, UTC+1, UTC+9) is a
      // narrow window that expires quickly when one signer is unavailable.
      // In real-world terms, this models the 24-72 hour delay when the
      // next available signing window cannot be found.
      expirySeconds: 30,
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to DAO treasury governance,
  // multisig coordination, and cross-border disbursement compliance.
  // The shared REGULATORY_DB["web3"] entries (MiCA Art. 68 for CASPs,
  // SEC Rule 206(4)-2 for investment advisers) are not directly
  // applicable to DAO treasury committee operations. The directly
  // applicable frameworks are:
  // - FATF Recommendation 16 (Travel Rule) for cross-border treasury
  //   disbursements to service providers and grant recipients
  // - OFAC sanctions compliance (SDN list screening) for destination
  //   wallet verification before any treasury disbursement
  // - MiCA Art. 67 (organizational requirements) for DAO-adjacent
  //   foundations operating in the EU
  // - IRS reporting obligations (1099-MISC/1099-NEC) for contributor
  //   and service provider payments exceeding $600
  regulatoryContext: [
    {
      framework: "FATF R.16",
      displayName: "FATF Recommendation 16 (Travel Rule)",
      clause: "Originator/Beneficiary Information for VA Transfers",
      violationDescription:
        "DAO treasury disbursement to a service provider or grant recipient exceeding $1,000 without obtaining, holding, and transmitting originator and beneficiary information as required by the Travel Rule. Treasury Committee executes Safe multisig transfer without verifying whether any party in the transaction chain qualifies as a VASP (Virtual Asset Service Provider) subject to Travel Rule obligations. Cross-border disbursements to contributors in multiple jurisdictions create Travel Rule exposure when the DAO or its foundation interacts with regulated intermediaries.",
      fineRange:
        "Regulatory enforcement action against VASP intermediaries; potential $25K-$1M per violation depending on jurisdiction; loss of banking relationships for DAO-adjacent foundation; deplatforming from centralized exchange counterparties used for fiat conversion",
      severity: "high",
      safeguardDescription:
        "Accumulate policy engine captures originator and beneficiary identity verification as a precondition for treasury disbursement approval. Cryptographic proof of Travel Rule compliance data (originator identity, beneficiary identity, transfer amount, purpose) satisfies FATF R.16 record-keeping requirements and provides evidence for regulatory examination.",
    },
    {
      framework: "OFAC",
      displayName: "OFAC SDN List / Sanctions Compliance",
      clause: "Specially Designated Nationals and Blocked Persons",
      violationDescription:
        "DAO treasury disbursement to a wallet address associated with OFAC-sanctioned entities (SDN list), sanctioned jurisdictions (Cuba, Iran, North Korea, Syria, Crimea/Donetsk/Luhansk), or sanctioned protocols (e.g., Tornado Cash-associated addresses). Treasury Committee approves Safe multisig transfer without screening the destination wallet against the SDN list and sanctioned address databases (Chainalysis, TRM Labs). Failure to screen creates strict liability exposure for US-nexus DAO participants and foundation entities.",
      fineRange:
        "Civil penalties up to $356,579 per violation (adjusted annually); criminal penalties up to $1M and 20 years imprisonment for willful violations (IEEPA); asset freezing; loss of all US banking and exchange relationships for DAO-adjacent foundation",
      severity: "critical",
      safeguardDescription:
        "Mandatory OFAC SDN screening of destination wallet integrated as a policy precondition before treasury disbursement approval is routed to signers. Cryptographic proof of screening result (clear/flagged) attached to the Safe transaction record. Flagged addresses automatically block the disbursement and trigger compliance review.",
    },
    {
      framework: "MiCA",
      displayName: "MiCA Art. 67 (EU Regulation 2023/1114)",
      clause: "Organisational Requirements for CASPs",
      violationDescription:
        "DAO-adjacent foundation operating in the EU fails to implement effective procedures for risk management, internal control mechanisms, and record-keeping for treasury operations as required by MiCA Art. 67. Treasury disbursement governance lacks documented multi-authorization procedures, audit trail, and risk assessment -- foundation cannot demonstrate organizational requirements compliance to EU national competent authority.",
      fineRange:
        "Up to EUR 5M or 3% of annual turnover for legal persons; up to EUR 700K for natural persons; potential withdrawal of CASP authorization; supervisory measures including public censure",
      severity: "high",
      safeguardDescription:
        "Accumulate provides documented multi-authorization governance with cryptographic proof of every treasury decision, satisfying MiCA Art. 67 requirements for internal control mechanisms, risk management procedures, and record-keeping. Complete audit trail supports EU national competent authority examination readiness.",
    },
    {
      framework: "IRS",
      displayName: "IRS 1099-MISC / 1099-NEC Reporting",
      clause: "Information Reporting for Non-Employee Compensation",
      violationDescription:
        "DAO treasury disbursements to US-based service providers, grant recipients, or contributors exceeding $600 in a tax year without issuing required IRS Form 1099-NEC (non-employee compensation) or 1099-MISC (other income). DAO-adjacent foundation or treasury committee fails to collect W-8/W-9 forms from recipients and file information returns, creating reporting obligation violations.",
      fineRange:
        "Civil penalties: $60 per return if filed within 30 days of due date, $120 per return if filed after 30 days but by August 1, $310 per return if filed after August 1 or not filed; intentional disregard penalty of $630 per return with no maximum; potential IRS audit and back-tax assessment",
      severity: "medium",
      safeguardDescription:
        "Treasury disbursement policy captures recipient identity verification and W-8/W-9 collection as preconditions for payment approval. Cryptographic proof of recipient tax documentation status attached to each disbursement record supports annual 1099 filing obligations.",
    },
  ],
  tags: [
    "web3",
    "dao",
    "treasury",
    "multisig",
    "key-ceremony",
    "safe",
    "timelock",
    "tenderly",
    "simulation",
    "spending-caps",
    "governance",
    "snapshot",
    "ofac",
    "travel-rule",
    "grants",
    "delegation",
    "fatf",
    "sanctions-screening",
  ],
};
```

### Corrected Narrative Journey (Markdown)

```markdown
## 1. DAO Treasury Governance

**Setting:** A mid-to-large DAO ($50M-$500M AUM) needs to authorize a $200K grant disbursement from its protocol treasury. The Treasury Committee has three elected signers -- Treasury Lead (UTC-5), Security Signer (UTC+9, currently traveling), and Finance Signer (UTC+1) -- operating a Safe multisig with a 48-hour TimelockController delay. The spend requires multisig approval before the Timelock Contract queues execution. A governance vote (Snapshot signaling or on-chain Governor) has already passed authorizing the disbursement, and the Treasury Committee must execute within the governance proposal's execution deadline.

**Players:**
- **DAO** (organization) -- $50M-$500M protocol treasury with token-weighted governance
  - Treasury Committee -- elected 3-member Safe multisig
    - Treasury Lead -- initiator, proposal drafter, Tenderly simulation (UTC-5). Mandatory approver.
    - Security Signer -- contract risk, calldata verification, OFAC screening (UTC+9, traveling)
    - Finance Signer -- spending caps, burn rate, budget conformance (UTC+1)
  - Grants Sub-Committee -- delegation target for routine grant disbursements under $50K
  - Governance System -- Snapshot/Tally voting, prerequisite authorization for Treasury Committee
  - Timelock Contract -- 48-hour OpenZeppelin TimelockController, non-improvable on-chain delay

**Action:** Treasury Lead initiates a $200K grant disbursement after governance vote passage. Requires multisig approval from committee signers before the Timelock Contract queues execution. Per-transaction cap of $500K defined by governance mandate.

---

### Today's Process

**Policy:** All 3 of 3 signers must approve (unanimous). No delegation. No escalation. Short coordination window.

1. **Governance proposal and Snapshot vote.** Treasury Lead drafts a governance proposal in the forum with risk justification and budget conformance analysis. A Snapshot signaling vote passes with token-weighted delegation. Treasury Lead then prepares the Safe transaction via the Transaction Builder, runs a Tenderly simulation to verify expected state changes, and begins coordinating a signing window across UTC-5, UTC+1, and UTC+9 via Discord. Finding an overlapping window for all three signers can take 12-24 hours. *(~15 sec delay)*

2. **Finance Signer verification.** Finance Signer retrieves their hardware wallet from secure storage and reviews the disbursement in the Safe{Wallet} UI: checking the $500K per-transaction spending cap, reviewing burn rate projections, confirming the destination wallet address and token denomination byte-by-byte, and cross-referencing against the governance proposal. Signs the EIP-712 typed data hash with hardware wallet. *(~10 sec delay)*

3. **Security Signer traveling.** Security Signer is in transit across UTC+9 and cannot access their hardware wallet at a secure location. The team attempts to coordinate a remote signing via video call with screen-share verification of the Tenderly simulation output and OFAC SDN screening results. The 3-of-3 unanimous requirement means the entire $200K disbursement is blocked until the Security Signer is available. *(~12 sec delay)*

4. **Signing window collapses.** The narrow timezone overlap closes. The $200K disbursement must wait for another coordinated window -- possibly 24-72 hours later. Grant recipients waiting for payment cannot start funded work. Service providers with net-30 payment terms approach deadline.

5. **Outcome:** 48+ hours of calendar coordination. Grant recipients and service providers waiting for payment. Audit trail fragmented across governance forum (proposal discussion), Snapshot (vote result on IPFS), Safe{Wallet} UI (transaction signatures), Discord (timezone coordination), and Tenderly (simulation results) with no cryptographic binding between them. OFAC screening of the destination wallet performed manually in Chainalysis/TRM Labs with no record linking the result to this specific disbursement.

**Metrics:** ~48 hours of coordination (excluding 48-hour timelock), 7 days of risk exposure, 5 audit gaps, 7 manual steps.

---

### With Accumulate

**Policy:** 2-of-3 threshold (Treasury Lead, Security Signer, Finance Signer). Treasury Lead is mandatory. Delegation to Grants Sub-Committee allowed for grant disbursements under $50K. Auto-escalation to Governance System after 12 hours of quorum failure. $500K per-transaction cap. 24-hour authority window.

1. **Request submitted.** Treasury Lead submits the $200K grant disbursement after governance vote passage. The policy engine validates the amount against the $500K constraint, confirms governance vote linkage, verifies OFAC SDN screening clearance for the destination wallet, and routes to all three signers with the Tenderly simulation output, OFAC screening result, and governance proposal reference attached to the approval request.

2. **Threshold met.** Treasury Lead and Finance Signer both approve within the same business day -- they are both awake in overlapping timezones (UTC-5 and UTC+1). The 2-of-3 threshold is met with the mandatory approver (Treasury Lead) present. Security Signer's travel across UTC+9 does not block the disbursement.

3. **Timelock queued.** The Timelock Contract receives the cryptographic approval proof -- linking the governance vote, signer approvals, OFAC screening clearance, and spending cap verification -- and schedule()'s the execution with the 48-hour delay. During the delay window, CANCELLER_ROLE holders can cancel if community concerns arise.

4. **If needed, delegation.** If the disbursement were a routine grant under $50K, the Grants Sub-Committee could execute directly under its delegated authority, subject to delegation constraints (governance-approved recipients, OFAC screening clearance, KYC verification).

5. **If needed, escalation.** If only one signer were available and the 2-of-3 threshold could not be met within 12 hours, the system would auto-escalate to the Governance System to trigger an emergency governance vote or activate a backup signing procedure.

6. **Outcome:** $200K grant disbursed and queued in the TimelockController within hours of governance vote passage. No timezone coordination needed for 2-of-3 threshold. Full cryptographic audit trail linking governance vote -> OFAC screening -> signer approvals -> timelock execution. Destination wallet screening result permanently attached to the disbursement record.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Approval threshold | 3-of-3 unanimous -- single unavailable signer blocks everything | 2-of-3 threshold with Treasury Lead mandatory |
| Coordination model | Discord + timezone juggling to find overlapping signing window | Async threshold-based approval across time zones |
| Signing ceremony | Physical hardware wallets, secure storage retrieval, video call verification | Policy-based cryptographic approval with hardware wallet signing decoupled from coordination |
| When a signer is traveling | Entire disbursement stalls 24-72 hours | Threshold met without them; delegation or escalation as backup |
| Delegation | None -- Treasury Committee is the only path | Grants Sub-Committee handles routine grants under $50K with scope constraints |
| Escalation | None -- treasury frozen when quorum fails | Auto-escalation to Governance System after 12-hour timeout |
| OFAC/sanctions screening | Manual Chainalysis/TRM Labs check, no record linkage | Automated screening as policy precondition, result attached to disbursement proof |
| Audit trail | Fragmented: forum, Snapshot, Safe UI, Discord, Tenderly | Unified cryptographic proof chain: governance vote -> screening -> approvals -> timelock |
| Time to authorization | ~48 hours (plus 48-hour timelock) | Hours (plus 48-hour timelock -- non-improvable) |

---
```

---

## 5. Credibility Risk Assessment

### Target Audience 1: Treasury Committee Lead at a Top-20 DAO

**Would challenge in ORIGINAL:**
- "Community Oversight" as a delegation target -- would immediately ask "What community body has treasury spending authority? This is not how delegation works in any DAO I've managed."
- 3-of-3 unanimous threshold as the "today" state without acknowledging this is a known anti-pattern -- would note that "No serious DAO treasury uses 3-of-3 in production. This is either a strawman or describes a very immature DAO."
- No mandatory approver -- would flag that "Every treasury committee I've served on requires the Treasury Lead to approve. You can't disburse $200K without the person who drafted the proposal and reviewed the simulation."
- No escalation path -- would ask "What happens when two signers are unavailable simultaneously? The treasury just freezes?"
- Generic signer labels (A, B, C) -- would note that "Real treasury signers have distinct competencies: proposal drafting, security review, financial review. These generic labels suggest the author has never served on a treasury committee."

**Would accept in CORRECTED:**
- Treasury Lead / Security Signer / Finance Signer role differentiation reflects real committee composition
- Grants Sub-Committee as delegation target follows established patterns (Uniswap, Arbitrum, Optimism)
- Mandatory Treasury Lead approval for all disbursements
- Escalation to governance system when quorum fails
- Delegation constraints scoped by amount, recipient type, and OFAC screening

### Target Audience 2: Safe (Gnosis Safe) Power User / DAO Operations Lead

**Would challenge in ORIGINAL:**
- No mention of Safe Transaction Builder, EIP-712 typed data signing, or Safe nonce management
- "Hardware wallet ceremony" described generically without referencing the actual Safe signing UX (review calldata in Safe{Wallet} UI, compare to Tenderly simulation, sign EIP-712 typed data hash)
- No distinction between Safe transaction approval (off-chain signature collection) and on-chain execution
- TimelockController interaction not modeled (schedule/execute flow)
- No mention of Safe Modules (Zodiac Roles Modifier, Allowance Module) that enable spending cap enforcement

**Would accept in CORRECTED:**
- Specific Safe{Wallet} UI references, Transaction Builder, EIP-712 typed data signing
- TimelockController schedule()/execute() flow explicitly described
- CANCELLER_ROLE during timelock delay window mentioned (community veto mechanism)
- Tenderly simulation verification as a distinct workflow step with specific artifacts (state changes, gas estimates, token transfer events)

### Target Audience 3: DeFi Governance Researcher

**Would challenge in ORIGINAL:**
- No representation of the governance proposal/voting system as a prerequisite for Treasury Committee action
- "Community Oversight" conflates community governance participation with operational spending authority
- No discussion of delegation mechanics: what is delegated, to whom, with what constraints
- Snapshot delegation characteristics (space-specific, no expiry, revocable only by delegator) not mentioned
- No distinction between off-chain governance (Snapshot) and on-chain governance (Governor) and how they interact with Safe execution

**Would accept in CORRECTED:**
- Governance System as a System actor representing the prerequisite authorization layer
- Clear separation between governance authorization (Snapshot/Governor vote) and operational execution (Safe multisig)
- Delegation constraints explicitly scoped by amount, recipient type, and screening requirements
- Snapshot characteristics referenced in the Governance System description

### Target Audience 4: On-Chain Governance Platform Engineer (Tally/Boardroom)

**Would challenge in ORIGINAL:**
- No representation of the Governor contract or voting mechanism
- TimelockController described generically without mentioning PROPOSER_ROLE, EXECUTOR_ROLE, CANCELLER_ROLE
- No mention of proposal lifecycle (Pending -> Active -> Succeeded -> Queued -> Executed)
- No discussion of how off-chain Snapshot votes bind to on-chain Safe execution (they don't -- there is a trust gap)

**Would accept in CORRECTED:**
- TimelockController with EXECUTOR_ROLE and CANCELLER_ROLE explicitly described
- Governance vote -> Safe execution -> timelock settlement flow explicitly modeled
- Audit gap #4 specifically identifies the Snapshot-to-Safe trust gap (off-chain IPFS vote vs. on-chain transaction with no cryptographic binding)
- Governance System actor described with both Snapshot and Tally/Governor capabilities

### Target Audience 5: Crypto-Regulatory Compliance Officer

**Would challenge in ORIGINAL:**
- MiCA Art. 68 applies to CASPs, not DAOs -- "This is not the correct MiCA article for DAO treasury governance. Art. 67 organizational requirements is more applicable for DAO-adjacent foundations."
- SEC Rule 206(4)-2 applies to investment advisers -- "A DAO treasury committee is not an investment adviser. This citation is irrelevant."
- No OFAC sanctions compliance -- "Any treasury disbursement compliance review MUST include SDN list screening. Its absence is a critical gap."
- No FATF Travel Rule -- "Cross-border disbursements to service providers and grant recipients trigger Travel Rule obligations. This is missing."
- No IRS reporting -- "DAO contributor payments above $600 require 1099 reporting. Not mentioned."

**Would accept in CORRECTED:**
- FATF Recommendation 16 correctly cited for cross-border VA transfer obligations
- OFAC SDN list screening as a critical compliance requirement with specific civil/criminal penalties
- MiCA Art. 67 (organizational requirements) correctly targeted for DAO-adjacent foundations instead of Art. 68 (asset safeguarding for CASPs)
- IRS 1099-MISC/1099-NEC reporting for contributor payments above $600
- Specific fine ranges and enforcement mechanisms cited for each framework
