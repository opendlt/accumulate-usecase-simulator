# SME Review: Delegated Voting Power (Scenario 23)

**Reviewer Profile:** Senior DAO Governance Architect, Delegation System Designer, On-Chain Voting Infrastructure Engineer, and Governance Delegation Operations Expert

**Scenario File:** `src/scenarios/web3/delegated-voting.ts`
**Narrative File:** `docs/scenario-journeys/web3-scenarios.md` (Section 4, lines 205-265)
**Review Date:** 2026-02-28

---

## 1. Executive Assessment

**Overall Credibility Score: D+**

This scenario is the weakest of the three web3 scenarios by a wide margin. While the corrected treasury-governance and emergency-pause scenarios demonstrate deep technical knowledge of Safe multisig operations, TimelockController mechanics, Forta/Defender monitoring infrastructure, and DORA/NIST compliance frameworks, the delegated-voting scenario reads like a first draft that was never brought to the same standard. It conflates ERC-20Votes on-chain delegation with Snapshot off-chain delegation, uses the wrong regulatory frameworks, omits virtually every advanced policy field that the corrected siblings demonstrate, and presents a narrative so thin that a governance delegate or delegation researcher would dismiss it as superficial within seconds.

The scenario's central premise -- delegating voting power with scope control and automatic expiry -- is sound and represents a genuine pain point in DAO governance. But the implementation fails to accurately model how delegation actually works in ERC-20Votes, Snapshot, Governor Bravo/OZ Governor, or any production delegation registry. The result is a scenario that would embarrass the product in front of any of the five target audiences.

### Top 3 Most Critical Issues

1. **REGULATORY_DB.web3 is entirely wrong for delegation governance (Severity: Critical).** MiCA Art. 68 is about CASP asset safeguarding (custody of client crypto-assets). SEC Rule 206(4)-2 is the Custody Rule (qualified custodian requirements for investment advisers). Neither has anything to do with governance delegation, voting proxy mechanics, or delegation scope control. The directly applicable frameworks are SEC Rule 206(4)-6 (proxy voting by investment advisers), MiCA Art. 67 (organisational requirements including governance procedures for CASPs managing governance tokens), and Howey Test implications of delegation concentration. Using `REGULATORY_DB.web3` imports two completely irrelevant regulatory entries and misrepresents the compliance landscape for delegation governance.

2. **Missing all advanced policy fields: mandatoryApprovers, delegationConstraints, escalation, constraints, costPerHourDefault (Severity: Critical).** This scenario is _about_ delegation, yet it has no `delegationConstraints` field. It has no `mandatoryApprovers` to make explicit that the Whale Holder is the only party who can authorize delegation. It has no `escalation` for when the Whale Holder is on vacation and cannot respond. It has no `constraints` for delegation scope or amount caps. It has no `costPerHourDefault` despite the fact that missed governance votes on treasury, risk parameters, or protocol upgrades can have economic impacts of $50-$500/hr or more for a whale holding a $10M+ position. Both corrected sibling scenarios (treasury-governance and emergency-pause) include all of these fields with detailed comments.

3. **Conflation of ERC-20Votes on-chain delegation and Snapshot off-chain delegation (Severity: Critical).** The description mentions "Snapshot delegation" but the actors include a "Delegation Registry" described as an "On-chain registry." The narrative says the whale needs a "wallet signature" but ERC-20Votes delegation requires a full on-chain transaction (`delegate(address delegatee)`), not a signature. Snapshot delegation is a signed message (EIP-712), not a transaction. The scenario conflates these fundamentally different mechanisms without acknowledging the distinction, which would immediately undermine credibility with any smart contract engineer or governance platform developer.

### Top 3 Strengths

1. **Correct archetype selection.** The `"delegated-authority"` archetype is the right choice for this scenario, and the archetype spread pattern (`...ARCHETYPES["delegated-authority"].defaultFriction`) is correctly applied.

2. **Import paths are correct.** The file uses `"../archetypes"` (subdirectory pattern) as required, and imports `NodeType` and `ScenarioTemplate` from the correct paths.

3. **The "before-vacation delegation" premise is a real governance pain point.** The scenario identifies a genuine problem: whale token holders who go on vacation and need to delegate voting power for a specific window. This is a well-known operational challenge in DAOs with concentrated governance power. The premise is strong -- the execution is where the problems lie.

---

## 2. Line-by-Line Findings

### Finding 1
- **Location:** `src/scenarios/web3/delegated-voting.ts`, line 4
- **Issue Type:** Inconsistency
- **Severity:** Critical
- **Current Text:** `import { REGULATORY_DB } from "@/lib/regulatory-data";`
- **Problem:** Both corrected sibling scenarios (treasury-governance.ts and emergency-pause.ts) use inline `regulatoryContext` arrays and do NOT import `REGULATORY_DB`. The inline approach allows each scenario to specify regulatory frameworks that are actually relevant to its domain. Importing `REGULATORY_DB` and using the generic `web3` entries forces two irrelevant regulatory frameworks (MiCA Art. 68 asset safeguarding and SEC Rule 206(4)-2 custody) into a delegation governance scenario.
- **Corrected Text:** Remove line 4 entirely. Replace `regulatoryContext: REGULATORY_DB.web3` with an inline `regulatoryContext` array containing delegation-specific regulatory frameworks.
- **Source/Rationale:** Corrected treasury-governance.ts (line 463) and emergency-pause.ts (line 418) both use inline regulatoryContext. The REGULATORY_DB.web3 entries are for asset safeguarding and custody, not governance delegation.

