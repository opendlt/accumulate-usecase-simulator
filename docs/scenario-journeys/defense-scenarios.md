# Defense Industry — Scenario Journeys

> **Note:** Metrics cited in these scenarios (delay hours, risk exposure days, audit gap counts) are illustrative estimates based on industry-typical patterns. Actual values vary by organization, classification level, and operational context. They are intended to demonstrate relative improvement, not to serve as benchmarks.

## 1. SAP Subcontractor Access During Program Milestone

**Setting:** A subcontractor engineer meeting SAP-eligible personnel security requirements (TS/SCI plus program-specific investigative prerequisites) needs read-in to a SAP compartment at the prime contractor's accredited SAP Facility (SAPF) for system integration testing. The Government Program Security Officer (GPSO) must adjudicate need-to-know, the FSO must validate collateral clearance in DISS and process the Visit Authorization Letter, and the Contractor PSO (CPSO) must coordinate indoctrination. The CPSO is TDY with no designated Alternate CPSO on the program access roster, stalling the indoctrination process. DD Form 254 has been issued and investigative requirements are satisfied.

**Players:**
- **Prime Contractor** (defense organization)
  - Facility Security — NISPOM 32 CFR Part 117 compliance
    - Facility Security Officer (FSO) — collateral clearance validation in DISS and VAL processing
  - Contractor PSO (CPSO) — SAP indoctrination coordination (currently TDY)
  - Alternate CPSO — designated alternate for indoctrination when CPSO is unavailable
- **Government Program Office** (partner)
  - Gov't Program Security Officer (GPSO) — need-to-know adjudication and SAP indoctrination authorization under DoD 5205.07
- **Subcontractor** (external vendor)
  - Subcontractor Engineer — TS/SCI-eligible, needs compartment read-in for integration testing

**Action:** CPSO initiates SAP indoctrination request on behalf of the subcontractor engineer. Requires 3-of-3 approval from GPSO (need-to-know adjudication), FSO (collateral clearance validation in DISS with VAL processing), and CPSO (indoctrination coordination). Delegation from CPSO to Alternate CPSO when CPSO is TDY.

---

### Today's Process

**Policy:** All 3 of 3 must approve (GPSO, FSO, CPSO). No delegation allowed. Short window.

1. **SIPRNET coordination.** CPSO submits SAP indoctrination request to GPSO via SIPRNET. FSO separately processes the Visit Authorization Letter and validates collateral clearance in DISS. *(~10 sec delay)*

2. **Parallel reviews.** GPSO reviews need-to-know justification against program access requirements. FSO confirms TS/SCI eligibility and program-specific investigative prerequisites in DISS. *(~8 sec delay)*

3. **CPSO TDY.** Contractor PSO is TDY at another facility. No designated Alternate CPSO exists on the program access roster. Indoctrination coordination stalls — nobody is authorized to facilitate the SAP briefing. *(~14 sec delay)*

4. **Access stalled.** Even though GPSO and FSO complete their portions, the indoctrination cannot proceed without CPSO coordination. The subcontractor engineer sits idle at the SAPF. Integration testing timelines slip.

5. **Outcome:** 480+ hours (20 business days) of delay. Program milestones at risk. Audit trail is SIPRNET messages, DISS records, and paper indoctrination logs that are difficult to correlate. 30 days of schedule risk exposure.

**Metrics:** ~480 hours (20 days) of delay, 30 days of risk exposure, 6 audit gaps, 9 manual steps.

---

### With Accumulate

**Policy:** 3-of-3 (GPSO, FSO, CPSO). Delegation allowed — CPSO delegates to Alternate CPSO. 24-hour authority window. SAP-enclave environment constraint.

1. **Request submitted.** CPSO initiates the SAP indoctrination request. Policy engine routes simultaneously to GPSO for need-to-know adjudication, FSO for collateral clearance validation, and CPSO for indoctrination coordination.

2. **GPSO and FSO approve.** GPSO adjudicates need-to-know. FSO validates collateral clearance in DISS and confirms VAL processing. Both approvals captured with cryptographic proof.

