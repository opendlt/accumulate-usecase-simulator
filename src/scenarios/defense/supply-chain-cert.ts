import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";
import { REGULATORY_DB } from "@/lib/regulatory-data";

export const supplyChainCertScenario: ScenarioTemplate = {
  id: "defense-supply-chain-cert",
  name: "Subcontractor CMMC Compliance & Supplier Qualification",
  description:
    "A Tier-2 subcontractor providing critical components needs CMMC Level 2 certification validated and supplier qualification completed by a Prime Contractor before participating in a defense program handling CUI. Requirements include CMMC compliance validation against NIST SP 800-171, DFARS 252.204-7012/7019/7020/7021 flow-down adherence, AS9100D quality management system verification, counterfeit part avoidance controls per DFARS 252.246-7007 and SAE AS6171/AS6081, and component provenance documentation. The Quality Engineer is conducting an on-site supplier audit at another facility, blocking the quality and provenance review.",
  icon: "ShieldCheck",
  industryId: "defense",
  archetypeId: "regulatory-compliance",
  prompt:
    "What happens when a Tier-2 subcontractor's CMMC compliance and AS9100D certification need validation but the Quality Engineer is at an on-site supplier audit and counterfeit part verification is tracked in disconnected spreadsheets?",
  actors: [
    {
      id: "prime-contractor",
      type: NodeType.Organization,
      label: "Prime Contractor",
      parentId: null,
      organizationId: "prime-contractor",
      color: "#22C55E",
    },
    {
      id: "compliance-division",
      type: NodeType.Department,
      label: "Cybersecurity & Compliance",
      description: "Responsible for CMMC Level 2 validation, DFARS 252.204-7012/7019/7020/7021 flow-down adherence, NIST SP 800-171 assessment review, and supplier cybersecurity risk management",
      parentId: "prime-contractor",
      organizationId: "prime-contractor",
      color: "#06B6D4",
    },
    {
      id: "quality-assurance",
      type: NodeType.Department,
      label: "Quality & Provenance",
      description: "Manages AS9100D supplier qualification, counterfeit part avoidance per DFARS 252.246-7007 and SAE AS6171/AS6081, configuration integrity, and component provenance documentation",
      parentId: "prime-contractor",
      organizationId: "prime-contractor",
      color: "#06B6D4",
    },
    {
      id: "compliance-officer",
      type: NodeType.Role,
      label: "Cybersecurity Compliance Manager",
      description: "Validates subcontractor CMMC Level 2 certification status (C3PAO assessment), reviews NIST SP 800-171 self-assessment scores from SPRS, and verifies DFARS flow-down compliance documentation and SAM.gov registration",
      parentId: "compliance-division",
      organizationId: "prime-contractor",
      color: "#94A3B8",
    },
    {
      id: "qa-inspector",
      type: NodeType.Role,
      label: "Quality Engineer",
      description: "Verifies AS9100D certification via OASIS database, validates component provenance documentation, and reviews counterfeit part avoidance controls per SAE AS6171/AS6081 — currently conducting on-site supplier audit at another facility",
      parentId: "quality-assurance",
      organizationId: "prime-contractor",
      color: "#94A3B8",
    },
    {
      id: "qa-manager",
      type: NodeType.Role,
      label: "QA Manager",
      description: "Quality Assurance Manager authorized to perform supplier qualification review when the primary Quality Engineer is conducting on-site audits — maintains quality function integrity per AS9100D Section 7.2",
      parentId: "quality-assurance",
      organizationId: "prime-contractor",
      color: "#94A3B8",
    },
    {
      id: "program-manager",
      type: NodeType.Role,
      label: "Program Manager",
      description: "Oversees integration milestones and grants program-level approval for subcontractor participation — tracks schedule impact of qualification delays on defense system deliverables",
      parentId: "prime-contractor",
      organizationId: "prime-contractor",
      color: "#94A3B8",
    },
    {
      id: "vendor-rep",
      type: NodeType.Vendor,
      label: "Tier-2 Subcontractor",
      description: "Lower-tier supplier providing critical components — must demonstrate CMMC Level 2 compliance, AS9100D certification, and counterfeit part avoidance controls before program participation",
      parentId: null,
      organizationId: "vendor-rep",
      color: "#F59E0B",
    },
  ],
  policies: [
    {
      id: "policy-supply-chain-cert",
      actorId: "prime-contractor",
      threshold: {
        k: 2,
        n: 3,
        approverRoleIds: ["compliance-officer", "qa-inspector", "program-manager"],
      },
      expirySeconds: 172800,
      delegationAllowed: false,
    },
    {
      id: "policy-supply-chain-qa",
      actorId: "quality-assurance",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["qa-inspector"],
      },
      expirySeconds: 86400,
      delegationAllowed: true,
      delegateToRoleId: "qa-manager",
    },
  ],
  edges: [
    { sourceId: "prime-contractor", targetId: "compliance-division", type: "authority" },
    { sourceId: "prime-contractor", targetId: "quality-assurance", type: "authority" },
    { sourceId: "prime-contractor", targetId: "program-manager", type: "authority" },
    { sourceId: "compliance-division", targetId: "compliance-officer", type: "authority" },
    { sourceId: "quality-assurance", targetId: "qa-inspector", type: "authority" },
    { sourceId: "quality-assurance", targetId: "qa-manager", type: "authority" },
    { sourceId: "qa-inspector", targetId: "qa-manager", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Subcontractor CMMC compliance and supplier qualification",
    initiatorRoleId: "vendor-rep",
    targetAction: "CMMC Level 2 Compliance Validation, AS9100D Verification, and Component Provenance Certification",
    description:
      "Tier-2 Subcontractor submits CMMC compliance documentation, DFARS flow-down attestations, AS9100D certification, and component provenance records. Requires 2-of-3 approval from Cybersecurity Compliance Manager, Quality Engineer, and Program Manager. Separate quality and provenance inspection required from Quality Engineer — delegates to QA Manager when QE is at on-site supplier audit. Assumes Contracting Officer has determined contract eligibility and DCMA oversight requirements are addressed separately.",
  },
  beforeMetrics: {
    manualTimeHours: 480,
    riskExposureDays: 60,
    auditGapCount: 8,
    approvalSteps: 12,
  },
  todayFriction: {
    ...ARCHETYPES["regulatory-compliance"].defaultFriction,
    manualSteps: [
      { trigger: "after-request", description: "CMMC compliance documentation, DFARS flow-down attestations, and AS9100D certificates emailed as PDF attachments — Cybersecurity Compliance Manager begins SPRS score review and SAM.gov verification", delaySeconds: 10 },
      { trigger: "before-approval", description: "Quality Engineer manually cross-referencing component serial numbers against provenance spreadsheets, OASIS database for AS9100D status, and GIDEP alerts for specific part numbers", delaySeconds: 8 },
      { trigger: "on-unavailable", description: "Quality Engineer conducting on-site supplier audit at another facility — quality and provenance review queued in shared inbox, no qualified QA personnel available to substitute", delaySeconds: 14 },
    ],
    narrativeTemplate: "Email-based PDF compliance submissions with spreadsheet-tracked provenance and disconnected quality verification systems",
  },
  todayPolicies: [
    {
      id: "policy-supply-chain-cert-today",
      actorId: "prime-contractor",
      threshold: {
        k: 3,
        n: 3,
        approverRoleIds: ["compliance-officer", "qa-inspector", "program-manager"],
      },
      expirySeconds: 30,
      delegationAllowed: false,
    },
    {
      id: "policy-supply-chain-qa-today",
      actorId: "quality-assurance",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["qa-inspector"],
      },
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: REGULATORY_DB.defense,
  tags: ["defense", "dib", "cmmc", "dfars", "nist-800-171", "sprs", "supply-chain", "counterfeit", "provenance", "compliance", "as9100", "gidep", "cage", "sam-gov", "supplier-qualification"],
};
