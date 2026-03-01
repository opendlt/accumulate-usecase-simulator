# SaaS Industry — Scenario Journeys

> **Note:** Metrics cited in these scenarios (delay hours, risk exposure days, audit gap counts) are illustrative estimates based on industry-typical patterns. Actual values vary by organization, infrastructure complexity, and compliance requirements. They are intended to demonstrate relative improvement, not to serve as benchmarks.

## 1. Vendor Access Request

**Setting:** Vendor Corp needs to perform scheduled maintenance on Acme Technologies' production application infrastructure. A Vendor Engineer must request read-write access that crosses organizational boundaries -- requiring TPRM compliance validation, multi-party approval from three named individuals, and access provisioning through the PAM system.

**Players:**
- **Vendor Corp** (external vendor organization)
  - Vendor Engineer -- the person requesting access and performing the maintenance work
- **Acme Technologies** (customer organization)
  - Security / GRC Department
    - Security Analyst -- reviews vendor risk posture, least-privilege scope, and risk classification
  - IT Operations Department
    - IT Ops Manager -- validates technical scope, connectivity method, and maintenance time window
  - Vendor Relationship Manager -- business owner for the vendor contract; confirms work is authorized under the active SOW
  - PAM System -- provisions just-in-time credentials, records sessions, enforces time-bound access

**Action:** Vendor Engineer requests read-write access to Acme Technologies' production application infrastructure for a scheduled maintenance window.

---

### Today's Process

**Policy:** All 3 of 3 must approve (Security Analyst, IT Ops Manager, Vendor Relationship Manager). No delegation allowed. Short practical approval windows constrained by the maintenance window deadline.

1. **Request submitted.** The Vendor Engineer submits an access request through Acme's ServiceNow vendor intake portal, specifying the target systems, access level (read-write), maintenance window, and justification.

2. **TPRM compliance check.** The TPRM team validates the vendor's compliance status in ServiceNow VRM: active NDA, contract scope covers production system access, insurance certificate current, most recent SOC 2 Type II report within validity period. This is a status verification -- not a full legal review -- but it is manual and often delayed by 1-2 hours while the analyst locates and cross-references the relevant documents across the TPRM platform. *(~10 sec simulation delay)*