3. **CPSO TDY — delegation invoked.** CPSO is unavailable. The system automatically invokes the pre-configured delegation to the Alternate CPSO, who coordinates the indoctrination briefing.

4. **SAP access granted with constraints.** Compartment read-in processed with SAP-enclave environment constraint and 24-hour authority window. Full audit trail captures the three-party approval chain including the delegation path.

5. **Outcome:** Subcontractor engineer read into SAP compartment on schedule. Integration testing proceeds. Complete audit trail spanning Government Program Office, Prime Contractor, and Subcontractor — with cryptographic proof of GPSO adjudication, FSO clearance validation, and CPSO/Alt-CPSO indoctrination coordination.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Request method | SIPRNET messages + separate DISS validation | Unified policy routing across all three authorities |
| Clearance verification | Manual DISS portal lookup by FSO | Cryptographic verification with DISS integration |
| Need-to-know adjudication | GPSO reviews via SIPRNET separately | GPSO approval captured in unified workflow |
| When CPSO is TDY | Indoctrination stalls — no Alternate CPSO | Delegation auto-routes to designated Alternate CPSO |
| Time to access | ~480 hours (20 days) | Hours |
| Audit trail | SIPRNET messages + DISS records + paper indoctrination logs | Unified cryptographic proof of full SAP access chain |

---

## 2. Time-Sensitive Coalition Intelligence Release

**Setting:** A U.S. combatant command receives near-real-time ISR data indicating imminent hostile activity in a multinational operating area. The intelligence is classified SECRET//NOFORN pending review. Release to a Five Eyes partner requires OCA authorization to change the NOFORN caveat to REL TO FVEY, Foreign Disclosure Officer (FDO) adjudication under NDP-1, and sanitization review to remove source-identifying details before distribution via the Mission Partner Environment (MPE). The FDO is deployed forward with limited JWICS connectivity, stalling the mandatory foreign disclosure determination.

**Players:**
- **Combatant Command** (organization)
  - J2 Intelligence
    - All-Source Analyst — produces ISR product, initiates disclosure request (no approval authority)
    - Original Classification Authority (OCA) — authorizes NOFORN-to-REL TO FVEY caveat change
    - Sanitization Reviewer — removes source-identifying details and compartmented indicators
  - Foreign Disclosure Officer (FDO) — mandatory foreign disclosure determination under NDP-1 (deployed forward)
  - Alternate FDO (AFDO) — certified delegate for FDO authority under DoDI 5230.11
  - Mission Partner Environment (MPE) — coalition classified distribution network
- **Five Eyes Partner** (allied nation requesting release)

**Action:** All-Source Analyst initiates disclosure request. Requires 3-of-3 from FDO (mandatory — cannot be threshold-skipped), OCA (marking authorization), and Sanitization Reviewer (source protection). FDO delegates to certified AFDO when deployed forward.

---

### Today's Process

**Policy:** All 3 of 3 must approve (FDO, OCA, Sanitization Reviewer). No delegation. Short window.

1. **JWICS request submitted.** All-Source Analyst submits disclosure request via JWICS. OCA and Sanitization Reviewer notified separately through J2 intelligence channels. *(~10 sec delay)*

2. **Classification and sanitization review.** OCA reviews classification guide to authorize the NOFORN-to-REL TO FVEY caveat change. Sanitization Reviewer cross-references source registers to identify elements requiring redaction. *(~8 sec delay)*

3. **FDO deployed forward.** FDO is deployed forward with limited JWICS connectivity. No certified Alternate FDO is designated. The mandatory foreign disclosure determination — the one approval that cannot be skipped — is stalled pending the FDO's return to main headquarters. *(~12 sec delay)*

4. **Intelligence withheld.** Even though OCA and Sanitization Reviewer complete their portions, the FDO determination is mandatory under NDP-1. Time-sensitive ISR data cannot be released to the Five Eyes partner.

5. **Outcome:** 96+ hours of delay. ISR data becomes operationally stale. Partner nation plans operations without critical intelligence. Audit trail is JWICS messages and classification review logs that span multiple J2 systems.

**Metrics:** ~96 hours of coordination, 21 days of risk exposure, 5 audit gaps, 8 manual steps.

