# Healthcare Industry — Scenario Journeys

> **Note:** Metrics cited in these scenarios (delay hours, risk exposure days, audit gap counts) are illustrative estimates based on industry-typical patterns. Actual values vary by organization, facility size, and regulatory environment. They are intended to demonstrate relative improvement, not to serve as benchmarks.

## 1. VIP-Restricted Record Access Governance

**Setting:** A cardiologist at Metro Health Medical Center has been consulted on a patient in the Emergency Department who requires urgent cardiac evaluation. A consult order has been placed, adding the cardiologist to the patient's care team in the EHR. However, when the cardiologist opens the patient's chart, the EHR displays a VIP restriction warning — the patient is a hospital employee whose record has been flagged with a VIP/employee health restriction. Even though the cardiologist is on the care team, the VIP restriction blocks chart access, requiring break-glass override. It is 9:30 PM on a weeknight — the Privacy Officer operates during business hours only, and there is no after-hours governance authority for break-glass events.

**Players:**
- **Metro Health Medical Center** (organization)
  - Cardiology Department
    - Cardiologist — attending physician on the patient's care team; activates EHR break-glass
  - Privacy Officer — HIPAA-designated privacy official; reviews break-glass events via weekly batch reports from FairWarning/Imprivata (business hours only)
  - On-Call Administrative Supervisor — after-hours governance authority (not currently involved in break-glass governance)
  - Chief Medical Officer (CMO) — escalation backstop for clinical governance decisions
  - EHR System — electronic health records with VIP restriction flags, break-glass capability, and PACS integration for radiology imaging

**Action:** Cardiologist activates EHR break-glass to access a VIP-restricted patient record for an urgent treatment decision. Access is immediate (break-glass is a self-service override). The governance gap is retrospective-only review. With Accumulate: concurrent verification from On-Call Administrative Supervisor (after hours) or Privacy Officer (business hours). 8-hour authority window scoped to one clinical shift.

---

### Today's Process

**Policy:** Break-glass is self-service — no prospective approval required. Post-hoc review by Privacy Officer via weekly batch report. No concurrent governance verification. No after-hours governance authority coverage.

1. **VIP restriction blocks chart access.** The cardiologist opens the patient's chart in the EHR. The VIP restriction flag triggers a break-glass warning dialog. The cardiologist clicks through the dialog and selects a reason code from a dropdown — "Treatment." Access is granted immediately. Total interaction time: ~30 seconds. *(~12 sec delay in simulation)*

2. **Break-glass event logged with minimal context.** The EHR logs the break-glass event: user ID (cardiologist), patient ID, reason code ("Treatment"), timestamp (9:31 PM). No clinical context is captured — the reason code is generic and indistinguishable from a snooping event with the same reason code selection. The audit trail is siloed: EHR logs the break-glass event, IAM logs the authentication, PACS logs the radiology image access — these three logs are in different systems with no automated correlation. *(~10 sec delay in simulation)*

3. **No after-hours governance authority.** The Privacy Officer operates during business hours (8 AM - 5 PM). There is no on-call privacy governance coverage. The break-glass event will not be reviewed until the Privacy Officer runs the weekly batch report — typically the following Monday. The On-Call Administrative Supervisor is not currently configured as a break-glass governance authority. *(~6 sec delay in simulation)*

4. **Governance gap.** The cardiologist has appropriate access for clinical care. But the governance gap is now open: for the next 7 days (until the weekly batch review), this break-glass event is indistinguishable from insider snooping. If the cardiologist's credentials had been compromised, or if this were a non-care-team member accessing a celebrity patient's record, the unauthorized access would go undetected for a week. Break-glass overuse patterns are invisible in batch review.

5. **Outcome:** Patient receives appropriate clinical care (break-glass is working as designed for access). But the governance gap is ~7 days until review. Insider snooping patterns are undetectable in batch review. VIP patient's privacy protection relies entirely on a weekly report with generic reason codes and no clinical context. If a breach occurred, the 60-day HITECH breach notification clock may be consumed by detection delay.

**Metrics:** Break-glass access is immediate (seconds), but governance review gap is ~168 hours (7 days). 7 days of risk exposure (break-glass event to first privacy review). 4 audit gaps (generic reason codes, siloed audit trails, no anomaly detection, unconstrained access duration). 2 governance steps (clinician break-glass, post-hoc batch review).

---

### With Accumulate

