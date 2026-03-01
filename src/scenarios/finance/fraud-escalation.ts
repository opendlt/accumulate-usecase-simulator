import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";
import { REGULATORY_DB } from "@/lib/regulatory-data";

export const fraudEscalationScenario: ScenarioTemplate = {
  id: "finance-fraud-escalation",
  name: "Fraud Detection Escalation in Real-Time Payments",
  description:
    "Bank Corp's fraud monitoring platform flags suspicious activity patterns involving real-time payments (RTP / FedNow). Because instant payments are irrevocable once settled, post-settlement investigation and SAR determination must begin promptly. Analysts manage daily queues of 40-60 alerts across fragmented systems — transaction data, customer profiles, prior SAR history, and risk model outputs reside in different platforms. If the assigned analyst is unavailable, cases are reassigned but investigation context is lost in handoff, increasing SAR filing deficiency risk.",
  icon: "ShieldWarning",
  industryId: "finance",
  archetypeId: "threshold-escalation",
  prompt: "What happens when the fraud monitoring system flags suspicious real-time payment activity for investigation and the assigned fraud analyst is unavailable while SAR filing timelines are running?",
  actors: [
    {
      id: "bank-org",
      type: NodeType.Organization,
      label: "Bank Corp",
      parentId: null,
      organizationId: "bank-org",
      color: "#3B82F6",
    },
    {
      id: "fraud-unit",
      type: NodeType.Department,
      label: "Financial Crimes Operations",
      description: "Real-time payment fraud monitoring and investigation unit processing thousands of alerts daily across analyst teams",
      parentId: "bank-org",
      organizationId: "bank-org",
      color: "#06B6D4",
    },
    {
      id: "fraud-analyst",
      type: NodeType.Role,
      label: "Fraud Analyst",
      description: "Front-line analyst performing initial review and disposition of fraud alerts using transaction data, customer profiles, and risk scoring outputs",
      parentId: "fraud-unit",
      organizationId: "bank-org",
      color: "#94A3B8",
    },
    {
      id: "senior-investigator",
      type: NodeType.Role,
      label: "Senior Investigator",
      description: "Handles escalated cases requiring detailed transaction analysis, link analysis, and SAR determination",
      parentId: "fraud-unit",
      organizationId: "bank-org",
      color: "#94A3B8",
    },
    {
      id: "compliance-head",
      type: NodeType.Role,
      label: "BSA/AML Officer",
      description: "Designated BSA/AML Officer responsible for SAR filing decisions, FinCEN reporting, and BSA program oversight",
      parentId: "bank-org",
      organizationId: "bank-org",
      color: "#94A3B8",
    },
    {
      id: "risk-committee",
      type: NodeType.Department,
      label: "Risk Committee",
      description: "Board-level governance committee overseeing enterprise risk, including fraud and financial crimes program adequacy",
      parentId: "bank-org",
      organizationId: "bank-org",
      color: "#06B6D4",
    },
    {
      id: "monitoring-system",
      type: NodeType.System,
      label: "Fraud Monitoring Platform",
      description: "Transaction monitoring system providing real-time fraud detection, risk scoring, and alert generation for RTP/FedNow payment flows",
      parentId: "fraud-unit",
      organizationId: "bank-org",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-fraud-escalation",
      actorId: "fraud-unit",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["fraud-analyst"],
      },
      expirySeconds: 3600,
      delegationAllowed: true,
      delegateToRoleId: "senior-investigator",
      escalation: {
        afterSeconds: 25, // Simulation-compressed: represents 15-30 minute real-world SLA for Tier 1 alerts
        toRoleIds: ["compliance-head"],
      },
    },
  ],
  edges: [
    { sourceId: "bank-org", targetId: "fraud-unit", type: "authority" },
    { sourceId: "fraud-unit", targetId: "fraud-analyst", type: "authority" },
    { sourceId: "fraud-unit", targetId: "senior-investigator", type: "authority" },
    { sourceId: "bank-org", targetId: "compliance-head", type: "authority" },
    { sourceId: "bank-org", targetId: "risk-committee", type: "authority" },
    { sourceId: "fraud-unit", targetId: "monitoring-system", type: "authority" },
    { sourceId: "fraud-analyst", targetId: "senior-investigator", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Real-time payment fraud alert escalation",
    initiatorRoleId: "monitoring-system",
    targetAction: "Investigate Suspicious Real-Time Payment Activity and Determine SAR Filing Requirement",
    description:
      "Fraud Monitoring Platform flags suspicious activity involving real-time payment flows. The fraud analyst must review alert details, transaction history, and risk scoring outputs, with automatic delegation to senior investigator and escalation to BSA/AML Officer if the alert is not acknowledged within the team's response SLA.",
  },
  beforeMetrics: {
    manualTimeHours: 6,
    riskExposureDays: 3,
    auditGapCount: 4,
    approvalSteps: 5,
  },
  todayFriction: {
    ...ARCHETYPES["threshold-escalation"].defaultFriction,
    manualSteps: [
      { trigger: "after-request", description: "Alert queued in fraud monitoring platform — analyst managing daily queue of 40-60 alerts, prioritized by rule-based risk scoring", delaySeconds: 8 },
      { trigger: "before-approval", description: "Analyst reviewing transaction details, customer profile, and account history across separate systems (core banking, CRM, prior SAR database)", delaySeconds: 6 },
      { trigger: "on-unavailable", description: "Assigned analyst unavailable — case reassigned via queue rules but preliminary investigation notes and context are lost in handoff", delaySeconds: 10 },
    ],
    narrativeTemplate: "Rule-based alert queue with fragmented data across fraud monitoring, case management, and core banking systems",
  },
  todayPolicies: [
    {
      id: "policy-fraud-escalation-today",
      actorId: "fraud-unit",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["fraud-analyst"],
      },
      expirySeconds: 20, // Simulation-compressed: represents real-world scenario where alerts age out of SLA window
      delegationAllowed: false,
    },
  ],
  regulatoryContext: REGULATORY_DB.finance,
  tags: ["fraud", "escalation", "compliance", "real-time", "rtp", "fednow", "aml", "sar"],
};