---

### With Accumulate

**Policy:** 3-of-3 (FDO, OCA, Sanitization Reviewer). FDO delegates to certified AFDO. 12-hour authority window.

1. **Request submitted.** All-Source Analyst initiates the disclosure request. Policy engine routes simultaneously to FDO for foreign disclosure determination, OCA for caveat change authorization, and Sanitization Reviewer for source protection review.

2. **OCA and Sanitization Reviewer approve.** OCA authorizes the NOFORN-to-REL TO FVEY marking change. Sanitization Reviewer confirms source-identifying details and compartmented indicators have been redacted.

3. **FDO deployed — delegation invoked.** FDO is unavailable. The system automatically invokes the pre-configured delegation to the certified AFDO, who makes the foreign disclosure determination under NDP-1.

4. **Intelligence released via MPE.** All three mandatory approvals obtained. SECRET//REL TO FVEY product released to the Five Eyes partner via the Mission Partner Environment. Cryptographic proof captures the OCA marking authorization, sanitization review, FDO/AFDO disclosure determination, and the delegation chain.

5. **Outcome:** Intelligence shared while still operationally relevant. Five Eyes partner has critical ISR data for operational planning. Complete classified audit trail with cryptographic proof of every step in the disclosure chain.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Communication method | JWICS messages + separate J2 channels | Unified policy routing with cryptographic proof |
| Classification review | Manual OCA review against classification guide | OCA approval captured in integrated workflow |
| FDO determination | Mandatory but stalls when FDO is forward-deployed | FDO delegates to certified AFDO automatically |
| Intelligence timeliness | Stale by the time it's released (~96 hours) | Shared while still operationally relevant |
| Source protection | Manual sanitization review with source register cross-check | Sanitization approval with cryptographic attestation |
| Audit trail | JWICS logs + classification records across J2 systems | Unified cryptographic proof of full disclosure chain |

---

## 3. Continuity of Authority During Surge Operations

**Setting:** A Navy Reserve unit receives mobilization activation from higher authority (SecNav/SecDef under 10 USC 12301-12304). The Commanding Officer is traveling with limited NSIPS access, and the Executive Officer — who holds broad inherent authority under Navy Regulations and the unit's Standard Organization and Regulations Manual (SORM) — needs to process mobilization administrative actions: recall notifications, NSIPS/NROWS personnel readiness updates, and gaining command coordination. However, IT system permissions have not been updated to reflect the XO's standing authority, stalling administrative processing during a time-critical mobilization window.

**Players:**
- **Navy Reserve Unit** (organization)
  - Commanding Officer — primary approval authority, traveling with limited NSIPS/NROWS access
  - Executive Officer — broad inherent authority under Navy Regulations/SORM, but IT system permissions not updated
  - Operations Department — mobilization recall execution and readiness reporting
  - Admin/Personnel
    - Admin Officer — initiates NSIPS/NROWS entries and recall notifications (requires CO or XO authorization)
  - RLSO Attorney — Region Legal Service Office attorney reviewing delegation scope under SECNAVINST 5216.5

**Action:** Admin Officer initiates mobilization administrative processing. Requires 1-of-1 CO authorization (with delegation to XO). Separate RLSO Attorney verification of delegation scope. CO pre-configures delegation before traveling so XO's system permissions match inherent authority.

---

### Today's Process

**Policy:** 1-of-1 from CO. No delegation allowed. Short expiry (20 sec). Separate RLSO Attorney check also required.

1. **NSIPS/NROWS actions submitted.** Admin Officer submits mobilization administrative actions requiring CO authorization — CO traveling with limited NSIPS/NROWS access at transit point. *(~8 sec delay)*

2. **Legal review.** RLSO Attorney reviews delegation authority scope, verifying whether the XO's inherent authority under Navy Regulations and SORM covers the requested administrative actions. *(~5 sec delay)*

3. **CO unreachable.** CO unreachable at transit point. NSIPS/NROWS personnel readiness updates and recall notifications on hold. Mobilization processing timeline slipping against activation order deadline. *(~12 sec delay)*

