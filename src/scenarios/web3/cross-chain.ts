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
