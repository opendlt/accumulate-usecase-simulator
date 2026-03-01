# Review 21 -- Emergency Protocol Pause

**Reviewer:** Hyper-SME Agent -- DeFi Protocol Security, Exploit Response, Guardian Operations & Incident Recovery Governance

**Scenario:** Emergency Protocol Pause (`src/scenarios/web3/emergency-pause.ts`)

**Date:** 2026-02-28

---

## 1. Executive Assessment

### Overall Credibility Score: D+

This scenario captures the broad strokes of an emergency protocol pause during a DeFi exploit -- the Guardian role, hardware wallet latency, escalation to a fallback signer, and the devastating cost of delayed pause execution. The description and prompt text contain operationally specific language (Forta alerts, war room activation, hardware wallet calldata verification) that would pass a cursory review. However, the scenario collapses under scrutiny from anyone who has actually operated a Guardian multisig during a live exploit.

The fundamental problems are structural: (1) the absence of an on-chain monitoring system actor means the detection-to-response pipeline is incomplete, (2) the `Community` actor has no business in an emergency pause workflow and signals a misunderstanding of the operational security boundary, (3) the `Guardian Multisig` typed as a `Department` conflates a smart contract (Safe) with an organizational unit, (4) the regulatory context is imported from `REGULATORY_DB.web3` which contains MiCA Art. 68 (asset safeguarding) and SEC Rule 206(4)-2 (custody) -- neither of which is specific to emergency incident response governance, (5) there is no `costPerHourDefault` despite this being the single most cost-critical scenario in the entire simulator (funds drain at $1M-$100M+ per hour during an active exploit), and (6) the policy lacks `mandatoryApprovers`, `delegationConstraints`, and `constraints` -- all fields that corrected supply-chain scenarios demonstrate are essential for realistic governance modeling.

Compared to the corrected supplier-cert and warranty-chain scenarios, this scenario is approximately 30% of the expected detail and sophistication. It reads like a first draft, not a production-ready scenario.

### Top 3 Critical Issues

1. **No `costPerHourDefault` (Severity: Critical)** -- During an active DeFi exploit, funds drain at rates ranging from $10K/min to $10M+/min. Wormhole lost $320M in under 2 hours. Ronin Bridge lost $600M over 6 days because detection was delayed. Nomad lost $190M in hours. The absence of `costPerHourDefault` means the simulator cannot demonstrate the most compelling argument for Accumulate in this scenario: that even a 10-minute reduction in pause latency saves millions of dollars. This is the single most important missing field.

2. **`REGULATORY_DB.web3` is generic and inapplicable to emergency incident response (Severity: Critical)** -- MiCA Art. 68 addresses asset safeguarding (custody and segregation of client assets) -- it is tangentially relevant but not specific to emergency response procedures. SEC Rule 206(4)-2 is the Custody Rule for investment advisers -- it has nothing to do with emergency protocol pause operations. The directly applicable frameworks are DORA (EU Regulation 2022/2554, Articles 17-19 on ICT-related incident management), NIST SP 800-61 (Computer Security Incident Handling Guide), and MiCA Art. 67 (organisational requirements including operational resilience). Using generic web3 regulatory entries destroys credibility with anyone familiar with DeFi compliance.

3. **No on-chain monitoring system actor (Severity: Critical)** -- The description references "Forta and on-chain anomaly monitoring" but there is no System actor representing the monitoring infrastructure. In real-world DeFi incident response, the monitoring system (Forta Network, OpenZeppelin Defender, Hexagate) is the entity that INITIATES the emergency response. It detects the anomalous transaction, triggers the alert, and in state-of-the-art implementations, automatically executes the pause transaction via a Defender Relayer. The monitoring system is the equivalent of the WMS in the warranty-chain scenario or the SLM System in supplier-cert -- it is the technical control point. Its absence means the scenario cannot model the detection-to-pause pipeline.

### Top 3 Strengths

1. **Operationally specific description text.** The description correctly identifies the key latency sources: war room activation (5-30 minutes), exploit scope confirmation, hardware wallet signing, and the 10-60 minute total execution delay. These numbers align with real-world incident timelines.

2. **Correct use of emergency-break-glass archetype with appropriate friction parameters.** The `todayFriction` manual steps capture the three major delay sources (alert triage, signer unavailability, hardware wallet signing) with realistic descriptions.

3. **Correct modeling of timelock bypass.** The Timelock actor description explicitly states "bypassed during emergency pause operations" with "direct pause authority without timelock delay." This accurately reflects the fundamental architectural decision in DeFi protocols where emergency pauses have a separate authority path that does not go through the governance timelock.

---

## 2. Line-by-Line Findings

### Finding 1: Import of REGULATORY_DB

- **Location:** `src/scenarios/web3/emergency-pause.ts`, line 4
- **Issue Type:** Inaccuracy / Inconsistency
- **Severity:** Critical
- **Current Text:** `import { REGULATORY_DB } from "@/lib/regulatory-data";`
- **Problem:** The scenario imports the shared `REGULATORY_DB` and references `REGULATORY_DB.web3` on line 141. The `web3` entries contain MiCA Art. 68 (asset safeguarding -- about custody and segregation of client assets, not incident response) and SEC Rule 206(4)-2 (Custody Rule for investment advisers -- entirely irrelevant to emergency pause operations). The corrected supply-chain scenarios (supplier-cert, warranty-chain) use inline `regulatoryContext` with entries specific to the scenario's governance domain. This scenario should do the same with entries specific to emergency incident response: DORA (ICT-related incident management), NIST SP 800-61 (incident handling), and MiCA Art. 67 (operational resilience).
- **Corrected Text:** Remove the `REGULATORY_DB` import entirely. Replace `regulatoryContext: REGULATORY_DB.web3` with an inline array of emergency-response-specific regulatory entries.
- **Source/Rationale:** DORA (EU Regulation 2022/2554) Articles 17-19 specifically address ICT-related incident management, classification, and reporting. NIST SP 800-61 is the de facto standard for computer security incident handling. MiCA Art. 67 addresses organisational requirements including operational resilience. These are the directly applicable frameworks for emergency protocol pause governance, not the generic web3 entries (MiCA Art. 68, SEC 206(4)-2) designed for treasury governance scenarios.

### Finding 2: Missing costPerHourDefault

- **Location:** `src/scenarios/web3/emergency-pause.ts`, entire file (missing field)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** (field absent)
- **Problem:** The `ScenarioTemplate` interface includes an optional `costPerHourDefault` field. The warranty-chain scenario sets it to $250/hour for a single PA claim delay. During an active DeFi exploit, the cost of delay is orders of magnitude higher. Real-world data: Wormhole lost $320M in approximately 2 hours ($160M/hour), Ronin Bridge lost $600M (detection delayed 6 days), Nomad Bridge lost $190M in hours, Euler Finance lost $197M, Mango Markets lost $114M. Even a conservative estimate for a mid-tier DeFi protocol with $100M-$500M TVL suggests $500K-$5M per hour of delayed pause execution. This is the single most compelling metric for the Accumulate value proposition in this scenario.
- **Corrected Text:** Add `costPerHourDefault: 2000000` (representing $2M/hour -- a conservative mid-range estimate for a top-50 DeFi protocol during an active exploit).
- **Source/Rationale:** Wormhole ($320M, ~2 hours active drain = ~$160M/hr), Euler ($197M, ~1 hour = ~$197M/hr), Nomad ($190M, ~3 hours of copycat attacks = ~$63M/hr). $2M/hour is a highly conservative figure representing a mid-tier protocol, not a Wormhole-scale event.

### Finding 3: Community Actor is Irrelevant

- **Location:** `src/scenarios/web3/emergency-pause.ts`, lines 71-77
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text:**
  ```typescript
  {
    id: "community-dept",
    type: NodeType.Department,
    label: "Community",
    parentId: "protocol-org",
    organizationId: "protocol-org",
    color: "#06B6D4",
  },
  ```
- **Problem:** The `Community` actor has no description, is not referenced in any policy or workflow, and has no role in emergency pause operations. Emergency pause is a security operation executed under time pressure during an active exploit. Community involvement during an active exploit would: (a) slow response time, (b) potentially leak exploit details to attackers or copycats, and (c) create operational security risk. Community involvement comes AFTER the pause, during the post-mortem, governance vote to unpause, and reimbursement decisions. Including a vestigial `Community` actor signals to a DeFi security expert that the scenario author does not understand the operational security boundary of emergency response.
- **Corrected Text:** Remove the `Community` actor entirely. Replace it with a `Monitoring System` actor (NodeType.System) representing the Forta/Defender/Hexagate detection infrastructure that actually initiates the emergency response.
- **Source/Rationale:** In every major DeFi exploit response, the incident is triaged within a small, trusted security team. Public disclosure happens days to weeks after the exploit is contained, not during active fund drainage.