4. **Mobilization stalls.** Personnel cannot be recalled, NSIPS readiness updates cannot be processed, and gaining command coordination cannot proceed. The mobilization window narrows.

5. **Outcome:** 12+ hours of manual coordination. 7 days of risk exposure as the mobilization window passes. Either the XO acts without system permissions matching their inherent authority (creating a compliance gap in the IT audit trail) or the unit waits (creating a readiness gap against the activation order deadline).

**Metrics:** ~12 hours of coordination, 7 days of risk exposure, 3 audit gaps, 4 manual steps.

---

### With Accumulate

**Policy:** 1-of-1 from CO. Formal delegation to XO. Time-bound authority window. Separate RLSO Attorney verification (1-of-1, 60-sec window).

1. **Delegation pre-configured.** Before traveling, the CO pre-configures time-bound delegation to XO through the policy system, granting system permissions that match the XO's inherent authority under Navy Regulations and SORM for mobilization administrative actions.

2. **RLSO verification.** The RLSO Attorney validates the delegation scope under SECNAVINST 5216.5, confirming it covers recall notifications, NSIPS/NROWS updates, and gaining command coordination.

3. **XO processes mobilization actions.** Admin Officer initiates NSIPS/NROWS entries. XO's delegated system permissions are recognized automatically. Recall notifications, personnel readiness updates, and gaining command coordination proceed without delay.

4. **Full audit trail.** The delegation chain (CO → XO), RLSO Attorney verification, and the exact mobilization window are all captured in a cryptographic proof.

5. **Outcome:** XO processes mobilization administrative actions on schedule. System permissions match inherent authority. Authority expires automatically after the mobilization window. Complete audit trail for post-mobilization review under SECNAVINST 5216.5.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Delegation mechanism | Informal, paper delegation letter, IT permissions not updated | Formal, cryptographic, time-bound, system permissions match authority |
| When CO is traveling | NSIPS/NROWS actions stall, mobilization timeline slips | Pre-configured delegation to XO with system-recognized authority |
| Authority basis | XO has inherent authority but systems don't reflect it | System permissions automatically match SORM-defined authority |
| Legal verification | Separate manual RLSO review of delegation letter | Integrated RLSO policy evaluation |
| Readiness impact | Personnel mobilization delayed against activation deadline | On schedule |
| Audit trail | NSIPS logs + paper delegation letter | Cryptographic proof of full delegation chain under SECNAVINST 5216.5 |

---

## 4. Mission-Impact Authorization During Active Cyber Compromise

**Setting:** A cyber defense team detects active lateral movement in a classified network enclave supporting a mission-critical operational system. Standard DCO containment actions (host isolation, credential revocation, signature deployment) proceed immediately under pre-delegated standing authorities per the Commander's OPORD. However, the adversary's persistence mechanisms require full enclave isolation — which would degrade the supported mission-critical system. This mission-impact authorization resides with the Senior Commander, who is in transit with limited secure communications.

**Players:**
- **Cyber Operations Center** (organization)
  - Cyber Defense Team
    - Crew Commander — DCO crew commander with pre-delegated authority for standard containment; requires mission-impact authorization for full enclave isolation
  - Senior Commander — authorizes mission-impact decisions (in transit, unreachable)
  - Deputy Commander — second-in-command, delegation fallback per unit succession SOP
  - SIEM / Audit Log — records all containment actions and authorization decisions

**Action:** Crew Commander requests mission-impact authorization for full classified enclave isolation. Standard containment has already been executed under pre-delegated authority. Requires 1-of-1 Senior Commander approval with auto-escalation to Deputy Commander after 15 seconds. 15-minute authority window.

---

### Today's Process

**Policy:** 1-of-1 from Senior Commander for mission-impact decisions. No delegation. Short expiry (20 sec). Escalation blocked. Standard DCO containment proceeds under pre-delegated authority.

1. **Standard containment executed.** Crew Commander immediately executes pre-authorized containment actions — host-level isolation of identified compromised endpoints, credential revocation for compromised accounts, and deployment of protect signatures. These actions proceed under standing authority with no delay.

