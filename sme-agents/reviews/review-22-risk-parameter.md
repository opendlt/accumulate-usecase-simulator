# SME Review: DeFi Risk Parameter Update

## Agent Profile
**Agent ID:** 22
**Specialization:** DeFi Risk Parameter Update -- Lending Protocol Risk Governance, Quantitative Modeling & On-Chain Parameter Execution
**Files Reviewed:**
- `src/scenarios/web3/risk-parameter.ts` (primary)
- `docs/scenario-journeys/web3-scenarios.md` Section 3 (primary)
- `src/lib/regulatory-data.ts` (primary)
- `src/scenarios/archetypes.ts` (reference)
- `src/types/policy.ts` (reference)
- `src/types/scenario.ts` (reference)
- `src/types/organization.ts` (reference)
- `src/types/regulatory.ts` (reference)
- `src/scenarios/web3/treasury-governance.ts` (reference, corrected)
- `src/scenarios/web3/emergency-pause.ts` (reference, corrected)

---

## 1. Executive Assessment

**Overall Credibility Score: D+**

This scenario is the weakest of the three Web3 scenarios by a significant margin. While the treasury-governance and emergency-pause scenarios were thoroughly corrected with rich domain knowledge, detailed comments, inline regulatory context, mandatory approvers, delegation constraints, escalation paths, constraints, and cost-per-hour estimates, the risk-parameter scenario reads like a first-draft stub. It lacks nearly every structural improvement present in its sibling scenarios, imports the generic `REGULATORY_DB.web3` instead of using domain-specific inline regulatory context, omits critical DeFi risk governance actors (risk service provider, Governor contract, Timelock, Risk Steward), reverses the real-world delegation authority flow, misclassifies the external auditor as an internal role, and provides a narrative section so thin it would be challenged by any DeFi risk professional.

### Top 3 Most Critical Issues

1. **CRITICAL -- `REGULATORY_DB.web3` is not applicable to DeFi risk parameter governance.** MiCA Art. 68 is about CASP asset safeguarding (custody). SEC Rule 206(4)-2 is the investment adviser custody rule. Neither addresses lending protocol risk parameter management. The scenario needs inline regulatory context referencing MiCA Art. 67 (organisational requirements including risk management), Basel Committee on Banking Supervision prudential treatment of cryptoasset exposures, and CFTC enforcement considerations for margin-equivalent DeFi lending products. The corrected sibling scenarios both use inline `regulatoryContext` with 3-4 domain-specific entries. This scenario imports a shared database with generic entries.

2. **CRITICAL -- Delegation from `risk-lead` to `protocol-governor` reverses the real-world authority flow.** In DeFi lending protocol risk governance, the governance body (DAO/token holders/Governor) delegates risk management authority to the risk service provider or risk committee -- not the other way around. The Risk Lead (quantitative analyst who produces Monte Carlo simulations and risk parameter recommendations) does not delegate to the Protocol Governor (governance delegate who votes). The delegation edge should flow from the governance body to a risk execution mechanism (Risk Steward, fast-track multisig) for routine parameter adjustments within governance-approved risk caps.

3. **CRITICAL -- Missing `mandatoryApprovers`, `delegationConstraints`, `escalation`, `constraints`, and `costPerHourDefault`.** All five structural fields present in the corrected treasury-governance and emergency-pause scenarios are absent from this scenario. This creates a fundamental inconsistency within the web3 scenario set. A risk parameter scenario without mandatory approvers (who is required to sign off on the quantitative analysis?), without delegation constraints (can delegation be used for risk-INCREASING parameter changes?), without escalation (what happens when the risk committee cannot reach threshold during a market crash?), without constraints (what is the maximum LTV change per proposal?), and without cost-per-hour (what is the insolvency risk exposure per hour of delay?) is incomplete for any production demonstration.

### Top 3 Strengths

1. **Correct archetype selection.** `multi-party-approval` is the appropriate archetype for risk parameter governance, which requires multi-stakeholder review (risk team, governance delegates, auditors) before parameter execution.

2. **Accurate high-level problem framing.** The description correctly identifies the "market volatility outpacing governance" problem, which is real and well-documented (MakerDAO Black Thursday, Aave CRV market freeze, Compound distribution bug). The 24-72 hour governance latency is realistic for the full governance cycle.

3. **Reasonable actor structure as a starting point.** The Risk Committee, Risk Lead, Quant Analyst, Protocol Governor, and Lending Pool Contract form a reasonable skeleton of the risk governance workflow, even though critical actors are missing and the auditor is mistyped.

---

## 2. Line-by-Line Findings

### Finding 1
- **Location:** `src/scenarios/web3/risk-parameter.ts`, line 4
- **Issue Type:** Inconsistency
- **Severity:** Critical
- **Current Text:** `import { REGULATORY_DB } from "@/lib/regulatory-data";`
- **Problem:** The corrected sibling scenarios (treasury-governance.ts, emergency-pause.ts) do NOT import `REGULATORY_DB`. They use inline `regulatoryContext` arrays with domain-specific regulatory entries. Importing `REGULATORY_DB.web3` pulls in MiCA Art. 68 (CASP asset safeguarding) and SEC Rule 206(4)-2 (investment adviser custody) -- neither of which applies to DeFi lending protocol risk parameter management. This creates both a domain inaccuracy and a structural inconsistency.
- **Corrected Text:** Remove the import line entirely. Use inline `regulatoryContext` array.
- **Source/Rationale:** MiCA Art. 68 addresses CASP custody obligations. SEC Rule 206(4)-2 is the custody rule for SEC-registered investment advisers. DeFi lending protocol risk parameter governance is governed by different frameworks: MiCA Art. 67 (organisational requirements including risk management), Basel Committee prudential treatment of cryptoasset exposures (December 2022 standard), and CFTC enforcement considerations for margin-equivalent products.

### Finding 2
- **Location:** `src/scenarios/web3/risk-parameter.ts`, line 138
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `regulatoryContext: REGULATORY_DB.web3,`
- **Problem:** Uses shared generic web3 regulatory entries instead of domain-specific inline context. Both corrected sibling scenarios use inline arrays with 3-4 detailed, scenario-specific regulatory entries. This is the most glaring inconsistency with the established pattern.
- **Corrected Text:** Replace with inline `regulatoryContext` array containing MiCA Art. 67, Basel Committee BCBS d545, and CFTC enforcement considerations.
- **Source/Rationale:** Pattern established by treasury-governance.ts (4 inline entries: FATF R.16, OFAC, MiCA Art. 67, IRS 1099) and emergency-pause.ts (3 inline entries: DORA Art. 17-19, NIST SP 800-61, MiCA Art. 67).

### Finding 3
- **Location:** `src/scenarios/web3/risk-parameter.ts`, line 101
- **Issue Type:** Incorrect Workflow
- **Severity:** Critical
- **Current Text:** `{ sourceId: "risk-lead", targetId: "protocol-governor", type: "delegation" },`
- **Problem:** This delegation edge reverses the real-world authority flow in DeFi risk governance. In lending protocol governance, governance delegates (token holders, protocol governors) vote on risk parameter proposals submitted by the risk committee or elected risk service provider. The governance body delegates operational risk management authority to the risk committee/service provider via the Risk Steward or similar mechanism -- NOT the other way around. The Risk Lead does not delegate to the Protocol Governor; the Risk Lead submits proposals that the Protocol Governor votes on. If delegation is modeled, it should flow from the risk committee to an automated risk execution mechanism (Risk Steward) for routine parameter adjustments within governance-approved risk caps.
- **Corrected Text:** Change to delegation from risk committee to a risk steward/fast-track execution mechanism for routine adjustments within governance-approved caps.
- **Source/Rationale:** Aave v3 Risk Steward: governance delegates operational risk parameter authority to Gauntlet/Chaos Labs via Risk Steward contract that can adjust parameters within governance-approved risk caps without full governance vote. Compound: all parameter changes require Governor vote. MakerDAO: DC-IAM automatically adjusts debt ceilings within governance-approved parameters.

### Finding 4
- **Location:** `src/scenarios/web3/risk-parameter.ts`, lines 71-78
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `{ id: "auditor", type: NodeType.Role, label: "External Auditor", ... parentId: "defi-protocol", organizationId: "defi-protocol" }`
- **Problem:** An external auditor (Trail of Bits, OpenZeppelin, Spearbit, Consensys Diligence, Dedaub) is NOT an internal role within the DeFi protocol. They are an independent third-party vendor engaged under a services agreement. Typing the auditor as `NodeType.Role` with `parentId: "defi-protocol"` implies the auditor is an employee of the protocol, which fundamentally misrepresents the relationship. The auditor should be typed as `NodeType.Vendor` to correctly model the external service provider relationship.
- **Corrected Text:** `type: NodeType.Vendor` with appropriate `parentId` modeling the vendor relationship.
- **Source/Rationale:** All major DeFi protocol audits are performed by independent third-party firms: Trail of Bits, OpenZeppelin, Spearbit, Consensys Diligence, Dedaub, Halborn, Certora, Runtime Verification. These firms are vendors, not protocol employees.

### Finding 5
- **Location:** `src/scenarios/web3/risk-parameter.ts`, lines 80-92
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** Policy has no `mandatoryApprovers` field.
- **Problem:** In real DeFi risk parameter governance, the Risk Lead (or the elected risk service provider such as Gauntlet/Chaos Labs) is the mandatory initiator who drafts the risk assessment, produces the Monte Carlo simulation results, and submits the parameter recommendation. The quantitative analysis must be reviewed by a qualified risk analyst before any parameter change is executed. Without a mandatory approver, the 3-of-4 threshold could theoretically be met by the Quant Analyst, Protocol Governor, and Auditor without the Risk Lead ever signing off -- bypassing the quantitative analysis review. Both corrected sibling scenarios include `mandatoryApprovers`.
- **Corrected Text:** Add `mandatoryApprovers: ["risk-lead"],`
- **Source/Rationale:** Pattern established by treasury-governance.ts (`mandatoryApprovers: ["treasury-lead"]`) and emergency-pause.ts (`mandatoryApprovers: ["guardian"]`).

### Finding 6
- **Location:** `src/scenarios/web3/risk-parameter.ts`, lines 80-92
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Policy has no `delegationConstraints` field.
- **Problem:** If delegation is allowed for risk parameter changes, it must be constrained. Delegation should only apply to risk-REDUCING parameter changes (lowering LTV, increasing liquidation bonus, reducing supply/borrow caps, freezing assets) -- NOT risk-INCREASING changes (raising LTV, lowering liquidation bonus, increasing supply/borrow caps, unfreezing assets). Risk-increasing changes should always require full governance vote. Without delegation constraints, the delegation mechanism could be used to bypass governance for changes that increase protocol risk exposure. This is a critical governance safety mechanism modeled by the Aave Risk Steward, which can only make parameter adjustments within governance-approved risk caps and cannot increase risk beyond those caps.
- **Corrected Text:** Add `delegationConstraints: "..."` with risk-reducing-only constraint language.
- **Source/Rationale:** Aave v3 Risk Steward can only adjust parameters within governance-approved risk caps. It cannot increase LTV above the governance-approved maximum or increase supply caps beyond the governance-approved limit. Risk-increasing changes always require full governance vote through AIP -> Governor -> Timelock.