### Finding 4: Guardian Multisig Typed as Department

- **Location:** `src/scenarios/web3/emergency-pause.ts`, lines 52-60
- **Issue Type:** Jargon Error / Logic Error
- **Severity:** High
- **Current Text:**
  ```typescript
  {
    id: "multisig-dept",
    type: NodeType.Department,
    label: "Guardian Multisig",
    description: "Guardian multisig with fallback escalation — pause transaction requires manual hardware wallet verification",
    parentId: "protocol-org",
    organizationId: "protocol-org",
    color: "#06B6D4",
  },
  ```
- **Problem:** The "Guardian Multisig" is not a department -- it is a smart contract (Gnosis Safe / Safe{Wallet}). If the Guardian and Core Dev are the individual signers, the multisig is the on-chain contract that they submit transactions to. It should be typed as `NodeType.System`. However, the more fundamental issue is that this actor conflates two concepts: (a) the Safe contract that aggregates signer signatures, and (b) the organizational group of signers. Since the individual signers (Guardian, Core Dev) are already modeled as Role actors under the Security Team department, the "Guardian Multisig" either should be a System actor representing the Safe contract or should be removed entirely to avoid duplication. Given that we are adding a Monitoring System actor, converting this to a System actor representing the Safe contract is the cleaner approach.
- **Corrected Text:** Replace with a System actor representing the Guardian Safe contract, or remove and replace with the Monitoring System actor. In the corrected version, this slot is repurposed for the Monitoring System.
- **Source/Rationale:** In the NodeType enum, `System` is defined for technical infrastructure components (Timelock, SLM/ERP System, WMS, Governance Contract). A Gnosis Safe multisig contract is a system, not a department.

### Finding 5: Missing On-Chain Monitoring System Actor

- **Location:** `src/scenarios/web3/emergency-pause.ts`, actors array (missing)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** (actor absent)
- **Problem:** The description references "Forta and on-chain anomaly monitoring" and the `todayFriction` manual steps mention "Forta alert triggered." But there is no System actor representing the monitoring infrastructure. In real-world DeFi incident response, the monitoring system is the entity that detects the exploit and initiates the response pipeline. Forta Network operates decentralized detection bots; OpenZeppelin Defender provides Monitors and Relayers for automated detection and response; Hexagate provides real-time threat detection with pre-transaction simulation. In state-of-the-art implementations, a Defender Relayer holds a hot key authorized only for pause operations and can automatically execute the pause transaction when monitoring conditions are met -- eliminating the human signing bottleneck entirely. This System actor is the equivalent of the WMS in warranty-chain.
- **Corrected Text:** Add a System actor representing the on-chain monitoring and automated response infrastructure.
- **Source/Rationale:** OpenZeppelin Defender Monitors + Relayer is the industry-standard approach for automated pause execution. Forta Network is the most widely deployed decentralized monitoring system. Every major DeFi protocol ($100M+ TVL) uses one or both.

### Finding 6: No mandatoryApprovers

- **Location:** `src/scenarios/web3/emergency-pause.ts`, policy (lines 79-95)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** (field absent from policy)
- **Problem:** The corrected supply-chain scenarios include `mandatoryApprovers` to designate roles that cannot be bypassed. In the emergency pause scenario, the Guardian (or their delegate) is the mandatory first responder -- the entity that must authorize the pause transaction. While the 1-of-1 threshold implicitly requires the Guardian, explicitly setting `mandatoryApprovers: ["guardian"]` aligns with the pattern established by the corrected scenarios and makes the governance intent clear: the Guardian role is not just any approver, it is the designated emergency authority.
- **Corrected Text:** Add `mandatoryApprovers: ["guardian"]` to the policy.
- **Source/Rationale:** Consistency with corrected supplier-cert (mandatoryApprovers: ["qa-manager"]) and warranty-chain (mandatoryApprovers: ["warranty-director"]) scenarios.

### Finding 7: No delegationConstraints

- **Location:** `src/scenarios/web3/emergency-pause.ts`, policy (lines 79-95)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** (field absent from policy)
- **Problem:** Delegation from Guardian to Core Dev should be explicitly constrained. In real-world DeFi security operations, the delegate (Core Dev / on-call security engineer) can execute the emergency pause transaction but CANNOT: (a) modify the pause scope (e.g., pause a subset of contracts when a full pause is required), (b) unpause contracts (this requires separate governance authorization), (c) execute non-emergency transactions using the Guardian's authority (e.g., cannot use the pause authority to upgrade the contract or modify parameters), (d) execute the pause against a contract not covered by the emergency response plan. These constraints are analogous to the warranty-chain delegation constraints (Regional Manager cannot approve SIU-flagged dealers or safety-related claims).
- **Corrected Text:** Add `delegationConstraints` string specifying the scope of Core Dev's delegated authority.
- **Source/Rationale:** Standard principle of least privilege in emergency access control. The delegate should have the minimum authority necessary to contain the incident, not the full authority of the primary responder.

### Finding 8: No constraints

- **Location:** `src/scenarios/web3/emergency-pause.ts`, policy (lines 79-95)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** (field absent from policy)
- **Problem:** Emergency pause operations should have environment constraints. The pause authority should only be exercisable against production (mainnet) contracts -- test/staging (testnet) pauses should not use emergency authority and should not trigger the emergency response pipeline. This is analogous to the warranty-chain constraint (`environment: "production"`) and the supplier-cert constraint (`environment: "sap-enclave"`). Additionally, while there is no dollar `amountMax` for an emergency pause (the entire TVL is at risk), the constraints field would signal that this policy is scoped to a specific operational context.
- **Corrected Text:** Add `constraints: { environment: "production" }` to the policy.
- **Source/Rationale:** Standard operational practice. Emergency pause keys authorized on testnet are for drills and testing. Emergency pause keys authorized on mainnet are the real break-glass authority.

### Finding 9: auditGapCount: 5 Without Enumeration

- **Location:** `src/scenarios/web3/emergency-pause.ts`, line 116
- **Issue Type:** Understatement / Missing Element
- **Severity:** Medium
- **Current Text:** `auditGapCount: 5`
- **Problem:** The corrected supply-chain scenarios enumerate every audit gap with specific descriptions in detailed comments. The emergency-pause scenario states `auditGapCount: 5` with no enumeration. This is both a documentation gap and likely an undercount. Real audit gaps in a manual emergency pause process include: (1) no cryptographic proof of who triggered the alert (monitoring system alert lost in chat logs), (2) no tamper-proof record of exploit confirmation (was the triage done by a qualified person?), (3) no documented delegation chain (who authorized the Core Dev to sign?), (4) no time-stamped record of pause execution (when exactly was the pause confirmed on-chain?), (5) no documented decision basis for pause scope (why were these contracts paused and not others?), (6) no verification that the pause transaction calldata was reviewed by a second party before signing, (7) no post-pause monitoring confirmation (was the pause effective? are funds still draining through an unpaused contract?). This is 7 gaps, not 5.
- **Corrected Text:** Change to `auditGapCount: 7` with detailed comments enumerating each gap.
- **Source/Rationale:** Post-mortem reports from major DeFi exploits (Wormhole, Ronin, Nomad) consistently identify audit trail gaps as a key finding. The inability to reconstruct a precise incident timeline is a recurring theme.

### Finding 10: manualTimeHours: 2 -- Partially Accurate but Needs Context

- **Location:** `src/scenarios/web3/emergency-pause.ts`, line 114
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `manualTimeHours: 2`
- **Problem:** 2 hours is within the realistic range for a fully manual emergency response where the Guardian is available (alert at 15 min + triage at 30 min + signing at 15 min = ~1 hour best case for a waking Guardian, ~2 hours if the Guardian is asleep and Core Dev must be mobilized). However, this understates the worst case. Wormhole's pause took approximately 2 hours. But Ronin Bridge's exploit went undetected for 6 days. The Nomad Bridge hack had multiple copycat attackers draining funds over 3+ hours. For a scenario modeling the "today" friction, 2 hours represents an optimistic mid-case, not the typical case. A more defensible figure is 3-4 hours, representing the common case where the Guardian is asleep (3 AM UTC+9), the Core Dev must be mobilized, and hardware wallet signing adds latency. However, since the description already notes "10-60 minutes" for the execution delay, 2 hours is acceptable if we account for the full incident lifecycle (detection + confirmation + pause execution).
- **Corrected Text:** Retain `manualTimeHours: 2` but add a comment explaining the basis: this represents the active manual effort from alert to pause execution, not the worst-case calendar time (which can be 4-8+ hours or, in cases of delayed detection, days).
- **Source/Rationale:** Wormhole (~2 hours), Euler (~1 hour), Mango Markets (~30 minutes from detection to pause). The range is wide; 2 hours is a reasonable mid-point for active manual effort.

