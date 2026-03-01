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