### Finding 7
- **Location:** `src/scenarios/web3/risk-parameter.ts`, lines 80-92
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Policy has no `escalation` field.
- **Problem:** When market conditions are rapidly deteriorating and the risk committee cannot reach the approval threshold (e.g., auditor unavailable, quant analyst traveling), there must be an escalation path. In production DeFi lending protocols, this escalation path is the emergency parameter update mechanism: a multisig (Guardian/Security Council) that can make risk-reducing parameter changes (freeze assets, lower LTV, increase liquidation bonus) without the full governance vote. Without an escalation path, the protocol remains exposed to insolvency risk during the governance delay -- which is precisely the problem the scenario is supposed to address.
- **Corrected Text:** Add `escalation: { afterSeconds: 20, toRoleIds: ["emergency-multisig"] }` or equivalent.
- **Source/Rationale:** Aave Emergency Admin (5-of-10 multisig) can freeze reserves and adjust parameters without governance vote. Compound Pause Guardian can freeze markets. MakerDAO Emergency Shutdown Module (ESM) provides last-resort system halt. Both corrected sibling scenarios include escalation rules.

### Finding 8
- **Location:** `src/scenarios/web3/risk-parameter.ts`, lines 80-92
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Policy has no `constraints` field.
- **Problem:** Risk parameter changes should have environment constraints (production only -- risk parameter changes on testnet/staging do not use governance authority) and potentially amount constraints (maximum LTV change per proposal, maximum collateral ratio adjustment per governance cycle). Without constraints, the policy allows arbitrary parameter changes in any environment.
- **Corrected Text:** Add `constraints: { environment: "production" }`.
- **Source/Rationale:** Pattern established by emergency-pause.ts (`constraints: { environment: "production" }`). Aave Risk Steward has per-parameter adjustment caps (e.g., maximum 2% LTV change per update, maximum 10% supply cap change per update).

### Finding 9
- **Location:** `src/scenarios/web3/risk-parameter.ts` (missing field at top level)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `costPerHourDefault` field present.
- **Problem:** During a market volatility event where the collateral ratio needs urgent adjustment, each hour of delay increases protocol insolvency risk. For a lending protocol with $100M-$1B TVL, each hour of undercollateralization during a market crash represents $100K-$10M+ in potential bad debt. The MakerDAO Black Thursday event (March 2020) resulted in $8.3M of bad debt -- and that was a single-day event. The cost-per-hour is essential for the simulator to demonstrate the economic impact of governance delay. Both corrected sibling scenarios include `costPerHourDefault`.
- **Corrected Text:** Add `costPerHourDefault: 500000,` with detailed comment explaining the derivation.
- **Source/Rationale:** MakerDAO Black Thursday: $8.3M bad debt in approximately 12 hours = ~$700K/hour. Euler Finance: $197M loss in ~1 hour. $500K/hour is a conservative mid-tier estimate for a protocol with $200M-$500M TVL during a 30%+ market crash.

### Finding 10
- **Location:** `src/scenarios/web3/risk-parameter.ts`, line 114
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `approvalSteps: 8,`
- **Problem:** The narrative describes approximately 5 steps (forum proposal, manual analysis, auditor review, governance vote, on-chain execution), yet the TypeScript claims 8 approval steps. The 8 steps are not enumerated in comments. Both corrected sibling scenarios provide detailed enumeration of every step with inline comments. Without enumeration, the number appears arbitrary.
- **Corrected Text:** Either enumerate 8 distinct steps in comments to justify the count, or adjust the count to match the enumerated steps. A realistic full governance cycle has approximately 8-9 steps: (1) Risk service provider drafts risk assessment, (2) Forum post with Monte Carlo results, (3) Community review and discussion, (4) Quant analyst independent verification, (5) Auditor safety review, (6) Snapshot signaling vote, (7) On-chain Governor proposal submission, (8) On-chain voting period + timelock delay, (9) Parameter execution on lending pool contract.
- **Source/Rationale:** Pattern established by treasury-governance.ts (7 steps, each enumerated in comments) and emergency-pause.ts (4 steps, each enumerated in comments).

### Finding 11
- **Location:** `src/scenarios/web3/risk-parameter.ts`, line 113
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `auditGapCount: 3,`
- **Problem:** Three audit gaps are claimed but not enumerated. Both corrected sibling scenarios enumerate every audit gap with specific descriptions in detailed comments (treasury-governance.ts has 5 enumerated, emergency-pause.ts has 7 enumerated). Without enumeration, the count is unverifiable and appears arbitrary. The actual audit gaps in a DeFi risk parameter governance workflow likely include: (1) Monte Carlo simulation results not cryptographically linked to the parameter proposal, (2) Governance forum discussion not linked to on-chain execution, (3) Snapshot signaling vote not cryptographically bound to the on-chain Governor proposal, (4) Auditor review not formally attached to the parameter change record, (5) On-chain parameter execution not linked back to the risk assessment that justified it. This suggests 5 audit gaps, not 3.
- **Corrected Text:** Enumerate each audit gap in comments and adjust count to 5.
- **Source/Rationale:** Consistent with treasury-governance.ts (5 gaps enumerated) and emergency-pause.ts (7 gaps enumerated).

### Finding 12
- **Location:** `src/scenarios/web3/risk-parameter.ts`, line 111
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `manualTimeHours: 24,`
- **Problem:** 24 hours is understated for the full governance cycle. The complete risk parameter update workflow is: forum discussion (3-7 days) + Snapshot signaling vote (3-5 days) + on-chain Governor proposal (2-3 day voting period) + timelock delay (24-48 hours) = 8-15 days total. Even scoped to active coordination time (excluding passive waiting), 24 hours is low. The active manual effort includes: risk assessment drafting (4-8 hours), Monte Carlo simulation and analysis (4-8 hours), forum proposal preparation (2-4 hours), community Q&A response (4-8 hours), auditor engagement coordination (2-4 hours), Snapshot vote setup and monitoring (1-2 hours), Governor proposal submission (1-2 hours). This totals 18-36 hours of active manual effort. 24 hours is within this range but at the low end. 36 hours would be more representative, or 48 hours if including the full elapsed time with governance waiting periods.
- **Corrected Text:** Change to `manualTimeHours: 36,` or document that 24 hours represents active coordination time only, excluding passive governance waiting periods.
- **Source/Rationale:** Aave risk parameter governance cycle: Gauntlet/Chaos Labs risk assessment publication (1-2 days) + community review (3-5 days) + Snapshot vote (2-3 days) + AIP submission + Governor voting (3 days) + timelock (24 hours). Total elapsed: 10-14 days. Active manual effort: 24-40 hours.

### Finding 13
- **Location:** `src/scenarios/web3/risk-parameter.ts`, lines 52-59
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `{ id: "protocol-governor", type: NodeType.Role, label: "Protocol Governor", description: "Governance delegate representing large token holders — reviews risk proposals and votes via Snapshot", parentId: "defi-protocol" }`
- **Problem:** "Protocol Governor" as a single actor with `NodeType.Role` is an oversimplification. In real DeFi governance, there is no single "Protocol Governor." The governance process involves multiple governance delegates (Gauntlet, Chaos Labs, a]16z, Polychain, university blockchain clubs, individual delegates), each with their own delegated voting power. A single "Protocol Governor" actor implies a single point of governance authority, which is antithetical to decentralized governance. The actor should either be renamed to "Governance Delegates" (plural, representing the aggregate governance body), or be typed as `NodeType.Department` to represent the governance delegate collective, or be renamed to something like "Lead Governance Delegate" to clarify it represents a single large delegate.
- **Corrected Text:** Rename to "Lead Governance Delegate" with description clarifying the role, or keep as a representative actor but acknowledge the abstraction in comments.
- **Source/Rationale:** Aave governance has 100+ active delegates. Compound has ~50 active delegates. No single actor is "the" Protocol Governor -- governance authority is distributed across delegates via token-weighted delegation.

### Finding 14
- **Location:** `src/scenarios/web3/risk-parameter.ts` (missing actor)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No risk service provider actor.
- **Problem:** In production DeFi lending protocols, the quantitative risk analysis (Monte Carlo simulations, VaR/CVaR computation, historical volatility analysis, liquidity depth assessment) is performed by an elected external risk service provider -- Gauntlet, Chaos Labs, Warden Finance, or Risk DAO -- not by an internal "Quant Analyst." The risk service provider is the most critical actor in the governance workflow because they produce the risk assessment that justifies the parameter change. Without this actor, the scenario misrepresents who actually performs the quantitative analysis in production lending protocols. The "Quant Analyst" role is reasonable as an internal team member, but the external risk service provider is a separate, critical actor that should be modeled as `NodeType.Vendor`.
- **Corrected Text:** Add a risk service provider actor typed as `NodeType.Vendor`.
- **Source/Rationale:** Gauntlet is the elected risk service provider for Aave, Compound, Morpho, and other protocols. Chaos Labs serves Aave, Benqi, and others. These are external vendors, not internal roles.

### Finding 15
- **Location:** `src/scenarios/web3/risk-parameter.ts` (missing actor)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No on-chain execution mechanism (Governor contract / Timelock / Risk Steward) modeled as a separate actor.
- **Problem:** The parameter change is not applied directly to the lending pool contract. It goes through an on-chain governance execution stack: Governor contract (proposal submission, voting period) -> Timelock (delay period) -> Lending Pool Contract (parameter update execution). Alternatively, for routine adjustments within risk caps, the Risk Steward contract can update parameters without full governance vote. The scenario has "Lending Pool Contract" as the only system actor, but the intermediary execution mechanism is missing. This is analogous to the treasury-governance scenario modeling the Timelock Contract as a separate system actor, and the emergency-pause scenario modeling the Guardian Safe and Timelock as separate system actors.
- **Corrected Text:** Add a Governor/Timelock system actor or a Risk Steward system actor.
- **Source/Rationale:** Pattern established by treasury-governance.ts (Timelock Contract as separate system actor) and emergency-pause.ts (Guardian Safe and Timelock as separate system actors).

### Finding 16
- **Location:** `src/scenarios/web3/risk-parameter.ts`, lines 117-123
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** `manualSteps` with generic descriptions and low-detail content.
- **Problem:** The manual steps are thin compared to the corrected sibling scenarios. Treasury-governance.ts has 3 manual steps with 4-6 line descriptions each, including real-world tool names (Safe Transaction Builder, Tenderly, Discord), specific delay time mappings (simulation-compressed comments), and concrete operational details. Emergency-pause.ts has 3 manual steps with similar detail. This scenario's manual steps are 1-2 lines each with vague descriptions like "governance forum with Monte Carlo analysis" and "Snapshot voting."
- **Corrected Text:** Expand manual step descriptions to include specific tool names, concrete operational details, and simulation-compressed time mapping comments.
- **Source/Rationale:** Pattern established by both corrected sibling scenarios.