### Finding 2
- **Location:** `src/scenarios/web3/delegated-voting.ts`, line 128
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `regulatoryContext: REGULATORY_DB.web3,`
- **Problem:** `REGULATORY_DB.web3` resolves to MiCA Art. 68 (Asset Safeguarding) and SEC Rule 206(4)-2 (Custody Rule). MiCA Art. 68 governs how CASPs must safeguard client crypto-assets -- separate storage, no use without consent, adequate organizational arrangements. SEC Rule 206(4)-2 requires investment advisers to maintain client assets with qualified custodians. Neither has anything to do with governance delegation, voting power, proxy voting, or delegation scope control. The applicable frameworks for governance delegation are: (1) SEC Rule 206(4)-6 (proxy voting by investment advisers -- requires written policies and procedures for voting client securities, covers governance token delegation for advisers managing client crypto-assets), (2) MiCA Art. 67 (organisational requirements -- CASPs managing governance tokens on behalf of clients must have documented procedures for exercising governance rights, including delegation decisions), (3) Howey Test implications (delegation concentration where a small number of delegates control majority voting power may strengthen the SEC's argument that governance tokens are securities under the "efforts of others" prong).
- **Corrected Text:** Replace with inline regulatoryContext array containing SEC Rule 206(4)-6, MiCA Art. 67, and Howey Test/delegation concentration entries.
- **Source/Rationale:** SEC proxy voting guidance (17 CFR 275.206(4)-6), MiCA Regulation (EU) 2023/1114 Art. 67, SEC v. W.J. Howey Co. (328 U.S. 293) four-part test with delegation concentration analysis.

### Finding 3
- **Location:** `src/scenarios/web3/delegated-voting.ts`, lines 44-49 (governance-rep actor)
- **Issue Type:** Inconsistency
- **Severity:** High
- **Current Text:** `parentId: "dao-governance",` (for the governance-rep actor)
- **Problem:** The Governance Rep Role has `parentId: "dao-governance"` which places it directly under the Organization node, bypassing the Department layer. In the organizational hierarchy, Roles should be under Departments, not directly under the Organization. Both corrected sibling scenarios follow this pattern: treasury-governance.ts has all Roles under the "treasury-committee" Department, and emergency-pause.ts has all Roles under the "security-team" Department. The Governance Rep should be under a "Delegates" department or under the "token-holders" department, since the delegate is acting on behalf of token holders.
- **Corrected Text:** Either create a "delegates" Department and set `parentId: "delegates"`, or set `parentId: "token-holders"` to reflect that the delegate acts within the token holder governance structure.
- **Source/Rationale:** Corrected treasury-governance.ts places Roles under Departments (treasury-lead under treasury-committee). Corrected emergency-pause.ts places Roles under Departments (guardian under security-team).

### Finding 4
- **Location:** `src/scenarios/web3/delegated-voting.ts`, lines 71-83 (policy)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** The policy has no `mandatoryApprovers` field.
- **Problem:** The Whale Holder is the ONLY entity authorized to delegate their voting power. In ERC-20Votes, delegation requires the delegator to call `delegate(address delegatee)` from their own wallet -- no one else can delegate on their behalf. Making `mandatoryApprovers: ["whale-holder"]` explicit is critical because it communicates that delegation authorization cannot be bypassed or substituted. Both corrected sibling scenarios include mandatoryApprovers (treasury-governance.ts: `["treasury-lead"]`, emergency-pause.ts: `["guardian"]`).
- **Corrected Text:** Add `mandatoryApprovers: ["whale-holder"],` to the policy.
- **Source/Rationale:** ERC-20Votes `delegate(address delegatee)` function requires msg.sender to be the token holder. OpenZeppelin ERC20Votes.sol implementation.

### Finding 5
- **Location:** `src/scenarios/web3/delegated-voting.ts`, lines 71-83 (policy)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** The policy has no `delegationConstraints` field.
- **Problem:** This is a scenario entirely about delegation, and yet it lacks the `delegationConstraints` field that specifies what the delegate can and cannot do. This is the most glaring omission in the entire scenario. The constraints should specify: (1) voting scope (risk proposals only, or all proposal types?), (2) token amount (all 500K tokens or partial?), (3) time bound (7-day expiry), (4) re-delegation prohibition (delegate cannot re-delegate to a third party), (5) proposal types excluded (e.g., no protocol upgrade votes, no treasury votes above $X). Without delegation constraints, the scenario's "Scoped to Risk Proposals Only" target action (line 96) has no enforcement mechanism.
- **Corrected Text:** Add a detailed `delegationConstraints` string to the policy specifying scope, amount, time, re-delegation prohibition, and excluded proposal types.
- **Source/Rationale:** Corrected treasury-governance.ts line 263 and emergency-pause.ts line 244 both have detailed delegationConstraints strings. The defaultWorkflow targetAction (line 96) explicitly mentions "Scoped to Risk Proposals Only" but no constraint enforces this.

### Finding 6
- **Location:** `src/scenarios/web3/delegated-voting.ts`, lines 71-83 (policy)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** The policy has no `escalation` field.
- **Problem:** When the Whale Holder is on vacation (the scenario's central premise), there needs to be an escalation path for urgent governance votes that arrive during the delegation period. If the delegate encounters a proposal type outside their delegation scope, or if the delegation expires and the whale is still unreachable, escalation to a Governance Forum system or a backup delegation path is needed. Both corrected sibling scenarios include escalation (treasury-governance.ts: escalation to governance-system after 20 seconds, emergency-pause.ts: escalation to oncall-security-eng after 10 seconds).
- **Corrected Text:** Add `escalation: { afterSeconds: 15, toRoleIds: ["governance-forum"] }` (or equivalent).
- **Source/Rationale:** Corrected treasury-governance.ts line 264-273 and emergency-pause.ts line 246-256 both include escalation rules.

### Finding 7
- **Location:** `src/scenarios/web3/delegated-voting.ts`, lines 71-83 (policy)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** The policy has no `constraints` field.
- **Problem:** Delegation should have constraints: maximum delegation amount per delegate (to prevent excessive concentration risk), environment constraints, or per-proposal-type restrictions. A delegate accumulating >50% of active voting power from multiple delegators is a known governance attack vector (delegation concentration). The constraints field should enforce a maximum voting power delegation amount. Both corrected sibling scenarios include constraints (treasury-governance.ts: `amountMax: 500000`, emergency-pause.ts: `environment: "production"`).
- **Corrected Text:** Add `constraints: { amountMax: 500000 }` (or a contextually appropriate constraint).
- **Source/Rationale:** Corrected treasury-governance.ts line 274-280 and emergency-pause.ts line 261-263 both include constraints.

### Finding 8
- **Location:** `src/scenarios/web3/delegated-voting.ts` (entire file)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `costPerHourDefault` field.
- **Problem:** Missed governance votes have real economic impact. For a whale holding 500K tokens worth $1M-$50M, the cost of missed governance participation includes: (1) treasury proposals that affect funding allocation -- if a bad treasury proposal passes because the whale's 500K tokens did not vote against it, the loss could be $100K-$1M+; (2) risk parameter changes that affect protocol solvency -- voting against a dangerous parameter change could prevent liquidation cascades; (3) protocol upgrades that affect token economics -- voting on tokenomics changes affects the value of the whale's position. A conservative estimate of $100-$300/hr reflects the governance influence dilution and adverse outcome risk for a $10M+ token position. Both corrected sibling scenarios include costPerHourDefault (treasury-governance.ts: $200/hr, emergency-pause.ts: $2,000,000/hr).
- **Corrected Text:** Add `costPerHourDefault: 150,` with a detailed comment explaining the estimate.
- **Source/Rationale:** Corrected treasury-governance.ts line 52-66 and emergency-pause.ts line 66-78 both include costPerHourDefault with detailed justification comments.

### Finding 9
- **Location:** `src/scenarios/web3/delegated-voting.ts`, line 10
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `"Large token holders must delegate voting power securely. Today's Snapshot delegation persists indefinitely with limited scope control..."`
- **Problem:** The description conflates two delegation mechanisms. If this is about Snapshot delegation, then: Snapshot delegation is off-chain (signed message, not a transaction), space-specific, and since 2023 supports split delegation. If this is about ERC-20Votes on-chain delegation, then: delegation requires an on-chain `delegate()` call, is ALL-or-nothing (not partial), applies to ALL proposals (no scope control), and has no built-in expiry. The description says "Snapshot delegation" but then describes "on-chain" properties (Delegation Registry). The two are fundamentally different systems with different mechanics, and the scenario must be clear about which one it is modeling, or it must model both and distinguish between them.
- **Corrected Text:** The description should explicitly identify whether the scenario models ERC-20Votes on-chain delegation, Snapshot off-chain delegation, or both. If modeling ERC-20Votes: "ERC-20Votes delegation is ALL-or-nothing to a single delegate address with no scope control, no expiry, and no partial delegation. Self-delegation is required to vote directly." If modeling Snapshot: "Snapshot delegation persists indefinitely within a space, but supports split delegation since 2023."
- **Source/Rationale:** OpenZeppelin ERC20Votes.sol (delegate function), Snapshot delegation documentation (split delegation support since 2023).

### Finding 10
- **Location:** `src/scenarios/web3/delegated-voting.ts`, line 56 (delegation-registry description)
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `"On-chain registry — weak revocation mechanics and no automatic expiry on delegation records"`
- **Problem:** The term "Delegation Registry" is ambiguous. If referring to the Gnosis Delegation Registry, it is a general-purpose on-chain registry for registering delegation relationships -- it is not a voting-specific system. If referring to ERC-20Votes, there is no separate "Delegation Registry" -- delegation is built into the token contract itself. The description says "weak revocation mechanics" but in ERC-20Votes, revocation is not "weak" -- it is simply that there is no dedicated "revoke" function. The delegator must call `delegate()` to a new address (including self-delegation to revoke). This is a design choice, not a weakness. In Snapshot, revocation requires the delegator to sign a new delegation message. The scenario actor should clarify which specific system it represents.
- **Corrected Text:** Clarify what specific system the "Delegation Registry" represents. If ERC-20Votes: rename to "ERC-20Votes Token Contract" and describe the delegation checkpoint system. If a custom delegation registry: describe its specific mechanics.
- **Source/Rationale:** OpenZeppelin ERC20Votes.sol (delegation via token contract, not separate registry), Gnosis Delegation Registry (general-purpose, not voting-specific).

### Finding 11
- **Location:** `src/scenarios/web3/delegated-voting.ts`, line 104 (approvalSteps)
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `approvalSteps: 3,`
- **Problem:** The full delegation workflow involves far more than 3 steps: (1) delegation decision and scope definition, (2) delegate selection and vetting (review delegate track record, voting history, participation rate), (3) delegation scope negotiation with delegate, (4) delegation transaction execution (ERC-20Votes `delegate()` call or Snapshot delegation signed message), (5) delegation verification (confirm `getVotes(delegatee)` returns expected value), (6) delegate voting on behalf of holder (multiple proposals over 7 days), (7) delegation monitoring (verifying delegate votes align with holder intent), (8) delegation revocation/expiry (self-delegate or re-delegate at period end). Even a compressed view should count at least 5-6 steps. Both corrected sibling scenarios have higher step counts (treasury-governance: 7, emergency-pause: 4).
- **Corrected Text:** `approvalSteps: 6,` with enumerated comments explaining each step.
- **Source/Rationale:** Corrected treasury-governance.ts lines 366-382 enumerates 7 steps with detailed comments for each.

### Finding 12
- **Location:** `src/scenarios/web3/delegated-voting.ts`, line 103 (auditGapCount)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `auditGapCount: 5,`
- **Problem:** The 5 audit gaps are not enumerated in comments. Both corrected sibling scenarios enumerate every audit gap with detailed descriptions (treasury-governance.ts lines 343-364 enumerate 5 gaps, emergency-pause.ts lines 319-341 enumerate 7 gaps). Without enumeration, a reviewer cannot verify whether 5 is accurate. The actual audit gaps for delegation governance include: (1) no cryptographic proof linking delegation authorization to specific proposal votes, (2) no record of delegation scope agreement between delegator and delegate, (3) delegation revocation not recorded with timestamp and reason, (4) delegate voting rationale not linked to delegation authorization, (5) no verification that delegate voted within authorized scope, (6) no audit trail of delegation expiry enforcement, (7) delegation decision not linked to delegate vetting/due diligence record.
- **Corrected Text:** `auditGapCount: 7,` with enumerated comments explaining each gap.
- **Source/Rationale:** Corrected treasury-governance.ts lines 343-364 and emergency-pause.ts lines 319-341 both enumerate audit gaps with detailed comments.

### Finding 13
- **Location:** `src/scenarios/web3/delegated-voting.ts`, line 101 (manualTimeHours)
- **Issue Type:** Overstatement (potentially)
- **Severity:** Low
- **Current Text:** `manualTimeHours: 12,`
- **Problem:** 12 hours for a delegation that should take minutes (a single `delegate()` call or Snapshot signed message) is very high. However, the "today" process describes informal Telegram coordination with a whale on vacation with spotty internet, which could indeed take 12+ hours. The value is plausible for the broken "today" state but should be explicitly justified in comments to prevent confusion. The corrected sibling scenarios include detailed comments justifying their manualTimeHours values (treasury-governance.ts lines 306-323, emergency-pause.ts lines 288-304).
- **Corrected Text:** Keep `manualTimeHours: 12,` but add detailed comments explaining that this represents the broken "today" state where informal Telegram coordination with a vacationing whale creates a 12+ hour delay.
- **Source/Rationale:** Corrected treasury-governance.ts lines 306-323 provides a detailed breakdown of the 48-hour manual time estimate.

### Finding 14
- **Location:** `src/scenarios/web3/delegated-voting.ts`, line 102 (riskExposureDays)
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `riskExposureDays: 7,`
- **Problem:** The 7-day figure matches the delegation period, but actual risk exposure extends beyond 7 days due to: (1) stale delegation risk -- if ERC-20Votes delegation is used and no expiry mechanism exists, the delegation may persist indefinitely beyond the intended 7 days if the whale forgets to revoke; (2) scope creep risk -- during the 7 days, the delegate may vote on proposal types the whale did not intend to authorize; (3) delegation concentration risk -- if the delegate is accumulating voting power from multiple whales, the concentration risk persists as long as any delegation is active. The 7-day figure only captures the intended delegation period, not the cumulative risk including stale delegation and post-delegation residual risk. A more accurate figure would be 10-14 days to account for the revocation delay and residual risk.
- **Corrected Text:** `riskExposureDays: 10,` with detailed comments explaining that the 7-day delegation period is extended by stale delegation risk, delegation revocation delay, and post-delegation scope verification.
- **Source/Rationale:** ERC-20Votes has no expiry mechanism -- delegation persists until the delegator explicitly calls delegate() again. Stale delegation is a well-documented governance risk (Karma delegate dashboard tracks stale delegations).

### Finding 15
- **Location:** `src/scenarios/web3/delegated-voting.ts`, lines 108-113 (todayFriction manualSteps)
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `{ trigger: "after-request", description: "Snapshot delegation set with no scope limits...", delaySeconds: 6 }`
- **Problem:** The "after-request" step says "Snapshot delegation set" but the "today" process (narrative lines 220-235) describes the whale being on vacation and unable to provide a wallet signature. These are contradictory: if the delegation has already been set (as the friction step implies), then the whale does not need to be on vacation for it to be a problem -- the problem is scope control and expiry. If the whale is on vacation and the delegation has NOT been set (as the narrative implies), then the friction step should describe the failed attempt to coordinate delegation, not the aftermath of a successful delegation.
- **Corrected Text:** Align the friction steps with the narrative. If modeling the "delegation never happens because whale is on vacation" path: `{ trigger: "after-request", description: "Delegation request posted in governance forum -- whale on vacation, unreachable via Telegram, delegation cannot be executed without wallet signature from delegator", delaySeconds: 8 }`
- **Source/Rationale:** The narrative (lines 226-231) describes the whale being unreachable, not the delegation being successfully set.

### Finding 16
- **Location:** `src/scenarios/web3/delegated-voting.ts`, lines 46-48 (governance-rep description)
- **Issue Type:** Jargon Error
- **Severity:** Medium
- **Current Text:** `label: "Governance Rep"`
- **Problem:** "Governance Rep" is not a standard role title in DAO governance. Standard titles include: Governance Delegate, Protocol Delegate, Recognized Delegate (Maker, Aave, Optimism), Governance Steward (ENS), Delegate (generic). "Rep" suggests a representative in a legal or parliamentary sense, which is not how DAO delegation works. A delegate in DAO governance does not "represent" token holders in a fiduciary capacity -- they exercise delegated voting power according to their own governance philosophy (which they publish in a delegate statement). The distinction matters because "representative" implies a fiduciary relationship that does not exist in most DAO delegation frameworks.
- **Corrected Text:** Rename to "Governance Delegate" or "Protocol Delegate" -- the standard terminology used by Uniswap, Aave, Compound, Optimism, Arbitrum, and ENS.
- **Source/Rationale:** Uniswap Delegate Program, Aave Recognized Delegates, Optimism Delegate Commitment, ENS Governance Stewards. All use "delegate" not "rep."

### Finding 17
- **Location:** `src/scenarios/web3/delegated-voting.ts` (entire actors list)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No Governance Forum actor.
- **Problem:** The governance forum (Commonwealth, Discourse, Tally) where proposals are discussed, delegates publish voting rationale, and governance discussions happen is a critical system in the delegation workflow. The narrative (line 225) mentions "a governance forum thread" but no corresponding System actor exists. Both corrected sibling scenarios include System actors for infrastructure that plays a role in the workflow (treasury-governance.ts: Governance System, Timelock Contract; emergency-pause.ts: Monitoring System, Guardian Safe, Timelock). A Governance Forum system actor would provide transparency into how delegates exercise delegated authority.
- **Corrected Text:** Add a "governance-forum" System actor with description explaining its role in proposal discussion, delegate voting rationale publication, and delegation transparency.
- **Source/Rationale:** Corrected treasury-governance.ts includes "Governance System" (line 166-174). Corrected emergency-pause.ts includes "On-Chain Monitoring System" (line 153-161).

### Finding 18
- **Location:** `src/scenarios/web3/delegated-voting.ts`, line 80 (expirySeconds)
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** `expirySeconds: 604800,`
- **Problem:** 604,800 seconds = 7 days. This is the "with Accumulate" policy (the improved state), which correctly models a 7-day delegation window with automatic expiry. However, neither the value nor the design decision is documented in comments. Both corrected sibling scenarios include detailed comments explaining the expirySeconds value and its real-world mapping (treasury-governance.ts lines 237-243 explain the 86,400-second value, emergency-pause.ts lines 219-225 explain the 300-second value).
- **Corrected Text:** Add a comment: `// 604,800 seconds (7 days) -- delegation authority window matching the whale's vacation period. In ERC-20Votes, delegation has no built-in expiry, so this enforces a time bound that does not exist in the native mechanism.`
- **Source/Rationale:** Corrected treasury-governance.ts lines 237-243 and emergency-pause.ts lines 219-225 document expirySeconds with detailed justification.

### Finding 19
- **Location:** `src/scenarios/web3/delegated-voting.ts` (entire file)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No header comment block.
- **Problem:** Both corrected sibling scenarios include extensive header comment blocks explaining the scenario context, key governance controls modeled, real-world references, and operational patterns (treasury-governance.ts lines 5-40, emergency-pause.ts lines 5-54). The delegated-voting scenario has no header comment block at all.
- **Corrected Text:** Add a detailed header comment block covering: the delegation governance challenge, ERC-20Votes vs. Snapshot delegation mechanics, key governance controls modeled, delegation attack vectors considered, and real-world delegation program references.
- **Source/Rationale:** Corrected treasury-governance.ts lines 5-40 and emergency-pause.ts lines 5-54 demonstrate the expected header comment format.

### Finding 20
- **Location:** `src/scenarios/web3/delegated-voting.ts`, lines 115-127 (todayPolicies)
- **Issue Type:** Logic Error
- **Severity:** Medium
- **Current Text:** `delegationAllowed: false,` in todayPolicies
- **Problem:** The todayPolicies sets `delegationAllowed: false`, which correctly models the broken state where formal delegation is not possible. However, the `expirySeconds: 20` is unexplained. Both corrected sibling scenarios include comments explaining the compressed todayPolicies expiry (treasury-governance.ts lines 437-446, emergency-pause.ts lines 396-407). The 20-second expiry should be documented as representing the practical effect of the whale being unreachable on vacation -- the coordination window "expires" before the whale can respond.
- **Corrected Text:** Add a comment: `// Simulation-compressed: 20 seconds represents the practical effect of the whale being on vacation -- informal Telegram coordination "expires" when the whale cannot respond within the governance vote deadline.`
- **Source/Rationale:** Corrected treasury-governance.ts lines 437-446 and emergency-pause.ts lines 396-407 document todayPolicies expiry values.

### Finding 21
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, line 207
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `"A whale token holder in a DAO Governance system is going on vacation. Critical governance votes are scheduled during that period. They need to delegate their 500K tokens of voting power to a trusted Governance Rep."`
- **Problem:** "500K tokens of voting power" conflates token balance with voting power. In ERC-20Votes, a token holder's voting power is zero until they delegate (including self-delegation). The whale's 500K token balance only becomes 500K voting power if the whale has self-delegated. The correct phrasing is "delegate the voting power derived from their 500K token balance" or "delegate the 500K votes (from self-delegated token balance)." Additionally, "Governance Rep" should be "Governance Delegate" as discussed in Finding 16.
- **Corrected Text:** `"A whale token holder in a DAO governance protocol is going on vacation. Critical governance votes -- including risk parameter changes and treasury allocation proposals -- are scheduled during the absence. The whale needs to delegate the voting power derived from their 500K token balance to a trusted Governance Delegate before departure."`
- **Source/Rationale:** OpenZeppelin ERC20Votes.sol: tokens that are not delegated (including self-delegated) have zero voting power in Governor contracts.

### Finding 22
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 227-228
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `"The Governance Rep DMs the Whale Holder on Telegram trying to get a wallet signature."`
- **Problem:** "Wallet signature" is technically imprecise for ERC-20Votes delegation. ERC-20Votes delegation requires the delegator to submit a full on-chain transaction (`delegate(address delegatee)` -- paying gas, signed by the delegator's private key, submitted to the network). This is not a "signature" in the EIP-712 signed message sense. Snapshot delegation IS a signature (EIP-712 signed message, no gas, no on-chain transaction). The narrative uses "signature" which is accurate for Snapshot but inaccurate for ERC-20Votes, further conflating the two mechanisms.
- **Corrected Text:** If ERC-20Votes: "The Governance Delegate DMs the Whale Holder on Telegram trying to get them to submit an on-chain delegate() transaction from their wallet." If Snapshot: "The Governance Delegate DMs the Whale Holder on Telegram trying to get them to sign an EIP-712 delegation message for the Snapshot space."
- **Source/Rationale:** OpenZeppelin ERC20Votes.sol `delegate(address delegatee)` is an on-chain transaction, not a message signature. Snapshot delegation uses EIP-712 signed messages.

### Finding 23
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 243-244
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `"Before vacation, the Whale Holder submits a formal delegation via the Delegation Registry — 500K tokens to the Governance Rep for exactly 7 days."`
- **Problem:** "via the Delegation Registry" implies a specific system that accepts delegation submissions. If this is ERC-20Votes, delegation is done via the token contract itself (`token.delegate(delegateAddress)`), not a separate registry. If this is a custom delegation registry (Gnosis Delegation Registry, Agora Delegate Statement Registry), those registries do not natively support time-bound delegation -- 7-day expiry is not a feature of any production delegation registry as of 2025. The "Delegation Registry" as described (on-chain, with scope control and expiry) does not exist in production -- it is the aspirational Accumulate-enabled state, and should be presented as such.
- **Corrected Text:** `"Before vacation, the Whale Holder submits a formal delegation through the Accumulate policy engine -- 500K voting power delegated to the Governance Delegate, scoped to risk parameter proposals only, with automatic 7-day expiry enforced by the policy."`
- **Source/Rationale:** No production delegation registry supports time-bound, scoped delegation as described. ERC-20Votes has no expiry or scope. Snapshot has no expiry. Gnosis Delegation Registry has no scope or expiry enforcement.

### Finding 24
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 257-263 (Takeaway table)
- **Issue Type:** Understatement
- **Severity:** High
- **Current Text:** Only 5 rows in the takeaway comparison table.
- **Problem:** Both corrected sibling scenarios have 9 rows in their takeaway tables (treasury-governance: lines 61-71, emergency-pause: lines 128-138). The delegated-voting takeaway table has only 5 rows, missing critical comparison dimensions: (1) delegation mechanics (ERC-20Votes vs. scoped policy), (2) audit trail specifics (what is captured vs. not), (3) regulatory compliance (proxy voting guidance, MiCA Art. 67), (4) delegate accountability (voting rationale, participation tracking), (5) delegation concentration risk mitigation.
- **Corrected Text:** Expand to at least 8-9 rows covering: delegation mechanism, scope control, expiry, community trust/verification, delegate accountability, audit trail, regulatory compliance, delegation concentration risk, and re-delegation control.
- **Source/Rationale:** Corrected treasury-governance.ts narrative (lines 61-71) and emergency-pause.ts narrative (lines 128-138) both have 9-row comparison tables.

### Finding 25
- **Location:** `src/scenarios/web3/delegated-voting.ts`, lines 85-91 (edges)
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text:** `{ sourceId: "dao-governance", targetId: "governance-rep", type: "authority" },`
- **Problem:** The edge connects the Organization directly to the Governance Rep Role, bypassing the Department layer. If the Governance Rep is moved under a "delegates" department or under "token-holders," this edge should reflect the corrected hierarchy (e.g., `{ sourceId: "delegates-dept", targetId: "governance-delegate", type: "authority" }`).
- **Corrected Text:** Update edge to reflect corrected organizational hierarchy after fixing Finding 3.
- **Source/Rationale:** Corrected sibling scenarios have authority edges that follow the Department->Role hierarchy.

### Finding 26
- **Location:** `src/scenarios/web3/delegated-voting.ts`, line 96
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** `targetAction: "Delegate 500K Token Voting Power Scoped to Risk Proposals Only with 7-Day Expiry",`
- **Problem:** The targetAction claims delegation is "Scoped to Risk Proposals Only" but no `delegationConstraints` field enforces this scope restriction. The todayFriction description (line 109) says "delegate can vote on any proposal type including treasury and protocol upgrades," which describes the broken state. But the improved state's scope restriction has no policy-level enforcement. This is an aspirational claim with no mechanism -- it would be challenged by any smart contract engineer reviewing the scenario.
- **Corrected Text:** The targetAction claim is only valid if a corresponding `delegationConstraints` field is added to the policy that explicitly restricts the delegate to risk proposal votes only.
- **Source/Rationale:** The `delegationConstraints` field in Policy interface (policy.ts line 20) is the mechanism for enforcing scope. Without it, the targetAction is an unenforceable claim.

---

## 3. Missing Elements

1. **Delegation-specific regulatory frameworks.** The scenario needs inline `regulatoryContext` entries for: SEC Rule 206(4)-6 (proxy voting by investment advisers), MiCA Art. 67 (organisational requirements for governance token management), and Howey Test implications of delegation concentration. The current REGULATORY_DB.web3 entries (MiCA Art. 68 asset safeguarding, SEC 206(4)-2 custody) are completely irrelevant to governance delegation.

2. **Header comment block.** Both corrected sibling scenarios have extensive multi-paragraph header comments explaining context, governance controls, real-world references, and operational patterns. This scenario has none.

3. **Detailed comments throughout.** Both corrected sibling scenarios annotate every metric, policy field, actor, and edge with detailed comments. This scenario has zero comments.

4. **mandatoryApprovers field.** The Whale Holder must be mandatory -- delegation authorization cannot come from anyone else.

5. **delegationConstraints field.** The single most critical missing element given that the entire scenario is about delegation. Must specify: scope (risk proposals only), amount (500K tokens), time bound (7 days), re-delegation prohibition, and excluded proposal types.

6. **escalation field.** Escalation path when the delegate encounters out-of-scope proposals or when the delegation expires and the whale is still unreachable.

7. **constraints field.** Maximum delegation amount, environment restrictions, or other policy constraints.

8. **costPerHourDefault field.** Economic impact of missed governance votes for a $10M+ token position.

9. **Governance Forum / Proposal System actor.** The governance forum where proposals are discussed and delegates publish voting rationale is missing from the actor list despite being mentioned in the narrative.

10. **Delegate Accountability actor or mechanism.** No actor or system tracks delegate voting behavior, participation rate, or alignment with delegator intent. This is a core function of governance platforms like Karma, Agora, and Tally.

11. **ERC-20Votes vs. Snapshot distinction.** The scenario conflates the two without acknowledging that they are fundamentally different mechanisms with different properties (on-chain vs. off-chain, all-or-nothing vs. split delegation, transaction vs. signed message).

12. **Delegation attack vector discussion.** No mention of flash loan governance attacks (mitigated by checkpoint-based snapshots), delegation concentration risk, stale delegation, delegation market manipulation (Votium/Hidden Hand/Paladin), or cross-DAO delegation conflicts.

13. **Enumerated audit gaps in comments.** The `auditGapCount: 5` is not broken down. Both corrected sibling scenarios enumerate every gap.

14. **Enumerated approval steps in comments.** The `approvalSteps: 3` is not broken down. Both corrected sibling scenarios enumerate every step.

15. **Real-world delegation program references.** No mention of specific DAO delegation programs: Uniswap Delegation Program, Aave Recognized Delegates, Optimism Delegate Commitment, ENS Governance Stewards, Arbitrum Delegate Incentive Program, MakerDAO Recognized Delegates.

---

## 4. Corrected Scenario

### Corrected TypeScript (`delegated-voting.ts`)

```typescript
import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * Delegated Voting Power -- DAO Governance Delegation Mechanics,
 * Scope Control & On-Chain Delegation Infrastructure
 *
 * Models the governance delegation workflow for a whale token holder who
 * must delegate voting power before a planned absence. The core delegation
 * challenge is that ERC-20Votes delegation (the standard mechanism used by
 * Governor contracts) is ALL-or-nothing to a single delegate address with
 * no scope control, no automatic expiry, and no partial delegation -- the
 * delegator gives a standing blank check. Snapshot delegation (off-chain,
 * signed-message-based) adds space-specific delegation and split delegation
 * (since 2023) but also has no built-in expiry. Neither mechanism supports
 * scoped delegation (e.g., delegate for risk proposals only but not treasury
 * proposals).
 *
 * Key governance controls modeled:
 * - 1-of-1 threshold with Whale Holder as mandatory approver (only the
 *   token holder can authorize delegation of their voting power)
 * - Delegation from Whale Holder to Governance Delegate scoped to risk
 *   parameter proposals only -- treasury, protocol upgrades, and
 *   tokenomics proposals excluded from delegation scope
 * - Delegation constrained by scope (risk proposals only), token amount
 *   (500K tokens), time bound (7-day automatic expiry), and re-delegation
 *   prohibition (delegate cannot re-delegate to a third party)
 * - Escalation to Governance Forum when the delegate encounters an
 *   out-of-scope proposal requiring urgent whale input, or when the
 *   delegation expires and the whale remains unreachable
 * - Governance Forum as a transparency system where the delegate publishes
 *   voting rationale for each vote cast under delegated authority
 *
 * ERC-20Votes delegation mechanics (OpenZeppelin):
 * - Each token holder can delegate to exactly ONE address via delegate()
 * - Delegation is ALL-or-nothing: no partial delegation, no split delegation
 * - No built-in expiry: delegation persists until delegator calls delegate()
 *   again (self-delegate to revoke, or delegate to a new address)
 * - No scope control: delegate can vote on ANY proposal type
 * - Self-delegation required to vote directly (undelegated tokens have
 *   ZERO voting power in Governor contracts)
 * - Checkpoint-based: getVotes() returns voting power at a specific block,
 *   mitigating flash loan governance attacks
 *
 * Snapshot delegation mechanics:
 * - Space-specific: different delegates for different Snapshot spaces
 * - Signed message (EIP-712): no gas cost, no on-chain record
 * - Split delegation supported since 2023 (percentage-based)
 * - No built-in expiry, no scope control within a space
 *
 * Known delegation attack vectors considered:
 * - Delegation concentration: single delegate accumulating >50% of active
 *   voting power, creating governance single point of failure
 * - Stale delegation: delegators who set delegation once and never revisit,
 *   even when the delegate stops participating or changes philosophy
 * - Delegation capture: malicious delegates accumulating voting power for
 *   governance attacks (e.g., protocol parameter manipulation)
 * - Cross-DAO conflicts: delegate active in multiple DAOs facing conflicts
 *   of interest between protocols
 *
 * Real-world delegation program references:
 *   Uniswap Delegation Program, Aave Recognized Delegates, Optimism
 *   Delegate Commitment, ENS Governance Stewards, Arbitrum Delegate
 *   Incentive Program, MakerDAO Recognized Delegates, Compound
 *   Governance Delegates, Gitcoin Stewards Program
 */
export const delegatedVotingScenario: ScenarioTemplate = {
  id: "web3-delegated-voting",
  name: "Delegated Voting Power",
  description:
    "A whale token holder with 500K governance tokens ($10M+ position) must delegate voting power before a planned 7-day absence. Critical governance votes -- risk parameter changes, treasury allocation proposals, and protocol upgrade decisions -- are scheduled during the absence. Today's delegation mechanisms (ERC-20Votes on-chain and Snapshot off-chain) offer no scope control, no automatic expiry, and no audit trail linking delegate votes to delegator authorization. ERC-20Votes delegation is ALL-or-nothing to a single address with no built-in expiry -- the delegator gives a standing blank check. Snapshot delegation persists indefinitely within a space with no scope restriction. Revocation requires the delegator to actively call delegate() to a new address (ERC-20Votes) or sign a new delegation message (Snapshot) -- there is no expiry mechanism. Delegation becomes a standing blank check rather than scoped, time-limited authority. The audit trail is fragmented across governance forum (delegation announcement), Snapshot (off-chain votes), Etherscan (on-chain delegation transaction), and Telegram (informal coordination) with no system linking delegation authorization to delegate voting behavior.",
  icon: "CubeFocus",
  industryId: "web3",
  archetypeId: "delegated-authority",
  prompt:
    "What happens when a whale token holder delegates 500K tokens of voting power via ERC-20Votes or Snapshot with no scope control, no automatic expiry, no delegation constraints, and no audit trail linking delegate votes to delegator authorization -- and the delegation persists indefinitely as a standing blank check?",

  // costPerHourDefault: cost impact of missed governance votes for a whale
  // holding a $10M+ token position. Includes:
  // - Treasury proposals: adverse funding allocation decisions that pass
  //   without the whale's 500K votes opposing them ($50K-$500K impact
  //   per bad treasury proposal)
  // - Risk parameter changes: dangerous parameter changes (collateral
  //   ratio, liquidation threshold, borrowing cap) that pass without
  //   informed opposition, potentially causing liquidation cascades
  //   ($100K-$1M+ impact for protocol solvency events)
  // - Protocol upgrades: tokenomics changes, emissions schedule changes,
  //   or contract upgrades that affect the value of the whale's position
  //   ($10K-$100K impact per adverse upgrade)
  // - Governance influence dilution: whale's voting power not exercised
  //   means other delegates (who may have misaligned incentives) have
  //   proportionally more influence over governance outcomes
  // $150/hr is a conservative estimate dominated by the probability-
  // weighted cost of adverse governance outcomes for a $10M+ position
  // over a 7-day absence with 3-5 governance votes at stake.
  costPerHourDefault: 150,

  actors: [
    // --- DAO Governance (Organization) ---
    // The decentralized autonomous organization with token-weighted governance.
    // Governance operates through Snapshot signaling votes (off-chain) and
    // on-chain Governor/Governor Bravo votes (binding). Delegation is a core
    // governance primitive -- large token holders delegate to professional
    // delegates who vote on their behalf.
    {
      id: "dao-governance",
      type: NodeType.Organization,
      label: "DAO Governance",
      description:
        "Decentralized autonomous organization with token-weighted governance. Governance operates through Snapshot signaling votes (off-chain, gasless, space-specific delegation) and on-chain Governor/Governor Bravo votes (binding, ERC-20Votes delegation). Large token holders delegate to professional delegates who vote on 15-30 proposals per month. Delegation concentration risk: top 10 delegates typically control 50-80% of active voting power.",
      parentId: null,
      organizationId: "dao-governance",
      color: "#06B6D4",
    },

    // --- Token Holders (Department) ---
    // The token holder constituency that delegates voting power to
    // professional delegates. In most DAOs, 80-95% of governance tokens
    // do not vote directly -- holders either delegate or remain passive.
    // Active delegation is critical for governance quorum and legitimacy.
    {
      id: "token-holders",
      type: NodeType.Department,
      label: "Token Holders",
      description:
        "Large token holders ($1M+ positions) requiring secure delegation mechanisms with scope control, automatic expiry, and audit trail. Current ERC-20Votes delegation is ALL-or-nothing to a single address with no scope control, no expiry, and no partial delegation. Snapshot delegation persists indefinitely within a space with no scope restriction. 80-95% of governance tokens in most DAOs do not vote directly -- holders either delegate or remain passive.",
      parentId: "dao-governance",
      organizationId: "dao-governance",
      color: "#06B6D4",
    },

    // --- Whale Holder (Role) ---
    // The primary actor: a large token holder who must delegate before
    // a planned 7-day absence. Holds 500K governance tokens (a significant
    // voting bloc -- typically top-20 holder in a major DAO). Must
    // self-delegate to vote directly (ERC-20Votes requirement). The
    // delegation decision involves: selecting a trusted delegate, defining
    // scope, setting a time bound, and executing the delegation transaction
    // (or Snapshot signed message) before departure.
    {
      id: "whale-holder",
      type: NodeType.Role,
      label: "Whale Holder",
      description:
        "Large token holder with 500K governance tokens ($10M+ position) -- typically a top-20 holder. Going on a planned 7-day vacation with limited internet access. Must delegate voting power before departure to ensure critical governance votes (risk parameters, treasury allocation) are not missed. Currently self-delegated (ERC-20Votes) to vote directly. Mandatory approver -- only the token holder can authorize delegation of their own voting power via delegate() call or Snapshot signed message.",
      parentId: "token-holders",
      organizationId: "dao-governance",
      color: "#94A3B8",
    },

    // --- Delegates (Department) ---
    // Professional governance delegates who accept delegated voting power
    // from token holders. Delegates publish a delegate statement (governance
    // philosophy, expertise areas, voting principles) on the governance
    // forum and Agora/Karma delegate registry. Expected to vote on 15-30
    // proposals per month, publish voting rationale, and participate in
    // governance calls.
    {
      id: "delegates-dept",
      type: NodeType.Department,
      label: "Delegates",
      description:
        "Professional governance delegates registered in Agora/Karma delegate registry. Publish delegate statements (governance philosophy, expertise areas, voting principles). Expected to vote on 15-30 proposals per month, publish voting rationale for each vote, and participate in governance calls. Delegate participation rates tracked by Karma (typical active delegate votes on 70-90% of proposals).",
      parentId: "dao-governance",
      organizationId: "dao-governance",
      color: "#06B6D4",
    },

    // --- Governance Delegate (Role) ---
    // The trusted delegate who will receive the whale's 500K token voting
    // power for 7 days. In practice, this is a Recognized Delegate (Aave,
    // Optimism, MakerDAO) or professional delegate with a published track
    // record, delegate statement, and voting history available on Karma or
    // Agora dashboards.
    {
      id: "governance-delegate",
      type: NodeType.Role,
      label: "Governance Delegate",
      description:
        "Recognized Delegate with published delegate statement, voting history, and participation metrics on Karma/Agora dashboard. Receives the whale's 500K token voting power for a scoped 7-day delegation period. Expected to vote only on risk parameter proposals (within delegation scope), publish voting rationale for each vote cast under delegated authority, and refrain from re-delegating to third parties. Cannot vote on treasury allocation, protocol upgrades, or tokenomics proposals under this delegation.",
      parentId: "delegates-dept",
      organizationId: "dao-governance",
      color: "#94A3B8",
    },

    // --- Governance Forum (System) ---
    // The governance discussion platform (Commonwealth, Discourse, Tally)
    // where proposals are discussed, delegates publish voting rationale,
    // and delegation announcements are posted. Critical for delegation
    // transparency: the whale posts a delegation announcement, the delegate
    // publishes voting rationale for each vote, and the community can
    // verify delegation scope and compliance.
    {
      id: "governance-forum",
      type: NodeType.System,
      label: "Governance Forum",
      description:
        "Governance discussion platform (Commonwealth / Discourse / Tally) where proposals are discussed, delegates publish voting rationale, and delegation announcements are posted. Provides transparency into delegate voting behavior: each vote cast under delegated authority should reference the delegation authorization and include a voting rationale statement. Escalation target when delegate encounters out-of-scope proposals requiring delegator input.",
      parentId: "dao-governance",
      organizationId: "dao-governance",
      color: "#8B5CF6",
    },

    // --- Delegation Registry (System) ---
    // The on-chain or off-chain system that records delegation relationships.
    // In ERC-20Votes: delegation is recorded in the token contract via
    // checkpoints (no separate registry). In Snapshot: delegation is recorded
    // as a signed message (EIP-712) stored off-chain. Custom delegation
    // registries (Gnosis Delegation Registry, Agora) provide additional
    // metadata but do not enforce scope or expiry natively.
    {
      id: "delegation-registry",
      type: NodeType.System,
      label: "Delegation Registry",
      description:
        "On-chain delegation record system. In ERC-20Votes: delegation recorded in the token contract via checkpoints (getVotes() returns delegated voting power at a specific block). In Snapshot: delegation recorded as EIP-712 signed message stored off-chain. Neither mechanism supports scope control or automatic expiry natively -- Accumulate policy layer adds scope enforcement, time-bound expiry, and delegation constraint verification on top of the native mechanism.",
      parentId: "dao-governance",
      organizationId: "dao-governance",
      color: "#8B5CF6",
    },

    // --- Snapshot (System) ---
    // Off-chain voting system for gasless signaling votes. Delegation is
    // space-specific (different delegates for different Snapshot spaces),
    // supports split delegation since 2023 (percentage-based to multiple
    // delegates), and persists indefinitely with no built-in expiry.
    // Snapshot votes are stored on IPFS and are not on-chain binding --
    // they serve as signaling votes that inform on-chain Governor execution.
    {
      id: "snapshot-system",
      type: NodeType.System,
      label: "Snapshot",
      description:
        "Off-chain voting system for gasless signaling votes. Delegation is space-specific, supports split delegation since 2023 (percentage-based to multiple delegates), and persists indefinitely with no built-in expiry or scope control within a space. Votes stored on IPFS -- not on-chain binding. Delegation set via EIP-712 signed message (no gas cost, no on-chain record). Poor audit context: no system links delegation authorization to specific delegate voting behavior.",
      parentId: "dao-governance",
      organizationId: "dao-governance",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-delegated-voting",
      // Policy attached to Token Holders department, which owns the
      // delegation authorization process. The Whale Holder is the only
      // party who can authorize delegation of their voting power --
      // this is enforced by mandatoryApprovers.
      actorId: "token-holders",
      threshold: {
        // 1-of-1: Only the Whale Holder can authorize delegation of
        // their own voting power. In ERC-20Votes, delegation requires
        // the delegator to call delegate(address) from their own wallet.
        // No one else can delegate on their behalf (no meta-transactions
        // for delegate() in standard ERC-20Votes, though ERC-20Permit
        // + delegateBySig exists in some implementations).
        k: 1,
        n: 1,
        approverRoleIds: ["whale-holder"],
      },
      // 604,800 seconds (7 days) -- delegation authority window matching
      // the whale's planned 7-day vacation. In ERC-20Votes, delegation
      // has NO built-in expiry -- once set, it persists until the delegator
      // actively calls delegate() again. This 7-day expiry is an Accumulate
      // policy enforcement that does not exist in the native ERC-20Votes
      // mechanism. The automatic expiry eliminates stale delegation risk --
      // the most common delegation failure mode where delegators set
      // delegation once and never revoke even when the delegate stops
      // participating or changes governance philosophy.
      expirySeconds: 604800,
      delegationAllowed: true,
      // Delegation: Whale Holder delegates to Governance Delegate for
      // the scoped 7-day period. This models real-world delegation patterns
      // in Uniswap, Aave, Optimism, ENS, and MakerDAO where large holders
      // delegate to Recognized Delegates during absence periods.
      delegateToRoleId: "governance-delegate",
      // Whale Holder is mandatory for all delegation authorization. Only
      // the token holder can authorize delegation of their own voting power.
      // This enforces the fundamental ERC-20Votes principle that delegation
      // requires msg.sender == token holder.
      mandatoryApprovers: ["whale-holder"],
      // Delegation scope constraints: the Governance Delegate can ONLY vote
      // on risk parameter proposals (collateral ratio changes, liquidation
      // threshold adjustments, borrowing cap modifications, oracle
      // configuration updates). Treasury allocation proposals, protocol
      // upgrade proposals, tokenomics changes, and governance process
      // proposals are EXCLUDED from the delegation scope. The delegate
      // cannot re-delegate the whale's voting power to a third party.
      // If the delegate encounters an out-of-scope proposal that requires
      // the whale's vote, the delegate must escalate to the Governance
      // Forum for community coordination.
      delegationConstraints:
        "Delegation from Whale Holder to Governance Delegate is scoped to risk parameter proposals only (collateral ratio changes, liquidation threshold adjustments, borrowing cap modifications, oracle configuration updates). Treasury allocation proposals, protocol upgrade proposals, tokenomics changes, governance process proposals, and emergency proposals are EXCLUDED from delegation scope. Delegate CANNOT re-delegate the whale's voting power to any third party. Delegate MUST publish voting rationale on the Governance Forum for each vote cast under delegated authority. Delegation automatically expires after 7 days with no renewal -- whale must re-authorize if additional delegation is needed. Maximum delegation amount: 500,000 tokens (full balance of whale's self-delegated position).",
      escalation: {
        // Simulation-compressed: 15 seconds represents real-world
        // escalation after the delegate encounters an out-of-scope
        // proposal or when the delegation period expires and the whale
        // remains unreachable. Escalation routes to the Governance Forum
        // for community coordination -- the delegate posts a request for
        // guidance and the community can provide input on the urgency
        // of the out-of-scope vote.
        afterSeconds: 15,
        toRoleIds: ["governance-forum"],
      },
      constraints: {
        // 500,000 token maximum delegation amount. This prevents the
        // whale from delegating more tokens than they hold and creates
        // a documented cap on delegation concentration. In a DAO where
        // total active voting power is 5M-50M tokens, a 500K delegation
        // represents 1-10% of active voting power -- significant but
        // not concentrative enough to create a governance single point
        // of failure.
        amountMax: 500000,
      },
    },
  ],
  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "dao-governance", targetId: "token-holders", type: "authority" },
    { sourceId: "dao-governance", targetId: "delegates-dept", type: "authority" },
    { sourceId: "dao-governance", targetId: "governance-forum", type: "authority" },
    { sourceId: "dao-governance", targetId: "delegation-registry", type: "authority" },
    { sourceId: "dao-governance", targetId: "snapshot-system", type: "authority" },
    { sourceId: "token-holders", targetId: "whale-holder", type: "authority" },
    { sourceId: "delegates-dept", targetId: "governance-delegate", type: "authority" },
    // --- Delegation edge (Whale Holder -> Governance Delegate) ---
    // Whale Holder delegates voting power to the Governance Delegate
    // within delegation constraints (risk proposals only, 7-day expiry,
    // no re-delegation, voting rationale required).
    { sourceId: "whale-holder", targetId: "governance-delegate", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Delegate voting power with scope control, automatic expiry, and delegation audit trail",
    initiatorRoleId: "whale-holder",
    targetAction:
      "Delegate 500K Token Voting Power to Governance Delegate Scoped to Risk Parameter Proposals Only with 7-Day Automatic Expiry and Voting Rationale Requirement",
    description:
      "Whale Holder delegates 500K tokens of voting power to a Recognized Governance Delegate before a planned 7-day vacation. Delegation is scoped to risk parameter proposals only (collateral ratio, liquidation threshold, borrowing cap, oracle configuration). Treasury allocation, protocol upgrades, tokenomics changes, and governance process proposals are excluded. Delegate must publish voting rationale on the Governance Forum for each vote cast under delegated authority. Delegation automatically expires after 7 days -- no manual revocation needed. Re-delegation to third parties is prohibited. The delegation authorization, scope constraints, delegate identity, and expiry are captured in a cryptographic proof chain linking the whale's delegation decision to every vote the delegate casts. Today's process: informal Telegram coordination with a vacationing whale, ERC-20Votes ALL-or-nothing delegation with no scope or expiry, and no audit trail linking delegate votes to delegator authorization.",
  },
  beforeMetrics: {
    // Wall-clock elapsed time from delegation need identification to
    // delegation execution in the current broken process. Active manual
    // effort includes:
    //   - Whale Holder: 1-2 hours (deciding to delegate, selecting a
    //     delegate, reviewing delegate track record on Karma/Agora)
    //   - Coordination: 8-12 hours (reaching the whale on vacation via
    //     Telegram/Signal, explaining the delegation need, getting the
    //     whale to a location with internet and hardware wallet access)
    //   - Delegation execution: 15-30 minutes (ERC-20Votes delegate()
    //     call or Snapshot signed message, once the whale is available)
    //   - Verification: 15-30 minutes (confirming getVotes(delegate)
    //     reflects expected voting power on Etherscan/Tally)
    // The 12-hour figure represents the full elapsed time including the
    // coordination overhead of reaching a vacationing whale -- the
    // delegation transaction itself takes minutes, but the informal
    // coordination process dominates.
    manualTimeHours: 12,
    // 10 days of risk exposure represents the cumulative governance risk
    // window including:
    // (1) 7-day delegation period: delegate may vote on proposals the
    //     whale did not intend to authorize (no scope control in
    //     ERC-20Votes or Snapshot)
    // (2) Stale delegation risk (2-3 additional days): in ERC-20Votes,
    //     delegation persists until the whale actively calls delegate()
    //     to revoke -- if the whale returns from vacation and forgets to
    //     revoke, the delegation continues indefinitely. Stale delegation
    //     is the most common delegation failure mode.
    // (3) Post-delegation verification: after revocation, confirming
    //     that getVotes() for the delegate returns zero and the whale's
    //     self-delegation is restored takes additional time
    // (4) Delegation concentration: during the 7-day period, the delegate
    //     may hold voting power from multiple whales, creating a temporary
    //     concentration risk that persists as long as any delegation is
    //     active
    riskExposureDays: 10,
    // Seven audit gaps in the current delegation process:
    // (1) No cryptographic proof linking delegation authorization to
    //     specific proposal votes -- the delegate votes on Snapshot or
    //     on-chain Governor but there is no system-enforced binding
    //     between the delegation and the votes cast under it
    // (2) No record of delegation scope agreement -- the whale and
    //     delegate discuss scope informally on Telegram but no formal
    //     scope constraint is recorded
    // (3) Delegation revocation not recorded with timestamp and reason --
    //     the whale calls delegate() to self-delegate (revoking the
    //     delegation) but the revocation is just an on-chain transaction
    //     with no documented reason or verification
    // (4) Delegate voting rationale not linked to delegation authorization
    //     -- the delegate may post voting rationale on the forum but it is
    //     not cryptographically linked to the delegation record
    // (5) No verification that delegate voted within authorized scope --
    //     if the whale intended delegation for risk proposals only, there
    //     is no system that verifies the delegate only voted on risk
    //     proposals
    // (6) No audit trail of delegation expiry enforcement -- in
    //     ERC-20Votes there is no expiry, so there is no record of when
    //     the delegation should have ended vs. when it actually ended
    // (7) Delegation decision not linked to delegate vetting record --
    //     the whale's due diligence on the delegate (Karma score, voting
    //     history, participation rate) is not captured in the delegation
    //     record
    auditGapCount: 7,
    // Six manual steps in the current delegation process:
    // (1) Whale Holder identifies need to delegate before vacation and
    //     selects a trusted delegate (reviewing Karma/Agora dashboard,
    //     delegate statements, voting history)
    // (2) Whale Holder contacts delegate via Telegram/Discord to request
    //     acceptance and discuss scope (informal, no record)
    // (3) Whale Holder executes delegation transaction (ERC-20Votes
    //     delegate() call from wallet, or Snapshot EIP-712 signed message)
    // (4) Whale Holder or delegate verifies delegation on Etherscan/Tally
    //     (confirm getVotes(delegate) reflects expected voting power)
    // (5) Delegate votes on proposals during delegation period (multiple
    //     votes over 7 days, each requiring manual verification against
    //     informal scope agreement)
    // (6) Whale Holder returns from vacation and manually revokes
    //     delegation (self-delegate in ERC-20Votes, or sign new Snapshot
    //     delegation message)
    approvalSteps: 6,
  },
  todayFriction: {
    ...ARCHETYPES["delegated-authority"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Delegation need identified -- whale going on vacation, critical governance votes scheduled during absence. Whale posts in governance forum requesting delegation guidance. Delegate selection requires reviewing Karma/Agora dashboard for delegate participation rates, voting history, and delegate statements. Informal scope discussion with candidate delegate via Telegram. No formal scope agreement mechanism.",
        // Simulation-compressed: represents 2-4 hours real-world elapsed
        // time for delegate selection, vetting, and informal scope discussion
        delaySeconds: 8,
      },
      {
        trigger: "before-approval",
        description:
          "Whale Holder is on vacation with spotty internet access. Governance Delegate DMs the Whale on Telegram trying to get them to submit an on-chain delegate() transaction or sign a Snapshot EIP-712 delegation message. The whale cannot access their hardware wallet at a secure location. Multiple failed coordination attempts over hours.",
        // Simulation-compressed: represents 8-12 hours real-world elapsed
        // time for informal Telegram coordination with a vacationing whale
        delaySeconds: 10,
      },
      {
        trigger: "on-unavailable",
        description:
          "Whale Holder completely unreachable -- no internet access. Critical governance vote deadline approaching. Governance Delegate has no formal authority to vote. Either votes are missed entirely (whale's 500K tokens not represented) or delegate votes informally and community disputes legitimacy. ERC-20Votes delegation persists indefinitely if somehow set -- no automatic expiry, no scope control, no audit trail.",
        // Simulation-compressed: represents 12+ hours when the whale is
        // completely unreachable and votes are missed
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Informal Telegram coordination with vacationing whale, ERC-20Votes ALL-or-nothing delegation with no scope or expiry, and no audit trail linking delegate votes to delegator authorization",
  },
  todayPolicies: [
    {
      id: "policy-delegated-voting-today",
      // Today's policy: 1-of-1 from Whale Holder with no delegation
      // and no escalation. If the whale is on vacation and unreachable,
      // there is no formal mechanism for anyone else to exercise the
      // whale's voting power. The Governance Delegate cannot vote
      // without an on-chain delegation transaction from the whale's
      // wallet. This models the "broken" state where informal
      // coordination replaces formal delegation governance.
      actorId: "token-holders",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["whale-holder"],
      },
      // Simulation-compressed: 20 seconds represents the practical
      // effect of the whale being on vacation -- informal Telegram
      // coordination "expires" when the whale cannot respond within
      // the governance vote deadline. In real-world terms, a 7-day
      // Snapshot vote with a 3-day quorum window gives the whale
      // ~3 days to respond, but with spotty vacation internet and
      // hardware wallet inaccessibility, the effective window collapses.
      expirySeconds: 20,
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to governance delegation, proxy
  // voting obligations, and delegation concentration risk. The shared
  // REGULATORY_DB["web3"] entries (MiCA Art. 68 asset safeguarding,
  // SEC Rule 206(4)-2 custody) are NOT applicable to governance delegation.
  // The directly applicable frameworks are:
  // - SEC Rule 206(4)-6 (proxy voting by investment advisers) -- covers
  //   governance token delegation for advisers managing client crypto-assets
  // - MiCA Art. 67 (organisational requirements) -- CASPs managing
  //   governance tokens on behalf of clients must have documented
  //   procedures for exercising governance rights including delegation
  // - SEC Howey Test (delegation concentration analysis) -- concentrated
  //   delegation may strengthen "efforts of others" argument for
  //   governance tokens as securities
  regulatoryContext: [
    {
      framework: "SEC",
      displayName: "SEC Rule 206(4)-6 (Proxy Voting)",
      clause: "Proxy Voting by Investment Advisers",
      violationDescription:
        "Investment adviser managing client governance tokens delegates voting power to a third-party delegate without written proxy voting policies and procedures, without documenting the delegation decision rationale, and without disclosing the delegation arrangement to clients. The 'blank check delegation' problem -- delegating all voting power indefinitely with no scope control -- is analogous to giving a proxy holder unlimited voting authority with no instruction, which is heavily regulated under the Investment Advisers Act of 1940. Advisers who vote delegated governance tokens on behalf of clients have fiduciary duties requiring: (1) written policies and procedures for proxy voting, (2) disclosure of proxy voting policies to clients, (3) documentation of proxy voting decisions, and (4) availability of proxy voting records for SEC examination.",
      fineRange:
        "SEC enforcement action for breach of fiduciary duty; disgorgement of advisory fees; censure or suspension of adviser registration; civil penalties under Investment Advisers Act Section 203(i); potential criminal referral for willful violations",
      severity: "high",
      safeguardDescription:
        "Accumulate policy engine enforces documented delegation decision with scope constraints, time-bound expiry, and cryptographic proof of delegation authorization. Each vote cast under delegated authority is linked to the delegation record, satisfying SEC Rule 206(4)-6 requirements for proxy voting documentation and record-keeping. Delegation scope constraints and voting rationale requirements provide the 'specific instruction' equivalent that eliminates the blank-check delegation risk.",
    },
    {
      framework: "MiCA",
      displayName: "MiCA Art. 67 (EU Regulation 2023/1114)",
      clause: "Organisational Requirements -- Governance Token Management",
      violationDescription:
        "Crypto-Asset Service Provider (CASP) managing or custodying governance tokens on behalf of clients delegates voting power without documented procedures, without conflict of interest management, and without record-keeping of delegation decisions and vote execution as required by MiCA Art. 67. CASP cannot demonstrate to EU national competent authority that governance delegation decisions were made pursuant to established organizational procedures with client authorization and documented rationale.",
      fineRange:
        "Up to EUR 5M or 3% of annual turnover for CASPs; competent authority may impose additional conditions on authorization or withdraw authorization for material organisational deficiencies; supervisory measures including public censure",
      severity: "high",
      safeguardDescription:
        "Accumulate provides documented governance delegation procedures with cryptographic proof of: client authorization for delegation, delegate selection rationale, delegation scope constraints, voting behavior monitoring, and delegation expiry enforcement -- satisfying MiCA Art. 67 organisational requirements for CASPs managing governance tokens on behalf of clients.",
    },
    {
      framework: "SEC",
      displayName: "SEC Howey Test -- Delegation Concentration Analysis",
      clause: "Investment Contract Analysis (Efforts of Others)",
      violationDescription:
        "Governance token delegation concentrated among a small number of delegates (top 10 delegates controlling >50% of active voting power) strengthens the SEC's argument that token holders rely on the 'efforts of others' for governance outcomes -- satisfying the fourth prong of the Howey Test (SEC v. W.J. Howey Co., 328 U.S. 293). If a protocol's governance is effectively controlled by a small delegate oligarchy while the majority of token holders passively delegate or do not vote, the SEC may classify the governance token as an investment contract (security). Delegation without scope control or accountability exacerbates this concentration risk.",
      fineRange:
        "SEC enforcement action for unregistered securities offering; potential disgorgement of token sale proceeds; injunctive relief; civil penalties; criminal referral for willful violations of Securities Act Section 5",
      severity: "critical",
      safeguardDescription:
        "Accumulate delegation constraints include maximum delegation amount per delegate, preventing excessive concentration. Scope-limited delegation ensures delegates exercise authority only within defined boundaries rather than accumulating blanket governance control. Time-bound delegation with automatic expiry prevents permanent delegation accumulation. Delegation audit trail demonstrates active delegator participation in governance decisions (delegation scope selection, delegate vetting) rather than passive reliance on delegate efforts.",
    },
  ],
  tags: [
    "web3",
    "dao",
    "delegation",
    "voting",
    "governance",
    "snapshot",
    "erc20-votes",
    "scope-control",
    "revocation",
    "indefinite-delegation",
    "proxy-voting",
    "delegation-concentration",
    "stale-delegation",
    "howey-test",
    "delegate-accountability",
    "karma",
    "agora",
    "recognized-delegate",
  ],
};
```

### Corrected Narrative Journey (Markdown)

```markdown
## 4. Delegated Voting Power

**Setting:** A whale token holder in a DAO governance protocol holds 500K governance tokens ($10M+ position, typically a top-20 holder). The whale is going on a planned 7-day vacation with limited internet access and no hardware wallet. Critical governance votes -- including risk parameter changes (collateral ratio adjustment, liquidation threshold update) and a treasury allocation proposal -- are scheduled during the absence. The whale needs to delegate their voting power to a trusted Governance Delegate (a Recognized Delegate with a published track record on Karma/Agora) before departure. Current ERC-20Votes delegation is ALL-or-nothing to a single delegate address with no scope control, no automatic expiry, and no partial delegation. Snapshot delegation persists indefinitely within a space with no scope restriction. Neither mechanism links delegate voting behavior to delegator authorization.

**Players:**
- **DAO Governance** (organization) -- token-weighted governance via Snapshot (off-chain) and on-chain Governor
  - Token Holders -- large token holders requiring secure delegation
    - Whale Holder -- 500K tokens, going on vacation. Mandatory approver for delegation.
  - Delegates -- professional governance delegates registered in Agora/Karma
    - Governance Delegate -- Recognized Delegate with published track record and voting history
  - Governance Forum -- Commonwealth/Discourse/Tally, proposal discussion and delegation transparency
  - Delegation Registry -- on-chain delegation record (ERC-20Votes checkpoints / Snapshot EIP-712)
  - Snapshot -- off-chain voting system with space-specific delegation

**Action:** Whale Holder formally delegates 500K tokens of voting power to Governance Delegate, scoped to risk parameter proposals only (collateral ratio, liquidation threshold, borrowing cap, oracle configuration). Treasury allocation, protocol upgrades, tokenomics changes, and governance process proposals excluded. Automatic 7-day expiry. Re-delegation to third parties prohibited. Delegate must publish voting rationale on Governance Forum for each vote.

---

### Today's Process

**Policy:** 1-of-1 from Whale Holder. No formal delegation mechanism with scope or expiry. Short coordination window.

1. **Delegation need identified.** Whale Holder realizes critical governance votes are scheduled during their upcoming 7-day vacation. The whale reviews the governance calendar: a risk parameter change (collateral ratio adjustment from 130% to 145%), a treasury allocation proposal ($150K grant disbursement), and a protocol upgrade proposal (oracle migration) are all scheduled for Snapshot votes during the absence. The whale needs to delegate but ERC-20Votes delegation is ALL-or-nothing -- there is no way to delegate for risk proposals only while retaining authority for treasury and upgrade votes. *(~8 sec delay)*

2. **Whale is on vacation and unreachable.** The Governance Delegate DMs the Whale Holder on Telegram trying to get them to submit an on-chain `delegate()` transaction from their wallet. The whale is on a beach with spotty internet and no hardware wallet access. Multiple failed coordination attempts over hours. The whale cannot sign a transaction or an EIP-712 message without wallet access. If using ERC-20Votes: requires an on-chain transaction (gas + private key). If using Snapshot: requires an EIP-712 signed message (no gas but still needs wallet). *(~10 sec delay)*

3. **No formal delegation authority.** Without the Whale Holder's delegation transaction, the Governance Delegate has no formal authority to vote. The delegate cannot self-authorize delegation -- only the token holder can call `delegate(address)` in ERC-20Votes. Either the 500K votes are missed entirely (risk parameter change passes or fails without informed whale opposition/support), or the delegate votes informally on the forum and the community disputes the legitimacy. *(~12 sec delay)*

4. **Aftermath -- stale delegation risk.** If the whale somehow manages to set ERC-20Votes delegation before losing connectivity, the delegation persists indefinitely after the vacation ends. There is no automatic expiry in ERC-20Votes or Snapshot. The whale returns from vacation and forgets to revoke the delegation (by self-delegating). The delegate continues to hold 500K tokens of voting power weeks or months after the intended delegation period -- a stale delegation that represents a standing blank check with no scope control.

5. **Outcome:** Critical votes missed or disputed. No formal delegation record with scope or expiry. Audit trail is Telegram DMs (informal coordination), governance forum post (delegation announcement with no enforcement), and Etherscan (delegation transaction if it happened, but no scope or expiry metadata). Community cannot verify whether the delegate voted within the whale's intended scope. ERC-20Votes delegation persists indefinitely if set, creating ongoing stale delegation risk.

**Metrics:** ~12 hours of coordination, 10 days of risk exposure (7-day delegation + stale delegation risk), 7 audit gaps, 6 manual steps.

---

### With Accumulate

**Policy:** 1-of-1 from Whale Holder (mandatory). Formal delegation to Governance Delegate scoped to risk parameter proposals only. 7-day automatic expiry. Re-delegation prohibited. Escalation to Governance Forum for out-of-scope proposals. 500K token delegation cap.

1. **Pre-vacation delegation submitted.** Before departure, the Whale Holder submits a formal delegation through the Accumulate policy engine: 500K tokens of voting power delegated to the Governance Delegate, scoped to risk parameter proposals only (collateral ratio, liquidation threshold, borrowing cap, oracle configuration). Treasury allocation, protocol upgrades, tokenomics changes, and governance process proposals are explicitly excluded. Automatic 7-day expiry enforced by policy. Re-delegation to third parties prohibited.

2. **Delegation authority recorded with scope constraints.** The delegation is cryptographically recorded with: delegate identity (Governance Delegate's address and Karma/Agora profile reference), explicit scope (risk parameter proposals only), token amount (500K), expiry timestamp (7 days from delegation), re-delegation prohibition, and voting rationale requirement. The delegation record is linked to the whale's delegation decision and the delegate's acceptance.

3. **Governance Delegate votes within scope.** During the vacation, the Governance Delegate votes on the scheduled risk parameter change (collateral ratio 130% to 145%) with formally delegated authority. The delegate publishes voting rationale on the Governance Forum referencing the delegation proof. The treasury allocation proposal and protocol upgrade proposal are outside the delegation scope -- the delegate cannot vote on them under this delegation. The system enforces the scope constraint.

4. **Out-of-scope proposal handling.** An urgent treasury allocation amendment is proposed during the delegation period. The Governance Delegate cannot vote on it (outside scope). The system escalates to the Governance Forum where the community is notified that the whale's 500K votes will not be represented on this proposal. If the whale becomes reachable, they can submit a scope amendment.

5. **Automatic expiry.** After 7 days, the delegation automatically expires. The whale's voting power reverts to self-delegation. No manual revocation needed. No risk of stale delegation. No risk of the delegate continuing to exercise voting power beyond the intended period. The delegation record is closed with an expiry timestamp.

6. **Outcome:** Risk parameter votes cast on schedule with formally delegated authority. Treasury and upgrade proposals correctly excluded from delegation scope. Complete cryptographic audit trail: delegation authorization -> scope constraints -> delegate identity -> each vote with rationale -> automatic expiry. Community can verify that the delegate voted only within authorized scope. No stale delegation risk.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Delegation mechanism | ERC-20Votes ALL-or-nothing, no scope control, no expiry | Scoped delegation with risk-proposal-only constraint and 7-day auto-expiry |
| When whale is on vacation | Votes missed or disputed -- delegate has no formal authority | Governance Delegate votes with formal, scoped, time-bound authority |
| Scope control | None -- delegate can vote on ANY proposal type (risk, treasury, upgrades) | Explicit scope: risk parameter proposals only; treasury and upgrades excluded |
| Expiry | None -- ERC-20Votes delegation persists indefinitely until delegator revokes | Automatic 7-day expiry, no manual revocation needed |
| Stale delegation risk | High -- delegators forget to revoke, delegation persists months after intent | Eliminated -- automatic expiry closes delegation at configured time |
| Delegate accountability | None -- no system links delegate votes to delegation authorization | Voting rationale required for each vote, linked to delegation proof |
| Community trust | Disputed -- no verifiable proof of delegation scope or authorization | Cryptographic delegation proof verifiable by any community member |
| Audit trail | Telegram DMs, forum post, Etherscan tx -- no binding between them | Unified proof chain: authorization -> scope -> votes -> rationale -> expiry |
| Regulatory compliance | No proxy voting documentation, no delegation record-keeping | SEC Rule 206(4)-6 proxy voting documentation, MiCA Art. 67 governance procedures |
```

---

## 5. Credibility Risk Assessment

### Target Audience 1: Head of Governance at a Top-10 DAO

**Would challenge in ORIGINAL:**
- "Governance Rep" is not standard DAO governance terminology -- would immediately flag as written by someone unfamiliar with DAO delegation programs. The standard term is "Governance Delegate" or "Recognized Delegate."
- The thin narrative with only 5 takeaway rows would be dismissed as superficial compared to the detailed operational workflows described in the treasury-governance and emergency-pause scenarios.
- No mention of delegate vetting, delegate statements, Karma/Agora dashboards, or delegate participation rates -- all core operational concerns for anyone managing a delegation program.
- No discussion of delegation concentration risk, which is the #1 governance concern for delegation program managers.

**Would accept in CORRECTED:**
- Detailed delegation workflow with pre-vacation setup, scoped delegation, and automatic expiry matches real-world delegation program operations.
- Governance Delegate terminology is standard. Karma/Agora references are industry-standard delegate tracking infrastructure.
- 9-row takeaway table covers the dimensions that a Head of Governance would evaluate: scope control, stale delegation, delegate accountability, and regulatory compliance.
- Delegation concentration discussion in the regulatory context (Howey Test analysis) demonstrates awareness of the systemic risk.

### Target Audience 2: Smart Contract Engineer

**Would challenge in ORIGINAL:**
- Conflation of ERC-20Votes on-chain delegation and Snapshot off-chain delegation is a fundamental technical error. These are completely different mechanisms with different properties.
- "Wallet signature" for ERC-20Votes delegation is incorrect -- it is a full on-chain transaction, not a signature.
- "Delegation Registry" as described (on-chain, with scope control and expiry) does not exist in any production implementation. ERC-20Votes delegation is in the token contract, not a separate registry.
- No mention of `delegateBySig()` (ERC-20Permit-style meta-transaction for delegation) which is the correct mechanism for delegating without an on-chain transaction from the delegator's wallet.

**Would accept in CORRECTED:**
- Clear distinction between ERC-20Votes mechanics (on-chain, ALL-or-nothing, no expiry) and Snapshot mechanics (off-chain, EIP-712, split delegation since 2023).
- Actor descriptions accurately describe checkpoint-based voting power, `getVotes()` return values, and self-delegation requirements.
- Delegation Registry description accurately notes that neither ERC-20Votes nor Snapshot supports scope control or expiry natively, and that Accumulate adds a policy layer on top.
- Header comments reference specific Solidity contracts (ERC20Votes.sol), function signatures (`delegate(address delegatee)`), and EIPs (EIP-712).

### Target Audience 3: Governance Delegate with $10M+ Delegated Voting Power

**Would challenge in ORIGINAL:**
- The 3-step approval workflow does not reflect the actual complexity of accepting a delegation, voting on multiple proposals over 7 days, and managing delegation relationships.
- No mention of voting rationale publication, which is a core obligation for Recognized Delegates in every major DAO.
- No discussion of the delegate's experience: managing 15-30 proposals per month, publishing rationale for each vote, attending governance calls, and managing relationships with multiple delegators.
- The narrative implies the delegate is passive ("Governance Rep votes on scheduled proposals") without acknowledging the active due diligence and rationale publication work.

**Would accept in CORRECTED:**
- 6-step approval process accurately reflects the full delegation lifecycle: selection, vetting, execution, voting, monitoring, revocation.
- Voting rationale requirement in delegationConstraints matches real-world expectations for Recognized Delegates.
- Scope constraint (risk proposals only) reflects sophisticated delegation scope -- delegates often receive scope-specific delegations in practice (e.g., "I trust you on risk parameters but not treasury allocation").
- Karma/Agora references for delegate vetting demonstrate familiarity with the delegate ecosystem.

### Target Audience 4: Delegation Infrastructure Researcher

**Would challenge in ORIGINAL:**
- No mention of any delegation attack vector: flash loan governance attacks, delegation concentration, stale delegation, delegation market manipulation (Votium/Hidden Hand/Paladin), or cross-DAO conflicts.
- No discussion of ERC-20Votes limitations vs. emerging scoped delegation contracts.
- No mention of Snapshot split delegation (since 2023), which partially addresses the ALL-or-nothing problem.
- Regulatory context using MiCA Art. 68 (asset safeguarding) and SEC 206(4)-2 (custody) for a delegation scenario would be immediately flagged as wrong frameworks.

**Would accept in CORRECTED:**
- Header comments enumerate specific delegation attack vectors: concentration, stale delegation, capture, and cross-DAO conflicts.
- Regulatory context uses the correct frameworks: SEC Rule 206(4)-6 (proxy voting), MiCA Art. 67 (organisational requirements), Howey Test delegation concentration analysis.
- Delegation constraints address real research concerns: scope limitation, time-bound expiry, re-delegation prohibition, and delegation amount caps.
- Discussion of stale delegation risk (ERC-20Votes has no expiry) and its mitigation (automatic expiry policy) directly addresses published research findings.

### Target Audience 5: Governance Platform Engineer at Tally, Agora, or Boardroom

**Would challenge in ORIGINAL:**
- The "Delegation Registry" as an actor does not match any production system they have built. Tally reads from ERC-20Votes checkpoints. Agora maintains a delegate statement registry. Boardroom aggregates delegation data. None of them operate a "Delegation Registry" with scope control and expiry as described.
- No mention of the delegate dashboard (Karma, Tally, Agora) that tracks participation rates, voting history, and delegate reputation.
- The workflow does not match any platform's actual delegation UX -- Tally's delegation UX is "select delegate, confirm transaction." There is no scope selection, no expiry setting, no constraint configuration in any production platform.

**Would accept in CORRECTED:**
- Acknowledgment that Accumulate adds a policy layer on top of native ERC-20Votes/Snapshot delegation -- the scope control and expiry are policy-level enforcement, not native protocol features.
- References to Karma/Agora for delegate vetting reflect actual governance platform ecosystem.
- Delegation Registry description accurately notes that it records delegation relationships but does not natively enforce scope or expiry.
- The "with Accumulate" workflow is presented as an improvement over native platform capabilities, not a replacement -- this is the correct positioning for governance platform engineers who know the limitations of their own systems.
