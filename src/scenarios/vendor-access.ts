import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "./archetypes";

export const vendorAccessScenario: ScenarioTemplate = {
  id: "vendor-access",
  name: "Vendor Access Request",
  description:
    "A vendor must perform scheduled maintenance on a customer's production application infrastructure, requiring controlled cross-organizational access with contractual, security, and audit validation. The TPRM team must verify active NDA, contract scope, security posture, and insurance coverage. Approvals route asynchronously across time zones to a Security Analyst, IT Ops Manager, and Vendor Relationship Manager -- with delegation existing informally but not system-enforced.",
  icon: "Buildings",
  industryId: "saas",
  archetypeId: "cross-org-boundary",
  prompt:
    "What happens when a vendor requests production access during a maintenance window but the Vendor Relationship Manager is traveling and delegation is not system-enforced?",
  actors: [
    {
      id: "vendor-org",
      type: NodeType.Vendor,
      label: "Vendor Corp",
      parentId: null,
      organizationId: "vendor-org",
      color: "#F59E0B",
    },
    {
      id: "customer-org",
      type: NodeType.Organization,
      label: "Acme Technologies",
      parentId: null,
      organizationId: "customer-org",
      color: "#3B82F6",
    },
    {
      id: "customer-security",
      type: NodeType.Department,
      label: "Security / GRC",
      description:
        "Reviews vendor risk posture, least-privilege justification, and risk classification before access grant",
      parentId: "customer-org",
      organizationId: "customer-org",
      color: "#06B6D4",
    },
    {
      id: "customer-it",
      type: NodeType.Department,
      label: "IT Operations",
      description:
        "Validates maintenance scope, time window, and production environment access controls",
      parentId: "customer-org",
      organizationId: "customer-org",
      color: "#06B6D4",
    },
    {
      id: "security-analyst",
      type: NodeType.Role,
      label: "Security Analyst",
      description:
        "GRC team member who reviews vendor access requests -- validates least-privilege scope, risk classification, and vendor security posture (SOC 2 report currency, penetration test results)",
      parentId: "customer-security",
      organizationId: "customer-org",
      color: "#06B6D4",
    },
    {
      id: "it-ops-manager",
      type: NodeType.Role,
      label: "IT Ops Manager",
      description:
        "Validates technical scope -- which systems, what access level (read-only/read-write/admin), connectivity method (VPN, bastion, PRA), and maintenance time window",
      parentId: "customer-it",
      organizationId: "customer-org",
      color: "#06B6D4",
    },
    {
      id: "vendor-rel-manager",
      type: NodeType.Role,
      label: "Vendor Relationship Manager",
      description:
        "Business owner for the vendor contract -- confirms requested work is authorized under the active SOW/maintenance agreement and validates that the vendor's access scope aligns with contractual obligations",
      parentId: "customer-org",
      organizationId: "customer-org",
      color: "#94A3B8",
    },
    {
      id: "vendor-engineer",
      type: NodeType.Role,
      label: "Vendor Engineer",
      description:
        "Requests read-write production access during pre-approved maintenance window via customer's ServiceNow vendor intake portal",
      parentId: "vendor-org",
      organizationId: "vendor-org",
      color: "#F59E0B",
    },
    {
      id: "pam-system",
      type: NodeType.System,
      label: "PAM System",
      description:
        "Privileged Access Management platform -- provisions just-in-time vendor credentials, records sessions, enforces time-bound access, and auto-revokes at session expiry (e.g., CyberArk PAM, BeyondTrust PRA)",
      parentId: "customer-org",
      organizationId: "customer-org",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-vendor-access",
      actorId: "customer-security",
      threshold: {
        k: 2,
        n: 3,
        approverRoleIds: [
          "security-analyst",
          "it-ops-manager",
          "vendor-rel-manager",
        ],
      },
      // 8 hours -- aligned with standard maintenance window plus buffer;
      // SOC 2 CC6.1 least-privilege temporal scoping
      expirySeconds: 28800,
      delegationAllowed: true,
      delegateToRoleId: "it-ops-manager",
      mandatoryApprovers: ["security-analyst"],
      delegationConstraints:
        "Delegation from Vendor Relationship Manager to IT Ops Manager is limited to pre-approved maintenance windows where vendor compliance status has been pre-validated by TPRM",
      escalation: {
        // Escalate to Security Analyst after 4 hours if threshold not met
        afterSeconds: 14400,
        toRoleIds: ["security-analyst"],
      },
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    {
      sourceId: "customer-org",
      targetId: "customer-security",
      type: "authority",
    },
    {
      sourceId: "customer-org",
      targetId: "customer-it",
      type: "authority",
    },
    {
      sourceId: "customer-org",
      targetId: "vendor-rel-manager",
      type: "authority",
    },
    {
      sourceId: "customer-org",
      targetId: "pam-system",
      type: "authority",
    },
    {
      sourceId: "customer-security",
      targetId: "security-analyst",
      type: "authority",
    },
    {
      sourceId: "customer-it",
      targetId: "it-ops-manager",
      type: "authority",
    },
    {
      sourceId: "vendor-org",
      targetId: "vendor-engineer",
      type: "authority",
    },
    {
      sourceId: "vendor-rel-manager",
      targetId: "it-ops-manager",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "Vendor requests production access for scheduled maintenance",
    initiatorRoleId: "vendor-engineer",
    targetAction:
      "Read-Write Access to Production Application Infrastructure During Scheduled Maintenance Window",
    description:
      "Vendor Engineer submits request through ServiceNow vendor intake portal for read-write production access during a pre-approved maintenance window. Requires TPRM compliance validation (NDA, contract, insurance, SOC 2 report), scope review, and 2-of-3 approval from Security Analyst (mandatory), IT Ops Manager, and Vendor Relationship Manager. Access provisioned via PAM with session recording and automatic expiry.",
  },
  beforeMetrics: {
    // Elapsed wall-clock time from request to access grant, including
    // timezone gaps, approver unavailability, and async review cycles;
    // active manual effort is ~6-8 hours
    manualTimeHours: 36,
    riskExposureDays: 3,
    auditGapCount: 5,
    approvalSteps: 7,
  },
  todayFriction: {
    ...ARCHETYPES["cross-org-boundary"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Request submitted through ServiceNow intake portal -- TPRM analyst manually verifying NDA status, contract scope, insurance certificate, and SOC 2 report validity in the TPRM platform",
        // Simulation-compressed; represents 1-2 hours real-world TPRM validation
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        description:
          "Each approver reviewing scope, time window, least-privilege justification, and risk classification asynchronously across time zones -- Security Analyst, IT Ops Manager, and Vendor Relationship Manager each in separate systems",
        // Simulation-compressed; represents 4-8 hours real-world async review
        delaySeconds: 8,
      },
      {
        trigger: "on-unavailable",
        description:
          "Vendor Relationship Manager traveling in different time zone -- delegation exists informally but Security Analyst and IT Ops Manager hesitate to proceed without system-enforced delegation authority",
        // Simulation-compressed; represents 12-24 hours real-world stall
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "ServiceNow intake with manual TPRM compliance validation and asynchronous cross-timezone approvals",
  },
  todayPolicies: [
    {
      id: "policy-vendor-access-today",
      actorId: "customer-security",
      threshold: {
        k: 3,
        n: 3,
        approverRoleIds: [
          "security-analyst",
          "it-ops-manager",
          "vendor-rel-manager",
        ],
      },
      // Simulation-compressed; represents real-world 24-48h practical
      // window constrained by maintenance window deadline
      expirySeconds: 20,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "SOC2",
      displayName: "SOC 2 CC6.1-CC6.3",
      clause: "Logical Access Controls, Registration/Authorization, and Access Removal",
      violationDescription:
        "Vendor production access granted without documented individual approval from authorized personnel, or vendor access not revoked after maintenance window closure",
      fineRange:
        "Qualified or adverse SOC 2 Type II report; customer contract violations (enterprise contracts typically require unqualified SOC 2); competitive disadvantage in enterprise sales",
      severity: "high",
      safeguardDescription:
        "Accumulate enforces multi-party approval with cryptographic signatures from named individuals before vendor access is authorized, with automatic expiry eliminating access revocation gaps",
    },
    {
      framework: "SOC2",
      displayName: "SOC 2 CC9.2",
      clause: "Vendor/Third-Party Risk Management",
      violationDescription:
        "No documented evidence that vendor compliance status (NDA, contract scope, security posture) was verified at the time of access request",
      fineRange:
        "SOC 2 examination finding; remediation required before next audit period",
      severity: "medium",
      safeguardDescription:
        "Accumulate policy engine integrates with TPRM platform to verify vendor compliance status as a precondition for routing the approval request",
    },
    {
      framework: "ISO27001",
      displayName: "ISO 27001:2022 A.5.19",
      clause: "Information Security in Supplier Relationships",
      violationDescription:
        "Supplier access to production systems without documented security requirements, approval by authorized personnel, and time-bound access controls",
      fineRange:
        "Certification nonconformity; major finding requires corrective action before re-certification",
      severity: "high",
      safeguardDescription:
        "Policy-enforced vendor access workflow with mandatory security review, contractual authorization verification, time-bound access, and complete audit trail satisfying A.5.19-A.5.22 control requirements",
    },
    {
      framework: "GDPR",
      displayName: "GDPR Art. 28 / Art. 32",
      clause: "Processor Obligations / Security of Processing",
      violationDescription:
        "Vendor acting as sub-processor accesses personal data without documented authorization, appropriate security measures, or verifiable audit trail",
      fineRange: "Up to 4% annual turnover or EUR 20M",
      severity: "critical",
      safeguardDescription:
        "Complete, immutable documentation of every vendor access authorization decision, with cryptographic proof of who authorized access, when, under what policy, and the exact scope granted -- satisfying Art. 28 processor documentation requirements and Art. 32 security of processing obligations",
    },
  ],
  tags: [
    "vendor",
    "cross-org",
    "production-access",
    "servicenow",
    "vendor-risk",
    "tprm",
    "soc2",
    "iso-27001",
    "pam",
    "maintenance",
  ],
};
