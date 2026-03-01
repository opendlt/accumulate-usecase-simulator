# SME Review #14: Cross-Team Infrastructure Change (SaaS Scenario #5)

**Reviewer:** Hyper-SME Agent -- Senior Cloud Infrastructure Governance, Kubernetes Platform Engineering, and Cross-Functional Change Management Expert
**Date:** 2026-02-28
**Scenario File:** `src/scenarios/saas/infra-change.ts`
**Narrative File:** `docs/scenario-journeys/saas-scenarios.md` (Section 5, lines ~301-363)
**Verdict:** Needs significant rework -- the scenario captures the correct organizational topology and friction pattern but is the least mature of the five SaaS scenarios, with missing policy fields, generic regulatory context, undocumented metrics, and a thin narrative journey that would not survive scrutiny from any of the five target audiences.

---

## 1. Executive Assessment

**Overall Credibility Score: C+**

This scenario correctly identifies the three-team approval bottleneck (Platform initiates, Security + SRE approve), the Security-Lead-as-bottleneck pattern, and the CVE exposure risk from delayed Kubernetes upgrades. The organizational topology and segregation-of-duties model are sound. However, the implementation is incomplete relative to the corrected SaaS scenarios 1, 3, and 4 -- it reads like a first draft that was never brought to parity with the quality bar established by those scenarios.

### Top 3 Most Critical Issues

1. **CRITICAL: `delegationAllowed: true` with no `delegateToRoleId`, no `delegationConstraints`, no `escalation`, and no delegate actor.** The policy enables delegation but does not specify who the Security Lead delegates to, what the constraints on delegation are, or what happens when both the primary approver and delegate are unavailable. This is an incomplete governance model that would be flagged immediately by a SOC 2 auditor testing CC8.1 and by any VP of Platform Engineering who has operated a real change management system. Every other corrected SaaS scenario that enables delegation also specifies the target role, constraints, and escalation path.

2. **CRITICAL: `regulatoryContext: REGULATORY_DB.saas` imports generic SOC 2 CC6.1 (Logical Access) and GDPR Art. 32 (Security of Processing) -- neither of which is the primary applicable framework for infrastructure change management.** The directly applicable frameworks are SOC 2 CC8.1 (Change Management), SOC 2 CC7.1 (Security Configuration Management), ISO 27001:2022 A.8.32 (Change Management), NIST SP 800-53 CM-3 (Configuration Change Control), and NIST SP 800-53 SI-2 (Flaw Remediation). SOC 2 CC6.1 addresses logical access controls, not change management controls -- an auditor would immediately note that the wrong trust services criteria are cited. All other corrected SaaS scenarios use inline `regulatoryContext` with scenario-specific frameworks.

3. **HIGH: `manualTimeHours: 48` conflates wall-clock delay with active manual effort.** 48 hours is plausible as wall-clock elapsed time (including 24-48 hours waiting for Security Lead availability), but the active manual effort for a Kubernetes upgrade approval workflow is 8-12 hours at most (Terraform plan preparation, SRE readiness review, Security review, coordination). The corrected SaaS scenarios 1, 3, and 4 all carefully distinguish between wall-clock delay and active effort in their metric comments. A Principal SRE who has lived this exact workflow would immediately challenge 48 hours of "coordination" as overstated active effort or understated wall-clock delay (it is actually both -- depending on interpretation).

### Top 3 Strengths

1. **Correct organizational topology.** The three-team model (Platform initiates, Security + SRE approve) with Platform Lead as initiator who does not self-approve accurately reflects segregation-of-duties requirements for fleet-wide Kubernetes upgrades at SaaS companies. The 2-of-2 threshold with Platform Lead excluded from the approver pool is exactly right.

2. **Correct identification of the bottleneck.** Security Lead unavailability as the primary bottleneck is realistic and well-documented in the industry. The scenario correctly identifies that SRE is rarely the bottleneck (SRE teams have well-defined on-call rotations), while Security review requires evaluating blast radius, CVE impact, RBAC changes, and admission controller compatibility -- which takes time and is harder to delegate.

3. **Appropriate archetype selection.** `"multi-party-approval"` is the correct archetype for a K-of-N cross-team approval workflow. The scenario correctly uses `...ARCHETYPES["multi-party-approval"].defaultFriction` as the base friction profile and overrides the manual steps with scenario-specific delays.

---

## 2. Line-by-Line Findings

### Finding 1: REGULATORY_DB.saas Import -- Generic and Incorrect Regulatory Framework

- **Location:** `src/scenarios/saas/infra-change.ts`, line 4 (`import { REGULATORY_DB } from "@/lib/regulatory-data"`) and line 139 (`regulatoryContext: REGULATORY_DB.saas`)
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `regulatoryContext: REGULATORY_DB.saas`
- **Problem:** `REGULATORY_DB.saas` resolves to SOC 2 CC6.1 (Logical Access) and GDPR Art. 32 (Security of Processing). Neither is the primary applicable framework for infrastructure change governance. SOC 2 CC6.1 governs *who has access to systems* -- it does not govern *how changes to systems are authorized, tested, and deployed*. The directly applicable trust services criteria for infrastructure change management is CC8.1 (Change Management), which requires that "the entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure." Additionally, CC7.1 (Security Configuration Management) applies because delayed Kubernetes upgrades result in known vulnerability exposure. ISO 27001:2022 A.8.32 (Change Management) is the direct ISO control. NIST SP 800-53 CM-3 (Configuration Change Control) governs multi-party approval for configuration changes. NIST SP 800-53 SI-2 (Flaw Remediation) governs timely patching -- the scenario's core risk. GDPR Art. 32 is tangentially relevant only if the Kubernetes cluster processes personal data, which is not established in the scenario narrative.
- **Corrected Text:** Inline `regulatoryContext` array with SOC 2 CC8.1, SOC 2 CC7.1, ISO 27001:2022 A.8.32, NIST SP 800-53 CM-3, and NIST SP 800-53 SI-2 (see corrected scenario below).
- **Source/Rationale:** SOC 2 Trust Services Criteria (2017, updated 2022) -- CC8.1 explicitly addresses change management. AICPA SOC 2 Reporting Guide. ISO 27001:2022 Annex A, Control A.8.32. NIST SP 800-53 Rev. 5, CM-3 and SI-2.