3. **Approvals routed asynchronously.** An email notification is sent to the Security Analyst, IT Ops Manager, and Vendor Relationship Manager requesting sign-off. Each must independently open the request in ServiceNow, review the scope, validate their area of responsibility, and record their approval. The three approvers are in different time zones; each reviews in a separate system (the Security Analyst checks the vendor's risk classification in OneTrust, the IT Ops Manager checks the infrastructure topology in the CMDB, the Vendor Relationship Manager checks the SOW in the contract management system). *(~8 sec simulation delay per approver)*

4. **Vendor Relationship Manager unavailable.** The Vendor Relationship Manager is traveling internationally and does not see the email for 14 hours. There is no system-enforced delegation mechanism -- the VRM informally told a colleague to "cover for me," but the colleague has no formal authority in ServiceNow, and the Security Analyst and IT Ops Manager hesitate to proceed with only 2-of-3 approvals because the policy requires unanimous sign-off. *(~12 sec simulation delay)*

5. **Manual provisioning attempt.** Even if approvals were obtained, the IT Ops Manager must manually configure PAM credentials -- creating a time-bound session in CyberArk, setting up the VPN tunnel or bastion host access, configuring session recording, and sending credentials to the Vendor Engineer via a secure channel. This takes 30-60 minutes.

6. **Post-maintenance gap.** After the maintenance is complete (or after the window passes), someone must manually terminate the PAM session and revoke the VPN access. If the IT Ops Manager forgets -- or if the maintenance extends beyond the original window -- the vendor retains standing access until someone notices.

7. **Outcome:** The maintenance window passes. The Vendor Engineer sits idle, billing hours. The request eventually expires, and the entire process must restart -- new request, new TPRM validation, new 3-of-3 approval cycle -- when the Vendor Relationship Manager returns or the next maintenance window is scheduled. Meanwhile, the system that needed maintenance remains unpatched, creating risk exposure.

**Metrics:** ~36 hours elapsed wall-clock time (6-8 hours active manual effort), 3 days of risk exposure (unpatched system), 5 audit gaps, 7 manual steps.

**Audit Gaps (5):**
1. Approval recorded in email/Slack, not linked to the access event in the PAM system
2. No system-enforced link between the ServiceNow approval and the actual PAM session
3. Access duration not enforced automatically -- no system-enforced session termination at maintenance window closure
4. No evidence that vendor NDA/contract/insurance status was verified at the time of this specific access request (TPRM check happened but is not linked to the access event)
5. No session recording or command-level audit trail for the vendor's actions during the access window (or recording exists in PAM but is not linked to the approval record)

---

### With Accumulate

**Policy:** 2-of-3 threshold (Security Analyst mandatory, plus IT Ops Manager or Vendor Relationship Manager). Delegation allowed (Vendor Relationship Manager can delegate to IT Ops Manager for pre-approved maintenance windows). 8-hour authority window aligned with maintenance duration.

1. **Request submitted.** Vendor Engineer submits the access request. The Accumulate policy engine automatically identifies the applicable policy for cross-org production access and validates the vendor's compliance status via TPRM platform integration (NDA active, contract in scope, insurance current, SOC 2 report valid).

2. **Policy routes approvals in parallel.** The system simultaneously routes the request to all three approvers (Security Analyst, IT Ops Manager, Vendor Relationship Manager) with full context attached -- target systems, access level, environment constraints, maintenance time window, vendor compliance status, and risk classification.

3. **Threshold met.** The Security Analyst (mandatory approver) and IT Ops Manager both approve. Since the policy requires 2-of-3 with Security as mandatory, the threshold is satisfied -- no need to wait for the Vendor Relationship Manager. If the IT Ops Manager were unavailable instead, the system would route to the Vendor Relationship Manager. If the Vendor Relationship Manager were needed but unavailable, the system would automatically invoke the pre-configured delegation to the IT Ops Manager (for pre-approved maintenance windows only).

4. **Authorization granted; PAM provisions access.** The Accumulate authorization decision is issued in seconds -- a cryptographic proof capturing who approved, when, under what policy, the exact scope granted, and the vendor's compliance status at the time of approval. The PAM system receives the signed authorization and provisions just-in-time credentials with session recording enabled and an 8-hour automatic expiry.

5. **Automatic expiry and audit closure.** At the end of the 8-hour window, the PAM session is automatically terminated regardless of whether the maintenance is complete. The access event is closed in the audit trail with a complete chain: request -> TPRM validation -> approval decision -> PAM session -> session recording -> automatic termination.

**Outcome:** Authorization decision in seconds; access provisioned via PAM within minutes. Full audit trail linking approval to session to outcome. Automatic expiry eliminates access revocation gaps. No stalled maintenance windows.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Approval model | Unanimous 3/3 from named individuals, no delegation | 2-of-3 threshold (Security mandatory), delegation enabled |
| Approver identity | Departments listed as approvers; no traceable individual authorization | Named roles (Security Analyst, IT Ops Manager, VRM) with cryptographic signatures |
| When someone is unavailable | Process stalls completely -- informal delegation has no system authority | Threshold still met, or delegation auto-routes to designated backup |
| Time to authorization | ~36 hours elapsed (6-8 hours active effort) | Seconds (authorization); minutes (PAM provisioning) |
| Access revocation | Manual -- IT Ops must remember to terminate session | Automatic 8-hour expiry enforced by PAM integration |
| Audit trail | Fragmented across email, ServiceNow, PAM, TPRM -- no single system links approval to session | Cryptographic proof chain: request -> TPRM validation -> approval -> PAM session -> termination |
| SOC 2 readiness | 5 audit gaps; qualified report risk | CC6.1-CC6.3 evidence requirements satisfied by default |
| Risk | Maintenance windows missed; vendor idle; unpatched systems | Controlled access, automatic expiry, verifiable audit trail |

---

## 2. Incident Escalation

**Setting:** An active Sev1 security incident is underway at Nexus Cloud. An attacker has gained access to the production environment and the SOC has detected the intrusion via SIEM correlation rules. The SRE On-Call engineer needs to make an emergency firewall rule change to block the attacker's command-and-control IP — but the privileged credentials for the firewall management plane are locked behind PAM, and the Incident Commander who must authorize the break-glass checkout is simultaneously running the incident response in the war room.

**Players:**
- **Nexus Cloud** (organization)
  - SRE Department
    - SRE On-Call Engineer — executes the emergency firewall rule change after receiving PAM credentials
  - SOC (Security Operations Center)
    - SOC Analyst — triages the SIEM alert, classifies as Sev1, initiates incident response
    - Incident Commander — authorizes break-glass PAM credential checkout; can delegate to CISO
  - CISO — executive escalation when IC is unreachable

**Action:** SRE On-Call Engineer requests emergency PAM credential checkout to modify production firewall rules during an active Sev1 intrusion. Requires 1-of-1 approval from the Incident Commander with a 30-minute authority window. Auto-escalation to CISO if IC does not respond within 5 minutes.

---

### Today's Process

**Policy:** 1-of-1 approval from Incident Commander (in practice, the SOC Manager or on-call Security Lead acting as IC). No delegation allowed. PAM approval request times out if no response. Escalation is manual — someone must call the CISO.

1. **SIEM alert fires.** Splunk Enterprise Security triggers a high-fidelity correlation rule: command-and-control beaconing detected from a production application server to a known malicious IP. The SOC Analyst on the monitoring console triages the alert and classifies it as Sev1 — confirmed active intrusion.

2. **Incident Commander engaged.** The SOC Analyst pages the on-call Incident Commander (the SOC Manager) via PagerDuty. The IC is at dinner with phone on silent — PagerDuty escalates to the secondary IC after 5 minutes. The secondary IC acknowledges and joins the war room Slack channel. *(~10-15 minutes elapsed)*

3. **IC authorizes break-glass, SRE requests PAM access.** The IC directs the SRE On-Call engineer to block the C2 IP via an emergency firewall rule. The engineer submits a PAM credential checkout request in CyberArk for the firewall admin account. CyberArk requires the IC to log into the PAM console and approve the request. The IC is managing the war room, coordinating with the SOC Analyst on IOC collection, and fielding Slack messages from the VP of Engineering — and now must also navigate to CyberArk to approve a PAM request. *(~10-20 minutes elapsed for IC to context-switch and approve)*

4. **PAM checkout and firewall change.** The IC approves the PAM request. CyberArk provisions a time-bound session. The SRE On-Call engineer connects to the Palo Alto Panorama management plane, creates the block rule, and commits. The rule propagates across the firewall cluster. *(~3-5 minutes for checkout, connection, rule creation, commit, and propagation)*

5. **Outcome:** Total time from SIEM alert to C2 IP blocked: 30-90 minutes depending on IC availability. During this time, the attacker maintained active command-and-control access to the production server. The authorization trail is fragmented: the SIEM alert is in Splunk, the PagerDuty pages are in PagerDuty, the PAM approval is in CyberArk, the firewall change is in Panorama logs, and the war room decisions are in Slack messages. Correlating "this alert triggered this page which led to this credential checkout which resulted in this rule change" requires manual reconstruction during the post-incident review — often 2-3 days later, by which time engineer recollections have faded.

**Metrics:** ~1.5 hours of delay (worst case), ~6 hours of risk exposure (detection through verified containment), 4 audit correlation gaps (SIEM-to-PagerDuty, PagerDuty-to-PAM, PAM-to-firewall, no unified timeline), 4 manual approval steps.

---

### With Accumulate

**Policy:** 1-of-1 approval from Incident Commander. Delegation to CISO allowed. Auto-escalation to CISO after 5 minutes (20 seconds simulation-compressed). 30-minute authority window. Production environment constraint.

1. **SIEM alert fires, SOC Analyst triages as Sev1.** Same detection workflow — Accumulate does not replace the SIEM or SOC monitoring function. The SOC Analyst classifies the incident as Sev1.

2. **Break-glass request submitted.** The SRE On-Call engineer submits the emergency firewall access request through Accumulate. The policy engine recognizes the break-glass pattern: Sev1 incident, production environment, firewall admin credential — and routes the approval to the Incident Commander.

3. **IC approves via Accumulate — no PAM console context-switch.** The IC receives the approval request in the same interface where they are coordinating the response. One approval action authorizes the PAM credential checkout. If the IC is unavailable, Accumulate automatically escalates to the CISO after 5 minutes — no manual phone trees, no searching for the CISO's mobile number, no leaving voicemails.

4. **Cryptographic proof chain generated.** Every action — the SIEM alert linkage, the Sev1 classification, the break-glass request, the IC approval (or CISO escalation), the 30-minute authority window, the credential scope — is captured in a single cryptographic proof. This proof chain is the unified audit trail that does not exist in the fragmented today-state.

5. **Firewall change executed.** PAM credential checkout proceeds automatically upon Accumulate authorization. The SRE On-Call engineer connects to Panorama, creates the block rule, and commits. Total time from SIEM alert to C2 IP blocked: under 10 minutes. Authorization completed in seconds; implementation completed in minutes.

6. **Post-incident review.** The 30-minute authority window expires automatically. All break-glass access is flagged for mandatory review. The cryptographic proof chain provides the unified timeline that the post-mortem team needs — no manual reconstruction across 4 disconnected systems.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Alert-to-authorization | IC must context-switch to PAM console during active incident | IC approves in-line; policy engine routes automatically |
| When IC is unavailable | Manual phone-tree escalation to CISO — 15-30 minutes | Auto-escalation to CISO after 5 minutes |
| Time to containment | 30-90 minutes (IC availability dependent) | Under 10 minutes |
| Authority window | PAM session with no clear scope or expiry | 30-minute window, production-scoped, auto-revoke |
| Post-incident audit | Fragmented across SIEM, PagerDuty, PAM, and firewall logs — manual reconstruction | Unified cryptographic proof chain linking alert to authorization to change |
| SOC 2 CC7.4 evidence | Scattered records requiring auditor to correlate 4 systems | Single proof chain satisfying incident response documentation requirements |

---

## 3. Production Release Approval

**Setting:** SaaS Co's Release Engineer needs to deploy a release candidate to production. The CI/CD pipeline requires sign-off from the QA Lead and Engineering Manager before the production deployment job can proceed. Today, approvals are coordinated via Slack channel posts and Jira ticket updates with no system-enforced link between the approval record and the release artifact (container image SHA, Git commit hash). When the QA Lead is unavailable, there is no system-enforced delegation to a backup -- the release is delayed to the next deployment cycle.

**Players:**
- **SaaS Co** (organization)
  - Engineering Department
    - Engineering Manager -- required approver; reviews release scope, changelog, and deployment timing
    - Release Engineer -- initiates the deployment request and coordinates the approval workflow
    - CI/CD Pipeline -- the deployment system that gates production deployment on approval policy
  - QA Team
    - QA Lead -- required approver; verifies automated test results, staging health, and monitoring dashboards
    - Senior QA Engineer -- designated delegate for QA Lead on release approvals

**Action:** Release Engineer requests approval to deploy the release candidate to production. Requires 2-of-2 sign-off from QA Lead and Engineering Manager. QA Lead can delegate to Senior QA Engineer for standard releases. Auto-escalation to Senior QA Engineer if QA Lead does not respond within the escalation SLA. Production environment constraint.

---

### Today's Process

**Policy:** 2-of-2 required (QA Lead + Engineering Manager). No delegation allowed. No system-enforced link between Slack/Jira approval and CI/CD deployment.

1. **Release posted.** The Release Engineer posts the approval request in the #releases Slack channel with a changelog link and creates a Jira ticket for tracking. There is no system-enforced connection between this Slack post and the CI/CD pipeline -- someone must manually trigger the production deployment after seeing approvals in Slack. *(~6 sec simulation delay)*

2. **Manual verification.** The QA Lead opens separate browser tabs to check the CI dashboard for test suite results, manually verifies the staging deployment health, and checks monitoring dashboards (Datadog, Grafana) for anomalies. This is a context-switching exercise across 3+ separate tools with no integrated view. The Engineering Manager reviews the changelog in Jira against the planned release scope. *(~6 sec simulation delay)*

3. **QA Lead unavailable.** The QA Lead is in a sprint retrospective with Slack notifications muted. The Release Engineer starts DMing colleagues to find someone who can approve. There is no system-enforced delegation to the Senior QA Engineer -- the Senior QA Engineer is not sure if they have authority to approve, and the Release Engineer does not want to risk an audit finding by proceeding without the QA Lead's explicit sign-off. *(~10 sec simulation delay)*

4. **Release bottleneck.** Without both required approvals, the Release Engineer cannot trigger the production deployment. The deployment window passes. The release is pushed to the next cycle -- typically the next day or the next scheduled deployment window.

5. **Outcome:** Release candidate deployment delayed. Security patch remains undeployed for an additional 1-2 days. No formal record of why the release was blocked, who was contacted, or what the escalation path was. The Jira ticket shows "pending approval" but does not capture the Slack conversations, the QA verification results, or the specific artifact that was approved.

**Metrics:** ~5 hours of delay (elapsed wall-clock; ~1-2 hours active manual effort), 2 days of risk exposure (security patch undeployed), 5 audit gaps, 6 manual steps.

**Audit Gaps (5):**
1. Slack approval ("LGTM" in #releases) not linked to the CI/CD pipeline run or deployment ID
2. No artifact hash in the approval record -- the approval references a version number but not a specific container image SHA or Git commit
3. No verification that staging tests still passed at the time the production deployment was triggered (test results could have changed between QA verification and deployment)
4. No segregation-of-duties enforcement -- no system verification that the deployment approver did not author the code being deployed
5. No evidence linking the Slack/Jira approval to the specific deployment event in the CI/CD system

---

### With Accumulate

**Policy:** 2-of-2 required (QA Lead + Engineering Manager). QA Lead can delegate to Senior QA Engineer for standard releases. Auto-escalation to Senior QA Engineer after 4 hours (25 sec simulation-compressed). 12-hour authority window. Production environment constraint.

1. **Request submitted.** The Release Engineer submits the deployment approval request through the CI/CD pipeline. The Accumulate policy engine identifies the applicable production deployment policy and routes the request to both QA Lead and Engineering Manager simultaneously, with full context attached: automated test results, staging health status, changelog, release artifact hash, and monitoring dashboard links.

2. **Parallel approval with delegation.** The Engineering Manager reviews the changelog and approves. The QA Lead is in a meeting -- after 4 hours (25 seconds simulation-compressed) without response, the system automatically routes the request to the Senior QA Engineer (pre-configured delegate). No Slack DMs, no authority confusion, no manual escalation.

3. **Senior QA Engineer approves.** The Senior QA Engineer receives the delegated request with full context: test suite results, staging verification status, monitoring health, and the specific release artifact hash. They verify the automated results and approve within the system. The delegation chain (QA Lead -> Senior QA Engineer) is recorded in the authorization proof.

4. **CI/CD pipeline proceeds.** The deployment pipeline receives a cryptographic authorization proof from Accumulate that includes: who approved (Engineering Manager + Senior QA Engineer via QA Lead delegation), when they approved, the exact artifact hash approved, the test results at the time of approval, and the production environment constraint. The pipeline programmatically verifies this proof before triggering the production deployment -- no manual "click deploy" step, no gap between approval and deployment.

5. **Outcome:** Release candidate deployed on schedule. Delegation path documented with cryptographic proof. Complete audit trail linking approval to artifact to deployment event. Security patch in production within minutes of approval, not days.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Approval routing | Slack #releases channel post, manual DMs when someone is unavailable | Automatic parallel routing with delegation and escalation |
| When QA Lead is busy | Release blocked, no delegation, deployment window missed | Auto-delegates to Senior QA Engineer -- no authority confusion |
| Verification context | Manual checks across 3+ separate tools (CI dashboard, staging, monitoring) | Integrated context in approval request: test results, staging status, artifact hash |
| Artifact linkage | Slack "LGTM" not linked to container image SHA or Git commit | Cryptographic proof linked to specific artifact hash |
| Time to deploy | ~5 hours elapsed (security patch delayed 1-2 days) | Minutes (authorization in seconds, deployment proceeds automatically) |
| Audit trail | Fragmented across Slack, Jira, CI/CD -- no unified evidence chain | Cryptographic proof chain: request -> approval -> artifact -> deployment |
| SOC 2 CC8.1 evidence | 5 audit gaps; auditor cannot verify authorization matched deployment | Complete CC8.1 evidence: authorized, tested, approved, artifact-linked, deployed |

---

## 4. Privileged Database Access

**Setting:** A Database Admin at Tech Corp needs DDL-level access (CREATE INDEX) to the production database cluster for an emergency index creation to remediate a query performance degradation causing customer-facing latency spikes. The Platform Engineering Lead is the designated PAM approver, but they are offline. The Senior Platform Engineer is the intended delegate, but they are not pre-registered as an alternate approver in the PAM system.

**Players:**
- **Tech Corp** (organization)
  - Platform Team
    - Platform Engineering Lead -- primary PAM approver for production database access; currently unavailable
    - Senior Platform Engineer -- designated delegate; not pre-registered in PAM as an alternate approver (SOC 2 CC6.2 gap)
    - Database Admin -- the requestor; needs DDL privileges for emergency index creation
  - Security Department
    - CISO -- escalation authority if both Platform Engineering Lead and Senior Platform Engineer are unavailable
    - PAM System -- provisions just-in-time database credentials with DDL-scoped privileges, records sessions, enforces time-bound access

**Action:** Database Admin requests DDL-level access to the production database cluster for an emergency schema migration (CREATE INDEX to remediate customer-facing latency). Requires 1-of-1 approval from Platform Engineering Lead, with delegation to Senior Platform Engineer and auto-escalation to CISO.

---

### Today's Process

**Policy:** 1-of-1 from Platform Engineering Lead only. No delegation allowed in the PAM system. Short practical window.

1. **Jira ticket filed.** The Database Admin submits a DDL access request via a Jira ticket with the migration script, rollback plan, and a manual manager-approval field. The Jira ticket is not integrated with the PAM system -- the DBA must separately request PAM credential checkout after obtaining Jira approval. *(~6 sec simulation delay; represents 15-30 min real-world)*

2. **Platform Engineering Lead is offline.** The Platform Engineering Lead is not responding on Slack or PagerDuty. The Database Admin checks the PagerDuty on-call schedule, then Slack-DMs the Senior Platform Engineer: "Can you approve this? [Platform Engineering Lead] is offline and we have customer-facing latency." *(~8 sec simulation delay; represents 1-2 hours of Slack chasing and authority confusion)*

3. **Authority confusion.** The Senior Platform Engineer opens the PAM console and discovers they are not listed as an alternate approver. They genuinely do not know if they have authority. Options: (a) request IT Security to add them as an approver (takes hours and requires a separate ticket), (b) tell the DBA to use the break-glass override account (creates a larger audit gap), or (c) wait for the Platform Engineering Lead to come online. The Senior Platform Engineer checks their email for any delegation memo -- there is none in writing.

4. **Ad-hoc PAM override.** After 1-2 hours of back-and-forth, the Senior Platform Engineer asks IT Security to execute a PAM override for the DBA. The override grants "database admin" credentials -- broader than the DDL-only access the DBA needs (least-privilege violation). No session recording is configured for the override session. No automatic session termination. No scope constraint limiting access to the specific database cluster.

5. **Outcome:** 3 hours of delay from Jira ticket to DDL access. Customer-facing latency persists during the entire delay. The delegation chain is undocumented -- the Jira ticket says "approved by [Platform Engineering Lead]" but the Platform Engineering Lead never approved anything. The PAM override session is unrecorded. The DBA retains broad database credentials after the migration completes until someone manually revokes access.

**Metrics:** ~3 hours of delay, 1 day of risk exposure (customer-facing performance degradation), 4 audit gaps, 4 manual steps.

**Audit Gaps (4):**
1. Informal delegation not recorded in PAM -- the Platform Engineering Lead's delegation to the Senior Platform Engineer is a Slack DM with no auditable record in the PAM system (SOC 2 CC6.2 violation)
2. PAM override approval not linked to Jira ticket -- the access grant cannot be correlated to the business justification (SOC 2 CC6.1 gap)
3. No session recording during override -- every SQL command executed by the DBA during the migration is unaudited (ISO 27001:2022 A.8.2 gap)
4. No automatic session termination -- the DBA retains DDL access after the migration completes until someone manually revokes it (SOC 2 CC6.3 gap)

---

### With Accumulate

**Policy:** 1-of-1 from Platform Engineering Lead. Formal delegation to Senior Platform Engineer allowed (pre-registered in PAM with DDL-only scope constraint). Auto-escalation to CISO after 30 minutes if both are unavailable. 4-hour authority window. Production environment constraint.

1. **Request submitted.** Database Admin submits the DDL access request through Accumulate. The policy engine identifies the Platform Engineering Lead as the approver and validates the request against the production environment constraint and DDL scope.

2. **Platform Engineering Lead unavailable.** The system detects unavailability and automatically invokes the pre-configured delegation to the Senior Platform Engineer. No Slack chasing, no authority confusion -- the Senior Platform Engineer is pre-registered as an alternate approver with DDL-only delegation scope (SOC 2 CC6.2 satisfied).

3. **Senior Platform Engineer approves.** The Senior Platform Engineer receives the delegated request with full context: migration script, rollback plan, target database cluster, DDL scope (CREATE INDEX), and Jira ticket correlation. They approve within the system, and the delegation chain is cryptographically recorded: Platform Engineering Lead (unavailable) -> Senior Platform Engineer (delegate, DDL-scoped).

4. **PAM provisions DDL-scoped credentials.** The PAM system receives the Accumulate authorization and provisions just-in-time credentials with: (a) DDL-only privileges on the specific database cluster (no DML access to data tables), (b) full session recording with SQL command audit, (c) 4-hour automatic expiry with session termination, (d) scope constraint to the approved database cluster only.

5. **Automatic expiry and audit closure.** At the end of the 4-hour window, the PAM session is automatically terminated regardless of migration status. The access event is closed in the audit trail with a complete chain: Jira ticket -> Accumulate request -> delegation chain -> PAM session -> session recording -> automatic termination. Mandatory post-migration review is flagged.

**Outcome:** Authorization decision in seconds. DDL-scoped credentials provisioned via PAM within minutes. Full delegation chain cryptographically recorded. Session recorded with SQL command audit. Automatic 4-hour expiry. Zero authority confusion.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Delegation model | Ad-hoc Slack DM; delegate not registered in PAM (CC6.2 gap) | Pre-registered delegate with DDL-scoped delegation constraints |
| When Platform Engineering Lead is offline | Authority confusion, PagerDuty checking, PAM override workaround | System auto-delegates to pre-registered Senior Platform Engineer |
| If both approvers unavailable | Request stalls indefinitely; no escalation path | Auto-escalation to CISO after 30 minutes |
| Access scope | "Database admin" override credentials (broader than needed) | DDL-only privileges on specific database cluster (least privilege) |
| Session governance | No recording, no duration limit, no auto-revocation | Full SQL session recording, 4-hour expiry, automatic termination |
| Authority verification | Manual IAM console + Jira cross-check + Slack DM history | Embedded in approval request with cryptographic delegation chain |
| Time to access | ~3 hours | Minutes |
| Audit trail | 4 gaps: unregistered delegation, unlinked Jira/PAM, no session recording, no auto-revocation | Cryptographic proof chain: Jira ticket -> delegation -> approval -> PAM session -> recording -> termination |
| SOC 2 readiness | CC6.1-CC6.3 gaps across delegation, authorization, session governance, and access removal | CC6.1, CC6.2, CC6.3 evidence requirements satisfied by design |

---

## 5. Cross-Team Infrastructure Change

**Setting:** Cloud Co's Platform Lead needs to deploy a fleet-wide Kubernetes upgrade (e.g., 1.28.3 to 1.28.8) across all production clusters to remediate known CVEs (e.g., CVE-2024-3177 — secret access bypass, CVE-2023-5528 — node command injection). The upgrade is managed through Terraform and requires coordinated sign-off from three different team leads: Platform (initiator, does not self-approve), Security (reviews CVE scope, RBAC impact, admission controller compatibility), and SRE (validates operational readiness — rollback plan, monitoring, pod disruption budgets, on-call coverage). The Security Lead is the primary bottleneck in the approval workflow.

**Players:**
- **Cloud Co** (organization)
  - Platform Team
    - Platform Lead — initiates the Kubernetes upgrade via Terraform plan; does not self-approve (segregation of duties)
    - IaC / Terraform — Infrastructure-as-Code platform (e.g., Terraform Cloud, Spacelift) that gates `terraform apply` on approval
  - Security Team
    - Security Lead — required approver; reviews CVE remediation scope, RBAC impact, admission controller compatibility
    - Senior Security Engineer — designated delegate for Security Lead on standard infrastructure change reviews
    - CISO — escalation authority when both Security Lead and Senior Security Engineer are unavailable
  - SRE Team
    - SRE Lead — mandatory approver (non-delegable); validates operational readiness

**Action:** Platform Lead generates a Terraform plan for the Kubernetes fleet upgrade and submits a change request. Requires 2-of-2 approval from Security Lead (or Senior Security Engineer delegate) and SRE Lead (mandatory, non-delegable). Auto-escalation to CISO after 8 hours if Security review is not completed. Production environment constraint. 12-hour authority window.

---

### Today's Process

**Policy:** Both Security Lead and SRE Lead must approve (2-of-2). No delegation. No escalation. Platform Lead initiates only (does not self-approve). Approval is Slack-based with no system-enforced link to the Terraform plan or apply event.

1. **Terraform plan generated and posted.** The Platform Lead generates a Terraform plan for the Kubernetes upgrade (control plane version, node pool AMIs, kubelet configuration), copies the plan output, and posts it as a code block in the #infra-approvals Slack channel, tagging the Security Lead and SRE Lead. A separate wiki page documents the runbook (canary sequence, rollback procedure, monitoring dashboards). There is no system-enforced link between the Slack post, the Terraform plan hash, and the eventual `terraform apply` execution — someone must manually trigger the apply after collecting Slack thumbs-up reactions. *(~6 sec simulation delay)*

2. **Parallel review — in theory.** The SRE Lead opens the Terraform plan output in Slack, cross-checks it against the runbook wiki page, reviews the pod disruption budget configurations in a separate Kubernetes dashboard, validates the rollback plan in the runbook, and checks monitoring dashboards (Datadog/Grafana) to confirm alerting coverage for the upgrade. The Security Lead must independently evaluate CVE remediation scope, RBAC changes, admission controller compatibility, and API deprecation impact on security tooling (OPA/Gatekeeper policies, Falco rules). In practice, both reviews require context-switching across 4+ separate tools with no integrated view. *(~5 sec simulation delay per reviewer)*

3. **Security Lead unavailable.** The Security Lead is in active incident response for a separate security event — their Slack status is set to DND, and PagerDuty is not configured to route infrastructure change review requests (it only routes security incidents). There is no backup reviewer assigned for infrastructure changes. The SRE Lead has already approved, but the 2-of-2 policy requires both sign-offs. *(~12 sec simulation delay)*

4. **Process stalls — CVEs persist.** With both approvers required and no system-enforced delegation to the Senior Security Engineer, the Kubernetes upgrade is blocked. The Platform Lead sends Slack DMs to the Security Lead (no response — DND), then to the Senior Security Engineer ("can you approve this?"). The Senior Security Engineer is unsure whether they have authority to approve fleet-wide infrastructure changes — there is no written delegation memo, no pre-registration in the change management system, and no documented delegation scope. They decline to approve to avoid creating an audit finding.

5. **Outcome:** The upgrade is delayed by 2-3 days while the Security Lead resolves the incident. Meanwhile, the production Kubernetes fleet runs on a version with known CVEs (CVE-2024-3177, CVE-2023-5528). The Terraform plan may have drifted by the time the Security Lead reviews it (infrastructure drift between plan and apply). No formal audit trail of the attempted approval — the Slack messages, DMs, and thumbs-up reactions are the only "evidence" of the change authorization.

**Metrics:** ~10 hours of active manual effort (wall-clock elapsed 48-72 hours), 3 days of CVE exposure, 4 audit gaps, 6 manual steps.

**Audit Gaps (4):**
1. Slack-based change approval ("thumbs-up" on Terraform plan in #infra-approvals) not linked to the Terraform plan hash or the `terraform apply` event — auditor cannot verify that the approved plan matches the executed change (SOC 2 CC8.1)
2. No change risk classification in the approval record — auditor cannot verify that the approval model matched the risk level of the change (no standard/normal/significant/emergency classification)
3. No Security review evidence linked to the specific Terraform plan — the Security Lead's review happened informally in Slack but is not correlated to the plan hash being applied (SOC 2 CC8.1 / CC7.1)
4. No rollback verification evidence — no auditable proof that the rollback plan was reviewed and validated before the change was approved (SOC 2 CC8.1 testing requirement)

---

### With Accumulate

**Policy:** 2-of-2 (Security Lead and SRE Lead). SRE Lead is mandatory (non-delegable). Security Lead can delegate to Senior Security Engineer for standard infrastructure changes. Auto-escalation to CISO after 8 hours (25 sec simulation-compressed). 12-hour authority window. Production environment constraint.

1. **Request submitted.** Platform Lead generates the Terraform plan and submits the infrastructure change request through the IaC platform. The Accumulate policy engine identifies the applicable production infrastructure change policy and routes the approval request to both Security Lead and SRE Lead simultaneously, with full context: Terraform plan hash, CVE remediation scope (CVE-2024-3177, CVE-2023-5528), canary upgrade sequence, rollback plan, monitoring dashboard links, and pod disruption budget analysis.

2. **SRE Lead approves.** The SRE Lead reviews the Terraform plan, validates the rollback procedure, confirms monitoring and alerting coverage, verifies that on-call SRE coverage is confirmed for the change window, and checks that pod disruption budgets will not stall the node drain process. The SRE Lead approves within the system with a cryptographic signature. *(SRE approval typically completes within hours — SRE teams have well-defined change review processes.)*

3. **Security Lead unavailable — delegation invoked.** The Security Lead is in active incident response. After the delegation timeout, the system automatically routes the Security review request to the Senior Security Engineer (pre-configured delegate for standard infrastructure change reviews). No Slack DMs, no authority confusion — the Senior Security Engineer's delegation scope and registration are pre-configured in the system.

4. **Senior Security Engineer reviews and approves.** The Senior Security Engineer receives the delegated request with full context: Terraform plan hash, CVE remediation scope, RBAC change summary, admission controller compatibility validation results, and API deprecation analysis. They verify that the change falls within their delegation scope (Kubernetes patch upgrade within the same minor version) and approve. The delegation chain (Security Lead -> Senior Security Engineer) is cryptographically recorded.

5. **Terraform apply proceeds.** The IaC platform receives a cryptographic authorization proof from Accumulate that includes: who approved (SRE Lead + Senior Security Engineer via Security Lead delegation), when they approved, the exact Terraform plan hash approved, the CVE remediation scope, and the production environment constraint. The platform programmatically verifies this proof before executing `terraform apply` — no manual "click apply" step, no gap between approval and execution, no plan drift risk.

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
| Audit trail | Slack messages and DMs — no unified evidence chain, 4 audit gaps | Cryptographic proof chain: plan hash -> approval -> delegation chain -> apply event |
| SOC 2 CC8.1 readiness | 4 audit gaps; auditor cannot verify change authorization matched executed change | Complete CC8.1 evidence: authorized, reviewed, tested, plan-linked, applied |
