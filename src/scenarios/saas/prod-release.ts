import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const prodReleaseScenario: ScenarioTemplate = {
  id: "saas-prod-release",
  name: "Production Release Approval",
  description:
    "A deployment requires controlled sign-off from QA Lead and Engineering Manager before the CI/CD pipeline can proceed to production. QA Lead manually verifies test results, staging environment health, and monitoring dashboards across separate systems before approving. Approvals are coordinated via Slack channel posts and Jira ticket updates with no system-enforced link between the approval decision and the release artifact (container image SHA, Git commit hash, or build artifact signature). When the QA Lead is unavailable, releases are delayed to the next deployment cycle -- there is no system-enforced delegation to a Senior QA Engineer, and informal escalation via Slack DMs creates unauditable authorization gaps.",
  icon: "Cloud",
  industryId: "saas",
  archetypeId: "threshold-escalation",
  prompt:
    "What happens when a production release is delayed because QA is manually verifying staging in separate tools and approvals are fragmented across Slack and Jira with no link between the approval record and the deployment artifact?",
  actors: [
    {
      id: "saas-co",
      type: NodeType.Organization,
      label: "SaaS Co",
      parentId: null,
      organizationId: "saas-co",
      color: "#8B5CF6",
    },
    {
      id: "engineering",
      type: NodeType.Department,
      label: "Engineering",
      description:
        "Owns application development, CI/CD pipeline, and production deployment process",
      parentId: "saas-co",
      organizationId: "saas-co",
      color: "#06B6D4",
    },
    {
      id: "qa-team",
      type: NodeType.Department,
      label: "QA Team",
      description:
        "Owns quality assurance, test automation, staging verification, and release readiness validation",
      parentId: "saas-co",
      organizationId: "saas-co",
      color: "#06B6D4",
    },
    {
      id: "qa-lead",
      type: NodeType.Role,
      label: "QA Lead",
      description:
        "Required release approver -- verifies automated test suite results, staging environment health, and monitoring dashboards before signing off on production deployment readiness; can delegate to Senior QA Engineer for standard releases",
      parentId: "qa-team",
      organizationId: "saas-co",
      color: "#94A3B8",
    },
    {
      id: "senior-qa",
      type: NodeType.Role,
      label: "Senior QA Engineer",
      description:
        "Designated delegate for QA Lead on release approvals -- verifies automated test results, staging health, and monitoring dashboards when QA Lead is unavailable",
      parentId: "qa-team",
      organizationId: "saas-co",
      color: "#94A3B8",
    },
    {
      id: "eng-manager",
      type: NodeType.Role,
      label: "Engineering Manager",
      description:
        "Required release approver -- reviews release scope, confirms changelog matches planned changes, verifies deployment timing (no conflicts, no freeze window), and signs off on production deployment readiness",
      parentId: "engineering",
      organizationId: "saas-co",
      color: "#94A3B8",
    },
    {
      id: "release-engineer",
      type: NodeType.Role,
      label: "Release Engineer",
      description:
        "Initiates the release request and coordinates the approval workflow -- owns the CI/CD pipeline, manages deployment timing, and triggers the production deployment after approval threshold is met",
      parentId: "engineering",
      organizationId: "saas-co",
      color: "#94A3B8",
    },
    {
      id: "cicd-system",
      type: NodeType.System,
      label: "CI/CD Pipeline",
      description:
        "Build and deployment system (e.g., GitHub Actions, GitLab CI, Argo CD) -- runs automated test suites, builds release artifacts, deploys to staging, and gates production deployment on approval policy; currently no system-enforced link between approval records and release artifacts",
      parentId: "engineering",
      organizationId: "saas-co",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-prod-release",
      // Policy attached to CI/CD system -- the deployment pipeline is the
      // technical control point that enforces the approval gate before
      // production deployment
      actorId: "cicd-system",
      threshold: {
        k: 2,
        n: 2,
        approverRoleIds: ["qa-lead", "eng-manager"],
      },
      // 12 hours -- accommodates deployment windows, timezone gaps between
      // QA and Engineering, and business-hours-only deployment policies;
      // SOC 2 CC8.1 requires timely implementation after approval
      expirySeconds: 43200,
      delegationAllowed: true,
      delegateToRoleId: "senior-qa",
      delegationConstraints:
        "QA Lead delegates to Senior QA Engineer for standard release approvals when automated test suite and staging verification have passed CI pipeline gates",
      escalation: {
        // Simulation-compressed: represents 4-hour escalation SLA before
        // Senior QA Engineer is auto-notified if QA Lead has not responded
        afterSeconds: 25,
        toRoleIds: ["senior-qa"],
      },
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    { sourceId: "saas-co", targetId: "engineering", type: "authority" },
    { sourceId: "saas-co", targetId: "qa-team", type: "authority" },
    { sourceId: "qa-team", targetId: "qa-lead", type: "authority" },
    { sourceId: "qa-team", targetId: "senior-qa", type: "authority" },
    { sourceId: "engineering", targetId: "eng-manager", type: "authority" },
    { sourceId: "engineering", targetId: "cicd-system", type: "authority" },
    { sourceId: "engineering", targetId: "release-engineer", type: "authority" },
    // Delegation: QA Lead -> Senior QA Engineer for release approvals
    { sourceId: "qa-lead", targetId: "senior-qa", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Controlled production deployment with artifact-linked approval",
    initiatorRoleId: "release-engineer",
    targetAction:
      "Deploy Release Candidate to Production with Verified Test Results, Staging Validation, and Artifact Signature",
    description:
      "Release Engineer requests deployment approval through the CI/CD pipeline. QA Lead (or Senior QA Engineer delegate) must verify that automated tests passed, staging deployment is healthy, and monitoring shows no regressions. Engineering Manager must confirm release scope matches the planned changelog and deployment timing is appropriate. Approval is linked to the specific release artifact (container image SHA, Git commit hash) -- the CI/CD pipeline will not proceed to production without a valid, unexpired authorization matching the artifact being deployed.",
  },
  beforeMetrics: {
    // 5 hours elapsed wall-clock time from release request to deployment;
    // includes ~1-2 hours active manual effort (QA verification, changelog
    // review, Slack coordination) plus 3-4 hours waiting for approver
    // availability; assumes the release contains a security patch, making
    // the delay operationally significant
    manualTimeHours: 5,
    // 2 days from "release ready" to "deployed in production" -- meaningful
    // because the release includes a security patch; for feature-only
    // releases, this would be better characterized as "deployment delay"
    // rather than "risk exposure"
    riskExposureDays: 2,
    // (1) Slack approval not linked to CI/CD pipeline run,
    // (2) No artifact hash in approval record,
    // (3) No verification that staging tests still pass at deployment time,
    // (4) No segregation-of-duties enforcement,
    // (5) No evidence linking approval to the specific deployment event
    auditGapCount: 5,
    // (1) Release posted in Slack, (2) QA Lead verifies staging manually,
    // (3) QA Lead approves in Slack/Jira, (4) Eng Manager reviews changelog,
    // (5) Eng Manager approves in Slack/Jira, (6) Release Engineer manually
    // triggers production deployment
    approvalSteps: 6,
  },
  todayFriction: {
    ...ARCHETYPES["threshold-escalation"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Release posted in #releases Slack channel with changelog link and Jira ticket update -- no system-enforced link between Slack approval and CI/CD pipeline run or release artifact hash",
        // Simulation-compressed: represents 30-60 minutes real-world delay
        // for Slack post, changelog review, and Jira ticket creation
        delaySeconds: 6,
      },
      {
        trigger: "before-approval",
        description:
          "QA Lead manually verifying test results in CI dashboard, staging environment in browser, and monitoring dashboards in Datadog/Grafana -- context-switching across 3+ separate systems with no integrated view",
        // Simulation-compressed: represents 1-2 hours real-world QA
        // verification across multiple tools
        delaySeconds: 6,
      },
      {
        trigger: "on-unavailable",
        description:
          "QA Lead in sprint retrospective with Slack notifications muted -- Release Engineer DMing colleagues to find someone who can approve; no system-enforced delegation to Senior QA Engineer, release delayed to next deployment cycle",
        // Simulation-compressed: represents 2-4 hours real-world stall
        // waiting for QA Lead availability
        delaySeconds: 10,
      },
    ],
    narrativeTemplate:
      "Slack/Jira-based approvals with manual staging verification across separate tools and no artifact-linked audit trail",
  },
  todayPolicies: [
    {
      id: "policy-prod-release-today",
      actorId: "cicd-system",
      threshold: {
        k: 2,
        n: 2,
        approverRoleIds: ["qa-lead", "eng-manager"],
      },
      // Simulation-compressed: represents real-world 4-8 hour practical
      // window constrained by deployment cycle deadline
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
        "Production deployment without documented authorization from designated approvers -- Slack-based approvals not linked to deployment artifact, no evidence that testing was completed before deployment, and no segregation-of-duties enforcement between code author and deployment approver",
      fineRange:
        "Qualified or adverse SOC 2 Type II report; customer contract violations (enterprise contracts typically require unqualified SOC 2); competitive disadvantage in enterprise sales cycles",
      severity: "high",
      safeguardDescription:
        "Accumulate enforces 2-of-2 approval from QA Lead and Engineering Manager with cryptographic proof linking the authorization to the specific release artifact (container image SHA, Git commit), verified test results, and deployment event -- satisfying CC8.1 evidence requirements for change authorization, testing, and implementation",
    },
    {
      framework: "ISO27001",
      displayName: "ISO 27001:2022 A.8.32",
      clause: "Change Management",
      violationDescription:
        "Software changes deployed to production without authorized change request, documented approval, and verified testing -- change management process relies on informal Slack approvals with no system-enforced controls",
      fineRange:
        "Certification nonconformity; major finding requires corrective action before re-certification",
      severity: "high",
      safeguardDescription:
        "Policy-enforced deployment approval workflow with mandatory QA and engineering sign-off, artifact-linked authorization, and complete audit trail satisfying A.8.32 change management control requirements",
    },
    {
      framework: "NIST",
      displayName: "NIST SP 800-53 CM-3",
      clause: "Configuration Change Control",
      violationDescription:
        "Changes to information system deployed without documented authorization, security impact analysis, or verification that the change was tested before production implementation",
      fineRange:
        "FedRAMP authorization jeopardy for cloud service providers; contractual penalties for federal customers",
      severity: "high",
      safeguardDescription:
        "Every production deployment authorization is cryptographically signed with approver identity, timestamp, artifact hash, and test verification status -- satisfying CM-3 change control documentation requirements",
    },
  ],
  tags: [
    "release",
    "deployment",
    "ci-cd",
    "change-management",
    "artifact-validation",
    "staging",
    "audit-trail",
    "soc2-cc8",
    "delegation",
  ],
};