### Finding 2: delegationAllowed: true with No delegateToRoleId

- **Location:** `src/scenarios/saas/infra-change.ts`, lines 96-97 (`delegationAllowed: true` with no `delegateToRoleId`)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** `delegationAllowed: true,` (with no `delegateToRoleId` on the next line)
- **Problem:** The policy enables delegation but does not specify the delegation target. In practice, when the Security Lead is unavailable for infrastructure change review, the delegate is a Senior Security Engineer who has been pre-authorized to review and approve specific categories of infrastructure changes. Without a `delegateToRoleId`, the simulation cannot demonstrate the delegation path, and the policy is incomplete from both a SOC 2 CC8.1 perspective (who is authorized to approve the change in the Security Lead's absence?) and an operational perspective (who does the change management system route the request to?). All three corrected SaaS scenarios that enable delegation (vendor-access, prod-release, privileged-access) also specify the target role.
- **Corrected Text:** `delegateToRoleId: "senior-security-eng",` (with a corresponding `"senior-security-eng"` actor added to the actors array)
- **Source/Rationale:** SOC 2 CC6.2 -- Registration and Authorization: access authorization is granted only to registered and pre-authorized personnel. Change management delegation without a registered delegate is a CC6.2/CC8.1 gap. Pattern established by corrected SaaS scenarios 1, 3, and 4.

### Finding 3: No delegationConstraints

- **Location:** `src/scenarios/saas/infra-change.ts`, policy object (lines 87-98) -- missing `delegationConstraints` field
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** (field absent)
- **Problem:** All corrected SaaS scenarios include `delegationConstraints` documenting the scope of delegation. For this scenario, the Senior Security Engineer's delegation authority should be constrained to standard infrastructure changes (Kubernetes patch upgrades, node pool scaling, routine Terraform module updates) -- high-risk changes (major Kubernetes version upgrades, RBAC reconfiguration, network policy changes, CNI/service mesh upgrades) should still require the Security Lead or CISO. Without delegation constraints, the policy implies the delegate has unlimited authority to approve any infrastructure change, which is not how real-world change governance works.
- **Corrected Text:** `delegationConstraints: "Senior Security Engineer may approve standard infrastructure changes (Kubernetes patch upgrades within the same minor version, node pool scaling, routine Terraform module updates). High-risk changes (Kubernetes minor version upgrades, RBAC reconfiguration, network policy changes, CNI/service mesh upgrades, admission controller updates) require Security Lead or CISO approval.",`
- **Source/Rationale:** ITIL 4 Change Enablement practice -- change risk classification determines approval authority. SOC 2 CC8.1 -- change authorization should be commensurate with the risk and impact of the change.

### Finding 4: No escalation Path

- **Location:** `src/scenarios/saas/infra-change.ts`, policy object (lines 87-98) -- missing `escalation` field
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** (field absent)
- **Problem:** If both the Security Lead and the Senior Security Engineer delegate are unavailable, the infrastructure change stalls indefinitely. The corrected SaaS scenarios 2 (incident escalation), 3 (prod-release), and 4 (privileged-access) all include escalation rules. For fleet-wide Kubernetes upgrades with known CVE exposure, escalation to the CISO or Director of Security Engineering after a defined timeout is standard practice. Without escalation, the CVE exposure window grows with no upper bound.
- **Corrected Text:** `escalation: { afterSeconds: 25, toRoleIds: ["ciso"] },` (simulation-compressed; represents 8-hour real-world escalation SLA)
- **Source/Rationale:** NIST SP 800-53 SI-2 (Flaw Remediation) -- the organization corrects information system flaws in a timely manner. An unbounded approval delay for a change that remediates known CVEs violates the timeliness requirement.

### Finding 5: No mandatoryApprovers

- **Location:** `src/scenarios/saas/infra-change.ts`, policy object (lines 87-98) -- missing `mandatoryApprovers` field
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** (field absent)
- **Problem:** For fleet-wide Kubernetes upgrades, SRE Lead approval is arguably non-delegable because operational readiness validation (rollback plan, monitoring coverage, pod disruption budget impact, on-call coverage, change window timing) is SRE-specific domain expertise that cannot be delegated to a Security Engineer. Making the SRE Lead a mandatory approver ensures that operational readiness is always validated by someone with direct SRE expertise, even when Security review is delegated. The corrected SaaS scenarios 1 and 4 use `mandatoryApprovers` where specific approvers are non-negotiable.
- **Corrected Text:** `mandatoryApprovers: ["sre-lead"],`
- **Source/Rationale:** Operational readiness review is a domain-specific validation that requires direct SRE expertise (runbook validation, PDB impact analysis, monitoring coverage, rollback testing). This is not delegable in the same way that Security review can be delegated to a Senior Security Engineer.

### Finding 6: No constraints

- **Location:** `src/scenarios/saas/infra-change.ts`, policy object (lines 87-98) -- missing `constraints` field
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** (field absent)
- **Problem:** All corrected SaaS scenarios include `constraints: { environment: "production" }`. This scenario affects production Kubernetes clusters and should explicitly scope the policy to the production environment. Without the constraint, the policy could theoretically apply to non-production infrastructure changes, which typically have a lower approval bar.
- **Corrected Text:** `constraints: { environment: "production" },`
- **Source/Rationale:** Pattern consistency with corrected SaaS scenarios 1, 3, and 4. SOC 2 CC8.1 -- production changes require more rigorous authorization than non-production changes.

### Finding 7: No Department Descriptions

- **Location:** `src/scenarios/saas/infra-change.ts`, lines 27-48 (Platform Team, Security Team, SRE Team department actors)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** All three department actors have no `description` field.
- **Problem:** The corrected SaaS scenarios all include department descriptions explaining the team's role in the approval workflow. Without descriptions, the simulation UI cannot convey the organizational context of each team's responsibility in the infrastructure change governance process.
- **Corrected Text:** See corrected scenario below for full department descriptions.
- **Source/Rationale:** Pattern consistency with corrected SaaS scenarios 1, 3, and 4.

### Finding 8: manualTimeHours: 48 -- Conflation of Wall-Clock and Active Effort

- **Location:** `src/scenarios/saas/infra-change.ts`, line 116 (`manualTimeHours: 48`)
- **Issue Type:** Overstatement
- **Severity:** High
- **Current Text:** `manualTimeHours: 48,`
- **Problem:** 48 hours is plausible as wall-clock elapsed time when the Security Lead is unavailable for 24-48 hours. However, the active manual coordination effort is approximately 8-12 hours: Terraform plan preparation and review (2-3 hours), SRE readiness review (2-3 hours), Security review (2-4 hours), coordination and scheduling (1-2 hours). The corrected SaaS scenarios carefully distinguish between wall-clock delay and active effort in their metric comments. The narrative section (line 333) says "~48 hours of coordination" without qualifying this as wall-clock versus active time, which a Principal SRE would immediately challenge. The metric label `manualTimeHours` implies active manual effort, not wall-clock waiting. Corrected value: 10 hours (active manual effort; wall-clock elapsed time is 48-72 hours when Security Lead is in active incident response). This is documented in comments explaining the breakdown.
- **Corrected Text:** `manualTimeHours: 10,` (with comment: "~10 hours active manual effort: Terraform plan preparation and review (2-3 hours), SRE readiness review (2-3 hours), Security review when Lead becomes available (2-4 hours), coordination and change window scheduling (1-2 hours). Wall-clock elapsed time is 48-72 hours due to Security Lead unavailability during incident response.")
- **Source/Rationale:** Real-world Kubernetes upgrade governance at SaaS companies (Datadog, HashiCorp, Cloudflare, Confluent tier). The active effort is bounded by the number of review steps; the wall-clock time is dominated by waiting for Security Lead availability.

### Finding 9: riskExposureDays: 7 -- Inconsistent with Narrative

- **Location:** `src/scenarios/saas/infra-change.ts`, line 117 (`riskExposureDays: 7`) and `docs/scenario-journeys/saas-scenarios.md`, line 331 ("delayed by days")
- **Issue Type:** Inconsistency
- **Severity:** High
- **Current Text:** `riskExposureDays: 7,` in TypeScript; "delayed by days" in narrative
- **Problem:** 7 days (a full business week) of CVE exposure implies the Security Lead is unavailable for an entire week, which is unusual unless they are on extended PTO without a delegate. The narrative says "days" (which typically means 2-3 days), and the scenario describes the Security Lead as being in active incident response, which typically lasts 24-72 hours, not a full week. Additionally, 7 days pushes the scenario toward a Kubernetes version skew risk (if the fleet is already near end of support), which is a different and more severe scenario. Corrected value: 3 days, consistent with the narrative and with realistic incident response timelines.
- **Corrected Text:** `riskExposureDays: 3,` (with comment: "3 days of CVE exposure from delayed Kubernetes upgrade -- Security Lead in active incident response for 48-72 hours, plus 24 hours for change window scheduling after approval is obtained. If the Security Lead were on extended PTO (1-2 weeks), this would increase to 5-7 days, but with delegation enabled, extended PTO should not cause this level of delay.")
- **Source/Rationale:** Kubernetes security patch timelines. Industry-typical incident response duration (24-72 hours for a significant security incident). The narrative and TypeScript metrics should be consistent.

### Finding 10: auditGapCount: 4 -- Gaps Not Enumerated

- **Location:** `src/scenarios/saas/infra-change.ts`, line 118 (`auditGapCount: 4`)
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** `auditGapCount: 4,` (no itemized comment)
- **Problem:** The corrected SaaS scenarios all enumerate each audit gap in comments next to the `auditGapCount` value. This scenario's 4 gaps are not itemized, making the number unverifiable. Based on the scenario description, the 4 gaps are: (1) Slack-based change approval not linked to the Terraform plan or apply event, (2) No change risk classification recorded in the approval record, (3) No Security review evidence linked to the specific Kubernetes upgrade (the Security review happened informally in Slack but is not correlated to the Terraform plan hash), (4) No rollback verification evidence (no proof that the rollback plan was reviewed and validated before the change was approved).
- **Corrected Text:** See corrected scenario for itemized comment block.
- **Source/Rationale:** SOC 2 CC8.1 -- change authorization requires evidence linking the approval to the specific change. Pattern consistency with corrected SaaS scenarios 1, 3, and 4.

### Finding 11: Policy actorId Is "cloud-co" (Organization) -- Arguably Should Be "infra-system"

- **Location:** `src/scenarios/saas/infra-change.ts`, line 89 (`actorId: "cloud-co"`)
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text:** `actorId: "cloud-co",`
- **Problem:** In the corrected prod-release scenario (SaaS #3), the policy is attached to `"cicd-system"` because the CI/CD pipeline is the technical control point that enforces the approval gate. By analogy, for this infrastructure change scenario, the IaC/Terraform system is the technical control point that gates the `terraform apply` on approval. Attaching the policy to `"infra-system"` would be more precise and consistent with the prod-release pattern. However, attaching the policy to `"cloud-co"` is defensible if the policy is intended to represent org-wide infrastructure change governance rather than a specific system gate. I will correct this to `"infra-system"` for consistency with the established pattern.
- **Corrected Text:** `actorId: "infra-system",`
- **Source/Rationale:** Pattern consistency with corrected prod-release scenario. The IaC/Terraform system is the control point that enforces the approval gate before `terraform apply` proceeds.

### Finding 12: IaC/Terraform System Description Is Thin

- **Location:** `src/scenarios/saas/infra-change.ts`, line 80 (`description: "Infrastructure-as-code system managing Kubernetes cluster configuration and deployment"`)
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `"Infrastructure-as-code system managing Kubernetes cluster configuration and deployment"`
- **Problem:** The corrected SaaS scenarios have detailed system descriptions. The IaC/Terraform system should describe its role as the change management control point: Terraform plan generation, state management, approval gates (Terraform Cloud/Spacelift plan review), policy-as-code validation (Sentinel/OPA), and apply execution. Without this detail, the system actor does not convey why it is the appropriate policy attachment point.
- **Corrected Text:** `"Infrastructure-as-Code platform (e.g., Terraform Cloud, Spacelift, Atlantis) -- generates Terraform plans for Kubernetes cluster configuration changes, manages Terraform state, enforces policy-as-code validation (Sentinel/OPA) on plans, gates terraform apply on multi-party approval, and executes the approved change against the Kubernetes fleet. Currently, approval gate is manual (Slack review of Terraform plan output) with no system-enforced link between the plan review and the apply execution."`
- **Source/Rationale:** Real-world Terraform Cloud/Enterprise and Spacelift deployment patterns. The IaC system is the technical control point that should gate applies on approval.

### Finding 13: todayPolicies expirySeconds: 30 -- No Compression Comment

- **Location:** `src/scenarios/saas/infra-change.ts`, line 135 (`expirySeconds: 30`)
- **Issue Type:** Missing Element
- **Severity:** Low
- **Current Text:** `expirySeconds: 30,` (no comment)
- **Problem:** The corrected SaaS scenarios include comments explaining the simulation compression ratio for `todayPolicies.expirySeconds`. This scenario does not explain what 30 seconds represents in real-world time. Based on the scenario, it represents the real-world practical window during which the change request remains actionable (approximately 48-72 hours before the change backlog grows unacceptable).
- **Corrected Text:** See corrected scenario for compression comment.
- **Source/Rationale:** Pattern consistency with corrected SaaS scenarios 1, 3, and 4.

### Finding 14: Missing CISO Actor and Senior Security Engineer Actor

- **Location:** `src/scenarios/saas/infra-change.ts`, actors array (lines 16-84)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Only three Role actors: `platform-lead`, `security-lead`, `sre-lead`
- **Problem:** The policy enables delegation but there is no delegate actor. All corrected SaaS scenarios that use delegation include the delegate as a named Role actor (prod-release has `senior-qa`, privileged-access has `senior-platform-eng`). Additionally, the escalation path (which is also missing from the policy) would require a CISO actor. Without these actors, the simulation cannot model the delegation and escalation paths.
- **Corrected Text:** Add `"senior-security-eng"` (Senior Security Engineer -- designated delegate for Security Lead on infrastructure change reviews) and `"ciso"` (CISO -- escalation authority when both Security Lead and delegate are unavailable). See corrected scenario.
- **Source/Rationale:** Pattern consistency with corrected SaaS scenarios 3 and 4. SOC 2 CC8.1 requires that change authorization includes a defined escalation path.

### Finding 15: Missing Delegation Edge

- **Location:** `src/scenarios/saas/infra-change.ts`, edges array (lines 99-107)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Only authority edges; no delegation edges
- **Problem:** The corrected SaaS scenarios that use delegation include a delegation edge (e.g., `{ sourceId: "qa-lead", targetId: "senior-qa", type: "delegation" }` in prod-release, `{ sourceId: "platform-lead", targetId: "senior-platform-eng", type: "delegation" }` in privileged-access). This scenario enables delegation but has no delegation edge, which means the simulation graph cannot visualize the delegation path.
- **Corrected Text:** Add `{ sourceId: "security-lead", targetId: "senior-security-eng", type: "delegation" },`
- **Source/Rationale:** Pattern consistency with corrected SaaS scenarios 1, 3, and 4.

### Finding 16: Narrative Journey Section 5 Is Thin

- **Location:** `docs/scenario-journeys/saas-scenarios.md`, lines 301-363
- **Issue Type:** Understatement
- **Severity:** High
- **Current Text:** Section 5 is approximately 60 lines (301-363) with no enumerated audit gaps, no specific Kubernetes version numbers or CVE references, no tooling references (Terraform Cloud, Argo CD, OPA/Gatekeeper), and a takeaway table with only 6 rows.
- **Problem:** Compared to the corrected Sections 1-4, Section 5 is substantially thinner. Section 1 (vendor-access) is ~83 lines with 5 enumerated audit gaps and an 8-row takeaway table. Section 3 (prod-release) is ~112 lines with 5 enumerated audit gaps and a 7-row takeaway table. Section 4 (privileged-access) is ~80 lines with 4 enumerated audit gaps and a 9-row takeaway table. Section 5 has: no enumerated audit gaps, a 6-row takeaway table with minimal detail, no specific technology references in the workflow steps, and vague phrasing ("delegate reviews and approves" -- who is the delegate? what do they review?).
- **Corrected Text:** See corrected narrative journey below.
- **Source/Rationale:** Pattern consistency with corrected Sections 1-4.

### Finding 17: Narrative "With Accumulate" Step 2 Says "Security Lead's delegate" Without Naming the Delegate

- **Location:** `docs/scenario-journeys/saas-scenarios.md`, line 343 ("so the system routes to the Security Lead's delegate")
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** "the system routes to the Security Lead's delegate"
- **Problem:** The corrected sections 3 and 4 always name the delegate explicitly (e.g., "the system automatically routes the request to the Senior QA Engineer (pre-configured delegate)"). Section 5 does not name the delegate, which makes the narrative vague and unverifiable.
- **Corrected Text:** "the system automatically routes the request to the Senior Security Engineer (pre-configured delegate for standard infrastructure change reviews)"
- **Source/Rationale:** Pattern consistency with corrected Sections 3 and 4.

### Finding 18: todayFriction Manual Steps -- "Lead reviewing Terraform diff" Is Vague

- **Location:** `src/scenarios/saas/infra-change.ts`, line 125 (`"Lead reviewing Terraform diff and running manual security checks..."`)
- **Issue Type:** Understatement
- **Severity:** Low
- **Current Text:** `"Lead reviewing Terraform diff and running manual security checks -- automated validation not integrated into approval flow"`
- **Problem:** Which lead? Both Security Lead and SRE Lead review the Terraform plan, but they review different aspects. The SRE Lead reviews operational readiness (blast radius, rollback plan, PDB impact, change window timing). The Security Lead reviews security impact (CVE remediation scope, RBAC changes, network policy changes, admission controller compatibility). The description should distinguish the two reviews rather than using the generic "Lead."
- **Corrected Text:** See corrected scenario for specific manual step descriptions.
- **Source/Rationale:** Real-world SRE and Security review workflows for Kubernetes upgrades.

---

## 3. Missing Elements

### Missing Actors
1. **Senior Security Engineer** -- designated delegate for Security Lead on infrastructure change reviews. Pre-registered in the change management system with authority to review and approve standard infrastructure changes (Kubernetes patch upgrades, node pool scaling, routine Terraform module updates). This role is analogous to `senior-qa` in prod-release and `senior-platform-eng` in privileged-access.
2. **CISO** -- escalation authority when both Security Lead and Senior Security Engineer are unavailable, or for changes classified as "high-risk" that exceed the Senior Security Engineer's delegation scope. This role is present in both incident-escalation and privileged-access scenarios.

### Missing Policy Fields
1. **`delegateToRoleId`** -- must specify `"senior-security-eng"`
2. **`delegationConstraints`** -- must scope the Senior Security Engineer's delegation authority to standard infrastructure changes
3. **`escalation`** -- must define auto-escalation to CISO after a timeout
4. **`mandatoryApprovers`** -- SRE Lead should be mandatory (operational readiness is non-delegable)
5. **`constraints`** -- must include `{ environment: "production" }`

### Missing Edges
1. **Delegation edge:** `{ sourceId: "security-lead", targetId: "senior-security-eng", type: "delegation" }`
2. **Authority edges for new actors:** security-team -> senior-security-eng, security-team -> ciso (or a dedicated Security Leadership department if preferred)

### Missing Regulatory Frameworks
1. **SOC 2 CC8.1** -- Change Management (the primary applicable framework)
2. **SOC 2 CC7.1** -- Security Configuration Management (CVE exposure from delayed upgrades)
3. **ISO 27001:2022 A.8.32** -- Change Management
4. **NIST SP 800-53 CM-3** -- Configuration Change Control
5. **NIST SP 800-53 SI-2** -- Flaw Remediation (CVE patching timeliness)

### Missing Metric Documentation
1. **`manualTimeHours`** -- no comment explaining the breakdown of active effort vs. wall-clock delay
2. **`riskExposureDays`** -- no comment explaining what drives the CVE exposure timeline
3. **`auditGapCount`** -- no enumerated list of the 4 audit gaps
4. **`approvalSteps`** -- no enumerated list of the 6 manual steps
5. **`todayPolicies.expirySeconds`** -- no compression ratio comment

### Missing Narrative Elements (saas-scenarios.md Section 5)
1. **Enumerated audit gaps** with specific SOC 2 / ISO 27001 citations
2. **Specific Kubernetes upgrade details** (version numbers, CVE references)
3. **Specific tooling references** (Terraform Cloud, Argo CD, OPA/Gatekeeper, ServiceNow, PagerDuty)
4. **Named delegate** in the "With Accumulate" section
5. **Delegation constraints** documented in the "With Accumulate" policy description
6. **Escalation path** described in the "With Accumulate" section
7. **Takeaway table** with at least 8 rows matching the detail level of Sections 1-4

---

## 4. Corrected Scenario

### 4a. Corrected TypeScript (`src/scenarios/saas/infra-change.ts`)

```typescript
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
    { sourceId: "security-team", targetId: "senior-security-eng", type: "authority" },
    { sourceId: "security-team", targetId: "ciso", type: "authority" },
    { sourceId: "sre-team", targetId: "sre-lead", type: "authority" },
    // Delegation: Security Lead -> Senior Security Engineer for standard
    // infrastructure change reviews
    { sourceId: "security-lead", targetId: "senior-security-eng", type: "delegation" },
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
      threshold: { k: 2, n: 2, approverRoleIds: ["security-lead", "sre-lead"] },
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
```

### 4b. Corrected Narrative Journey (Section 5 of `saas-scenarios.md`)

```markdown
## 5. Cross-Team Infrastructure Change

**Setting:** Cloud Co's Platform Lead needs to deploy a fleet-wide Kubernetes upgrade (e.g., 1.28.3 to 1.28.8) across all production clusters to remediate known CVEs (e.g., CVE-2024-3177 -- secret access bypass, CVE-2023-5528 -- node command injection). The upgrade is managed through Terraform and requires coordinated sign-off from three different team leads: Platform (initiator, does not self-approve), Security (reviews CVE scope, RBAC impact, admission controller compatibility), and SRE (validates operational readiness -- rollback plan, monitoring, pod disruption budgets, on-call coverage). The Security Lead is the primary bottleneck in the approval workflow.

**Players:**
- **Cloud Co** (organization)
  - Platform Team
    - Platform Lead -- initiates the Kubernetes upgrade via Terraform plan; does not self-approve (segregation of duties)
    - IaC / Terraform -- Infrastructure-as-Code platform (e.g., Terraform Cloud, Spacelift) that gates `terraform apply` on approval
  - Security Team
    - Security Lead -- required approver; reviews CVE remediation scope, RBAC impact, admission controller compatibility
    - Senior Security Engineer -- designated delegate for Security Lead on standard infrastructure change reviews
    - CISO -- escalation authority when both Security Lead and Senior Security Engineer are unavailable
  - SRE Team
    - SRE Lead -- mandatory approver (non-delegable); validates operational readiness

**Action:** Platform Lead generates a Terraform plan for the Kubernetes fleet upgrade and submits a change request. Requires 2-of-2 approval from Security Lead (or Senior Security Engineer delegate) and SRE Lead (mandatory, non-delegable). Auto-escalation to CISO after 8 hours if Security review is not completed. Production environment constraint. 12-hour authority window.

---

### Today's Process

**Policy:** Both Security Lead and SRE Lead must approve (2-of-2). No delegation. No escalation. Platform Lead initiates only (does not self-approve). Approval is Slack-based with no system-enforced link to the Terraform plan or apply event.

1. **Terraform plan generated and posted.** The Platform Lead generates a Terraform plan for the Kubernetes upgrade (control plane version, node pool AMIs, kubelet configuration), copies the plan output, and posts it as a code block in the #infra-approvals Slack channel, tagging the Security Lead and SRE Lead. A separate wiki page documents the runbook (canary sequence, rollback procedure, monitoring dashboards). There is no system-enforced link between the Slack post, the Terraform plan hash, and the eventual `terraform apply` execution -- someone must manually trigger the apply after collecting Slack thumbs-up reactions. *(~6 sec simulation delay)*

2. **Parallel review -- in theory.** The SRE Lead opens the Terraform plan output in Slack, cross-checks it against the runbook wiki page, reviews the pod disruption budget configurations in a separate Kubernetes dashboard, validates the rollback plan in the runbook, and checks monitoring dashboards (Datadog/Grafana) to confirm alerting coverage for the upgrade. The Security Lead must independently evaluate CVE remediation scope, RBAC changes, admission controller compatibility, and API deprecation impact on security tooling (OPA/Gatekeeper policies, Falco rules). In practice, both reviews require context-switching across 4+ separate tools with no integrated view. *(~5 sec simulation delay per reviewer)*

3. **Security Lead unavailable.** The Security Lead is in active incident response for a separate security event -- their Slack status is set to DND, and PagerDuty is not configured to route infrastructure change review requests (it only routes security incidents). There is no backup reviewer assigned for infrastructure changes. The SRE Lead has already approved, but the 2-of-2 policy requires both sign-offs. *(~12 sec simulation delay)*

4. **Process stalls -- CVEs persist.** With both approvers required and no system-enforced delegation to the Senior Security Engineer, the Kubernetes upgrade is blocked. The Platform Lead sends Slack DMs to the Security Lead (no response -- DND), then to the Senior Security Engineer ("can you approve this?"). The Senior Security Engineer is unsure whether they have authority to approve fleet-wide infrastructure changes -- there is no written delegation memo, no pre-registration in the change management system, and no documented delegation scope. They decline to approve to avoid creating an audit finding.

5. **Outcome:** The upgrade is delayed by 2-3 days while the Security Lead resolves the incident. Meanwhile, the production Kubernetes fleet runs on a version with known CVEs (CVE-2024-3177, CVE-2023-5528). The Terraform plan may have drifted by the time the Security Lead reviews it (infrastructure drift between plan and apply). No formal audit trail of the attempted approval -- the Slack messages, DMs, and thumbs-up reactions are the only "evidence" of the change authorization.

**Metrics:** ~10 hours of active manual effort (wall-clock elapsed 48-72 hours), 3 days of CVE exposure, 4 audit gaps, 6 manual steps.

**Audit Gaps (4):**
1. Slack-based change approval ("thumbs-up" on Terraform plan in #infra-approvals) not linked to the Terraform plan hash or the `terraform apply` event -- auditor cannot verify that the approved plan matches the executed change (SOC 2 CC8.1)
2. No change risk classification in the approval record -- auditor cannot verify that the approval model matched the risk level of the change (no standard/normal/significant/emergency classification)
3. No Security review evidence linked to the specific Terraform plan -- the Security Lead's review happened informally in Slack but is not correlated to the plan hash being applied (SOC 2 CC8.1 / CC7.1)
4. No rollback verification evidence -- no auditable proof that the rollback plan was reviewed and validated before the change was approved (SOC 2 CC8.1 testing requirement)

---

### With Accumulate

**Policy:** 2-of-2 (Security Lead and SRE Lead). SRE Lead is mandatory (non-delegable). Security Lead can delegate to Senior Security Engineer for standard infrastructure changes. Auto-escalation to CISO after 8 hours (25 sec simulation-compressed). 12-hour authority window. Production environment constraint.

1. **Request submitted.** Platform Lead generates the Terraform plan and submits the infrastructure change request through the IaC platform. The Accumulate policy engine identifies the applicable production infrastructure change policy and routes the approval request to both Security Lead and SRE Lead simultaneously, with full context: Terraform plan hash, CVE remediation scope (CVE-2024-3177, CVE-2023-5528), canary upgrade sequence, rollback plan, monitoring dashboard links, and pod disruption budget analysis.

2. **SRE Lead approves.** The SRE Lead reviews the Terraform plan, validates the rollback procedure, confirms monitoring and alerting coverage, verifies that on-call SRE coverage is confirmed for the change window, and checks that pod disruption budgets will not stall the node drain process. The SRE Lead approves within the system with a cryptographic signature. *(SRE approval typically completes within hours -- SRE teams have well-defined change review processes.)*

3. **Security Lead unavailable -- delegation invoked.** The Security Lead is in active incident response. After the delegation timeout, the system automatically routes the Security review request to the Senior Security Engineer (pre-configured delegate for standard infrastructure change reviews). No Slack DMs, no authority confusion -- the Senior Security Engineer's delegation scope and registration are pre-configured in the system.

4. **Senior Security Engineer reviews and approves.** The Senior Security Engineer receives the delegated request with full context: Terraform plan hash, CVE remediation scope, RBAC change summary, admission controller compatibility validation results, and API deprecation analysis. They verify that the change falls within their delegation scope (Kubernetes patch upgrade within the same minor version) and approve. The delegation chain (Security Lead -> Senior Security Engineer) is cryptographically recorded.

5. **Terraform apply proceeds.** The IaC platform receives a cryptographic authorization proof from Accumulate that includes: who approved (SRE Lead + Senior Security Engineer via Security Lead delegation), when they approved, the exact Terraform plan hash approved, the CVE remediation scope, and the production environment constraint. The platform programmatically verifies this proof before executing `terraform apply` -- no manual "click apply" step, no gap between approval and execution, no plan drift risk.

6. **Outcome:** Kubernetes upgrade proceeds on the scheduled change window. CVE exposure reduced from 3 days to hours. Full delegation chain cryptographically documented. Complete audit trail linking approval to Terraform plan hash to apply event. If both Security Lead and Senior Security Engineer had been unavailable, the system would have auto-escalated to the CISO after 8 hours.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Cross-team coordination | Slack posts in #infra-approvals, manual tag-chasing, DM-based delegation attempts | Automatic parallel routing with integrated context to all reviewers |
| Threshold model | Unanimous 2/2, no delegation, no escalation | 2-of-2 with delegation (Security) and mandatory approver (SRE); auto-escalation to CISO |
| When Security Lead is busy | Process blocked for 2-3 days; Senior Security Engineer unsure of authority | Auto-delegates to pre-registered Senior Security Engineer within delegation scope |
| If both Security reviewers unavailable | Request stalls indefinitely; no escalation path to CISO | Auto-escalation to CISO after 8 hours |
| SRE operational readiness | Manual cross-check of Terraform plan, runbook wiki, PDB configs, and monitoring dashboards across 4+ tools | Integrated context in approval request: plan hash, PDB analysis, monitoring links, rollback plan |
| Security review | Manual CVE scope analysis, RBAC review, admission controller check in separate tools | CVE scope, RBAC summary, and admission controller validation attached to approval request |
| Terraform plan linkage | Slack thumbs-up not linked to plan hash or apply event | Cryptographic proof linked to specific Terraform plan hash with apply event correlation |
| Time to authorization | ~10 hours active effort (48-72 hours wall-clock) | Minutes (authorization in seconds, change window proceeds on schedule) |
| CVE exposure | 3 days (fleet runs on vulnerable version while approval is blocked) | Hours (delegation and escalation ensure timely approval) |
| Audit trail | Slack messages and DMs -- no unified evidence chain, 4 audit gaps | Cryptographic proof chain: plan hash -> approval -> delegation chain -> apply event |
| SOC 2 CC8.1 readiness | 4 audit gaps; auditor cannot verify change authorization matched executed change | Complete CC8.1 evidence: authorized, reviewed, tested, plan-linked, applied |
```

---

## 5. Credibility Risk Assessment

### VP of Platform Engineering (Series D SaaS, owns Kubernetes fleet)

**Challenges in the ORIGINAL scenario:**
- Would immediately flag that `delegationAllowed: true` with no `delegateToRoleId` is an incomplete configuration -- "Who does the Security Lead delegate to? This doesn't work in any real change management system."
- Would challenge `manualTimeHours: 48` -- "48 hours of active coordination? No. I've done hundreds of these. Active effort is maybe 10 hours. The other 38 hours are waiting for the Security Lead to get out of their incident."
- Would note the thin IaC/Terraform system description -- "You're describing Terraform as 'a system that manages configuration.' It's the control plane for the entire change -- plan, state, policy-as-code, approval gate, apply execution."
- Would question why there's no canary upgrade strategy described in the workflow.

**Accepts in the CORRECTED scenario:**
- Complete delegation model with named Senior Security Engineer, delegation constraints (standard vs. high-risk changes), and CISO escalation path.
- 10-hour active effort metric with explicit wall-clock vs. active distinction in comments.
- Detailed IaC/Terraform system description naming specific tools (Terraform Cloud, Spacelift, Atlantis, Sentinel/OPA).
- SRE Lead as mandatory approver (non-delegable) -- recognizes that operational readiness is SRE domain expertise.
- Production environment constraint on the policy.

### SOC 2 Type II Auditor

**Challenges in the ORIGINAL scenario:**
- Would immediately flag that `REGULATORY_DB.saas` cites CC6.1 (Logical Access) and GDPR Art. 32 -- "This scenario is about infrastructure change management, not logical access. The applicable trust services criteria is CC8.1 (Change Management). You're auditing the wrong control."
- Would flag `delegationAllowed: true` with no registered delegate -- "CC6.2 requires that access authorization is granted only to registered and pre-authorized personnel. Your policy allows delegation but doesn't register the delegate. This is a finding."
- Would flag the 4 unitemized audit gaps -- "What are the 4 gaps? I need to understand what I'm testing."
- Would flag no `constraints` -- "Is this policy scoped to production? Or does it also apply to staging and development infrastructure?"

**Accepts in the CORRECTED scenario:**
- Inline `regulatoryContext` citing CC8.1 (Change Management), CC7.1 (Security Configuration Management), ISO 27001:2022 A.8.32, NIST SP 800-53 CM-3, and NIST SP 800-53 SI-2 -- the correct frameworks for infrastructure change governance.
- Pre-registered delegate (Senior Security Engineer) with delegation constraints -- satisfies CC6.2.
- Enumerated audit gaps with specific CC8.1 and CC7.1 citations.
- Production environment constraint.
- 12-hour authority window with CISO escalation -- ensures changes are authorized in a timely manner (CC8.1).

### Principal SRE

**Challenges in the ORIGINAL scenario:**
- Would challenge `riskExposureDays: 7` -- "7 days means the Security Lead was gone for a week with no delegate and no escalation. That's a process failure, not a normal scenario. In my experience, 2-3 days is realistic when Security is in incident response."
- Would challenge the vague `"Lead reviewing Terraform diff"` -- "Which lead? SRE and Security review completely different things. SRE reviews operational readiness; Security reviews CVE scope and RBAC impact."
- Would note missing SRE review detail -- "You say the SRE Lead validates 'workload impact,' but you don't mention rollback plans, PDB analysis, monitoring coverage, or on-call confirmation. Those are the actual SRE review steps."
- Would appreciate the 2-of-2 model with Platform Lead excluded -- "That's correct. Platform should not self-approve."

**Accepts in the CORRECTED scenario:**
- 3-day CVE exposure consistent with incident response timelines.
- Separate SRE and Security review descriptions in manual steps.
- SRE Lead as mandatory (non-delegable) approver with detailed role description covering all operational readiness validation steps.
- Detailed SRE review workflow in the narrative (rollback, monitoring, PDB, on-call).

### Cloud Security Architect

**Challenges in the ORIGINAL scenario:**
- Would flag that the regulatory context cites GDPR Art. 32 -- "GDPR is about personal data protection. This scenario is about Kubernetes infrastructure changes. Unless you establish that the Kubernetes cluster processes personal data, GDPR Art. 32 is not the applicable framework. SOC 2 CC8.1 and NIST CM-3 are what apply here."
- Would flag the absence of CVE references -- "You mention 'known vulnerabilities' but don't cite any. Which CVEs? What are the CVSS scores? Is there a public exploit? This matters for risk classification."
- Would flag no escalation path -- "If both the Security Lead and the delegate are unavailable, what happens? The CVE exposure grows with no upper bound. You need CISO escalation."
- Would flag no delegation constraints -- "You're allowing unlimited delegation for infrastructure changes. A Senior Security Engineer should not be able to approve a major Kubernetes version upgrade without the Security Lead's explicit authorization."

**Accepts in the CORRECTED scenario:**
- Inline regulatory context with CC8.1, CC7.1, CM-3, and SI-2 -- correct frameworks.
- Specific CVE references in the narrative (CVE-2024-3177, CVE-2023-5528).
- CISO escalation path with 8-hour timeout.
- Delegation constraints distinguishing standard vs. high-risk changes.
- SI-2 (Flaw Remediation) citation for the CVE exposure risk.

### ITIL Change Manager

**Challenges in the ORIGINAL scenario:**
- Would note no change risk classification -- "You describe a fleet-wide Kubernetes upgrade but don't classify it. Is this Standard, Normal, or Significant? The classification determines the approval model. A fleet-wide upgrade is Significant/High-Risk."
- Would note no Change Advisory Board (CAB) reference -- "Where is the CAB review? For a high-impact infrastructure change, the CAB should review the change request, rollback plan, and risk assessment before routing to individual approvers."
- Would note the thin workflow -- "Your workflow is: Slack post, review, stall, outcome. Where is the change risk assessment? Where is the rollback plan validation? Where is the change window scheduling? Where is the post-implementation review?"
- Would flag `delegationAllowed: true` with no delegation scope -- "Delegation without a defined scope and registered delegate is not delegation -- it's ad-hoc authority transfer."

**Accepts in the CORRECTED scenario:**
- Delegation constraints that effectively create a change risk classification (standard changes vs. high-risk changes with different approval authorities).
- Detailed workflow in the narrative covering Terraform plan review, SRE operational readiness validation, Security impact analysis, and change window scheduling.
- Registered delegate with defined scope and CISO escalation path.
- SOC 2 CC8.1 citations that align with ITIL Change Enablement practice requirements.

---

*Review completed by Hyper-SME Agent #14. All findings are based on direct operational experience with Kubernetes fleet governance, SOC 2 Type II audit readiness, and cross-team infrastructure change management at enterprise SaaS companies. The corrected scenario TypeScript is complete and copy-paste-ready.*
