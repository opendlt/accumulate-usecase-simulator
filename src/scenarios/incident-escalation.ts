import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "./archetypes";

export const incidentEscalationScenario: ScenarioTemplate = {
  id: "incident-escalation",
  name: "Incident Escalation (Break-Glass Access)",
  description:
    "A live Sev1 security incident requires immediate firewall modification to contain an active intrusion. The SIEM triggers an alert and the SOC Analyst classifies it as Sev1, but the Incident Commander must authorize break-glass access through PAM, which requires manual approval. The IC is simultaneously coordinating the incident response and fielding PAM approval requests — a dual-role bottleneck. If the IC is unavailable, escalation to the CISO adds 15-30 minutes while the attacker maintains access. Post-incident, the authorization audit trail is fragmented across PagerDuty, PAM, SIEM, and firewall logs, creating correlation gaps for SOC 2 CC7.4 compliance.",
  icon: "Warning",
  industryId: "saas",
  archetypeId: "emergency-break-glass",
  prompt:
    "What happens when a SIEM alert triggers during a live security incident but privileged credentials are locked behind PAM, the Incident Commander is unavailable, and escalation through the approval chain takes 30-90 minutes while the attacker maintains access?",
  actors: [
    {
      id: "nexus-org",
      type: NodeType.Organization,
      label: "Nexus Cloud",
      parentId: null,
      organizationId: "nexus-org",
      color: "#3B82F6",
    },
    {
      id: "sre-team",
      type: NodeType.Department,
      label: "SRE",
      description:
        "Site Reliability Engineering — owns production infrastructure including network firewalls and security groups; executes emergency firewall changes during incidents",
      parentId: "nexus-org",
      organizationId: "nexus-org",
      color: "#06B6D4",
    },
    {
      id: "on-call",
      type: NodeType.Role,
      label: "SRE On-Call",
      description:
        "On-call engineer who executes the firewall rule change — requires PAM credential checkout authorized by the Incident Commander",
      parentId: "sre-team",
      organizationId: "nexus-org",
      color: "#94A3B8",
    },
    {
      id: "soc",
      type: NodeType.Department,
      label: "SOC",
      description:
        "Security Operations Center — monitors SIEM alerts, triages security events, and coordinates incident response",
      parentId: "nexus-org",
      organizationId: "nexus-org",
      color: "#06B6D4",
    },
    {
      id: "soc-analyst",
      type: NodeType.Role,
      label: "SOC Analyst",
      description:
        "Triages SIEM alert, classifies incident severity, and initiates the Sev1 response workflow including IC assignment",
      parentId: "soc",
      organizationId: "nexus-org",
      color: "#94A3B8",
    },
    {
      id: "incident-commander",
      type: NodeType.Role,
      label: "Incident Commander",
      description:
        "On-call senior security engineer or SOC Manager designated as IC for Sev1 — authorizes tactical response actions including break-glass PAM access; simultaneously coordinating response and approving access creates dual-role bottleneck",
      parentId: "soc",
      organizationId: "nexus-org",
      color: "#F59E0B",
    },
    {
      id: "ciso",
      type: NodeType.Role,
      label: "CISO",
      description:
        "Executive escalation authority for security incidents when Incident Commander is unreachable or incident severity warrants executive oversight",
      parentId: "nexus-org",
      organizationId: "nexus-org",
      color: "#94A3B8",
    },
  ],
  policies: [
    {
      id: "policy-incident",
      actorId: "nexus-org",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["incident-commander"],
      },
      expirySeconds: 1800, // 30-minute break-glass authority window
      delegationAllowed: true,
      delegateToRoleId: "ciso",
      escalation: {
        afterSeconds: 20, // Simulation-compressed: represents 5-minute IC response SLA before CISO escalation
        toRoleIds: ["ciso"],
      },
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    { sourceId: "nexus-org", targetId: "sre-team", type: "authority" },
    { sourceId: "sre-team", targetId: "on-call", type: "authority" },
    { sourceId: "nexus-org", targetId: "soc", type: "authority" },
    { sourceId: "soc", targetId: "soc-analyst", type: "authority" },
    { sourceId: "soc", targetId: "incident-commander", type: "authority" },
    { sourceId: "nexus-org", targetId: "ciso", type: "authority" },
    { sourceId: "incident-commander", targetId: "ciso", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Emergency firewall modification during live Sev1 security incident",
    initiatorRoleId: "on-call",
    targetAction:
      "Emergency Firewall Rule Change — Break-Glass PAM Credential Checkout During Active Sev1 Intrusion",
    description:
      "SOC Analyst triages SIEM alert as Sev1 active intrusion. Incident Commander authorizes break-glass PAM credential checkout for SRE On-Call to execute emergency firewall rule change. IC approval via Accumulate with 30-minute authority window, auto-escalation to CISO after 5 minutes (20 sec simulation-compressed), and mandatory post-incident review of all break-glass access.",
  },
  beforeMetrics: {
    manualTimeHours: 1.5, // 90-minute worst case: IC unavailable, CISO escalation, PAM approval wait
    riskExposureDays: 0.25, // ~6 hours from detection through containment and verification
    auditGapCount: 4, // (1) SIEM-to-PagerDuty, (2) PagerDuty-to-PAM, (3) PAM-to-firewall, (4) no unified timeline
    approvalSteps: 4, // (1) SOC Analyst triages, (2) IC engaged via PagerDuty, (3) PAM request submitted, (4) IC approves in PAM
  },
  todayFriction: {
    ...ARCHETYPES["emergency-break-glass"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "SIEM alert triaged by SOC Analyst as Sev1 — paging Incident Commander and SRE On-Call via PagerDuty",
        delaySeconds: 10, // Simulation-compressed: represents 2-5 minute PagerDuty acknowledgment
      },
      {
        trigger: "before-approval",
        description:
          "Privileged credentials locked behind PAM — IC must approve credential checkout while simultaneously coordinating incident response in war room",
        delaySeconds: 8, // Simulation-compressed: represents 5-15 minute PAM approval wait
      },
      {
        trigger: "on-unavailable",
        description:
          "Incident Commander unavailable — escalating to CISO via PagerDuty secondary on-call; attacker maintains access during escalation delay",
        delaySeconds: 12, // Simulation-compressed: represents 15-30 minute CISO escalation
      },
    ],
    narrativeTemplate:
      "Manual SIEM triage and PAM approval bottleneck with IC dual-role conflict during active intrusion",
  },
  todayPolicies: [
    {
      id: "policy-incident-today",
      actorId: "nexus-org",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["incident-commander"],
      },
      expirySeconds: 20, // Simulation-compressed: represents 30-60 minute PAM approval timeout
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "SOC2",
      displayName: "SOC 2 CC7.4",
      clause: "Security Incident Response",
      violationDescription:
        "Break-glass access during security incident without documented authorization chain — IC approval, credential checkout, and firewall change logged in disconnected systems with no unified audit trail",
      fineRange:
        "Audit qualification + customer contract SLA penalties + potential customer churn",
      severity: "critical",
      safeguardDescription:
        "Accumulate captures the complete break-glass authorization chain — IC approval, credential checkout authorization, time window, and escalation path — in a single cryptographic proof for SOC 2 CC7.4 evidence",
    },
    {
      framework: "SOC2",
      displayName: "SOC 2 CC7.3",
      clause: "Security Incident Detection",
      violationDescription:
        "SIEM alert-to-response handoff undocumented — no verifiable link between detection event and incident response initiation",
      fineRange:
        "Audit qualification + customer contract SLA penalties",
      severity: "high",
      safeguardDescription:
        "Alert-to-authorization linkage captured cryptographically, providing verifiable proof that detection triggered response within defined SLAs",
    },
    {
      framework: "NIST",
      displayName: "NIST SP 800-61r2",
      clause: "Incident Handling",
      violationDescription:
        "Incident response actions taken without documented authorization — containment actions cannot be attributed to authorized personnel during post-incident review",
      fineRange:
        "FedRAMP authorization jeopardy for cloud service providers; contractual penalties for federal customers",
      severity: "high",
      safeguardDescription:
        "Every incident response authorization decision is cryptographically signed with actor identity, timestamp, and scope, satisfying NIST SP 800-61 post-incident activity documentation requirements",
    },
    {
      framework: "GDPR",
      displayName: "GDPR Art. 33",
      clause: "Breach Notification",
      violationDescription:
        "Fragmented incident authorization records delay breach scope determination, jeopardizing the 72-hour supervisory authority notification deadline",
      fineRange: "Up to 4% annual turnover or EUR 20M",
      severity: "critical",
      safeguardDescription:
        "Unified cryptographic authorization trail enables rapid breach scope determination, supporting timely Art. 33 notification with verifiable evidence of containment actions taken",
    },
  ],
  tags: [
    "incident",
    "emergency",
    "break-glass",
    "siem",
    "pam",
    "firewall",
    "sev1",
    "incident-commander",
    "soc2-cc7",
    "containment",
  ],
};