### Finding 17
- **Location:** `src/scenarios/web3/risk-parameter.ts`, lines 5-140
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No file-level JSDoc comment block.
- **Problem:** Both corrected sibling scenarios include extensive file-level JSDoc comment blocks (treasury-governance.ts: 40 lines, emergency-pause.ts: 54 lines) that explain the scenario's real-world context, key governance controls modeled, real-world protocol references, and relevant loss data. This scenario has no such comment block, making it harder for developers to understand the domain context and design rationale.
- **Corrected Text:** Add comprehensive JSDoc comment block.
- **Source/Rationale:** Pattern established by both corrected sibling scenarios.

### Finding 18
- **Location:** `src/scenarios/web3/risk-parameter.ts`, line 89
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `expirySeconds: 43200,`
- **Problem:** 43,200 seconds (12 hours) as the policy expiry. No comment explaining what this represents. In the corrected sibling scenarios, every numeric value has an inline comment explaining the simulation-compressed mapping. Treasury-governance.ts: `expirySeconds: 86400` (24 hours, with 6-line comment). Emergency-pause.ts: `expirySeconds: 300` (5 minutes, with 5-line comment). 12 hours is a reasonable authority window for a risk parameter update, but it needs context: is this the full governance cycle window (understated), the active coordination window (reasonable), or the emergency response window (overstated)?
- **Corrected Text:** Add detailed inline comment explaining the 12-hour authority window and its real-world mapping.
- **Source/Rationale:** Consistent with documentation patterns in corrected sibling scenarios.

### Finding 19
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 142-202 (Section 3)
- **Issue Type:** Understatement
- **Severity:** High
- **Current Text:** Section 3 is approximately 60 lines with a 5-row takeaway table.
- **Problem:** The narrative is dramatically thinner than the corrected Sections 1 and 2. Section 1 (Treasury Governance) has a detailed Setting paragraph with specific financial amounts, a Players section with actor descriptions and responsibilities, 5 numbered steps in "Today's Process" with delay annotations, 6 numbered steps in "With Accumulate" including delegation and escalation scenarios, a 9-row takeaway table, and ~72 lines total. Section 2 (Emergency Pause) has similar depth with 5 numbered steps in each process, a 9-row takeaway table, real-world exploit loss data, and regulatory references. Section 3 has a thin setting (2 sentences), minimal player descriptions (1 line each), 5 short steps in "Today's Process," 5 short steps in "With Accumulate" (no delegation/escalation demonstration), and a 5-row takeaway table. This creates a visible quality drop-off within the document.
- **Corrected Text:** Expand to match the depth and structure of Sections 1 and 2.
- **Source/Rationale:** Internal consistency within `web3-scenarios.md`.

### Finding 20
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 195-201
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Takeaway table has 5 rows: Approval model, Analysis tools, When Auditor is busy, Protocol solvency risk, Governance record.
- **Problem:** The takeaway table is missing critical dimensions present in the sibling scenario tables: delegation model (Section 1 has "Delegation"), escalation mechanism (Section 1 has "Escalation", Section 2 has "Escalation mechanism"), time to authorization (Section 1 has "Time to authorization", Section 2 has "Response time"), regulatory compliance (Section 2 has "Regulatory compliance"), and audit trail quality (Section 2 has "Post-mortem quality"). The "Analysis tools" row ("Manual Dune dashboard checks" vs. "Integrated risk data context") is vague and does not describe a meaningful Accumulate capability -- Accumulate is an authorization framework, not a risk analytics platform.
- **Corrected Text:** Expand to 8-9 rows including: Approval threshold, Delegation, Escalation, Risk parameter execution latency, Audit trail, Regulatory compliance, Liquidation cascade risk window, Cost of governance delay.
- **Source/Rationale:** Section 1 has 9 rows. Section 2 has 9 rows. Section 3 should have 8-9 rows for consistency.

### Finding 21
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, line 198
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `| Analysis tools | Manual Dune dashboard checks | Integrated risk data context |`
- **Problem:** "Integrated risk data context" implies Accumulate provides risk analytics capabilities. Accumulate is an authorization and policy enforcement framework -- it does not integrate Dune Analytics dashboards or provide risk data. What Accumulate provides is a policy engine that can enforce that a risk assessment (Monte Carlo simulation results, VaR computation, liquidity depth analysis) has been formally submitted and reviewed as a precondition for parameter change approval. The current text misrepresents Accumulate's value proposition.
- **Corrected Text:** Replace with a dimension that accurately describes Accumulate's contribution, such as "Risk assessment provenance | Risk PDF attached to Discord post -- no formal link to parameter change | Risk assessment cryptographically attached to parameter change approval with Monte Carlo simulation output hash."
- **Source/Rationale:** Accumulate is an authorization and audit trail framework, not a data analytics platform.

