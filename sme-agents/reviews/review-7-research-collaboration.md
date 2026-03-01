# Secure Multi-Institution Research Collaboration Scenario -- SME Review

**Reviewer Profile:** Senior Research Governance, IRB Operations & Clinical Research Data Sharing SME (CIP, CCRP) -- 20+ years in HRPP administration, IRB operations, multi-institution research protocol management, HIPAA research provisions, and data use agreement governance at major academic medical centers and research universities
**Review Date:** 2026-02-28
**Scenario:** `healthcare-research-collaboration` -- Secure Multi-Institution Research Collaboration
**Files Reviewed:**
- `src/scenarios/healthcare/research-collaboration.ts`
- Narrative journey markdown (Section 2: Research Data Collaboration in `docs/scenario-journeys/healthcare-scenarios.md`)
- `src/lib/regulatory-data.ts` (healthcare entries: HIPAA, HITECH)
- `src/scenarios/archetypes.ts` (cross-org-boundary)
- `src/types/policy.ts` (Policy interface)
- `src/types/scenario.ts` (ScenarioTemplate interface)
- `src/types/organization.ts` (NodeType enum, Actor interface)

---

## 1. Executive Assessment

**Overall Credibility Score: C- (4.5/10)**

This scenario would trigger significant concern within the first three minutes of review by any Director of Human Research Protection Program, OHRP compliance reviewer, or CIP-certified IRB Chair with operational experience in multi-institution data sharing. The scenario demonstrates a surface-level familiarity with the vocabulary of research data governance -- IRB, data use agreements, de-identification, Privacy Officer -- but fundamentally misrepresents how these governance processes are structured, who performs them, and how they relate to each other. The most damaging structural error is that the scenario treats IRB review, DUA execution, and HIPAA privacy validation as a single sequential approval chain governed by a 2-of-3 threshold vote among three named individuals. In reality, these are functionally distinct governance processes managed by different offices (the HRPP/IRB office, the Office of General Counsel, and the Privacy/Compliance office), each with different review criteria, different decision-makers, and different timelines. They are parallel processes that happen in institutional silos -- but they are not interchangeable votes in a threshold quorum.

The Data Custodian is placed under the IRB, which conflates the ethical review function (IRB) with the data release execution function (data governance/honest broker). Legal counsel is entirely absent despite DUA negotiation being cited as a core governance requirement and typically the single largest bottleneck in multi-institution data sharing. The scenario invokes HIPAA compliance for "de-identified datasets," but truly de-identified data under HIPAA Safe Harbor or Expert Determination is not PHI and is not subject to HIPAA authorization, waiver, or DUA requirements -- the governance framework the scenario describes is appropriate for limited data sets or identified PHI, not de-identified data. The regulatory context cites HIPAA Section 164.312 (Security Rule access controls) rather than the actually relevant research provisions: Section 164.512(i) (uses and disclosures for research), Section 164.514(a)-(c) (de-identification standard), and Section 164.514(e) (limited data sets). The Common Rule (45 CFR Part 46) -- the foundational federal regulation governing human subjects research -- is not cited at all. GDPR is mentioned in the Privacy Officer's description without any justification for why a European regulation applies to what appears to be a US-to-US data sharing scenario.