### Finding 11: riskExposureDays: 1 -- Needs Clarification

- **Location:** `src/scenarios/web3/emergency-pause.ts`, line 115
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `riskExposureDays: 1`
- **Problem:** 1 day of risk exposure is reasonable if it represents only the immediate exploit detection-and-containment window. However, the actual risk extends through the full incident lifecycle: pause (hours) + root cause analysis (1-2 days) + fix development (1-3 days) + security audit of fix (3-7 days) + staged unpause and monitoring (1-2 days). The total risk exposure from exploit detection to full operational recovery is typically 7-14 days. During this entire period, the protocol is either paused (users cannot access funds) or operating in a degraded state. For consistency with other scenarios (warranty-chain uses 7 days for dealer network exposure), a value of 3-5 days better represents the full risk window including the recovery period.
- **Corrected Text:** Change to `riskExposureDays: 3` with a comment explaining it covers the acute response phase (detection through pause) plus the initial recovery phase (root cause analysis, fix development). The full recovery phase (audit, staged unpause) extends further but is modeled separately.
- **Source/Rationale:** Euler Finance: protocol paused for approximately 23 days before funds were recovered through negotiation. Wormhole: bridge paused for approximately 2 weeks during fix development and audit. Even fast recoveries take 3-7 days.

### Finding 12: Edge to community-dept is Extraneous

- **Location:** `src/scenarios/web3/emergency-pause.ts`, line 100
- **Issue Type:** Logic Error
- **Severity:** Low
- **Current Text:** `{ sourceId: "protocol-org", targetId: "community-dept", type: "authority" },`
- **Problem:** This edge connects the Protocol organization to the Community actor. Since the Community actor should be removed (Finding 3), this edge is also extraneous. No policy or workflow references the Community actor, so this edge has no functional purpose.
- **Corrected Text:** Remove this edge. Replace with edge to the new Monitoring System actor.
- **Source/Rationale:** Edges should only connect actors that participate in the governance workflow.

### Finding 13: Edge to multisig-dept is Conceptually Wrong

- **Location:** `src/scenarios/web3/emergency-pause.ts`, line 99
- **Issue Type:** Logic Error
- **Severity:** Low
- **Current Text:** `{ sourceId: "protocol-org", targetId: "multisig-dept", type: "authority" },`
- **Problem:** The Guardian Multisig typed as Department should be removed (Finding 4). This edge connecting the Protocol to the multisig "department" should be replaced with an edge to the new Monitoring System or Guardian Safe system actor.
- **Corrected Text:** Remove this edge. Replace with edge to the new actor that replaces the multisig-dept slot.
- **Source/Rationale:** Edges should reflect the actual governance hierarchy, not conceptual artifacts.

### Finding 14: todayPolicies Lacks Escalation Modeling

- **Location:** `src/scenarios/web3/emergency-pause.ts`, lines 128-140
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:**
  ```typescript
  todayPolicies: [
    {
      id: "policy-emergency-pause-today",
      actorId: "security-team",
      threshold: { k: 1, n: 1, approverRoleIds: ["guardian"] },
      expirySeconds: 15,
      delegationAllowed: false,
    },
  ],
  ```
- **Problem:** The "today" policy correctly models the rigid state (no delegation, short expiry). However, `expirySeconds: 15` is extremely short for a simulation. In the corrected supply-chain scenarios, the "today" policy expiry is 20-30 seconds. 15 seconds may cause the simulation to time out before the user can observe the friction. More importantly, the "today" policy should model the reality that there IS no formal escalation path today -- the `escalation` field being absent is correct, but a comment should explain that escalation today is ad-hoc (phone calls, Telegram messages) with no system-enforced timeout.
- **Corrected Text:** Change `expirySeconds` to 20 for simulation consistency. Add a comment explaining the absence of formal escalation.
- **Source/Rationale:** Consistency with corrected scenario patterns (supplier-cert todayPolicy expirySeconds: 30, warranty-chain todayPolicy expirySeconds: 20).

### Finding 15: Narrative Section 2 -- Takeaway Table Too Thin

- **Location:** `docs/scenario-journeys/web3-scenarios.md`, lines 119-127
- **Issue Type:** Understatement
- **Severity:** High
- **Current Text:** 5-row takeaway table (Response time, Timezone dependency, Fund loss during delay, Audit trail, Post-mortem quality)
- **Problem:** The corrected supply-chain scenarios have detailed takeaway tables with 8-9+ rows covering multiple governance dimensions. The emergency pause takeaway table is missing critical comparison dimensions: (a) monitoring-to-pause pipeline (manual alert triage vs. automated detection and response), (b) delegation governance (no delegation vs. constrained delegation to Core Dev), (c) regulatory compliance (no incident documentation vs. DORA/NIST-compliant incident records), (d) unpause governance (ad-hoc vs. formal governance authorization for unpause), (e) cost of delay (no quantification vs. $2M/hour documented), (f) pause scope verification (manual calldata review vs. policy-enforced scope), (g) escalation mechanism (phone tree vs. automatic 10-second escalation).
- **Corrected Text:** Expand to 9-row table covering all governance dimensions.
- **Source/Rationale:** Consistency with the depth of corrected supply-chain scenario narratives.

### Finding 16: Narrative "Telegram war room" vs. TypeScript "Forta" Inconsistency

- **Location:** `docs/scenario-journeys/web3-scenarios.md`, line 89 vs. `src/scenarios/web3/emergency-pause.ts`, line 122
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** Narrative: "An exploit alert is posted in a private Telegram war room." TypeScript todayFriction: "Forta alert triggered -- security team joining emergency war room channels"
- **Problem:** The narrative mentions only Telegram as the alert channel, while the TypeScript references Forta as the detection mechanism. In reality, both are part of the pipeline: Forta (or Defender or Hexagate) detects the anomalous transaction and fires an automated alert, which is then posted to a private war room channel (Telegram, Discord, or Signal). The narrative should reference both the automated detection and the human coordination channel to be consistent with the TypeScript.
- **Corrected Text:** Update narrative to reference both the monitoring system alert and the war room channel.
- **Source/Rationale:** Real-world DeFi incident response uses both automated detection (Forta/Defender/Hexagate) and human coordination channels (Telegram/Discord/Signal). The detection triggers the alert; the war room is where humans coordinate.

### Finding 17: Narrative Missing Real-World Exploit Loss Data

- **Location:** `docs/scenario-journeys/web3-scenarios.md`, Section 2 (lines 68-127)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Generic references to "tens of thousands to millions in losses" (line 97)
- **Problem:** The narrative lacks specific real-world exploit data that would make it compelling and credible to a DeFi security audience. The corrected warranty-chain narrative references specific cost figures ($2B-$5B annual fraud losses at major OEMs). The emergency pause narrative should reference specific DeFi exploits: Wormhole ($320M, Feb 2022), Ronin Bridge ($600M, Mar 2022), Nomad Bridge ($190M, Aug 2022), Euler Finance ($197M, Mar 2023), Mango Markets ($114M, Oct 2022). These are household names in DeFi security -- any head of security at a top-10 protocol would expect to see them referenced.
- **Corrected Text:** Add specific exploit references and loss figures to the narrative.
- **Source/Rationale:** Real-world exploit data is publicly available from DeFi incident databases (rekt.news, DeFiLlama hacks tracker, Chainalysis annual reports).

### Finding 18: Missing Unpause Governance Discussion

- **Location:** `src/scenarios/web3/emergency-pause.ts` and `docs/scenario-journeys/web3-scenarios.md` Section 2
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No mention of unpause governance
- **Problem:** The scenario models only the pause. In practice, the unpause is equally important and often MORE complex -- requiring a governance vote, security audit of the fix, and staged rollout. The asymmetry between fast pause (Guardian authority, bypass timelock) and slow unpause (full governance proposal, timelock delay) is a deliberate security design pattern. Compound's Pause Guardian can ONLY pause -- unpausing requires a governance proposal through the Governor + Timelock. Aave's Emergency Admin can both pause and unpause. This architectural difference is critical for understanding the full incident lifecycle. The scenario should at least acknowledge that unpause requires separate governance authorization.
- **Corrected Text:** Add a note in the workflow description and narrative about the unpause governance requirement.
- **Source/Rationale:** Compound Governance documentation, Aave v3 documentation, OpenZeppelin Pausable pattern documentation.

### Finding 19: Core Dev Label is Non-Standard

