import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const vendorComplianceScenario: ScenarioTemplate = {
  id: "finance-vendor-compliance",
  name: "Fintech Vendor Onboarding and Third-Party Risk",
  description:
    "A bank is onboarding a cloud-native fintech vendor classified as a critical activity under the 2023 Interagency Guidance on Third-Party Relationships. The vendor will integrate via API into core banking systems, requiring coordinated due diligence across compliance, IT security, legal, and procurement functions. Reviews are routed through the bank's TPRM platform (e.g., Archer, ServiceNow GRC), but cross-functional progress visibility remains limited, with individual reviewers conducting assessments in separate analytical workflows. The onboarding lifecycle — from business case to production go-live — typically spans 12-24 weeks for critical vendors, with coordination overhead, vendor responsiveness delays, and committee scheduling contributing to timeline extension.",
  icon: "Handshake",
  industryId: "finance",
  archetypeId: "cross-org-boundary",
  prompt: "What happens when a critical fintech vendor onboarding requires coordinated due diligence from compliance, IT security, legal, and procurement with limited cross-functional visibility into review progress and bottlenecks?",
  actors: [
    {
      id: "bank-corp-org",
      type: NodeType.Organization,
      label: "Bank Corp",
      parentId: null,
      organizationId: "bank-corp-org",
      color: "#3B82F6",
    },
    {
      id: "fintech-vendor",
      type: NodeType.Vendor,
      label: "Fintech Vendor",
      description: "Cloud-native fintech provider seeking API integration into core banking systems, classified as a critical activity under the 2023 Interagency Guidance",
      parentId: null,
      organizationId: "fintech-vendor",
      color: "#F59E0B",
    },
    {
      id: "digital-banking",
      type: NodeType.Department,
      label: "Digital Banking",
      description: "Business unit sponsoring the fintech vendor integration for digital banking product capabilities",
      parentId: "bank-corp-org",
      organizationId: "bank-corp-org",
      color: "#06B6D4",
    },
    {
      id: "compliance-dept",
      type: NodeType.Department,
      label: "Compliance",
      description: "Regulatory compliance review for third-party vendor risk including BSA/AML, consumer protection, UDAAP, and licensing verification",
      parentId: "bank-corp-org",
      organizationId: "bank-corp-org",
      color: "#06B6D4",
    },
    {
      id: "it-security",
      type: NodeType.Department,
      label: "IT Security",
      description: "Information security assessment of vendor cloud infrastructure, API security, data protection, and incident response capabilities",
      parentId: "bank-corp-org",
      organizationId: "bank-corp-org",
      color: "#06B6D4",
    },
    {
      id: "legal-dept",
      type: NodeType.Department,
      label: "Legal",
      description: "Technology transactions and commercial contracts review for third-party vendor agreements",
      parentId: "bank-corp-org",
      organizationId: "bank-corp-org",
      color: "#06B6D4",
    },
    {
      id: "procurement",
      type: NodeType.Department,
      label: "Procurement / TPRM",
      description: "Vendor commercial evaluation, TPRM platform administration, and third-party risk program coordination",
      parentId: "bank-corp-org",
      organizationId: "bank-corp-org",
      color: "#06B6D4",
    },
    {
      id: "business-sponsor",
      type: NodeType.Role,
      label: "Business Line Sponsor",
      description: "Digital Banking leader accountable for the vendor relationship: business case justification, budget ownership, ongoing performance monitoring, and committee reporting per the 2023 Interagency Guidance",
      parentId: "digital-banking",
      organizationId: "bank-corp-org",
      color: "#94A3B8",
    },
    {
      id: "compliance-officer",
      type: NodeType.Role,
      label: "Compliance Officer",
      description: "Evaluates vendor regulatory compliance posture including BSA/AML program adequacy, consumer protection and UDAAP risk, state licensing verification, OFAC sanctions screening, and regulatory enforcement history",
      parentId: "compliance-dept",
      organizationId: "bank-corp-org",
      color: "#94A3B8",
    },
    {
      id: "security-assessor",
      type: NodeType.Role,
      label: "IT Security Assessor",
      description: "Lead information security reviewer responsible for SOC 2 Type II evaluation, penetration test review, cloud security architecture assessment, API security controls review, and data protection adequacy — coordinates with security specialists and certifies IT security due diligence completion",
      parentId: "it-security",
      organizationId: "bank-corp-org",
      color: "#94A3B8",
    },
    {
      id: "legal-counsel",
      type: NodeType.Role,
      label: "Legal Counsel",
      description: "Reviews and negotiates vendor contract terms including required regulatory provisions per the Interagency Guidance: right to audit, data protection, subcontractor notification, BCP requirements, indemnification, and termination provisions",
      parentId: "legal-dept",
      organizationId: "bank-corp-org",
      color: "#94A3B8",
    },
    {
      id: "tprm-manager",
      type: NodeType.Role,
      label: "TPRM Program Manager",
      description: "Manages the vendor onboarding workflow, coordinates cross-functional due diligence reviews, maintains vendor risk inventory, and serves as the escalation point for stalled assessments",
      parentId: "procurement",
      organizationId: "bank-corp-org",
      color: "#94A3B8",
    },
    {
      id: "vendor-liaison",
      type: NodeType.Role,
      label: "Vendor Relationship Manager",
      description: "Fintech vendor's primary point of contact responsible for due diligence documentation submission, questionnaire responses, assessment facilitation, and contract negotiation participation",
      parentId: "fintech-vendor",
      organizationId: "fintech-vendor",
      color: "#F59E0B",
    },
  ],
  policies: [
    {
      // Stage 1: Due Diligence Adequacy — 3-of-4 required (Business Sponsor + any 2 of Compliance, IT Security, Legal)
      // IT Security is a mandatory gate for critical vendors regardless of threshold
      id: "policy-due-diligence-adequacy",
      actorId: "bank-corp-org",
      threshold: { k: 3, n: 4, approverRoleIds: ["business-sponsor", "compliance-officer", "security-assessor", "legal-counsel"] },
      mandatoryApprovers: ["security-assessor"], // IT Security cannot be bypassed for critical vendors
      expirySeconds: 1209600, // 14-day authority window
      delegationAllowed: true,
      delegationConstraints: "Delegation permitted only to pre-approved alternates within the same risk function with equivalent subject matter expertise",
      escalation: { afterSeconds: 259200, toRoleIds: ["tprm-manager"] }, // 3-day escalation to TPRM Program Manager
    },
    {
      // Stage 2: Production Go-Live Authorization — All required reviewers must certify
      id: "policy-production-golive",
      actorId: "bank-corp-org",
      threshold: { k: 4, n: 4, approverRoleIds: ["business-sponsor", "compliance-officer", "security-assessor", "tprm-manager"] },
      expirySeconds: 604800, // 7-day window
      delegationAllowed: true,
      delegationConstraints: "Delegation permitted only to pre-approved alternates within the same risk function",
      escalation: { afterSeconds: 259200, toRoleIds: ["tprm-manager"] },
    },
  ],
  edges: [
    { sourceId: "bank-corp-org", targetId: "digital-banking", type: "authority" },
    { sourceId: "bank-corp-org", targetId: "compliance-dept", type: "authority" },
    { sourceId: "bank-corp-org", targetId: "it-security", type: "authority" },
    { sourceId: "bank-corp-org", targetId: "legal-dept", type: "authority" },
    { sourceId: "bank-corp-org", targetId: "procurement", type: "authority" },
    { sourceId: "digital-banking", targetId: "business-sponsor", type: "authority" },
    { sourceId: "compliance-dept", targetId: "compliance-officer", type: "authority" },
    { sourceId: "it-security", targetId: "security-assessor", type: "authority" },
    { sourceId: "legal-dept", targetId: "legal-counsel", type: "authority" },
    { sourceId: "procurement", targetId: "tprm-manager", type: "authority" },
    { sourceId: "fintech-vendor", targetId: "vendor-liaison", type: "authority" },
  ],
  defaultWorkflow: {
    name: "Critical fintech vendor onboarding — due diligence through production go-live",
    initiatorRoleId: "business-sponsor",
    targetAction: "Authorize Critical Fintech Vendor for Production API Integration Following Completed Due Diligence",
    description:
      "Business Line Sponsor initiates onboarding of a cloud-native fintech vendor classified as a critical activity. Parallel due diligence reviews across compliance, IT security, legal, and TPRM with coordinated tracking through the TPRM platform. IT Security assessment is a mandatory gate for critical vendors. Requires multi-stage approval: due diligence adequacy certification (3-of-4 with mandatory IT Security) followed by production go-live authorization (all required reviewers). Accumulate enforces approval policy, tracks authorization status, and provides cryptographic proof of each decision.",
  },
  beforeMetrics: {
    manualTimeHours: 80,       // Active labor hours across all reviewers
    riskExposureDays: 120,     // Calendar days from business case to production go-live
    auditGapCount: 6,
    approvalSteps: 14,         // Full lifecycle stages
  },
  todayFriction: {
    ...ARCHETYPES["cross-org-boundary"].defaultFriction,
    manualSteps: [
      { trigger: "after-request", description: "Vendor due diligence documentation collected via TPRM platform (Archer) and routed to compliance, IT security, legal, and TPRM for parallel review — but each function conducts analysis in separate tools with no unified progress view", delaySeconds: 10 },
      { trigger: "before-approval", description: "IT Security Assessor reviewing vendor SOC 2 Type II report in TPRM platform and penetration test executive summary in secure document exchange — analysis conducted across multiple systems with no integrated risk dashboard", delaySeconds: 8 },
      { trigger: "on-unavailable", description: "IT Security Assessor at offsite conference — no pre-approved delegate in the TPRM platform, review queue stalled with overall onboarding status opaque to other functions and the Business Line Sponsor", delaySeconds: 12 },
    ],
    narrativeTemplate: "Parallel TPRM platform reviews with limited cross-functional progress visibility and no automated escalation for stalled assessments",
  },
  todayPolicies: [
    {
      id: "policy-vendor-onboarding-today",
      actorId: "bank-corp-org",
      threshold: { k: 4, n: 4, approverRoleIds: ["business-sponsor", "compliance-officer", "security-assessor", "tprm-manager"] },
      expirySeconds: 25, // Simulation parameter — not representative of actual process timing
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "OCC-2023-17",
      displayName: "OCC Bulletin 2023-17 / 2023 Interagency Guidance",
      clause: "Third-Party Relationships: Risk Management Guidance — Due Diligence and Ongoing Monitoring for Critical Activities",
      violationDescription: "Failure to conduct comprehensive due diligence for a critical third-party relationship, including granting production system access without completed information security assessment, and inadequate ongoing monitoring of vendor performance and risk",
      fineRange: "MRA/MRIA examination findings; informal enforcement actions (board resolutions, commitment letters); formal enforcement actions (consent orders $1M-$75M+, cease-and-desist orders); individual actions against directors and officers for pattern failures",
      severity: "critical",
      safeguardDescription: "Accumulate enforces mandatory review gates (IT Security assessment required before production authorization for critical vendors), provides cryptographic proof of each due diligence certification and approval decision, and creates an independently verifiable audit trail for OCC/FDIC examination readiness",
    },
    {
      framework: "FFIEC-IT",
      displayName: "FFIEC IT Handbook — Outsourcing Technology Services",
      clause: "Information Security Assessment and Ongoing Monitoring of Technology Service Providers",
      violationDescription: "Inadequate evaluation of third-party technology provider's information security controls, incident response capabilities, and business continuity preparedness prior to granting system access; failure to establish ongoing monitoring and periodic reassessment program",
      fineRange: "IT examination findings; MRA/MRIA; referral to safety and soundness examination for systemic deficiencies",
      severity: "critical",
      safeguardDescription: "Accumulate provides cryptographic hash verification of due diligence documentation at time of each approval decision, ensuring examiners can independently verify that specific security assessment documentation existed and was reviewed before production access was authorized",
    },
  ],
  tags: ["vendor", "onboarding", "cross-org", "compliance", "fintech", "third-party-risk", "cloud-native", "critical-activity", "tprm", "interagency-guidance"],
};