2. **Lateral movement continues.** Despite initial containment, adversary lateral movement continues via undiscovered persistence mechanisms. Full enclave isolation is required, which would degrade the supported mission-critical system.

3. **Mission-impact authorization sought.** Crew Commander contacts Senior Commander via STE/secure voice to authorize enclave isolation. Commander is in transit with limited secure communications — no response on primary or alternate lines. *(~10 sec delay)*

4. **No formal delegation path.** Crew Commander reviews Commander's OPORD to confirm full enclave isolation exceeds pre-delegated authority. No formal delegation path exists for mission-impact decisions. The Crew Commander must choose between isolating the enclave without authorization (creating a command authority gap) or waiting while lateral movement continues. *(~14 sec delay)*

5. **Outcome:** Either unauthorized enclave isolation (command authority gap and OPREP-3 compliance issues) or delayed containment (adversary expands foothold). Authorization chain reconstructed from STE call logs, SIEM records, and informal notes — fragmented across systems.

**Metrics:** ~4 hours of delay for mission-impact authorization, 7 days of degraded security posture, 5 audit gaps, 4 manual steps.

---

### With Accumulate

**Policy:** Standard DCO containment remains under pre-delegated authority (unchanged). Mission-impact authorization: 1-of-1 from Senior Commander with formal delegation to Deputy Commander. Auto-escalation after 15 seconds. 15-minute authority window.

1. **Standard containment proceeds immediately.** Pre-authorized DCO actions execute via existing SOAR/EDR tooling — no authorization delay for actions within standing authority.

2. **Mission-impact authorization requested.** Crew Commander submits mission-impact authorization request for full enclave isolation. Accumulate policy engine routes to the Senior Commander.

3. **Commander unreachable — delegation invoked.** Commander is unavailable. Accumulate automatically invokes the pre-configured delegation to the Deputy Commander, with full incident context from SIEM integration.

4. **Deputy Commander authorizes.** Deputy Commander reviews the mission-impact assessment and authorizes enclave isolation. Accumulate generates cryptographic proof of the delegation chain: Commander's pre-configured delegation, Deputy Commander's authorization, and the specific enclave isolation action — immediately available for OPREP-3 reporting.

5. **Outcome:** Mission-impact authorization obtained in minutes instead of hours. Enclave isolation executed immediately after authorization. Full cryptographic proof of authority chain for post-incident review and OPREP-3 reporting. No command authority gap.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Authorization timeline | Hours (manual STE/secure voice escalation) | Minutes (auto-delegation to Deputy Commander) |
| When Commander is unreachable | No formal delegation path for mission-impact decisions | Pre-configured delegation to Deputy Commander with cryptographic proof |
| Command authority risk | Authority gap if Crew Commander acts without authorization | Formal delegation chain eliminates authority gap |
| OPREP-3 compliance | Authorization chain reconstructed from fragmented logs | Cryptographic proof of complete authority chain available immediately |
| Audit trail | SIEM logs + STE call records + informal notes (fragmented) | Unified cryptographic proof of delegation and authorization integrated with SIEM |

---

## 5. Subcontractor CMMC Compliance & Supplier Qualification

**Setting:** A Tier-2 subcontractor providing critical components needs CMMC Level 2 certification validated and supplier qualification completed by a Prime Contractor before participating in a defense program handling CUI. Requirements include CMMC compliance validation against NIST SP 800-171, DFARS flow-down adherence, AS9100D quality management system verification, counterfeit part avoidance controls per SAE AS6171/AS6081, and component provenance documentation. The Quality Engineer is conducting an on-site supplier audit at another facility.

**Scope Note:** This scenario focuses on the cybersecurity compliance, quality, and program management approval gates within the prime contractor. It assumes the Contracting Officer has determined contract eligibility and DCMA oversight requirements are addressed separately.

**Players:**
- **Prime Contractor** (defense organization)
  - Cybersecurity & Compliance
    - Cybersecurity Compliance Manager — validates CMMC Level 2 certification (C3PAO assessment), NIST SP 800-171 self-assessment scores from SPRS, DFARS flow-down compliance, and SAM.gov registration
  - Quality & Provenance
    - Quality Engineer — verifies AS9100D certification via OASIS database, reviews counterfeit part avoidance controls per SAE AS6171/AS6081, and validates component provenance documentation (currently at on-site supplier audit)
    - QA Manager — authorized to perform supplier qualification review when QE is at on-site audit, maintaining quality function integrity per AS9100D Section 7.2
  - Program Manager — program-level approval, tracks schedule impact