- **Location:** `src/scenarios/web3/emergency-pause.ts`, lines 43-50
- **Issue Type:** Jargon Error
- **Severity:** Low
- **Current Text:** `label: "Core Dev"` with description "Fallback escalation target -- mobilized when primary guardian is unavailable during active exploit"
- **Problem:** In real-world DeFi protocol security operations, the escalation target for an unavailable Guardian is typically the "on-call security engineer" or a member of the "Security Council" -- not a "Core Dev." The term "Core Dev" implies a general protocol developer (someone who writes Solidity code for new features), not a security-focused operator trained in emergency response. While some smaller protocols may use a core developer as a backup signer, this is a sign of operational immaturity, not a pattern to model. For the scenario to be credible, the role should be labeled as "On-Call Security Engineer" or "Security Council Member."
- **Corrected Text:** Relabel to "On-Call Security Engineer" with an updated description reflecting security-focused responsibilities.
- **Source/Rationale:** Aave, Compound, and MakerDAO all have dedicated security roles (not general developers) as Guardian signers. The Security Council model (used by Arbitrum, Optimism, and other L2s) separates security authority from development roles.

### Finding 20: Escalation afterSeconds: 10 -- Needs Context Comment

- **Location:** `src/scenarios/web3/emergency-pause.ts`, line 92
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:** `afterSeconds: 10`
- **Problem:** The 10-second escalation timeout is simulation-compressed, but there is no comment explaining what real-world time it represents. The corrected supply-chain scenarios include detailed comments mapping simulation seconds to real-world time periods (e.g., "Simulation-compressed: represents 48-hour real-world timeout before escalating to VP of Supply Chain"). For the emergency pause, the 10-second simulation timeout likely represents approximately 5-10 minutes of real-world time (the maximum acceptable delay before escalating during an active exploit with funds draining). This should be documented.
- **Corrected Text:** Add a comment: "Simulation-compressed: represents approximately 5-10 minutes of real-world unresponsiveness during an active exploit. In practice, if the primary Guardian does not acknowledge the alert within 5-10 minutes, the monitoring system automatically escalates to the on-call rotation."
- **Source/Rationale:** Industry practice. Most DeFi security teams use a 5-15 minute escalation timeout for critical alerts during active incidents.

---

## 3. Missing Elements

1. **On-Chain Monitoring System actor (NodeType.System):** Forta / OpenZeppelin Defender / Hexagate is the detection mechanism that initiates the emergency response. It should be modeled as a System actor with a detailed description of its capabilities: anomalous transaction detection, flash loan monitoring, large transfer alerts, and (for Defender Relayer) automated pause execution.

2. **costPerHourDefault:** $2M/hour conservative estimate for a mid-tier DeFi protocol during an active exploit. This is arguably the most important scenario for this field.

3. **mandatoryApprovers:** Guardian should be mandatory -- the Core Dev / On-Call Security Engineer is a delegate, not a replacement.

4. **delegationConstraints:** Core Dev / On-Call Security Engineer delegation should be constrained: can execute pause, cannot modify pause scope, cannot unpause, cannot execute non-emergency transactions.

5. **constraints:** Environment should be "production" (mainnet only). Testnet pauses are drills, not emergency operations.

6. **Inline regulatoryContext:** DORA Articles 17-19 (ICT incident management), NIST SP 800-61 (incident handling), MiCA Art. 67 (operational resilience) -- all specific to emergency incident response governance.

7. **Enumerated audit gap comments:** All 7 gaps should be described inline, matching the pattern of corrected supply-chain scenarios.

8. **Guardian Safe contract System actor:** The Guardian Multisig is a smart contract (Gnosis Safe), not a department. Should be typed as NodeType.System. (In the corrected version, this is handled by converting the slot to the Monitoring System.)

9. **Unpause governance acknowledgment:** The workflow description and narrative should note that unpausing requires separate governance authorization (typically a full governance proposal through the timelock).

10. **Automated pause execution reference:** The "With Accumulate" narrative should reference the state-of-the-art approach of automated pause execution via Defender Relayer, where monitoring conditions trigger an automatic pause transaction without human signing.

11. **Real-world exploit loss data in narrative:** Wormhole ($320M), Ronin ($600M), Nomad ($190M), Euler ($197M) should be referenced in the narrative to establish credibility.

---

## 4. Corrected Scenario

### Corrected TypeScript (`emergency-pause.ts`)