The scenario's saving grace is that it correctly identifies genuine operational pain points: governance fragmentation across institutional silos, single-person bottlenecks (Privacy Officer unavailability), limited cross-institutional visibility and auditability, and data being copied into uncontrolled environments with no provenance tracking. These are real problems that cause real research delays. The "120 hours / 30 days" timeline, while conflating active effort with elapsed time, is actually conservative -- multi-institution DUA negotiation routinely takes 3-12 months at some academic medical centers. But the scenario's framing of the solution (a threshold vote that bypasses the Privacy Officer's de-identification validation) would alarm any HIPAA compliance officer, because releasing data without privacy validation risks an actual HIPAA breach if the de-identification was defective.

### Top 3 Most Critical Issues

1. **IRB review, DUA execution, and HIPAA privacy validation are modeled as a single threshold vote among three interchangeable approvers (Critical).** In reality, these are three functionally distinct governance processes managed by different institutional offices, each with unique review criteria and different decision-makers. The IRB (a committee, not an individual) reviews the research protocol for ethical compliance under the Common Rule. Legal counsel negotiates and executes the DUA (a binding legal agreement between institutions). The Privacy Officer validates de-identification methodology under HIPAA. These cannot be collapsed into a "2-of-3 threshold" where any two can substitute for the missing third. The Privacy Officer's de-identification validation cannot be bypassed by having the Research Director and Data Custodian approve instead -- they lack the HIPAA expertise and authority to validate de-identification. Similarly, the DUA cannot be "approved" by threshold vote -- it is a legal contract that requires legal counsel signature.

2. **Legal counsel is entirely absent from the scenario (Critical).** DUA negotiation and execution is a legal function performed by the Office of General Counsel (or equivalent) at both the providing and requesting institutions. DUA negotiation is universally cited by research administrators as the single largest bottleneck in multi-institution data sharing -- frequently taking 2-12 months due to redlining cycles between legal offices over liability, indemnification, publication rights, and intellectual property terms. A scenario about multi-institution research data sharing that omits legal counsel is like a scenario about clinical trials that omits the FDA. The "Research Director" role partially conflates with what should be distinct legal and data governance functions, but the legal negotiation component has no representation.

3. **The scenario invokes HIPAA compliance for "de-identified datasets" -- creating an internal contradiction (Critical).** If data is truly de-identified under HIPAA Safe Harbor (all 18 identifiers removed per Section 164.514(b)) or Expert Determination (qualified statistical expert certifies minimal re-identification risk per Section 164.514(a)), the data is NOT protected health information (PHI) under HIPAA. HIPAA authorization, waiver of authorization, and DUA requirements (under Section 164.514(e)) do not apply to de-identified data. The entire HIPAA governance apparatus the scenario describes -- Privacy Officer validation, HIPAA-compliant audit trail, Section 164.312 citation -- is either irrelevant (if the data is truly de-identified) or the scenario is mislabeling the data (it should say "limited data set" or "identifiable PHI" if HIPAA governance is required). This confusion would immediately undermine credibility with any Privacy Officer or HIPAA compliance specialist.

### Top 3 Strengths

1. **The core pain point is authentic and well-observed.** Governance fragmentation across institutional silos, cross-institutional auditability gaps, and single-person bottlenecks are genuine operational challenges that cause real research delays. The observation that data is "sometimes copied into uncontrolled environments with limited provenance tracking" is a widely recognized problem that resonates with anyone who has managed research data governance.

2. **The cross-organizational boundary framing is appropriate.** Multi-institution research data sharing genuinely crosses organizational boundaries with different governance structures, different systems, and no shared workflow visibility. The "cross-org-boundary" archetype is the right pattern for this scenario. Accumulate's value proposition for providing cross-institutional authorization proof and unified workflow visibility addresses a real gap.

3. **The Privacy Officer unavailability bottleneck is a realistic friction point.** Single-person dependencies in research governance are common -- particularly for HIPAA privacy validation, where the Privacy Officer may be the sole institutional authority for waiver of authorization or de-identification validation. The scenario correctly identifies this as a friction source, though the solution (bypassing the Privacy Officer via threshold vote) is problematic.

---

## 2. Line-by-Line Findings

### Finding 1: IRB Modeled as a "Department" -- IRB Is a Committee, Not a Department

- **Location:** `research-collaboration.ts`, actor `irb` (line ~35), `type: NodeType.Department`
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `{ id: "irb", type: NodeType.Department, label: "IRB", description: "Institutional Review Board — one of several fragmented governance bodies alongside legal, privacy, and data custodians", parentId: "hospital", organizationId: "hospital" }`
- **Problem:** The IRB is not a department. It is a federally mandated committee (under 45 CFR 46.107) composed of at least five voting members from diverse backgrounds including at least one scientist, one non-scientist, and one community member not affiliated with the institution. The IRB has administrative staff (IRB coordinators, regulatory specialists, an IRB administrator or HRPP Director) who manage the submission and review process, but the review and approval function is performed by the committee members. The IRB reports to the Institutional Official (typically the VP for Research or Provost), not as a department within the hospital. In an academic medical center, the administrative infrastructure is the Human Research Protection Program (HRPP), which includes the IRB, IRB staff, and the HRPP Director. The IRB should be modeled differently -- either as an organization-level governance body or, for simulation purposes, the relevant actor should be the "IRB Chair" or "Designated Reviewer" who performs the review function, and the "HRPP/IRB Office" as the administrative unit.
- **Corrected Text:** Replace the IRB department node with an "HRPP / IRB Office" department that contains the relevant review roles. The IRB approval function should be represented by a "Designated Reviewer" or "IRB Chair" role within that department. See corrected scenario in Section 4.
- **Source/Rationale:** 45 CFR 46.107 (IRB membership requirements); 45 CFR 46.108 (IRB functions and operations); AAHRPP accreditation standards for HRPP organizational structure.

### Finding 2: Data Custodian Placed Under IRB -- Conflates Review with Execution

- **Location:** `research-collaboration.ts`, actor `data-custodian` (line ~71), `parentId: "irb"`
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `{ id: "data-custodian", type: NodeType.Role, label: "Data Custodian", description: "Manages research data releases with limited provenance tracking across institutions", parentId: "irb", organizationId: "hospital" }`
- **Problem:** The Data Custodian does not report to the IRB. In academic medical centers, the Data Custodian (or equivalent roles: data manager, honest broker, data governance analyst, research data coordinator) sits in a separate office -- typically the Research Data Governance office, the Biomedical Informatics department, or Research IT. The IRB reviews and approves research protocols (ethical review function). The Data Custodian executes data releases under approved DUAs (operational execution function). These are fundamentally different governance functions. Placing the Data Custodian under the IRB conflates the ethical review function with the data release execution function and misrepresents the organizational structure of research data governance. In the honest broker model, the honest broker is specifically designed to be organizationally independent of both the researcher and the IRB to maintain separation of functions.
- **Corrected Text:** Create a "Research Data Governance" department (or "Biomedical Informatics") under the hospital, and place the Data Custodian under that department. See corrected scenario in Section 4.
- **Source/Rationale:** AAHRPP standards for organizational separation of HRPP functions; honest broker model as implemented at major academic medical centers (Partners HealthCare, Vanderbilt, UCSF); CTSA consortium data sharing governance frameworks.

### Finding 3: "Research Director" Role Is Ambiguous and Conflates Multiple Functions

- **Location:** `research-collaboration.ts`, actor `research-director` (line ~44), `description`
- **Issue Type:** Incorrect Jargon
- **Severity:** High
- **Current Text:** `{ id: "research-director", type: NodeType.Role, label: "Research Director", description: "Governs data use agreements and institutional research policy for cross-institution collaboration", parentId: "hospital", organizationId: "hospital" }`
- **Problem:** "Research Director" is an ambiguous title that does not map to a specific role in the research governance landscape at academic medical centers. The description says this role "governs data use agreements" -- but DUA governance involves two distinct functions: (1) legal negotiation and execution of the DUA (performed by the Office of General Counsel or Research Legal), and (2) institutional policy approval for data sharing (performed by the Data Governance Director, Associate Dean for Research, or a data access committee). The title "Research Director" could plausibly refer to: (a) the Associate Dean for Research / VP for Research (too senior for routine data access approvals -- this is the Institutional Official who signs off on institutional participation in research, not individual data releases), (b) the HRPP Director (manages IRB operations, does not approve data sharing directly), (c) the Director of Research Data Governance / Data Trust Director (manages data use agreements and data access requests -- this is the closest match), or (d) the Director of Research Compliance (handles research integrity and conflict of interest, not data sharing). A healthcare audience would not know which role is intended. The title should be specific: "Data Governance Director" or "Director of Research Data Services."
- **Corrected Text:** Rename to "Data Governance Director" with a description that accurately scopes the role: "Director of Research Data Governance — reviews and approves institutional data access requests, manages data use agreement lifecycle, and coordinates with legal counsel for DUA execution." See corrected scenario in Section 4.
- **Source/Rationale:** CTSA consortium governance structures; AAHRPP organizational models; operational titles at major academic medical centers (Harvard Catalyst, Vanderbilt VICTR, UCSF CTSI).

### Finding 4: Legal Counsel Is Entirely Absent -- DUA Negotiation Is Unrepresented

- **Location:** Entire scenario -- both TypeScript and narrative
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** No legal counsel role exists in the scenario despite the description and workflow referencing "data use agreement" and "legal authorization."
- **Problem:** Data Use Agreement negotiation and execution is a legal function. DUAs are binding legal contracts between institutions that specify: permitted uses and disclosures, restrictions on re-identification, publication rights, intellectual property ownership, liability and indemnification, data destruction requirements at study completion, and breach notification obligations. DUA negotiation is performed by legal counsel (Office of General Counsel, Research Legal, or Office of Sponsored Programs legal staff) at both the providing and requesting institutions. DUA negotiation is universally cited by research administrators as the single largest bottleneck in multi-institution data sharing -- frequently taking 2-12 months at some institutions due to redlining cycles between legal offices. A scenario that names "data use agreement" as a core governance step but omits legal counsel entirely is fundamentally incomplete. The scenario description states "legal authorization" is required, the prompt mentions "legal" approvals, but no legal role exists. This is a critical gap.
- **Corrected Text:** Add a "Research Legal Counsel" role under the hospital organization representing the Office of General Counsel's research legal function. See corrected scenario in Section 4.
- **Source/Rationale:** Universal practice at academic medical centers; DUA negotiation as primary bottleneck per CTSA consortium operational surveys; the scenario's own description cites "legal authorization" as required.

### Finding 5: HIPAA Invoked for De-Identified Data -- Internal Contradiction

- **Location:** `research-collaboration.ts`, description (line ~10), `regulatoryContext: REGULATORY_DB.healthcare`; narrative markdown throughout
- **Issue Type:** Regulatory Error
- **Severity:** Critical
- **Current Text:** The scenario description references "de-identified datasets." The regulatory context cites HIPAA Section 164.312 and HITECH breach notification. The narrative states the study is "IRB-approved" and involves "de-identified patient data." The "With Accumulate" outcome claims "Full HIPAA-compliant audit trail."
- **Problem:** If the data is truly de-identified under HIPAA -- either via Safe Harbor method (all 18 identifiers removed per 45 CFR 164.514(b)) or Expert Determination method (qualified statistical expert certifies minimal re-identification risk per 45 CFR 164.514(a)) -- then the data is NOT protected health information (PHI) under HIPAA. This has critical implications: (1) HIPAA authorization from patients is not required, (2) waiver of authorization from the IRB is not required, (3) a DUA is not required under HIPAA (though institutional policy may still require one), (4) Privacy Officer validation of the de-identification methodology IS required (to certify the data meets the de-identification standard), but once validated, the data is no longer PHI, (5) HITECH breach notification does not apply because the data is not PHI -- there is no "breach" to notify. The scenario simultaneously claims the data is "de-identified" and invokes full HIPAA governance apparatus (Privacy Officer validation, HIPAA-compliant audit trail, HIPAA Section 164.312). These are internally contradictory. Either the data should be described as a "limited data set" (which retains some identifiers, requires a DUA under Section 164.514(e), and is still PHI), or the HIPAA governance framework should be dramatically simplified.
- **Corrected Text:** Change the data type from "de-identified dataset" to "limited data set" throughout the scenario. This justifies the full governance apparatus (DUA requirement, Privacy Officer review, HIPAA audit trail) and resolves the internal contradiction. Alternatively, if de-identified data is intended, substantially reduce the HIPAA governance requirements and focus the governance on institutional policy, Common Rule compliance, and DUA terms. The corrected scenario in Section 4 uses "limited data set" as this better matches the governance structure described. Additionally, replace the HIPAA Section 164.312 citation with Section 164.512(i) and Section 164.514(e) which are the actually relevant research provisions.
- **Source/Rationale:** 45 CFR 164.514(a)-(c) (de-identification standard); 45 CFR 164.514(e) (limited data sets and DUAs); 45 CFR 164.512(i) (research uses and disclosures); HHS guidance on de-identification of PHI (November 2012, updated 2024); the distinction between PHI, limited data sets, and de-identified data is foundational HIPAA knowledge for any research governance professional.

### Finding 6: HIPAA Section 164.312 Is the Wrong Citation for Research Data Sharing

- **Location:** `regulatory-data.ts`, healthcare entry (line ~6), `displayName: "HIPAA §164.312"`, `clause: "Access Controls"`
- **Issue Type:** Regulatory Error
- **Severity:** High
- **Current Text:** `{ framework: "HIPAA", displayName: "HIPAA §164.312", clause: "Access Controls", violationDescription: "Unauthorized access to PHI without proper authorization verification", ... }`
- **Problem:** Section 164.312 is part of the HIPAA Security Rule and addresses technical access controls for electronic PHI (ePHI) -- user authentication, access control mechanisms, encryption, audit controls. While relevant to the technical infrastructure, it is not the operative HIPAA provision for research data sharing governance. The relevant HIPAA provisions for research data sharing are: (1) 45 CFR 164.512(i) -- conditions for using or disclosing PHI for research without patient authorization (including IRB/Privacy Board waiver criteria), (2) 45 CFR 164.514(a)-(c) -- the de-identification standard (Safe Harbor and Expert Determination methods), (3) 45 CFR 164.514(e) -- limited data sets and the DUA requirements for their use in research, (4) 45 CFR 164.508 -- the individual authorization requirement for research use of identified PHI (when no waiver is obtained). For a research data sharing scenario, the regulatory citation should reference Section 164.512(i) and/or Section 164.514(e), not Section 164.312.
- **Corrected Text:** See corrected scenario in Section 4. The HIPAA regulatory entry should cite: `displayName: "HIPAA §164.512(i) / §164.514(e)"`, `clause: "Research Use & Disclosure / Limited Data Sets"`, with violation and safeguard descriptions specific to research data sharing governance.
- **Source/Rationale:** 45 CFR 164.512(i); 45 CFR 164.514(e); HHS Office for Civil Rights (OCR) guidance on research uses of PHI; OHRP-OCR joint guidance on HIPAA and the Common Rule (2008, updated 2013).

### Finding 7: Common Rule (45 CFR Part 46) Not Cited -- The Foundational Research Regulation Is Missing

- **Location:** `research-collaboration.ts`, `regulatoryContext: REGULATORY_DB.healthcare`; entire scenario
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** The regulatory context inherits only HIPAA and HITECH from `REGULATORY_DB.healthcare`. No reference to the Common Rule.
- **Problem:** The Common Rule (45 CFR Part 46, subpart A, as revised in 2018) is the foundational federal regulation governing the protection of human subjects in research. If the research involves identifiable private information, the Common Rule requires: IRB review and approval, informed consent (or waiver), and for federally funded multi-site research, a single IRB of record under Section 46.114. The Common Rule, not HIPAA, is the primary regulatory framework that mandates IRB review. HIPAA is an overlay that applies when the data is PHI from a covered entity. A research data sharing scenario that cites HIPAA but omits the Common Rule is like a clinical trial scenario that cites HIPAA but omits the FDA -- it misidentifies the primary regulatory authority. Additionally, the narrative states the study is "federally funded," which triggers the single IRB (sIRB) mandate under Section 46.114 of the revised Common Rule. Under this mandate, multi-site federally funded research must use a single IRB of record, and participating institutions execute reliance agreements. This fundamentally changes the governance model from what the scenario describes (separate IRB reviews at each institution) to a centralized review model with institutional reliance.
- **Corrected Text:** Add the Common Rule as a regulatory context entry (see corrected scenario in Section 4). Also incorporate the single IRB mandate implications into the workflow description.
- **Source/Rationale:** 45 CFR Part 46, subpart A (revised effective January 21, 2019); 45 CFR 46.114 (single IRB mandate for cooperative research); OHRP guidance on the revised Common Rule.

### Finding 8: GDPR Reference in Privacy Officer Description Is Unjustified

- **Location:** `research-collaboration.ts`, actor `privacy-officer` (line ~55), `description`
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `description: "Validates de-identification compliance and re-identification risk under HIPAA and GDPR frameworks"`
- **Problem:** GDPR (the EU General Data Protection Regulation) is applicable only if: (a) the data involves EU/EEA residents, (b) the partner institution is in the EU/EEA, or (c) the research involves transfer of data to/from the EU/EEA. The scenario describes a US academic medical center sharing data with a US partner institution ("State University" in the narrative, "Partner Institution" in the TypeScript). There is no indication that GDPR applies. Including GDPR without justification signals either: (1) confusion about GDPR's territorial scope, or (2) an attempt to add regulatory weight by name-dropping a well-known regulation. If GDPR were genuinely applicable, the governance requirements would be substantially different: a Data Protection Impact Assessment (DPIA) would be required, Standard Contractual Clauses (SCCs) would be needed for cross-border data transfer, a Data Protection Officer (DPO) would be involved, and the GDPR's legal basis for research processing (Article 89) would need to be established. None of this is reflected in the scenario. A HIPAA Privacy Officer at a US institution would immediately challenge the GDPR reference.
- **Corrected Text:** Remove the GDPR reference. If the scenario is US-to-US, the description should read: "Validates de-identification methodology and re-identification risk under HIPAA Safe Harbor or Expert Determination standards." See corrected scenario in Section 4.
- **Source/Rationale:** GDPR Article 3 (territorial scope); GDPR Article 89 (research processing); the scenario provides no facts supporting GDPR applicability.

### Finding 9: Three Functionally Distinct Approvals Collapsed into a Single Threshold Vote

- **Location:** `research-collaboration.ts`, policies (line ~81), `threshold: { k: 2, n: 3, approverRoleIds: ["research-director", "privacy-officer", "data-custodian"] }`
- **Issue Type:** Incorrect Workflow
- **Severity:** Critical
- **Current Text:** `threshold: { k: 2, n: 3, approverRoleIds: ["research-director", "privacy-officer", "data-custodian"] }` and narrative: "Requires 2-of-3 approval from Research Director, Privacy Officer, and Data Custodian."
- **Problem:** The Research Director, Privacy Officer, and Data Custodian are not interchangeable approvers performing the same review. They perform fundamentally different governance functions: (1) The Research Director (or Data Governance Director) reviews the institutional data sharing policy compliance and approves the data access request from a governance perspective. (2) The Privacy Officer validates de-identification methodology under HIPAA -- this is a technical HIPAA compliance determination that cannot be delegated to non-privacy specialists. (3) The Data Custodian executes the data release after all governance approvals are obtained -- this is an operational execution role, not an approval role. A "2-of-3 threshold" implies these functions are interchangeable and any two can substitute for the third. But the Privacy Officer's HIPAA validation cannot be performed by the Research Director or Data Custodian -- they lack the HIPAA expertise and institutional authority. Similarly, the Data Custodian's execution role is sequential (happens after approvals), not parallel with the approval process. The correct model is: (a) Data Governance Director approves the data access request, (b) Privacy Officer validates de-identification (mandatory, not threshold), (c) Legal counsel executes the DUA (mandatory, not threshold), (d) after all approvals are obtained, Data Custodian executes the release. These are sequential prerequisites, some of which can run in parallel, but they are not a threshold vote.
- **Corrected Text:** Replace the single threshold policy with a multi-step approval model. Some steps can use threshold approvals (e.g., 1-of-2 authorized reviewers for data governance approval), but Privacy Officer validation and legal DUA execution should be mandatory prerequisites, not optional within a threshold. See corrected scenario in Section 4 for a restructured policy model.
- **Source/Rationale:** Operational workflow at any academic medical center with a mature research data governance program; AAHRPP standards for separation of HRPP functions; HIPAA Privacy Rule requiring institutional authority for de-identification certification (typically the Privacy Officer or their designated delegate).

### Finding 10: "Paper IRB Approval Records Stored in a Physical Filing Cabinet" Is Anachronistic

- **Location:** Narrative markdown, "Today's Process," Step 2
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** "A reviewer at the hospital cross-references the request against paper IRB approval records stored in a physical filing cabinet."
- **Problem:** In 2025-2026, paper-based IRB record keeping is not realistic for an institution described as an "Academic Medical Center" or "Metro Health System" -- institutions of this caliber universally use electronic IRB management systems (Huron IRB/IRBNet, ORCA/eIRB, iMedris, Advarra Oncore). AAHRPP accreditation (which most major academic medical centers maintain) effectively requires electronic protocol management and tracking. A few very small or under-resourced institutions might still use paper-based systems, but the scenario describes a major health system. The realistic "today" friction is not paper filing cabinets but rather: (1) the electronic IRB system at the providing institution is not interoperable with the requesting institution's system, (2) the PI must navigate an unfamiliar submission portal at the providing institution, (3) IRB approval status must be manually verified across institutions because the systems do not communicate, (4) document versions are managed through email attachments rather than a shared document management system. These are real frictions in electronic systems, not paper-era frictions.
- **Corrected Text:** "A research data governance coordinator at the hospital must manually verify the PI's IRB approval status by logging into the requesting institution's IRB portal (which requires a separate account) and cross-referencing approval dates and protocol scope against the data access request -- the two institutions' IRB systems have no automated interoperability." See corrected narrative in Section 4.
- **Source/Rationale:** AAHRPP accreditation standards; electronic IRB system adoption rates at academic medical centers (exceeds 95% at AAHRPP-accredited institutions); the realistic friction is system interoperability, not digitization.

### Finding 11: "University PI Emails the IRB Coordinator" -- Unrealistic Request Pathway

- **Location:** Narrative markdown, "Today's Process," Step 1
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text:** "The University PI emails the IRB coordinator with a data sharing request form attached."
- **Problem:** An external PI does not typically email the IRB coordinator directly to request data. The realistic workflow for requesting data from another institution is: (1) The PI contacts a collaborating investigator or the research data governance office at the providing institution (often through a research collaboration platform, institutional website, or personal network). (2) The providing institution's data governance office (not the IRB) conducts a feasibility assessment and determines the appropriate governance pathway. (3) If a DUA is required, the providing institution's legal office and the requesting institution's legal office begin DUA negotiation. (4) IRB review (if needed -- for truly de-identified data, the IRB may issue a "not human subjects research" (NHSR) determination, bypassing full review) is initiated through the formal IRB submission system, not via email. (5) The Privacy Officer reviews the de-identification methodology or processes the HIPAA waiver request. (6) After all governance approvals are obtained, the Data Custodian or honest broker executes the data release. Emailing the IRB coordinator with a "data sharing request form" conflates the IRB (ethical review) with the data governance office (data access management). The IRB coordinator manages protocol submissions and IRB meeting agendas -- they do not manage data access requests.
- **Corrected Text:** See corrected narrative in Section 4. The request should be directed to the providing institution's Research Data Governance office (or equivalent), not the IRB coordinator.
- **Source/Rationale:** Standard data access request workflows at academic medical centers; CTSA consortium operational models; institutional data governance portal workflows (e.g., Harvard Catalyst, Vanderbilt VICTR, UCSF Research Data Services).

### Finding 12: "DUA and IRB Application Submitted via Email" -- These Are Different Instruments to Different Offices

- **Location:** `research-collaboration.ts`, todayFriction manualSteps (line ~118)
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text:** `description: "Data use agreement and IRB application submitted via email — sequential review across fragmented governance bodies begins"`
- **Problem:** The DUA and the IRB application are fundamentally different instruments submitted to fundamentally different offices: (1) The IRB application (or protocol submission/amendment) is submitted to the IRB office (HRPP) through the electronic IRB submission system. It describes the research protocol, the data to be used, the data sources, and the privacy protections. (2) The DUA is a legal contract negotiated between the legal offices of the two institutions. It is typically initiated by the data governance office and routed to the Office of General Counsel for drafting and negotiation. Conflating these into a single email submission misrepresents the governance structure. They are initiated by different offices, reviewed by different people, and have different approval criteria. The friction should describe each process separately: the IRB application goes through the electronic IRB system, and the DUA goes through the legal/data governance channel.
- **Corrected Text:** See corrected scenario in Section 4, where the friction steps accurately distinguish between the IRB review pathway and the DUA/data governance pathway.
- **Source/Rationale:** Operational separation of IRB review and DUA negotiation at all major academic medical centers.

### Finding 13: Privacy Officer Validation Bypass via Threshold Is a HIPAA Risk

- **Location:** `research-collaboration.ts`, policies (line ~81); narrative "With Accumulate" section
- **Issue Type:** Incorrect Workflow / Regulatory Risk
- **Severity:** Critical
- **Current Text:** Accumulate scenario uses `k: 2, n: 3` threshold. Narrative states: "Research Director and Data Custodian both approve. The 2-of-3 threshold is met -- the Privacy Officer's leave doesn't block the research." And: "Privacy Officer reviews on return."
- **Problem:** If the Privacy Officer's function is to validate that the data is properly de-identified (or to approve the HIPAA waiver of authorization for limited data sets/identified PHI), bypassing this validation via threshold vote creates a direct HIPAA compliance risk. If data is released without Privacy Officer validation and the de-identification turns out to be defective (e.g., a rare disease diagnosis was not suppressed, dates were not properly shifted, geographic data is too granular), the institution has released PHI without authorization -- constituting a HIPAA breach requiring notification under HITECH. The Privacy Officer's validation is a mandatory compliance gate, not an optional vote in a threshold. The correct approach for addressing Privacy Officer unavailability is: (1) designate a Deputy Privacy Officer or Privacy Analyst who can perform the validation in the Privacy Officer's absence, (2) require pre-validated de-identification methodologies (validated once, reusable for multiple data releases) so that the Privacy Officer's approval is per-methodology rather than per-release, (3) use Accumulate to route to the designated backup privacy reviewer. Bypassing the privacy validation entirely is not a legitimate governance solution.
- **Corrected Text:** Make Privacy Officer (or designated deputy) validation a mandatory prerequisite that cannot be bypassed by threshold. Use delegation to a Deputy Privacy Officer for coverage during absences. See corrected scenario in Section 4.
- **Source/Rationale:** 45 CFR 164.514(a)-(c) (de-identification standard requires documentation); HHS OCR enforcement actions for defective de-identification (e.g., Memorial Hermann $2.4M, 2017); institutional liability for releasing improperly de-identified PHI.

### Finding 14: 7-Day Expiry (604800 Seconds) -- What Does This Represent?

- **Location:** `research-collaboration.ts`, policies (line ~89), `expirySeconds: 604800`
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `expirySeconds: 604800` (7 days)
- **Problem:** What does the 7-day authority window represent? Research data access is typically granted for the duration of the study (which can be 1-5 years). If 7 days is the window for the authorization approval to remain valid (i.e., all approvals must be obtained within 7 days or the request expires and must be resubmitted), that is plausible but aggressive -- DUA negotiation alone routinely takes weeks to months. If 7 days is the data access duration (the PI can use the data for 7 days), this is unrealistic for research -- studies typically require data access for months or years. The most logical interpretation is that 7 days represents the window within which the threshold approvals must be collected before the request expires, which would be reasonable for the internal governance approval portion (not including DUA negotiation). But this should be explicitly documented.
- **Corrected Text:** In the corrected scenario, the expiry is set to represent the internal governance approval window with a comment explaining what it represents. Data access duration is governed by the DUA terms, not the authorization expiry. See corrected scenario in Section 4.
- **Source/Rationale:** Operational timelines at academic medical centers; DUA negotiation timelines per CTSA consortium surveys.

### Finding 15: "120 Hours of Coordination" Conflates Active Effort with Elapsed Time

- **Location:** `research-collaboration.ts`, `beforeMetrics.manualTimeHours: 120`; narrative "Metrics"
- **Issue Type:** Metric Error
- **Severity:** Medium
- **Current Text:** `manualTimeHours: 120` and "~120 hours of coordination"
- **Problem:** 120 hours equals 15 full business days (8-hour days) or 3 full work weeks of continuous active coordination effort. For a multi-institution data sharing request, the total elapsed time can be 3-12 months, but the active coordination effort (emails, phone calls, form submissions, document reviews, meeting participation) is probably 30-60 hours spread over that elapsed period. The bulk of the elapsed time is passive waiting -- waiting for legal to complete DUA review, waiting for IRB meeting scheduling, waiting for Privacy Officer review. Conflating elapsed time with active manual effort inflates the metric and undermines its defensibility. A Research Data Governance Director would immediately challenge "120 hours of coordination" because their staff cannot spend 3 continuous weeks on a single data access request.
- **Corrected Text:** `manualTimeHours: 40` (representing realistic active coordination effort: 10+ hours for the PI and collaborator to prepare the request and supporting documentation, 10+ hours for IRB review coordination, 10+ hours for DUA drafting and negotiation, 5+ hours for privacy review coordination, 5+ hours for data custodian preparation). The narrative should clarify: "~40 hours of active coordination effort spread over 60-180 days of elapsed time." The elapsed time metric should be captured separately.
- **Source/Rationale:** CTSA consortium operational benchmarks; institutional data request tracking data; the scenario should distinguish between active effort and elapsed waiting time.

### Finding 16: "30 Days of Risk Exposure" Is Optimistic for the Elapsed Timeline

- **Location:** `research-collaboration.ts`, `beforeMetrics.riskExposureDays: 30`
- **Issue Type:** Metric Error
- **Severity:** Medium
- **Current Text:** `riskExposureDays: 30`
- **Problem:** If "risk exposure" refers to the elapsed time from request to data access, 30 days is optimistic for multi-institution data sharing. DUA negotiation alone routinely takes 2-6 months at many academic medical centers. A realistic range for the complete process (IRB review + DUA negotiation + privacy validation + data preparation) is 60-180 days at many institutions. If "risk exposure" refers to a more specific risk -- such as the window during which the research is delayed and grant funding is at risk -- 30 days might represent the initial delay before escalation mechanisms are triggered, but the total exposure is much longer. The metric should be specific about what risk is being measured. Plausible research-specific risks include: (1) grant funding timeline jeopardy (many grants have 1-year data collection windows), (2) scientific priority loss (competing researchers may publish first), (3) clinical impact delay (insights from the research are not available for clinical practice), (4) IRB approval expiration (IRB approvals are valid for one year and must be renewed -- if the data access process spans an IRB renewal period, the PI must submit a continuation review).
- **Corrected Text:** `riskExposureDays: 90` (representing a more realistic median elapsed time for multi-institution data access including DUA negotiation). The narrative should specify: "60-180 days of elapsed processing time, with research delayed by 90+ days. Risk includes grant timeline jeopardy, scientific priority loss, and IRB approval expiration." See corrected scenario in Section 4.
- **Source/Rationale:** CTSA consortium DUA processing time surveys; institutional data access request timelines reported in the literature (mean DUA execution time of 3-6 months at many institutions).

### Finding 17: "5 Audit Gaps" Not Enumerated

- **Location:** `research-collaboration.ts`, `beforeMetrics.auditGapCount: 5`
- **Issue Type:** Metric Error
- **Severity:** Medium
- **Current Text:** `auditGapCount: 5`
- **Problem:** The scenario claims 5 audit gaps but never enumerates them. For multi-institution research data sharing, plausible audit gaps include: (1) no unified cross-institutional audit trail linking IRB approval, DUA execution, privacy validation, and data release, (2) DUA terms not tracked against actual data use (no verification that the PI used the data only for the approved study), (3) de-identification validation not documented cryptographically or linked to the specific data release, (4) IRB approval status not verified at the time of data release (IRB approval may have expired), (5) PI credentials and CITI training completion not verified at time of data release, (6) data provenance lost after transfer (copies made to researchers' laptops, personal drives, shared drives outside the approved data environment), (7) DUA expiration not monitored (no verification that data was destroyed per DUA terms at study completion), (8) no accounting of disclosures as required under HIPAA for limited data set or PHI releases. Which 5 are intended? The metric should be defensible by enumeration.
- **Corrected Text:** `auditGapCount: 6` (enumerated in the corrected narrative: (1) no cross-institutional audit trail, (2) DUA compliance not tracked, (3) de-identification validation not linked to specific release, (4) IRB approval status not verified at release time, (5) data provenance lost after institutional transfer, (6) DUA expiration and data destruction not monitored). See corrected scenario in Section 4.
- **Source/Rationale:** Common findings in OHRP compliance reviews and institutional HRPP quality improvement audits; AAHRPP accreditation site visit findings related to data sharing governance.

### Finding 18: "8 Manual Steps" Are Not Enumerated or Aligned with Narrative

- **Location:** `research-collaboration.ts`, `beforeMetrics.approvalSteps: 8`; narrative describes 5 numbered steps
- **Issue Type:** Metric Error
- **Severity:** Low
- **Current Text:** `approvalSteps: 8` but the narrative describes only 5 steps in the "Today's Process"
- **Problem:** The narrative's 5 steps do not align with the claimed 8 manual steps. A realistic enumeration of manual steps for multi-institution data sharing might include: (1) PI contacts collaborator/data governance office at providing institution, (2) Feasibility assessment and pathway determination, (3) Data access request submitted through data governance portal, (4) IRB review initiated (submission to IRB system, possibly NHSR determination or expedited review), (5) DUA drafted by data governance office and sent to legal, (6) Legal negotiation rounds (multiple redline iterations), (7) Privacy Officer reviews de-identification methodology, (8) DUA executed (legal signatures on both sides), (9) Data Custodian/honest broker extracts and prepares the dataset, (10) Data release to PI with scope documentation, (11) PI confirms receipt and data integrity. This is actually 11 steps, making 8 a conservative count, but the narrative must enumerate whatever number is claimed.
- **Corrected Text:** `approvalSteps: 9` (enumerated in the corrected narrative). See corrected scenario in Section 4.
- **Source/Rationale:** Operational workflow documentation at academic medical centers; the metric should be defensible by enumeration.

### Finding 19: Naming Inconsistency -- "Academic Medical Center" vs. "Metro Health System"

- **Location:** `research-collaboration.ts`, actor `hospital` label "Academic Medical Center"; narrative "Metro Health System"
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text (TS):** `label: "Academic Medical Center"` / **Current Text (MD):** "Metro Health System"
- **Problem:** The TypeScript scenario uses "Academic Medical Center" for the hospital organization, while the narrative uses "Metro Health System." These must be consistent. "Academic Medical Center" is the more appropriate label for a scenario involving IRB review and research data governance, as it signals the institution's dual clinical and research mission. A "health system" label is acceptable but less specific. The naming should be aligned.
- **Corrected Text:** Both should use "Academic Medical Center" for consistency and to signal the research mission. See corrected scenario in Section 4.
- **Source/Rationale:** Internal consistency requirement.

### Finding 20: Naming Inconsistency -- "Partner Institution" vs. "State University"

- **Location:** `research-collaboration.ts`, actor `university` label "Partner Institution"; narrative "State University"
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text (TS):** `label: "Partner Institution"` and `description: "External research partner in a federated ecosystem spanning sponsors, CROs, and research networks"` / **Current Text (MD):** "State University"
- **Problem:** Two issues: (1) The TypeScript uses "Partner Institution" while the narrative uses "State University" -- these must be consistent. (2) The TypeScript description mentions "federated ecosystem spanning sponsors, CROs, and research networks," which describes a multi-stakeholder clinical trial environment (pharmaceutical sponsors, Contract Research Organizations). The narrative describes a two-institution academic research collaboration, which is a much simpler governance model. If the scenario is about a clinical trial with sponsors and CROs, the governance framework involves FDA 21 CFR Part 11, Good Clinical Practice (ICH-GCP), sponsor monitoring, and regulatory submissions -- none of which are in the scenario. If it is about a two-institution academic data sharing arrangement, the "sponsors, CROs, and research networks" language is misleading.
- **Corrected Text:** Both should use "State University" for concreteness. Remove the "federated ecosystem spanning sponsors, CROs, and research networks" language and replace with an accurate description of a requesting academic institution. See corrected scenario in Section 4.
- **Source/Rationale:** Internal consistency; accuracy of the research governance context.

### Finding 21: "IRB-Approved" Study but IRB Review Is Part of the Data Access Workflow

- **Location:** Narrative markdown, "Setting" and "Action"
- **Issue Type:** Inconsistency
- **Severity:** High
- **Current Text (Setting):** "an IRB-approved, federally funded research study" / **Current Text (Action):** "University PI requests access to a de-identified patient dataset for an IRB-approved research study. Requires 2-of-3 approval from Research Director, Privacy Officer, and Data Custodian."
- **Problem:** The narrative states the study is "IRB-approved" -- meaning IRB review has already been completed and the protocol is approved. But the TypeScript scenario description says "Approval requires IRB review, data use agreement, privacy validation, and legal authorization." If the study already has IRB approval, why is IRB review listed as a step in the data access workflow? These are different IRB actions: (1) The IRB approves the research protocol (already done, per the narrative). (2) A separate IRB review or determination may be needed specifically for the data sharing arrangement -- for example, the IRB at the providing institution may need to issue an NHSR determination for the de-identified data, or the single IRB may need to amend the protocol to include data from this source. The scenario should be specific about what IRB action is required at the data access stage. If the study is already IRB-approved, the remaining governance steps for data access are: DUA negotiation, privacy validation, and data custodian release -- not another round of IRB review.
- **Corrected Text:** Clarify in the corrected scenario that the research protocol has IRB approval from the single IRB of record. The governance steps for data access are: (1) Data governance review and approval, (2) DUA negotiation and execution, (3) Privacy validation of de-identification/limited data set preparation, (4) Data release. The IRB may need to review a protocol amendment if the data source was not included in the original protocol. See corrected scenario in Section 4.
- **Source/Rationale:** Distinction between protocol-level IRB approval and data-access-level governance steps; the revised Common Rule single IRB mandate.

### Finding 22: todayPolicies Requires 3-of-3 -- Unrealistic Unanimity Requirement

- **Location:** `research-collaboration.ts`, todayPolicies (line ~124), `threshold: { k: 3, n: 3 }`
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text:** `threshold: { k: 3, n: 3, approverRoleIds: ["research-director", "privacy-officer", "data-custodian"] }` and narrative: "All 3 of 3 must approve."
- **Problem:** As discussed in Finding 9, the "3-of-3" framing treats three functionally distinct governance processes as interchangeable votes. The realistic "today" state is not "3-of-3 must vote" but rather "multiple sequential prerequisites must all be satisfied": IRB determination must be obtained, DUA must be executed, privacy validation must be completed, and data custodian must release. Each is a different process with a different approver -- they are all necessary prerequisites, not a threshold vote. The "today" friction is that these are sequential silos with no shared workflow, each taking weeks to months, and any one can block the entire process. The 3-of-3 framing accidentally gets the right outcome (all must be satisfied, one being missing blocks the process) but misrepresents the structure.
- **Corrected Text:** The todayPolicies should represent the governance bottleneck differently -- perhaps a single mandatory approver (Privacy Officer) whose unavailability blocks the entire process, or a sequential prerequisite model where each step must complete before the next begins. See corrected scenario in Section 4 where the today policy reflects the sequential silo structure with a single-point-of-failure bottleneck.
- **Source/Rationale:** Operational reality of multi-institution data sharing governance; the "today" friction is sequential silos, not threshold voting.

### Finding 23: todayPolicies expirySeconds: 30 vs. Real-World 3-12 Months

- **Location:** `research-collaboration.ts`, todayPolicies (line ~133), `expirySeconds: 30`
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text:** `expirySeconds: 30` (simulation seconds)
- **Problem:** The todayPolicies expiry is 30 simulation seconds, representing the idea that approvals expire quickly and must be restarted if not completed promptly. The real-world process takes months. While all scenarios use simulation-compressed timescales, the compression ratio should be roughly consistent with other scenarios. The 30-second simulation window should map to a realistic "today" approval window -- perhaps the window within which the governance coordinator expects to collect all approvals before the request goes stale and must be re-verified.
- **Corrected Text:** This is acceptable as simulation compression, but the comment should clarify what real-world time it represents. See corrected scenario in Section 4.
- **Source/Rationale:** Simulation compression consistency.

### Finding 24: Delegation to Data Custodian Is Inappropriate

- **Location:** `research-collaboration.ts`, policies (line ~91), `delegateToRoleId: "data-custodian"`
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text:** `delegationAllowed: true, delegateToRoleId: "data-custodian"`
- **Problem:** Delegation of approval authority to the Data Custodian is inappropriate because: (1) the Data Custodian is an operational execution role, not an approval authority -- they execute data releases after approvals are obtained, they do not approve data sharing, (2) the Data Custodian would effectively be approving their own data release, which is a separation-of-duties violation, (3) in the corrected model where Privacy Officer validation is a mandatory gate, the Privacy Officer should delegate to a Deputy Privacy Officer or Privacy Analyst, not to the Data Custodian who has no HIPAA compliance expertise. Delegation should be to a functionally equivalent role: the Privacy Officer delegates to a Deputy Privacy Officer, the Data Governance Director delegates to a Data Governance Analyst, and legal counsel delegates to an Associate General Counsel.
- **Corrected Text:** Remove delegation to Data Custodian. In the corrected scenario, the Privacy Officer delegates to a Deputy Privacy Officer. See corrected scenario in Section 4.
- **Source/Rationale:** Separation of duties principles; HIPAA Privacy Officer delegation must be to someone with HIPAA expertise; data custodian is an execution role, not an approval role.

### Finding 25: Missing PI at the Providing Institution / Internal Sponsor

- **Location:** Entire scenario
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** The external PI at State University submits the request directly to the Academic Medical Center.
- **Problem:** In most multi-institution research collaborations, the external PI does not submit a data access request directly to the providing institution's data governance office. The typical model involves an internal collaborator or co-investigator at the providing institution who sponsors the data request internally. This internal collaborator: (1) confirms the feasibility of the data request, (2) serves as the local point of contact for the data governance, IRB, and legal offices, (3) may be listed as a co-investigator on the IRB protocol, and (4) has institutional knowledge of the internal data governance process. The absence of an internal collaborator makes the workflow less realistic -- an external PI cold-calling the data governance office is less common than working through an internal collaborator.
- **Corrected Text:** Consider adding a "Collaborating PI" or "Site PI" role at the Academic Medical Center who sponsors the data request internally. For simplicity, the corrected scenario in Section 4 includes this role.
- **Source/Rationale:** Standard multi-institution research collaboration models; CTSA consortium operational frameworks.

### Finding 26: "Accumulate Over-Claim" -- "Full HIPAA-Compliant Audit Trail Spanning Both Organizations"

- **Location:** Narrative markdown, "With Accumulate" Outcome
- **Issue Type:** Over-Claim
- **Severity:** Medium
- **Current Text:** "Full HIPAA-compliant audit trail spanning both organizations."
- **Problem:** What constitutes a "HIPAA-compliant audit trail" for research data sharing? HIPAA requires: (1) documentation of the authorization or waiver of authorization (if applicable), (2) the DUA (if limited data set), (3) evidence of de-identification (if de-identified data), and (4) accounting of disclosures (covered entities must track disclosures of PHI for research). Accumulate can provide cryptographic proof of authorization decisions and maintain a cross-institutional log. But it cannot constitute the full "HIPAA-compliant audit trail" without: (a) the actual DUA document, (b) the de-identification methodology documentation, (c) the IRB determination letter, (d) the accounting of disclosures entry. Claiming "full HIPAA-compliant audit trail" overstates Accumulate's contribution. A more defensible claim: "Cryptographic proof of the complete authorization chain (who approved, when, under what policy) spanning both institutions -- supporting HIPAA compliance documentation requirements."
- **Corrected Text:** See corrected narrative in Section 4. The claim is scoped to what Accumulate actually provides: authorization chain proof, not the complete HIPAA compliance documentation package.
- **Source/Rationale:** HIPAA Privacy Rule documentation requirements (45 CFR 164.530(j)); the distinction between authorization proof (Accumulate's contribution) and the broader compliance documentation package.

### Finding 27: "~120 Hours / 30 Days to Days" Improvement Claim Is Not Defensible

- **Location:** Narrative markdown, Takeaway table
- **Issue Type:** Over-Claim
- **Severity:** High
- **Current Text:** "Research timeline: ~120 hours / 30 days --> Days"
- **Problem:** Accumulate can accelerate the authorization routing and remove single-person bottlenecks via delegation. But the multi-institution data sharing timeline is dominated by processes that Accumulate cannot accelerate: (1) DUA legal negotiation (requires human lawyers to negotiate terms -- 2-12 months at many institutions), (2) IRB review timeline (committee meetings are scheduled monthly or bi-monthly), (3) de-identification processing time (data extraction, transformation, and de-identification is technical work that takes days to weeks), (4) data quality review and preparation. Accumulate can improve: (a) routing speed (minutes instead of email delays), (b) approver bottleneck removal (threshold/delegation), (c) cross-institutional visibility (PI can track request status), (d) audit trail (cryptographic proof). A defensible improvement claim: "Internal governance approval cycle reduced from weeks to days; cross-institutional visibility from zero to real-time. Total elapsed time still depends on DUA negotiation and data preparation, which Accumulate accelerates through workflow transparency but cannot eliminate." "Days" as the total timeline is not defensible.
- **Corrected Text:** See corrected narrative in Section 4, which scopes the improvement to what Accumulate can realistically deliver.
- **Source/Rationale:** Operational reality of multi-institution data sharing timelines; the bottleneck is human legal negotiation and data preparation, not authorization routing.

### Finding 28: Partner Institution Description Mentions "Sponsors, CROs, and Research Networks" -- Scope Confusion

- **Location:** `research-collaboration.ts`, actor `university` (line ~29), `description`
- **Issue Type:** Incorrect Jargon
- **Severity:** Medium
- **Current Text:** `description: "External research partner in a federated ecosystem spanning sponsors, CROs, and research networks"`
- **Problem:** This description suggests a pharmaceutical clinical trial ecosystem involving industry sponsors and Contract Research Organizations (CROs). The narrative describes an academic research data sharing arrangement between a university and a hospital. These are fundamentally different governance models. Academic data sharing is governed by the Common Rule, HIPAA, and institutional DUAs. Pharmaceutical clinical trials are additionally governed by FDA 21 CFR Part 11, ICH-GCP (Good Clinical Practice), and sponsor-investigator agreements. Using pharmaceutical trial language ("sponsors, CROs") for an academic data sharing scenario introduces scope confusion that would be immediately noticed by any research governance professional.
- **Corrected Text:** `description: "External academic research partner requesting data access for a federally funded, IRB-approved study"`. See corrected scenario in Section 4.
- **Source/Rationale:** Distinction between academic research data sharing and pharmaceutical clinical trial governance; the scenario's narrative describes an academic collaboration.

---

## 3. Missing Elements

### Missing Roles (Critical Gaps)

1. **Legal Counsel / Office of General Counsel (Research Legal):** DUA negotiation and execution is a legal function. Legal counsel on both sides must negotiate DUA terms (permitted uses, liability, indemnification, publication rights, IP, data destruction). This is the single largest bottleneck in multi-institution data sharing and has no representation in the scenario.

2. **Deputy Privacy Officer / Privacy Analyst:** If the Privacy Officer is a single point of failure (as depicted), the institution should have a designated backup with HIPAA expertise. This role is the appropriate delegation target for the Privacy Officer's function, not the Data Custodian.

3. **Collaborating PI / Site PI at the Providing Institution:** In most multi-institution collaborations, the external PI works through an internal collaborator at the providing institution who sponsors the data request internally, confirms feasibility, and serves as the local point of contact for governance offices.

4. **Designated Reviewer / IRB Chair:** The IRB does not approve protocols as a monolith. For expedited review (minimal risk data sharing), a designated reviewer from the IRB reviews and approves. For full board review, the convened board votes. The scenario has no representation of who on the IRB performs the review function.

5. **Honest Broker / De-Identification Specialist:** If the data is de-identified or prepared as a limited data set, someone must perform the data extraction, transformation, and de-identification. This is typically a data analyst, honest broker, or de-identification specialist in the biomedical informatics or data governance office -- distinct from the Data Custodian (who manages the release) and the Privacy Officer (who validates the methodology).

### Missing Workflow Steps

1. **Internal collaborator contact and feasibility assessment:** The external PI contacts an internal collaborator or the data governance office to confirm data availability and determine the governance pathway.
2. **DUA drafting by data governance office:** The data governance office prepares a draft DUA based on the data request scope.
3. **DUA legal negotiation (multiple redline rounds):** Legal counsel at both institutions negotiate DUA terms. This is typically the longest step.
4. **IRB determination (NHSR determination or expedited review):** The IRB issues a determination on whether the project constitutes human subjects research, potentially routing to a designated reviewer for expedited review.
5. **De-identification / limited data set preparation by honest broker:** A de-identification specialist extracts and prepares the dataset according to the approved methodology.
6. **DUA execution (legal signatures on both sides):** Final DUA execution after negotiation is complete.
7. **Data quality review:** The PI reviews the released data for quality, completeness, and fitness for the research purpose.

### Missing Regulatory References

1. **Common Rule (45 CFR Part 46):** The foundational federal regulation for human subjects research protection. Mandates IRB review, informed consent requirements, and (for federally funded multi-site research) the single IRB mandate under Section 46.114.
2. **HIPAA Section 164.512(i):** Conditions for use and disclosure of PHI for research, including waiver of authorization criteria.
3. **HIPAA Section 164.514(a)-(c) and (e):** De-identification standard (Safe Harbor and Expert Determination) and limited data set / DUA requirements.
4. **NIH Data Management and Sharing Policy (2023):** For NIH-funded research, mandatory data sharing plans with provisions for access controls, de-identification, and data repositories.
5. **State privacy laws (e.g., California CMIA, New York PHL):** State-specific research data sharing requirements that may be more restrictive than HIPAA.

### Missing System References

1. **Electronic IRB System (Huron IRB, ORCA, iMedris):** The system through which IRB protocols are submitted, reviewed, and tracked.
2. **Research Data Warehouse / Clinical Data Repository (i2b2, TriNetX, Epic Caboodle):** The source system from which research data is extracted for de-identification and release.
3. **Secure File Transfer / Data Enclave (Globus, SFTP, institutional secure share):** The mechanism through which data is transferred to the requesting institution.

---

## 4. Corrected Scenario

### Corrected TypeScript Scenario Definition

```typescript
// File: src/scenarios/healthcare/research-collaboration.ts
import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const researchCollaborationScenario: ScenarioTemplate = {
  id: "healthcare-research-collaboration",
  name: "Secure Multi-Institution Research Data Sharing",
  description:
    "A principal investigator at State University requests access to a limited data set from the Academic Medical Center for a federally funded, IRB-approved multi-institution study. Governance is fragmented across the HRPP/IRB office, the Research Data Governance office, legal counsel, and the Privacy Officer — each operating in separate systems with no shared workflow. The DUA must be negotiated between legal offices, the Privacy Officer must validate the limited data set preparation methodology, and the Data Governance Director must approve the institutional data release. These processes run in silos, often sequentially by default rather than by design. Cross-institutional auditability is limited, and data provenance is lost after transfer.",
  icon: "Heartbeat",
  industryId: "healthcare",
  archetypeId: "cross-org-boundary",
  prompt:
    "What happens when a multi-institution research data sharing request requires parallel governance approvals from separate institutional offices (IRB, legal, privacy, data governance) but these offices operate in silos with no shared workflow, and a key approver is unavailable?",
  actors: [
    {
      id: "hospital",
      type: NodeType.Organization,
      label: "Academic Medical Center",
      parentId: null,
      organizationId: "hospital",
      color: "#EF4444",
    },
    {
      id: "university",
      type: NodeType.Partner,
      label: "State University",
      description:
        "External academic research partner requesting limited data set access for a federally funded, IRB-approved study",
      parentId: null,
      organizationId: "university",
      color: "#8B5CF6",
    },
    {
      id: "hrpp-office",
      type: NodeType.Department,
      label: "HRPP / IRB Office",
      description:
        "Human Research Protection Program — manages IRB protocol submissions, reviews, and determinations; the IRB is a federally mandated committee within this office",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#06B6D4",
    },
    {
      id: "data-governance",
      type: NodeType.Department,
      label: "Research Data Governance",
      description:
        "Manages institutional data access requests, data use agreements, honest broker services, and research data releases",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#06B6D4",
    },
    {
      id: "data-governance-director",
      type: NodeType.Role,
      label: "Data Governance Director",
      description:
        "Director of Research Data Governance — reviews and approves institutional data access requests, coordinates DUA lifecycle with legal counsel, and oversees honest broker operations",
      parentId: "data-governance",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "privacy-officer",
      type: NodeType.Role,
      label: "Privacy Officer",
      description:
        "HIPAA Privacy Officer — validates limited data set preparation methodology, reviews de-identification compliance under HIPAA Safe Harbor or Expert Determination, and approves waivers of authorization when required",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "deputy-privacy-officer",
      type: NodeType.Role,
      label: "Deputy Privacy Officer",
      description:
        "Designated backup for the Privacy Officer — authorized to perform HIPAA privacy validation and waiver of authorization review during Privacy Officer absence",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "legal-counsel",
      type: NodeType.Role,
      label: "Research Legal Counsel",
      description:
        "Office of General Counsel — negotiates and executes data use agreements, reviews liability and indemnification terms, and ensures institutional legal protections for research data sharing",
      parentId: "hospital",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "data-custodian",
      type: NodeType.Role,
      label: "Data Custodian / Honest Broker",
      description:
        "Extracts data from the clinical data warehouse, applies limited data set preparation per validated methodology, and executes the data release after all governance approvals are obtained",
      parentId: "data-governance",
      organizationId: "hospital",
      color: "#94A3B8",
    },
    {
      id: "university-pi",
      type: NodeType.Role,
      label: "Principal Investigator",
      description:
        "Lead researcher at State University requesting limited data set access from the Academic Medical Center for a federally funded, IRB-approved multi-institution study",
      parentId: "university",
      organizationId: "university",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      // Data governance approval: 1-of-2 authorized reviewers can approve
      // This models the threshold benefit — Data Governance Director or designated backup
      id: "policy-data-governance-approval",
      actorId: "data-governance",
      threshold: {
        k: 1,
        n: 2,
        approverRoleIds: ["data-governance-director", "data-custodian"],
      },
      // 14-day window for internal governance approvals to be collected
      expirySeconds: 1209600,
      delegationAllowed: true,
      delegateToRoleId: "data-custodian",
    },
    {
      // Privacy validation: MANDATORY — cannot be bypassed by threshold
      // Privacy Officer or Deputy Privacy Officer must validate
      id: "policy-privacy-validation",
      actorId: "hospital",
      threshold: {
        k: 1,
        n: 2,
        approverRoleIds: ["privacy-officer", "deputy-privacy-officer"],
      },
      expirySeconds: 1209600,
      delegationAllowed: true,
      delegateToRoleId: "deputy-privacy-officer",
      // Privacy validation is mandatory — this is the key control that prevents
      // release of improperly prepared limited data sets
      mandatoryApprovers: ["privacy-officer"],
    },
  ],
  edges: [
    { sourceId: "hospital", targetId: "hrpp-office", type: "authority" },
    { sourceId: "hospital", targetId: "data-governance", type: "authority" },
    { sourceId: "hospital", targetId: "privacy-officer", type: "authority" },
    {
      sourceId: "hospital",
      targetId: "deputy-privacy-officer",
      type: "authority",
    },
    { sourceId: "hospital", targetId: "legal-counsel", type: "authority" },
    {
      sourceId: "data-governance",
      targetId: "data-governance-director",
      type: "authority",
    },
    {
      sourceId: "data-governance",
      targetId: "data-custodian",
      type: "authority",
    },
    { sourceId: "university", targetId: "university-pi", type: "authority" },
    // Delegation: Privacy Officer to Deputy Privacy Officer
    {
      sourceId: "privacy-officer",
      targetId: "deputy-privacy-officer",
      type: "delegation",
    },
    // Delegation: Data Governance Director to Data Custodian for approval function
    {
      sourceId: "data-governance-director",
      targetId: "data-custodian",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "Multi-institution limited data set access with parallel governance",
    initiatorRoleId: "university-pi",
    targetAction:
      "Access to Limited Data Set from Academic Medical Center for Federally Funded Multi-Institution Study",
    description:
      "Principal Investigator at State University requests access to a limited data set from the Academic Medical Center for a federally funded, IRB-approved study. Requires parallel governance approvals: Data Governance Director approves the institutional data release, Privacy Officer validates the limited data set preparation methodology, and Legal Counsel executes the DUA. Today these run in silos — often sequentially by default — with no shared workflow or cross-institutional visibility.",
  },
  beforeMetrics: {
    // 40 hours of active coordination effort spread over 60-180 days elapsed
    manualTimeHours: 40,
    // 90 days: realistic median elapsed time for multi-institution data access
    // including DUA negotiation (the dominant bottleneck)
    riskExposureDays: 90,
    // 6 enumerated audit gaps:
    // (1) no cross-institutional audit trail
    // (2) DUA compliance not tracked against actual data use
    // (3) de-identification/LDS validation not linked to specific release
    // (4) IRB approval status not verified at time of data release
    // (5) data provenance lost after institutional transfer
    // (6) DUA expiration and data destruction not monitored
    auditGapCount: 6,
    // 9 steps enumerated in narrative
    approvalSteps: 9,
  },
  todayFriction: {
    ...ARCHETYPES["cross-org-boundary"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        // Real-world: days to weeks for initial routing through institutional silos
        description:
          "Data access request submitted to Research Data Governance office — governance coordinator must separately route to legal counsel, Privacy Officer, and IRB office through disconnected systems; each office operates on its own timeline with no shared workflow",
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        // Real-world: weeks for Privacy Officer review of LDS methodology
        description:
          "Privacy Officer reviewing limited data set preparation methodology — verifying that appropriate identifiers are removed per HIPAA Safe Harbor requirements; must cross-reference against the specific variables requested by the PI",
        delaySeconds: 8,
      },
      {
        trigger: "on-unavailable",
        // Real-world: weeks to months if Privacy Officer is sole authority
        description:
          "Privacy Officer on extended leave — no designated Deputy Privacy Officer is configured in the governance workflow; DUA negotiation with legal also stalled awaiting privacy validation before legal will finalize terms",
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Parallel governance processes running sequentially by default in disconnected institutional silos",
  },
  todayPolicies: [
    {
      // Today: Privacy Officer is the sole authority — no backup configured
      // This is the realistic bottleneck: single point of failure
      id: "policy-research-collaboration-today",
      actorId: "hospital",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["privacy-officer"],
      },
      // Short simulation window representing tight institutional approval cycle
      expirySeconds: 30,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "Common Rule",
      displayName: "Common Rule (45 CFR Part 46)",
      clause: "Subpart A / Section 46.114 (Single IRB Mandate)",
      violationDescription:
        "Failure to obtain IRB review for research involving identifiable private information, or failure to use a single IRB for federally funded multi-site research as required under the revised Common Rule",
      fineRange:
        "Institutional debarment from federal research funding; suspension of all federally funded research protocols; OHRP compliance determination letters",
      severity: "critical" as const,
      safeguardDescription:
        "Accumulate provides cryptographic proof that IRB approval was active at the time of data release and maintains a verifiable record of single IRB reliance across institutions",
    },
    {
      framework: "HIPAA",
      displayName: "HIPAA §164.512(i) / §164.514(e)",
      clause:
        "Research Use & Disclosure / Limited Data Sets and Data Use Agreements",
      violationDescription:
        "Disclosure of a limited data set for research without a valid data use agreement, or release of data that does not meet de-identification or limited data set standards, constituting unauthorized disclosure of PHI",
      fineRange:
        "$137 - $68,928 per violation (Tier 1-3); $2,067,813 annual cap per identical violation category; willful neglect penalties up to $2M+ per violation category (adjusted annually for inflation per 45 CFR 160.404)",
      severity: "critical" as const,
      safeguardDescription:
        "Accumulate enforces policy-driven data release authorization requiring validated Privacy Officer approval of limited data set methodology and executed DUA before data release, with cryptographic proof of the complete authorization chain",
    },
    {
      framework: "HITECH",
      displayName: "HITECH Act §13402",
      clause: "Breach Notification",
      violationDescription:
        "Release of improperly de-identified data constituting a breach of unsecured PHI — triggers notification obligations to affected individuals, HHS, and (for breaches affecting 500+) media",
      fineRange:
        "$100K - $1.5M per violation category; state attorney general actions; OCR enforcement (e.g., Advocate Health $5.55M, Memorial Hermann $2.4M)",
      severity: "high" as const,
      safeguardDescription:
        "Accumulate's mandatory Privacy Officer validation gate ensures limited data set preparation methodology is certified before data release, preventing improperly de-identified data from being released and triggering breach notification",
    },
  ],
  tags: [
    "healthcare",
    "research",
    "cross-org",
    "hipaa",
    "irb",
    "common-rule",
    "limited-data-set",
    "data-use-agreement",
    "single-irb",
    "privacy-validation",
    "multi-institution",
  ],
};
```

### Corrected Narrative Journey (Markdown)

```markdown
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

**Metrics:** ~40 hours of active coordination effort spread over 90+ days elapsed time. 90 days of research delay risk exposure (grant timeline jeopardy, scientific priority loss). 6 audit gaps (enumerated: no cross-institutional trail, DUA compliance untracked, privacy validation not linked to release, IRB status unverified at release, data provenance lost post-transfer, DUA expiration unmonitored). 9 manual steps.

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
```

---

## 5. Credibility Risk Assessment

### Director of Human Research Protection Program (HRPP) at an AAHRPP-Accredited Academic Medical Center

**Original scenario risk: WOULD IDENTIFY FUNDAMENTAL STRUCTURAL ERRORS.**

An HRPP Director would immediately note: (1) the IRB is modeled as a department when it is a federally mandated committee, (2) the Data Custodian is placed under the IRB (conflating review with execution), (3) the Common Rule is not cited despite being the foundational regulation for human subjects research, (4) the single IRB mandate for federally funded multi-site research is not addressed, (5) the 2-of-3 threshold bypasses the Privacy Officer's mandatory HIPAA validation, which the HRPP Director would view as a compliance risk, not a process improvement. The HRPP Director would conclude that the scenario was authored by someone outside the research governance community who has a surface-level understanding of the vocabulary but not the operational structure.

**Corrected scenario risk: CREDIBLE WITH RESIDUAL CONCERNS.** The corrected scenario accurately represents the HRPP organizational structure, correctly separates IRB review from data governance execution, makes privacy validation mandatory with delegation to a qualified backup, and includes the Common Rule and single IRB mandate. The HRPP Director would note that DUA legal negotiation -- the dominant bottleneck -- is acknowledged as requiring human effort that Accumulate cannot fully automate, which demonstrates honest scoping. Residual concern: the Director might note that the Deputy Privacy Officer delegation requires prior institutional designation and training, which should be a precondition, not something configured on the fly.

### OHRP Compliance Reviewer Auditing Research Data Sharing Practices

**Original scenario risk: WOULD FLAG REGULATORY GAPS.**

An OHRP reviewer would immediately note: (1) the Common Rule is absent from the regulatory context, (2) the single IRB mandate for federally funded cooperative research is not addressed, (3) the scenario conflates de-identified data with limited data sets, creating confusion about which HIPAA provisions apply, (4) the threshold model that bypasses privacy validation would be viewed as a risk to participant protections. The reviewer would not view this as a credible representation of how research data sharing governance works at a compliant institution.

**Corrected scenario risk: WOULD ACCEPT AS REALISTIC.** The corrected scenario cites the Common Rule as the primary regulatory framework, addresses the single IRB mandate, correctly distinguishes limited data sets from de-identified data, and makes privacy validation mandatory. The OHRP reviewer would recognize the governance fragmentation and sequential silo problems as common institutional challenges.

### HIPAA Privacy Officer at a Large Hospital System Reviewing Research Data Sharing

**Original scenario risk: WOULD CHALLENGE THE HIPAA FRAMEWORK IMMEDIATELY.**

A Privacy Officer would flag: (1) HIPAA Section 164.312 is the wrong citation (Security Rule access controls, not research provisions), (2) the scenario claims "de-identified data" but invokes full HIPAA governance that only applies to PHI or limited data sets, (3) GDPR is cited without justification for a US-to-US scenario, (4) the threshold model bypasses the Privacy Officer's mandatory validation function -- the Privacy Officer would view this as a proposal to bypass their institutional authority, which would generate immediate resistance. The Privacy Officer would reject the scenario as fundamentally confused about HIPAA's application to research data.

**Corrected scenario risk: CREDIBLE AND ALIGNED.** The corrected scenario correctly identifies the data as a limited data set, cites the correct HIPAA provisions (Section 164.512(i) and Section 164.514(e)), removes the unjustified GDPR reference, and makes the Privacy Officer's validation mandatory with delegation to a designated Deputy. The Privacy Officer would view Accumulate as a tool that supports their function (automatic routing, delegation to qualified backup, cryptographic proof of their validation) rather than bypassing it.

### Research Data Governance Director at a CTSA Hub Institution

**Original scenario risk: WOULD IDENTIFY OPERATIONAL INACCURACIES.**

A Data Governance Director would note: (1) "Research Director" is an ambiguous title that does not match any operational role in their governance structure, (2) the Data Custodian does not report to the IRB at any institution they have worked at, (3) legal counsel is absent despite DUA negotiation being the single largest bottleneck in their daily operations, (4) the "paper filing cabinet" friction is not representative of institutions at this caliber, (5) the 120 hours metric conflates effort with elapsed time. The Director would have moderate interest in the cross-institutional visibility and workflow routing capabilities but would not trust the scenario's depiction of current-state operations.

**Corrected scenario risk: CREDIBLE AND COMPELLING.** The corrected scenario correctly represents the data governance organizational structure, distinguishes the IRB function from the data governance function, includes legal counsel as a governance participant, depicts realistic friction (system interoperability gaps, sequential silos, DUA negotiation bottleneck), and uses defensible metrics. The Data Governance Director would recognize this as an authentic depiction of their operational challenges and would engage with the Accumulate value proposition.

### CIP-Certified IRB Chair with 15+ Years of IRB Administration

**Original scenario risk: WOULD CHALLENGE IRB REPRESENTATION.**

An IRB Chair would note: (1) the IRB is a committee with voting members, not a department with an employee (the Data Custodian), (2) the scenario does not specify who on the IRB is performing the review (designated reviewer? convened board?), (3) the threshold model treats IRB review as interchangeable with privacy validation and data governance approval, when these are entirely different governance functions, (4) the Common Rule is not cited despite being the regulation that mandates IRB review. The IRB Chair would view the scenario as conflating the IRB with the broader research governance infrastructure.

**Corrected scenario risk: CREDIBLE.** The corrected scenario correctly represents the HRPP/IRB Office as the administrative unit, acknowledges the IRB as a committee within that office, separates the IRB review function from data governance and privacy validation, and cites the Common Rule as the primary regulatory framework.

---

## Appendix: Summary of All Findings

| # | Finding | Severity | Type |
|---|---------|----------|------|
| 1 | IRB modeled as Department — IRB is a committee, not a department | High | Inaccuracy |
| 2 | Data Custodian placed under IRB — conflates review with execution | Critical | Inaccuracy |
| 3 | "Research Director" role is ambiguous — conflates multiple functions | High | Incorrect Jargon |
| 4 | Legal Counsel entirely absent — DUA negotiation unrepresented | Critical | Missing Element |
| 5 | HIPAA invoked for de-identified data — internal contradiction | Critical | Regulatory Error |
| 6 | HIPAA Section 164.312 is wrong citation for research data sharing | High | Regulatory Error |
| 7 | Common Rule (45 CFR Part 46) not cited — foundational regulation missing | Critical | Missing Element |
| 8 | GDPR reference in Privacy Officer description is unjustified | Medium | Inaccuracy |
| 9 | Three distinct approvals collapsed into single threshold vote | Critical | Incorrect Workflow |
| 10 | Paper filing cabinet for IRB records is anachronistic for AMC caliber | Medium | Overstatement |
| 11 | "University PI emails IRB coordinator" — unrealistic request pathway | High | Incorrect Workflow |
| 12 | "DUA and IRB application submitted via email" — conflates instruments | High | Incorrect Workflow |
| 13 | Privacy Officer validation bypass via threshold is a HIPAA risk | Critical | Incorrect Workflow |
| 14 | 7-day expiry (604800 seconds) — unclear what it represents | Medium | Inaccuracy |
| 15 | 120 hours conflates active effort with elapsed time | Medium | Metric Error |
| 16 | 30 days of risk exposure is optimistic for elapsed timeline | Medium | Metric Error |
| 17 | 5 audit gaps not enumerated | Medium | Metric Error |
| 18 | 8 manual steps not enumerated or aligned with narrative | Low | Metric Error |
| 19 | "Academic Medical Center" vs. "Metro Health System" naming inconsistency | Medium | Inconsistency |
| 20 | "Partner Institution" vs. "State University" naming inconsistency | Medium | Inconsistency |
| 21 | "IRB-approved" study but IRB review listed as workflow step | High | Inconsistency |
| 22 | todayPolicies 3-of-3 requirement misrepresents governance structure | High | Incorrect Workflow |
| 23 | todayPolicies 30-second expiry vs. real-world months | Low | Inconsistency |
| 24 | Delegation to Data Custodian is inappropriate separation-of-duties issue | High | Incorrect Workflow |
| 25 | Missing collaborating PI / internal sponsor at providing institution | Medium | Missing Element |
| 26 | "Full HIPAA-compliant audit trail" is an over-claim | Medium | Over-Claim |
| 27 | "~120 hours / 30 days to days" improvement claim not defensible | High | Over-Claim |
| 28 | "Sponsors, CROs, research networks" language creates scope confusion | Medium | Incorrect Jargon |

**Critical findings: 6 | High findings: 10 | Medium findings: 10 | Low findings: 2**
**Total findings: 28**
