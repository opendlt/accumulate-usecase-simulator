import type { Industry } from "@/types/industry";

export const INDUSTRIES: Industry[] = [
  {
    id: "defense",
    name: "Defense & Intelligence",
    shortName: "Defense",
    description: "Eliminate days-long security clearance bottlenecks and cross-agency approval chains",
    icon: "ShieldCheck",
    color: "#22C55E",
    scenarioIds: [
      "defense-subcontractor-access",
      "defense-coalition-data-sharing",
      "defense-classified-delegation",
      "defense-emergency-override",
      "defense-supply-chain-cert",
    ],
  },
  {
    id: "finance",
    name: "Financial Services",
    shortName: "Finance",
    description: "Replace email-based treasury approvals and manual compliance checks with cryptographic proof",
    icon: "CurrencyCircleDollar",
    color: "#3B82F6",
    scenarioIds: [
      "treasury-transfer",
      "finance-fraud-escalation",
      "finance-risk-committee",
      "finance-regulatory-reporting",
      "finance-vendor-compliance",
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare & Life Sciences",
    shortName: "Healthcare",
    description: "Enforce HIPAA-grade access governance with audit-ready evidence for every authorization",
    icon: "Heartbeat",
    color: "#EF4444",
    scenarioIds: [
      "healthcare-patient-data-access",
      "healthcare-research-collaboration",
      "healthcare-trial-protocol",
      "healthcare-emergency-access",
    ],
  },
  {
    id: "saas",
    name: "SaaS & Technology",
    shortName: "SaaS",
    description: "Automate production access governance and incident response authorization chains",
    icon: "Cloud",
    color: "#8B5CF6",
    scenarioIds: [
      "vendor-access",
      "saas-prod-release",
      "incident-escalation",
      "saas-privileged-access",
      "saas-infra-change",
    ],
  },
  {
    id: "supply-chain",
    name: "Supply Chain & Manufacturing",
    shortName: "Supply Chain",
    description: "Streamline multi-party supplier certifications and quality inspection authorizations",
    icon: "Truck",
    color: "#F59E0B",
    scenarioIds: [
      "supply-chain-supplier-cert",
      "supply-chain-quality-inspection",
      "supply-chain-joint-design",
      "supply-chain-export-control",
      "supply-chain-warranty-chain",
    ],
  },
  {
    id: "web3",
    name: "Web3 & Digital Assets",
    shortName: "Web3",
    description: "Replace key ceremonies and multisig coordination with programmable authority delegation",
    icon: "CubeFocus",
    color: "#06B6D4",
    scenarioIds: [
      "web3-treasury-governance",
      "web3-emergency-pause",
      "web3-risk-parameter",
      "web3-delegated-voting",
      "web3-security-council",
      "web3-cross-chain",
    ],
  },
];

export function getIndustryById(id: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.id === id);
}
