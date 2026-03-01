import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "./archetypes";

export const treasuryTransferScenario: ScenarioTemplate = {
  id: "treasury-transfer",
  name: "Treasury Payment Authorization and Control",
  description:
    "Global Corp's Corporate Treasury must authorize a $500,000 critical vendor disbursement before the Fedwire cutoff on the last business day of the month. The payment requires dual-authorization (maker-checker) under the company's SOX key controls. The Treasurer, who is the designated checker, is traveling internationally and unreachable. The TMS-configured backup approver (Assistant Treasurer) has an expired bank portal security token. The Treasury Analyst must navigate backup authorization logistics while the payment cutoff clock ticks.",
  icon: "CurrencyCircleDollar",
  actors: [
    {
      id: "corp-org",
      type: NodeType.Organization,
      label: "Global Corp",
      parentId: null,
      organizationId: "corp-org",
      color: "#3B82F6",
    },
    {
      id: "treasury",
      type: NodeType.Department,
      label: "Corporate Treasury",
      description:
        "Manages cash position, payment authorization, bank connectivity, and liquidity for the organization",
      parentId: "corp-org",
      organizationId: "corp-org",
      color: "#06B6D4",
    },
    {
      id: "treasurer",
      type: NodeType.Role,
      label: "Treasurer",
      description:
        "Primary payment authorizer (checker) for high-value disbursements per the corporate authorization matrix — currently traveling internationally with limited connectivity",
      parentId: "treasury",
      organizationId: "corp-org",
      color: "#94A3B8",
    },
    {
      id: "asst-treasurer",
      type: NodeType.Role,
      label: "Assistant Treasurer",
      description:
        "Backup payment authorizer (alternate checker) — bank portal security token expired, requires IT reactivation",
      parentId: "treasury",
      organizationId: "corp-org",
      color: "#94A3B8",
    },
    {
      id: "treasury-analyst",
      type: NodeType.Role,
      label: "Treasury Analyst",
      description:
        "Prepares payment instructions, verifies cash position, and submits payments for authorization in the TMS (maker role)",
      parentId: "treasury",
      organizationId: "corp-org",
      color: "#94A3B8",
    },
    {
      id: "cfo",
      type: NodeType.Role,
      label: "CFO",
      description:
        "Escalation authority for payment exceptions exceeding the Treasurer's authorization limit or when both Treasury-level approvers are unavailable",
      parentId: "corp-org",
      organizationId: "corp-org",
      color: "#94A3B8",
    },
    {
      id: "treasury-sys",
      type: NodeType.System,
      label: "Treasury Management System",
      description:
        "Receives payment instructions from ERP/AP, validates against controls (duplicate detection, amount limits, OFAC screening), and routes for dual-authorization",
      parentId: "treasury",
      organizationId: "corp-org",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-treasury",
      actorId: "treasury",
      // Checker authorization: 1-of-2 authorized checkers (Treasurer or Assistant Treasurer)
      // The maker (Treasury Analyst) is the initiator and cannot also be a checker — segregation of duties
      threshold: {
        k: 1,
        n: 2,
        approverRoleIds: ["treasurer", "asst-treasurer"],
      },
      // 12-hour authority window — real-world: covers the business day plus buffer
      expirySeconds: 43200,
      delegationAllowed: true,
      delegateToRoleId: "asst-treasurer",
      delegationConstraints:
        "Delegation pre-configured in TMS authorization matrix; backup approver must have active bank portal credentials",
      // Escalation to CFO if both Treasury-level approvers are unavailable
      // 45 simulation seconds ~ 45 minutes real-world before CFO escalation
      escalation: { afterSeconds: 45, toRoleIds: ["cfo"] },
      constraints: { amountMax: 1000000 },
    },
  ],
  edges: [
    { sourceId: "corp-org", targetId: "treasury", type: "authority" },
    { sourceId: "corp-org", targetId: "cfo", type: "authority" },
    { sourceId: "treasury", targetId: "treasurer", type: "authority" },
    { sourceId: "treasury", targetId: "asst-treasurer", type: "authority" },
    { sourceId: "treasury", targetId: "treasury-analyst", type: "authority" },
    { sourceId: "treasury", targetId: "treasury-sys", type: "authority" },
    // Delegation edge: Treasurer can delegate to Assistant Treasurer
    { sourceId: "treasurer", targetId: "asst-treasurer", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Dual-authorization vendor disbursement during month-end close",
    initiatorRoleId: "treasury-analyst",
    targetAction:
      "Authorize $500,000 Vendor Disbursement via Fedwire Before 6:00 PM ET Cutoff",
    description:
      "Treasury Analyst submits a $500,000 critical vendor payment for dual-authorization. The TMS routes the payment to the designated checker (Treasurer or Assistant Treasurer) per the authorization matrix. Payment must clear the Fedwire cutoff at 6:00 PM ET on the last business day of the month.",
  },
  beforeMetrics: {
    // 4 hours elapsed time (including 1-2 hours active effort, rest is waiting for approver availability)
    manualTimeHours: 4,
    // 2 days: miss Friday month-end cutoff -> payment executes Monday (next month)
    riskExposureDays: 2,
    // 4 authorization-related gaps: (1) no cryptographic proof of approver identity,
    // (2) authorization matrix not system-enforced, (3) no automated segregation-of-duties check,
    // (4) delegation not auditable
    auditGapCount: 4,
    // 5 steps: cash position check, maker submission, checker notification, checker review, checker authorization
    approvalSteps: 5,
  },
  industryId: "finance",
  archetypeId: "multi-party-approval",
  prompt:
    "What happens when a $500K critical vendor disbursement requires dual-authorization but the Treasurer is traveling internationally and the backup approver's bank portal token has expired — with the Fedwire cutoff approaching on month-end?",
  todayFriction: {
    ...ARCHETYPES["multi-party-approval"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        // Real-world: 15-30 minutes for cash position verification
        description:
          "Payment instruction received in TMS from AP/ERP — Treasury Analyst verifying cash position in disbursement account and confirming funds availability",
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        // Real-world: 10-20 minutes for OFAC screening and TMS validation
        description:
          "TMS validation rules checking payment against OFAC/SDN list, duplicate detection, and vendor bank detail verification — new vendor details require callback confirmation per fraud prevention policy",
        delaySeconds: 6,
      },
      {
        trigger: "on-unavailable",
        // Real-world: 1-3 hours for backup approver access restoration
        description:
          "Treasurer traveling internationally and unreachable — TMS routes to backup approver (Assistant Treasurer) but bank portal security token has expired; IT service desk ticket required for reactivation",
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Cash position verification with TMS-based dual-authorization delayed by approver unavailability and backup approver access issues",
  },
  todayPolicies: [
    {
      id: "policy-treasury-today",
      actorId: "treasury",
      // Today's state: only the Treasurer can authorize (no system-configured backup routing)
      // This represents a common control weakness — single point of failure in the authorization chain
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["treasurer"],
      },
      // Short session window — real-world: TMS sessions timeout quickly for security
      expirySeconds: 30,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "SOX",
      displayName: "SOX Section 404",
      clause: "Internal Controls over Financial Reporting (ICFR)",
      violationDescription:
        "Material weakness in ICFR if payment authorization controls (segregation of duties, dual control, amount limits) are deficient, enabling unauthorized disbursements that materially affect financial statements",
      fineRange:
        "Personal CEO/CFO certification liability under SOX 302; criminal penalties up to $5M fine and 20 years imprisonment for willful certification of deficient controls",
      severity: "critical",
      safeguardDescription:
        "Accumulate provides cryptographic proof of every authorization decision — who approved, when, under what policy, and that the approver was authorized in the matrix — supporting ICFR documentation and SOX 404 audit evidence requirements",
    },
    {
      framework: "OFAC",
      displayName: "OFAC Sanctions Compliance (31 CFR Part 501)",
      clause: "Specially Designated Nationals and Blocked Persons List (SDN)",
      violationDescription:
        "Failure to screen outgoing payments against OFAC SDN list; strict liability for transactions with sanctioned parties regardless of knowledge",
      fineRange:
        "Up to $356,579 per violation (civil, adjusted annually for inflation); up to $20M and 30 years imprisonment per willful violation under IEEPA",
      severity: "critical",
      safeguardDescription:
        "Accumulate's authorization workflow integrates with TMS sanctions screening, ensuring payment authorization is contingent on completed OFAC screening with cryptographic proof of screening completion",
    },
    {
      framework: "UCC",
      displayName: "UCC Article 4A",
      clause: "Funds Transfers — Security Procedures (§4A-201, §4A-202)",
      violationDescription:
        "Failure to comply with agreed security procedures for payment orders may shift liability for unauthorized transfers from the bank to the originator",
      fineRange:
        "Liability for the full amount of unauthorized payment orders if the bank proves it followed the agreed security procedure and the originator did not",
      severity: "high",
      safeguardDescription:
        "Accumulate's cryptographic authorization chain provides verifiable evidence of the security procedure applied to each payment order, supporting the originator's compliance with agreed bank security procedures",
    },
  ],
  tags: [
    "treasury",
    "dual-authorization",
    "maker-checker",
    "high-value",
    "sox",
    "payment-controls",
    "month-end",
    "fedwire-cutoff",
  ],
};
