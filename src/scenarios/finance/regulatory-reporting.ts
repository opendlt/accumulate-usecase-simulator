import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const regulatoryReportingScenario: ScenarioTemplate = {
  id: "finance-regulatory-reporting",
  name: "Quarterly SEC Filing Authorization and Audit Trail",
  description:
    "A publicly traded financial institution's quarterly 10-Q filing with the SEC requires SOX Section 302 certifications from both CEO and CFO, Disclosure Committee review, and Controller sign-off. Data sourced from multiple systems requires reconciliation, and manual top-side journal entries during the close process create lineage gaps and version control issues. The review-and-certification phase typically requires 3–5 business days of coordination across the Controller, General Counsel, CFO, and CEO, with SEC staff review and external audit testing focused on internal control effectiveness.",
  icon: "FileText",
  industryId: "finance",
  archetypeId: "regulatory-compliance",
  prompt: "What happens when a quarterly 10-Q filing has data lineage gaps from manual top-side journal entries, requires Disclosure Committee review and CEO/CFO SOX 302 certification, and the 40-day filing deadline is approaching?",
  actors: [
    {
      id: "fin-corp-org",
      type: NodeType.Organization,
      label: "Financial Corp",
      parentId: null,
      organizationId: "fin-corp-org",
      color: "#3B82F6",
    },
    {
      id: "finance-dept",
      type: NodeType.Department,
      label: "Finance & Reporting",
      description:
        "Manages quarterly close process, financial data reconciliation, 10-Q preparation, and SEC filing coordination under the Controller/CAO",
      parentId: "fin-corp-org",
      organizationId: "fin-corp-org",
      color: "#06B6D4",
    },
    {
      id: "ceo",
      type: NodeType.Role,
      label: "CEO",
      description:
        "Principal executive officer; co-certifier under SOX Section 302 (Exhibit 31.1) and Section 906 for quarterly 10-Q filings",
      parentId: "fin-corp-org",
      organizationId: "fin-corp-org",
      color: "#94A3B8",
    },
    {
      id: "cfo",
      type: NodeType.Role,
      label: "CFO",
      description:
        "Principal financial officer; co-certifier under SOX Section 302 (Exhibit 31.2) and Section 906 for quarterly 10-Q filings",
      parentId: "fin-corp-org",
      organizationId: "fin-corp-org",
      color: "#94A3B8",
    },
    {
      id: "general-counsel",
      type: NodeType.Role,
      label: "General Counsel",
      description:
        "Provides legal sufficiency review of disclosure language, litigation contingency disclosures, and legal risk factors as member of the Disclosure Committee",
      parentId: "fin-corp-org",
      organizationId: "fin-corp-org",
      color: "#94A3B8",
    },
    {
      id: "controller",
      type: NodeType.Role,
      label: "Controller / CAO",
      description:
        "Prepares and reconciles financial data, manages the close process, coordinates Disclosure Committee review, and certifies the filing is ready for executive attestation",
      parentId: "finance-dept",
      organizationId: "fin-corp-org",
      color: "#94A3B8",
    },
    {
      id: "sec",
      type: NodeType.Regulator,
      label: "SEC (EDGAR)",
      description:
        "Securities and Exchange Commission; receives 10-Q/10-K filings via EDGAR; Division of Corporation Finance conducts periodic staff review of disclosure adequacy and GAAP compliance",
      parentId: null,
      organizationId: "sec",
      color: "#EF4444",
    },
    {
      id: "filing-platform",
      type: NodeType.System,
      label: "SEC Filing Platform",
      description:
        "Financial reporting platform (e.g., Workiva/Wdesk) that aggregates data from GL, sub-ledgers, and consolidation systems for 10-Q preparation, XBRL tagging, and EDGAR submission",
      parentId: "finance-dept",
      organizationId: "fin-corp-org",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-prefiling-review",
      actorId: "finance-dept",
      threshold: {
        k: 2,
        n: 3,
        approverRoleIds: ["controller", "general-counsel", "cfo"],
      },
      expirySeconds: 172800,
      delegationAllowed: false,
      escalation: {
        afterSeconds: 35,
        toRoleIds: ["controller"],
      },
    },
  ],
  edges: [
    {
      sourceId: "fin-corp-org",
      targetId: "finance-dept",
      type: "authority",
    },
    { sourceId: "fin-corp-org", targetId: "ceo", type: "authority" },
    { sourceId: "fin-corp-org", targetId: "cfo", type: "authority" },
    {
      sourceId: "fin-corp-org",
      targetId: "general-counsel",
      type: "authority",
    },
    {
      sourceId: "finance-dept",
      targetId: "controller",
      type: "authority",
    },
    {
      sourceId: "finance-dept",
      targetId: "filing-platform",
      type: "authority",
    },
  ],
  defaultWorkflow: {
    name: "Quarterly 10-Q SEC Filing with SOX 302 Certification",
    initiatorRoleId: "controller",
    targetAction:
      "Submit Quarterly 10-Q Filing (with SOX 302 Certifications) to SEC via EDGAR",
    description:
      "Controller initiates the quarterly close process and prepares the 10-Q draft from GL, sub-ledger, and consolidation data. Requires Disclosure Committee review (2-of-3 from Controller, General Counsel, and CFO), lineage validation of manual top-side journal entries, and both CEO and CFO SOX 302 certifications before EDGAR submission. Manual adjustments create version control issues and lineage gaps that complicate SEC staff review and external audit testing.",
  },
  beforeMetrics: {
    manualTimeHours: 72,
    riskExposureDays: 14,
    auditGapCount: 8,
    approvalSteps: 10,
  },
  todayFriction: {
    ...ARCHETYPES["regulatory-compliance"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Controller's team completing quarterly close — reconciling sub-ledger data to GL, reviewing top-side journal entries, and resolving intercompany elimination differences before 10-Q draft generation",
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        description:
          "CFO reviewing Disclosure Committee package — variance analysis shows material fluctuations from manual top-side entries that require management explanation and supporting documentation",
        delaySeconds: 6,
      },
      {
        trigger: "on-unavailable",
        description:
          "General Counsel in board meeting — legal sufficiency review of pending litigation disclosures delayed; Controller cannot finalize MD&A legal contingency language until GC provides updated assessment",
        delaySeconds: 10,
      },
    ],
    narrativeTemplate:
      "Multi-system data reconciliation with manual version tracking across filing platform, spreadsheet-based variance analysis, and fragmented sign-off coordination",
  },
  todayPolicies: [
    {
      id: "policy-regulatory-filing-today",
      actorId: "finance-dept",
      threshold: {
        k: 3,
        n: 3,
        approverRoleIds: ["controller", "cfo", "general-counsel"],
      },
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "SOX",
      displayName: "SOX Section 302",
      clause: "CEO/CFO Certification (SEC Rule 13a-14)",
      violationDescription:
        "Filing periodic reports with false or misleading CEO/CFO certifications regarding financial statements and internal controls",
      fineRange:
        "SEC enforcement action, officer bars, disgorgement; under Section 906 (18 USC 1350): up to $5M fine and 20 years imprisonment for willful violations",
      severity: "critical",
      safeguardDescription:
        "Accumulate provides cryptographic proof of each certification decision — who certified, when, what version of the filing was certified, and the complete authority chain — creating an independently verifiable audit trail for SEC staff review and external audit testing under PCAOB AS 2201",
    },
    {
      framework: "SOX",
      displayName: "SOX Section 404",
      clause: "Management Assessment of ICFR",
      violationDescription:
        "Material weakness in internal control over financial reporting (ICFR) related to authorization and review controls over the financial close and reporting process",
      fineRange:
        "Restatement risk, loss of investor confidence, potential SEC enforcement, adverse PCAOB inspection findings",
      severity: "critical",
      safeguardDescription:
        "Accumulate's policy-enforced authorization workflow provides a testable, auditable control that satisfies PCAOB AS 2201 requirements for authorization controls over financial reporting",
    },
  ],
  tags: [
    "regulatory",
    "sec-filing",
    "10-Q",
    "multi-party",
    "sox",
    "section-302",
    "authorization-lineage",
    "icfr",
  ],
};
