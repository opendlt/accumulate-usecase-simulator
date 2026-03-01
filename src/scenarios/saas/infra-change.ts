import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const infraChangeScenario: ScenarioTemplate = {
  id: "saas-infra-change",
  name: "Cross-Team Infrastructure Change",
  description:
    "A Kubernetes upgrade impacting all production workloads requires coordinated sign-off from Platform, Security, and SRE leads. The Platform Lead initiates the change via a Terraform plan but does not self-approve (segregation of duties). Security Lead and SRE Lead must both sign off before the IaC platform executes the apply. When the Security Lead is unavailable -- typically during active incident response or PTO -- the upgrade is delayed for days while known CVEs persist in production. The change backlog grows, inter-team friction increases, and the fleet drifts further from the patched version. Delegation to a Senior Security Engineer exists informally via Slack but is not system-enforced, creating audit gaps in the change authorization chain.",
  icon: "Cloud",
  industryId: "saas",
  archetypeId: "multi-party-approval",
  prompt:
    "What happens when a fleet-wide Kubernetes upgrade is delayed for days because the Security Lead is in active incident response and the change management system has no system-enforced delegation to a Senior Security Engineer -- while known CVEs persist in production and the change backlog grows?",
  actors: [
    {
      id: "cloud-co",
      type: NodeType.Organization,
      label: "Cloud Co",
      parentId: null,
      organizationId: "cloud-co",
      color: "#8B5CF6",
    },
    {
      id: "platform-team",
      type: NodeType.Department,
      label: "Platform Team",
      description:
        "Owns the Kubernetes fleet, IaC/Terraform configuration, and cluster lifecycle management -- initiates and executes infrastructure changes but does not self-approve (segregation of duties per SOC 2 CC6.1)",
      parentId: "cloud-co",
      organizationId: "cloud-co",
      color: "#06B6D4",
    },
    {
      id: "security-team",
      type: NodeType.Department,
      label: "Security Team",
      description:
        "Reviews security impact of infrastructure changes -- CVE remediation scope, RBAC changes, network policy changes, admission controller compatibility, and API deprecations affecting security tooling. Security Lead is the primary bottleneck in the approval workflow.",
      parentId: "cloud-co",
      organizationId: "cloud-co",
      color: "#06B6D4",
    },
    {
      id: "sre-team",
      type: NodeType.Department,
      label: "SRE Team",
      description:
        "Validates operational readiness for production infrastructure changes -- rollback plan, monitoring coverage, pod disruption budget impact, on-call coverage for the change window, and blast-radius containment strategy (canary upgrade sequence)",
      parentId: "cloud-co",
      organizationId: "cloud-co",
      color: "#06B6D4",
    },
    {
      id: "platform-lead",
      type: NodeType.Role,
      label: "Platform Lead",
      description:
        "Initiates Kubernetes upgrade by generating the Terraform plan, coordinating the upgrade sequence (canary cluster first, then production clusters by region), and posting the change request. Does not self-approve -- segregation of duties requires independent Security and SRE sign-off.",
      parentId: "platform-team",
      organizationId: "cloud-co",
      color: "#94A3B8",
    },
    {
      id: "security-lead",
      type: NodeType.Role,
      label: "Security Lead",
      description:
        "Required approver for infrastructure changes -- reviews CVE remediation scope, RBAC impact, network policy changes, admission controller compatibility, and API deprecation impact on security tooling. Primary bottleneck: unavailability during incident response or PTO delays changes for days while known vulnerabilities persist. Can delegate standard infrastructure change reviews to Senior Security Engineer.",
      parentId: "security-team",
      organizationId: "cloud-co",
      color: "#94A3B8",
    },
    {
      id: "senior-security-eng",
      type: NodeType.Role,
      label: "Senior Security Engineer",
      description:
        "Designated delegate for Security Lead on standard infrastructure change reviews -- pre-authorized to approve Kubernetes patch upgrades, node pool scaling, and routine Terraform module updates. High-risk changes (Kubernetes minor version upgrades, RBAC reconfiguration, network policy changes) require Security Lead or CISO.",
      parentId: "security-team",
      organizationId: "cloud-co",
      color: "#94A3B8",
    },
    {
      id: "sre-lead",
      type: NodeType.Role,
      label: "SRE Lead",
      description:
        "Mandatory approver for production infrastructure changes -- validates operational readiness: rollback plan tested, monitoring and alerting configured, runbook updated, change window avoids peak traffic, on-call coverage confirmed, pod disruption budgets will not stall the upgrade. SRE approval is non-delegable for fleet-wide changes.",
      parentId: "sre-team",
      organizationId: "cloud-co",
      color: "#94A3B8",
    },
    {
      id: "ciso",
      type: NodeType.Role,
      label: "CISO",
      description:
        "Escalation authority when both Security Lead and Senior Security Engineer are unavailable -- authorized to approve infrastructure changes and mandate post-change security review. Also the direct approver for high-risk changes that exceed the Senior Security Engineer's delegation scope.",
      parentId: "security-team",
      organizationId: "cloud-co",
      color: "#94A3B8",
    },
    {
      id: "infra-system",
      type: NodeType.System,
      label: "IaC / Terraform",
      description:
        "Infrastructure-as-Code platform (e.g., Terraform Cloud, Spacelift, Atlantis) -- generates Terraform plans for Kubernetes cluster configuration changes, manages Terraform state, enforces policy-as-code validation (Sentinel/OPA) on plans, gates terraform apply on multi-party approval, and executes the approved change against the Kubernetes fleet. Currently, the approval gate is manual (Slack-based review of Terraform plan output) with no system-enforced link between the plan review and the apply execution.",
      parentId: "platform-team",
      organizationId: "cloud-co",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-infra-change",
      // Policy attached to infra-system -- the IaC/Terraform platform is the
      // technical control point that gates `terraform apply` on multi-party
      // approval. This is analogous to the CI/CD pipeline in prod-release.
      actorId: "infra-system",
      threshold: {
        k: 2,
        n: 2,
        approverRoleIds: ["security-lead", "sre-lead"],
      },
      // 12 hours -- accommodates cross-timezone Security and SRE review,
      // change window scheduling, and business-hours-only deployment policies.
      // Shorter than 24 hours because approved Terraform plans can drift if
      // not applied promptly (state lock conflicts, infrastructure drift).
      // SOC 2 CC8.1 requires timely implementation after approval.
      expirySeconds: 43200,
      delegationAllowed: true,
      delegateToRoleId: "senior-security-eng",
      // SRE Lead is mandatory because operational readiness validation
      // (rollback plan, monitoring, PDB impact, on-call coverage) requires
      // direct SRE domain expertise and cannot be delegated to a Security
      // Engineer. Security review can be delegated to the Senior Security
      // Engineer for standard changes.
      mandatoryApprovers: ["sre-lead"],
      delegationConstraints:
        "Senior Security Engineer may approve standard infrastructure changes (Kubernetes patch upgrades within the same minor version, node pool scaling, routine Terraform module updates). High-risk changes (Kubernetes minor version upgrades, RBAC reconfiguration, network policy changes, CNI/service mesh upgrades, admission controller updates) require Security Lead or CISO approval.",
      escalation: {
        // Simulation-compressed: represents 8-hour real-world escalation SLA
        // before CISO is auto-notified when both Security Lead and Senior
        // Security Engineer have not responded. 8 hours allows for timezone
        // gaps and meeting schedules before escalating to executive level.
        afterSeconds: 25,
        toRoleIds: ["ciso"],
      },
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    { sourceId: "cloud-co", targetId: "platform-team", type: "authority" },
    { sourceId: "cloud-co", targetId: "security-team", type: "authority" },
    { sourceId: "cloud-co", targetId: "sre-team", type: "authority" },
    { sourceId: "platform-team", targetId: "platform-lead", type: "authority" },
    { sourceId: "platform-team", targetId: "infra-system", type: "authority" },
    { sourceId: "security-team", targetId: "security-lead", type: "authority" },
    {
      sourceId: "security-team",
      targetId: "senior-security-eng",
      type: "authority",
    },
    { sourceId: "security-team", targetId: "ciso", type: "authority" },
    { sourceId: "sre-team", targetId: "sre-lead", type: "authority" },
    // Delegation: Security Lead -> Senior Security Engineer for standard
    // infrastructure change reviews
    {
      sourceId: "security-lead",
      targetId: "senior-security-eng",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "Fleet-wide Kubernetes upgrade with cross-team approval and Terraform plan review",
    initiatorRoleId: "platform-lead",
    targetAction:
      "Deploy Kubernetes Cluster Upgrade Across Production Fleet via Terraform Apply",
    description:
      "Platform Lead generates a Terraform plan for the Kubernetes fleet upgrade (control plane + node pools), posts the change request with the plan output, CVE remediation scope, and canary upgrade sequence. Requires 2-of-2 approval from Security Lead (or Senior Security Engineer delegate) and SRE Lead (mandatory, non-delegable) before the IaC platform executes terraform apply. SRE Lead validates operational readiness (rollback plan, monitoring, PDB impact, on-call coverage). Security Lead reviews CVE remediation scope, RBAC impact, and admission controller compatibility. Platform Lead initiates but does not self-approve (SOC 2 CC6.1 segregation of duties). Auto-escalation to CISO after 8 hours (25 seconds simulation-compressed) if Security review is not completed.",
  },
  beforeMetrics: {
    // ~10 hours active manual effort across the approval lifecycle:
    //   - Terraform plan preparation, review, and posting: 2-3 hours
    //   - SRE readiness review (rollback plan, PDB analysis, monitoring): 2-3 hours
    //   - Security review when Lead becomes available (CVE scope, RBAC, admission controllers): 2-4 hours
    //   - Coordination, change window scheduling, and final sign-off: 1-2 hours
    // Note: wall-clock elapsed time is 48-72 hours due to Security Lead
    // unavailability during incident response. The manualTimeHours metric
    // captures active effort, not wall-clock waiting.
    manualTimeHours: 10,
    // 3 days of CVE exposure from delayed Kubernetes upgrade:
    //   - Security Lead in active incident response for 48-72 hours
    //   - Plus 24 hours for change window scheduling after approval obtained
    // The fleet runs on a Kubernetes version with known CVEs during this
    // entire period. Compensating controls (network policies, WAF, admission
    // controllers) reduce but do not eliminate the risk.
    riskExposureDays: 3,
    // 4 audit gaps in the current Slack-based change approval workflow:
    // (1) Slack-based change approval not linked to the Terraform plan hash
    //     or apply event -- auditor cannot verify that the approved plan
    //     matches the executed change (SOC 2 CC8.1 gap)
    // (2) No change risk classification in the approval record -- auditor
    //     cannot verify that the approval model matched the risk level of
    //     the change (ITIL Change Enablement gap)
    // (3) No Security review evidence linked to the specific Terraform plan
    //     -- the Security review happened in Slack but is not correlated to
    //     the plan hash being applied (SOC 2 CC8.1 / CC7.1 gap)
    // (4) No rollback verification evidence -- no proof that the rollback
    //     plan was reviewed and validated before the change was approved
    //     (SOC 2 CC8.1 testing gap)
    auditGapCount: 4,
    // 6 manual steps in the approval workflow:
    // (1) Platform Lead generates Terraform plan and posts in #infra-approvals Slack channel
    // (2) SRE Lead reviews Terraform plan output and cross-checks against runbook wiki
    // (3) SRE Lead validates operational readiness (rollback, monitoring, PDB, on-call)
    // (4) Security Lead reviews CVE scope, RBAC changes, admission controller compatibility
    // (5) Security Lead approves in Slack (or stalls if unavailable)
    // (6) Platform Lead manually triggers terraform apply after collecting Slack approvals
    approvalSteps: 6,
  },
  todayFriction: {
    ...ARCHETYPES["multi-party-approval"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Change request posted in #infra-approvals Slack channel with Terraform plan output pasted as a code block -- no system-enforced link between the Slack post and the Terraform plan hash or the eventual apply event. Known CVEs persist in production while review is pending.",
        // Simulation-compressed: represents 1-2 hours real-world time for
        // Terraform plan generation, Slack post, and initial review routing
        delaySeconds: 6,
      },
      {
        trigger: "before-approval",
        description:
          "SRE Lead reviewing Terraform plan output and cross-checking against runbook wiki, monitoring dashboards (Datadog/Grafana), and PDB configurations -- context-switching across 4+ separate tools. Security Lead must independently evaluate CVE remediation scope, RBAC impact, and admission controller compatibility -- but both reviews happen in parallel only if both leads are available.",
        // Simulation-compressed: represents 4-6 hours real-world time for
        // parallel SRE and Security review across multiple tools
        delaySeconds: 5,
      },
      {
        trigger: "on-unavailable",
        description:
          "Security Lead in active incident response -- Slack status set to DND, PagerDuty override not configured for change review routing. No system-enforced delegation to Senior Security Engineer. Platform Lead and SRE Lead wait 2-3 days while known vulnerabilities persist in production and the change backlog grows. Inter-team friction increases as SRE has already approved but cannot proceed.",
        // Simulation-compressed: represents 48-72 hours real-world stall
        // waiting for Security Lead availability during incident response
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Slack-based Terraform plan review with multi-day delays while known CVEs persist -- Security Lead unavailability creates approval bottleneck with no system-enforced delegation",
  },
  todayPolicies: [
    {
      id: "policy-infra-change-today",
      actorId: "infra-system",
      threshold: {
        k: 2,
        n: 2,
        approverRoleIds: ["security-lead", "sre-lead"],
      },
      // Simulation-compressed: represents the real-world practical window of
      // 48-72 hours during which the change request remains actionable before
      // the Terraform plan drifts and must be regenerated, or the change
      // backlog grows unacceptable. In practice, the approval stalls for the
      // duration of the Security Lead's incident response (24-72 hours).
      expirySeconds: 30,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "SOC2",
      displayName: "SOC 2 CC8.1",
      clause: "Change Management",
      violationDescription:
        "Infrastructure change deployed without documented authorization from designated approvers -- Slack-based approvals not linked to the Terraform plan hash or apply event, no evidence that security impact analysis was completed before the change was applied, and no segregation-of-duties enforcement between the change initiator and approvers",
      fineRange:
        "Qualified or adverse SOC 2 Type II report; customer contract violations (enterprise contracts typically require unqualified SOC 2); competitive disadvantage in enterprise sales cycles",
      severity: "high",
      safeguardDescription:
        "Accumulate enforces 2-of-2 approval from Security Lead (or pre-registered delegate) and SRE Lead (mandatory) with cryptographic proof linking the authorization to the specific Terraform plan hash, CVE remediation scope, and apply event -- satisfying CC8.1 evidence requirements for change authorization, testing, and implementation",
    },
    {
      framework: "SOC2",
      displayName: "SOC 2 CC7.1",
      clause: "Security Configuration Management",
      violationDescription:
        "Delayed Kubernetes upgrade results in production fleet running on a version with known CVEs for 3+ days -- detection and monitoring procedures did not identify and remediate the configuration vulnerability in a timely manner because the change approval process created a multi-day bottleneck",
      fineRange:
        "SOC 2 examination finding under CC7.1; remediation required before next audit period; if CVE is exploited during the delay, potential for qualified report and customer notification obligations",
      severity: "high",
      safeguardDescription:
        "Delegation and escalation policies ensure infrastructure changes remediating known CVEs are not blocked by single-approver unavailability -- Senior Security Engineer delegate or CISO escalation ensures timely change authorization",
    },
    {
      framework: "ISO27001",
      displayName: "ISO 27001:2022 A.8.32",
      clause: "Change Management",
      violationDescription:
        "Infrastructure changes to Kubernetes cluster configuration deployed without authorized change request, documented multi-party approval, verified testing, and rollback validation -- change management process relies on informal Slack approvals with no system-enforced controls",
      fineRange:
        "Certification nonconformity; major finding requires corrective action before re-certification",
      severity: "high",
      safeguardDescription:
        "Policy-enforced infrastructure change workflow with mandatory SRE operational readiness review, Security impact analysis (or delegated review), Terraform plan hash linking, and complete audit trail satisfying A.8.32 change management control requirements",
    },
    {
      framework: "NIST",
      displayName: "NIST SP 800-53 CM-3",
      clause: "Configuration Change Control",
      violationDescription:
        "Configuration-controlled changes to the Kubernetes fleet deployed without documented multi-party approval, explicit security impact analysis, or verifiable link between the approved configuration change and the implemented change",
      fineRange:
        "FedRAMP authorization jeopardy for cloud service providers; contractual penalties for federal customers; NIST compliance finding in third-party assessment",
      severity: "high",
      safeguardDescription:
        "Every infrastructure change authorization is cryptographically signed with approver identity, timestamp, Terraform plan hash, and security impact assessment -- satisfying CM-3 configuration change control documentation requirements",
    },
    {
      framework: "NIST",
      displayName: "NIST SP 800-53 SI-2",
      clause: "Flaw Remediation",
      violationDescription:
        "Known Kubernetes CVEs remain unpatched in production for 3+ days because the change approval process lacks delegation and escalation -- the organization does not correct information system flaws in a timely manner when the primary security approver is unavailable",
      fineRange:
        "NIST compliance finding; if the unpatched CVE is exploited, potential for FedRAMP incident reporting and authorization review",
      severity: "high",
      safeguardDescription:
        "Delegation to Senior Security Engineer and auto-escalation to CISO ensure that CVE-remediating infrastructure changes are not blocked by single-approver unavailability -- satisfying SI-2 timeliness requirements for flaw remediation",
    },
  ],
  tags: [
    "infrastructure",
    "multi-party",
    "cross-team",
    "kubernetes",
    "vulnerability",
    "change-backlog",
    "terraform",
    "change-management",
    "soc2-cc8",
    "delegation",
    "fleet-upgrade",
    "cve-remediation",
  ],
};