```typescript
import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * Emergency Protocol Pause -- DeFi Exploit Response & Guardian Operations
 *
 * Models the emergency contract pause workflow at a DeFi protocol during an
 * active smart contract exploit. The on-chain monitoring system (Forta Network /
 * OpenZeppelin Defender / Hexagate) detects anomalous transactions indicating
 * an active exploit (flash loan attack, oracle manipulation, reentrancy, bridge
 * drain). The Security Team triages the alert, confirms it is not a false
 * positive, scopes the affected contracts and attack vector, and initiates the
 * emergency pause. The Guardian (primary on-call signer) must verify the pause
 * transaction calldata, sign with a hardware wallet, and submit the transaction
 * to the Guardian Safe (multisig contract). If the Guardian is unavailable
 * (asleep, traveling, unreachable), authority escalates to the On-Call Security
 * Engineer.
 *
 * Key governance controls modeled:
 * - 1-of-1 threshold with Guardian as mandatory approver for emergency pause
 * - Delegation from Guardian to On-Call Security Engineer when Guardian is
 *   unreachable (constrained: delegate can execute pause but cannot unpause,
 *   modify scope, or execute non-emergency transactions)
 * - Auto-escalation to On-Call Security Engineer after ~5-10 minutes of
 *   Guardian unresponsiveness (simulation-compressed to 10 seconds)
 * - On-chain monitoring system (Forta/Defender/Hexagate) as the detection
 *   mechanism that initiates the emergency response pipeline
 * - Guardian Safe (Gnosis Safe) as the on-chain execution contract
 * - Timelock bypass: Guardian has direct pause authority that does NOT
 *   go through the governance timelock -- this is the fundamental
 *   architectural separation between emergency operations and governance
 * - Unpause requires separate governance authorization (full governance
 *   proposal through timelock) -- Guardian can ONLY pause, not unpause
 *
 * Real-world references:
 * - Compound Pause Guardian: single address authorized to pause individual
 *   markets (cToken contracts). Can ONLY pause -- unpause requires governance.
 * - Aave Emergency Admin: 5-of-10 multisig that can pause/unpause reserves,
 *   freeze/unfreeze reserves, and cancel pending governance proposals.
 * - OpenZeppelin Pausable: standard Solidity pattern with whenNotPaused
 *   modifier and PAUSER_ROLE via AccessControl.
 * - OpenZeppelin Defender Relayer: automated pause execution via hot key
 *   authorized only for pause operations -- eliminates human signing latency.
 * - Forta Network: decentralized monitoring with detection bots for anomalous
 *   transactions, flash loans, large token transfers, governance attacks.
 *
 * Real-world exploit losses demonstrating cost of delayed pause:
 * - Wormhole Bridge: $320M (Feb 2022, ~2 hours active drain)
 * - Ronin Bridge: $600M (Mar 2022, 6 days undetected)
 * - Nomad Bridge: $190M (Aug 2022, ~3 hours of copycat attacks)
 * - Euler Finance: $197M (Mar 2023, ~1 hour active drain)
 * - Mango Markets: $114M (Oct 2022, oracle manipulation)
 */
export const emergencyPauseScenario: ScenarioTemplate = {
  id: "web3-emergency-pause",
  name: "Emergency Protocol Pause",
  description:
    "A DeFi exploit is detected via Forta and on-chain anomaly monitoring. The protocol must pause contracts immediately to prevent cascading loss. War room activation alone takes 5-30 minutes. Teams must confirm false positives, scope affected contracts, and identify attack vectors before mobilizing on-call signers. Hardware wallet signing adds manual verification latency. Total execution delay: 10-60 minutes while funds drain at $10K-$1M+ per minute. Real-world losses from delayed pause execution: Wormhole $320M, Ronin $600M, Nomad $190M, Euler $197M. Unpause requires separate governance authorization through the timelock -- Guardian can only pause, not unpause.",
  icon: "CubeFocus",
  industryId: "web3",
  archetypeId: "emergency-break-glass",
  prompt:
    "What happens when Forta detects an active exploit but war room activation takes 5-30 minutes, on-call signers must confirm scope and attack vectors, and hardware wallet signing delays execution while funds drain at $10K-$1M+ per minute?",

  // costPerHourDefault: cost impact of delayed emergency pause execution.
  // During an active DeFi exploit, funds drain at rates that vary enormously
  // by protocol TVL and exploit efficiency:
  //   - Wormhole: $320M in ~2 hours = ~$160M/hr
  //   - Euler: $197M in ~1 hour = ~$197M/hr
  //   - Nomad: $190M in ~3 hours (copycat attacks) = ~$63M/hr
  //   - Mango Markets: $114M in ~30 minutes = ~$228M/hr
  // $2,000,000/hr ($2M/hr) is a CONSERVATIVE estimate for a mid-tier DeFi
  // protocol (top 50, $100M-$500M TVL). For a top-10 protocol ($1B+ TVL),
  // the figure could be $10M-$100M+/hr. This value enables the simulator
  // to demonstrate that even a 10-minute reduction in pause latency saves
  // $333K+ in potential losses.
  costPerHourDefault: 2000000,

  actors: [
    // --- Protocol (the DeFi organization operating the pausable contracts) ---
    {
      id: "protocol-org",
      type: NodeType.Organization,
      label: "Protocol",
      description:
        "DeFi protocol operating pausable smart contracts with $100M-$500M+ TVL. Maintains Guardian Safe for emergency pause authority, on-chain monitoring infrastructure (Forta/Defender/Hexagate), and 24/7 on-call security rotation for exploit response.",
      parentId: null,
      organizationId: "protocol-org",
      color: "#06B6D4",
    },

    // --- Security Team ---
    // The operational unit responsible for 24/7 monitoring, alert triage,
    // exploit confirmation, war room coordination, and emergency pause
    // execution. Manages the Guardian Safe signer rotation and on-call
    // schedule. Coordinates with white-hat security researchers and
    // external audit firms during incidents.
    {
      id: "security-team",
      type: NodeType.Department,
      label: "Security Team",
      description:
        "24/7 security operations team responsible for monitoring Forta/Defender/Hexagate alerts, triaging on-chain anomalies, confirming exploit scope and attack vectors, coordinating war room response, and managing the Guardian Safe signer on-call rotation. War room activation takes 5-30 minutes depending on time of day and alert severity classification.",
      parentId: "protocol-org",
      organizationId: "protocol-org",
      color: "#06B6D4",
    },

    // --- Guardian (primary on-call signer) ---
    // The primary signer authorized to execute emergency pause transactions
    // via the Guardian Safe. Holds a hardware wallet (Ledger/Trezor) with
    // the signing key. Must verify pause transaction calldata before signing.
    // In this scenario, the Guardian is asleep in UTC+9 (3 AM local time)
    // when the exploit alert fires.
    {
      id: "guardian",
      type: NodeType.Role,
      label: "Guardian",
      description:
        "Primary on-call signer for the Guardian Safe -- must confirm exploit scope, verify pause transaction calldata against the emergency response plan (correct contract addresses, correct function selector, correct pause scope), and sign with hardware wallet (Ledger/Trezor). Currently asleep at 3 AM in UTC+9. Mandatory approver -- the Guardian role is the designated emergency authority for pause operations.",
      parentId: "security-team",
      organizationId: "protocol-org",
      color: "#94A3B8",
    },

    // --- On-Call Security Engineer (escalation/delegation target) ---
    // Backup signer in the Guardian Safe on-call rotation. Mobilized when
    // the primary Guardian is unreachable. In DeFi security operations,
    // this is a security-focused role (not a general developer) trained
    // in emergency response procedures, hardware wallet operations, and
    // pause transaction verification.
    {
      id: "oncall-security-eng",
      type: NodeType.Role,
      label: "On-Call Security Engineer",
      description:
        "Backup signer in the Guardian Safe on-call rotation -- mobilized when primary Guardian is unreachable during active exploit. Trained in emergency response procedures: exploit triage, pause transaction calldata verification, hardware wallet signing, and war room coordination. Delegated authority is constrained: can execute emergency pause but cannot unpause, modify pause scope, or execute non-emergency transactions using Guardian authority.",
      parentId: "security-team",
      organizationId: "protocol-org",
      color: "#94A3B8",
    },

    // --- On-Chain Monitoring System (Forta / Defender / Hexagate) ---
    // The detection infrastructure that initiates the emergency response.
    // This is the technical control point that detects anomalous transactions
    // and triggers alerts. In state-of-the-art implementations, the
    // monitoring system can automatically execute the pause transaction via
    // an OpenZeppelin Defender Relayer (hot key authorized only for pause
    // operations) -- eliminating the human signing bottleneck entirely.
    // This is the equivalent of the WMS in the warranty-chain scenario.
    {
      id: "monitoring-system",
      type: NodeType.System,
      label: "On-Chain Monitoring System",
      description:
        "Forta Network detection bots + OpenZeppelin Defender Monitors + Hexagate real-time threat detection. Monitors for anomalous on-chain activity: flash loan sequences, large unexpected token transfers, oracle price deviations, governance attack patterns, reentrancy signatures, bridge drain sequences. Fires alerts to Security Team war room channels (Telegram/Discord/Signal). In advanced configurations, a Defender Relayer holds a hot key authorized only for pause operations and can automatically execute the pause transaction when monitoring conditions are met -- eliminating human signing latency.",
      parentId: "protocol-org",
      organizationId: "protocol-org",
      color: "#8B5CF6",
    },

    // --- Guardian Safe (on-chain multisig contract) ---
    // The Gnosis Safe (Safe{Wallet}) contract that holds the PAUSER_ROLE
    // authority. In practice, the Guardian Safe is a 2-of-3 or 3-of-5
    // multisig for non-emergency operations. For emergency pause
    // specifically, many protocols authorize a single-signer transaction
    // (1-of-N Safe with the pause function restricted to a module) to
    // eliminate multi-signer coordination latency during active exploits.
    {
      id: "guardian-safe",
      type: NodeType.System,
      label: "Guardian Safe",
      description:
        "Gnosis Safe (Safe{Wallet}) multisig contract holding the PAUSER_ROLE via OpenZeppelin AccessControl. For emergency pause: 1-of-N signer threshold to eliminate multi-signer coordination latency. For non-emergency operations (unpause, parameter changes): requires full multisig threshold (2-of-3 or 3-of-5). Pause transaction submitted via Safe Transaction Service or direct contract call.",
      parentId: "protocol-org",
      organizationId: "protocol-org",
      color: "#8B5CF6",
    },

    // --- Timelock (governance timelock contract) ---
    // Standard governance timelock (e.g., Compound Timelock, OpenZeppelin
    // TimelockController). All governance parameter changes must go through
    // the timelock with a delay (24-48 hours). CRITICAL: the emergency
    // pause function has a SEPARATE authority path that BYPASSES the
    // timelock entirely. This is a fundamental DeFi security architecture
    // decision. Unpause, however, typically requires a governance proposal
    // that DOES go through the timelock.
    {
      id: "timelock-sys",
      type: NodeType.System,
      label: "Timelock",
      description:
        "Governance timelock contract (Compound Timelock / OpenZeppelin TimelockController) with 24-48 hour delay for standard governance actions. BYPASSED during emergency pause operations -- the Guardian has direct pause authority through a separate code path that does not queue through the timelock. Unpause requires a full governance proposal routed through the timelock, ensuring community review before restoring protocol functionality. This pause/unpause asymmetry (fast pause, slow unpause) is a deliberate security design pattern.",
      parentId: "protocol-org",
      organizationId: "protocol-org",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-emergency-pause",
      // Policy attached to the Security Team, which owns the emergency
      // response pipeline and the Guardian Safe signer rotation. The
      // monitoring system detects the exploit, the Security Team triages
      // and confirms, and the Guardian (or delegated On-Call Security
      // Engineer) executes the pause transaction.
      actorId: "security-team",
      threshold: {
        // 1-of-1: Emergency pause requires a single authorized signer.
        // This models the real-world pattern where emergency pause is
        // designed for maximum speed -- a single Guardian signer can
        // execute the pause without waiting for additional signers.
        // Multi-signer coordination is for non-emergency operations.
        k: 1,
        n: 1,
        approverRoleIds: ["guardian"],
      },
      // 300 seconds (5 minutes) -- the authority window for the emergency
      // pause action. This is deliberately short: in an emergency, the
      // pause must be executed within minutes, not hours. If the authority
      // window expires without execution, a new authorization cycle begins
      // (either from the same Guardian or via escalation). 5 minutes is
      // the upper bound for acceptable pause latency at a major protocol.
      expirySeconds: 300,
      delegationAllowed: true,
      // Delegation: Guardian delegates to On-Call Security Engineer.
      // This is the standard DeFi security on-call rotation model.
      delegateToRoleId: "oncall-security-eng",
      // Guardian is mandatory -- the emergency pause authority is vested
      // in the Guardian role. The On-Call Security Engineer is a delegate
      // who can act on the Guardian's behalf, not a replacement.
      mandatoryApprovers: ["guardian"],
      // Delegation from Guardian to On-Call Security Engineer is constrained:
      // the delegate can execute the emergency pause transaction (invoke
      // _pause() on affected contracts) but CANNOT: (1) unpause contracts
      // (requires separate governance authorization through the timelock),
      // (2) modify the pause scope (must pause exactly the contracts
      // specified in the emergency response plan), (3) execute non-emergency
      // transactions using Guardian authority (cannot upgrade contracts,
      // modify parameters, or move funds), (4) extend the pause beyond the
      // initial emergency window without Security Team lead approval.
      delegationConstraints:
        "Delegation from Guardian to On-Call Security Engineer is limited to executing the emergency pause transaction on contracts specified in the emergency response plan. Delegate CANNOT unpause contracts (requires governance proposal through timelock), modify the pause scope (must pause the exact contracts specified), execute non-emergency transactions using Guardian authority (no upgrades, parameter changes, or fund movements), or extend the pause beyond the initial emergency window without Security Team lead confirmation.",
      escalation: {
        // Simulation-compressed: 10 seconds represents approximately 5-10
        // minutes of real-world unresponsiveness during an active exploit.
        // In practice, if the primary Guardian does not acknowledge the
        // alert within 5-10 minutes (measured from the monitoring system
        // alert firing), the system automatically escalates to the On-Call
        // Security Engineer in the rotation. During an active exploit with
        // funds draining at $10K-$1M+ per minute, 5-10 minutes of Guardian
        // unresponsiveness is the maximum acceptable delay before escalation.
        afterSeconds: 10,
        toRoleIds: ["oncall-security-eng"],
      },
      // Emergency pause operations are restricted to the production
      // environment (mainnet contracts). Testnet/staging pause executions
      // are for drills and testing -- they do not use emergency authority
      // and do not trigger the emergency response pipeline.
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "protocol-org", targetId: "security-team", type: "authority" },
    { sourceId: "protocol-org", targetId: "monitoring-system", type: "authority" },
    { sourceId: "protocol-org", targetId: "guardian-safe", type: "authority" },
    { sourceId: "protocol-org", targetId: "timelock-sys", type: "authority" },
    { sourceId: "security-team", targetId: "guardian", type: "authority" },
    { sourceId: "security-team", targetId: "oncall-security-eng", type: "authority" },
    // --- Delegation edge (Guardian -> On-Call Security Engineer) ---
    // Guardian delegates emergency pause authority to the On-Call Security
    // Engineer within the delegation constraints (pause only, no unpause,
    // no scope modification, no non-emergency transactions).
    { sourceId: "guardian", targetId: "oncall-security-eng", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Emergency protocol pause during active DeFi exploit with monitoring-triggered response",
    initiatorRoleId: "guardian",
    targetAction:
      "Execute Emergency Pause on Affected Protocol Contracts to Halt Cascading Fund Loss During Active Exploit",
    description:
      "On-chain monitoring system (Forta/Defender/Hexagate) detects anomalous transaction pattern indicating active exploit (flash loan attack, oracle manipulation, reentrancy, bridge drain). Security Team triages the alert, confirms it is not a false positive, scopes the affected contracts and attack vector. Guardian must verify the pause transaction calldata (correct contract addresses, correct function selector, correct pause scope), sign with hardware wallet, and submit to the Guardian Safe. Execution delay of 10-60 minutes while funds drain at $10K-$1M+ per minute. Automatic escalation to On-Call Security Engineer if Guardian is unresponsive after ~5-10 minutes. Unpause requires separate governance authorization through the timelock -- Guardian can ONLY pause.",
  },
  beforeMetrics: {
    // Wall-clock elapsed time from monitoring alert to confirmed on-chain
    // pause execution, including war room activation, exploit confirmation,
    // signer mobilization, and hardware wallet signing. Active manual effort:
    //   - Security Team: 15-30 min (alert triage, false positive check,
    //     exploit scope confirmation, attack vector identification)
    //   - Guardian/On-Call: 15-30 min (hardware wallet retrieval, connect
    //     to clean machine, pause transaction calldata verification, signing,
    //     on-chain confirmation)
    //   - War room coordination: 10-30 min (cross-timezone communication,
    //     signer availability confirmation, scope agreement)
    // Total: 40-90 minutes typical, up to 2+ hours if primary Guardian is
    // asleep and On-Call must be mobilized. 2 hours represents the mid-case
    // where the Guardian is unavailable (asleep at 3 AM UTC+9) and the
    // On-Call Security Engineer must be woken and mobilized.
    // Real-world: Wormhole pause took ~2 hours. Euler pause was ~1 hour.
    // Ronin detection was delayed 6 DAYS (worst case).
    manualTimeHours: 2,
    // 3 days of risk exposure represents the acute incident lifecycle:
    //   - Day 0: Exploit detection, triage, pause execution (hours)
    //   - Day 1-2: Root cause analysis, fix development, initial fix audit
    //   - Day 3: Staged unpause preparation, monitoring hardening
    // The full recovery phase (complete fix audit, governance vote to
    // unpause, staged rollout, enhanced monitoring) extends to 7-14+ days
    // but is modeled separately. During the entire risk window, the
    // protocol is either actively losing funds (pre-pause), paused with
    // user funds locked (post-pause, pre-fix), or operating in degraded
    // mode (partial unpause).
    // Real-world: Euler was paused ~23 days. Wormhole bridge paused ~2 weeks.
    riskExposureDays: 3,
    // Seven audit gaps in the current manual emergency pause process:
    // (1) No cryptographic proof of who triggered the monitoring alert --
    //     alert origin is a Telegram/Discord message with no tamper-proof
    //     attribution. Post-mortem cannot verify the alert was genuine.
    // (2) No documented exploit confirmation procedure -- the triage decision
    //     (real exploit vs. false positive) is made verbally in a war room
    //     with no record of the evidence reviewed or the decision rationale.
    // (3) No formal delegation chain -- if the Guardian is unavailable and
    //     the On-Call Security Engineer signs, there is no system record
    //     that the delegation was authorized or within scope.
    // (4) No time-stamped record of pause execution decision -- the decision
    //     to pause (and the scope of the pause) is made in a chat channel
    //     with no cryptographic timestamp or authorization proof.
    // (5) No verification that pause transaction calldata was reviewed by
    //     a second party before signing -- a single signer could submit
    //     a malicious transaction disguised as a pause (e.g., upgrading
    //     the contract instead of pausing it).
    // (6) No post-pause monitoring confirmation -- after the pause
    //     transaction is confirmed on-chain, there is no documented
    //     verification that the pause was effective (all affected contracts
    //     actually paused, no funds still draining through an unpaused path).
    // (7) No documented scope decision basis -- why were THESE contracts
    //     paused and not others? Was the pause scope proportional to the
    //     threat? This is critical for the governance vote to unpause.
    auditGapCount: 7,
    // Four manual approval/coordination steps in the current process:
    // (1) Monitoring alert fires -> Security Team triages in war room
    // (2) Guardian (or On-Call) acknowledges and begins pause procedure
    // (3) Signer retrieves hardware wallet and verifies calldata
    // (4) Signer signs and submits pause transaction to Guardian Safe
    approvalSteps: 4,
  },
  todayFriction: {
    ...ARCHETYPES["emergency-break-glass"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Forta/Defender/Hexagate alert triggered -- Security Team joining emergency war room channels (Telegram/Discord/Signal), confirming exploit scope, identifying attack vector (flash loan, oracle manipulation, reentrancy, bridge drain), and ruling out false positive. War room activation takes 5-30 minutes depending on time of day and number of team members reachable.",
        // Simulation-compressed: represents 5-30 minutes real-world elapsed
        // time for monitoring alert, war room activation, exploit confirmation,
        // and scope identification
        delaySeconds: 10,
      },
      {
        trigger: "on-unavailable",
        description:
          "Guardian unavailable -- it is 3 AM in UTC+9. Phone calls to Guardian's personal number unanswered. Security Team initiating fallback escalation to On-Call Security Engineer rotation. Funds draining at $10K-$1M+ per minute with each minute of delay. No automated escalation -- manual phone tree through personal contacts.",
        // Simulation-compressed: represents 10-30 minutes real-world elapsed
        // time for failed Guardian contact attempts and manual escalation to
        // the On-Call Security Engineer
        delaySeconds: 12,
      },
      {
        trigger: "before-approval",
        description:
          "On-Call Security Engineer locating hardware wallet (Ledger/Trezor), connecting to a clean machine, loading the Guardian Safe interface, manually verifying pause transaction calldata (contract addresses, function selector, pause scope) against the emergency response plan before signing. Single-signer verification with no second-party review of the calldata.",
        // Simulation-compressed: represents 10-20 minutes real-world elapsed
        // time for hardware wallet retrieval, connection, calldata verification,
        // signing, and on-chain transaction confirmation
        delaySeconds: 8,
      },
    ],
    narrativeTemplate:
      "War room activation with exploit confirmation, manual phone-tree escalation, hardware wallet signing, and no automated monitoring-to-pause pipeline",
  },
  todayPolicies: [
    {
      id: "policy-emergency-pause-today",
      // Today's policy: 1-of-1 from Guardian with no delegation and no
      // automated escalation. If the Guardian is asleep or unreachable,
      // the entire emergency response depends on someone knowing the
      // right phone number to call. There is no system-enforced escalation
      // timeout -- escalation is ad-hoc via phone calls and Telegram DMs.
      actorId: "security-team",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["guardian"],
      },
      // Simulation-compressed: the very short expiry models the practical
      // effect of the rigid "today" process -- with no delegation and no
      // automated escalation, the authorization window effectively expires
      // (the situation deteriorates) before the Guardian can respond. The
      // 20-second simulation expiry represents the real-world scenario where
      // 15-30 minutes of Guardian unresponsiveness means the exploit has
      // already drained significant funds before anyone can act.
      expirySeconds: 20,
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to DeFi emergency incident response,
  // operational resilience, and exploit recovery governance. The shared
  // REGULATORY_DB["web3"] entries (MiCA Art. 68 on asset safeguarding,
  // SEC Rule 206(4)-2 on custody) are NOT applicable to emergency pause
  // operations. The directly applicable frameworks are DORA (ICT-related
  // incident management), NIST SP 800-61 (computer security incident
  // handling), and MiCA Art. 67 (organisational requirements including
  // operational resilience).
  regulatoryContext: [
    {
      framework: "DORA",
      displayName: "DORA (EU Reg. 2022/2554) Articles 17-19",
      clause: "ICT-Related Incident Management, Classification & Reporting",
      violationDescription:
        "Failure to detect, manage, and report ICT-related incidents within the classification and reporting timelines mandated by DORA. Emergency pause execution without documented incident classification (Article 18 -- severity, affected services, impact assessment), without a formal incident management process (Article 17 -- detection, triage, containment, recovery), or without timely reporting to competent authorities (Article 19 -- initial notification within 4 hours of classification as major incident) constitutes non-compliance for financial entities and their ICT service providers operating under DORA.",
      fineRange:
        "Administrative penalties up to EUR 1% of average daily worldwide turnover for financial entities; ICT third-party service providers designated as critical may face penalties up to EUR 5M or 1% of worldwide turnover; competent authority may restrict or suspend activities",
      severity: "critical",
      safeguardDescription:
        "Accumulate provides cryptographic proof of the complete incident management lifecycle -- detection timestamp, triage decision, exploit classification (severity, affected contracts, impact assessment), pause authorization chain, pause execution confirmation, and recovery actions -- satisfying DORA Article 17-19 documentation and reporting requirements with tamper-proof, auditable records.",
    },
    {
      framework: "NIST SP 800-61",
      displayName: "NIST SP 800-61 Rev. 2",
      clause: "Computer Security Incident Handling Guide",
      violationDescription:
        "Emergency response executed without following established incident handling procedures: no formal incident detection and analysis phase (Section 3.2), no documented containment strategy selection (Section 3.3), no evidence preservation for post-incident activity (Section 3.4), and no chain-of-custody for incident artifacts. Ad-hoc war room response with Telegram/phone coordination produces no auditable incident record for the post-mortem or regulatory examination.",
      fineRange:
        "No direct fines (NIST is a framework, not a regulation), but failure to follow NIST-aligned incident response procedures creates exposure under frameworks that reference NIST: DORA (Article 17), SEC Regulation SCI (for registered entities), SOC 2 Trust Services Criteria (CC7.3-CC7.5 incident management), and state data breach notification laws",
      severity: "high",
      safeguardDescription:
        "Policy-enforced incident response workflow with Accumulate maps directly to NIST SP 800-61 phases: Detection & Analysis (monitoring alert with cryptographic timestamp), Containment (pause authorization with policy proof), Eradication (fix deployment authorization chain), Recovery (unpause governance authorization), and Post-Incident Activity (complete incident timeline with cryptographic proof for post-mortem and regulatory examination).",
    },
    {
      framework: "MiCA",
      displayName: "MiCA (EU Reg. 2023/1114) Art. 67",
      clause: "Organisational Requirements -- Operational Resilience",
      violationDescription:
        "Crypto-Asset Service Provider (CASP) or protocol foundation entity operating without effective procedures for ICT risk management, business continuity, and operational resilience as required by MiCA Article 67. Emergency pause executed without documented procedures, without tested incident response plans, and without evidence of operational resilience capability constitutes a material organisational deficiency that may result in authorization conditions or withdrawal.",
      fineRange:
        "Up to EUR 5M or 3% of annual turnover for CASPs; competent authority may impose additional conditions on authorization, restrict services, or withdraw authorization entirely for material operational resilience failures",
      severity: "high",
      safeguardDescription:
        "Accumulate enables protocols to demonstrate operational resilience capability through policy-enforced emergency response with cryptographic proof of: incident detection latency, response team mobilization, authorization chain integrity, pause execution timing, and recovery governance -- satisfying MiCA Art. 67 organisational requirements for CASPs and protocol foundation entities.",
    },
  ],
  tags: [
    "web3",
    "emergency",
    "exploit",
    "protocol-pause",
    "break-glass",
    "forta",
    "defi",
    "war-room",
    "hardware-wallet",
    "cascading-loss",
    "guardian",
    "defender",
    "hexagate",
    "gnosis-safe",
    "pausable",
    "dora",
    "nist-800-61",
    "incident-response",
    "monitoring",
    "reentrancy",
    "flash-loan",
    "oracle-manipulation",
  ],
};
```

