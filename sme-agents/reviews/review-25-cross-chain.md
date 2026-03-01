# SME Review: Cross-Chain Bridge Governance (Scenario 25)

**Reviewer Profile:** Senior Cross-Chain Bridge Security Architect, Bridge Governance Council Member, Cross-Chain Messaging Protocol Engineer, Bridge Exploit Forensics Expert

**Files Reviewed:**
- `src/scenarios/web3/cross-chain.ts` (primary TypeScript scenario)
- `docs/scenario-journeys/web3-scenarios.md` Section 6 (narrative journey, lines 349-409)
- `src/lib/regulatory-data.ts` (shared regulatory database, web3 entries)
- `src/scenarios/archetypes.ts` (archetype definitions)
- `src/types/policy.ts` (Policy interface)
- `src/types/scenario.ts` (ScenarioTemplate interface)
- `src/types/organization.ts` (NodeType enum)
- `src/types/regulatory.ts` (ViolationSeverity type, RegulatoryContext interface)
- `src/scenarios/web3/treasury-governance.ts` (corrected reference scenario)
- `src/scenarios/web3/emergency-pause.ts` (corrected reference scenario)

---

## 1. Executive Assessment

**Overall Credibility Score: D+**

This scenario is the weakest of the Web3 scenario set by a significant margin. While the corrected treasury-governance and emergency-pause scenarios demonstrate deep domain expertise -- with detailed inline comments, enumerated audit gaps, real-world protocol references, bridge-specific regulatory context, and complete use of the Policy interface fields -- the cross-chain bridge governance scenario reads like a first-draft skeleton. It lacks the structural completeness (no `mandatoryApprovers`, no `delegationConstraints`, no `escalation`, no `constraints`, no `costPerHourDefault`), the domain depth (no bridge-specific regulatory context, no real-world bridge protocol references, no discussion of cross-chain parameter propagation mechanics), and the narrative richness (5-row takeaway table vs. 9 rows in corrected scenarios, no enumerated audit gaps, no real-world data) that the corrected reference scenarios establish as the expected quality standard.

A bridge security council member, a cross-chain messaging protocol engineer, or a bridge exploit forensics analyst would immediately identify this scenario as written by someone who has never operated a bridge governance process. The governance model described -- chain governors from "Chain A" and "Chain B" voting on a TVL cap increase alongside a "Bridge Council Member" -- does not match how any major bridge protocol (Wormhole, LayerZero, Axelar, Hyperlane, Connext, Stargate) actually manages parameter governance.

### Top 3 Most Critical Issues

1. **Missing: Bridge contract / escrow system actor and oracle / validator system actor** (Severity: Critical). The scenario describes a bridge TVL cap increase without modeling the bridge contract (where locked assets are held) or the oracle/validator system (which verifies cross-chain messages). These are the two most critical system components in a bridge architecture. Omitting them is like modeling a bank transfer without the bank account or the payment network. No bridge security council member would take this scenario seriously without these actors.

2. **`REGULATORY_DB.web3` import produces generic, non-bridge-specific regulatory context** (Severity: Critical). The imported entries are MiCA Art. 68 (asset safeguarding -- generic CASP language about "multi-sig authorization") and SEC Rule 206(4)-2 (custody rule for investment advisers). Neither is specific to cross-chain bridge governance. Missing entirely: FATF Travel Rule for cross-chain transfers, MiCA Art. 67 (organisational requirements for bridge operational governance), OFAC sanctions compliance for bridge operations (directly relevant after Tornado Cash sanctions and bridge-facilitated sanctions evasion). The corrected treasury-governance and emergency-pause scenarios both use inline `regulatoryContext` with scenario-specific entries -- this scenario should do the same.

3. **No `mandatoryApprovers`, `delegationConstraints`, `escalation`, `constraints`, or `costPerHourDefault`** (Severity: Critical). The Policy interface supports all five fields. Both corrected reference scenarios use all five. This scenario uses none. This means the bridge governance policy has: no designated risk authority who must always approve (bridge council member should be mandatory), no scope constraints on delegation (delegation could theoretically cover any bridge operation), no automated escalation path when governance stalls, no maximum TVL cap increase limit, and no economic cost estimate for governance delay. This is a structurally incomplete policy that would fail type-level comparison with the corrected scenarios.

### Top 3 Strengths

1. **Correct archetype selection.** `"cross-org-boundary"` is the right archetype for cross-chain bridge governance, which inherently involves coordination across multiple sovereign governance bodies. The archetype's `defaultFriction` (unavailabilityRate: 0.35, blockDelegation: true, blockEscalation: false) is appropriate for cross-organization governance coordination.

2. **Correct identification of the core governance problem.** The scenario correctly identifies that cross-chain bridge parameter governance creates a cross-organizational coordination problem where a single unavailable chain governor can stall the entire process. This is a real governance bottleneck in bridge protocols.

3. **Correct `todayPolicies` modeling.** The "today" state with 3-of-3 unanimous approval, short expiry (20 seconds simulation-compressed), and no delegation correctly models the rigid governance baseline that creates the governance stall problem. This sets up the improvement narrative effectively.

---

## 2. Line-by-Line Findings

### Finding 1
- **Location:** `src/scenarios/web3/cross-chain.ts`, line 4
- **Issue Type:** Inconsistency
- **Severity:** Critical
- **Current Text:** `import { REGULATORY_DB } from "@/lib/regulatory-data";`
- **Problem:** Both corrected reference scenarios (`treasury-governance.ts`, `emergency-pause.ts`) use inline `regulatoryContext` arrays and do NOT import `REGULATORY_DB`. The `REGULATORY_DB.web3` entries (MiCA Art. 68 generic CASP safeguarding, SEC Rule 206(4)-2 custody rule) are not bridge-governance-specific. Importing from the shared database means the scenario will display generic "Treasury action without verified multi-sig authorization" language for a scenario about cross-chain bridge TVL cap governance -- completely wrong context.
- **Corrected Text:** Remove the import entirely. Replace `regulatoryContext: REGULATORY_DB.web3` (line 137) with an inline array containing bridge-specific regulatory entries (FATF Travel Rule for cross-chain transfers, MiCA Art. 68 bridge-specific asset safeguarding, MiCA Art. 67 organisational requirements, OFAC sanctions compliance for bridge transfers).
- **Source/Rationale:** Corrected scenarios `treasury-governance.ts` (line 463-512) and `emergency-pause.ts` (line 418-455) both use inline `regulatoryContext` with scenario-specific entries. The agent brief explicitly instructs: "Must use inline regulatoryContext array (do NOT import or reference REGULATORY_DB)."

### Finding 2
- **Location:** `src/scenarios/web3/cross-chain.ts`, line 137
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `regulatoryContext: REGULATORY_DB.web3,`
- **Problem:** `REGULATORY_DB.web3` contains two entries: (1) MiCA Art. 68 "Asset Safeguarding" with violation description "Treasury action without verified multi-sig authorization" -- this is about CASP custody, not bridge TVL cap governance; (2) SEC Rule 206(4)-2 "Custody Rule" with violation description "Digital asset custody action without qualified custodian verification" -- this applies to SEC-registered investment advisers, not bridge protocols. Neither entry addresses the regulatory frameworks most relevant to cross-chain bridge governance: FATF Recommendation 16 (Travel Rule) for cross-chain asset transfers, OFAC sanctions compliance for bridge-facilitated transfers (directly relevant post-Tornado Cash), MiCA Art. 67 (organisational requirements for bridge operational governance), or MiCA Art. 68 with bridge-specific language (safeguarding assets held in bridge escrow contracts, not generic "multi-sig authorization").
- **Corrected Text:** Replace with inline `regulatoryContext` array containing 3-4 bridge-specific entries. See Corrected Scenario section.
- **Source/Rationale:** FATF Updated Guidance for Virtual Assets (October 2021) explicitly covers cross-chain transfers as virtual asset transfers subject to Travel Rule. OFAC Tornado Cash designation (August 2022) established precedent for sanctions compliance obligations on cross-chain transfer protocols. MiCA Art. 67 and Art. 68 are both applicable to bridge protocol foundations operating as CASPs in the EU.

### Finding 3
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 81-93 (policy)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** Policy object with only `id`, `actorId`, `threshold`, `expirySeconds`, `delegationAllowed`, `delegateToRoleId`. No `mandatoryApprovers`, `delegationConstraints`, `escalation`, or `constraints`.
- **Problem:** The Policy interface (`src/types/policy.ts`) defines `mandatoryApprovers`, `delegationConstraints`, `escalation`, and `constraints` as optional fields. Both corrected reference scenarios use all of them with detailed documentation. This scenario uses none. For bridge governance specifically: (1) the Bridge Council Member should be a mandatory approver because they are responsible for the risk assessment that justifies the TVL cap increase -- a chain governor alone should not authorize a cap increase without bridge-team risk assessment; (2) delegation constraints should limit what can be delegated (TVL cap increases within a pre-approved range, not validator set rotations or bridge contract upgrades); (3) escalation should route to an emergency bridge multisig when governance stalls during capacity-critical periods; (4) constraints should cap the maximum TVL increase per governance cycle (e.g., 2x maximum -- doubling the cap doubles the maximum potential loss in an exploit).
- **Corrected Text:** See Corrected Scenario section for complete policy object with all fields.
- **Source/Rationale:** Wormhole governance limits the magnitude of guardian set changes per governance cycle. Axelar has rate-limited parameter change mechanics. All major bridges implement operational constraints on parameter changes to prevent governance capture.

