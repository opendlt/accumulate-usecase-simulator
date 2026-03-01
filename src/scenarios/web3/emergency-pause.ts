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
