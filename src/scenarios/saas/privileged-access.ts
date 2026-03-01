import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const privilegedAccessScenario: ScenarioTemplate = {
  id: "saas-privileged-access",
  name: "Privileged Database Access",
  description:
    "A critical production database index creation is urgently needed to remediate a query performance degradation causing customer-facing latency spikes. The Database Admin requires DDL-level access (CREATE INDEX) to the production database cluster. The Platform Engineering Lead is the designated PAM approver but is unavailable. Delegation happens informally via Slack to the Senior Platform Engineer, who has no system-enforced approval authority in the PAM platform. The PAM override creates compliance risk (SOC 2 CC6.2 -- delegate not pre-registered), audit gaps (no session recording, no correlation between Jira ticket and PAM session), and governance exposure (no automatic session termination after migration completes).",
  icon: "Cloud",
  industryId: "saas",
  archetypeId: "delegated-authority",
  prompt:
    "What happens when an emergency schema migration needs DDL-level production database access but the Platform Engineering Lead is unavailable and delegation is handled informally via Slack with a PAM override -- creating unregistered delegation, unrecorded sessions, and no automatic access revocation?",
  actors: [
    {
      id: "tech-corp",
      type: NodeType.Organization,
      label: "Tech Corp",
      parentId: null,
      organizationId: "tech-corp",
      color: "#8B5CF6",
    },
    {
      id: "platform-team",
      type: NodeType.Department,
      label: "Platform Team",
      description:
        "Owns production database infrastructure, access governance policies, and schema migration procedures -- PAM approval authority for production database access resides here",
      parentId: "tech-corp",
      organizationId: "tech-corp",
      color: "#06B6D4",
    },
    {
      id: "platform-lead",
      type: NodeType.Role,
      label: "Platform Engineering Lead",
      description:
        "Primary PAM approver for production database access -- reviews DDL justification (Jira ticket, migration script, rollback plan), verifies least-privilege scope, and approves in the PAM console. Currently unavailable, creating delegation gap.",
      parentId: "platform-team",
      organizationId: "tech-corp",
      color: "#94A3B8",
    },
    {
      id: "senior-platform-eng",
      type: NodeType.Role,
      label: "Senior Platform Engineer",
      description:
        "Informal delegation target via Slack DM -- not pre-registered as an alternate approver in the PAM system (SOC 2 CC6.2 gap). Must request IT Security to add approver privileges or tell the DBA to use break-glass.",
      parentId: "platform-team",
      organizationId: "tech-corp",
      color: "#94A3B8",
    },
    {
      id: "database-admin",
      type: NodeType.Role,
      label: "Database Admin",
      description:
        "Requests DDL-level production database access (CREATE INDEX) for emergency schema migration via Jira ticket with migration script and rollback plan attached",
      parentId: "platform-team",
      organizationId: "tech-corp",
      color: "#94A3B8",
    },
    {
      id: "security-dept",
      type: NodeType.Department,
      label: "Security",
      description:
        "Operates the PAM platform (credential vaulting, session recording, JIT access provisioning) and owns privileged access compliance policy. Platform team owns database-specific access governance.",
      parentId: "tech-corp",
      organizationId: "tech-corp",
      color: "#06B6D4",
    },
    {
      id: "ciso",
      type: NodeType.Role,
      label: "CISO",
      description:
        "Escalation authority when both the Platform Engineering Lead and Senior Platform Engineer are unavailable -- authorized to approve emergency production database access and mandate post-access review",
      parentId: "security-dept",
      organizationId: "tech-corp",
      color: "#94A3B8",
    },
    {
      id: "pam-system",
      type: NodeType.System,
      label: "PAM System",
      description:
        "Privileged Access Management platform (e.g., CyberArk, Teleport, HashiCorp Vault) -- provisions just-in-time database credentials with DDL-scoped privileges, records database sessions, enforces time-bound access, and auto-revokes at session expiry",
      parentId: "security-dept",
      organizationId: "tech-corp",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-privileged-access",
      actorId: "platform-team",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["platform-lead"],
      },
      // 4-hour DDL access window -- scoped to migration duration (1-2 hours typical)
      // plus buffer for troubleshooting; SOC 2 CC6.3 least-privilege temporal scoping.
      // Shorter than the 8-hour vendor access window because schema migrations are
      // discrete operations with defined completion criteria.
      expirySeconds: 14400,
      delegationAllowed: true,
      delegateToRoleId: "senior-platform-eng",
      mandatoryApprovers: ["platform-lead"],
      delegationConstraints:
        "Delegation limited to DDL-level access (CREATE INDEX, ALTER TABLE, ADD COLUMN) for production databases only. Superuser or administrative access requests (CREATE USER, GRANT, REVOKE) must escalate to CISO regardless of delegate availability.",
      escalation: {
        // Simulation-compressed: represents 30-minute real-world timeout
        // before escalating to CISO when both Platform Engineering Lead
        // and Senior Platform Engineer are unavailable
        afterSeconds: 20,
        toRoleIds: ["ciso"],
      },
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    { sourceId: "tech-corp", targetId: "platform-team", type: "authority" },
    { sourceId: "tech-corp", targetId: "security-dept", type: "authority" },
    { sourceId: "platform-team", targetId: "platform-lead", type: "authority" },
    { sourceId: "platform-team", targetId: "senior-platform-eng", type: "authority" },
    { sourceId: "platform-team", targetId: "database-admin", type: "authority" },
    { sourceId: "security-dept", targetId: "ciso", type: "authority" },
    { sourceId: "security-dept", targetId: "pam-system", type: "authority" },
    { sourceId: "platform-lead", targetId: "senior-platform-eng", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Emergency DDL access for production schema migration with PAM-enforced delegation",
    initiatorRoleId: "database-admin",
    targetAction:
      "DDL-Level Production Database Access (CREATE INDEX) for Emergency Schema Migration",
    description:
      "Database Admin requests DDL-level access to the production database cluster for an emergency index creation to remediate customer-facing latency. Platform Engineering Lead is unavailable -- delegation to Senior Platform Engineer is pre-configured in PAM with DDL-only scope constraint. Session recording enabled, 4-hour automatic expiry, and mandatory post-migration access review. If both Platform Engineering Lead and Senior Platform Engineer are unavailable, auto-escalation to CISO after 30 minutes (20 seconds simulation-compressed).",
  },
  beforeMetrics: {
    // ~3 hours wall-clock delay: Jira ticket (15 min) + Platform Engineering Lead
    // unreachable (30-60 min of Slack/PagerDuty chasing) + authority confusion with
    // Senior Platform Engineer (30-60 min) + PAM override request and IT Security
    // intervention (30-60 min) + migration execution (30-60 min)
    manualTimeHours: 3,
    // ~1 day of customer-facing performance degradation while DDL access is delayed
    // through informal delegation, PAM override, and emergency change window scheduling
    riskExposureDays: 1,
    // (1) Informal delegation not recorded in PAM — no auditable delegation chain
    // (2) PAM override approval not linked to Jira ticket — no business justification correlation
    // (3) No session recording during override — SQL commands unaudited
    // (4) No automatic session termination — DBA retains DDL access after migration completes
    auditGapCount: 4,
    // (1) Jira ticket filed, (2) Slack DM to Platform Engineering Lead (no response),
    // (3) Slack DM to Senior Platform Engineer (authority confusion),
    // (4) PAM override request to IT Security
    approvalSteps: 4,
  },
  todayFriction: {
    ...ARCHETYPES["delegated-authority"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Jira ticket submitted for DDL-level production access — manual manager-approval field required. DBA attaches migration script and rollback plan, but Jira approval field is not integrated with PAM system.",
        // Simulation-compressed: represents 15-30 minutes for Jira ticket
        // creation, justification documentation, and initial routing
        delaySeconds: 6,
      },
      {
        trigger: "on-unavailable",
        description:
          "Platform Engineering Lead unavailable — DBA Slack-DMs Senior Platform Engineer asking 'can you approve this?' Senior Platform Engineer checks PAM console, discovers they are not listed as an alternate approver (SOC 2 CC6.2 gap). Either requests IT Security to add approver privileges (takes hours) or tells DBA to use break-glass override.",
        // Simulation-compressed: represents 1-2 hours of authority confusion,
        // Slack back-and-forth, and IT Security intervention
        delaySeconds: 8,
      },
      {
        trigger: "before-approval",
        description:
          "PAM override executed manually — no session recording or SQL command audit configured for emergency access, no scope constraint limiting access to the specific database cluster, no automatic session termination after migration completion. Three distinct session governance gaps.",
        // Simulation-compressed: represents 30-60 minutes for PAM override
        // process including IT Security ticket and credential provisioning
        delaySeconds: 6,
      },
    ],
    narrativeTemplate:
      "Jira ticket with informal Slack delegation, unregistered PAM override, unrecorded database session, and no automatic access revocation",
  },
  todayPolicies: [
    {
      id: "policy-privileged-access-today",
      actorId: "platform-team",
      threshold: { k: 1, n: 1, approverRoleIds: ["platform-lead"] },
      // Simulation-compressed: represents real-world scenario where approval
      // stalls for hours while Platform Engineering Lead is unavailable and
      // informal delegation has no system-enforced authority
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "SOC2",
      displayName: "SOC 2 CC6.1",
      clause: "Logical Access Controls",
      violationDescription:
        "Production database DDL access granted via PAM override without documented approval from a pre-authorized approver — informal Slack delegation creates an access grant with no verifiable authorization chain",
      fineRange:
        "Qualified or adverse SOC 2 Type II report; customer contract SLA penalties (enterprise customers typically require unqualified SOC 2); competitive disadvantage in enterprise sales cycles",
      severity: "high",
      safeguardDescription:
        "Accumulate enforces policy-driven approval with cryptographic signature from a pre-authorized approver (Platform Engineering Lead or pre-registered delegate) before PAM provisions DDL credentials",
    },
    {
      framework: "SOC2",
      displayName: "SOC 2 CC6.2",
      clause: "Registration and Authorization",
      violationDescription:
        "Senior Platform Engineer acts as delegate without being pre-registered as an alternate approver in the PAM system — delegation via Slack DM bypasses the CC6.2 requirement that access authorization is granted only to registered and pre-authorized personnel",
      fineRange:
        "SOC 2 examination finding; remediation required before next audit period; potential qualification if delegation without registration is systemic",
      severity: "high",
      safeguardDescription:
        "Delegate registration is a precondition of the Accumulate delegation policy — the Senior Platform Engineer is pre-configured as an alternate approver with DDL-scoped delegation constraints before any delegation can occur",
    },
    {
      framework: "SOC2",
      displayName: "SOC 2 CC6.3",
      clause: "Access Removal",
      violationDescription:
        "Override database access not time-bound and not automatically revoked after schema migration completes — DBA retains DDL privileges until someone manually revokes access, creating standing privilege exposure",
      fineRange:
        "SOC 2 examination finding; standing privilege finding is commonly cited in CC6.3 testing",
      severity: "medium",
      safeguardDescription:
        "4-hour automatic expiry enforced by PAM integration — Accumulate authorization includes a temporal constraint that PAM enforces via automatic session termination regardless of migration status",
    },
    {
      framework: "PCI-DSS",
      displayName: "PCI DSS v4.0 Req. 7.2",
      clause: "Restrict Access by Business Need to Know",
      violationDescription:
        "Production database access granted at 'write' level without least-privilege scoping to DDL-only operations — overly broad access grant violates Requirement 7.2 if database contains or processes cardholder data",
      fineRange:
        "PCI DSS noncompliance finding; potential loss of PCI certification; acquiring bank penalties",
      severity: "high",
      safeguardDescription:
        "Accumulate policy specifies DDL-level access scope as a constraint — PAM provisions credentials with DDL-only privileges (CREATE INDEX, ALTER TABLE) without DML access to data tables containing cardholder data",
    },
    {
      framework: "ISO27001",
      displayName: "ISO 27001:2022 A.8.2",
      clause: "Privileged Access Rights",
      violationDescription:
        "Privileged database access rights allocated and used without restriction or management — informal delegation, unscoped access, and no session recording violate A.8.2 requirement that privileged access rights shall be restricted and managed",
      fineRange:
        "Certification nonconformity; major finding requires corrective action before re-certification",
      severity: "high",
      safeguardDescription:
        "Policy-enforced privileged access with pre-registered delegation, DDL-scoped credentials, session recording, time-bound access, and complete audit trail satisfying A.8.2 and A.5.18 (Access Rights) requirements",
    },
  ],
  tags: [
    "database",
    "privileged-access",
    "delegation",
    "pam",
    "schema-migration",
    "compliance",
    "forensic-trail",
    "ddl",
    "jit-access",
    "soc2-cc6",
    "session-recording",
  ],
};
