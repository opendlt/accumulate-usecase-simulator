# SME Review: Security Council Escalation Scenario

## Agent: L2 Network Security Architect / Security Council Member / Vulnerability Disclosure Coordinator

---

## 1. Executive Assessment

**Overall Credibility Score: D+**

This scenario is the weakest of the six Web3 scenarios by a substantial margin. While it captures the high-level concept of a security council escalation workflow -- threshold voting, emergency escalation, and vulnerability window management -- it does so at a superficial level that would not survive scrutiny from anyone who has participated in a live L2 security council action or managed a coordinated vulnerability disclosure. The scenario reads like a generic multi-party approval template with "security council" labels pasted over it, rather than a ground-up model of how L2 security councils actually operate. The 3-member council, the absence of core engineering and bug bounty actors, the generic REGULATORY_DB.web3 reference (MiCA Art. 68 and SEC 206(4)-2 -- neither relevant to L2 vulnerability management), the missing mandatoryApprovers, delegationConstraints, constraints, and costPerHourDefault, and the thin narrative all combine to produce a scenario that would be immediately challenged by any of the target audiences. The contrast with the corrected treasury-governance.ts and emergency-pause.ts -- which are rich, deeply commented, and domain-specific -- is stark.

### Top 3 Most Critical Issues

1. **REGULATORY_DB.web3 import is completely wrong for this scenario (Critical).** MiCA Art. 68 is about CASP asset safeguarding -- it governs how exchanges hold customer assets, not how L2 security councils authorize emergency upgrades. SEC Rule 206(4)-2 is the Custody Rule for registered investment advisers -- it has zero applicability to L2 vulnerability disclosure or patch deployment. The scenario needs inline regulatoryContext entries for DORA (ICT incident management and operational resilience), NIST SP 800-216 (coordinated vulnerability disclosure framework), and MiCA Art. 67 (organisational requirements including incident response procedures). This is not a minor labeling issue -- it is a fundamental credibility failure that would be immediately flagged by any regulatory analyst reviewing the scenario.

2. **Missing core workflow actors: Bug Bounty / White-Hat Researcher and Core Engineering Team (Critical).** The scenario models the security council as both the vulnerability discoverer and the patch developer. In reality, vulnerabilities are typically discovered by external researchers through bug bounty programs (Immunefi, HackerOne) or white-hat researchers who submit reports through coordinated disclosure channels. The patch is developed by the protocol's core engineering team, not by the council. The council reviews the vulnerability report, reviews the proposed patch, and authorizes the deployment. By conflating discovery, development, and authorization into a single "Security Council" entity, the scenario fundamentally misrepresents the L2 vulnerability management workflow.

3. **3-member council with no mandatoryApprovers, no delegationConstraints, no constraints, and no costPerHourDefault (High).** The scenario is missing every enhanced policy field that the corrected treasury-governance.ts and emergency-pause.ts scenarios use. There is no mandatory Security Lead or Council Chair who triages vulnerability reports. There is no constraint on what the Emergency Admin can do after delegation (can it modify the council multisig? upgrade unrelated contracts? pause the bridge?). There is no production environment constraint. There is no cost-per-hour metric to quantify the TVL exposure during the vulnerability window. The policy is a bare-minimum skeleton.

### Top 3 Strengths

1. **Correct archetype selection.** The `threshold-escalation` archetype is the right choice for this scenario -- it models the auto-escalation from council quorum failure to emergency admin intervention.

2. **Emergency Admin as a separate entity with escalation.** The scenario correctly models the Emergency Admin as a separate actor with auto-escalation after timeout, which is architecturally similar to the Optimism Guardian pattern where the Guardian is a separate entity from the Security Council.

3. **Governance Contract as a System actor.** The on-chain governance execution contract is correctly typed as `NodeType.System`, reflecting that it is a smart contract, not a human role.

---

## 2. Line-by-Line Findings

### Finding 1
- **Location:** `src/scenarios/web3/security-council.ts`, line 4
- **Issue Type:** Inconsistency
- **Severity:** Critical
- **Current Text:** `import { REGULATORY_DB } from "@/lib/regulatory-data";`
- **Problem:** Imports the shared REGULATORY_DB which contains generic web3 entries (MiCA Art. 68 for CASP asset safeguarding, SEC Rule 206(4)-2 for investment adviser custody). Neither regulation is applicable to L2 security council emergency upgrade authority or coordinated vulnerability disclosure. Both corrected reference scenarios (treasury-governance.ts, emergency-pause.ts) use inline regulatoryContext and do NOT import REGULATORY_DB.
- **Corrected Text:** Remove this import entirely. Use inline `regulatoryContext` array with DORA, NIST SP 800-216, and MiCA Art. 67.
- **Source/Rationale:** Corrected treasury-governance.ts (lines 463-512) and emergency-pause.ts (lines 418-455) both use inline regulatoryContext. REGULATORY_DB.web3 is not specific to any individual web3 scenario.

### Finding 2
- **Location:** `src/scenarios/web3/security-council.ts`, line 142
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `regulatoryContext: REGULATORY_DB.web3,`
- **Problem:** References the shared REGULATORY_DB.web3 array containing MiCA Art. 68 (CASP asset safeguarding) and SEC Rule 206(4)-2 (Custody Rule). MiCA Art. 68 governs how crypto-asset service providers safeguard customer crypto-assets -- it addresses reserve of assets requirements, custody segregation, and client asset protection. It does not address L2 security council operations, vulnerability disclosure, or emergency upgrade governance. SEC 206(4)-2 is the Custody Rule for SEC-registered investment advisers -- it requires qualified custodian arrangements for client assets. It has no applicability to L2 security council multisig operations or vulnerability patching. The applicable frameworks are DORA Articles 17-19 (ICT incident management), NIST SP 800-216 (coordinated vulnerability disclosure), and MiCA Art. 67 (organisational requirements for operational resilience).
- **Corrected Text:** Replace with inline `regulatoryContext` array. See corrected scenario below.
- **Source/Rationale:** MiCA Art. 68 text: "A crypto-asset service provider shall make adequate arrangements to safeguard the ownership rights of clients' crypto-assets." SEC Rule 206(4)-2 text: "Custody means holding, directly or indirectly, client funds or securities." Neither applies to security council vulnerability management. DORA Art. 17-19 directly requires incident detection, classification, management, and reporting. NIST SP 800-216 defines the coordinated vulnerability disclosure lifecycle.