### Corrected Narrative Journey (Markdown -- Section 2 of `web3-scenarios.md`)

```markdown
## 2. Emergency Protocol Pause

**Setting:** An active smart contract exploit is detected -- funds are being drained from the protocol at $10K-$1M+ per minute. The on-chain monitoring system (Forta / OpenZeppelin Defender / Hexagate) fires an alert to the Security Team's war room channel. The Guardian must invoke an emergency pause on all affected protocol contracts immediately. The Guardian is asleep at 3 AM in UTC+9. Real-world losses from delayed pause execution include Wormhole ($320M), Ronin Bridge ($600M), Nomad Bridge ($190M), and Euler Finance ($197M).

**Players:**
- **Protocol** (organization)
  - Security Team -- 24/7 monitoring, alert triage, war room coordination
    - Guardian -- primary on-call signer for the Guardian Safe (asleep, UTC+9)
    - On-Call Security Engineer -- delegate / escalation target (constrained: can pause, cannot unpause)
  - On-Chain Monitoring System -- Forta / Defender / Hexagate detection infrastructure
  - Guardian Safe -- Gnosis Safe multisig contract holding PAUSER_ROLE
  - Timelock -- governance timelock, BYPASSED for emergency pause (unpause goes through timelock)

**Action:** Guardian initiates emergency pause on affected protocol contracts. 1-of-1 approval with auto-escalation to On-Call Security Engineer after ~5-10 minutes of Guardian unresponsiveness. Delegation constrained: delegate can execute pause but cannot unpause, modify scope, or execute non-emergency transactions. Cost of delay: ~$2M/hour during active exploit.

---

### Today's Process

**Policy:** 1-of-1 from Guardian. No delegation. No automated escalation. 20-second expiry (models the rapid deterioration of the situation without response).

1. **Monitoring alert fires.** The on-chain monitoring system (Forta / Defender / Hexagate) detects anomalous transaction patterns -- flash loan sequences, large unexpected token transfers, or oracle price deviations -- indicating an active exploit. An alert is posted in the Security Team's private war room channel (Telegram / Discord / Signal). Someone pings the Guardian's phone number. *(~10 sec delay)*

2. **Guardian is asleep.** It is 3 AM in the Guardian's timezone (UTC+9). No answer. The Security Team calls the On-Call Security Engineer's personal phone as a manual fallback. There is no automated escalation -- the phone tree depends on someone knowing the right number to call. *(~12 sec delay)*

3. **Hardware wallet scramble.** The On-Call Security Engineer wakes up, locates their hardware wallet (Ledger / Trezor), connects to a clean machine, loads the Guardian Safe interface, and manually verifies the pause transaction calldata (contract addresses, function selector, pause scope) against the emergency response plan before signing. No second-party review of the calldata. *(~8 sec delay)*

4. **Funds continue draining.** Every minute of delay means more funds lost -- $10K to $1M+ per minute depending on the exploit efficiency and protocol TVL. The rigid process with no delegation and no automated escalation means the 20-second authorization window has likely expired, requiring a fresh cycle. Total delay: 30-120+ minutes.

5. **Outcome:** Potentially catastrophic fund losses -- Wormhole lost $320M, Euler lost $197M, Nomad lost $190M. Audit trail is Telegram messages, phone call timestamps, and a hardware wallet transaction hash with no documented triage decision, delegation authorization, or calldata verification record. Unpause will require a separate governance proposal through the timelock, potentially keeping user funds locked for days to weeks.

**Metrics:** ~2 hours of delay, 3 days of risk exposure (through initial recovery), 7 audit gaps, 4 manual steps. Estimated cost of delay: ~$2M/hour.

---

### With Accumulate

**Policy:** 1-of-1 from Guardian. Delegation to On-Call Security Engineer (constrained: pause only, no unpause, no scope modification). Auto-escalation to On-Call Security Engineer after ~5-10 minutes. 5-minute authority window. Production environment only.

1. **Exploit detected.** The on-chain monitoring system detects the exploit and triggers the emergency pause request. The policy engine routes the authorization request to the Guardian with full exploit context (affected contracts, attack vector classification, estimated loss rate) from the monitoring system.

2. **Auto-escalation at ~5-10 minutes.** Guardian does not respond within the escalation timeout. The system automatically escalates to the On-Call Security Engineer -- no phone calls, no Telegram messages, no manual phone tree. The escalation is cryptographically recorded with timestamp.

3. **On-Call Security Engineer approves.** The On-Call Security Engineer receives the escalated request with full exploit context, verifies the pause scope against the emergency response plan, and approves the emergency pause. Delegation constraints enforce that the delegate can ONLY execute the pause -- cannot unpause, modify scope, or execute non-emergency transactions. Cryptographic proof of authorization generated.

4. **Protocol paused.** Affected protocol contracts are paused via the Guardian Safe. The monitoring system confirms the pause is effective (no funds still draining through unpaused paths). The 5-minute authority window means additional pause actions can be executed as the situation evolves. Unpause will require a separate governance proposal through the timelock.

5. **Outcome:** Protocol paused within minutes of detection -- fund losses minimized to seconds or minutes of exposure instead of hours. Complete audit trail: monitoring alert timestamp, triage decision, escalation chain, delegation authorization with scope constraints, pause execution confirmation, and post-pause monitoring verification. The audit trail satisfies DORA incident management documentation requirements and NIST SP 800-61 incident handling phases.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Detection-to-pause pipeline | Manual: monitoring alert -> Telegram -> phone tree -> hardware wallet | Automated: monitoring alert -> policy engine -> auto-escalation -> cryptographic approval |
| Response time | 30-120+ minutes (phone tree, hardware wallet) | Minutes (auto-escalation after ~5-10 min timeout) |
| Timezone dependency | Critical -- Guardian must be awake to answer phone | Irrelevant -- auto-escalates to available On-Call Security Engineer |
| Delegation governance | None -- ad-hoc phone calls with no scope constraints | Constrained delegation: pause only, no unpause, no scope modification |
| Escalation mechanism | Manual phone tree through personal contacts | Automatic 5-10 minute timeout with cryptographic escalation record |
| Fund loss during delay | Catastrophic: $2M+/hour (Wormhole $320M, Euler $197M) | Minimized to minutes of exposure |
| Audit trail | Telegram messages, phone logs, hardware wallet tx hash | Cryptographic proof: alert timestamp, triage, escalation chain, delegation scope, pause confirmation |
| Regulatory compliance | No DORA-compliant incident record, no NIST-aligned documentation | DORA Art. 17-19 compliant incident lifecycle, NIST SP 800-61 phase documentation |
| Post-mortem quality | Reconstructed from chat logs and memory | Complete, timestamped, cryptographically verifiable incident timeline |
```