**Policy:** Break-glass access remains immediate (unchanged — no delay to clinical care). Concurrent governance verification: 1-of-2 from Privacy Officer (business hours) or On-Call Administrative Supervisor (after hours). Delegation pre-configured. Auto-escalation to CMO after 20 minutes if both are unavailable. 8-hour authority window scoped to one clinical shift.

1. **Break-glass access — IMMEDIATE.** The cardiologist activates break-glass in the EHR. Access to the VIP-restricted record is granted immediately — no delay to patient care. This is identical to the current process. *(~1 sec)*

2. **Concurrent governance verification initiated.** Simultaneously, Accumulate detects the break-glass event (via EHR integration) and initiates concurrent governance verification. Because it is 9:30 PM, the system routes to the On-Call Administrative Supervisor. The verification request includes clinical context that the EHR break-glass log does not capture: active consult order (ED consult for cardiac evaluation), patient-clinician care team relationship (verified via EHR care team assignment), and the clinical urgency context. *(~3 sec, representing ~5 minutes real-world)*

3. **On-Call Supervisor verifies.** The On-Call Administrative Supervisor receives the verification request, confirms the clinical context (active consult, cardiologist on care team, ED setting), and provides governance attestation. Accumulate records a cryptographic proof: who verified (On-Call Supervisor), when (9:35 PM), clinical context (consult order #12345, care team verified), break-glass event correlation (EHR event ID matched). *(~3 sec, representing ~5 minutes real-world)*

4. **Unified audit trail created.** Accumulate correlates the break-glass event across all three systems: EHR break-glass log (access event), IAM authentication log (credential verification), and PACS access log (imaging viewed). A single, unified governance record replaces three siloed logs. The Privacy Officer receives a real-time feed of verified break-glass events — no longer dependent on weekly batch reports.

5. **Outcome:** Patient receives identical clinical care (no access delay). But the governance gap drops from 7 days to minutes. Every break-glass event has concurrent verification with clinical context. Insider snooping patterns become detectable in real time (no verification = anomaly). VIP patient privacy is actively monitored, not retrospectively reviewed. Access automatically expires after 8 hours (one clinical shift) — no risk of forgotten permissions.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Access speed | Immediate (EHR break-glass) | Immediate (unchanged — no delay) |
| Governance gap | ~7 days until weekly batch review | Minutes — concurrent verification |
| Break-glass context | Generic reason code dropdown | Clinical context (consult order, care team, urgency) |
| Insider threat detection | Indistinguishable from legitimate access in batch review | Real-time anomaly detection (unverified break-glass = alert) |
| Audit trail | Siloed across EHR, IAM, and PACS | Unified cryptographic proof correlating all three systems |
| After-hours governance | No coverage — Privacy Officer business hours only | On-Call Supervisor provides concurrent verification 24/7 |
| Access duration | Unconstrained (until session ends) | 8-hour shift-scoped window with automatic expiry |
| HIPAA compliance | Break-glass log with minimal context, reviewed retroactively | Concurrent governance attestation with clinical context and access scoping |

---

## 2. Research Data Sharing

**Setting:** A Principal Investigator (PI) at State University is conducting a federally funded, IRB-approved multi-institution study on cardiovascular outcomes. The study protocol, approved by the single IRB of record at State University under the revised Common Rule's single IRB mandate (45 CFR 46.114), requires access to a limited data set from the Academic Medical Center's clinical data warehouse. The data request involves patient demographic, diagnostic, and treatment data with dates and geographic information retained at the state level — qualifying as a limited data set under HIPAA (45 CFR 164.514(e)), which requires a Data Use Agreement. Governance at the Academic Medical Center is fragmented across four offices: the HRPP/IRB Office (for the institutional determination), the Research Data Governance office (for data access approval), Legal Counsel (for DUA negotiation and execution), and the Privacy Officer (for HIPAA validation of the limited data set preparation). These offices operate in separate systems with no shared workflow — processes that could run in parallel instead run sequentially by default because each office waits for the previous one before acting.

**Players:**
- **Academic Medical Center** (data providing institution)
  - HRPP / IRB Office — issues institutional determination on the study's data sharing arrangement
  - Research Data Governance
    - Data Governance Director — reviews and approves data access requests; coordinates DUA lifecycle
    - Data Custodian / Honest Broker — extracts and prepares the limited data set; executes data release
  - Privacy Officer — validates limited data set preparation methodology under HIPAA (currently on extended leave)
  - Deputy Privacy Officer — designated backup for HIPAA privacy validation
  - Research Legal Counsel — negotiates and executes the Data Use Agreement
- **State University** (data requesting institution)
  - Principal Investigator — lead researcher requesting limited data set access

**Action:** PI at State University requests access to a limited data set from the Academic Medical Center. Requires parallel governance approvals: (1) Data Governance Director approves the institutional data access request, (2) Privacy Officer (or Deputy) validates the limited data set preparation methodology, (3) Legal Counsel executes the DUA. Today, these processes are siloed, run sequentially by default, and are blocked when the Privacy Officer is unavailable with no configured backup.

---

### Today's Process

**Policy:** Privacy Officer is the sole authority for HIPAA validation — no backup configured. Each governance office operates independently with no shared workflow. All prerequisites must be satisfied sequentially.

1. **PI contacts internal collaborator.** The PI at State University contacts a collaborating investigator at the Academic Medical Center to discuss data availability and feasibility. The collaborator confirms the data exists in the clinical data warehouse and directs the PI to the Research Data Governance office to initiate the formal request process. *(~4 sec delay, representing ~1-2 weeks real-world)*

2. **Data access request submitted.** The PI submits a data access request through the Academic Medical Center's research data governance portal, attaching: the IRB-approved protocol, the single IRB reliance agreement, proof of CITI training, and a description of the specific data elements requested. The Data Governance office acknowledges receipt and begins its review. *(~6 sec delay, representing ~1-2 weeks real-world)*

3. **Governance silos activate sequentially.** The Data Governance Director reviews the request and determines that a DUA is required (limited data set). The Director emails the request package to Legal Counsel to begin DUA drafting. Legal Counsel responds that they need the Privacy Officer's validation of the limited data set methodology before they will finalize DUA terms. The Privacy Officer's review is added to the queue — but the Privacy Officer is on extended leave. *(~8 sec delay, representing ~2-4 weeks real-world)*

4. **Privacy Officer unavailable — entire process blocked.** The Privacy Officer is on extended leave. There is no designated Deputy Privacy Officer configured in the governance workflow. The Data Governance Director emails the Privacy Officer's supervisor to request a temporary designation, but institutional HR policies require a formal delegation letter. Legal Counsel will not finalize the DUA without the privacy validation. The honest broker cannot begin data preparation without an approved methodology. Every downstream step is blocked. *(~12 sec delay, representing ~4-8 weeks real-world)*

5. **DUA negotiation stalls.** Even after the privacy validation issue is eventually resolved (Privacy Officer returns after 6 weeks), Legal Counsel begins DUA negotiation with State University's Office of General Counsel. Three rounds of redlining ensue over indemnification language and publication rights. The PI has no visibility into where the request stands. *(~6 sec delay, representing ~4-8 weeks real-world)*

6. **Outcome:** Research delayed by 90+ days. Grant year-one data collection window is half consumed. The PI has submitted a no-cost extension request to the NIH program officer. Audit trail consists of disconnected email threads across four offices, with no unified record linking IRB approval, privacy validation, DUA execution, and data release. Data provenance after release is untracked.

**Metrics:** ~40 hours of active coordination effort spread over 90+ days elapsed time. 90 days of research delay risk exposure (grant timeline jeopardy, scientific priority loss). 6 audit gaps (no cross-institutional trail, DUA compliance untracked, privacy validation not linked to release, IRB status unverified at release, data provenance lost post-transfer, DUA expiration unmonitored). 9 manual steps.

---

### With Accumulate

**Policy:** Data governance approval uses 1-of-2 threshold (Data Governance Director or Data Custodian). Privacy validation is mandatory with automatic delegation to Deputy Privacy Officer when Privacy Officer is unavailable. Legal Counsel DUA execution is a prerequisite gate. 14-day internal approval window. Cross-institutional workflow visibility for the PI.

1. **Request submitted with cross-institutional routing.** The PI submits the data access request through Accumulate's cross-institutional workflow. The policy engine routes the request simultaneously to: Data Governance Director (institutional data access approval), Privacy Officer (HIPAA limited data set methodology validation), and Legal Counsel (DUA drafting notification). All three offices see the request immediately — no sequential email routing. *(~2 sec)*

2. **Privacy Officer unavailable — automatic delegation.** The Privacy Officer is on leave. Accumulate's delegation policy automatically routes the privacy validation to the Deputy Privacy Officer with full context: the data elements requested, the proposed limited data set methodology, the IRB-approved protocol, and the specific HIPAA provisions applicable. The Deputy Privacy Officer reviews the methodology and certifies compliance with Safe Harbor requirements. *(~3 sec, representing ~1-2 days real-world)*

3. **Parallel governance approvals proceed.** While the Deputy Privacy Officer is reviewing, the Data Governance Director approves the institutional data access request (1-of-2 threshold met). Legal Counsel, having received the request simultaneously and now with the privacy validation complete, finalizes the DUA draft and begins negotiation with State University's legal office. The honest broker begins data preparation using the approved methodology. *(~3 sec, representing ~1-2 weeks real-world)*

4. **DUA executed — data released.** Legal Counsel completes DUA negotiation and execution (this step still requires human negotiation — Accumulate provides workflow transparency, not legal automation). The Data Custodian / Honest Broker, with all governance gates now satisfied (data governance approval, privacy validation, executed DUA), releases the limited data set to the PI with scope constraints documented in the authorization record. *(~2 sec)*

5. **Outcome:** Internal governance approvals completed in days instead of months (parallel instead of sequential). DUA negotiation timeline reduced through earlier initiation and workflow transparency (weeks instead of months). Total elapsed time reduced from 90+ days to 30-45 days (DUA negotiation remains the dominant bottleneck). Cryptographic proof of the complete authorization chain: who approved, when, under what policy, and that the Privacy Officer (or Deputy) validated the limited data set methodology before release. Cross-institutional audit trail links IRB approval, privacy validation, DUA execution, and data release in a single verifiable record.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Governance coordination | Four offices operating in silos, sequential by default | Parallel routing with cross-institutional workflow visibility |
| Privacy validation bottleneck | Privacy Officer sole authority, no backup — single point of failure | Automatic delegation to Deputy Privacy Officer with full context |
| DUA negotiation timeline | Starts only after privacy validation — sequential by accident | Starts immediately — legal notified in parallel |
| PI visibility | No visibility into request status across providing institution | Real-time cross-institutional status tracking |
| Internal approval cycle | Weeks-to-months (sequential silos) | Days (parallel routing with threshold and delegation) |
| Total elapsed time | 90+ days (DUA negotiation is dominant bottleneck) | 30-45 days (internal approvals accelerated; DUA still requires human negotiation) |
| Audit trail | Disconnected email threads across four offices at two institutions | Unified cryptographic proof linking all governance approvals across both institutions |
| Data provenance | Lost after institutional transfer | Verifiable release record with scope constraints and authorization chain |

---

## 3. Clinical Trial Protocol Amendment Governance

**Setting:** A Sponsor Medical Monitor initiates a protocol amendment modifying the dosing regimen for a Phase II clinical trial at a Research Hospital investigator site. The amendment — driven by emerging safety data reviewed by the DSMB — requires site-level PI acceptance per ICH E6(R2) Section 4.5.2 and IRB approval per 21 CFR 56.108(a)(4) before it can be implemented. The CRO (contracted by the sponsor) will implement the amendment operationally — updating the monitoring plan, CRF, and data management specifications — but does not approve the amendment. Authorization status is fragmented across three systems: the sponsor's clinical portal, the site's eTMF/eISF (Veeva Vault / Florence eBinders), and the institution's IRB electronic system. There is no unified view of where the amendment stands across these systems. The PI is traveling to a medical conference, and the next scheduled IRB board meeting is in 10 days.

**Players:**
- **Research Hospital** (investigator site)
  - Clinical Trials Unit
    - Principal Investigator — lead investigator, must accept the amendment for this site (traveling)
    - Sub-Investigator — PI-designated backup on FDA Form 1572 and site delegation log
    - Clinical Research Coordinator (CRC) — site-level operational coordinator; manages IRB submission and site activation
  - IRB / HRPP Office
    - IRB Designated Reviewer / Full Board — provides independent ethical review of the amendment
  - Regulatory Affairs
    - Regulatory Affairs Specialist — manages eISF documentation and regulatory correspondence
  - eTMF / eISF System — document repository for amendment sign-off and regulatory filing
- **Sponsor Medical Monitor** (external pharmaceutical partner — initiates the amendment)
- **CRO** (external, contracted by sponsor — implements operationally, does not approve)

**Action:** Sponsor Medical Monitor distributes a protocol amendment modifying the dosing regimen. Site-level governance requires PI acceptance (mandatory) and IRB approval (mandatory). With Accumulate: Sub-Investigator delegation when PI is unavailable, cross-system authorization tracking, document version verification, and unified audit trail across sponsor portal, site eTMF, and IRB system.

---

### Today's Process

**Policy:** PI acceptance and IRB approval both required (sequential — IRB submission waits for PI assessment). No Sub-Investigator delegation configured. Authorization status tracked in shared spreadsheet across three systems.

1. **Amendment distributed via sponsor portal.** The Sponsor Medical Monitor distributes the protocol amendment through the sponsor's clinical portal. The CRC at the Research Hospital receives a notification, downloads the amendment, and logs it in the site's eTMF. The PI receives a separate notification to review the amendment in the sponsor portal. The IRB application will be submitted through the institution's IRB electronic system — a third system with no link to the sponsor portal or eTMF. Version control is now fragmented across three systems. *(~8 sec delay, representing ~1-3 days real-world)*

2. **PI unavailable — review stalls.** The PI is traveling to a medical conference and cannot access the sponsor's clinical portal from the conference venue (VPN issues, restricted network). There is no Sub-Investigator delegation configured for amendment review — the PI is the only physician authorized to assess the clinical implications of the dosing regimen change for enrolled subjects. The CRC cannot submit the IRB application without the PI's assessment. Amendment review stalls. Sign-off status is tracked in a shared spreadsheet that the CRC updates manually. *(~12 sec delay, representing ~1-2 weeks real-world)*

3. **IRB meeting cycle delay.** When the PI returns and completes their review (signing the amendment in the eISF), the CRC submits the IRB amendment application. However, the submission deadline for the current board meeting has passed. The amendment is queued for the next scheduled IRB meeting — biweekly or monthly cadence. For a dosing regimen change, full board review is likely required (this is a substantive change affecting participant safety, not eligible for expedited review per 21 CFR 56.110). *(~6 sec delay, representing ~2-4 weeks real-world)*

4. **Weak e-signatures and audit gaps.** The PI's amendment review was documented via email confirmation ("I've reviewed the amendment and agree to implement it") rather than a Part 11-compliant e-signature in the eISF. The IRB approval letter references "Protocol Amendment 3" but does not include the document hash or version identifier — there is no cryptographic link between the IRB approval and the specific document version reviewed. Date/time of the PI's review is captured only in the email timestamp, not in a Part 11-compliant signature record with printed name, date/time, and meaning.

5. **Outcome:** Protocol amendment delayed by 3-6 weeks from distribution to site implementation. Total active coordination effort: approximately 40 hours across all parties. Enrolled subjects continue on the original dosing regimen during the delay — for a safety-related amendment, this has direct patient impact. The audit trail consists of: an email thread between the CRC and PI, a separate IRB approval letter, a shared spreadsheet tracking status across three systems, and a faxed signature page in the regulatory binder. An FDA BIMO inspector reviewing this site during an inspection would note: (1) PI review not documented per Part 11, (2) amendment version not linked to IRB approval, (3) no unified audit trail for the amendment lifecycle.

**Metrics:** ~40 hours of active coordination effort, 21 days of risk exposure (distribution to implementation), 6 audit gaps (version control across 3 systems, non-Part-11 e-signatures, PI review not linked to document version, IRB approval not linked to document version, date/time not captured per Part 11 Section 11.50, no document integrity verification), 9 amendment lifecycle steps.

---

### With Accumulate

**Policy:** PI acceptance and IRB approval both mandatory (cannot be bypassed). Sub-Investigator delegation when PI is unavailable. Cross-system authorization tracking across sponsor portal, site eTMF, and IRB system. Document version verification via cryptographic hash. 21-day authority window.

1. **Amendment distributed with cross-system tracking.** The Sponsor Medical Monitor distributes the protocol amendment via the clinical portal. Accumulate detects the distribution event and initiates the authorization governance workflow. The CRC, PI (and Sub-I as backup), and IRB office all receive authorization requests simultaneously — with a cryptographic hash of the amendment document ensuring all parties are reviewing the identical version. *(~2 sec)*

2. **PI unavailable — Sub-Investigator delegation activates.** The PI is traveling. Accumulate's delegation policy automatically routes the PI's amendment review to the Sub-Investigator — a physician listed on FDA Form 1572 and the site delegation of authority log, with medical qualifications to assess the dosing regimen change. The Sub-I receives the full amendment package with clinical context and reviews the impact on enrolled subjects. The Sub-I accepts the amendment on behalf of the PI. Accumulate records: who reviewed (Sub-I), under what authority (delegation from PI per ICH E6(R2) Section 4.2.5), when, and which document version (hash-verified). *(~3 sec, representing ~1-2 days real-world)*

3. **IRB review proceeds in parallel.** While the Sub-I reviews the amendment, the CRC has already submitted the IRB application (enabled because the authorization tracking confirms the PI/Sub-I review is in progress). The IRB reviews the amendment at the next scheduled board meeting. Accumulate tracks the IRB review status in real time and links the IRB approval to the specific amendment document version (hash-verified). *(~4 sec, representing ~2-3 weeks real-world; IRB meeting cadence is a calendar constraint that Accumulate cannot accelerate)*

4. **Authorization chain complete — site activation begins.** Both mandatory approvers have authorized: Sub-I (on behalf of PI) and IRB. Accumulate records the complete authorization chain with cryptographic proof: who approved, when, under what authority, which document version (hash-verified), and the regulatory basis (ICH E6(R2) Section 4.5.2 and 21 CFR 56.108(a)(4)). The site activation process begins: pharmacy manual updated, re-consent process initiated for enrolled subjects if applicable, CRO notified to update monitoring plan and CRF. *(~2 sec)*

5. **PI reviews and ratifies on return.** The PI returns from the conference and reviews the amendment and the Sub-I's acceptance. The PI adds their own ratification signature, strengthening the authorization record. The complete audit trail — from sponsor distribution through PI/Sub-I review, IRB approval, and site activation — is available as a single verifiable record in the eTMF, ready for FDA BIMO inspection.

6. **Outcome:** Amendment authorization cycle reduced from 3-6 weeks to 2-3 weeks (primary improvement: elimination of PI availability delay and parallelization of PI/Sub-I review with IRB submission; IRB meeting cadence remains a calendar constraint). Version control verified cryptographically across all three systems. Complete Part 11-supporting audit trail: every authorization event captures who, when, which document version, and meaning. FDA BIMO inspection readiness significantly improved. Enrolled subjects transitioned to the new dosing regimen 1-3 weeks earlier than under the sequential process.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| PI availability | Single point of failure — no Sub-I delegation configured | Automatic delegation to Sub-Investigator on FDA Form 1572 |
| IRB review timeline | Sequential — IRB submission waits for PI review completion | Parallelized — IRB submission proceeds while PI/Sub-I review is in progress |
| Version control | Fragmented across sponsor portal, site eTMF, and IRB system | Cryptographic document hash verification across all systems |
| Authorization tracking | Shared spreadsheet, email threads, disconnected systems | Unified real-time status across all parties and systems |
| E-signature compliance | Email confirmations and PDF annotations (not Part 11 compliant) | Cryptographic authorization records supporting Part 11 audit trail requirements |
| BIMO inspection readiness | Scattered documentation, version gaps, weak audit trail | Complete authorization chain linked to specific document versions |
| Amendment cycle time | 3-6 weeks (sequential, PI bottleneck, IRB meeting cycle) | 2-3 weeks (parallel routing, Sub-I delegation; IRB cadence unchanged) |
| Patient impact | Enrolled subjects on original dosing regimen for additional 1-3 weeks | Earlier transition to amended dosing regimen |

---

## 4. 42 CFR Part 2 Emergency Access Governance

**Setting:** A Level I Trauma Center receives a multi-vehicle collision patient via EMS. The trauma team is activated — an ER physician, trauma surgeon, anesthesiologist, two nurses, and a respiratory therapist are assembled in the trauma bay. The EHR's trauma activation module auto-assigns all six team members to the patient's care team, granting immediate access to standard medical records (vitals, labs, imaging, medication list). However, during the primary survey, the ER physician notes track marks on the patient's arms. The EHR flags that the patient has 42 CFR Part 2-segmented substance use disorder (SUD) treatment records from a prior opioid treatment program — including methadone maintenance dosing. These records are federally protected under 42 CFR Part 2, which is MORE restrictive than HIPAA: even auto-assigned care team members cannot access SUD records without break-glass. Knowing the methadone dose is critical for anesthesia management (methadone interacts with multiple anesthetics and opioid analgesics), the Trauma Team Leader instructs the team to access the SUD records. Each of the six team members independently activates break-glass. It is 2:15 AM — the Privacy Officer operates during business hours only.

**Players:**
- **City Trauma Medical Center** (organization)
  - Emergency Department (Level I Trauma Center)
    - Trauma Team Leader — attending directing the resuscitation; knows team composition
    - ER Physician — activates break-glass for SUD records; needs methadone dosing for safe anesthesia
  - Privacy Officer — reviews break-glass events via weekly batch report; manages 42 CFR Part 2 compliance (business hours only)
  - On-Call Administrative Supervisor — hospital-wide after-hours authority; does not currently participate in break-glass governance
  - Chief Medical Officer (CMO) — escalation backstop
  - EHR System — electronic health records with 42 CFR Part 2 SUD record segmentation, break-glass capability, trauma activation care team auto-assignment, and audit logging

**Action:** Trauma team of 6 providers activate individual break-glass events for 42 CFR Part 2-segmented SUD records during a trauma resuscitation. Each access is immediate. The governance gap: 5-8 uncorrelated break-glass events appear in the weekly batch report with no way to link them to one trauma activation, verify each accessor was on the trauma team, or document the 42 CFR Part 2 medical emergency exception. With Accumulate: concurrent verification from On-Call Supervisor, Trauma Team Leader attestation, automated event correlation, and 42 CFR Part 2 emergency documentation.

---

### Today's Process

**Policy:** Break-glass for 42 CFR Part 2 records is self-service — no prospective approval required. Post-hoc review by Privacy Officer via weekly batch report. No concurrent governance. No multi-event correlation. No 42 CFR Part 2 emergency exception documentation captured at time of access.

1. **Trauma activation triggers care team auto-assignment.** The trauma activation module auto-assigns six team members to the patient. Standard records (vitals, labs, imaging, non-restricted medications) are immediately accessible. SUD treatment records remain 42 CFR Part 2-segmented — break-glass required. *(~3 sec in simulation)*

2. **Multi-provider break-glass activation.** Each of the six trauma team members encounters the 42 CFR Part 2 restriction when attempting to access the SUD records. Each clicks through the break-glass dialog and selects "Emergency" from the reason code dropdown. Each gains immediate access. Total: 6 individual break-glass events generated within a 5-minute window. No system recognizes that these are part of the same trauma activation. *(~12 sec delay in simulation, representing ~5 minutes real-world aggregate)*

3. **Break-glass events logged with minimal context.** The EHR logs 6 separate break-glass events: user ID, patient ID, reason code ("Emergency"), timestamp. No 42 CFR Part 2 medical emergency documentation is captured — the reason code dropdown does not include a "42 CFR Part 2 medical emergency" option. No correlation to the trauma activation. No verification that each user was on the trauma team at the time of access. The audit trail is siloed: EHR logs the break-glass events, IAM logs authentications, and the behavioral health module logs SUD record access — three separate systems with no automated correlation. *(~10 sec delay in simulation, representing instantaneous logging but delayed review)*

4. **No after-hours governance.** The Privacy Officer operates during business hours. The On-Call Administrative Supervisor exists but does not currently participate in break-glass governance. The 6 break-glass events will not be reviewed until the Privacy Officer runs the weekly batch report — likely the following Monday. The Privacy Officer will see 6 separate break-glass entries for the same patient, with no indication that these were part of a single trauma activation. *(~6 sec delay in simulation, representing 7-14 days until review)*

5. **Governance gap.** The 42 CFR Part 2 compliance investigation is labor-intensive: the Privacy Officer must (a) manually identify that 6 separate break-glass events are related to the same patient encounter, (b) contact the Trauma Team Leader to verify team composition at the time of access, (c) confirm that a bona fide medical emergency existed (required for the 42 CFR Part 2 exception), (d) determine if the SUD information was redisclosed in violation of Part 2 restrictions, and (e) document the medical emergency exception retroactively. This investigation takes 2-4 weeks per multi-provider event. During this window, any non-care-team member who also broke the glass (credential compromise, insider snooping) is indistinguishable from a legitimate team member.

6. **Outcome:** Patient receives appropriate trauma care (break-glass works as designed for access). But the governance gap is 2-4 weeks. The 42 CFR Part 2 medical emergency exception was never documented at the time of access — it must be reconstructed retroactively. If any of the 6 break-glass events were unauthorized, detection is delayed by weeks. The SAMHSA 2024 Final Rule now subjects Part 2 violations to HIPAA penalty tiers, increasing the financial risk of inadequate SUD record access governance.

**Metrics:** Break-glass access is immediate (seconds per team member). Governance review gap: ~336 hours (14 days). 14 days of risk exposure. 5 audit gaps (no Part 2 emergency documentation, no multi-event correlation, no care team verification, siloed audit trails, no redisclosure tracking). 2 governance steps (clinician break-glass, post-hoc batch review).

---

### With Accumulate

**Policy:** Break-glass for 42 CFR Part 2 records remains immediate (unchanged). Concurrent governance verification: 1-of-2 from Privacy Officer (business hours) or On-Call Administrative Supervisor (after hours). Trauma Team Leader provides team composition attestation. Accumulate auto-correlates all break-glass events to the trauma activation. 42 CFR Part 2 medical emergency exception documented in real time. 12-hour authority window scoped to one trauma team shift rotation.

1. **Break-glass access — IMMEDIATE.** Each trauma team member activates break-glass for the 42 CFR Part 2-segmented SUD records. Access is granted immediately for each team member — identical to today. No delay to patient care. EMTALA obligations fully preserved. *(~1 sec)*

2. **Automated multi-event correlation.** Accumulate detects 6 break-glass events for the same patient within a 5-minute window and correlates them to the active trauma activation (matching trauma activation timestamp, patient encounter ID, and care team roster from the EHR). Instead of 6 unrelated events, Accumulate creates a single "trauma team access event" with all 6 accessors listed. *(~2 sec, representing automated correlation)*

3. **Concurrent governance verification.** Because it is 2:15 AM, Accumulate routes the verification request to the On-Call Administrative Supervisor. The request includes: trauma activation details (time, activation level, patient), care team roster (6 members — verified against EHR care team assignment), clinical context (SUD records accessed for methadone dosing / anesthesia management), and a 42 CFR Part 2 medical emergency attestation template. The On-Call Supervisor verifies and provides governance attestation. *(~3 sec, representing ~5 minutes real-world)*

4. **Trauma Team Leader attestation.** Simultaneously, the Trauma Team Leader receives a brief attestation request: confirm team composition and clinical necessity for SUD record access. The Trauma Team Leader confirms that all 6 accessors were clinically necessary for the resuscitation and that the methadone dosing information was required for safe anesthesia management. This attestation satisfies the 42 CFR Part 2 medical emergency documentation requirement at the time of access — no retroactive reconstruction needed. *(~2 sec, representing ~3 minutes real-world)*

5. **Unified audit trail with Part 2 compliance.** Accumulate creates a single governance record that includes: (a) all 6 break-glass events correlated to the trauma activation, (b) On-Call Supervisor governance attestation with timestamp, (c) Trauma Team Leader team composition attestation, (d) 42 CFR Part 2 medical emergency exception documentation (bona fide emergency, patient unable to consent, disclosure limited to treating providers), (e) redisclosure restriction notice embedded in the governance record. The Privacy Officer receives this as a real-time feed — one correlated event instead of 6 unrelated entries in a weekly batch report.

6. **Outcome:** Patient receives identical trauma care (no access delay). Governance gap drops from 2-4 weeks to minutes. All 6 break-glass events are correlated to one trauma activation — any break-glass event for this patient NOT associated with the trauma team is immediately flagged as anomalous. 42 CFR Part 2 medical emergency exception is documented in real time. The Privacy Officer's workload drops from a multi-week investigation to a review of a pre-verified governance record. Access automatically expires after 12 hours (one trauma team shift).

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Access speed | Immediate (EHR break-glass per team member) | Immediate (unchanged — no delay) |
| Multi-event correlation | 5-8 unrelated break-glass entries in batch report | Single correlated trauma team access event |
| 42 CFR Part 2 documentation | No medical emergency exception documented at time of access; reconstructed retroactively weeks later | Medical emergency exception documented in real time via Trauma Team Leader attestation |
| Care team verification | Privacy Officer manually contacts Trauma Team Leader weeks later to verify team roster | Automated care team roster verification via EHR trauma activation module |
| Governance gap | 2-4 weeks for multi-provider SUD record investigation | Minutes — concurrent verification with team attestation |
| After-hours governance | On-Call Supervisor exists but does not participate in break-glass governance today | On-Call Supervisor scope expanded to include concurrent 42 CFR Part 2 verification |
| Insider threat detection | Non-care-team break-glass events indistinguishable from legitimate team access in batch review | Break-glass events not correlated to trauma team roster are immediately flagged |
| Access duration | Unconstrained (until session ends) | 12-hour shift-scoped window with automatic expiry |
| SAMHSA compliance | Part 2 violations now subject to HIPAA penalty tiers (2024 Final Rule); inadequate documentation increases financial risk | Concurrent documentation satisfies Part 2 emergency exception requirements and provides HIPAA-compliant audit trail |