### Finding 3
- **Location:** `src/scenarios/web3/security-council.ts`, lines 17-24 (actors array)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** The entire actors array contains only 6 actors: L2 Network, Security Council, Council Member A/B/C, Emergency Admin, Governance Contract.
- **Problem:** Missing two critical actors that exist in every real-world L2 vulnerability management workflow: (1) Bug Bounty / White-Hat Researcher -- the entity that discovers the vulnerability and submits it through the coordinated disclosure channel. In production L2s, the vast majority of critical vulnerability discoveries come from external researchers through Immunefi or HackerOne bug bounty programs, not from council members. (2) Core Engineering Team -- the entity that develops the patch. Security council members review and authorize; they do not write code or develop patches. The core protocol engineering team (employed by the protocol's foundation or development company) develops the fix. By omitting these actors, the scenario misrepresents the fundamental division of responsibilities in L2 vulnerability management.
- **Corrected Text:** Add "Bug Bounty Researcher" (NodeType.Vendor) and "Core Engineering Team" (NodeType.Department) actors. See corrected scenario.
- **Source/Rationale:** Immunefi's 2023-2024 reports show that 90%+ of critical L2 vulnerability discoveries come through bug bounty programs. Arbitrum, Optimism, zkSync, and Polygon all maintain Immunefi bug bounty programs with $1M+ maximum payouts. The engineering team is a separate entity from the council in every production L2.

### Finding 4
- **Location:** `src/scenarios/web3/security-council.ts`, lines 19-24 (L2 Network actor)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `{ id: "l2-network", type: NodeType.Organization, label: "L2 Network", parentId: null, organizationId: "l2-network", color: "#06B6D4", }`
- **Problem:** The Organization actor has no `description` field. Both corrected reference scenarios include detailed descriptions for their Organization actors. The L2 Network description should specify the network type (optimistic rollup or ZK rollup), approximate TVL, governance model, and security council structure. Without this context, the scenario is a generic multi-party approval with no domain grounding.
- **Corrected Text:** Add description: "Layer 2 optimistic rollup network with $500M-$2B TVL, operating a Security Council for emergency upgrade authority..."
- **Source/Rationale:** Corrected treasury-governance.ts line 80 and emergency-pause.ts line 87 both include detailed Organization descriptions.

### Finding 5
- **Location:** `src/scenarios/web3/security-council.ts`, lines 37-41 (Council Member A)
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `label: "Council Member A", description: "Initiates private vulnerability disclosure and coordinates patch review across council"`
- **Problem:** Council members are named generically "A/B/C" with no differentiation of expertise or role. In production L2 security councils, members have distinct profiles: security researchers, protocol engineers, governance delegates, academic cryptographers, ecosystem VCs. The description says Member A "Initiates private vulnerability disclosure" -- implying the council member discovered the vulnerability. In practice, vulnerability discovery typically comes from external researchers (Immunefi/HackerOne), not council members. The council member who receives and triages the report is typically a designated Security Lead or Council Chair with vulnerability disclosure coordination experience.
- **Corrected Text:** Rename to "Security Lead" with description reflecting their triage and coordination role. See corrected scenario.
- **Source/Rationale:** Arbitrum Security Council members include distinct profiles (L2Beat researchers, academic cryptographers, ecosystem builders). The Security Lead / Council Chair role is a common L2 security council pattern for vulnerability report triage.

### Finding 6
- **Location:** `src/scenarios/web3/security-council.ts`, lines 43-50 (Council Member B)
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `label: "Council Member B", description: "Reviews exploit proof-of-concept and verifies affected contracts — availability depends on personal schedule"`
- **Problem:** Generic name with no domain-specific expertise. "Reviews exploit proof-of-concept and verifies affected contracts" describes what the core engineering team does, not what a council member does. Council members review the vulnerability report and the proposed patch for authorization -- they do not independently verify affected contracts on a block explorer. That is the engineering team's job.
- **Corrected Text:** Rename to "Protocol Researcher" or "Smart Contract Auditor" with a description reflecting their review and authorization role.
- **Source/Rationale:** L2 security council workflow: engineering team discovers/triages -> engineering develops patch -> council reviews and authorizes -> engineering deploys.

### Finding 7
- **Location:** `src/scenarios/web3/security-council.ts`, lines 52-59 (Council Member C)
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `label: "Council Member C", description: "Third council signer — delayed execution due to availability extends vulnerability window"`
- **Problem:** "Third council signer" is a description that only makes sense in the context of a 3-member council, which is unrealistically small. The description "delayed execution due to availability" treats the council member as a passive signing bottleneck rather than a substantive reviewer. In production councils, each member brings specific expertise to the review.
- **Corrected Text:** Rename to "Governance Delegate" with description reflecting their governance and decentralization-verification role.
- **Source/Rationale:** Production L2 security councils include governance delegates who verify that emergency actions are proportionate and necessary.

### Finding 8
- **Location:** `src/scenarios/web3/security-council.ts`, lines 62-68 (Emergency Admin)
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `type: NodeType.Role`
- **Problem:** The Emergency Admin is typed as `NodeType.Role`, but in most L2 designs the Emergency Admin is a multisig contract (Safe/Gnosis Safe), not a human role. If the Emergency Admin represents a "separate key set" as the description states, it is functionally a system/contract (a separate Safe multisig), not a person. The Optimism Guardian is a 2-of-2 Safe multisig. Arbitrum's emergency action uses the same 12-member council Safe but with a higher threshold (9-of-12 vs 7-of-12). The NodeType.System type would be more accurate for a multisig contract, or at minimum the description should clarify whether this is a human role or a contract.
- **Corrected Text:** Change to `type: NodeType.System` with description clarifying it is a multisig contract.
- **Source/Rationale:** Optimism Guardian is a Safe multisig contract. Arbitrum emergency action uses a Safe contract. The Emergency Admin as modeled is closer to a system/contract than a human role.

### Finding 9
- **Location:** `src/scenarios/web3/security-council.ts`, lines 80-96 (policy)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Policy has no `mandatoryApprovers` field.
- **Problem:** In production L2 security councils, there is typically a designated Security Lead or Council Chair who triages vulnerability reports, coordinates the response, and is mandatory for any emergency action authorization. Without mandatoryApprovers, any 2-of-3 combination could authorize an emergency upgrade -- including two members who lack the security expertise to evaluate the vulnerability report. The treasury-governance.ts and emergency-pause.ts corrected scenarios both include mandatoryApprovers.
- **Corrected Text:** Add `mandatoryApprovers: ["security-lead"],` -- the Security Lead must be present for any emergency authorization.
- **Source/Rationale:** Corrected treasury-governance.ts line 257, emergency-pause.ts line 233.

### Finding 10
- **Location:** `src/scenarios/web3/security-council.ts`, lines 80-96 (policy)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Policy has no `delegationConstraints` field.
- **Problem:** Delegation from Security Council to Emergency Admin should be heavily constrained. Without delegationConstraints, the Emergency Admin has unbounded authority after escalation -- it could theoretically modify the council multisig itself, upgrade unrelated contracts, or pause the bridge without council authorization. The corrected emergency-pause.ts (line 243) includes detailed delegationConstraints specifying exactly what the delegate can and cannot do.
- **Corrected Text:** Add `delegationConstraints: "Emergency Admin can only execute pre-approved vulnerability patch transactions..."`. See corrected scenario.
- **Source/Rationale:** Corrected emergency-pause.ts lines 237-244.

### Finding 11
- **Location:** `src/scenarios/web3/security-council.ts`, lines 80-96 (policy)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Policy has no `constraints` field.
- **Problem:** Emergency upgrade authority should have constraints. At minimum, a `production` environment constraint should be present (emergency upgrades are for mainnet, not testnet). The corrected emergency-pause.ts includes `constraints: { environment: "production" }`. Optionally, the constraint should also prevent the emergency upgrade from modifying the council membership or threshold.
- **Corrected Text:** Add `constraints: { environment: "production" },`
- **Source/Rationale:** Corrected emergency-pause.ts lines 261-263.

### Finding 12
- **Location:** `src/scenarios/web3/security-council.ts` (top-level)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `costPerHourDefault` field present.
- **Problem:** L2 vulnerability exposure has enormous potential cost. The TVL at risk for major L2s ranges from $500M to $10B+. Each hour of unpatched vulnerability exposure represents potential total loss of bridged assets if the vulnerability is exploited. Even for a smaller L2 ($100M-$500M TVL), the expected cost per hour (probability of exploitation * TVL at risk) is substantial. The corrected emergency-pause.ts uses `costPerHourDefault: 2000000` ($2M/hr). For a security council emergency upgrade scenario (which involves a code-level vulnerability that could drain the entire bridge/rollup), the cost per hour should reflect the probability-weighted TVL exposure.
- **Corrected Text:** Add `costPerHourDefault: 500000,` with a detailed comment. See corrected scenario.
- **Source/Rationale:** Corrected emergency-pause.ts line 78, treasury-governance.ts line 66.

### Finding 13
- **Location:** `src/scenarios/web3/security-council.ts`, lines 115-118 (beforeMetrics)
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `auditGapCount: 4`
- **Problem:** The audit gap count is stated as 4 but not enumerated. Both corrected reference scenarios enumerate every audit gap in detailed comments (treasury-governance.ts lines 345-365, emergency-pause.ts lines 319-342). Without enumeration, the reader cannot evaluate whether the count is accurate. Based on the scenario description, the actual audit gaps include: (1) no formal vulnerability report triage record, (2) no documented patch review procedure, (3) no cryptographic proof of council vote, (4) no delegation authorization record for Emergency Admin, (5) no staged deployment verification, (6) no post-deployment monitoring confirmation, (7) no coordination between L1 and L2 contract upgrades. The count should be at least 6-7.
- **Corrected Text:** `auditGapCount: 7,` with enumerated comments. See corrected scenario.
- **Source/Rationale:** Corrected emergency-pause.ts lines 319-342 enumerates 7 gaps. Corrected treasury-governance.ts lines 345-365 enumerates 5 gaps.

### Finding 14
- **Location:** `src/scenarios/web3/security-council.ts`, lines 115-118 (beforeMetrics)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `approvalSteps: 5`
- **Problem:** The approval steps count is 5 but not enumerated. The corrected reference scenarios enumerate every step (treasury-governance.ts lines 367-383, emergency-pause.ts lines 343-348). The full vulnerability patch approval process should enumerate: (1) vulnerability report received and triaged, (2) core engineering confirms vulnerability and scopes affected contracts, (3) core engineering develops and internally reviews patch, (4) security council reviews vulnerability report and proposed patch, (5) council members verify patch correctness and scope, (6) council threshold vote to authorize deployment, (7) staged deployment: testnet -> shadow fork -> mainnet. The count should be at least 7.
- **Corrected Text:** `approvalSteps: 7,` with enumerated comments. See corrected scenario.
- **Source/Rationale:** Corrected emergency-pause.ts lines 343-348. L2 emergency upgrade process documentation from Arbitrum and Optimism.

### Finding 15
- **Location:** `src/scenarios/web3/security-council.ts` (top-level)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No block comment at the top of the file (before the export).
- **Problem:** Both corrected reference scenarios include detailed multi-paragraph block comments explaining the scenario context, key governance controls modeled, real-world references, and design decisions (treasury-governance.ts lines 5-40, emergency-pause.ts lines 5-54). The security-council.ts has no such comment, making it harder for developers and reviewers to understand the scenario's domain context.
- **Corrected Text:** Add detailed block comment. See corrected scenario.
- **Source/Rationale:** Corrected treasury-governance.ts lines 5-40, emergency-pause.ts lines 5-54.

### Finding 16
- **Location:** `src/scenarios/web3/security-council.ts`, lines 129-141 (todayPolicies)
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `threshold: { k: 3, n: 3, ... }, expirySeconds: 25, delegationAllowed: false,`
- **Problem:** The 3-of-3 unanimous threshold for the "today" policy is extremely restrictive and, combined with `expirySeconds: 25`, creates a near-impossible approval scenario. While this makes the "today" experience dramatically worse (which is the intended pedagogical effect), it is worth noting that even today's L2 security councils do not require unanimity for emergency actions. Arbitrum uses 9-of-12 for emergency (not 12-of-12). The overstatement weakens the scenario's credibility because the improvement from "today" to "with Accumulate" is artificially inflated. A more realistic "today" baseline would be a high threshold (e.g., 3-of-3 for a small council) but with a longer expiry reflecting the actual hours-to-days coordination window.
- **Corrected Text:** Keep 3-of-3 but add detailed comments explaining why this is the "broken" baseline. See corrected scenario.
- **Source/Rationale:** Arbitrum Security Council: 9-of-12 emergency threshold, not 12-of-12 unanimous.

### Finding 17
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 286-345 (Section 5)
- **Issue Type:** Understatement
- **Severity:** High
- **Current Text:** The entire Section 5 narrative (approximately 60 lines).
- **Problem:** The narrative is dramatically thinner than the other corrected Web3 scenario narratives. Section 1 (Treasury Governance) has ~70 lines of detailed prose with 9 takeaway table rows. Section 2 (Emergency Pause) has ~62 lines with 9 takeaway rows. Section 3 (Risk Parameter) has ~70 lines with 9 takeaway rows. Section 5 (Security Council) has ~60 lines but with far less technical depth and only 5 takeaway rows. The narrative lacks: detailed description of the vulnerability disclosure lifecycle, mention of bug bounty programs or white-hat researchers, discussion of L1/L2 contract interaction for emergency upgrades, discussion of staged deployment (testnet -> shadow fork -> mainnet), discussion of council composition or threshold design rationale, any regulatory context, and any real-world L2 security council data or incident references.
- **Corrected Text:** Complete rewrite. See corrected narrative below.
- **Source/Rationale:** Comparison with corrected Sections 1-4 in web3-scenarios.md.

### Finding 18
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 288
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `**Setting:** A critical vulnerability is discovered in an L2 Network. The Security Council (3 members) must vote to authorize an emergency vulnerability patch. If the council can't act fast enough, authority escalates to an Emergency Admin.`
- **Problem:** The setting description is three sentences. Corrected scenarios have 5-10 sentence settings that include: network type, TVL range, council composition rationale, governance model, real-world precedent references, and the specific governance bottleneck being modeled. This setting does not mention whether it is an optimistic or ZK rollup, the TVL at risk, the vulnerability type, how the vulnerability was discovered (bug bounty?), or what contracts are affected. It is so generic that it could describe any multi-party approval scenario, not specifically an L2 security council.
- **Corrected Text:** Expand to full setting description. See corrected narrative.
- **Source/Rationale:** Corrected Section 1 setting is 8 sentences. Corrected Section 2 setting is 6 sentences.

### Finding 19
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 290-298
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Players section lists generic "Council Member A/B/C" with one-line descriptions.
- **Problem:** The Players section does not describe the organizational structure with the depth of corrected scenarios. There is no mention of bug bounty researcher, core engineering team, or the governance model. The descriptions are one-line summaries rather than the detailed role descriptions used in corrected scenarios (e.g., Section 1 lists 7 players with multi-sentence descriptions including timezone, responsibilities, and governance role).
- **Corrected Text:** Expand Players section with named roles, responsibilities, and additional actors. See corrected narrative.
- **Source/Rationale:** Corrected Section 1 Players section (lines 9-18) includes detailed descriptions.

### Finding 20
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 339-345
- **Issue Type:** Understatement
- **Severity:** High
- **Current Text:** Takeaway table has only 5 rows: Council availability, Escalation, Vulnerability exposure, Audit trail, Exploit risk.
- **Problem:** Corrected scenarios have 8-9 takeaway rows covering: approval threshold, coordination model, delegation, escalation, specific risk metric, audit trail, regulatory compliance, and additional domain-specific dimensions. The 5-row table omits: delegation governance (what can the Emergency Admin do?), council composition (3-member vs. production 9-15 member), regulatory compliance (no DORA or NIST reference), staged deployment, and bug bounty / disclosure lifecycle.
- **Corrected Text:** Expand to 9 rows. See corrected narrative.
- **Source/Rationale:** Corrected Sections 1-4 all have 9 takeaway rows.

### Finding 21
- **Location:** `src/scenarios/web3/security-council.ts`, lines 122-128 (todayFriction.manualSteps)
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `{ trigger: "after-request", description: "Private vulnerability disclosure shared in encrypted channel — coordinating patch development and council review", delaySeconds: 6 },`
- **Problem:** The description conflates vulnerability disclosure, patch development, and council review into a single manual step. In reality, these are distinct phases: (1) disclosure is shared with the council, (2) the core engineering team develops the patch (potentially days of engineering work), (3) the council reviews the patch. The manual step description should focus on the coordination bottleneck at this stage, not compress the entire workflow into one step. Additionally, "coordinating patch development" implies the council develops the patch, which is incorrect.
- **Corrected Text:** Split into more precise manual steps reflecting the actual workflow phases. See corrected scenario.
- **Source/Rationale:** NIST SP 800-216 vulnerability disclosure lifecycle: report -> triage -> remediation development -> remediation deployment -> public disclosure.

### Finding 22
- **Location:** `src/scenarios/web3/security-council.ts`, line 89
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text:** `expirySeconds: 7200,`
- **Problem:** The "with Accumulate" policy has a 7200-second (2-hour) expiry, which the narrative calls a "2-hour authority window." For an L2 emergency vulnerability patch, 2 hours is extremely short. Emergency vulnerability patches in production L2s take days to develop, test (testnet, shadow fork), and deploy. The 2-hour window makes sense only for the council authorization vote itself, not for the entire patch lifecycle. The comment should clarify that this is the authorization window for the council vote, not the overall patch timeline.
- **Corrected Text:** Keep 7200 seconds but add detailed comment clarifying scope. See corrected scenario.
- **Source/Rationale:** Arbitrum emergency upgrades: council authorization vote is typically completed within hours, but the full patch lifecycle (development, testing, deployment) spans days.

### Finding 23
- **Location:** `src/scenarios/web3/security-council.ts`, lines 98-106 (edges)
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:** Edges include authority and delegation edges but no edge connecting the Governance Contract to the Security Council or Emergency Admin.
- **Problem:** The edges do not model the relationship between the Security Council and the Governance Contract for patch execution. In the workflow, the council authorizes the patch and the Governance Contract executes it -- this is a downstream execution relationship that should be represented. Additionally, there should be delegation edges from the Security Council to the Emergency Admin (already present, line 105) and potentially from the Emergency Admin to the Governance Contract.
- **Corrected Text:** Add edge: `{ sourceId: "security-council", targetId: "governance-contract", type: "authority" }` to represent the council's authority to trigger governance contract execution.
- **Source/Rationale:** Workflow logic requires the Security Council to have authority over the Governance Contract for patch deployment.

### Finding 24
- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 325-329 ("With Accumulate" section)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Steps 1-5 in the "With Accumulate" section are brief and omit critical workflow elements.
- **Problem:** The "With Accumulate" section does not mention: (1) how the vulnerability was discovered (bug bounty submission?), (2) how the patch was developed (core engineering team), (3) staged deployment (testnet -> shadow fork -> mainnet), (4) post-deployment monitoring, (5) regulatory compliance documentation. Corrected Section 2 (Emergency Pause "With Accumulate") includes 5 detailed steps with audit trail and DORA/NIST compliance references.
- **Corrected Text:** Expand to 6 steps with full workflow detail. See corrected narrative.
- **Source/Rationale:** Corrected Section 2 "With Accumulate" steps (lines 114-122).

### Finding 25
- **Location:** `src/scenarios/web3/security-council.ts`, line 93
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text:** `escalation: { afterSeconds: 20, toRoleIds: ["emergency-admin"], },`
- **Problem:** The escalation `afterSeconds: 20` is consistent with the narrative's "20-second timeout" but the comment does not explain what real-world time this represents. Both corrected scenarios include detailed comments explaining the simulation compression ratio (e.g., emergency-pause.ts: "10 seconds represents approximately 5-10 minutes of real-world unresponsiveness"). For a security council vulnerability patch, 20 simulation seconds should represent a longer real-world period (e.g., 4-8 hours of council quorum failure), because patch development and council review take hours to days, not minutes.
- **Corrected Text:** Add comment: `// Simulation-compressed: 20 seconds represents 4-8 hours of council quorum failure in the real-world vulnerability patch timeline`. See corrected scenario.
- **Source/Rationale:** Corrected emergency-pause.ts lines 246-258 include detailed simulation compression comments.

---

## 3. Missing Elements

1. **Bug Bounty / White-Hat Researcher actor (NodeType.Vendor).** The entity that discovers the vulnerability and submits it through a coordinated disclosure channel (Immunefi, HackerOne). This is the starting point of the vulnerability management workflow in virtually every production L2.

2. **Core Engineering Team actor (NodeType.Department).** The entity that develops the vulnerability patch. The council reviews and authorizes; engineering develops and deploys. This separation of concerns is fundamental to L2 security governance.

3. **Inline regulatoryContext with DORA, NIST SP 800-216, and MiCA Art. 67.** The current REGULATORY_DB.web3 entries are inapplicable. DORA Articles 17-19 govern ICT incident management and reporting. NIST SP 800-216 defines the coordinated vulnerability disclosure framework. MiCA Art. 67 requires organisational resilience procedures.

4. **costPerHourDefault field.** The TVL at risk during the vulnerability window makes this one of the highest-cost-per-hour scenarios in the entire simulator. A $500M-$2B TVL L2 with an unpatched critical vulnerability has probability-weighted exposure of hundreds of thousands to millions of dollars per hour.

5. **mandatoryApprovers.** A designated Security Lead should be mandatory for any emergency council action, ensuring vulnerability triage expertise is always present in the authorization decision.

6. **delegationConstraints.** The Emergency Admin's delegated authority must be explicitly scoped: can only execute pre-approved patch transactions, cannot modify council multisig, cannot upgrade non-affected contracts, cannot pause bridge without separate authorization.

7. **constraints.** At minimum, `environment: "production"` to restrict emergency upgrade authority to mainnet.

8. **Detailed block comment.** Explaining scenario context, key governance controls, real-world references, and design decisions.

9. **Enumerated audit gaps and approval steps.** Both metrics should have detailed comments listing each gap/step.

10. **Staged deployment process.** Production L2 emergency upgrades follow: testnet -> shadow fork -> mainnet with monitoring. The scenario jumps from "council approves" to "Governance Contract executes."

11. **L1 contract interaction.** For optimistic rollups, critical vulnerability patches may require upgrading L1 contracts (bridge, rollup, delayed inbox), adding gas cost and finality delay.

12. **Post-deployment monitoring and public disclosure steps.** After the patch is deployed, the council must verify the fix is effective and coordinate public disclosure (governance forum post, blog post, CVE if applicable).

13. **Council composition rationale.** The 3-member council should be acknowledged as a simulation simplification with a note that production L2 councils have 9-15 members.

14. **Real-world L2 security council incident references.** The narrative should reference real incidents: Arbitrum's September 2023 critical vulnerability (discovered by white-hat researcher riptide, $400M+ at risk), Optimism's February 2022 critical bug (discovered by Jay Freeman, $15M bounty), zkSync's November 2023 vulnerability disclosure.

---

## 4. Corrected Scenario

### Corrected TypeScript (`security-council.ts`)

```typescript
import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * Security Council Escalation -- L2 Vulnerability Disclosure, Council Multisig
 * Operations & Emergency Upgrade Governance
 *
 * Models the coordinated vulnerability disclosure and emergency upgrade workflow
 * for a Layer 2 optimistic rollup network with a 3-member Security Council (a
 * simulation simplification of the production 9-15 member councils used by
 * Arbitrum, Optimism, zkSync Era, and Polygon zkEVM). A critical vulnerability
 * is discovered by an external white-hat researcher through the protocol's
 * Immunefi bug bounty program. The core engineering team triages the report,
 * confirms the vulnerability, develops a patch, and presents it to the Security
 * Council for emergency upgrade authorization. The council must review the
 * vulnerability report, verify the patch correctness, and reach threshold vote
 * to authorize deployment -- all under coordinated private disclosure with no
 * public communication until the patch is deployed.
 *
 * Key governance controls modeled:
 * - 2-of-3 threshold with Security Lead as mandatory approver (vulnerability
 *   triage, disclosure coordination, and patch review sign-off cannot be
 *   bypassed)
 * - Delegation from Security Council to Emergency Admin multisig when council
 *   cannot reach quorum within the authorization window
 * - Delegation constrained: Emergency Admin can only execute pre-approved
 *   patch transactions, cannot modify council composition or threshold,
 *   cannot upgrade non-affected contracts, cannot pause bridge without
 *   separate council authorization
 * - Auto-escalation to Emergency Admin after council quorum failure timeout
 * - Governance Contract (ProxyAdmin) as the on-chain execution mechanism for
 *   emergency upgrades (ProxyAdmin.upgrade() pointing proxy to new
 *   implementation)
 * - Bug Bounty Researcher as the vulnerability discovery source (external
 *   white-hat researcher submitting through Immunefi)
 * - Core Engineering Team as the patch development entity (separate from
 *   the council, which reviews and authorizes but does not develop)
 *
 * Real-world references:
 * - Arbitrum Security Council: 12-member council, 9-of-12 for emergency
 *   upgrades (bypasses 3-day L2 + 12+8 day L1 governance timelock), 7-of-12
 *   for non-emergency proposals. Emergency threshold is HIGHER than non-
 *   emergency, reflecting the principle that actions bypassing governance
 *   require MORE signers.
 * - Optimism Guardian: 2-of-2 multisig (Foundation + delegated signer) with
 *   pause/unpause authority. Security Council formalization underway under
 *   the Optimism Collective governance framework.
 * - zkSync Era: Matter Labs governance multisig with emergency upgrade
 *   authority. Transitioning toward community-elected security council.
 * - Polygon zkEVM: Admin multisig (Polygon Labs) for emergency upgrades.
 *   Transitioning under Polygon 2.0 governance framework.
 *
 * Real-world L2 security incidents:
 * - Arbitrum critical vulnerability (Sep 2023): white-hat researcher riptide
 *   discovered a critical vulnerability in the Arbitrum Nitro sequencer inbox
 *   that could have allowed $400M+ in bridge funds to be stolen. Discovered
 *   through Immunefi, $400K bounty paid. Council coordinated emergency patch.
 * - Optimism critical bug (Feb 2022): Jay Freeman (saurik) discovered a
 *   critical bug in the OVM 2.0 that could have allowed infinite ETH minting.
 *   Reported through Immunefi. $2M bounty paid by Optimism Foundation.
 * - General L2 upgrade pattern: Deploy new implementation contract, Security
 *   Council multisig approves upgrade transaction, ProxyAdmin.upgrade()
 *   points proxy to new implementation. For L1 contracts, requires L1
 *   transactions from council multisig adding gas cost and finality delay.
 *
 * Note on council size: This scenario uses a 3-member council as a simulation
 * simplification. Production L2 security councils have 9-15 members (Arbitrum:
 * 12, Optimism: formalizing similar size). A 3-member council creates
 * unacceptable centralization risk in production -- any 2 members colluding
 * can execute arbitrary upgrades. The 3-member model is used here to keep the
 * simulation tractable while preserving the threshold-escalation governance
 * pattern.
 */
export const securityCouncilScenario: ScenarioTemplate = {
  id: "web3-security-council",
  name: "Security Council Escalation",
  description:
    "A critical vulnerability is discovered in an L2 optimistic rollup network ($500M-$2B TVL) by an external white-hat researcher through the protocol's Immunefi bug bounty program. The core engineering team triages the report, confirms the vulnerability, and develops a patch. The Security Council (3 members, simulation-simplified from production 9-15 member councils) must review the vulnerability report and proposed patch, then reach threshold vote to authorize emergency deployment -- all under coordinated private disclosure with no public communication until the patch is live. Manual council coordination across time zones and member availability extends the vulnerability window from hours to days. No on-call rotation means reaching enough members for quorum depends on personal availability. The Emergency Admin multisig (separate key set, modeled on the Optimism Guardian pattern) serves as a backstop when the council cannot reach quorum within the authorization window.",
  icon: "CubeFocus",
  industryId: "web3",
  archetypeId: "threshold-escalation",
  prompt:
    "What happens when a critical L2 vulnerability discovered through Immunefi requires coordinated private disclosure and an emergency upgrade patch, but the Security Council's manual coordination, member unavailability, and lack of on-call rotation extend the vulnerability window from hours to days -- with $500M-$2B TVL at risk?",

  // costPerHourDefault: cost impact of delayed vulnerability patch deployment.
  // During the vulnerability window (between discovery and patch deployment),
  // the L2 network's TVL is at risk of exploitation. The cost per hour is a
  // probability-weighted estimate:
  //   - TVL at risk: $500M-$2B for a mid-to-large L2 network
  //   - Probability of exploitation per hour: depends on vulnerability
  //     severity, whether it has been independently discovered, and whether
  //     the vulnerability is in a publicly audited component
  //   - For a critical vulnerability (e.g., bridge fund theft, infinite
  //     minting): probability of exploitation increases over time as more
  //     researchers independently discover the issue
  //   - Real-world: Arbitrum's Sep 2023 vulnerability had $400M+ at risk.
  //     Optimism's Feb 2022 bug could have minted infinite ETH.
  // $500,000/hr is a conservative probability-weighted estimate for a mid-tier
  // L2 ($500M TVL) with a critical unpatched vulnerability. For a top-5 L2
  // ($5B+ TVL), the figure could be $5M-$50M/hr.
  costPerHourDefault: 500000,

  actors: [
    // --- L2 Network (the Layer 2 rollup organization) ---
    // The Layer 2 optimistic rollup network operating the bridged assets,
    // sequencer, fraud proof system, and upgradeable L1/L2 contracts.
    // Governance includes token-weighted voting, an elected Security Council
    // for emergency upgrade authority, and a core engineering team for
    // protocol development and maintenance.
    {
      id: "l2-network",
      type: NodeType.Organization,
      label: "L2 Network",
      description:
        "Layer 2 optimistic rollup network with $500M-$2B TVL, operating bridged assets (ETH, stablecoins, ERC-20 tokens), a centralized sequencer with forced inclusion path, fraud proof system (Nitro/Cannon style), and upgradeable L1/L2 system contracts (Rollup, Bridge, Sequencer Inbox, Outbox). Governance includes token-weighted voting for non-emergency proposals and an elected Security Council with emergency upgrade authority that can bypass the governance timelock. Maintains an Immunefi bug bounty program with $1M+ maximum payout for critical vulnerabilities.",
      parentId: null,
      organizationId: "l2-network",
      color: "#06B6D4",
    },

    // --- Security Council ---
    // The elected body authorized to review vulnerability reports and
    // authorize emergency upgrades. In production, councils have 9-15
    // members with distinct expertise profiles. This simulation uses
    // 3 members as a simplification. The council does NOT develop patches
    // -- it reviews the engineering team's proposed fix and authorizes
    // deployment.
    {
      id: "security-council",
      type: NodeType.Department,
      label: "Security Council",
      description:
        "Elected 3-member Security Council (simulation-simplified from production 9-15 member councils) authorized to review vulnerability reports, verify proposed patches, and authorize emergency upgrades that bypass the governance timelock. Coordinates via encrypted Signal/Telegram group restricted to council members and core contributors. No formal on-call rotation -- members are prominent ecosystem participants (security researchers, protocol engineers, governance delegates) who serve voluntarily. Council reviews and authorizes; it does not develop patches.",
      parentId: "l2-network",
      organizationId: "l2-network",
      color: "#06B6D4",
    },

    // --- Security Lead (Council Member A) ---
    // The designated council member who triages vulnerability reports,
    // coordinates the disclosure response, and serves as the primary
    // liaison between the bug bounty researcher, core engineering team,
    // and the rest of the council. Mandatory approver for all emergency
    // actions -- triage and coordination cannot be bypassed.
    {
      id: "security-lead",
      type: NodeType.Role,
      label: "Security Lead",
      description:
        "Designated Security Council chair responsible for vulnerability report triage, severity assessment (CVSS scoring adapted for on-chain impact: TVL at risk, user count, bridge exposure), coordinated disclosure coordination, and council vote facilitation. Receives bug bounty submissions from Immunefi, initiates the private disclosure Signal group, briefs council members on vulnerability scope and proposed patch, and ensures disclosure timeline compliance. Mandatory approver -- triage and coordination sign-off cannot be bypassed for any emergency action.",
      parentId: "security-council",
      organizationId: "l2-network",
      color: "#94A3B8",
    },

    // --- Protocol Researcher (Council Member B) ---
    // Security researcher / auditor on the council with deep expertise
    // in rollup security. Reviews the vulnerability report for technical
    // accuracy, verifies the proposed patch does not introduce new
    // vulnerabilities, and assesses whether the patch scope is
    // proportionate to the threat.
    {
      id: "protocol-researcher",
      type: NodeType.Role,
      label: "Protocol Researcher",
      description:
        "Security researcher / smart contract auditor on the council with rollup security expertise (fraud proof systems, bridge contracts, sequencer operations). Reviews vulnerability report for technical accuracy, independently verifies the proposed patch against the vulnerability (does the fix actually close the attack vector?), checks for regression risk and new attack surfaces introduced by the patch, and assesses whether the patch scope is proportionate. Currently unavailable -- traveling with no secure communication setup, creating the quorum bottleneck.",
      parentId: "security-council",
      organizationId: "l2-network",
      color: "#94A3B8",
    },

    // --- Governance Delegate (Council Member C) ---
    // Governance-focused council member who verifies that emergency
    // actions are proportionate, necessary, and within the council's
    // mandate. Ensures the emergency upgrade does not exceed the
    // council's authorized scope (e.g., upgrading unrelated contracts,
    // modifying governance parameters).
    {
      id: "governance-delegate",
      type: NodeType.Role,
      label: "Governance Delegate",
      description:
        "Governance-focused council member who verifies that emergency upgrade actions are proportionate to the threat, necessary given the vulnerability severity, and within the council's governance mandate. Checks that the upgrade scope is limited to affected contracts (no scope creep to unrelated system contracts), reviews the upgrade transaction calldata against the proposed patch, and confirms the emergency action does not modify council membership, threshold, or governance parameters. Available and responsive.",
      parentId: "security-council",
      organizationId: "l2-network",
      color: "#94A3B8",
    },

    // --- Bug Bounty Researcher (external white-hat) ---
    // The external security researcher who discovered the vulnerability
    // and submitted it through the protocol's Immunefi bug bounty program.
    // This is the typical starting point for L2 vulnerability management
    // -- 90%+ of critical discoveries come through bug bounty programs.
    {
      id: "bug-bounty-researcher",
      type: NodeType.Vendor,
      label: "Bug Bounty Researcher",
      description:
        "External white-hat security researcher who discovered the critical vulnerability and submitted it through the protocol's Immunefi bug bounty program. Provides proof-of-concept exploit code, affected contract addresses, and attack vector description. Operates under Immunefi's coordinated disclosure rules: 90-day disclosure deadline, no public disclosure until patch deployed, bounty payment contingent on valid and unique submission. Bounty range: $50K-$1M+ depending on severity and TVL at risk.",
      parentId: null,
      organizationId: "l2-network",
      color: "#F59E0B",
    },

    // --- Core Engineering Team ---
    // The protocol's engineering team that triages the vulnerability
    // report, confirms the vulnerability, develops the patch, conducts
    // internal code review, and manages staged deployment (testnet ->
    // shadow fork -> mainnet). The council authorizes; engineering
    // develops and deploys.
    {
      id: "core-engineering",
      type: NodeType.Department,
      label: "Core Engineering Team",
      description:
        "Protocol's core engineering team responsible for vulnerability triage (confirming the bug bounty report is valid and reproducible), patch development (writing the fix, internal code review, unit/integration testing), staged deployment management (testnet deployment, shadow fork verification, mainnet deployment with monitoring), and post-deployment verification. The engineering team develops; the Security Council reviews and authorizes. Engineering does NOT self-authorize deployment of emergency patches -- council threshold vote is required.",
      parentId: "l2-network",
      organizationId: "l2-network",
      color: "#06B6D4",
    },

    // --- Emergency Admin (fallback multisig contract) ---
    // A separate Safe multisig contract (not the Security Council Safe)
    // that can execute pre-approved patch transactions when the council
    // cannot reach quorum. Modeled on the Optimism Guardian pattern
    // (separate entity from the Security Council with emergency
    // authority). Typed as NodeType.System because it is a multisig
    // contract, not a human role.
    {
      id: "emergency-admin",
      type: NodeType.System,
      label: "Emergency Admin",
      description:
        "Fallback execution Safe multisig (separate key set from Security Council) activated when the council cannot reach quorum within the authorization window. Modeled on the Optimism Guardian pattern: a separate contract entity with constrained emergency authority. Can ONLY execute pre-approved vulnerability patch transactions that have been reviewed by at least one council member (Security Lead). Cannot modify council membership or threshold, upgrade non-affected contracts, pause the bridge without separate authorization, or execute non-emergency transactions. Deliberate tradeoff between decentralization and response speed.",
      parentId: "l2-network",
      organizationId: "l2-network",
      color: "#8B5CF6",
    },

    // --- Governance Contract (ProxyAdmin / upgrade mechanism) ---
    // The on-chain upgrade execution mechanism. For L2 emergency upgrades,
    // this is typically a ProxyAdmin contract where the Security Council
    // multisig is the owner. Emergency upgrades involve: deploy new
    // implementation -> council approves upgrade tx -> ProxyAdmin.upgrade()
    // points proxy to new implementation. For L1 contracts, requires L1
    // transactions from the council multisig.
    {
      id: "governance-contract",
      type: NodeType.System,
      label: "Governance Contract",
      description:
        "On-chain governance execution mechanism (ProxyAdmin pattern). The Security Council multisig is the owner of the ProxyAdmin contract. Emergency upgrade execution: (1) Core engineering deploys new implementation contract, (2) Security Council multisig approves the upgrade transaction, (3) ProxyAdmin.upgrade() points the proxy to the new implementation. For L1 system contracts (bridge, rollup, delayed inbox), upgrade requires L1 transactions from the council multisig, adding gas cost and L1 block confirmation latency.",
      parentId: "l2-network",
      organizationId: "l2-network",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-security-council",
      // Policy attached to the Security Council, which owns the emergency
      // upgrade authorization process. The council reviews vulnerability
      // reports and proposed patches, then votes to authorize deployment.
      // The Governance Contract (ProxyAdmin) executes the upgrade after
      // council authorization.
      actorId: "security-council",
      threshold: {
        // 2-of-3: Security Lead plus either Protocol Researcher or
        // Governance Delegate. The Security Lead is mandatory (triage
        // and coordination cannot be bypassed). This allows the council
        // to authorize when one member is unavailable, while still
        // requiring multi-party review. In a production 12-member
        // council, this would be 9-of-12 for emergency actions (Arbitrum
        // model) -- proportionally, 2-of-3 is equivalent to 8-of-12.
        k: 2,
        n: 3,
        approverRoleIds: [
          "security-lead",
          "protocol-researcher",
          "governance-delegate",
        ],
      },
      // 7200 seconds (2 hours) -- the authority window for the council's
      // emergency upgrade authorization vote. This is the window for the
      // VOTE, not the entire patch lifecycle. The full lifecycle (report
      // triage -> patch development -> council review -> staged deployment)
      // spans hours to days. The 2-hour vote window creates urgency while
      // allowing sufficient time for council members across time zones to
      // review the vulnerability report and proposed patch.
      expirySeconds: 7200,
      delegationAllowed: true,
      // Delegation: Security Council delegates to Emergency Admin multisig.
      // This models the Optimism Guardian pattern where emergency authority
      // can be exercised by a separate, constrained entity when the primary
      // governance body cannot act.
      delegateToRoleId: "emergency-admin",
      // Security Lead is mandatory for all emergency actions. The Security
      // Lead triages the vulnerability report, assesses severity, coordinates
      // the disclosure response, and briefs the council. Without the Security
      // Lead's triage sign-off, the council cannot assess whether the
      // emergency action is warranted.
      mandatoryApprovers: ["security-lead"],
      // Delegation scope constraints: the Emergency Admin can only execute
      // pre-approved patch transactions that have been reviewed by the
      // Security Lead. The Emergency Admin CANNOT: modify the council
      // multisig (add/remove members, change threshold), upgrade contracts
      // not identified as affected by the vulnerability, pause the bridge
      // without separate council authorization (bridge pause is a separate
      // emergency action with its own authority path), execute non-emergency
      // governance actions, or deploy patches that have not been reviewed
      // by at least the Security Lead.
      delegationConstraints:
        "Delegation from Security Council to Emergency Admin is limited to executing pre-approved vulnerability patch transactions on contracts identified as affected by the disclosed vulnerability and reviewed by the Security Lead. Emergency Admin CANNOT modify council multisig configuration (membership, threshold, Safe modules), upgrade contracts not identified as affected, pause the bridge without separate council authorization (bridge pause uses a separate Guardian authority path), execute non-emergency governance actions (parameter changes, treasury operations), or deploy patches not reviewed by at least the Security Lead. Emergency Admin authority expires after patch deployment confirmation.",
      escalation: {
        // Simulation-compressed: 20 seconds represents 4-8 hours of
        // real-world council quorum failure. In the vulnerability patch
        // timeline, the council has hours (not minutes) to reach quorum
        // because the patch development and internal review phase takes
        // hours to days. However, once the patch is ready for deployment,
        // the authorization vote should be completed within hours to
        // minimize the deployment-ready vulnerability window. If the
        // council cannot reach 2-of-3 within the authorization window,
        // the system escalates to the Emergency Admin multisig.
        afterSeconds: 20,
        toRoleIds: ["emergency-admin"],
      },
      // Emergency upgrade operations are restricted to the production
      // environment (mainnet). Testnet deployments of the patch do not
      // require council authorization -- the core engineering team can
      // deploy to testnet independently for verification purposes.
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "l2-network", targetId: "security-council", type: "authority" },
    {
      sourceId: "security-council",
      targetId: "security-lead",
      type: "authority",
    },
    {
      sourceId: "security-council",
      targetId: "protocol-researcher",
      type: "authority",
    },
    {
      sourceId: "security-council",
      targetId: "governance-delegate",
      type: "authority",
    },
    {
      sourceId: "l2-network",
      targetId: "core-engineering",
      type: "authority",
    },
    {
      sourceId: "l2-network",
      targetId: "emergency-admin",
      type: "authority",
    },
    {
      sourceId: "l2-network",
      targetId: "governance-contract",
      type: "authority",
    },
    // --- Delegation edge (Security Council -> Emergency Admin) ---
    // Security Council delegates emergency upgrade authority to the
    // Emergency Admin multisig within delegation constraints (pre-approved
    // patches only, no council modification, no scope creep).
    {
      sourceId: "security-council",
      targetId: "emergency-admin",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "Coordinated vulnerability disclosure and emergency upgrade authorization via Security Council threshold vote",
    initiatorRoleId: "security-lead",
    targetAction:
      "Authorize Emergency Vulnerability Patch Deployment After Coordinated Private Disclosure, Core Engineering Patch Development, and Security Council Threshold Review",
    description:
      "Bug Bounty Researcher submits critical vulnerability report through Immunefi. Security Lead triages the report, assesses severity (CVSS adapted for on-chain impact: TVL at risk, bridge exposure, user count), and initiates coordinated private disclosure in restricted Signal group. Core Engineering Team confirms the vulnerability, develops a patch, conducts internal code review, and deploys to testnet for verification. Security Lead briefs the council with the vulnerability report, proposed patch, and testnet verification results. Council members review the patch (does it close the attack vector? does it introduce new risks? is the upgrade scope proportionate?). 2-of-3 threshold vote with Security Lead mandatory. After authorization, Core Engineering deploys via staged process: testnet -> shadow fork -> mainnet via Governance Contract (ProxyAdmin.upgrade()). If council cannot reach quorum, auto-escalation to Emergency Admin multisig for constrained patch execution.",
  },
  beforeMetrics: {
    // Wall-clock elapsed time from vulnerability report submission to
    // mainnet patch deployment, under the "today" (manual, no delegation,
    // no escalation) process:
    //   - Vulnerability triage: 2-4 hours (Security Lead reviews Immunefi
    //     submission, confirms severity, initiates Signal group)
    //   - Patch development: 4-24 hours (Core Engineering confirms bug,
    //     develops fix, internal review, testnet deployment)
    //   - Council coordination: 4-24 hours (briefing council members
    //     across time zones, sharing vulnerability report and proposed
    //     patch, waiting for all members to be available)
    //   - Council review and vote: 2-8 hours (each member reviews the
    //     vulnerability report and patch independently)
    //   - Staged deployment: 2-8 hours (shadow fork, mainnet deployment,
    //     monitoring)
    // Total: 12-72 hours. 12 hours represents the optimistic case where
    // all council members are available and the vulnerability is
    // straightforward to patch.
    manualTimeHours: 12,
    // 3 days of risk exposure represents the vulnerability window from
    // report submission to confirmed mainnet patch deployment:
    //   (1) Day 0-1: Vulnerability triage, patch development, initial
    //       internal review. During this period, the vulnerability exists
    //       but is known only to the reporter, Security Lead, and core
    //       engineering. Risk is lower but non-zero (reporter could be
    //       acting in bad faith, other researchers may independently
    //       discover the same issue).
    //   (2) Day 1-2: Council coordination and review. The patch is ready
    //       but awaiting council authorization. This is the highest-risk
    //       period because the vulnerability is confirmed, the fix exists,
    //       but deployment is blocked by governance coordination.
    //   (3) Day 2-3: Staged deployment and post-deployment monitoring.
    //       Patch deployed to mainnet but monitoring for effectiveness
    //       and absence of regression.
    riskExposureDays: 3,
    // Seven audit gaps in the current manual vulnerability management
    // process:
    // (1) No formal vulnerability report triage record -- the Security
    //     Lead's triage decision (severity assessment, scope determination)
    //     is communicated verbally in a Signal group with no structured
    //     record of the evidence reviewed or the severity rationale.
    // (2) No cryptographic proof of coordinated disclosure membership --
    //     who was in the restricted Signal group? Was the disclosure
    //     limited to authorized parties? No tamper-proof record.
    // (3) No documented patch review by council members -- council members
    //     review the patch in a Signal group discussion, but there is no
    //     structured record of what each member reviewed, their assessment,
    //     or their concerns.
    // (4) No formal delegation authorization record -- if the Emergency
    //     Admin executes the patch because the council could not reach
    //     quorum, there is no system record that the delegation was
    //     authorized, within scope, or time-bounded.
    // (5) No staged deployment verification trail -- testnet deployment,
    //     shadow fork results, and mainnet deployment confirmation are
    //     communicated informally with no cryptographic binding between
    //     the stages.
    // (6) No post-deployment monitoring confirmation -- after the patch
    //     is deployed to mainnet, there is no documented verification that
    //     the vulnerability is actually closed and no regression occurred.
    // (7) No coordinated public disclosure record -- the post-patch public
    //     disclosure (governance forum post, blog, CVE) is not formally
    //     linked to the vulnerability report, patch review, and deployment
    //     records.
    auditGapCount: 7,
    // Seven manual steps in the current vulnerability patch process:
    // (1) Bug Bounty Researcher submits vulnerability report through
    //     Immunefi with proof-of-concept exploit code
    // (2) Security Lead triages the report, assesses severity, and
    //     initiates coordinated private disclosure in Signal group
    // (3) Core Engineering Team confirms vulnerability, develops patch,
    //     conducts internal code review
    // (4) Core Engineering deploys patch to testnet for verification
    // (5) Security Lead briefs council members with vulnerability report,
    //     proposed patch, and testnet results
    // (6) Council members independently review patch and vote to authorize
    //     deployment (2-of-3 or 3-of-3 today)
    // (7) Core Engineering executes staged mainnet deployment via
    //     Governance Contract (ProxyAdmin.upgrade()) with monitoring
    approvalSteps: 7,
  },
  todayFriction: {
    ...ARCHETYPES["threshold-escalation"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Security Lead receives Immunefi bug bounty submission, triages the vulnerability report, assesses severity (CVSS scoring for on-chain impact), and initiates coordinated private disclosure in restricted Signal group with council members and core engineering only. Core Engineering confirms vulnerability, begins patch development. No structured triage workflow -- severity assessment communicated verbally in Signal.",
        // Simulation-compressed: represents 4-12 hours real-world elapsed
        // time for vulnerability triage, disclosure initiation, and start
        // of patch development
        delaySeconds: 6,
      },
      {
        trigger: "before-approval",
        description:
          "Council member reviewing vulnerability report, examining proof-of-concept exploit code, and verifying the proposed patch closes the attack vector without introducing new risks. Each council member must independently assess the patch on their own schedule -- no shared review tooling, no structured review checklist. Review communicated in Signal group with no formal sign-off mechanism.",
        // Simulation-compressed: represents 2-8 hours real-world elapsed
        // time for independent council member patch review
        delaySeconds: 7,
      },
      {
        trigger: "on-unavailable",
        description:
          "Protocol Researcher unavailable -- traveling with no secure communication setup. No on-call rotation for council members (they are volunteer ecosystem participants, not operational security staff). Security Lead DMs personal Telegram and tries backup email. With 3-of-3 unanimous required today, the entire emergency upgrade authorization is blocked until Protocol Researcher is reachable. Vulnerability window extends from hours to days. TVL ($500M-$2B) at risk for each additional hour of delay.",
        // Simulation-compressed: represents 12-48 hours real-world delay
        // when a council member is unavailable and unanimous approval is
        // required with no delegation or escalation path
        delaySeconds: 10,
      },
    ],
    narrativeTemplate:
      "Immunefi bug bounty submission, Signal-based coordinated disclosure, manual council patch review with no structured workflow, 3-of-3 unanimous authorization with no on-call rotation or escalation",
  },
  todayPolicies: [
    {
      id: "policy-security-council-today",
      // Today's policy: 3-of-3 unanimous approval with no delegation,
      // no escalation, and no mandatory approver differentiation. This
      // is the root cause of the bottleneck -- a single unavailable
      // council member blocks ALL emergency upgrade authorizations.
      // Note: even production L2 security councils do not require
      // unanimity for emergency actions (Arbitrum: 9-of-12, not 12-of-12).
      // The 3-of-3 unanimous requirement models the worst-case "broken"
      // governance baseline that Accumulate's threshold policy resolves.
      actorId: "security-council",
      threshold: {
        // 3-of-3 unanimous: every council member must approve. A single
        // unavailable member (traveling, asleep, unresponsive) blocks
        // the entire emergency upgrade. For a 3-member council, this
        // means ONE person can prevent a critical vulnerability from
        // being patched.
        k: 3,
        n: 3,
        approverRoleIds: [
          "security-lead",
          "protocol-researcher",
          "governance-delegate",
        ],
      },
      // Simulation-compressed: represents the practical effect of the
      // coordination window collapsing when a council member is
      // unavailable. In real-world terms, 25 seconds models the 12-48
      // hour delay when the next available coordination window cannot
      // be found with all three members.
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to L2 security council emergency
  // upgrade governance, coordinated vulnerability disclosure, and
  // operational resilience. The shared REGULATORY_DB["web3"] entries
  // (MiCA Art. 68 for CASP asset safeguarding, SEC Rule 206(4)-2 for
  // investment adviser custody) are NOT applicable to L2 security council
  // vulnerability management. The directly applicable frameworks are:
  // - DORA Articles 17-19 (ICT incident management, classification, and
  //   reporting) for L2 networks providing infrastructure to EU-regulated
  //   financial entities
  // - NIST SP 800-216 (coordinated vulnerability disclosure framework)
  //   defining disclosure roles, timelines, and procedures
  // - MiCA Art. 67 (organisational requirements for CASPs) requiring
  //   operational resilience and incident response procedures
  regulatoryContext: [
    {
      framework: "DORA",
      displayName: "DORA (EU Reg. 2022/2554) Articles 17-19",
      clause: "ICT-Related Incident Management, Classification & Reporting",
      violationDescription:
        "L2 network operating as ICT infrastructure for EU-regulated financial entities fails to detect, classify, manage, and report a critical vulnerability within DORA-mandated timelines. Emergency upgrade executed without documented incident classification (Article 18 -- severity assessment, affected services, TVL impact), without a formal incident management process (Article 17 -- vulnerability triage, coordinated disclosure, patch development, staged deployment), or without timely reporting to competent authorities (Article 19 -- initial notification within 4 hours of classification as major incident). Security council authorization without structured audit trail constitutes non-compliance for financial entities relying on the L2 network.",
      fineRange:
        "Administrative penalties up to EUR 1% of average daily worldwide turnover for financial entities; ICT third-party service providers designated as critical may face penalties up to EUR 5M or 1% of worldwide turnover; competent authority may restrict or suspend activities",
      severity: "critical",
      safeguardDescription:
        "Accumulate provides cryptographic proof of the complete vulnerability management lifecycle -- bug bounty report timestamp, Security Lead triage decision, severity classification, coordinated disclosure membership, core engineering patch development timeline, council review and authorization vote, staged deployment verification, and post-deployment monitoring -- satisfying DORA Article 17-19 documentation and reporting requirements.",
    },
    {
      framework: "NIST SP 800-216",
      displayName: "NIST SP 800-216 (Vulnerability Disclosure)",
      clause: "Coordinated Vulnerability Disclosure Process",
      violationDescription:
        "L2 security council vulnerability management process does not follow NIST SP 800-216 coordinated vulnerability disclosure framework: no defined roles (finder, vendor, coordinator), no structured triage and severity assessment, no disclosure timeline management (90-day standard), no documented remediation development and verification, and no coordinated public disclosure procedure. Ad-hoc Signal group communication with no structured workflow produces no auditable disclosure record for post-mortem or regulatory examination. Failure to follow NIST-aligned disclosure procedures creates exposure under frameworks that reference NIST (DORA, SOC 2, SEC Regulation SCI).",
      fineRange:
        "No direct fines (NIST is a framework, not a regulation), but failure to follow NIST-aligned vulnerability disclosure procedures creates exposure under DORA Article 17 (ICT incident management), SEC Regulation SCI (for registered entities), and SOC 2 Trust Services Criteria (CC7.1 vulnerability management); reputational damage from poorly managed disclosure may reduce TVL by 10-30%",
      severity: "high",
      safeguardDescription:
        "Policy-enforced vulnerability disclosure workflow maps directly to NIST SP 800-216 phases: Finder Report (bug bounty submission with cryptographic timestamp), Triage & Severity Assessment (Security Lead classification with documented rationale), Remediation Development (core engineering patch with internal review proof), Coordinated Authorization (council threshold vote with cryptographic proof), Staged Deployment (testnet -> shadow fork -> mainnet with verification records), and Public Disclosure (governance forum post linked to complete disclosure record).",
    },
    {
      framework: "MiCA",
      displayName: "MiCA (EU Reg. 2023/1114) Art. 67",
      clause: "Organisational Requirements -- Operational Resilience",
      violationDescription:
        "L2 network foundation entity operating in the EU fails to implement effective procedures for ICT risk management, vulnerability management, and operational resilience as required by MiCA Article 67. Emergency upgrade authorized by security council without documented vulnerability management procedures, without tested incident response plans, and without evidence of operational resilience capability. Security council governance lacks the organisational requirements that MiCA Art. 67 mandates for CASPs, which may be applied to L2 infrastructure providers through the ICT third-party concentration risk provisions.",
      fineRange:
        "Up to EUR 5M or 3% of annual turnover for legal persons; up to EUR 700K for natural persons; potential withdrawal of CASP authorization; supervisory measures including public censure",
      severity: "high",
      safeguardDescription:
        "Accumulate enables L2 security councils to demonstrate operational resilience through policy-enforced vulnerability management with cryptographic proof of: vulnerability triage latency, disclosure coordination, patch development and review, council authorization chain integrity, staged deployment verification, and post-deployment monitoring -- satisfying MiCA Art. 67 organisational requirements for operational resilience.",
    },
  ],
  tags: [
    "web3",
    "l2",
    "security-council",
    "escalation",
    "vulnerability",
    "private-disclosure",
    "coordinated-patch",
    "vulnerability-window",
    "bug-bounty",
    "immunefi",
    "emergency-upgrade",
    "proxy-admin",
    "optimistic-rollup",
    "dora",
    "nist-800-216",
    "multisig",
    "threshold-vote",
    "council-governance",
  ],
};
```

### Corrected Narrative Journey (Markdown)

```markdown
## 5. Security Council Escalation

**Setting:** A critical vulnerability is discovered in a Layer 2 optimistic rollup network ($500M-$2B TVL) by an external white-hat security researcher through the protocol's Immunefi bug bounty program. The core engineering team triages the report, confirms the vulnerability is valid and exploitable, and develops a patch. The Security Council (3 members in this simulation, simplified from the production 9-15 member councils used by Arbitrum, Optimism, zkSync Era, and Polygon zkEVM) must review the vulnerability report and proposed patch, then reach a 2-of-3 threshold vote to authorize emergency deployment -- all under coordinated private disclosure with no public communication until the patch is live on mainnet. The Security Lead (mandatory approver) coordinates disclosure and briefs the council. The Protocol Researcher is traveling and unreachable. The Governance Delegate is available. If the council cannot reach quorum within the authorization window, authority auto-escalates to the Emergency Admin multisig (a separate Safe with constrained authority, modeled on the Optimism Guardian pattern). Real-world precedent: Arbitrum's September 2023 critical vulnerability ($400M+ at risk, discovered by white-hat researcher riptide through Immunefi, $400K bounty); Optimism's February 2022 critical bug (infinite ETH minting, discovered by Jay Freeman, $2M bounty). Each hour of unpatched vulnerability exposure represents probability-weighted potential loss of $500K+ for a mid-tier L2.

**Players:**
- **L2 Network** (organization) -- $500M-$2B TVL optimistic rollup with upgradeable L1/L2 contracts and Immunefi bug bounty program
  - Security Council -- elected 3-member body (simulation-simplified from production 9-15 members)
    - Security Lead -- vulnerability triage, disclosure coordination, council briefing. Mandatory approver.
    - Protocol Researcher -- security researcher / auditor, independent patch review (traveling, unavailable)
    - Governance Delegate -- governance oversight, upgrade scope verification (available)
  - Core Engineering Team -- vulnerability confirmation, patch development, internal review, staged deployment
  - Emergency Admin -- fallback Safe multisig (separate key set), constrained to pre-approved patch execution only
  - Governance Contract -- on-chain ProxyAdmin for emergency upgrade execution
- **Bug Bounty Researcher** (vendor) -- external white-hat researcher, Immunefi submitter, proof-of-concept provider

**Action:** Authorize emergency vulnerability patch deployment via Governance Contract (ProxyAdmin.upgrade()). Requires 2-of-3 council approval with Security Lead mandatory. Delegation to Emergency Admin for pre-approved patch execution if council cannot reach quorum. Auto-escalation to Emergency Admin after timeout. Production environment only.

---

### Today's Process

**Policy:** All 3 of 3 must approve. No delegation. No escalation. Short coordination window.

1. **Bug bounty submission.** An external white-hat researcher submits a critical vulnerability report through the protocol's Immunefi bug bounty program with proof-of-concept exploit code, affected contract addresses, and attack vector description. The Immunefi triage team forwards the report to the protocol's Security Lead. The Security Lead initiates a restricted Signal group with only council members and core engineering -- no public disclosure. Severity assessment performed informally: CVSS scoring adapted for on-chain impact (TVL at risk, bridge exposure, user count) communicated verbally in the Signal group with no structured triage record. *(~6 sec delay)*

2. **Patch development and council briefing.** Core Engineering confirms the vulnerability is valid and reproducible, scopes the affected contracts (bridge contract, sequencer inbox, or rollup contract), and develops a patch with internal code review. Security Lead briefs council members in the Signal group with the vulnerability report, proposed patch diff, and testnet deployment results. Each council member must independently review the patch -- does it close the attack vector? does it introduce new risks? is the upgrade scope limited to affected contracts? Review conducted asynchronously with no structured checklist or shared review tooling. *(~7 sec delay)*

3. **Protocol Researcher unavailable.** The Protocol Researcher (security auditor council member) is traveling with no secure communication setup -- cannot access the Signal group or review the patch. No on-call rotation exists for council members because they are volunteer ecosystem participants, not operational security staff. Security Lead DMs their personal Telegram and tries backup email. With 3-of-3 unanimous approval required and no escalation path, the entire emergency upgrade authorization is blocked. *(~10 sec delay)*

4. **Vulnerability window grows.** With the patch ready for deployment but blocked by council quorum failure, every hour of delay increases the probability of independent discovery and exploitation. The TVL ($500M-$2B) remains at risk. Other security researchers may independently discover the same vulnerability. If the vulnerability is in a publicly auditable contract (L1 bridge or rollup), the attack surface is visible to anyone reading the bytecode. No delegation to the Emergency Admin is available. No escalation mechanism exists.

5. **Outcome:** 12-72 hours of vulnerability exposure depending on when the Protocol Researcher becomes available. TVL at risk throughout the entire window. Audit trail is Signal messages (encrypted but ephemeral), Telegram DMs (informal), and Immunefi submission (structured but not linked to the council review or deployment). No cryptographic proof of council vote, no documented patch review, no staged deployment verification trail. Public disclosure timeline (NIST SP 800-216 90-day standard) has no formal tracking mechanism. If the vulnerability is exploited during the window, post-mortem will reveal governance coordination as the root cause of delayed patching.

**Metrics:** ~12 hours of coordination (optimistic), 3 days of risk exposure, 7 audit gaps, 7 manual steps. Estimated cost: ~$500K/hour in probability-weighted TVL exposure.

---

### With Accumulate

**Policy:** 2-of-3 council threshold (Security Lead, Protocol Researcher, Governance Delegate). Security Lead is mandatory. Delegation to Emergency Admin for pre-approved patch execution. Auto-escalation to Emergency Admin after 4-8 hour quorum failure timeout. Production environment only. 2-hour authorization window.

1. **Bug bounty submission and triage.** Bug Bounty Researcher submits the critical vulnerability report through Immunefi. The Security Lead receives the report, triages severity using structured CVSS assessment adapted for on-chain impact (TVL at risk, bridge exposure, affected user count), and initiates coordinated private disclosure. The policy engine records the triage decision with cryptographic timestamp: vulnerability classification, affected contracts, severity score, and estimated TVL exposure.

2. **Patch development.** Core Engineering Team confirms the vulnerability, develops the patch with internal code review, deploys to testnet for verification, and presents the patch to the Security Lead with testnet results. The Security Lead briefs the council via the policy engine -- vulnerability report, proposed patch, testnet verification, and severity assessment are attached to the authorization request and routed to all three council members.

3. **Threshold met.** Security Lead and Governance Delegate both approve the emergency upgrade authorization. The 2-of-3 threshold is met with the mandatory approver (Security Lead) present. The Protocol Researcher's travel does not block the deployment. The Governance Delegate verifies that the upgrade scope is limited to affected contracts and does not modify council membership, threshold, or unrelated system contracts.

4. **Staged deployment.** Core Engineering executes the staged deployment process: testnet (already completed during patch development) -> shadow fork verification (replay mainnet state with patched contracts) -> mainnet deployment via Governance Contract (ProxyAdmin.upgrade()). Each deployment stage is recorded with cryptographic proof linking the council authorization to the specific implementation contract address deployed.

5. **If council fails, Emergency Admin.** If only the Security Lead were available and the 2-of-3 threshold could not be met within the 2-hour authorization window, the system auto-escalates to the Emergency Admin multisig. The Emergency Admin can execute the pre-approved patch transaction within delegation constraints: cannot modify council configuration, cannot upgrade non-affected contracts, cannot pause the bridge, and cannot execute non-emergency actions. Escalation is cryptographically recorded with timestamp and delegation scope.

6. **Public disclosure.** After mainnet patch deployment is confirmed and post-deployment monitoring verifies the fix is effective, the Security Lead coordinates public disclosure: governance forum post with vulnerability description (redacted technical details for 90 days per NIST SP 800-216), blog post for community communication, and Immunefi bounty payment processing. The complete disclosure lifecycle -- from bug bounty submission to public disclosure -- is linked in a single cryptographic proof chain.

7. **Outcome:** Vulnerability patched within hours of council briefing, not days. Full cryptographic audit trail: Immunefi submission timestamp -> Security Lead triage and severity assessment -> core engineering patch development and testnet verification -> council threshold vote with each member's review -> staged deployment verification -> post-deployment monitoring -> public disclosure. Protocol Researcher can review the patch asynchronously and add their assessment to the record for post-mortem completeness. The audit trail satisfies DORA Articles 17-19 incident management documentation, NIST SP 800-216 coordinated disclosure requirements, and MiCA Art. 67 organisational resilience evidence.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Approval threshold | 3-of-3 unanimous -- single unavailable council member blocks emergency upgrade | 2-of-3 threshold with Security Lead mandatory |
| Vulnerability discovery | Bug bounty submission triaged informally in Signal with no structured severity record | Structured CVSS triage with cryptographic timestamp, severity classification, and TVL exposure assessment |
| Council coordination | Signal/Telegram DMs, personal phone calls, no on-call rotation | Async threshold-based authorization with auto-escalation after timeout |
| When a member is traveling | Entire emergency upgrade authorization blocked indefinitely | Threshold met without them; Emergency Admin as backstop |
| Delegation governance | None -- council is the only authorization path | Emergency Admin with constrained delegation: pre-approved patches only, no council modification, no scope creep |
| Escalation mechanism | None -- manual phone tree through personal contacts | Auto-escalation to Emergency Admin after quorum failure timeout with cryptographic escalation record |
| Staged deployment | Informal -- no documented verification linking testnet, shadow fork, and mainnet | Cryptographic proof chain: testnet verification -> shadow fork -> mainnet deployment -> post-deployment monitoring |
| Audit trail | Signal messages, Telegram DMs, Immunefi submission -- no binding between them | Unified proof: Immunefi report -> triage -> patch development -> council vote -> deployment -> public disclosure |
| Regulatory compliance | No DORA-compliant incident record, no NIST SP 800-216 disclosure tracking | DORA Art. 17-19 incident lifecycle, NIST SP 800-216 coordinated disclosure, MiCA Art. 67 operational resilience |
```

---

## 5. Credibility Risk Assessment

### Target Audience 1: Arbitrum Security Council Member

**Would challenge in ORIGINAL:**
- The 3-member council with no acknowledgment that production councils have 12 members (Arbitrum: 12, 9-of-12 emergency threshold). Would immediately question whether the scenario creators understand L2 security council governance.
- Council Member A as the vulnerability discoverer. Would note that council members review and authorize -- they do not discover vulnerabilities. That is the bug bounty researcher's role.
- The absence of the core engineering team. Would ask: "Who develops the patch in this scenario? The council?"
- MiCA Art. 68 and SEC 206(4)-2 as the regulatory context. Would say: "These regulations have nothing to do with security council operations."
- No discussion of L1 contract interaction for emergency upgrades. Would note that Arbitrum emergency upgrades may require L1 transactions.

**Would accept in CORRECTED:**
- The 3-member council is explicitly acknowledged as a simulation simplification with a note that production councils have 9-15 members. The threshold design (2-of-3 with mandatory approver) is proportionally equivalent to production patterns.
- Bug Bounty Researcher and Core Engineering Team as separate actors reflect the actual division of responsibilities.
- Inline regulatoryContext with DORA, NIST SP 800-216, and MiCA Art. 67 demonstrates understanding of the applicable regulatory landscape.
- Detailed delegationConstraints for the Emergency Admin show awareness of the scope limitation principle.
- Real-world incident references (Arbitrum Sep 2023, Optimism Feb 2022) ground the scenario in actual L2 security events.

### Target Audience 2: Optimism Guardian / Security Council Architect

**Would challenge in ORIGINAL:**
- Emergency Admin typed as NodeType.Role. Would note that the Optimism Guardian is a 2-of-2 Safe multisig contract, not a human role.
- No description of how the Emergency Admin relates to the Optimism Guardian pattern. The description mentions "similar to Arbitrum/Optimism security council designs" but does not specify which design pattern it follows.
- No discussion of the pause/unpause asymmetry (Emergency Admin can execute upgrade, but can it pause the bridge? can it unpause?).

**Would accept in CORRECTED:**
- Emergency Admin typed as NodeType.System with explicit reference to the Optimism Guardian pattern.
- Detailed delegationConstraints specifying that the Emergency Admin cannot pause the bridge (separate authority path) and cannot execute non-emergency actions.
- Block comment explicitly comparing the scenario's Emergency Admin to the Optimism Guardian architecture.

### Target Audience 3: Vulnerability Disclosure Coordinator

**Would challenge in ORIGINAL:**
- No mention of the NIST SP 800-216 coordinated vulnerability disclosure framework or any structured disclosure lifecycle.
- No Bug Bounty Researcher actor -- the vulnerability appears to be discovered by a council member.
- No discussion of disclosure timelines (90-day standard), public disclosure procedures, or bounty payment.
- The entire workflow conflates discovery, development, and authorization.

**Would accept in CORRECTED:**
- NIST SP 800-216 as a regulatory context entry with detailed mapping to the vulnerability disclosure lifecycle phases.
- Bug Bounty Researcher as a separate Vendor actor with Immunefi program details.
- Full disclosure lifecycle modeled: submission -> triage -> patch development -> council authorization -> staged deployment -> public disclosure.
- Narrative includes post-deployment public disclosure step (step 6 in "With Accumulate").

### Target Audience 4: L2 Security Researcher / Auditor

**Would challenge in ORIGINAL:**
- No mention of the ProxyAdmin upgrade pattern -- the Governance Contract's role in the upgrade mechanism is undefined.
- No discussion of L1/L2 contract interaction for emergency upgrades.
- No mention of staged deployment (testnet -> shadow fork -> mainnet).
- No discussion of what contracts are affected or what type of vulnerability is being patched.

**Would accept in CORRECTED:**
- Governance Contract description includes ProxyAdmin pattern details: deploy new implementation -> council approves -> ProxyAdmin.upgrade().
- L1 contract interaction mentioned in Governance Contract description and block comment.
- Staged deployment process modeled in narrative (testnet -> shadow fork -> mainnet).
- Description specifies affected contract types (bridge contract, sequencer inbox, rollup contract).

### Target Audience 5: Regulatory Analyst

**Would challenge in ORIGINAL:**
- MiCA Art. 68 (CASP asset safeguarding) has zero relevance to security council emergency upgrade authority. This is the custody and reserve requirements article, not the operational resilience article.
- SEC Rule 206(4)-2 (Custody Rule for investment advisers) has zero relevance to L2 vulnerability management. This would be immediately flagged as a fundamental misunderstanding of the applicable regulatory landscape.
- No mention of DORA, which is the primary EU regulation applicable to ICT incident management.
- No mention of NIST SP 800-216, which is the de facto standard for coordinated vulnerability disclosure.

**Would accept in CORRECTED:**
- DORA Articles 17-19 with specific reference to ICT incident management, classification, and reporting requirements.
- NIST SP 800-216 with mapping to coordinated vulnerability disclosure phases (finder, vendor, coordinator roles and timelines).
- MiCA Art. 67 (organisational requirements) instead of Art. 68 (asset safeguarding) -- Art. 67 requires operational resilience procedures, which is directly applicable to security council governance.
- Removal of SEC Rule 206(4)-2, which is not applicable to L2 security council operations.
