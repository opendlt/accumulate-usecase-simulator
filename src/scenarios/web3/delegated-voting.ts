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