### Finding 22
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 163-172 (Today's Process)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Today's Process describes 5 steps with no real-world protocol references, no specific loss data, and no regulatory context.
- **Problem:** Sections 1 and 2 of the narrative include real-world references throughout: Section 1 references Safe{Wallet} UI, Transaction Builder, Tenderly, EIP-712, Chainalysis/TRM Labs, OFAC SDN list. Section 2 references Forta, OpenZeppelin Defender, Hexagate, Wormhole ($320M), Ronin ($600M), Nomad ($190M), Euler ($197M), DORA Art. 17-19, NIST SP 800-61. Section 3 mentions Dune Analytics once and Snapshot once but includes no real-world insolvency events, no specific protocol examples, and no regulatory references. The most relevant real-world event -- MakerDAO Black Thursday (March 2020, $8.3M bad debt from delayed governance response during ETH price crash) -- is not mentioned anywhere in the narrative.
- **Corrected Text:** Add real-world references throughout, especially MakerDAO Black Thursday, Aave CRV market freeze (July 2023), and Compound distribution bug (September 2021).
- **Source/Rationale:** MakerDAO Black Thursday is the canonical example of market volatility outpacing governance in DeFi lending. Its omission from this scenario is a significant gap.

### Finding 23
- **Location:** `src/scenarios/web3/risk-parameter.ts`, line 91
- **Issue Type:** Incorrect Workflow
- **Severity:** Medium
- **Current Text:** `delegateToRoleId: "protocol-governor",`
- **Problem:** Beyond the directional reversal (Finding 3), delegating to "protocol-governor" makes no semantic sense. The Protocol Governor is already an approver in the threshold (`approverRoleIds: ["risk-lead", "quant-analyst", "protocol-governor", "auditor"]`). Delegating FROM the Risk Lead TO an actor who is already in the approver set does not change the governance dynamics -- it just allows the Protocol Governor to act on behalf of the Risk Lead, which is semantically wrong because the Risk Lead's function (quantitative analysis, Monte Carlo simulation, risk assessment) cannot be performed by a governance delegate. Delegation should be to a role that is NOT already in the approver set and has a distinct operational function.
- **Corrected Text:** If delegation is modeled, delegate to a risk steward mechanism or an emergency risk multisig.
- **Source/Rationale:** Delegation to an existing approver in the threshold is a logic error -- it does not add any new capability or resilience to the approval process.

### Finding 24
- **Location:** `src/scenarios/web3/risk-parameter.ts`, lines 125-136
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** `todayPolicies` with `expirySeconds: 20` and `delegationAllowed: false`.
- **Problem:** The `todayPolicies` section lacks comments explaining the simulation compression. In the corrected sibling scenarios, every `todayPolicies` entry has detailed comments explaining what the simulation-compressed values represent in real-world terms. Treasury-governance.ts: 12-line comment on `todayPolicies`. Emergency-pause.ts: 10-line comment on `todayPolicies`. This scenario has zero comments on `todayPolicies`.
- **Corrected Text:** Add inline comments explaining that `expirySeconds: 20` represents the practical effect of the rigid governance cycle, `k: 4, n: 4` represents unanimous approval requirement, and `delegationAllowed: false` models the absence of Risk Steward-style fast-track parameter updates.
- **Source/Rationale:** Pattern established by both corrected sibling scenarios.

### Finding 25
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 177-189 (With Accumulate)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** "With Accumulate" section has 5 steps: Request submitted, Three approve, Smart Contract updated, Auditor reviews asynchronously, Outcome.
- **Problem:** The "With Accumulate" section does not demonstrate delegation or escalation, which are the two key Accumulate capabilities beyond threshold-based approval. Sections 1 and 2 both include explicit "If needed, delegation" and "If needed, escalation" steps that demonstrate these capabilities. Section 3 should include: "If needed, delegation -- for risk-reducing parameter adjustments within governance-approved risk caps, the Risk Steward mechanism can execute without full governance vote" and "If needed, escalation -- if the risk committee cannot reach threshold during rapidly deteriorating market conditions, the emergency risk multisig can execute risk-reducing parameter changes (freeze asset, lower LTV) without governance delay."
- **Corrected Text:** Add delegation and escalation demonstration steps.
- **Source/Rationale:** Pattern established by Sections 1 and 2 of `web3-scenarios.md`.

---

## 3. Missing Elements

1. **`costPerHourDefault` field.** Both corrected sibling scenarios include this with detailed cost derivation comments. For a lending protocol with $200M-$500M TVL during a 30%+ market crash, each hour of delay in risk parameter adjustment exposes the protocol to $500K+ in potential bad debt (calibrated from MakerDAO Black Thursday: $8.3M bad debt in ~12 hours).

2. **Risk Service Provider actor (`NodeType.Vendor`).** Gauntlet, Chaos Labs, Warden Finance, or Risk DAO -- the external firm that produces the Monte Carlo simulations and risk parameter recommendations. This is the most important actor in production risk governance.

3. **Governor/Timelock system actor.** The on-chain governance execution stack (Governor contract + Timelock) that intermediates between governance approval and parameter execution on the lending pool contract.

4. **Risk Steward / Emergency Risk Multisig actor.** The fast-track parameter update mechanism that enables routine risk-reducing adjustments without full governance vote. This is the key "with Accumulate" improvement for the scenario.

5. **`mandatoryApprovers` in policy.** Risk Lead must be mandatory -- the quantitative risk analysis cannot be bypassed.

6. **`delegationConstraints` in policy.** Delegation must be limited to risk-reducing parameter changes within governance-approved risk caps.

7. **`escalation` in policy.** Escalation to emergency risk multisig when threshold cannot be met during market volatility.

8. **`constraints` in policy.** Environment constraint (production) and potentially maximum LTV change per proposal.

9. **File-level JSDoc comment block.** Real-world context, key governance controls, protocol references, and loss data.

10. **Inline comments on all numeric values.** Every `expirySeconds`, `k/n`, `delaySeconds`, and metric value needs simulation-compression context.

11. **Real-world insolvency event references.** MakerDAO Black Thursday ($8.3M bad debt, March 2020), Compound COMP distribution bug ($80M+ misdistributed, September 2021), Aave CRV market freeze (July 2023, 5+ day governance delay).

12. **Enumerated audit gaps.** Each of the audit gaps must be described in comments, not just counted.

13. **Enumerated approval steps.** Each of the approval steps must be described in comments.

14. **Regulatory context entries specific to risk parameter governance.** MiCA Art. 67 (organisational requirements including risk management), Basel Committee BCBS d545 (prudential treatment of cryptoasset exposures), CFTC enforcement considerations for margin-equivalent DeFi lending products.

---

## 4. Corrected Scenario

### Corrected TypeScript (`risk-parameter.ts`)

```typescript
import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * DeFi Risk Parameter Update -- Lending Protocol Risk Governance,
 * Quantitative Modeling & On-Chain Parameter Execution
 *
 * Models the risk parameter governance workflow at a DeFi lending protocol
 * (Aave, Compound, MakerDAO, Venus, Euler, Morpho, Spark tier) when market
 * volatility demands urgent adjustment of collateral ratios (LTV / Liquidation
 * Threshold / Liquidation Bonus). The core governance challenge is that market
 * conditions can deteriorate faster than the governance cycle can respond:
 * forum discussion (3-7 days) + Snapshot signaling vote (3-5 days) + on-chain
 * Governor proposal (2-3 day voting period) + timelock delay (24-48 hours) =
 * 8-15 days total governance latency, while a market crash can render the
 * protocol insolvent in hours.
 *
 * Key governance controls modeled:
 * - 3-of-5 threshold with Risk Lead as mandatory approver (the quantitative
 *   risk assessment and Monte Carlo simulation results must be reviewed by
 *   the Risk Lead before any parameter change is authorized)
 * - Risk Service Provider (Gauntlet/Chaos Labs equivalent) as an external
 *   vendor producing the Monte Carlo simulations and risk parameter
 *   recommendations
 * - Delegation from Risk Committee to Risk Steward mechanism for routine
 *   risk-reducing parameter adjustments within governance-approved risk caps
 * - Delegation constrained to risk-reducing changes only: lower LTV,
 *   increase liquidation bonus, reduce supply/borrow caps, freeze assets.
 *   Risk-increasing changes always require full governance vote.
 * - Escalation to Emergency Risk Multisig when the Risk Committee cannot
 *   reach quorum during rapidly deteriorating market conditions
 * - Governor/Timelock system as the on-chain governance execution stack
 *   between governance approval and lending pool parameter update
 *
 * Real-world protocol insolvency events demonstrating governance latency risk:
 * - MakerDAO "Black Thursday" (March 2020): ETH crashed 50%+ in hours.
 *   Governance could not adjust parameters fast enough. $8.3M in bad debt
 *   from zero-bid vault liquidations. Led to creation of the Emergency
 *   Shutdown Module (ESM) and DC-IAM autoline.
 * - Compound COMP distribution bug (September 2021): governance vote to
 *   fix required 48-hour timelock, during which $80M+ in COMP was
 *   misdistributed. No fast-track fix mechanism existed.
 * - Aave CRV market freeze (July 2023): Curve exploit triggered CRV
 *   price collapse. Aave froze CRV markets via Risk Steward, but the
 *   governance vote to adjust risk parameters took 5+ days. Risk Steward
 *   was the only mechanism that enabled timely response.
 * - Euler Finance (March 2023): $197M exploit -- protocol lacked
 *   fast-track parameter update capability to freeze the affected market
 *   before the attack completed.
 *
 * Risk parameter governance workflows referenced:
 *   Aave v3 Risk Steward, Gauntlet risk recommendations, Chaos Labs
 *   risk recommendations, Compound Governor Alpha/Bravo, MakerDAO
 *   DC-IAM (Debt Ceiling Instant Access Module), Aave Governance Forum,
 *   MakerDAO Governance Portal, Snapshot, Chainlink price feed oracles
 */
export const riskParameterScenario: ScenarioTemplate = {
  id: "web3-risk-parameter",
  name: "DeFi Risk Parameter Update",
  description:
    "A DeFi lending protocol ($200M-$500M TVL) must urgently adjust collateral ratios from 130% (76.9% LTV) to 150% (66.7% LTV) in response to escalating market volatility. The elected risk service provider (Gauntlet/Chaos Labs equivalent) produces Monte Carlo simulations, historical volatility analysis, and liquidity depth assessments to justify the parameter change. The Risk Lead reviews the quantitative analysis and posts the risk parameter recommendation on the governance forum. The full governance cycle -- forum discussion, Snapshot signaling vote, on-chain Governor proposal, and timelock execution -- takes 8-15 days. Meanwhile, market conditions may outpace governance: undercollateralized positions risk cascading liquidations, and each hour of delay increases protocol insolvency exposure by $500K+ in potential bad debt. Real-world precedent: MakerDAO Black Thursday resulted in $8.3M bad debt when governance could not adjust parameters fast enough during a 50%+ ETH crash.",
  icon: "CubeFocus",
  industryId: "web3",
  archetypeId: "multi-party-approval",
  prompt:
    "What happens when market volatility demands urgent collateral ratio adjustment but Monte Carlo modeling, risk committee review, governance forum discussion, Snapshot voting, and on-chain Governor execution take 8-15 days while undercollateralized positions risk cascading liquidations and each hour of delay increases protocol insolvency exposure?",

  // costPerHourDefault: cost impact of delayed risk parameter adjustment
  // during active market volatility.
  //
  // During a market crash where the collateral ratio is insufficient:
  // - Positions between the old LTV (76.9%) and new LTV (66.7%) become
  //   undercollateralized and are subject to liquidation
  // - Liquidations create sell pressure on the collateral asset, further
  //   depressing the price (cascading liquidation effect)
  // - If liquidation efficiency is low (insufficient DEX liquidity,
  //   oracle latency, MEV competition), the protocol accrues bad debt
  //   (positions liquidated below the debt value)
  //
  // Real-world calibration:
  // - MakerDAO Black Thursday (March 2020): $8.3M bad debt in ~12 hours
  //   = ~$700K/hour (ETH crashed 50%+ in hours, governance could not
  //   adjust stability fees or debt ceilings fast enough)
  // - Euler Finance (March 2023): $197M loss in ~1 hour (exploit, not
  //   market crash, but demonstrates speed of loss accumulation)
  //
  // $500K/hour is a conservative estimate for a mid-tier lending protocol
  // ($200M-$500M TVL) during a 30%+ market crash. For a top-10 protocol
  // ($1B+ TVL), the figure could be $2M-$10M+/hour.
  costPerHourDefault: 500000,

  actors: [
    // --- Lending Protocol Organization ---
    // The DeFi lending protocol (Aave, Compound, MakerDAO, Venus, Euler,
    // Morpho, Spark tier) operating lending pools with adjustable risk
    // parameters. TVL $200M-$500M across multiple collateral assets.
    // Governance structure includes token-weighted voting, elected risk
    // committee, external risk service providers, and on-chain Governor
    // with timelock.
    {
      id: "defi-protocol",
      type: NodeType.Organization,
      label: "Lending Protocol",
      description:
        "DeFi lending protocol ($200M-$500M TVL) operating lending pools with adjustable risk parameters including LTV (Loan-to-Value), Liquidation Threshold, Liquidation Bonus, supply/borrow caps, and interest rate model parameters. Governance operates through token-weighted voting (Snapshot signaling + on-chain Governor), with risk parameter management delegated to an elected Risk Committee and external risk service providers (Gauntlet/Chaos Labs).",
      parentId: null,
      organizationId: "defi-protocol",
      color: "#06B6D4",
    },

    // --- Risk Committee ---
    // The body responsible for risk parameter governance: reviewing
    // quantitative risk assessments from the risk service provider,
    // drafting risk parameter recommendations, presenting analysis
    // to governance stakeholders, and coordinating the parameter
    // update governance cycle. In production protocols, this is
    // typically a governance-elected committee of 3-7 risk-qualified
    // individuals (protocol core contributors, risk researchers,
    // governance delegates with risk expertise).
    {
      id: "risk-committee",
      type: NodeType.Department,
      label: "Risk Committee",
      description:
        "Governance-elected body responsible for reviewing quantitative risk assessments from the risk service provider (Gauntlet/Chaos Labs), drafting risk parameter recommendations for governance forum proposals, coordinating stakeholder review and Snapshot signaling votes, and overseeing on-chain parameter execution. Reviews Monte Carlo simulation results, historical volatility analysis (30/90/180-day rolling windows), DEX liquidity depth analysis, and oracle reliability assessments before recommending LTV, Liquidation Threshold, Liquidation Bonus, and supply/borrow cap adjustments.",
      parentId: "defi-protocol",
      organizationId: "defi-protocol",
      color: "#06B6D4",
    },

    // --- Risk Lead ---
    // The primary risk analyst who reviews the risk service provider's
    // quantitative analysis, drafts the governance forum proposal with
    // the risk parameter recommendation, and coordinates the governance
    // cycle. Mandatory approver -- the Risk Lead must sign off on the
    // quantitative analysis before the parameter change can proceed to
    // governance vote. In protocols without a dedicated Risk Committee,
    // this role is performed by the risk service provider directly.
    {
      id: "risk-lead",
      type: NodeType.Role,
      label: "Risk Lead",
      description:
        "Head of Risk / Chief Risk Officer responsible for reviewing the risk service provider's Monte Carlo simulations and parameter recommendations, drafting the governance forum proposal with risk justification (historical volatility analysis, liquidity depth assessment, stress test scenarios), presenting the analysis to governance delegates, and coordinating the governance cycle from forum post to on-chain execution. Mandatory approver -- the quantitative risk analysis must be reviewed and signed off by the Risk Lead before any parameter change proceeds.",
      parentId: "risk-committee",
      organizationId: "defi-protocol",
      color: "#94A3B8",
    },

    // --- Quant Analyst ---
    // Internal quantitative analyst who performs supplementary risk
    // modeling and independently verifies the risk service provider's
    // Monte Carlo simulation methodology and outputs. Reviews the
    // parameter recommendation against on-chain position data (Dune
    // Analytics, Flipside, Nansen) to assess the impact on existing
    // borrower positions and potential liquidation cascades.
    {
      id: "quant-analyst",
      type: NodeType.Role,
      label: "Quant Analyst",
      description:
        "Internal quantitative risk analyst who independently verifies the risk service provider's Monte Carlo simulation methodology and parameter recommendations. Performs supplementary analysis: queries on-chain position data (Dune Analytics, Flipside Crypto, Nansen) to identify positions between old and new LTV thresholds that would be subject to liquidation, models liquidation cascade severity across correlated assets, assesses DEX liquidity depth for liquidation absorption, and reviews Chainlink oracle heartbeat intervals and deviation thresholds for liquidation execution reliability.",
      parentId: "risk-committee",
      organizationId: "defi-protocol",
      color: "#94A3B8",
    },

    // --- Lead Governance Delegate ---
    // A major governance delegate representing a significant token
    // holder or delegation pool. In production protocols, there are
    // typically 50-200+ active governance delegates, not a single
    // "Protocol Governor." This actor represents the aggregate
    // governance review and voting process by a representative
    // large delegate (e.g., a16z, Polychain, university blockchain
    // club, or professional governance service like StableLab or
    // Flipside Governance).
    {
      id: "governance-delegate",
      type: NodeType.Role,
      label: "Lead Governance Delegate",
      description:
        "Major governance delegate representing a large token holder delegation pool. Reviews risk parameter proposals on the governance forum, evaluates Monte Carlo simulation methodology and risk service provider recommendations, participates in Snapshot signaling votes (off-chain, gasless, token-weighted), and submits or votes on on-chain Governor proposals (binding execution). Represents the aggregate governance review process -- in production, 50-200+ delegates review and vote on risk parameter changes.",
      parentId: "defi-protocol",
      organizationId: "defi-protocol",
      color: "#94A3B8",
    },

    // --- Risk Service Provider (Gauntlet/Chaos Labs equivalent) ---
    // The external vendor elected by governance to perform quantitative
    // risk analysis for the protocol. Produces monthly risk parameter
    // recommendation reports with Monte Carlo simulations, VaR/CVaR
    // analysis, historical volatility, liquidity depth assessment, and
    // oracle reliability evaluation. This is the most critical actor in
    // the risk governance workflow -- they produce the analysis that
    // justifies every parameter change.
    {
      id: "risk-service-provider",
      type: NodeType.Vendor,
      label: "Risk Service Provider",
      description:
        "External risk service provider (Gauntlet, Chaos Labs, Warden Finance, Risk DAO tier) elected by governance vote to perform quantitative risk analysis. Produces Monte Carlo simulations (10,000-100,000 price paths), Value-at-Risk (VaR) and Conditional VaR (CVaR/Expected Shortfall) computations, historical volatility analysis (30/90/180-day rolling windows), DEX liquidity depth assessment (Uniswap, Curve, Balancer), oracle reliability evaluation (Chainlink heartbeat intervals, deviation thresholds), and agent-based liquidation cascade modeling. Publishes monthly risk parameter recommendation reports on the governance forum.",
      parentId: null,
      organizationId: "risk-service-provider",
      color: "#F59E0B",
    },

    // --- External Auditor ---
    // Independent third-party audit firm (Trail of Bits, OpenZeppelin,
    // Spearbit, Consensys Diligence, Dedaub tier) engaged to review
    // the risk analysis methodology and parameter change safety.
    // Typed as NodeType.Vendor because the auditor is NOT an employee
    // of the protocol -- they are an external service provider engaged
    // under a services agreement.
    {
      id: "auditor",
      type: NodeType.Vendor,
      label: "External Auditor",
      description:
        "Independent third-party audit firm (Trail of Bits, OpenZeppelin, Spearbit, Consensys Diligence, Dedaub tier) engaged to review risk analysis methodology and parameter change safety. Verifies Monte Carlo simulation assumptions, reviews liquidation cascade modeling, assesses smart contract interaction risk for the parameter update transaction, and provides an independent risk assessment. Engagement with other protocols may delay availability -- auditor scheduling is a common governance bottleneck.",
      parentId: null,
      organizationId: "auditor-firm",
      color: "#F59E0B",
    },

    // --- Governor / Timelock System ---
    // The on-chain governance execution stack: Governor contract
    // (proposal submission, voting period with quorum requirement)
    // + Timelock contract (24-48 hour delay before execution).
    // All parameter changes (except Risk Steward fast-track
    // adjustments) must go through this stack. The Aave Governor
    // uses a 3-day voting period with a 320K AAVE quorum.
    // Compound uses Governor Bravo with a 2-day voting period.
    {
      id: "governor-timelock",
      type: NodeType.System,
      label: "Governor / Timelock",
      description:
        "On-chain governance execution stack: Governor contract (AIP/proposal submission, 2-3 day voting period, token-weighted voting with quorum requirement) + TimelockController (24-48 hour delay before parameter execution). All risk parameter changes that exceed Risk Steward authority caps must go through this stack. During the timelock delay, CANCELLER_ROLE holders can cancel pending parameter changes if community concerns arise. The timelock delay is a non-improvable on-chain security mechanism.",
      parentId: "defi-protocol",
      organizationId: "defi-protocol",
      color: "#8B5CF6",
    },

    // --- Lending Pool Contract ---
    // The on-chain lending pool smart contract where the risk
    // parameters are stored and enforced. Parameter updates are
    // applied by the Governor/Timelock stack (or by the Risk Steward
    // for fast-track adjustments). The lending pool enforces the
    // LTV, Liquidation Threshold, and Liquidation Bonus for every
    // borrow and liquidation operation.
    {
      id: "smart-contract-sys",
      type: NodeType.System,
      label: "Lending Pool Contract",
      description:
        "On-chain lending pool smart contract (Aave v3 Pool, Compound v3 Comet, MakerDAO Vat) where risk parameters are stored and enforced. Parameter updates applied by the Governor/Timelock stack or by the Risk Steward for fast-track adjustments within governance-approved risk caps. Enforces LTV (Loan-to-Value), Liquidation Threshold, Liquidation Bonus, supply/borrow caps, and interest rate model parameters for every borrow, repay, and liquidation operation.",
      parentId: "defi-protocol",
      organizationId: "defi-protocol",
      color: "#8B5CF6",
    },

    // --- Risk Steward / Emergency Risk Multisig ---
    // The fast-track parameter update mechanism. In Aave v3, the
    // Risk Steward is a permissioned contract that allows the elected
    // risk service provider to adjust parameters WITHIN governance-
    // approved risk caps WITHOUT a full governance vote. This reduces
    // parameter update latency from 8-15 days to hours for routine
    // adjustments. For emergency parameter changes (asset freeze,
    // aggressive LTV reduction), the Emergency Admin multisig
    // (5-of-10 in Aave) can act without governance. This is the
    // escalation target and delegation target for the "with
    // Accumulate" scenario improvement.
    {
      id: "risk-steward",
      type: NodeType.System,
      label: "Risk Steward",
      description:
        "Fast-track risk parameter update mechanism (Aave v3 Risk Steward equivalent). Permissioned contract that allows the elected risk service provider to adjust parameters WITHIN governance-approved risk caps (maximum LTV, maximum supply cap, etc.) WITHOUT a full governance vote. Reduces parameter update latency from 8-15 days to hours for routine risk-reducing adjustments. Can only make risk-reducing changes -- cannot increase LTV above the governance-approved cap, increase supply caps beyond the approved limit, or unfreeze assets. Emergency risk multisig (5-of-10 Guardian/Security Council) can execute immediate asset freezes and aggressive parameter tightening.",
      parentId: "defi-protocol",
      organizationId: "defi-protocol",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-risk-parameter",
      // Policy attached to the Risk Committee, which owns the risk
      // parameter governance workflow. The Risk Committee reviews the
      // risk service provider's quantitative analysis, drafts the
      // governance forum proposal, coordinates stakeholder review,
      // and oversees the parameter update execution through the
      // Governor/Timelock stack (or Risk Steward for fast-track
      // adjustments within risk caps).
      actorId: "risk-committee",
      threshold: {
        // 3-of-5: Risk Lead plus any two of Quant Analyst, Lead
        // Governance Delegate, Risk Service Provider, and External
        // Auditor. This allows the parameter change to proceed when
        // one or two participants are unavailable (auditor on another
        // engagement, governance delegate traveling) while still
        // requiring multi-party verification of the quantitative
        // analysis. Risk Lead is mandatory (see mandatoryApprovers).
        k: 3,
        n: 5,
        approverRoleIds: [
          "risk-lead",
          "quant-analyst",
          "governance-delegate",
          "risk-service-provider",
          "auditor",
        ],
      },
      // 43,200 seconds (12 hours) -- simulation-compressed representation
      // of the real-world governance proposal coordination window. In
      // production protocols, the full governance cycle is 8-15 days.
      // The 12-hour simulation window represents the active coordination
      // phase (risk assessment review, stakeholder discussion, voting)
      // and creates realistic approval pressure while accommodating
      // multi-timezone coordination between the Risk Committee, risk
      // service provider, governance delegates, and external auditor.
      expirySeconds: 43200,
      delegationAllowed: true,
      // Delegation: Risk Committee delegates routine risk-reducing
      // parameter adjustments to the Risk Steward mechanism. This
      // models the Aave v3 Risk Steward pattern: the elected risk
      // service provider can adjust parameters within governance-
      // approved risk caps without full governance vote. Delegation
      // is constrained to risk-reducing changes only.
      delegateToRoleId: "risk-steward",
      // Risk Lead is mandatory for all parameter changes. The Risk
      // Lead reviews the risk service provider's Monte Carlo simulations,
      // verifies the methodology and assumptions, and signs off on the
      // parameter recommendation. The quantitative risk analysis cannot
      // be bypassed -- a parameter change without Risk Lead review
      // creates unacceptable protocol insolvency risk.
      mandatoryApprovers: ["risk-lead"],
      // Delegation scope constraints: the Risk Steward can only execute
      // risk-REDUCING parameter adjustments within governance-approved
      // risk caps. Risk-increasing changes (raising LTV, increasing
      // supply/borrow caps, lowering liquidation bonus, unfreezing assets)
      // always require full governance vote through the Governor/Timelock
      // stack. This mirrors the Aave v3 Risk Steward design.
      delegationConstraints:
        "Delegation from Risk Committee to Risk Steward is limited to risk-REDUCING parameter adjustments within governance-approved risk caps: lowering LTV (Loan-to-Value), increasing Liquidation Threshold safety margin, increasing Liquidation Bonus, reducing supply/borrow caps, freezing assets. Maximum per-adjustment change: 2% LTV reduction, 10% supply cap reduction. Risk-INCREASING changes (raising LTV, increasing supply/borrow caps, lowering liquidation bonus, unfreezing assets) always require full governance vote through Governor/Timelock. Risk Steward cannot modify the governance-approved risk cap boundaries, add new collateral assets, or change the interest rate model.",
      escalation: {
        // Simulation-compressed: 20 seconds represents real-world
        // escalation after 6-12 hours of quorum failure during
        // rapidly deteriorating market conditions. If the Risk
        // Committee cannot reach the 3-of-5 threshold (e.g., auditor
        // unavailable, governance delegate unresponsive) while market
        // conditions demand urgent parameter adjustment, the system
        // escalates to the Risk Steward / Emergency Risk Multisig
        // for immediate risk-reducing action (asset freeze, aggressive
        // LTV reduction) without waiting for the full governance cycle.
        afterSeconds: 20,
        toRoleIds: ["risk-steward"],
      },
      // Risk parameter changes are restricted to the production
      // environment (mainnet contracts). Testnet parameter changes
      // are for testing and simulation -- they do not use governance
      // authority and do not trigger the risk governance workflow.
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "defi-protocol", targetId: "risk-committee", type: "authority" },
    { sourceId: "defi-protocol", targetId: "governance-delegate", type: "authority" },
    { sourceId: "defi-protocol", targetId: "governor-timelock", type: "authority" },
    { sourceId: "defi-protocol", targetId: "smart-contract-sys", type: "authority" },
    { sourceId: "defi-protocol", targetId: "risk-steward", type: "authority" },
    { sourceId: "risk-committee", targetId: "risk-lead", type: "authority" },
    { sourceId: "risk-committee", targetId: "quant-analyst", type: "authority" },
    // --- Delegation edge (Risk Committee -> Risk Steward) ---
    // Risk Committee delegates routine risk-reducing parameter adjustments
    // to the Risk Steward mechanism within governance-approved risk caps.
    // This models the Aave v3 Risk Steward pattern where the elected risk
    // service provider can adjust parameters without full governance vote
    // for changes within the approved cap boundaries.
    { sourceId: "risk-committee", targetId: "risk-steward", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Adjust lending pool collateral ratio during market volatility via risk governance cycle",
    initiatorRoleId: "risk-lead",
    targetAction:
      "Update Collateral Ratio from 130% (76.9% LTV) to 150% (66.7% LTV) Based on Monte Carlo Risk Analysis, Stress Testing, and Liquidity Depth Assessment",
    description:
      "Risk Service Provider (Gauntlet/Chaos Labs equivalent) produces Monte Carlo simulations, historical volatility analysis, and liquidity depth assessment recommending collateral ratio increase from 130% to 150%. Risk Lead reviews the quantitative analysis, verifies simulation methodology, and posts the risk parameter recommendation on the governance forum. Quant Analyst independently verifies the analysis against on-chain position data (Dune Analytics). Lead Governance Delegate and External Auditor review the proposal. Full governance cycle (forum discussion, Snapshot signaling vote, on-chain Governor proposal, timelock execution) takes 8-15 days. With Risk Steward delegation for routine adjustments within risk caps, latency reduces to hours. 3-of-5 threshold with Risk Lead mandatory. Escalation to Risk Steward/Emergency Risk Multisig if quorum fails during market deterioration.",
  },
  beforeMetrics: {
    // Wall-clock elapsed time from risk service provider report publication
    // to confirmed on-chain parameter execution, including active manual
    // effort across all participants:
    //   - Risk Service Provider: 8-16 hours (Monte Carlo simulation runs,
    //     historical volatility analysis, liquidity depth assessment, DEX
    //     pool analysis, oracle reliability evaluation, report drafting
    //     and publication on governance forum)
    //   - Risk Lead: 4-8 hours (review risk service provider report,
    //     verify simulation methodology and assumptions, draft governance
    //     forum proposal with risk justification, coordinate stakeholder
    //     review, respond to community questions on forum)
    //   - Quant Analyst: 4-6 hours (independent verification of Monte
    //     Carlo methodology, on-chain position analysis via Dune/Flipside,
    //     liquidation cascade modeling, DEX liquidity verification)
    //   - Lead Governance Delegate: 2-4 hours (review risk assessment,
    //     evaluate methodology, participate in Snapshot signaling vote,
    //     submit or vote on Governor proposal)
    //   - External Auditor: 4-8 hours (review simulation assumptions,
    //     assess parameter change safety, verify smart contract interaction
    //     risk for the update transaction)
    // Total active manual effort: 22-42 hours across all participants.
    // 36 hours is the mid-case estimate.
    // Full elapsed time (including passive governance waiting periods):
    // 8-15 days. This metric captures active manual effort only.
    manualTimeHours: 36,
    // 7 days of risk exposure represents the governance latency window
    // during which the protocol operates with outdated risk parameters:
    // (1) Positions between old LTV (76.9%) and new LTV (66.7%) are
    //     undercollateralized under the proposed parameters but cannot
    //     be liquidated until the parameter change is executed
    // (2) Market volatility may accelerate during the governance delay,
    //     creating additional undercollateralized positions
    // (3) Liquidation cascades may trigger if the collateral asset
    //     price drops further, creating sell pressure and bad debt
    // (4) Oracle latency (Chainlink heartbeat intervals, deviation
    //     thresholds) may delay liquidation execution even after the
    //     parameter change
    // (5) Governance participants may be unresponsive, extending the
    //     voting period and increasing the risk exposure window
    // Real-world: MakerDAO Black Thursday risk exposure was ~12 hours
    // (acute), but the governance recovery period was 7+ days.
    riskExposureDays: 7,
    // Five audit gaps in the current risk parameter governance process:
    // (1) Monte Carlo simulation results (risk service provider report)
    //     not cryptographically linked to the parameter change proposal
    //     -- the report is a PDF/markdown posted on the governance forum
    //     with no verifiable binding to the on-chain parameter change
    // (2) Governance forum discussion (community review, delegate
    //     questions, risk service provider responses) not linked to
    //     the on-chain Governor proposal -- forum thread and Governor
    //     proposal are separate systems with no cryptographic binding
    // (3) Snapshot signaling vote (off-chain, IPFS-stored) not
    //     cryptographically linked to the on-chain Governor proposal
    //     -- signaling and binding votes are separate governance actions
    //     with no system-enforced connection
    // (4) External Auditor's risk assessment not formally attached to
    //     the parameter change record -- auditor review is a forum post
    //     or a report delivered via email/Telegram with no binding to
    //     the Governor proposal or parameter execution transaction
    // (5) On-chain parameter execution not linked back to the risk
    //     service provider's Monte Carlo analysis that justified the
    //     change -- the Governor transaction updates the parameter but
    //     does not reference the risk assessment, making post-mortem
    //     verification of the analysis-to-execution chain impossible
    auditGapCount: 5,
    // Nine manual steps in the full risk parameter governance cycle:
    // (1) Risk Service Provider runs Monte Carlo simulations and
    //     publishes risk parameter recommendation report on governance
    //     forum with simulation methodology, historical volatility
    //     analysis, and recommended LTV/LT/LB adjustments
    // (2) Risk Lead reviews risk service provider report, verifies
    //     simulation methodology and assumptions, and signs off on the
    //     parameter recommendation
    // (3) Risk Lead drafts governance forum proposal with risk
    //     justification, linking risk service provider report and
    //     independent analysis
    // (4) Quant Analyst independently verifies Monte Carlo methodology
    //     against on-chain position data (Dune Analytics, Flipside)
    // (5) Community review period on governance forum -- delegates and
    //     token holders review and discuss the proposal (3-7 days)
    // (6) External Auditor reviews risk analysis methodology and
    //     parameter change safety (if available -- scheduling is a
    //     common bottleneck)
    // (7) Snapshot signaling vote initiated and executed (off-chain,
    //     gasless, token-weighted voting, 3-5 day voting period)
    // (8) On-chain Governor proposal submitted with parameter change
    //     calldata, voting period (2-3 days), quorum requirement
    // (9) Timelock execution after 24-48 hour delay, parameter update
    //     applied to lending pool contract
    approvalSteps: 9,
  },
  todayFriction: {
    ...ARCHETYPES["multi-party-approval"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Risk Service Provider (Gauntlet/Chaos Labs equivalent) runs Monte Carlo simulations (10,000-100,000 price paths), publishes risk parameter recommendation report on governance forum with simulation methodology, historical volatility analysis (30/90/180-day rolling windows), and recommended LTV/LT/LB adjustments. Risk Lead reviews report, verifies simulation assumptions, and drafts governance forum proposal with risk justification. Community review period begins -- delegates and token holders reviewing the proposal on the governance forum.",
        // Simulation-compressed: represents 3-7 days real-world elapsed
        // time for risk service provider report publication, Risk Lead
        // review, governance forum proposal, and community discussion
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        description:
          "Governance delegates and large token holders reviewing risk analysis on governance forum -- evaluating Monte Carlo methodology, querying on-chain position data via Dune Analytics to assess liquidation impact, debating parameter change magnitude. Snapshot signaling vote open for 3-5 days with token-weighted voting and delegation. After Snapshot passage, on-chain Governor proposal submitted with 2-3 day voting period. Market conditions may deteriorate further during the voting window.",
        // Simulation-compressed: represents 5-8 days real-world elapsed
        // time for Snapshot vote and on-chain Governor proposal voting period
        delaySeconds: 8,
      },
      {
        trigger: "on-unavailable",
        description:
          "External Auditor on engagement with another protocol (Trail of Bits, OpenZeppelin, Spearbit, Consensys Diligence tier) -- unavailable for 1-3 weeks. With unanimous approval required in today's process, the parameter change is completely blocked. Market volatility outpacing governance response time -- positions becoming undercollateralized, liquidation cascade risk increasing with each day of delay. MakerDAO Black Thursday resulted in $8.3M bad debt from this exact governance latency problem.",
        // Simulation-compressed: represents 1-3 weeks real-world delay
        // when the external auditor is unavailable and unanimous
        // approval is required
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Risk service provider Monte Carlo report, governance forum community review (3-7 days), Snapshot signaling vote (3-5 days), on-chain Governor proposal (2-3 days), and timelock execution (24-48 hours) while market volatility outpaces governance and positions risk cascading liquidation",
  },
  todayPolicies: [
    {
      id: "policy-risk-parameter-today",
      // Today's policy: unanimous 5-of-5 approval with no delegation,
      // no escalation, and no fast-track mechanism. This models the
      // worst-case governance rigidity -- ALL stakeholders must approve,
      // and a single unavailable participant (auditor on another
      // engagement, governance delegate traveling) blocks the entire
      // parameter change. In production, most protocols have moved to
      // threshold-based approval (3-of-5, 4-of-7) and fast-track
      // mechanisms (Aave Risk Steward, MakerDAO DC-IAM), but the
      // "today" state models the governance-heavy approach that creates
      // the 8-15 day latency problem.
      actorId: "risk-committee",
      threshold: {
        // 5-of-5 unanimous: every stakeholder must approve. A single
        // unavailable participant blocks the entire parameter change.
        // This models the "broken" state that Accumulate resolves with
        // threshold-based approval and Risk Steward delegation.
        k: 5,
        n: 5,
        approverRoleIds: [
          "risk-lead",
          "quant-analyst",
          "governance-delegate",
          "risk-service-provider",
          "auditor",
        ],
      },
      // Simulation-compressed: represents the practical effect of the
      // rigid governance cycle -- with no delegation, no escalation,
      // and no fast-track mechanism, the authorization window effectively
      // expires (market conditions deteriorate) before all participants
      // can coordinate their review and approval. In real-world terms,
      // the 8-15 day governance cycle may be too slow for market volatility
      // that materializes in hours.
      expirySeconds: 20,
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to DeFi lending protocol risk
  // parameter governance, quantitative risk management, and prudential
  // treatment of cryptoasset exposures.
  //
  // The shared REGULATORY_DB["web3"] entries (MiCA Art. 68 on CASP asset
  // safeguarding, SEC Rule 206(4)-2 on investment adviser custody) are NOT
  // applicable to lending protocol risk parameter management. MiCA Art. 68
  // addresses custody obligations for CASPs -- not risk parameter governance.
  // SEC Rule 206(4)-2 is the custody rule for SEC-registered investment
  // advisers -- not applicable to DeFi lending protocol governance.
  //
  // The directly applicable frameworks are:
  // - MiCA Art. 67 (organisational requirements including risk management
  //   procedures for CASPs and DAO-adjacent foundations)
  // - Basel Committee on Banking Supervision prudential treatment of
  //   cryptoasset exposures (December 2022 standard, BCBS d545)
  // - CFTC enforcement considerations for DeFi protocols offering
  //   margin-equivalent leveraged products without registration
  regulatoryContext: [
    {
      framework: "MiCA",
      displayName: "MiCA Art. 67 (EU Regulation 2023/1114)",
      clause: "Organisational Requirements -- Risk Management Procedures",
      violationDescription:
        "DeFi lending protocol or DAO-adjacent foundation operating in the EU fails to implement effective risk management procedures as required by MiCA Article 67. Risk parameter governance lacks documented quantitative risk assessment methodology (Monte Carlo simulations, VaR/CVaR analysis), lacks formal multi-party review and approval procedures for parameter changes, and lacks audit trail linking risk analysis to on-chain parameter execution. Protocol foundation cannot demonstrate to EU national competent authority that risk parameter changes follow a governed, documented, and auditable process.",
      fineRange:
        "Up to EUR 5M or 3% of annual turnover for legal persons; up to EUR 700K for natural persons; competent authority may impose conditions on authorization, restrict services, or withdraw CASP authorization for material risk management deficiencies",
      severity: "high",
      safeguardDescription:
        "Accumulate provides documented risk parameter governance with cryptographic proof of every step: risk service provider Monte Carlo analysis submission, Risk Lead quantitative review and sign-off, Quant Analyst independent verification, governance delegate approval, and on-chain parameter execution -- satisfying MiCA Art. 67 risk management procedure and record-keeping requirements.",
    },
    {
      framework: "BCBS d545",
      displayName: "Basel Committee Prudential Treatment of Cryptoasset Exposures",
      clause: "Group 2b Cryptoasset Exposure -- Risk Management Requirements",
      violationDescription:
        "Banks and financial institutions holding DeFi lending protocol tokens or providing services to DeFi lending protocols cannot demonstrate that the protocol has adequate risk management capabilities for collateral ratio calibration, liquidation mechanism governance, and parameter update procedures. Undocumented risk parameter governance creates unfavorable prudential treatment: cryptoasset exposures classified as Group 2b (higher capital charge, 1250% risk weight) rather than Group 2a (more favorable treatment contingent on demonstrated risk management).",
      fineRange:
        "No direct fine -- adverse prudential classification results in significantly higher capital requirements (1250% risk weight for Group 2b vs. risk-weighted treatment for Group 2a). For a bank with $100M DeFi exposure, the difference is $100M+ in additional regulatory capital that must be held, reducing lending capacity and profitability",
      severity: "high",
      safeguardDescription:
        "Well-documented risk parameter governance with Accumulate provides evidence of protocol risk management capability supporting Group 2a classification: documented Monte Carlo simulation methodology, formal multi-party review process, cryptographic audit trail linking risk analysis to parameter execution, and demonstrated governance resilience (threshold-based approval, delegation, escalation).",
    },
    {
      framework: "CFTC",
      displayName: "CFTC Enforcement -- DeFi Margin-Equivalent Products",
      clause: "CEA Section 4(a) -- Leveraged/Margined Retail Commodity Transactions",
      violationDescription:
        "DeFi lending protocol offering leveraged or margined products (adjustable collateral ratios that determine maximum borrowing power) to US retail participants without registration as a Designated Contract Market (DCM) or Swap Execution Facility (SEF). CFTC has brought enforcement actions against DeFi protocols (bZx/Ooki DAO, September 2022) for offering margin-equivalent products without registration. Risk parameter governance documentation helps demonstrate that collateral ratio management is not ad-hoc but follows a governed risk management process.",
      fineRange:
        "Civil monetary penalties up to $200K per violation; disgorgement of profits; cease and desist orders; potential referral to DOJ for criminal prosecution for willful violations. Ooki DAO enforcement action resulted in $250K penalty and permanent trading/registration ban",
      severity: "medium",
      safeguardDescription:
        "Accumulate enables DeFi lending protocols to demonstrate that risk parameter governance follows a documented, multi-party, auditable process -- not ad-hoc parameter manipulation. Cryptographic proof of Monte Carlo risk analysis, multi-stakeholder review, governance vote, and parameter execution provides evidence of responsible risk management for regulatory engagement.",
    },
  ],
  tags: [
    "web3",
    "defi",
    "risk",
    "governance",
    "multi-party",
    "lending",
    "collateral",
    "monte-carlo",
    "snapshot",
    "market-volatility",
    "liquidation",
    "ltv",
    "risk-steward",
    "gauntlet",
    "chaos-labs",
    "chainlink",
    "oracle",
    "black-thursday",
    "maker",
    "aave",
    "compound",
    "prudential",
    "bcbs",
    "cftc",
  ],
};
```

### Corrected Narrative Journey (Markdown)

Replace Section 3 ("DeFi Risk Parameter Update") in `docs/scenario-journeys/web3-scenarios.md` starting at approximately line 142 with:

```markdown
## 3. DeFi Risk Parameter Update

**Setting:** A DeFi lending protocol ($200M-$500M TVL) must urgently adjust its collateral ratio from 130% (76.9% LTV) to 150% (66.7% LTV) in response to escalating market volatility. The elected risk service provider (Gauntlet/Chaos Labs equivalent) has produced Monte Carlo simulations, historical volatility analysis (30/90/180-day rolling windows), and DEX liquidity depth assessments recommending the parameter tightening. The Risk Committee -- Risk Lead (mandatory approver), Quant Analyst, Lead Governance Delegate, Risk Service Provider, and External Auditor -- must review, approve, and execute the parameter change through the governance cycle: forum discussion (3-7 days), Snapshot signaling vote (3-5 days), on-chain Governor proposal (2-3 day voting period), and timelock execution (24-48 hours). Total governance latency: 8-15 days. Meanwhile, positions between the old and new LTV thresholds risk cascading liquidations, and each hour of delay increases protocol insolvency exposure. Real-world precedent: MakerDAO Black Thursday (March 2020) resulted in $8.3M in bad debt when governance could not adjust parameters fast enough during a 50%+ ETH crash. Cost of delay: approximately $500K/hour for a mid-tier protocol during a 30%+ market crash.

**Players:**
- **Lending Protocol** (organization) -- $200M-$500M TVL DeFi lending protocol with token-weighted governance
  - Risk Committee -- governance-elected body overseeing risk parameter governance
    - Risk Lead -- reviews risk service provider analysis, drafts governance proposal, mandatory approver
    - Quant Analyst -- independently verifies Monte Carlo methodology against on-chain data (Dune Analytics, Flipside)
  - Lead Governance Delegate -- major governance delegate, reviews proposals and votes via Snapshot and on-chain Governor
  - Governor / Timelock -- on-chain governance execution stack (Governor contract + 24-48 hour TimelockController)
  - Lending Pool Contract -- on-chain contract where risk parameters are stored and enforced
  - Risk Steward -- fast-track parameter update mechanism for routine risk-reducing adjustments within governance-approved risk caps (Aave v3 Risk Steward equivalent); escalation target
- **Risk Service Provider** (vendor) -- Gauntlet/Chaos Labs equivalent, produces Monte Carlo simulations and risk parameter recommendations
- **External Auditor** (vendor) -- Trail of Bits/OpenZeppelin/Spearbit tier, reviews risk analysis methodology and parameter change safety

**Action:** Update collateral ratio from 130% (76.9% LTV) to 150% (66.7% LTV) on the lending pool based on Monte Carlo risk analysis. Requires 3-of-5 approval from Risk Lead, Quant Analyst, Lead Governance Delegate, Risk Service Provider, and External Auditor. Risk Lead is mandatory. Delegation to Risk Steward allowed for risk-reducing adjustments within governance-approved risk caps. Auto-escalation to Risk Steward if quorum fails during market deterioration.

---

### Today's Process

**Policy:** All 5 of 5 must approve. No delegation. No escalation. No fast-track mechanism. Short expiry.

1. **Risk service provider analysis.** The elected risk service provider (Gauntlet/Chaos Labs equivalent) runs Monte Carlo simulations (10,000-100,000 price paths), produces historical volatility analysis, DEX liquidity depth assessment, and oracle reliability evaluation. Publishes the risk parameter recommendation report on the governance forum with recommended LTV/LT/LB adjustments and simulation methodology. *(~10 sec delay)*

2. **Risk Lead review and forum proposal.** Risk Lead reviews the risk service provider's report, verifies simulation methodology and assumptions, and drafts a governance forum proposal with risk justification linking the Monte Carlo results, historical volatility data, and liquidation impact analysis. Community review period begins -- delegates and token holders reading and discussing the proposal over 3-7 days. *(~8 sec delay)*

3. **External Auditor unavailable.** The External Auditor (Trail of Bits, OpenZeppelin, Spearbit tier) is on engagement with another protocol -- no availability for 1-3 weeks. Since 5-of-5 unanimous approval is required, the parameter change is completely blocked. No mechanism to proceed without the auditor's review. The Risk Lead posts in Discord asking for an ETA, but auditor scheduling is a well-known governance bottleneck. *(~12 sec delay)*

4. **Market volatility outpaces governance.** While waiting for the External Auditor, market conditions deteriorate further. Positions between the old LTV (76.9%) and the proposed new LTV (66.7%) become increasingly undercollateralized. Liquidation cascade risk grows -- liquidations create sell pressure on the collateral asset, further depressing its price, triggering more liquidations. The Quant Analyst queries Dune Analytics and identifies $15M in positions that would be subject to liquidation at current prices under the proposed parameters. Each hour of delay increases protocol insolvency exposure by $500K+ in potential bad debt. MakerDAO Black Thursday resulted in $8.3M bad debt from this exact governance latency problem.

5. **Outcome:** Parameter update delayed by 8-15+ days (or longer if the auditor remains unavailable). Protocol exposed to cascading liquidations and potential bad debt. Audit trail is fragmented across governance forum posts (proposal discussion), Discord messages (auditor coordination), the risk service provider's PDF report (no cryptographic binding to the proposal), Snapshot (signaling vote stored on IPFS), and the on-chain Governor proposal (no link back to the risk analysis). No system-enforced connection between the Monte Carlo simulation that justified the change and the on-chain parameter execution.

**Metrics:** ~36 hours of active manual effort across all participants (excluding passive governance waiting periods), 7 days of risk exposure, 5 audit gaps, 9 manual steps.

---

### With Accumulate

**Policy:** 3-of-5 threshold (Risk Lead, Quant Analyst, Lead Governance Delegate, Risk Service Provider, External Auditor). Risk Lead is mandatory. Delegation to Risk Steward for risk-reducing adjustments within governance-approved risk caps. Auto-escalation to Risk Steward after quorum failure timeout. Production environment only. 12-hour authority window.

1. **Request submitted.** Risk Lead submits the parameter update request after reviewing the risk service provider's Monte Carlo analysis. The policy engine validates the parameter change against governance-approved risk caps, confirms the Risk Lead (mandatory approver) has signed off, and routes the approval request to all five participants with the risk service provider's simulation report, historical volatility analysis, and liquidation impact assessment attached.

2. **Threshold met.** Risk Lead, Quant Analyst, and Risk Service Provider all approve within the same business day. The 3-of-5 threshold is met with the mandatory approver (Risk Lead) present. The Lead Governance Delegate reviews and approves asynchronously, strengthening the governance record. The External Auditor's availability does not block the parameter change.

3. **Governor / Timelock execution.** The Governor/Timelock system receives the cryptographic approval proof -- linking the Monte Carlo simulation report hash, the risk service provider's recommendation, the Risk Lead's sign-off, the Quant Analyst's independent verification, and the governance delegate's approval -- and queues the parameter change with the timelock delay. During the delay window, CANCELLER_ROLE holders can cancel if community concerns arise.

4. **If needed, delegation.** For routine risk-reducing parameter adjustments within governance-approved risk caps (e.g., incremental LTV reduction of 1-2%, supply cap reduction of 5-10%), the Risk Steward mechanism can execute the change without the full governance vote -- reducing latency from days to hours. Delegation constrained: Risk Steward can only make risk-reducing changes and cannot exceed the governance-approved cap boundaries.

5. **If needed, escalation.** If the 3-of-5 threshold cannot be met within the authority window and market conditions are rapidly deteriorating, the system auto-escalates to the Risk Steward / Emergency Risk Multisig. The Risk Steward can execute immediate risk-reducing actions (freeze the affected asset, aggressively lower LTV) to protect the protocol from insolvency while the full governance cycle completes.

6. **External Auditor reviews asynchronously.** The External Auditor can review the risk analysis and parameter change within the 12-hour authority window and add their approval, strengthening the governance record. Their review is cryptographically attached to the parameter change proof for regulatory and post-mortem purposes.

7. **Outcome:** Collateral ratio updated from 130% to 150% before liquidation cascades materialize. Protocol remains solvent. Full cryptographic audit trail linking risk service provider Monte Carlo report -> Risk Lead sign-off -> Quant Analyst verification -> governance delegate approval -> Governor/Timelock execution -> lending pool parameter update. Every step of the risk assessment-to-execution chain is cryptographically verifiable.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Approval threshold | 5-of-5 unanimous -- single unavailable participant blocks everything | 3-of-5 threshold with Risk Lead mandatory |
| Risk assessment provenance | Risk PDF posted on governance forum -- no cryptographic binding to parameter change | Monte Carlo simulation report hash attached to parameter change proof |
| When Auditor is busy | Entire parameter update blocked for 1-3+ weeks | 3 approvals sufficient; Auditor reviews asynchronously |
| Delegation | None -- full governance vote for every parameter change | Risk Steward executes routine risk-reducing adjustments within governance-approved caps (hours, not days) |
| Escalation | None -- protocol exposed during governance delay | Auto-escalation to Risk Steward / Emergency Risk Multisig for immediate risk-reducing action |
| Parameter execution latency | 8-15 days (forum + Snapshot + Governor + timelock) | Hours via Risk Steward delegation; days via full governance with threshold approval |
| Liquidation cascade risk window | 7+ days of exposure during governance cycle | Minimized -- parameter updated or asset frozen before cascading liquidations materialize |
| Audit trail | Fragmented: forum posts, Discord, risk PDF, Snapshot (IPFS), Governor proposal | Unified cryptographic proof: risk analysis -> approvals -> Governor execution -> parameter update |
| Regulatory posture | No documented risk management process (MiCA Art. 67, BCBS d545 exposure) | Documented, auditable risk governance satisfying MiCA Art. 67 and supporting BCBS prudential treatment |
```

---

## 5. Credibility Risk Assessment

### Target Audience: Head of Risk at a Top-10 DeFi Lending Protocol

**Would challenge in ORIGINAL:**
- "Protocol Governor" as a single actor -- no such role exists in DeFi governance. There are delegates, not governors.
- Delegation from Risk Lead to Protocol Governor -- authority flows in the opposite direction.
- External Auditor typed as an internal role -- auditors are independent vendors.
- 3-of-4 threshold with no mandatory approver -- who ensures the Monte Carlo analysis was actually reviewed?
- No Risk Service Provider actor -- who produces the quantitative analysis? "Quant Analyst" is an internal role, not the elected external risk service provider.
- No Risk Steward or fast-track mechanism -- modern lending protocols (Aave v3, MakerDAO) have fast-track parameter update mechanisms. Their omission makes the scenario feel dated.
- MiCA Art. 68 and SEC Rule 206(4)-2 as regulatory context -- neither applies to risk parameter governance.
- No mention of MakerDAO Black Thursday, the canonical example of this exact problem.

**Would accept in CORRECTED:**
- 3-of-5 threshold with Risk Lead mandatory -- realistic governance model.
- Risk Service Provider as external vendor -- accurately models Gauntlet/Chaos Labs.
- Risk Steward delegation for routine risk-reducing adjustments -- mirrors Aave v3 Risk Steward.
- External Auditor as `NodeType.Vendor` -- correct classification.
- Monte Carlo methodology references with specific detail (10K-100K price paths, VaR/CVaR, 30/90/180-day rolling windows).
- MiCA Art. 67, BCBS d545, CFTC enforcement as regulatory context -- all directly applicable.
- $500K/hour cost calibrated from MakerDAO Black Thursday data.
- Delegation constraints limited to risk-reducing changes within governance-approved caps.

### Target Audience: DeFi Risk Analyst at Gauntlet or Chaos Labs

**Would challenge in ORIGINAL:**
- "Quant Analyst performs Monte Carlo simulations" as the primary analysis role -- at production protocols, the risk service provider (Gauntlet/Chaos Labs) performs the Monte Carlo simulations, not an internal quant analyst.
- No mention of VaR, CVaR, Expected Shortfall, or any standard quantitative risk metrics.
- "Collateral ratio from 130% to 150%" without discussing the LTV implication (76.9% -> 66.7%) or the impact on existing positions between the old and new thresholds.
- No discussion of liquidation cascade mechanics (sell pressure, DEX liquidity, oracle latency, MEV competition).
- 24 hours of manual time -- significantly understated for the full governance cycle.
- No mention of Chainlink oracle heartbeat intervals, deviation thresholds, or oracle reliability as a factor in parameter calibration.

**Would accept in CORRECTED:**
- Risk Service Provider as primary Monte Carlo analysis source -- accurate.
- LTV computation explicitly stated (76.9% -> 66.7%) -- correct and professionally precise.
- Liquidation cascade mechanics described in narrative and actor descriptions.
- Monte Carlo methodology specified: 10K-100K price paths, VaR/CVaR, historical volatility windows.
- Chainlink oracle reliability referenced in actor descriptions and risk assessment methodology.
- 36 hours of active manual effort across all participants -- realistic and well-justified.

### Target Audience: Governance Delegate

**Would challenge in ORIGINAL:**
- "Protocol Governor" as a single voting actor -- governance involves 50-200+ delegates, not one governor.
- 3-of-4 approval with the Protocol Governor as one of four -- oversimplification of the governance process.
- No Snapshot signaling vote mechanics, no on-chain Governor proposal process, no timelock.
- No discussion of quorum requirements, voting periods, or governance proposal lifecycle.
- 5-row takeaway table -- too thin to evaluate the governance improvement meaningfully.

**Would accept in CORRECTED:**
- "Lead Governance Delegate" with description acknowledging 50-200+ active delegates -- accurate framing.
- Governor/Timelock as separate system actor with voting period and timelock delay described.
- Snapshot signaling and on-chain Governor process described in narrative.
- 9-row takeaway table with delegation, escalation, and regulatory dimensions.
- Risk Steward delegation as the key governance innovation -- accurately represents the Aave v3 improvement.

### Target Audience: Protocol Engineer

**Would challenge in ORIGINAL:**
- No Governor contract or Timelock in the actor model -- parameter changes do not go directly to the lending pool.
- No Risk Steward mechanism -- modern implementations have fast-track parameter update contracts.
- "Smart Contract updated" as a single step -- omits the governance execution stack (Governor -> Timelock -> Pool).
- Lending Pool Contract described as "On-chain parameter execution" -- the Pool does not execute parameter updates; the Governor/Timelock does.
- No mention of Aave v3 Pool, Compound v3 Comet, or MakerDAO Vat as the actual on-chain contract patterns.

**Would accept in CORRECTED:**
- Governor/Timelock and Risk Steward as separate system actors -- accurately models the on-chain execution stack.
- Lending Pool Contract described with specific contract references (Aave v3 Pool, Compound v3 Comet, MakerDAO Vat).
- Risk Steward described with per-adjustment caps (2% LTV reduction, 10% supply cap reduction) -- mirrors Aave v3 implementation.
- Parameter update flow: Risk assessment -> governance approval -> Governor proposal -> Timelock delay -> Pool parameter update.

### Target Audience: DeFi Risk Researcher

**Would challenge in ORIGINAL:**
- No mention of MakerDAO Black Thursday ($8.3M bad debt, March 2020) -- the canonical example of governance latency causing protocol insolvency.
- No mention of Compound COMP distribution bug ($80M+ misdistributed, September 2021) -- governance latency preventing timely fix.
- No mention of Aave CRV market freeze (July 2023) -- Risk Steward enabling timely response where full governance would have been too slow.
- No quantitative risk metrics (VaR, CVaR, Expected Shortfall).
- No discussion of liquidation cascade mechanics or agent-based simulation.
- No cost-per-hour estimate calibrated from real-world insolvency data.

**Would accept in CORRECTED:**
- MakerDAO Black Thursday, Compound COMP bug, Aave CRV freeze, and Euler Finance exploit all referenced with specific loss figures and timelines.
- $500K/hour cost calibrated from MakerDAO Black Thursday data ($8.3M / ~12 hours).
- Monte Carlo methodology with standard metrics (VaR, CVaR, 10K-100K price paths, rolling volatility windows).
- Liquidation cascade mechanics described (sell pressure, DEX liquidity, oracle latency, MEV competition).
- Risk Steward as the key governance innovation with per-adjustment caps -- demonstrates research-grade understanding of modern risk parameter governance.