- **Tier-2 Subcontractor** (lower-tier supplier)

**Action:** Tier-2 Subcontractor submits qualification documentation. Requires 2-of-3 from Cybersecurity Compliance Manager, Quality Engineer, and Program Manager. Separate quality and provenance review required — delegates to QA Manager when QE is at on-site audit.

---

### Today's Process

**Policy:** All 3 of 3 must approve (plus separate QA review). No delegation. Short windows.

1. **Documentation submitted.** CMMC compliance documentation, DFARS flow-down attestations, and AS9100D certificates emailed as PDF attachments. Cybersecurity Compliance Manager begins SPRS score review and SAM.gov registration verification separately. *(~10 sec delay)*

2. **Quality and provenance review.** Quality Engineer manually cross-references component serial numbers against provenance spreadsheets, checks OASIS database for AS9100D certification status, and screens GIDEP alerts for specific part numbers against counterfeit parts watchlist. *(~8 sec delay)*

3. **Quality Engineer unavailable.** Quality Engineer is conducting an on-site supplier audit at another facility. Quality and provenance review queued in shared inbox. No qualified QA personnel available to substitute — today's process has no delegation for quality functions. *(~14 sec delay)*

4. **Program delayed.** With 3-of-3 required and the Quality Engineer offsite, the subcontractor can't be qualified. Program milestones for defense system integration slip while waiting for QE to return.

5. **Outcome:** 480+ hours (20 business days) in the approval queue. 60 days of program risk exposure. Audit trail is email-based PDF submissions, disconnected SPRS/OASIS lookups, and spreadsheet-tracked provenance records that are difficult to correlate.

**Metrics:** ~480 hours (20 days) in the approval queue, 60 days of risk exposure, 8 audit gaps across disconnected compliance and quality systems, 12 manual steps.

---

### With Accumulate

**Policy:** 2-of-3 threshold (Cybersecurity Compliance Manager, Quality Engineer, Program Manager). QA review delegates to QA Manager when QE is at on-site audit — maintaining quality function integrity. Multi-day authority windows.

1. **Qualification submitted.** Tier-2 Subcontractor submits documentation. Policy engine routes to all three reviewers in parallel.

2. **Threshold met.** Cybersecurity Compliance Manager validates CMMC Level 2 status and SPRS score. Program Manager confirms program-level acceptance. The 2-of-3 threshold is met.

3. **QA review delegated.** The separate quality and provenance review is routed to the Quality Engineer. QE is at on-site audit — delegation automatically routes to the QA Manager, maintaining quality function integrity per AS9100D Section 7.2.

4. **Subcontractor qualified.** Cryptographic proof captures the full qualification chain — CMMC compliance validation, AS9100D certification verification, counterfeit part avoidance review, and provenance documentation acceptance. Government system-of-record entries (SPRS, SAM.gov, CMMC portal) remain authoritative.

5. **Outcome:** Subcontractor qualified in days instead of weeks. Quality function integrity maintained through proper QA delegation. Program schedule maintained. Complete regulatory audit trail.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Documentation delivery | Email-based PDF attachments to compliance team | Policy-based routing with integrated context |
| CMMC/SPRS compliance review | Manual SPRS lookup + email-based CMMC attestation | Cryptographic proof of compliance review and approval chain |
| Quality delegation | No delegation — QA functions blocked when QE is offsite | QA Manager receives delegated review, maintaining quality function integrity |
| When Quality Engineer is at on-site audit | Qualification blocked, program milestones slip | 2-of-3 threshold met, QA review delegated to QA Manager |
| Time to qualification | ~480 hours (20 days) | Days |
| Audit trail | Email PDFs + SPRS lookups + provenance spreadsheets (disconnected) | Unified cryptographic proof of full qualification chain |
