import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const riskCommitteeScenario: ScenarioTemplate = {
  id: "finance-risk-committee",
  name: "Risk Limit Delegation for Derivatives Desk Breach",
  description:
    "A proposed interest rate derivatives position would breach the desk-level DV01 risk limit during a period of elevated market volatility. The Head of Market Risk is out of office, and delegation to the Deputy Head is documented in the Delegation of Authority Matrix but the matrix is a static document with ambiguous scope definitions. The Desk Head escalates through the Business Unit Risk Manager, but delays of 2-4 hours are common as the delegate's authority is verified and the risk assessment is reviewed, creating operational risk, governance gaps, and audit challenges.",
  icon: "UserSwitch",
  industryId: "finance",
  archetypeId: "delegated-authority",
  prompt: "What happens when a derivatives desk risk limit breach requires a temporary waiver and the Head of Market Risk is unavailable with ambiguously documented delegation authority?",
  actors: [
    {
      id: "inv-bank-org",
      type: NodeType.Organization,
      label: "Investment Bank",
      parentId: null,
      organizationId: "inv-bank-org",
      color: "#3B82F6",
    },
    {
      id: "risk-dept",
      type: NodeType.Department,
      label: "Market Risk Management",
      description:
        "Independent risk oversight function responsible for the risk limit framework, position monitoring, limit breach escalation, and risk policy enforcement",
      parentId: "inv-bank-org",
      organizationId: "inv-bank-org",
      color: "#06B6D4",
    },
    {
      id: "risk-chair",
      type: NodeType.Role,
      label: "Head of Market Risk",
      description:
        "Senior risk officer with delegated authority to approve temporary limit waivers for desk-level risk limit breaches — currently out of office",
      parentId: "risk-dept",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
    {
      id: "deputy-chair",
      type: NodeType.Role,
      label: "Deputy Head of Market Risk",
      description:
        "Designated alternate with authority to act in the Head of Market Risk's absence — authority scope defined in the Delegation of Authority Matrix",
      parentId: "risk-dept",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
    {
      id: "bu-risk-mgr",
      type: NodeType.Role,
      label: "Desk Risk Manager",
      description:
        "Independent second-line risk manager embedded with the derivatives desk — performs risk assessment and provides limit breach recommendation to Market Risk Management",
      parentId: "risk-dept",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
    {
      id: "cro",
      type: NodeType.Role,
      label: "CRO",
      description:
        "Chief Risk Officer — senior enterprise risk authority with oversight of the risk limit framework; escalation target for limit breaches exceeding the Head of Market Risk's delegated authority",
      parentId: "inv-bank-org",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
    {
      id: "trade-desk",
      type: NodeType.Department,
      label: "Interest Rate Derivatives Desk",
      description:
        "Derivatives trading desk operating under DV01, VaR, and Greek-based risk limits set by the Market Risk Committee",
      parentId: "inv-bank-org",
      organizationId: "inv-bank-org",
      color: "#06B6D4",
    },
    {
      id: "desk-head",
      type: NodeType.Role,
      label: "Desk Head (MD)",
      description:
        "Managing Director overseeing the derivatives desk — first-line supervisory authority for limit utilization and initial escalation point for limit breaches per FINRA Rule 3110",
      parentId: "trade-desk",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
    {
      id: "trader",
      type: NodeType.Role,
      label: "Senior Trader",
      description:
        "Proposes interest rate derivatives position that would breach the desk DV01 limit during elevated market volatility",
      parentId: "trade-desk",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
  ],
  policies: [
    {
      id: "policy-risk-delegation",
      actorId: "risk-dept",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["risk-chair"],
      },
      expirySeconds: 86400,
      delegationAllowed: true,
      delegateToRoleId: "deputy-chair",
      escalation: {
        afterSeconds: 30, // Simulation-compressed; represents 30-60 minute real-world escalation SLA
        toRoleIds: ["cro"],
      },
    },
  ],
  edges: [
    { sourceId: "inv-bank-org", targetId: "risk-dept", type: "authority" },
    { sourceId: "risk-dept", targetId: "risk-chair", type: "authority" },
    { sourceId: "risk-dept", targetId: "deputy-chair", type: "authority" },
    { sourceId: "risk-dept", targetId: "bu-risk-mgr", type: "authority" },
    { sourceId: "inv-bank-org", targetId: "cro", type: "authority" },
    { sourceId: "inv-bank-org", targetId: "trade-desk", type: "authority" },
    { sourceId: "trade-desk", targetId: "desk-head", type: "authority" },
    { sourceId: "trade-desk", targetId: "trader", type: "authority" },
    { sourceId: "risk-chair", targetId: "deputy-chair", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Derivatives desk risk limit waiver during volatile markets",
    initiatorRoleId: "desk-head",
    targetAction:
      "Approve Temporary DV01 Limit Waiver — Interest Rate Derivatives Desk",
    description:
      "The Desk Head requests a temporary limit waiver after a proposed interest rate derivatives position would breach the desk DV01 limit during elevated market volatility. The Head of Market Risk is out of office with delegation to the Deputy Head documented in the Delegation of Authority Matrix. The Desk Risk Manager provides an independent risk assessment while the delegation chain is resolved.",
  },
  beforeMetrics: {
    manualTimeHours: 4,
    riskExposureDays: 2,
    auditGapCount: 6,
    approvalSteps: 9,
  },
  todayFriction: {
    ...ARCHETYPES["delegated-authority"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Desk Head submits limit waiver request through risk management system — Desk Risk Manager begins independent risk assessment while awaiting limit authority response",
        delaySeconds: 8,
      },
      {
        trigger: "on-unavailable",
        description:
          "Head of Market Risk out of office — Desk Risk Manager contacts Market Risk Management office to identify designated alternate with limit waiver authority per Delegation of Authority Matrix",
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        description:
          "Deputy Head of Market Risk locating and reviewing Delegation of Authority Matrix to verify authority scope for this limit tier and product type, then reviewing risk metrics (VaR, DV01, stress impact) in the risk management system",
        delaySeconds: 6,
      },
    ],
    narrativeTemplate:
      "Limit management system plus manual delegation verification against static Delegation of Authority Matrix",
  },
  todayPolicies: [
    {
      id: "policy-risk-delegation-today",
      actorId: "risk-dept",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["risk-chair"],
      },
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "FINRA",
      displayName: "FINRA Rule 3110/3120",
      clause: "Supervision and Supervisory Control Systems",
      violationDescription:
        "Failure to establish and maintain supervisory system for trading activities, including written supervisory procedures for limit breach escalation and delegation of authority",
      fineRange:
        "Censure, fine up to $5M per violation, suspension, or expulsion; individual supervisors subject to statutory disqualification",
      severity: "critical",
      safeguardDescription:
        "Accumulate provides cryptographically verifiable delegation authority and limit breach escalation records, supporting written supervisory procedure documentation requirements under FINRA Rule 3110",
    },
    {
      framework: "SEC",
      displayName: "SEC Rule 15c3-5",
      clause: "Market Access Risk Management Controls",
      violationDescription:
        "Failure to establish, document, and maintain risk management controls for market access, including pre-trade risk limits and supervisory procedures for limit exception processing",
      fineRange:
        "SEC enforcement action; fines of $1M+ per violation; broker-dealer registration suspension; individual liability for supervisory failures",
      severity: "critical",
      safeguardDescription:
        "Accumulate enforces documented delegation authority for limit exception approvals with cryptographic proof of the complete authorization chain, supporting SEC Rule 15c3-5 compliance documentation for supervisory risk limit procedures",
    },
  ],
  tags: [
    "risk",
    "delegation",
    "trading",
    "derivatives",
    "market-risk",
    "desk-limits",
    "limit-waiver",
    "DV01",
    "FINRA-3110",
    "SEC-15c3-5",
  ],
};