---

## 5. Credibility Risk Assessment

### Head of Security at a Top-10 DeFi Protocol

**Would challenge in ORIGINAL:**
- The absence of an on-chain monitoring system actor is the first thing they would notice. "Where is Forta? Where is Defender? The monitoring system is what wakes us up at 3 AM -- it is not mentioned as an actor?"
- The `Community` actor would draw immediate skepticism: "Community has no role during an active exploit. If community knows about the exploit before we have paused, we have a much bigger problem -- the attacker knows we know."
- The `Guardian Multisig` typed as Department: "The multisig is a Safe contract, not a team. The team is the Security Team. The Safe is the on-chain contract."
- No `costPerHourDefault`: "The entire value proposition of fast pause is that every minute costs us $X. Why is this not quantified?"
- Generic regulatory context (MiCA Art. 68, SEC 206(4)-2): "These are custody rules, not incident response rules. Where is DORA? Where is NIST 800-61?"

**Would accept in CORRECTED:**
- The monitoring system as a System actor with detailed Forta/Defender/Hexagate description.
- The $2M/hour cost of delay with real-world exploit data citations.
- DORA Articles 17-19 and NIST SP 800-61 as the applicable regulatory frameworks.
- The Guardian Safe as a separate System actor from the Security Team.
- Delegation constraints preventing the On-Call Security Engineer from unpausing or modifying scope.

