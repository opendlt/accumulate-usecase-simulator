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