### Finding 4
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 91-92
- **Issue Type:** Logic Error
- **Severity:** High
- **Current Text:** `delegationAllowed: true, delegateToRoleId: "chain-a-governor",`
- **Problem:** Delegating from the bridge council member to Chain A's governor creates an asymmetric governance structure that biases toward Chain A. If the bridge council member delegates to Chain A's governor, then Chain A effectively gets two votes (the governor's own vote plus the delegated bridge council vote), while Chain B's governor has only one. In production bridge governance, delegation would flow to an automated parameter system (bridge relayer, parameter multisig) or an emergency bridge operations multisig -- not to a single chain's representative. This delegation direction would be immediately challenged by Chain B's governance body as creating unfair representation.
- **Corrected Text:** `delegateToRoleId: "bridge-operations-multisig"` or, if maintaining the existing actor set, delegation should be to a neutral system actor (e.g., the relayer system for parameter propagation within pre-approved bounds), with explicit constraints preventing the delegate from making risk-increasing changes without bridge council approval.
- **Source/Rationale:** Wormhole governance does not delegate guardian authority to individual chain representatives. LayerZero DVN governance treats all supported chains equally. Axelar validator governance does not give preferential delegation to any single chain.

### Finding 5
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 100-101
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Only one edge for delegation: `{ sourceId: "bridge-council-member", targetId: "chain-a-governor", type: "delegation" }`
- **Problem:** The delegation edge goes from bridge-council-member to chain-a-governor, which as noted in Finding 4 is semantically questionable. Additionally, there is no edge connecting the relayer system to the chain governance bodies, even though the relayer is what propagates parameter changes across chains. The edge graph should model the full authority and delegation flow including the system actors.
- **Corrected Text:** See Corrected Scenario section for complete edge set.
- **Source/Rationale:** Bridge parameter propagation requires the relayer system to have authority relationships with both chain governance bodies (or their bridge contracts) to execute parameter updates.

### Finding 6
- **Location:** `src/scenarios/web3/cross-chain.ts` (missing field)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `costPerHourDefault` field present.
- **Problem:** The ScenarioTemplate interface includes `costPerHourDefault?: number`. Both corrected reference scenarios include this field with detailed comments justifying the value: treasury-governance uses $200/hr (grant recipient project delay), emergency-pause uses $2,000,000/hr (exploit drain rate). For a bridge approaching its TVL cap and unable to increase it due to governance stalls: the protocol loses bridging fees ($0.05-0.3% on transfer volume), users lose opportunity cost (cannot bridge assets for DeFi participation, trading, etc.), and the ecosystem fragments as users route through competing bridges. For a bridge handling $5M-$50M daily transfer volume, a governance stall costs roughly $500-$5,000/hr in lost bridging fees alone, plus significant user opportunity cost.
- **Corrected Text:** `costPerHourDefault: 2500,` with detailed justification comment.
- **Source/Rationale:** Major bridges like Wormhole, Stargate, and Across process $5M-$100M+ in daily transfer volume. Bridging fees range from 0.05% to 0.3%. A governance stall that forces the bridge to reject deposits directly impacts fee revenue and user experience.

### Finding 7
- **Location:** `src/scenarios/web3/cross-chain.ts` (missing actor)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No bridge contract / escrow system actor.
- **Problem:** The bridge contract (or escrow contract) is where locked assets are held on the source chain and where minted/released assets are managed on the destination chain. It is THE system being modified by the TVL cap change. The TVL cap is a parameter stored in (or enforced by) the bridge contract. Omitting this actor is like modeling a bank loan approval without the loan account. Both corrected reference scenarios include the relevant system actors (Timelock Contract in treasury-governance, Guardian Safe and Timelock in emergency-pause).
- **Corrected Text:** Add a `bridge-escrow-contract` actor of type `NodeType.System`.
- **Source/Rationale:** Wormhole, Stargate, Axelar, and all major bridges have explicit bridge contracts (token bridge, escrow, or liquidity pool) that enforce TVL caps and rate limits.

### Finding 8
- **Location:** `src/scenarios/web3/cross-chain.ts` (missing actor)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No oracle / validator system actor.
- **Problem:** Cross-chain bridges rely on an oracle or validator system to verify cross-chain messages. For externally verified bridges (Wormhole, LayerZero, Axelar, Hyperlane), this is the guardian/validator set or DVN network. For optimistic bridges (Connext, Across), this is the dispute resolution system. The oracle/validator system is critical to bridge security and directly relevant to TVL cap governance -- the TVL cap is only meaningful if the oracle/validator system correctly enforces cross-chain message integrity. Without this actor, the scenario omits the core security infrastructure of a bridge.
- **Corrected Text:** Add an `oracle-validator-system` actor of type `NodeType.System`.
- **Source/Rationale:** Wormhole Guardians (19-of-19 threshold-based), LayerZero DVNs, Axelar validators, and Hyperlane ISMs are all fundamental components of bridge architecture that directly interact with bridge parameter governance.

### Finding 9
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 109-114 (beforeMetrics)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** `auditGapCount: 5,` (line 112) -- no enumeration.
- **Problem:** Both corrected reference scenarios enumerate every audit gap with detailed comments explaining what each gap represents (treasury-governance lines 346-365, emergency-pause lines 319-342). This scenario provides only the number 5 with no explanation of what the five gaps are. For a bridge security council member reviewing this scenario, the audit gaps are critical information -- they define the governance risk surface.
- **Corrected Text:** Enumerate all audit gaps in inline comments. See Corrected Scenario section.
- **Source/Rationale:** Consistency with corrected reference scenarios; bridge governance audit gaps are specific and well-documented from post-mortem analyses of Ronin, Nomad, and Multichain exploits.

### Finding 10
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 109-114 (beforeMetrics)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** `approvalSteps: 7,` (line 113) -- no enumeration.
- **Problem:** Both corrected reference scenarios enumerate every approval step with detailed comments (treasury-governance lines 367-382, emergency-pause lines 344-348). This scenario provides only the number 7. For bridge governance, the approval steps should include: (1) governance forum proposal, (2) risk assessment review, (3) Snapshot vote on Chain A governance, (4) Snapshot vote on Chain B governance, (5) bridge council multisig signature collection, (6) parameter change transaction preparation and simulation, (7) cross-chain parameter propagation via relayer.
- **Corrected Text:** Enumerate all approval steps in inline comments. See Corrected Scenario section.
- **Source/Rationale:** Consistency with corrected reference scenarios; bridge parameter governance workflows are multi-step and well-documented.

### Finding 11
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 109-110
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `manualTimeHours: 72,`
- **Problem:** 72 hours is at the high end for a TVL cap increase. While not unreasonable for a full cross-chain governance cycle (governance forum discussion 1-3 days + Snapshot votes 1-3 days + multisig ceremony 1-2 hours + cross-chain propagation 15 min - 1 hour), the lack of any explanatory comment makes it impossible to evaluate whether this represents active manual effort or wall-clock elapsed time. Both corrected reference scenarios include detailed breakdowns (treasury-governance lines 307-323, emergency-pause lines 289-304). For bridge governance specifically, the active manual effort is likely 8-16 hours, while the wall-clock elapsed time including governance waiting periods is 48-120 hours. The value should be clarified.
- **Corrected Text:** `manualTimeHours: 72,` retained but with detailed breakdown comment explaining that this represents wall-clock elapsed time including governance forum discussion and voting periods.
- **Source/Rationale:** Wormhole governance proposals typically complete in 3-7 days. Axelar governance proposals complete in 5-10 days. LayerZero DVN configuration changes can be faster (24-72 hours) for pre-approved changes.

### Finding 12
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 111
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `riskExposureDays: 14,`
- **Problem:** 14 days of risk exposure is stated without context. The risk framing is ambiguous: is this 14 days of the bridge operating at full TVL cap (near-capacity risk), 14 days of users unable to bridge (opportunity cost), or 14 days of governance window during which the bridge is exposed to the existing TVL cap (security risk)? In bridge governance, the risk exposure has two distinct dimensions: (1) capacity risk -- the bridge approaches its cap and must reject deposits, fragmenting the ecosystem; (2) security risk -- the existing TVL cap represents the maximum loss in an exploit. Doubling the cap to $50M doubles the maximum loss. The 14-day figure should clarify which risk dimension it measures and why.
- **Corrected Text:** `riskExposureDays: 14,` retained but with detailed comment explaining both risk dimensions.
- **Source/Rationale:** Bridge security risk exposure is directly proportional to TVL. Wormhole ($320M exploit), Ronin ($625M exploit), and Nomad ($190M exploit) all demonstrate that bridge TVL is the primary determinant of maximum loss.

### Finding 13
- **Location:** `src/scenarios/web3/cross-chain.ts`, line 90
- **Issue Type:** Incorrect Workflow
- **Severity:** Medium
- **Current Text:** `expirySeconds: 3600,`
- **Problem:** The 3600-second (1 hour) expiry for the "with Accumulate" policy is very short for cross-chain governance coordination. Unlike emergency pause (where minutes matter), TVL cap governance is a deliberative process. Both corrected reference scenarios use longer expiry windows: treasury-governance uses 86,400 seconds (24 hours), emergency-pause uses 300 seconds (5 minutes -- appropriate for emergencies). For cross-chain governance, a 12-24 hour window is more appropriate, allowing chain governors in different time zones to review and approve the parameter change. 1 hour is too short for genuine cross-organizational deliberation and would create the same timezone coordination problem the scenario claims to solve.
- **Corrected Text:** `expirySeconds: 43200,` (12 hours) with comment explaining the real-world governance coordination window.
- **Source/Rationale:** Cross-chain governance inherently involves coordination across multiple time zones and governance bodies. Wormhole governance proposals have multi-day voting windows. Even optimistic bridge parameter changes allow 24-72 hour review periods.

### Finding 14
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 28-43 (Chain A Governance, Chain B Governance actors)
- **Issue Type:** Jargon Error
- **Severity:** Medium
- **Current Text:** `type: NodeType.Partner` for both chain governance actors, with labels "Chain A Governance" and "Chain B Governance".
- **Problem:** While `NodeType.Partner` is technically appropriate for the cross-org-boundary archetype, the use of generic "Chain A" and "Chain B" labels is a significant credibility issue. No bridge protocol uses this terminology. Real bridge protocols reference specific chains by name: "Ethereum," "Arbitrum," "Optimism," "Solana," "Avalanche." The generic labeling makes the scenario feel abstract and untethered from real bridge operations. The actor descriptions also fail to clarify the governance relationship -- these are not commercial partners (which "Partner" implies); they are sovereign governance bodies of independent blockchain networks.
- **Corrected Text:** Use more descriptive labels while maintaining generic applicability. Add descriptions clarifying that these are sovereign blockchain governance bodies, not commercial partners. Consider using names like "Source Chain Governance" and "Destination Chain Governance" or referencing real-world patterns (e.g., "Ethereum L1 Governance Body" and "L2/Alt-L1 Governance Body").
- **Source/Rationale:** Real bridge governance proposals reference specific chains. Wormhole governance references "Ethereum," "Solana," "BNB Chain" etc. by name.

### Finding 15
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 16-79 (entire actor set)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Seven actors: Bridge Protocol, Chain A Governance, Chain B Governance, Bridge Council Member, Chain A Governor, Chain B Governor, Relayer System.
- **Problem:** The actor set is thin compared to corrected reference scenarios. Treasury-governance has 8 actors with detailed descriptions. Emergency-pause has 8 actors with detailed descriptions. This scenario has 7 actors but is missing two critical system actors (bridge escrow contract, oracle/validator system) that are more important to bridge governance than any of the organizational actors. Additionally, there is no "Bridge Security Lead" or equivalent role responsible for the risk assessment that justifies the TVL cap increase. The "Bridge Council Member" is described as an "elected governance council member" but this conflates the risk assessment function with the governance vote function.
- **Corrected Text:** Add bridge-escrow-contract and oracle-validator-system actors. Add a bridge-risk-assessor role or expand the bridge-council-member description to include risk assessment responsibility. See Corrected Scenario section.
- **Source/Rationale:** All major bridge protocols have distinct bridge contracts and oracle/validator systems as fundamental architectural components.

### Finding 16
- **Location:** `src/scenarios/web3/cross-chain.ts`, no top-level docblock
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** No JSDoc comment block above the `export const crossChainScenario` declaration.
- **Problem:** Both corrected reference scenarios include extensive top-level docblock comments (treasury-governance lines 5-40, emergency-pause lines 5-54) that explain the scenario context, key governance controls modeled, real-world references, and protocol-specific operational patterns. This scenario has no such documentation. For a scenario about cross-chain bridge governance -- one of the most complex and risk-sensitive governance domains in Web3 -- the absence of contextual documentation is a significant gap.
- **Corrected Text:** Add a comprehensive docblock comment. See Corrected Scenario section.
- **Source/Rationale:** Consistency with corrected reference scenarios; bridge governance complexity warrants extensive documentation.

### Finding 17
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 116-123 (todayFriction)
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** Manual step descriptions reference "Governance forum post submitted," "Chain governors reviewing TVL impact analysis," and "Chain B Governor traveling -- multisig ceremony stalls." The narrativeTemplate says "Governance forum coordination with Snapshot votes and multisig ceremonies across chain bodies."
- **Problem:** The friction steps are oversimplified compared to both corrected reference scenarios and compared to real-world bridge governance. Missing from the friction model: (1) no mention of the risk assessment or security analysis that precedes the governance vote, (2) no mention of cross-chain parameter propagation mechanics (the parameter must be updated on both chains, creating a consistency window), (3) no mention of bridge contract simulation or verification before parameter change execution, (4) the "multisig ceremony stalls" language implies a single ceremony, but cross-chain governance typically involves separate governance processes on each chain.
- **Corrected Text:** See Corrected Scenario section for expanded friction steps.
- **Source/Rationale:** Real bridge parameter governance involves separate governance processes on each chain, cross-chain message verification, and bridge contract state verification before parameter updates.

### Finding 18
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 349-409 (Section 6)
- **Issue Type:** Understatement
- **Severity:** High
- **Current Text:** The entire Section 6 narrative is 60 lines. Compare: Section 1 (DAO Treasury Governance) is 72 lines; Section 2 (Emergency Protocol Pause) is 65 lines; Section 3 (DeFi Risk Parameter Update) is 72 lines.
- **Problem:** The narrative is the thinnest section in the document despite cross-chain bridge governance being one of the most complex governance domains in Web3. Specific deficiencies: (1) only 5 rows in the takeaway table (corrected scenarios have 9); (2) no enumerated audit gaps in the "Today's Process" outcome; (3) no real-world bridge data (Wormhole TVL caps, LayerZero DVN governance, Axelar validator set management, Stargate liquidity pool limits); (4) no discussion of cross-chain parameter propagation mechanics; (5) no regulatory context discussion; (6) no cost-of-delay quantification (how much revenue does the bridge lose when approaching its cap?); (7) the "With Accumulate" section has only 5 steps vs. 6-7 in corrected scenarios.
- **Corrected Text:** See Corrected Scenario section for complete narrative.
- **Source/Rationale:** Corrected Sections 1, 2, and 3 in the same document establish the expected depth and detail level.

### Finding 19
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 354-360 (Players section)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Players section lists only Bridge Protocol (with Bridge Council Member and Relayer System), Chain A Governance (with Chain A Governor), and Chain B Governance (with Chain B Governor).
- **Problem:** Missing from the players section: the bridge escrow contract (the system being modified), the oracle/validator system (the security infrastructure), and any risk assessment function. The corrected treasury-governance narrative (Section 1) includes the Governance System, Timelock Contract, and Grants Sub-Committee as system/sub-committee actors. The corrected emergency-pause narrative (Section 2) includes the On-Chain Monitoring System, Guardian Safe, and Timelock. This narrative omits the equivalent bridge system actors entirely.
- **Corrected Text:** Add Bridge Escrow Contract and Oracle/Validator System to the players section.
- **Source/Rationale:** Consistency with corrected narrative sections; bridge system actors are essential to understanding the governance workflow.

### Finding 20
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 370-374 (Today's Process steps 1-3)
- **Issue Type:** Incorrect Workflow
- **Severity:** Medium
- **Current Text:** Step 1: "Governance forum post. The TVL cap increase proposal is posted in the governance forum." Step 2: "Snapshot vote initiated." Step 3: "Chain B Governor traveling."
- **Problem:** The workflow skips critical steps in real bridge parameter governance: (1) there is no risk assessment step -- who analyzed the TVL cap increase request, ran simulations on the impact of doubling the cap, assessed the security implications (doubling the maximum potential loss in an exploit), or reviewed the liquidity depth on both chains? (2) There is no bridge contract state verification step -- before proposing a cap increase, the governance body should verify the current bridge utilization, recent transfer patterns, and contract health. (3) The Snapshot vote is described as a single vote, but cross-chain governance typically involves separate governance processes on each chain (Chain A votes through its governance, Chain B votes through its governance, then the bridge council coordinates the final parameter change).
- **Corrected Text:** See Corrected Scenario section for expanded workflow.
- **Source/Rationale:** Aave's risk parameter governance requires risk service provider analysis before proposal. Wormhole governance proposals include security assessment. Axelar validator set changes require security review.

### Finding 21
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 400-408 (Takeaway table)
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** Five-row takeaway table: Governance coordination, Governor availability, Bridge capacity risk, Time to authorization, Audit trail.
- **Problem:** The table omits critical comparison dimensions present in corrected scenarios: delegation mechanics (what can be delegated and to whom), escalation mechanisms (what happens when governance stalls during critical capacity periods), regulatory compliance posture, risk assessment provenance (who assessed the TVL cap increase and is the assessment linked to the parameter change), and cross-chain parameter propagation (how does the parameter update reach both chains). Corrected scenarios have 9 rows.
- **Corrected Text:** Expand to 9 rows. See Corrected Scenario section.
- **Source/Rationale:** Consistency with corrected Sections 1, 2, and 3 takeaway tables.

### Finding 22
- **Location:** `src/scenarios/web3/cross-chain.ts`, line 89
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `expirySeconds: 20,` (in todayPolicies)
- **Problem:** While both corrected reference scenarios use short expiry seconds for todayPolicies (treasury-governance: 30, emergency-pause: 20), the cross-chain scenario uses 20 seconds. For a cross-chain governance scenario where the "today" state involves governance forum discussion, Snapshot votes, and multisig ceremonies across multiple organizations, a 20-second expiry is actually appropriate as a simulation-compressed representation of the narrow coordination window collapsing. However, the lack of any comment explaining what the 20-second value represents in real-world terms is an inconsistency with the corrected scenarios, which include detailed simulation-compression comments.
- **Corrected Text:** Add inline comment explaining: "Simulation-compressed: represents the practical effect of the 3-of-3 unanimous requirement with cross-organizational coordination. The narrow window for all three governance representatives to participate simultaneously collapses when any one is unavailable."
- **Source/Rationale:** Consistency with corrected reference scenarios' commenting patterns.

### Finding 23
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 9-10 (description)
- **Issue Type:** Overstatement
- **Severity:** Low
- **Current Text:** `"...including TVL cap adjustments, validator set rotations, and contract upgrade authorizations..."`
- **Problem:** The scenario description claims to cover validator set rotations and contract upgrade authorizations, but neither of these operations is actually modeled in the scenario. The workflow, policy, and friction steps all focus exclusively on TVL cap adjustment. Claiming coverage of validator rotations and contract upgrades when they are not modeled is misleading. These are fundamentally different governance operations with different risk profiles and security requirements.
- **Corrected Text:** Either remove the references to validator rotations and contract upgrades from the description, or add them as additional workflow variants. For the scope of this scenario, focus the description on TVL cap governance specifically.
- **Source/Rationale:** Validator set rotations are the most sensitive bridge governance operation (Ronin exploit resulted from compromised validator keys). Contract upgrades are the second most sensitive (Nomad exploit resulted from a faulty contract upgrade). Claiming to model these without actually modeling them undermines credibility.

### Finding 24
- **Location:** `src/scenarios/web3/cross-chain.ts`, lines 117-121 (todayFriction manualSteps)
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text:** Three manual steps with delay seconds of 10, 6, and 12.
- **Problem:** The corrected reference scenarios include simulation-compression comments explaining what each delay value represents in real-world time (treasury-governance lines 392-413, emergency-pause lines 357-378). This scenario provides no such documentation. The delays (10s, 6s, 12s) are unexplained -- do they represent hours, days, or minutes of real-world elapsed time?
- **Corrected Text:** Add simulation-compression comments. See Corrected Scenario section.
- **Source/Rationale:** Consistency with corrected reference scenarios' commenting patterns.

### Finding 25
- **Location:** `src/scenarios/web3/cross-chain.ts`, line 138
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text:** `tags: ["web3", "cross-chain", "bridge", "multi-org", "governance", "bridge-parameters", "tvl-cap", "validator-rotation"],`
- **Problem:** The tags include "validator-rotation" but the scenario does not model validator rotation. Tags should reflect actual scenario content. Missing tags that should be included: "fatf", "travel-rule", "sanctions-screening", "ofac", "bridge-escrow", "parameter-propagation", "cross-chain-messaging".
- **Corrected Text:** Update tags to reflect actual scenario content and bridge-specific concepts.
- **Source/Rationale:** Consistency with corrected reference scenarios' tagging patterns; tags should be accurate.

---

## 3. Missing Elements

1. **Bridge Escrow Contract actor** -- The on-chain contract where locked assets are held and TVL cap is enforced. This is the system being modified by the governance action.

2. **Oracle / Validator System actor** -- The cross-chain message verification infrastructure (Wormhole Guardians, LayerZero DVNs, Axelar validators). Critical to bridge security and directly relevant to parameter governance.

3. **`mandatoryApprovers`** -- Bridge Council Member should be mandatory because they own the risk assessment that justifies the TVL cap increase.

4. **`delegationConstraints`** -- Delegation should be limited to TVL cap increases within a pre-approved range. Validator set rotations, contract upgrades, and emergency pauses should never be delegatable through this policy.

5. **`escalation`** -- When the governance council cannot reach quorum and the bridge is approaching capacity, escalation to an emergency bridge operations multisig or automated rate-limiting mechanism is essential.

6. **`constraints`** -- Maximum TVL cap increase per governance cycle (e.g., 2x maximum), production environment restriction, and potentially a minimum review period before execution.

7. **`costPerHourDefault`** -- Economic cost of a governance stall: lost bridging fees, user opportunity cost, ecosystem fragmentation.

8. **Inline `regulatoryContext`** -- Bridge-specific regulatory entries: FATF Travel Rule for cross-chain transfers, MiCA Art. 67/68 bridge-specific, OFAC sanctions compliance for bridge operations.

9. **Top-level docblock comment** -- Extensive documentation of the scenario context, key governance controls, real-world protocol references, and bridge exploit data.

10. **Enumerated audit gaps** -- Each of the 5 (or more) audit gaps should be documented in inline comments.

11. **Enumerated approval steps** -- Each of the 7 approval steps should be documented in inline comments.

12. **Real-world bridge protocol references** -- Wormhole, LayerZero, Axelar, Stargate, Connext -- their TVL cap governance mechanics, parameter change workflows, and governance timelines.

13. **Cross-chain parameter propagation discussion** -- How the TVL cap update reaches both chains, the consistency window during propagation, and the risk of inconsistent parameters.

14. **Risk assessment role or function** -- Who performs the security and liquidity analysis that justifies doubling the TVL cap? This is the most critical governance function and it is not represented.

---

## 4. Corrected Scenario

### Corrected TypeScript (`cross-chain.ts`)

```typescript
import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * Cross-Chain Bridge Governance -- Bridge Security Council Operations,
 * TVL Cap Management & Cross-Chain Parameter Coordination
 *
 * Models the cross-chain bridge governance workflow for a TVL cap increase
 * from $25M to $50M on an externally verified bridge (Wormhole, LayerZero,
 * Axelar, Hyperlane pattern). The core governance challenge is coordinating
 * parameter changes across multiple sovereign blockchain governance bodies
 * while maintaining a verifiable cross-organizational audit trail that links
 * risk assessment -> governance votes on both chains -> bridge council
 * approval -> cross-chain parameter propagation via the relayer system.
 *
 * CRITICAL RISK CONTEXT: A TVL cap increase from $25M to $50M DOUBLES the
 * maximum potential loss in a bridge exploit. This is not a routine parameter
 * change -- it is a major risk governance decision. The Wormhole exploit
 * ($320M), Ronin exploit ($625M), Nomad exploit ($190M), and Harmony
 * Horizon exploit ($100M) all demonstrate that bridge TVL is the primary
 * determinant of maximum loss.
 *
 * Key governance controls modeled:
 * - 2-of-3 threshold with Bridge Council Member as mandatory approver
 *   (risk assessment, security analysis, and TVL impact evaluation
 *   cannot be bypassed)
 * - Delegation to Bridge Operations Multisig for TVL cap increases
 *   within pre-approved bounds (e.g., up to 25% increase, not 100%)
 * - Delegation constrained: validator set rotations, bridge contract
 *   upgrades, and emergency pauses are NEVER delegatable
 * - Escalation to Emergency Bridge Multisig when governance stalls
 *   during capacity-critical periods (bridge approaching TVL cap)
 * - Bridge Escrow Contract as the system being modified by the TVL
 *   cap change (where locked assets are held and cap is enforced)
 * - Oracle/Validator System as the cross-chain message verification
 *   infrastructure that attests to parameter change governance proofs
 *
 * Real-world bridge governance references:
 * - Wormhole: 19 Guardians (originally 19-of-19, now threshold-based),
 *   governance proposals for guardian set changes and parameter updates
 * - LayerZero: Configurable DVN (Decentralized Verifier Network) with
 *   application-level security configuration per pathway
 * - Axelar: Delegated proof-of-stake validator set with governance
 *   proposals for supported chain additions and parameter changes
 * - Stargate (LayerZero): Liquidity pool-based bridge with per-chain
 *   TVL caps implemented as pool credit limits
 * - Connext/Everclear: Optimistic bridge with 30-minute dispute period,
 *   parameter governance via protocol multisig
 *
 * Bridge exploit losses demonstrating TVL cap risk:
 * - Wormhole: $320M (Feb 2022) -- signature verification bypass
 * - Ronin: $625M (Mar 2022) -- 5-of-9 validator keys compromised
 * - Nomad: $190M (Aug 2022) -- faulty contract initialization
 * - Multichain: $126M+ (Jul 2023) -- centralized MPC key compromise
 * - Harmony Horizon: $100M (Jun 2022) -- 2-of-5 multisig insufficient
 */
export const crossChainScenario: ScenarioTemplate = {
  id: "web3-cross-chain",
  name: "Cross-Chain Bridge Governance",
  description:
    "A cross-chain bridge governance council needs to approve a TVL cap increase from $25M to $50M to accommodate growing bridge usage. This doubles the maximum potential loss in a bridge exploit -- a major risk governance decision requiring risk assessment, security analysis, and cross-chain coordination. Bridge Council Member, Source Chain Governor, and Destination Chain Governor must coordinate approval across separate governance bodies with different finality times, gas cost structures, and voting mechanisms. The parameter change must then be propagated to bridge escrow contracts on both chains via the relayer system. Governance stalls when a chain governor is unavailable, the bridge approaches its cap (rejecting new deposits), and there is no delegated authority path or escalation mechanism. Audit trail is fragmented across governance forums on both chains, Snapshot votes, and the bridge multisig with no cryptographic binding between the risk assessment and the parameter execution.",
  icon: "CubeFocus",
  industryId: "web3",
  archetypeId: "cross-org-boundary",
  prompt:
    "What happens when a bridge governance council needs to approve a TVL cap increase from $25M to $50M but cross-chain governance coordination stalls because a chain governor is unavailable, the bridge is approaching its cap and rejecting new deposits, and there is no delegated authority path or escalation mechanism to an emergency bridge operations multisig?",

  // costPerHourDefault: cost impact of a bridge governance stall when the
  // bridge is approaching its TVL cap and cannot increase it.
  // Includes:
  // - Lost bridging fees: bridge processing $5M-$50M daily volume at
  //   0.05%-0.3% fee rate = $2,500-$150,000/day, or ~$100-$6,250/hr.
  //   Conservative estimate: $10M daily volume at 0.1% = $10,000/day
  //   = ~$417/hr in lost fees.
  // - User opportunity cost: users unable to bridge assets for DeFi
  //   participation, trading, liquidity provision on destination chain.
  //   Difficult to quantify but significant for bridge-dependent
  //   ecosystems (L2s, alt-L1s that rely on bridged ETH/USDC liquidity).
  // - Ecosystem fragmentation: users route through competing bridges
  //   with potentially weaker security (lower validator thresholds,
  //   less-audited contracts), increasing ecosystem-wide risk.
  // - Protocol reputation: bridge capacity limits force users to
  //   alternative bridges, potentially permanent user loss.
  // $2,500/hr is a conservative estimate dominated by lost bridging
  // fees and user opportunity cost for a mid-tier bridge ($10M daily
  // volume). Top-tier bridges (Wormhole, Stargate, Across) processing
  // $50M-$100M+ daily would see $5,000-$25,000+/hr impact.
  costPerHourDefault: 2500,

  actors: [
    // --- Bridge Protocol Organization ---
    // The cross-chain bridge protocol operating the bridge infrastructure,
    // managing the bridge governance council, and coordinating parameter
    // changes across connected chains. In practice, this is the bridge
    // protocol's foundation or operating entity (e.g., Wormhole Foundation,
    // LayerZero Labs, Axelar Foundation).
    {
      id: "bridge-protocol",
      type: NodeType.Organization,
      label: "Bridge Protocol",
      description:
        "Cross-chain bridge protocol foundation operating bridge infrastructure with $25M current TVL cap. Manages the bridge governance council, bridge escrow contracts on connected chains, oracle/validator system for cross-chain message verification, and relayer infrastructure for parameter propagation. Parameter changes (TVL cap adjustments, rate limits, supported token additions) require multi-party authorization across the bridge council and chain governance bodies.",
      parentId: null,
      organizationId: "bridge-protocol",
      color: "#06B6D4",
    },

    // --- Source Chain Governance (Chain A) ---
    // The governance body of the source chain (the chain where users deposit
    // assets into the bridge escrow contract). This is a sovereign governance
    // body of an independent blockchain network -- NOT a commercial partner.
    // NodeType.Partner is used because the cross-org-boundary archetype
    // models coordination across independent organizations, and blockchain
    // governance bodies are independent governance entities.
    {
      id: "source-chain-governance",
      type: NodeType.Partner,
      label: "Source Chain Governance",
      description:
        "Governance body of the source blockchain (e.g., Ethereum L1, Arbitrum DAO, Optimism Collective). Authorization required for bridge parameter changes affecting the source chain's bridge escrow contract. Operates its own governance mechanism (token-weighted voting, Snapshot, on-chain Governor) with its own finality time (~13 min for Ethereum, ~1 min for Arbitrum) and governance cadence. This is a sovereign blockchain governance body, not a commercial partner.",
      parentId: null,
      organizationId: "source-chain-governance",
      color: "#22C55E",
    },

    // --- Destination Chain Governance (Chain B) ---
    // The governance body of the destination chain (the chain where minted/
    // wrapped assets are issued when users bridge from the source chain).
    // In this scenario, the destination chain governor is traveling, creating
    // the governance stall.
    {
      id: "dest-chain-governance",
      type: NodeType.Partner,
      label: "Destination Chain Governance",
      description:
        "Governance body of the destination blockchain (e.g., L2/alt-L1 network). Authorization required for bridge parameter changes affecting the destination chain's bridge token contract and TVL cap enforcement. Governor is traveling -- unavailability risks governance stalls during time-sensitive parameter updates when the bridge is approaching capacity.",
      parentId: null,
      organizationId: "dest-chain-governance",
      color: "#F59E0B",
    },

    // --- Bridge Council Member ---
    // The elected bridge governance council member responsible for risk
    // assessment, security analysis, and parameter change coordination.
    // In production bridge governance, this role combines risk assessment
    // (analyzing the security implications of doubling the TVL cap) with
    // governance coordination (managing the cross-chain approval process).
    // Mandatory approver -- the bridge council member's risk assessment
    // cannot be bypassed for any TVL cap change.
    {
      id: "bridge-council-member",
      type: NodeType.Role,
      label: "Bridge Council Member",
      description:
        "Elected bridge governance council member responsible for bridge parameter decisions. Performs risk assessment for TVL cap changes: analyzes security implications (doubling cap = doubling maximum exploit loss), reviews liquidity depth on both chains, evaluates bridge contract audit status, and assesses oracle/validator system health. Mandatory approver -- risk assessment cannot be bypassed. Coordinates with chain governance representatives for cross-organizational approval.",
      parentId: "bridge-protocol",
      organizationId: "bridge-protocol",
      color: "#94A3B8",
    },

    // --- Source Chain Governor ---
    // Governance representative for the source chain. Participates in bridge
    // parameter authorization on behalf of the source chain's stakeholders.
    {
      id: "source-chain-governor",
      type: NodeType.Role,
      label: "Source Chain Governor",
      description:
        "Source chain governance representative -- participates in bridge parameter authorization on behalf of source chain stakeholders. Reviews TVL impact analysis for the source chain's bridge escrow contract, verifies that the cap increase aligns with the source chain's risk tolerance, and signs the cross-chain governance approval.",
      parentId: "source-chain-governance",
      organizationId: "source-chain-governance",
      color: "#22C55E",
    },

    // --- Destination Chain Governor ---
    // Governance representative for the destination chain. In this scenario,
    // the destination chain governor is traveling, creating the governance stall.
    {
      id: "dest-chain-governor",
      type: NodeType.Role,
      label: "Destination Chain Governor",
      description:
        "Destination chain governance representative -- currently traveling, causing governance stall. Unavailability blocks the 3-of-3 unanimous requirement in the 'today' state, leaving the bridge approaching its TVL cap with no path to parameter update.",
      parentId: "dest-chain-governance",
      organizationId: "dest-chain-governance",
      color: "#F59E0B",
    },

    // --- Relayer System ---
    // Cross-chain message relay and parameter propagation system. After the
    // bridge governance council approves a TVL cap increase, the relayer
    // propagates the parameter change to bridge contracts on both chains.
    // This creates a coordination challenge: the parameter change on the
    // source chain may confirm before the destination chain (different
    // finality times), creating a brief inconsistency window.
    {
      id: "relayer-system",
      type: NodeType.System,
      label: "Relayer System",
      description:
        "Cross-chain message relay and parameter propagation system. Executes authorized parameter changes across both chains after governance approval. Propagates TVL cap update to bridge escrow contract (source chain) and bridge token contract (destination chain). Handles cross-chain finality differences: source chain confirmation (~13 min for Ethereum) may precede destination chain confirmation (~1 min for L2), creating a brief parameter inconsistency window during propagation.",
      parentId: "bridge-protocol",
      organizationId: "bridge-protocol",
      color: "#8B5CF6",
    },

    // --- Bridge Escrow Contract ---
    // The on-chain contract where locked assets are held on the source chain
    // and where the TVL cap is enforced. This is the system being modified
    // by the governance action. When the TVL cap is reached, new deposits
    // are rejected by this contract.
    {
      id: "bridge-escrow-contract",
      type: NodeType.System,
      label: "Bridge Escrow Contract",
      description:
        "On-chain bridge escrow contract on the source chain where deposited assets are locked. Enforces the TVL cap -- when the cap ($25M current) is reached, new deposit transactions revert. The TVL cap parameter is stored in this contract and can only be updated by an authorized governance transaction. This is the system being modified by the TVL cap increase governance action. Audited by Trail of Bits / OpenZeppelin / Spearbit tier auditors.",
      parentId: "bridge-protocol",
      organizationId: "bridge-protocol",
      color: "#8B5CF6",
    },

    // --- Oracle / Validator System ---
    // The cross-chain message verification infrastructure. For externally
    // verified bridges, this is the guardian/validator set that attests to
    // cross-chain messages (including governance parameter change messages).
    // The oracle/validator system must verify the governance approval proof
    // before the parameter change is executed on the destination chain.
    {
      id: "oracle-validator-system",
      type: NodeType.System,
      label: "Oracle / Validator System",
      description:
        "Cross-chain message verification infrastructure -- guardian/validator set (Wormhole Guardians, LayerZero DVNs, Axelar validators, Hyperlane ISMs) that attests to cross-chain messages including governance parameter change messages. Must verify the governance approval proof before the TVL cap update is executed on the destination chain. Bridge security depends on the integrity and availability of this system -- a compromised validator set can forge arbitrary cross-chain messages (Ronin $625M exploit, Harmony $100M exploit).",
      parentId: "bridge-protocol",
      organizationId: "bridge-protocol",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-cross-chain",
      // Policy attached to the Bridge Protocol, which owns the bridge
      // governance process. The bridge council member performs the risk
      // assessment, chain governors provide cross-organizational authorization,
      // and the relayer system propagates the approved parameter change.
      actorId: "bridge-protocol",
      threshold: {
        // 2-of-3: Bridge Council Member plus either Source Chain Governor
        // or Destination Chain Governor. This allows the bridge to update
        // parameters when one chain governor is unavailable, while still
        // requiring cross-organizational verification. The key improvement
        // over the today state (3-of-3 unanimous) is that a single
        // unavailable chain governor no longer blocks all parameter updates.
        k: 2,
        n: 3,
        approverRoleIds: ["bridge-council-member", "source-chain-governor", "dest-chain-governor"],
      },
      // 43,200 seconds (12 hours) -- simulation-compressed representation
      // of the real-world cross-chain governance coordination window. In
      // production bridge governance, the coordination window is typically
      // 24-72 hours after the governance proposal passes on both chains.
      // The 12-hour simulation window creates realistic coordination
      // pressure while accommodating chain governors in different time zones.
      expirySeconds: 43200,
      delegationAllowed: true,
      // Delegation: Bridge Council Member delegates to the Relayer System
      // for parameter updates within pre-approved bounds. This models
      // automated parameter propagation for governance-approved changes
      // that fall within established safety limits.
      delegateToRoleId: "relayer-system",
      // Bridge Council Member is mandatory for all TVL cap changes.
      // The bridge council member performs the risk assessment (security
      // analysis, liquidity depth review, exploit loss projection) that
      // justifies the cap increase. A chain governor alone should NOT
      // be able to authorize a cap increase without the bridge team's
      // risk assessment -- this would bypass the security function.
      mandatoryApprovers: ["bridge-council-member"],
      // Delegation scope constraints: the Relayer System can only execute
      // pre-approved parameter changes within narrow bounds. TVL cap
      // increases above 25%, validator set rotations, bridge contract
      // upgrades, and emergency pauses are NEVER delegatable and require
      // direct bridge council + chain governor approval.
      delegationConstraints:
        "Delegation from Bridge Council Member to Relayer System is limited to TVL cap increases of 25% or less that have been pre-approved by the bridge governance council in a prior governance cycle. Validator set rotations (adding/removing guardians), bridge contract upgrades, rate limit changes exceeding 50%, supported chain additions, emergency bridge pauses, and TVL cap increases exceeding 25% require direct 2-of-3 approval from Bridge Council Member and chain governors. Relayer System cannot modify the oracle/validator system configuration, change the bridge escrow contract implementation, or execute any operation that increases the bridge's security risk profile beyond pre-approved bounds.",
      escalation: {
        // Simulation-compressed: 20 seconds represents real-world
        // escalation after 24 hours of governance quorum failure. If
        // the 2-of-3 threshold cannot be met (e.g., both chain governors
        // traveling or one chain's governance system experiencing delays),
        // the system escalates to the Bridge Escrow Contract to activate
        // automated rate limiting. This rate-limiting fallback prevents
        // the bridge from being completely blocked while governance
        // catches up -- new deposits are throttled rather than rejected.
        afterSeconds: 20,
        toRoleIds: ["bridge-escrow-contract"],
      },
      constraints: {
        // Maximum TVL cap increase of $50M (2x the current $25M cap).
        // Increases beyond 2x require an enhanced governance process
        // with extended community review, additional security audit,
        // and insurance/backstop capacity verification. This constraint
        // prevents governance capture attacks where an attacker with
        // sufficient governance tokens could set an arbitrarily high
        // TVL cap to maximize the potential exploit payout.
        amountMax: 50000000,
        environment: "production",
      },
    },
  ],
  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "bridge-protocol", targetId: "bridge-council-member", type: "authority" },
    { sourceId: "bridge-protocol", targetId: "relayer-system", type: "authority" },
    { sourceId: "bridge-protocol", targetId: "bridge-escrow-contract", type: "authority" },
    { sourceId: "bridge-protocol", targetId: "oracle-validator-system", type: "authority" },
    { sourceId: "source-chain-governance", targetId: "source-chain-governor", type: "authority" },
    { sourceId: "dest-chain-governance", targetId: "dest-chain-governor", type: "authority" },
    // --- Delegation edge (Bridge Council Member -> Relayer System) ---
    // Bridge Council Member delegates pre-approved parameter updates to
    // the Relayer System within delegation constraints (TVL cap increases
    // of 25% or less, pre-approved in prior governance cycle).
    { sourceId: "bridge-council-member", targetId: "relayer-system", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Bridge TVL cap governance with cross-chain authorization and parameter propagation",
    initiatorRoleId: "bridge-council-member",
    targetAction:
      "Authorize Bridge TVL Cap Increase from $25M to $50M via Cross-Chain Governance Approval and Relayer Parameter Propagation",
    description:
      "Bridge Council Member initiates a TVL cap increase after performing risk assessment (security analysis of doubling the maximum exploit loss, liquidity depth review on both chains, bridge contract audit status, oracle/validator system health check). The request is routed to chain governors on both chains for cross-organizational authorization. 2-of-3 threshold with Bridge Council Member mandatory. After threshold met, the relayer system propagates the TVL cap update to bridge escrow contracts on both chains, with the oracle/validator system attesting to the governance proof. Audit trail links risk assessment -> chain governance approvals -> bridge council sign-off -> cross-chain parameter propagation in a single cryptographic proof chain.",
  },
  beforeMetrics: {
    // Wall-clock elapsed time from TVL cap increase proposal to confirmed
    // parameter update on both chains, including governance forum discussion,
    // Snapshot/governance votes on both chains, bridge council multisig
    // ceremony, and cross-chain parameter propagation.
    // Active manual effort is approximately 12-20 hours:
    //   - Bridge Council Member: 4-8 hours (risk assessment, security
    //     analysis, governance proposal drafting, liquidity depth review,
    //     bridge contract state verification, coordination)
    //   - Source Chain Governor: 2-4 hours (TVL impact review, governance
    //     vote participation, bridge state verification)
    //   - Destination Chain Governor: 2-4 hours (same as source chain)
    //   - Relayer operation: 1-2 hours (parameter propagation, cross-chain
    //     confirmation monitoring, consistency verification)
    // The 72-hour wall-clock figure represents the full elapsed time
    // including governance forum discussion (24-48 hours), Snapshot
    // votes on both chains (24-48 hours overlapping), bridge council
    // multisig ceremony (2-4 hours), and cross-chain propagation (1 hour).
    // When a chain governor is traveling, this extends to 96-144 hours.
    manualTimeHours: 72,
    // 14 days of risk exposure represents two distinct risk dimensions:
    // (1) Capacity risk (primary): the bridge is approaching its $25M
    //     TVL cap and will begin rejecting new deposits. Users unable
    //     to bridge assets creates ecosystem fragmentation, drives users
    //     to less-secure competing bridges, and damages protocol reputation.
    //     14 days of capacity constraint = 14 days of lost bridging fees
    //     and user churn.
    // (2) Security risk (secondary): once the cap is increased to $50M,
    //     the maximum potential loss in a bridge exploit doubles. The
    //     14-day governance window is the period during which the decision
    //     is being deliberated -- during this time, the bridge operates
    //     at the old cap with growing utilization pressure.
    // Real-world context: Wormhole bridge has operated with various TVL
    // caps across supported chains. Stargate adjusts pool credit limits
    // through governance proposals with multi-day voting periods.
    riskExposureDays: 14,
    // Six audit gaps in the current fragmented cross-chain governance process:
    // (1) Risk assessment (bridge council member's security analysis,
    //     liquidity depth review, exploit loss projection) is not
    //     cryptographically linked to the governance proposal -- the
    //     analysis is a PDF or forum post with no binding to the
    //     parameter change transaction
    // (2) Governance votes on the source chain and destination chain
    //     are conducted in separate systems (different Snapshot spaces,
    //     different governance forums) with no cross-chain binding
    //     between the two vote results
    // (3) Bridge council multisig coordination via Discord/Telegram
    //     with no audit trail -- availability negotiations, signing
    //     window coordination, and scope discussions happen in ephemeral
    //     chat messages
    // (4) Cross-chain parameter propagation has no cryptographic proof
    //     linking the governance approval to the relayer's parameter
    //     update transaction -- the relayer executes the update but
    //     there is no system-enforced verification that the update
    //     matches the governance approval
    // (5) No verification that the TVL cap was updated consistently
    //     on BOTH chains -- the parameter change on the source chain
    //     may succeed while the destination chain update fails or is
    //     delayed, creating an inconsistency window
    // (6) No cryptographic record of oracle/validator system health
    //     check before the parameter change -- the bridge council
    //     member may have verified validator uptime and attestation
    //     accuracy, but this is not captured in any governance record
    auditGapCount: 6,
    // Seven manual steps in the current cross-chain governance process:
    // (1) Bridge Council Member performs risk assessment: security analysis,
    //     liquidity depth review, exploit loss projection for doubling TVL
    // (2) Bridge Council Member drafts governance forum proposal with risk
    //     justification on the bridge protocol's governance forum
    // (3) Snapshot vote initiated on source chain governance (or on-chain
    //     Governor vote) -- chain-specific governance process
    // (4) Snapshot vote initiated on destination chain governance (or
    //     on-chain Governor vote) -- separate chain-specific governance
    // (5) Bridge council multisig signing ceremony -- collecting signatures
    //     from bridge council member and chain governors across time zones
    // (6) Parameter change transaction preparation and bridge contract
    //     state simulation/verification before execution
    // (7) Cross-chain parameter propagation via relayer -- updating TVL
    //     cap on both chains and verifying consistency
    approvalSteps: 7,
  },
  todayFriction: {
    ...ARCHETYPES["cross-org-boundary"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Bridge Council Member drafts governance forum proposal with risk assessment: security analysis of doubling TVL cap ($25M to $50M = doubling maximum exploit loss), liquidity depth review on both chains, bridge contract audit status, oracle/validator system health. Snapshot votes initiated on both chain governance forums. Cross-chain governance coordination begins across separate governance systems.",
        // Simulation-compressed: represents 24-48 hours real-world elapsed
        // time for risk assessment, governance proposal drafting, forum
        // discussion, and Snapshot vote initiation on both chains
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        description:
          "Chain governors reviewing TVL impact analysis: verifying bridge contract state on their respective chains, assessing liquidity depth and utilization metrics, reviewing oracle/validator system attestation accuracy, and confirming the cap increase aligns with their chain's risk tolerance. Each chain's governance operates on its own schedule and voting period.",
        // Simulation-compressed: represents 24-48 hours real-world elapsed
        // time for chain-specific governance review and voting periods
        delaySeconds: 6,
      },
      {
        trigger: "on-unavailable",
        description:
          "Destination Chain Governor traveling -- cannot participate in bridge multisig ceremony. 3-of-3 unanimous requirement blocks the TVL cap increase entirely. Bridge utilization approaching $25M cap -- new deposit transactions beginning to revert. Users routing through alternative bridges with potentially weaker security. Bridge protocol losing fee revenue. Governance coordination window closing with no delegation path and no escalation mechanism.",
        // Simulation-compressed: represents 48-72 hours real-world delay
        // when a chain governor is traveling and 3-of-3 unanimous approval
        // is required with no delegation or escalation path
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Cross-chain governance forum coordination with risk assessment, Snapshot votes on both chain governance bodies, bridge council multisig ceremony, and manual parameter propagation -- all with fragmented audit trail across multiple chains and governance systems",
  },
  todayPolicies: [
    {
      id: "policy-cross-chain-today",
      // Today's policy: 3-of-3 unanimous approval with no delegation,
      // no escalation, and no mandatory approver differentiation. This
      // is the root cause of the governance stall -- a single unavailable
      // chain governor blocks ALL bridge parameter updates. The 3-of-3
      // threshold across three independent organizations (bridge protocol,
      // source chain, destination chain) creates a coordination problem
      // compounded by different time zones, governance cadences, and
      // chain-specific finality requirements.
      actorId: "bridge-protocol",
      threshold: {
        // 3-of-3 unanimous: every governance participant must approve.
        // A single unavailable chain governor (traveling, chain governance
        // on holiday, governance system experiencing delays) blocks the
        // entire bridge parameter update.
        k: 3,
        n: 3,
        approverRoleIds: ["bridge-council-member", "source-chain-governor", "dest-chain-governor"],
      },
      // Simulation-compressed: represents the practical effect of the
      // narrow coordination window collapsing when a chain governor is
      // unavailable. With 3-of-3 unanimous across three independent
      // organizations with different governance cadences, the effective
      // window for coordinated approval is extremely narrow.
      expirySeconds: 20,
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to cross-chain bridge governance,
  // cross-chain asset transfer compliance, and bridge operational risk.
  // The shared REGULATORY_DB["web3"] entries (MiCA Art. 68 generic CASP
  // safeguarding, SEC Rule 206(4)-2 custody rule) are NOT specific to
  // bridge governance. The directly applicable frameworks are:
  // - FATF Recommendation 16 (Travel Rule) for cross-chain transfers
  // - MiCA Art. 68 with bridge-specific asset safeguarding language
  // - MiCA Art. 67 (organisational requirements) for bridge governance
  // - OFAC sanctions compliance for bridge-facilitated transfers
  regulatoryContext: [
    {
      framework: "FATF R.16",
      displayName: "FATF Recommendation 16 (Travel Rule)",
      clause: "Originator/Beneficiary Information for Cross-Chain VA Transfers",
      violationDescription:
        "Cross-chain bridge transfers are virtual asset transfers under FATF guidance. Bridge protocol operators may qualify as VASPs if they facilitate cross-chain transfers on behalf of users. TVL cap governance directly affects the volume of transfers subject to Travel Rule obligations -- doubling the TVL cap from $25M to $50M potentially doubles the Travel Rule compliance exposure. Bridge parameter governance without documented compliance procedures for originator/beneficiary information creates regulatory risk for bridge operators and their connected VASPs.",
      fineRange:
        "Regulatory enforcement action against VASP intermediaries; $25K-$1M per violation depending on jurisdiction; loss of banking relationships; deplatforming from centralized exchange counterparties used for bridge liquidity",
      severity: "high",
      safeguardDescription:
        "Accumulate policy engine captures bridge governance decisions (TVL cap changes, supported route additions) with cryptographic proof of compliance review. Travel Rule compliance assessment documented as a precondition for TVL cap increases, ensuring that increased bridge capacity is accompanied by proportional compliance infrastructure.",
    },
    {
      framework: "MiCA",
      displayName: "MiCA Art. 68 (EU Regulation 2023/1114)",
      clause: "Asset Safeguarding -- Bridge Escrow Assets",
      violationDescription:
        "Bridge protocol foundation operating as a CASP in the EU fails to adequately safeguard client assets held in bridge escrow contracts as required by MiCA Art. 68. TVL cap governance is directly relevant: the TVL cap controls the maximum value at risk in the bridge's custody. Increasing the TVL cap from $25M to $50M without proportional safeguarding measures (additional audits, insurance coverage, validator set strengthening) constitutes inadequate asset safeguarding for the increased custody exposure.",
      fineRange:
        "Up to EUR 5M or 3% of annual turnover; potential withdrawal of CASP authorization; supervisory measures including restriction of bridge operations",
      severity: "critical",
      safeguardDescription:
        "Accumulate captures the complete TVL cap governance decision chain -- risk assessment, security analysis, safeguarding measure review, cross-chain governance approvals -- providing evidence of adequate asset safeguarding governance proportional to the bridge's custody exposure as required by MiCA Art. 68.",
    },
    {
      framework: "MiCA",
      displayName: "MiCA Art. 67 (EU Regulation 2023/1114)",
      clause: "Organisational Requirements -- Bridge Governance Procedures",
      violationDescription:
        "Bridge protocol foundation operating in the EU fails to implement effective procedures for risk management, internal controls, and record-keeping for bridge parameter governance as required by MiCA Art. 67. TVL cap changes, validator set rotations, and supported chain additions executed without documented governance procedures, audit trails, or risk assessments demonstrate material organisational deficiency.",
      fineRange:
        "Up to EUR 5M or 3% of annual turnover; up to EUR 700K for natural persons; potential withdrawal of CASP authorization",
      severity: "high",
      safeguardDescription:
        "Accumulate provides documented cross-organizational governance procedures with cryptographic proof of every bridge parameter decision, satisfying MiCA Art. 67 requirements for internal control mechanisms, risk management procedures, and record-keeping across the bridge's multi-chain governance structure.",
    },
    {
      framework: "OFAC",
      displayName: "OFAC Sanctions Compliance for Bridge Transfers",
      clause: "Specially Designated Nationals and Blocked Persons -- Bridge Operations",
      violationDescription:
        "Bridge protocol facilitating cross-chain transfers without screening for OFAC-sanctioned addresses, sanctioned jurisdictions, or sanctioned protocols. The Tornado Cash sanctions (August 2022) established that DeFi protocol smart contracts can be sanctioned. TVL cap increases that expand bridge capacity without proportional sanctions screening infrastructure create compliance exposure. Bridge governance documentation must demonstrate that sanctions compliance is considered in parameter governance decisions.",
      fineRange:
        "Civil penalties up to $356,579 per violation; criminal penalties up to $1M and 20 years imprisonment for willful violations (IEEPA); asset freezing; potential sanctions designation of bridge contracts",
      severity: "critical",
      safeguardDescription:
        "Bridge governance policy includes OFAC sanctions compliance review as a precondition for TVL cap increases. Cryptographic proof that sanctions screening infrastructure scales with bridge capacity ensures compliance posture is maintained as the bridge grows.",
    },
  ],
  tags: [
    "web3",
    "cross-chain",
    "bridge",
    "multi-org",
    "governance",
    "bridge-parameters",
    "tvl-cap",
    "bridge-escrow",
    "oracle-validator",
    "parameter-propagation",
    "cross-chain-messaging",
    "fatf",
    "travel-rule",
    "sanctions-screening",
    "ofac",
    "mica",
    "wormhole",
    "layerzero",
    "axelar",
  ],
};
```

### Corrected Narrative Journey (Markdown)

```markdown
## 6. Cross-Chain Bridge Governance

**Setting:** A Bridge Protocol governance council needs to approve a TVL cap increase from $25M to $50M to accommodate growing bridge usage. This doubles the maximum potential loss in a bridge exploit -- a major risk governance decision, not a routine parameter change. The Bridge Council Member must perform a risk assessment (security analysis, liquidity depth review, exploit loss projection), then coordinate governance approval from representatives on both the source chain and the destination chain. Each chain has its own governance mechanism, finality time, and voting cadence. The Destination Chain Governor is traveling and the governance coordination window is closing. The bridge is approaching its $25M TVL cap -- new deposit transactions are beginning to revert, forcing users to route through competing bridges with potentially weaker security.

Real-world context: Bridge TVL caps are the primary risk control for cross-chain bridge protocols. The Wormhole exploit ($320M), Ronin exploit ($625M), Nomad exploit ($190M), and Harmony Horizon exploit ($100M) all demonstrate that bridge TVL is the primary determinant of maximum loss. TVL cap governance at major bridges (Wormhole, Stargate, Axelar) involves multi-day governance cycles with security review, community discussion, and cross-chain coordination.

**Players:**
- **Bridge Protocol** (organization) -- cross-chain bridge with $25M current TVL cap
  - Bridge Council Member -- elected governance member, risk assessor, initiator. Mandatory approver.
  - Relayer System -- cross-chain parameter propagation infrastructure
  - Bridge Escrow Contract -- on-chain contract enforcing TVL cap, where locked assets are held
  - Oracle / Validator System -- cross-chain message verification (guardian/validator set)
- **Source Chain Governance** (partner organization) -- sovereign governance body of the source blockchain
  - Source Chain Governor -- governance representative for the source chain
- **Destination Chain Governance** (partner organization) -- sovereign governance body of the destination blockchain
  - Destination Chain Governor -- governance representative for the destination chain (traveling)

**Action:** Authorize bridge TVL cap increase from $25M to $50M. Requires 2-of-3 approval from Bridge Council Member, Source Chain Governor, and Destination Chain Governor. Bridge Council Member is mandatory. Delegation to Relayer System allowed for pre-approved TVL cap increases of 25% or less. Auto-escalation to Bridge Escrow Contract (automated rate limiting) when governance stalls during capacity-critical periods. Maximum TVL cap increase of $50M (2x current cap). Production environment only. Estimated cost of governance stall: ~$2,500/hour in lost bridging fees and user opportunity cost.

---

### Today's Process

**Policy:** All 3 of 3 must approve. No delegation. No escalation. Short expiry.

1. **Risk assessment and governance proposal.** Bridge Council Member performs risk assessment for doubling the TVL cap: security analysis (doubling the cap = doubling the maximum potential loss in an exploit from $25M to $50M), liquidity depth review on both chains, bridge contract audit status, oracle/validator system health check, and insurance/backstop capacity evaluation. Publishes governance forum proposal with risk justification. *(~10 sec delay)*

2. **Cross-chain governance votes.** Snapshot votes initiated on both chain governance forums -- each chain operates its own governance system with its own voting period (3-5 days), quorum requirements, and delegate participation. Chain governors must independently review the TVL impact analysis, verify bridge contract state on their respective chains, and assess whether the cap increase aligns with their chain's risk tolerance. *(~6 sec delay)*

3. **Destination Chain Governor traveling.** The Destination Chain Governor is traveling and cannot participate in the bridge council multisig ceremony. With 3-of-3 unanimous required and no delegation path, the TVL cap increase is completely blocked. *(~12 sec delay)*

4. **Bridge approaching capacity.** While governance stalls, bridge utilization approaches the $25M TVL cap. New deposit transactions begin reverting. Users route through competing bridges with potentially weaker security (lower validator thresholds, less-audited contracts, higher centralization). Bridge protocol loses fee revenue (~$417/hr for $10M daily volume at 0.1% fee). Ecosystem fragmentation accelerates.

5. **Outcome:** Governance coordination delayed 72+ hours (potentially weeks if the Destination Chain Governor remains unavailable). Bridge at capacity with deposits being rejected. Users migrating to less-secure alternatives. Audit trail fragmented across: governance forum on both chains (separate proposal discussions), Snapshot (separate votes stored on IPFS), bridge council multisig (Discord coordination for signing ceremony), risk assessment (PDF or forum post not cryptographically linked to the parameter change), and relayer execution (no proof linking governance approval to parameter update). No verification that the risk assessment was reviewed before the governance vote.

**Metrics:** ~72 hours of coordination delay (12-20 hours active manual effort), 14 days of risk exposure (capacity constraint + security risk from increased TVL), 6 audit gaps, 7 manual steps. Estimated cost of delay: ~$2,500/hour.

---

### With Accumulate

**Policy:** 2-of-3 threshold (Bridge Council Member, Source Chain Governor, Destination Chain Governor). Bridge Council Member is mandatory. Delegation to Relayer System for pre-approved TVL cap increases of 25% or less. Auto-escalation to Bridge Escrow Contract (automated rate limiting) after governance quorum failure. Maximum TVL cap increase of 2x current cap. Production environment only. 12-hour authority window.

1. **Request submitted with risk assessment.** Bridge Council Member submits the TVL cap increase after completing the risk assessment. The policy engine validates the parameter change against the 2x maximum cap constraint, confirms the Bridge Council Member (mandatory approver) has signed off with the risk assessment, and routes the approval request to both chain governors with the security analysis, liquidity depth review, exploit loss projection, and bridge contract audit status attached.

2. **Threshold met.** Bridge Council Member and Source Chain Governor both approve within the 12-hour authority window. The 2-of-3 threshold is met with the mandatory approver (Bridge Council Member) present. The Destination Chain Governor's travel does not block the parameter update. If the Destination Chain Governor becomes available, they can add their approval to strengthen the governance record.

3. **Parameter change propagated.** The Relayer System receives the cryptographic governance proof -- linking the risk assessment, chain governance approvals, Bridge Council Member sign-off, and TVL cap constraint verification -- and propagates the TVL cap update to bridge escrow contracts on both chains. The Oracle/Validator System attests to the governance proof for cross-chain verification.

4. **If needed, delegation.** For routine TVL cap increases within pre-approved bounds (e.g., 25% or less increase from a prior governance cycle), the Relayer System can execute the parameter update directly under delegated authority. Delegation constraints prevent the delegate from executing increases exceeding 25%, validator set rotations, bridge contract upgrades, rate limit changes exceeding 50%, or any operation that increases the bridge's security risk profile beyond pre-approved bounds.

5. **If needed, escalation.** If the 2-of-3 threshold cannot be met within the 12-hour authority window and the bridge is approaching its TVL cap, the system auto-escalates to the Bridge Escrow Contract to activate automated rate limiting. Rate limiting throttles new deposits (rather than rejecting them entirely), giving the governance process more time to reach quorum while preventing a complete user experience failure.

6. **Outcome:** TVL cap increased from $25M to $50M before the bridge reaches capacity. No governance stall. Cross-organizational authorization recorded with cryptographic proof linking risk assessment -> chain governance approvals -> Bridge Council Member sign-off -> relayer parameter propagation -> bridge escrow contract update -> oracle/validator attestation. Parameter consistency verified across both chains. Sanctions compliance review documented as part of the governance decision.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Approval threshold | 3-of-3 unanimous across three independent organizations | 2-of-3 threshold with Bridge Council Member mandatory |
| Risk assessment provenance | PDF or forum post with no cryptographic binding to parameter change | Risk assessment hash attached to governance proof -- security analysis, liquidity review, exploit loss projection all linked |
| Cross-chain coordination | Separate governance forums, Snapshot votes, and multisig ceremony with manual coordination | Unified cross-org governance with async threshold approval across chain governance bodies |
| When a chain governor is traveling | Entire TVL cap increase blocked indefinitely | Threshold met without them; delegation or escalation as backup |
| Delegation | None -- full cross-chain governance for every parameter change | Relayer System executes pre-approved routine changes (25% or less increase) within delegation constraints |
| Escalation | None -- bridge at capacity with deposits rejecting while governance stalls | Auto-escalation to automated rate limiting, preventing complete user experience failure |
| Parameter propagation | Manual relayer execution with no proof linking governance to parameter update | Cryptographic governance proof propagated with parameter change; oracle/validator attestation for cross-chain verification |
| Audit trail | Fragmented: two governance forums, two Snapshot votes, Discord coordination, risk PDF, relayer transaction | Unified cryptographic proof chain: risk assessment -> chain approvals -> parameter propagation -> contract update |
| Regulatory posture | No documented bridge governance process (FATF Travel Rule, MiCA Art. 67/68, OFAC exposure) | Documented cross-chain governance satisfying FATF Travel Rule documentation, MiCA Art. 67/68 safeguarding, OFAC compliance review |
```

---

## 5. Credibility Risk Assessment

### Bridge Security Lead (Wormhole/LayerZero/Axelar)

**Would challenge in ORIGINAL:**
- The entire governance model. No major bridge protocol uses "Chain A Governor" and "Chain B Governor" as named roles in TVL cap governance. Wormhole uses Guardians. LayerZero uses DVN operators. Axelar uses validators. The governance model described is a generic multi-org coordination scenario with bridge terminology applied as a skin.
- Missing bridge escrow contract and oracle/validator system. These are the two most fundamental components of bridge architecture. Omitting them is like describing a bank without accounts.
- Delegation from bridge council to "Chain A Governor" -- this creates asymmetric governance that no bridge protocol would accept.
- No risk assessment function. A TVL cap increase from $25M to $50M doubles the maximum exploit loss. No bridge security lead would approve this without documented risk assessment.
- Generic regulatory context (MiCA Art. 68 about "multi-sig authorization") that says nothing about bridge-specific asset safeguarding.

**Would accept in CORRECTED:**
- Mandatory bridge council member with explicit risk assessment responsibility.
- Bridge escrow contract and oracle/validator system as system actors.
- Delegation constraints preventing validator set rotations and contract upgrades from being delegated.
- Bridge-specific regulatory context (FATF Travel Rule for cross-chain transfers, MiCA Art. 68 bridge-specific safeguarding, OFAC sanctions compliance).
- Detailed enumeration of audit gaps and approval steps.
- Real-world bridge protocol references (Wormhole, LayerZero, Axelar, Stargate, Connext).

### Bridge Security Council / Guardian Set Member

**Would challenge in ORIGINAL:**
- No mandatory approver. A TVL cap increase should never be approved without the bridge team's risk assessment -- chain governors alone do not have the security expertise to evaluate bridge exploit risk.
- No delegation constraints. Bridge governance delegation without constraints is extremely dangerous -- delegation should never extend to validator set rotations or contract upgrades.
- No escalation. When a bridge approaches its TVL cap, there must be a fallback mechanism (rate limiting, temporary cap extension within narrow bounds) to prevent complete service degradation.
- 1-hour expiry window. Cross-chain governance requires coordination across organizations in different time zones. 1 hour is too short for genuine deliberation.

**Would accept in CORRECTED:**
- 12-hour authority window accommodating cross-timezone coordination.
- Mandatory bridge council member approval.
- Delegation constraints explicitly excluding validator rotations, contract upgrades, and emergency pauses.
- Escalation to automated rate limiting as a capacity management fallback.
- 2x maximum TVL cap increase constraint preventing governance capture attacks.

### Cross-Chain Messaging Protocol Engineer

**Would challenge in ORIGINAL:**
- No discussion of cross-chain parameter propagation mechanics. How does the TVL cap update reach both chains? What happens during the propagation window? What if the update succeeds on one chain but fails on the other?
- No oracle/validator system actor. The oracle/validator system must attest to the governance proof before the parameter change is executed on the destination chain.
- The relayer system is included but not connected to the chain governance bodies in the edge graph.
- No mention of finality differences between chains (Ethereum ~13 min, L2 ~1 min, Solana ~0.4 sec) and how they affect parameter propagation.

**Would accept in CORRECTED:**
- Oracle/Validator System as an explicit system actor with cross-chain message verification responsibility.
- Relayer System description including cross-chain finality differences and parameter consistency window.
- Bridge Escrow Contract as the system being modified.
- Detailed description of cross-chain parameter propagation in the workflow.

### Bridge Exploit Researcher

**Would challenge in ORIGINAL:**
- No quantification of the risk of doubling the TVL cap. A cap increase from $25M to $50M doubles the maximum potential loss in an exploit. This is mentioned nowhere in the original scenario.
- No reference to real-world bridge exploits or their relationship to TVL (Wormhole $320M, Ronin $625M, etc.).
- No discussion of insurance/backstop capacity relative to the increased TVL cap.
- The $25M-to-$50M increase is treated as a routine parameter change when it is a major risk governance decision.

**Would accept in CORRECTED:**
- Explicit framing of the TVL cap increase as doubling the maximum exploit loss.
- Real-world bridge exploit references in the docblock and descriptions.
- Constraints limiting the maximum TVL increase (2x cap) to prevent governance capture.
- Risk assessment as a mandatory precondition (mandatory approver performing security analysis).

### Regulatory Analyst (Bridge Compliance)

**Would challenge in ORIGINAL:**
- Generic REGULATORY_DB.web3 entries that say nothing about bridge governance specifically.
- No FATF Travel Rule coverage -- cross-chain bridge transfers are explicitly covered by FATF guidance as virtual asset transfers.
- No OFAC sanctions compliance discussion -- directly relevant after Tornado Cash sanctions and bridge-facilitated sanctions evasion.
- No MiCA Art. 67 coverage for bridge operational governance.
- MiCA Art. 68 language about "Treasury action without verified multi-sig authorization" is CASP custody language, not bridge-specific.

**Would accept in CORRECTED:**
- FATF R.16 entry specifically addressing cross-chain transfers and Travel Rule compliance exposure proportional to TVL cap.
- MiCA Art. 68 entry with bridge-specific asset safeguarding language (escrow assets, custody exposure proportional to TVL cap).
- MiCA Art. 67 entry addressing bridge governance organisational requirements.
- OFAC entry referencing Tornado Cash precedent and bridge-specific sanctions compliance.
- Sanctions compliance review documented as a precondition for TVL cap increases.
