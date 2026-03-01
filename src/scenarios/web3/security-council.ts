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