### Guardian Signer

**Would challenge in ORIGINAL:**
- "Core Dev" as the escalation target: "The backup signer is not a random developer. It is the next person on the security on-call rotation -- someone who has drilled this exact procedure."
- The description says "hardware wallet signing adds manual verification latency" but does not model the full signing ceremony: locate wallet, connect to clean machine, load Safe interface, verify calldata, sign. Each step has failure modes.
- No mention of the signing ceremony failure modes: hardware wallet firmware update required, USB connection issues, Safe interface down, RPC node congested.

**Would accept in CORRECTED:**
- "On-Call Security Engineer" as the backup signer role.
- Detailed description of the hardware wallet signing procedure in the todayFriction manual steps.
- Delegation constraints that prevent the delegate from exceeding their authority scope.

### Smart Contract Security Auditor

**Would challenge in ORIGINAL:**
- No mention of the Pausable pattern, PAUSER_ROLE, or AccessControl -- the actual Solidity implementation of the pause mechanism.
- No mention of graduated pause levels (Level 1: pause new deposits, Level 2: pause all external interactions, Level 3: full freeze).
- No discussion of the timelock bypass architecture -- HOW does the Guardian bypass the timelock? Is it a separate code path, a module on the Safe, a direct role on the contract?

**Would accept in CORRECTED:**
- Guardian Safe description referencing PAUSER_ROLE via OpenZeppelin AccessControl.
- Timelock description explicitly stating the separate authority path for emergency pause.
- Delegation constraints preventing non-emergency use of the Guardian's authority.

### Forta/Defender Monitoring Engineer

**Would challenge in ORIGINAL:**
- No monitoring system actor at all. "You mention Forta in the description but it is not modeled. The monitoring system is the most critical component -- it is what determines whether we detect the exploit in seconds or in 6 days (like Ronin)."
- No mention of automated pause execution via Defender Relayer. "The state-of-the-art approach eliminates human signing entirely for the pause operation. Why is this not referenced?"

**Would accept in CORRECTED:**
- Monitoring System as a dedicated System actor with Forta/Defender/Hexagate description.
- Description of automated pause execution via Defender Relayer as the advanced configuration.
- The monitoring system's role as the entity that INITIATES the emergency response pipeline.

### DeFi Incident Response Researcher

**Would challenge in ORIGINAL:**
- No real-world exploit data. "Wormhole, Ronin, Nomad, Euler -- these are the defining incidents of DeFi security. Any emergency pause scenario that does not reference them lacks credibility."
- `riskExposureDays: 1` without context. "Euler was paused for 23 days. Wormhole bridge was paused for 2 weeks. 1 day does not capture the recovery timeline."
- No unpause governance discussion. "The unpause is often harder than the pause. Compound's Pause Guardian can only pause -- unpause requires a full governance proposal."
- The takeaway table has only 5 rows with generic comparisons. "Where is the cost quantification? Where is the regulatory dimension? Where is the delegation governance comparison?"

**Would accept in CORRECTED:**
- Specific exploit data with dollar figures and timelines (Wormhole, Ronin, Nomad, Euler, Mango Markets).
- `riskExposureDays: 3` with a comment explaining it covers the acute response phase.
- Explicit unpause governance discussion in the Timelock description and workflow.
- 9-row takeaway table with cost quantification, regulatory compliance, and delegation governance dimensions.
