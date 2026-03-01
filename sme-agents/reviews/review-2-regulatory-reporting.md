# SME Review: Regulatory Report Filing and Data Lineage

**Reviewer Profile:** Senior Regulatory Reporting & Financial Compliance SME (20+ years SEC reporting, SOX compliance, Big 4 audit, OCC/Fed examination experience)

**Review Date:** 2026-02-28

**Scenario Under Review:** `finance-regulatory-reporting` (Regulatory Report Filing and Data Lineage)

**Source Files Reviewed:**
- `src/scenarios/finance/regulatory-reporting.ts`
- `src/lib/regulatory-data.ts` (REGULATORY_DB)
- `src/scenarios/archetypes.ts`
- Embedded markdown narrative (from agent brief)

---

## 1. Executive Assessment

**Overall Credibility Score: D+ (3.5 / 10)**

This scenario contains a fundamental conceptual error that would immediately disqualify it in front of any knowledgeable audience: it describes a "SOX Section 302 Compliance Report" as a filing submitted to a regulator. No such report exists. SOX Section 302 is a personal certification signed by the CEO and CFO that is embedded within SEC periodic filings (10-K and 10-Q). The scenario conflates certification with filing, misidentifies the owning department, omits the CEO entirely, applies an inapplicable BSA/AML regulatory framework, and proposes a 2-of-3 threshold model for a process that legally requires both CEO and CFO signatures with no threshold option. These are not subtle issues -- they are foundational errors that would cause a CFO, SEC examiner, or Big 4 partner to lose confidence in the product within the first 30 seconds.

### Top 3 Most Critical Issues

1. **"SOX Section 302 Compliance Report" does not exist.** SOX 302 is a certification, not a report. The scenario invents a filing type that no one in the regulatory reporting world would recognize. A CFO who personally signs 302 certifications every quarter would immediately dismiss this as uninformed. This is the single most damaging error in the scenario.

2. **CEO is entirely absent.** SOX Section 302 (SEC Rule 13a-14) requires BOTH the CEO and CFO to personally certify. The scenario omits the CEO -- the co-equal required certifier. This omission is not a minor gap; it demonstrates a misunderstanding of how SOX 302 works. No one who has actually been through a SOX certification cycle would make this error.

3. **BSA/AML regulatory context applied to a regulatory reporting scenario.** The scenario inherits BSA/AML (Bank Secrecy Act / Anti-Money Laundering) as a regulatory framework. BSA/AML concerns suspicious activity reporting and financial crime -- it has zero relevance to SEC periodic filings or regulatory report filing workflows. This is a copy-paste error from the shared `REGULATORY_DB.finance` array and would signal to any examiner that the regulatory frameworks were not individually tailored.

### Top 3 Strengths

1. **Manual top-side adjustment lineage risk is accurately identified.** The claim that "manual adjustments during reconciliation create lineage gaps and version control issues" is the single most accurate and credible statement in the scenario. Manual top-side journal entries (TSJEs) are the #1 audit concern in regulatory reporting data lineage, and OCC examiners and PCAOB inspectors consistently flag them.

2. **The "today" friction model captures real pain points.** Email-based coordination, officer unavailability during board meetings, version control issues with draft reports, and deadline pressure are all genuine pain points in the sign-off phase of regulatory filings. The emotional cadence of the "today" narrative is realistic even if the specifics are wrong.

3. **Cryptographic proof of signer identity, timestamp, and report hash is a genuinely valuable value proposition.** The claim that Accumulate provides "cryptographic proof [of] who signed, when, and the exact report hash" is the strongest and most defensible Accumulate claim in the scenario. This directly addresses PCAOB AS 2201 requirements for testing controls and would resonate with audit committees and external auditors.

---

## 2. Fundamental Framing Issues

These issues must be resolved before any other corrections matter. The scenario's core identity is confused.

### Issue F-1: "SOX Section 302 Compliance Report" Is a Fabricated Filing Type

**The problem:** There is no such thing as a "SOX Section 302 Compliance Report." SOX Section 302 (codified in SEC Rule 13a-14 under the Securities Exchange Act of 1934) requires the CEO and CFO of a public company to personally certify, in connection with each periodic report filed under Section 13(a) or 15(d), that:

- They have reviewed the report
- The report does not contain material misstatements or omissions
- The financial statements fairly present the financial condition and results
- They are responsible for establishing and maintaining disclosure controls and procedures (DCP) and internal control over financial reporting (ICFR)
- They have disclosed any changes in ICFR during the most recent fiscal quarter

The 302 certification is a signed exhibit (Exhibit 31.1 and 31.2) attached to the 10-K or 10-Q filing. It is not a standalone "compliance report." The filing itself is the 10-Q (quarterly) or 10-K (annual). The certification is an integral part of that filing.

**The fix:** The scenario must specify what is actually being filed. The most natural fit for this scenario is the **10-Q quarterly filing** with the SEC, which includes SOX 302 certifications as exhibits. Alternatively, if the scenario wants to focus on banking-specific reporting, it should describe a **Call Report (FFIEC 031/041/051)** or **FR Y-9C** filing with prudential regulators. These are different workflows with different approvers, deadlines, and systems. The scenario must pick one.

**Recommendation:** Reframe as the 10-Q quarterly filing process, with SOX 302 certification as one step within the broader filing workflow. This is the most recognized, highest-stakes filing type for publicly traded financial institutions and maps cleanly to the existing scenario structure.

### Issue F-2: The Scenario Cannot Decide What It Is About

The scenario simultaneously claims to be about:
- SOX Section 302 certification (officer attestation)
- Data lineage (data governance / source-to-report traceability)
- Regulatory report filing (submission to a regulator)
- Supervisory exam readiness (examination defense)

These are four related but distinct processes. SOX 302 certification is one step within the 10-Q filing process. Data lineage is a data governance discipline that supports the filing. Supervisory exam readiness is an ongoing program, not a quarterly event. The scenario must establish a clear primary focus and treat the others as supporting context.

**Recommendation:** The primary focus should be the **quarterly 10-Q filing process**, with SOX 302 certification, data lineage validation, and supervisory exam readiness as supporting dimensions. The title "Regulatory Report Filing and Data Lineage" works if the narrative clearly distinguishes between what Accumulate contributes (authorization proof) and what it does not (end-to-end data lineage).

### Issue F-3: The 2-of-3 Threshold Model Is Legally Impermissible for SOX 302 Certification

SOX Section 302 requires BOTH the CEO and the CFO to sign personal certifications. There is no threshold option. If the CEO signs but the CFO does not, the filing cannot proceed. If the CFO signs but the CEO does not, the filing cannot proceed. Both must sign -- period.

The Accumulate policy `k: 2, n: 3` (2-of-3 threshold) is legally impermissible for the SOX 302 certification step. You cannot submit a 10-Q to the SEC with only two of three required signatures when two specific individuals (CEO and CFO) are each independently required.

**The fix:** The 2-of-3 threshold can apply to the **pre-filing review and approval** step (where the Disclosure Committee, Controller, General Counsel, and other reviewers evaluate the draft filing before it goes to the CEO and CFO for final certification). But the CEO and CFO certifications must both be obtained -- they are mandatory sequential gates, not a threshold pool.

**Recommendation:** Restructure the policy as:
- **Pre-filing review:** 2-of-3 threshold among Controller, Compliance Officer, and General Counsel (determines whether the filing is ready for executive certification)
- **Executive certification:** Both CEO and CFO must certify (mandatory, no threshold)

---

## 3. Line-by-Line Findings

### Finding 1

- **Location:** `name` field (line 8) -- `"Regulatory Report Filing and Data Lineage"`
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `"Regulatory Report Filing and Data Lineage"`
- **Problem:** The title implies Accumulate provides data lineage capability. Accumulate provides authorization lineage (who approved what, when, with what authority). Data lineage in the BCBS 239 / regulatory reporting sense means end-to-end traceability of reported figures from source systems through transformations to the final filed report. These are fundamentally different capabilities. Collibra, Alation, and Informatica provide data lineage. Accumulate provides authorization proof.
- **Corrected Text:** `"Quarterly SEC Filing Authorization and Audit Trail"`
- **Source/Rationale:** BCBS 239 (Principles for effective risk data aggregation and risk reporting) defines data lineage as tracing data from origination through processing to reporting. Authorization proof is a distinct capability.

### Finding 2

- **Location:** `description` field (line 9-11) -- scenario description
- **Issue Type:** Inaccuracy / Incorrect Jargon
- **Severity:** Critical
- **Current Text:** `"A quarterly regulatory filing subject to SOX Section 302 certification and supervisory review requires sign-off from multiple officers. Data is sourced from multiple systems, and manual adjustments during reconciliation create lineage gaps and version control issues. Coordination across CFO, General Counsel, and Compliance typically requires 1–3 days, with supervisory exams focused on data integrity, governance, and controls."`
- **Problem:** (1) "SOX Section 302 certification" is not something a "filing is subject to" -- the filing includes 302 certifications as exhibits. (2) "Supervisory review" is banking regulator terminology; SEC filings receive SEC staff review/comment. (3) "CFO, General Counsel, and Compliance" is the wrong set of principals -- the CEO is missing and the Controller/CAO is missing. (4) "1-3 days" understates the coordination time for the sign-off phase if it includes the Disclosure Committee review process.
- **Corrected Text:** `"A publicly traded financial institution's quarterly 10-Q filing with the SEC requires SOX Section 302 certifications from both CEO and CFO, Disclosure Committee review, and Controller sign-off. Data sourced from multiple systems requires reconciliation, and manual top-side journal entries during the close process create lineage gaps and version control issues. Coordination across the Controller, General Counsel, Disclosure Committee, CFO, and CEO typically requires 3–5 business days for the review-and-certification phase, with SEC staff review and OCC supervisory examinations focused on data integrity, governance, and internal controls."`
- **Source/Rationale:** SEC Rule 13a-14 (SOX 302 certification requirements); SEC Rule 13a-15 (Disclosure Controls and Procedures); PCAOB AS 2201 (Audit of ICFR).

### Finding 3

- **Location:** `prompt` field (line 14)
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `"What happens when a quarterly SOX Section 302 filing has data lineage gaps from manual adjustments and requires 3-officer sign-off before the regulatory deadline?"`
- **Problem:** "SOX Section 302 filing" is not a thing. SOX 302 is a certification within a 10-Q filing. "3-officer sign-off" is wrong -- SOX 302 requires 2 specific officers (CEO + CFO), not 3 generic officers. "Regulatory deadline" should specify the actual deadline (40 days after quarter-end for large accelerated filers, per SEC Rule 13a-10).
- **Corrected Text:** `"What happens when a quarterly 10-Q filing has data lineage gaps from manual top-side journal entries, requires Disclosure Committee review and CEO/CFO SOX 302 certification, and the 40-day filing deadline is approaching?"`
- **Source/Rationale:** SEC Rule 13a-10 (filing deadlines); SEC Rule 13a-14 (302 certification); Large accelerated filer definition under SEC Rule 12b-2.

### Finding 4

- **Location:** `actors` array -- Compliance department (lines 26-32)
- **Issue Type:** Incorrect Workflow / Structural Error
- **Severity:** High
- **Current Text:** `label: "Compliance", description: "Manages regulatory filing lifecycle, data reconciliation, and supervisory exam readiness"`
- **Problem:** At publicly traded financial institutions, the SEC filing lifecycle (10-Q, 10-K) is owned by the **Controller / Chief Accounting Officer (CAO)** function under the CFO, not by Compliance. The Controller's Financial Reporting team prepares the filing, performs data reconciliation, manages the close process, and coordinates Disclosure Committee review. Compliance may own prudential regulatory filings (Call Reports) or BSA filings, but SEC periodic filing is a Finance/Accounting function. Placing the filing lifecycle under "Compliance" is organizationally inaccurate and would immediately raise questions from any financial executive.
- **Corrected Text:** `label: "Finance & Reporting", description: "Manages quarterly close process, financial data reconciliation, 10-Q preparation, and SEC filing coordination under the Controller/CAO"`
- **Source/Rationale:** Standard organizational structure at publicly traded bank holding companies; SEC Rule 13a-15(a) (disclosure controls maintained by the issuer under the supervision of the CEO and CFO, operationally managed by the Controller).

### Finding 5

- **Location:** `actors` array -- CFO actor (lines 33-41)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** `label: "CFO", description: "Senior attestation authority for SOX Section 302/906 financial data integrity certification"`
- **Problem:** The description is substantively correct for the CFO's role in SOX compliance, but the CEO is entirely missing from the scenario. SOX Section 302 requires BOTH the principal executive officer (CEO) and principal financial officer (CFO) to sign certifications. The CEO's certification (Exhibit 31.1) and CFO's certification (Exhibit 31.2) are both legally required. Omitting the CEO is a critical structural error.
- **Corrected Text (CFO description):** `description: "Principal financial officer; co-certifier under SOX Section 302 (Exhibit 31.2) and Section 906 for quarterly 10-Q filings"`
- **Source/Rationale:** SOX Section 302(a); SEC Rule 13a-14(a); 18 USC 1350 (Section 906).

### Finding 6

- **Location:** `actors` array -- missing CEO actor
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Problem:** The CEO is required by SOX Section 302 to sign the principal executive officer certification. This is not optional. The CEO must be an actor in any scenario depicting SOX 302 certification.
- **Corrected Text (new actor to add):**
```typescript
{
  id: "ceo",
  type: NodeType.Role,
  label: "CEO",
  description: "Principal executive officer; co-certifier under SOX Section 302 (Exhibit 31.1) and Section 906 for quarterly 10-Q filings",
  parentId: "fin-corp-org",
  organizationId: "fin-corp-org",
  color: "#94A3B8",
}
```
- **Source/Rationale:** SOX Section 302(a); SEC Rule 13a-14(a).

### Finding 7

- **Location:** `actors` array -- General Counsel (lines 42-50)
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `label: "General Counsel", description: "Legal review of regulatory disclosures and supervisory response documentation"`
- **Problem:** The General Counsel does not typically "approve" or "sign off" on a 10-Q filing in the same capacity as the CEO or CFO. GC participates as a member of the Disclosure Committee (SEC Rule 13a-15), reviews legal risk disclosures, MD&A legal language, litigation contingency disclosures, and provides a legal sufficiency opinion. GC does not attest to the accuracy of financial data. Placing GC as a co-equal "approver" with the CFO conflates legal review with financial attestation.
- **Corrected Text:** `description: "Provides legal sufficiency review of disclosure language, litigation contingency disclosures, and legal risk factors as member of the Disclosure Committee"`
- **Source/Rationale:** SEC Rule 13a-15 (Disclosure Controls and Procedures); standard Disclosure Committee charter at public companies.

### Finding 8

- **Location:** `actors` array -- Compliance Officer (lines 51-59)
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text:** `label: "Compliance Officer", description: "Coordinates data sourcing, reconciliation, and version control across reporting systems"`
- **Problem:** The Compliance Officer does not coordinate data sourcing and reconciliation for SEC financial filings. This is the Controller's / Financial Reporting Director's function. The Compliance Officer's role in a 10-Q filing, if any, is to ensure regulatory compliance disclosures are accurate (e.g., CRA disclosures, fair lending disclosures, BSA program disclosures). Data reconciliation is performed by the Controller's team. If this role is intended to represent the person managing the filing process operationally, it should be labeled "Controller" or "Financial Reporting Director."
- **Corrected Text:** `id: "controller", label: "Controller / CAO", description: "Prepares and reconciles financial data, manages the close process, coordinates Disclosure Committee review, and certifies the filing is ready for executive attestation"`
- **Source/Rationale:** Standard organizational structure; the Controller/CAO is the operational owner of the financial close and reporting process at public companies.

### Finding 9

- **Location:** `actors` array -- missing Disclosure Committee
- **Issue Type:** Missing Element
- **Severity:** High
- **Problem:** SEC Rule 13a-15 requires public companies to maintain disclosure controls and procedures, which are operationally governed by a Disclosure Committee. The Disclosure Committee is the governance body that reviews 10-Q drafts before they go to the CEO and CFO for certification. Its absence from the scenario means the scenario skips a mandatory governance step.
- **Corrected Text (new actor to add):**
```typescript
{
  id: "disclosure-committee",
  type: NodeType.Committee,  // or NodeType.Role if Committee is not available
  label: "Disclosure Committee",
  description: "Cross-functional governance body (Controller, GC, IR, Compliance) that reviews 10-Q/10-K filings before executive certification per SEC Rule 13a-15",
  parentId: "fin-corp-org",
  organizationId: "fin-corp-org",
  color: "#06B6D4",
}
```
- **Source/Rationale:** SEC Rule 13a-15(a); SEC Rule 13a-15(e) (definition of disclosure controls and procedures).

### Finding 10

- **Location:** `actors` array -- Regulator (lines 60-68)
- **Issue Type:** Incorrect Jargon / Understatement
- **Severity:** Medium
- **Current Text:** `label: "Regulator", description: "Supervisory authority focused on data integrity, governance, and controls during exams"`
- **Problem:** "Regulator" is vague. If this is a 10-Q filing, the filing goes to the SEC via EDGAR. The SEC is not a "supervisory authority" -- it is a securities regulator that receives periodic filings and conducts staff reviews. "Supervisory authority" is banking regulator terminology (OCC, Federal Reserve, FDIC). Additionally, SEC staff review of 10-Q filings does not focus on "data integrity, governance, and controls" -- it focuses on compliance with GAAP, Regulation S-X, and disclosure adequacy. ICFR controls are tested by the external auditor under PCAOB standards, not by the SEC.
- **Corrected Text:** `label: "SEC (EDGAR)", description: "Securities and Exchange Commission; receives 10-Q/10-K filings via EDGAR; SEC Division of Corporation Finance conducts periodic staff review of disclosure adequacy and GAAP compliance"`
- **Source/Rationale:** SEC Division of Corporation Finance filing review process; EDGAR filing system.

### Finding 11

- **Location:** `actors` array -- Reporting System (lines 69-77)
- **Issue Type:** Understatement / Incorrect Workflow
- **Severity:** Medium
- **Current Text:** `label: "Data Warehouse / Reporting", description: "Aggregates data from multiple source systems for regulatory report generation"`
- **Problem:** The "Data Warehouse" is not the system that generates SEC filings. The system landscape for 10-Q preparation at a financial institution typically includes: (1) General Ledger (SAP, Oracle, Workday), (2) sub-ledgers (loan systems, trading systems, deposit systems), (3) consolidation tool (Hyperion, OneStream, Anaplan), (4) data warehouse (for analytics and reconciliation), (5) SEC reporting/filing platform (Workiva/Wdesk, Donnelley Financial DFIN ActiveDisclosure, Toppan Merrill), and (6) XBRL tagging tool (often integrated into the filing platform). The "Data Warehouse" is a source, not the filing system.
- **Corrected Text:** `label: "SEC Filing Platform", description: "Financial reporting platform (e.g., Workiva/Wdesk) that aggregates data from GL, sub-ledgers, and consolidation systems for 10-Q preparation, XBRL tagging, and EDGAR submission"`
- **Source/Rationale:** Standard SEC filing technology stack at publicly traded financial institutions.

### Finding 12

- **Location:** `defaultWorkflow.name` (line 104)
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `"Quarterly SOX Section 302 regulatory filing"`
- **Problem:** "SOX Section 302 regulatory filing" is not a thing. SOX 302 is a certification within the 10-Q filing. The workflow should be named for what is actually being filed.
- **Corrected Text:** `"Quarterly 10-Q SEC Filing with SOX 302 Certification"`
- **Source/Rationale:** SEC periodic filing terminology.

### Finding 13

- **Location:** `defaultWorkflow.targetAction` (line 106)
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `"Submit Quarterly SOX Section 302 Compliance Report to Regulatory Authority"`
- **Problem:** "SOX Section 302 Compliance Report" is a fabricated document name. No such report exists in SEC filing requirements, PCAOB standards, or SOX legislation. The action should describe submitting the 10-Q filing (which includes 302 certifications as Exhibits 31.1 and 31.2) to the SEC via EDGAR.
- **Corrected Text:** `"Submit Quarterly 10-Q Filing (with SOX 302 Certifications) to SEC via EDGAR"`
- **Source/Rationale:** SEC Rules 13a-1, 13a-13 (periodic filing requirements); SEC Rule 13a-14 (302 certification); EDGAR filing system.

### Finding 14

- **Location:** `defaultWorkflow.initiatorRoleId` (line 105)
- **Issue Type:** Incorrect Workflow
- **Severity:** Medium
- **Current Text:** `"reporting-system"`
- **Problem:** The reporting system (data warehouse or filing platform) does not "initiate" the filing workflow. The Controller/Financial Reporting Director initiates the quarterly close process, which eventually produces the 10-Q draft. The system generates output, but a human initiates the filing cycle. The initiator should be the Controller.
- **Corrected Text:** `"controller"` (after renaming the compliance-officer actor to controller)
- **Source/Rationale:** The Controller/CAO is the operational owner of the financial close and 10-Q preparation process.

### Finding 15

- **Location:** `defaultWorkflow.description` (lines 107-108)
- **Issue Type:** Inaccuracy / Overstatement
- **Severity:** High
- **Current Text:** `"Data warehouse generates the quarterly regulatory report from multiple source systems. Requires data reconciliation, lineage validation, and 2-of-3 sign-off from CFO, General Counsel, and Compliance Officer before SEC submission. Manual adjustments create version control issues and lineage gaps that complicate supervisory review."`
- **Problem:** (1) Data warehouse does not generate the filing. (2) "2-of-3 sign-off" is impermissible for SOX 302 -- both CEO and CFO must certify. (3) "supervisory review" is banking terminology, not SEC terminology. (4) The CEO is missing.
- **Corrected Text:** `"Controller initiates the quarterly close process and prepares the 10-Q draft from GL, sub-ledger, and consolidation data. Requires Disclosure Committee review, lineage validation of manual top-side journal entries, and both CEO and CFO SOX 302 certifications before EDGAR submission. Manual adjustments create version control issues and lineage gaps that complicate SEC staff review and external audit testing."`
- **Source/Rationale:** Standard 10-Q preparation workflow; SEC Rule 13a-14; PCAOB AS 2201.

### Finding 16

- **Location:** `policies[0].threshold` (lines 83-86) -- Accumulate policy
- **Issue Type:** Regulatory Error
- **Severity:** Critical
- **Current Text:** `k: 2, n: 3, approverRoleIds: ["cfo", "general-counsel", "compliance-officer"]`
- **Problem:** A 2-of-3 threshold is legally impermissible for SOX 302 certification. Both CEO and CFO certifications are individually required by law. The General Counsel is not a certifier. The Compliance Officer is not a certifier. However, a threshold model is appropriate for the pre-filing review/approval step (Disclosure Committee review). The policy should be restructured.
- **Corrected Text:** For the pre-filing review step: `k: 2, n: 3, approverRoleIds: ["controller", "general-counsel", "compliance-officer"]`. For the certification step, both CEO and CFO must be required (k: 2, n: 2 with approverRoleIds: ["ceo", "cfo"]).
- **Source/Rationale:** SOX Section 302(a); SEC Rule 13a-14(a) -- both principal executive officer and principal financial officer must certify.

### Finding 17

- **Location:** `policies[0].escalation` (lines 91-93) -- escalation to CFO
- **Issue Type:** Incorrect Workflow
- **Severity:** Medium
- **Current Text:** `escalation: { afterSeconds: 35, toRoleIds: ["cfo"] }`
- **Problem:** Escalating to the CFO implies the CFO is a fallback approver who can substitute for other approvers. For SOX 302 certification, the CFO must always certify -- they are not an escalation target but a mandatory certifier. Escalation in this context should go to the Controller (who manages the process) or the Chief Audit Executive (who can flag the delay as a control issue).
- **Corrected Text:** `escalation: { afterSeconds: 35, toRoleIds: ["controller"] }` (for the pre-filing review step)
- **Source/Rationale:** The CFO is a mandatory certifier, not an escalation substitute. Escalation should go to the process owner.

### Finding 18

- **Location:** `regulatoryContext` (line 138) -- `REGULATORY_DB.finance`
- **Issue Type:** Regulatory Error
- **Severity:** Critical
- **Current Text:** References both `SOX` and `BSA/AML` from the shared `REGULATORY_DB.finance` array
- **Problem:** BSA/AML (Bank Secrecy Act / Anti-Money Laundering) is about suspicious activity reporting, currency transaction reporting, and financial crime compliance. It has absolutely nothing to do with SEC periodic filings, SOX certification, or regulatory report filing workflows. This is a copy-paste error from the shared regulatory database that applies all finance frameworks to all finance scenarios indiscriminately. This would immediately undermine credibility with any compliance professional -- BSA/AML and SOX 302 are handled by entirely different teams, under entirely different regulatory frameworks, with entirely different examination programs.
- **Corrected Text:** The scenario should have its own `regulatoryContext` array (not inherit from `REGULATORY_DB.finance`) containing:
```typescript
regulatoryContext: [
  {
    framework: "SOX",
    displayName: "SOX Section 302",
    clause: "CEO/CFO Certification (SEC Rule 13a-14)",
    violationDescription: "Filing periodic reports with false or misleading CEO/CFO certifications regarding financial statements and internal controls",
    fineRange: "SEC enforcement action, officer bars, disgorgement; under Section 906 (18 USC 1350): up to $5M fine and 20 years imprisonment for willful violations",
    severity: "critical",
    safeguardDescription: "Accumulate provides cryptographic proof of each certification decision -- who certified, when, what version of the filing was certified, and the complete authority chain -- creating an independently verifiable audit trail for SEC examination and external audit testing",
  },
  {
    framework: "SOX",
    displayName: "SOX Section 404",
    clause: "Management Assessment of ICFR",
    violationDescription: "Material weakness in internal control over financial reporting (ICFR) -- specifically in authorization controls over the financial close and reporting process",
    fineRange: "Restatement risk, loss of investor confidence, potential SEC enforcement, adverse PCAOB inspection findings",
    severity: "critical",
    safeguardDescription: "Accumulate's policy-enforced authorization workflow provides a testable, auditable control that satisfies PCAOB AS 2201 requirements for authorization controls over financial reporting",
  },
]
```
- **Source/Rationale:** SOX Section 302; SOX Section 404; SEC Rule 13a-14; SEC Rule 13a-15; PCAOB AS 2201; 18 USC 1350 (Section 906). BSA/AML (31 USC 5311 et seq.) is an entirely separate regulatory program.

### Finding 19

- **Location:** `regulatoryContext` SOX entry -- `fineRange` field
- **Issue Type:** Regulatory Error
- **Severity:** High
- **Current Text:** `"Personal CEO/CFO liability, up to $5M + 20 years"`
- **Problem:** The "$5M + 20 years" penalty is from SOX Section 906 (18 USC 1350), which is the criminal certification provision -- penalties for willfully certifying a filing that does not comply with SOX requirements. SOX Section 302 (the civil certification, SEC Rule 13a-14) carries different consequences: SEC enforcement actions, civil monetary penalties, officer and director bars, disgorgement of ill-gotten gains, and restatement obligations. The scenario conflates Section 302 (civil) and Section 906 (criminal) penalties. The `displayName` says "SOX Section 302/404" but the penalty cited is from Section 906.
- **Corrected Text:** See corrected regulatory context in Finding 18. The penalty should clearly distinguish: "Under Section 302: SEC enforcement action, civil penalties, officer bars, disgorgement. Under Section 906 (18 USC 1350): up to $1M fine and 10 years imprisonment; up to $5M and 20 years for willful violations."
- **Source/Rationale:** 18 USC 1350(c) (Section 906 penalties); SEC Rule 13a-14 (Section 302 requirements); SOX Sections 302, 404, and 906 are distinct provisions with distinct penalty structures.

### Finding 20

- **Location:** `regulatoryContext` SOX entry -- `violationDescription` field
- **Issue Type:** Incorrect Jargon
- **Severity:** Medium
- **Current Text:** `"Material weakness in authorization controls"`
- **Problem:** "Authorization controls" is not standard SOX/PCAOB terminology. The correct terminology is "material weakness in internal control over financial reporting (ICFR)." Authorization controls are one category of control activity (per the COSO framework), but a material weakness is defined at the ICFR level. Additionally, a material weakness is a specific classification under PCAOB AS 2201 -- it means there is a reasonable possibility that a material misstatement would not be prevented or detected on a timely basis. The violation description should use standard terminology.
- **Corrected Text:** `"Material weakness in internal control over financial reporting (ICFR) related to the authorization and review controls over the financial close and reporting process"`
- **Source/Rationale:** PCAOB AS 2201.A7 (definition of material weakness); COSO Internal Control -- Integrated Framework (2013); SEC Staff Guidance on material weakness classification.

### Finding 21

- **Location:** `todayPolicies[0].threshold` (lines 129-132) -- today's policy
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text:** `k: 3, n: 3` (all 3 of 3 must sign today)
- **Problem:** While this is internally consistent with the narrative ("All 3 of 3 must sign"), the underlying issue persists: the three approvers are wrong. The CEO is missing. If this represents today's (pre-Accumulate) process, it should show the actual required approvers (CEO and CFO certifications, plus Controller/Disclosure Committee pre-filing review), not the wrong three.
- **Corrected Text:** Should reflect the actual today-state: CEO, CFO, and Controller all required (k: 3, n: 3 with the correct role IDs).
- **Source/Rationale:** SOX Section 302 requires both CEO and CFO.

### Finding 22

- **Location:** `todayPolicies[0].expirySeconds` (line 134)
- **Issue Type:** Metric Error
- **Severity:** Low
- **Current Text:** `expirySeconds: 25`
- **Problem:** In the simulation, 25 seconds is meant to represent deadline pressure. This is fine as a simulation mechanic. However, for context: 10-Q filing deadlines are 40 days after quarter-end for large accelerated filers (SEC Rule 13a-10). The "today" expiry should be proportionally tighter to demonstrate deadline pressure realistically. This is a minor simulation design point, not a substantive error.
- **Corrected Text:** Acceptable as simulation mechanic; no change required.
- **Source/Rationale:** SEC Rule 13a-10 (filing deadlines by filer category).

### Finding 23

- **Location:** `todayFriction.manualSteps[0]` (line 119)
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text:** `"Report generated from data warehouse — Compliance Officer manually reconciling figures across source systems and flagging adjustment discrepancies"`
- **Problem:** (1) The Compliance Officer does not reconcile financial data for SEC filings -- the Controller's team does. (2) Reconciliation happens during the close process, before the report is generated, not after. Post-generation review is accuracy verification and variance analysis, not reconciliation. (3) The "data warehouse" is not the report generation system. The sequence implies: report generated first, then reconciled. The actual sequence is: data closed, reconciled, consolidated, then report generated.
- **Corrected Text:** `"Controller's team completing quarterly close — reconciling sub-ledger data to GL, reviewing top-side journal entries, and resolving intercompany elimination differences before 10-Q draft generation"`
- **Source/Rationale:** Standard quarterly close process at publicly traded companies; SOX 404 ICFR control requirements for the close process.

### Finding 24

- **Location:** `todayFriction.manualSteps[1]` (line 120)
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `"CFO reviewing report version against prior filing — manual adjustments have created lineage gaps requiring re-verification"`
- **Problem:** The CFO does not personally compare current and prior filing versions. The Financial Reporting team prepares a variance analysis (quarter-over-quarter, year-over-year) that highlights material changes. The CFO reviews the variance analysis, asks questions about significant fluctuations, and reviews the draft with the Disclosure Committee. "CFO reviewing report version against prior filing" misrepresents the CFO's actual review process.
- **Corrected Text:** `"CFO reviewing Disclosure Committee package — variance analysis shows material fluctuations from manual top-side entries that require management explanation and supporting documentation"`
- **Source/Rationale:** Standard CFO review process for 10-Q filings; Disclosure Committee operating procedures.

### Finding 25

- **Location:** `todayFriction.manualSteps[2]` (line 121)
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `"General Counsel in board meeting — report sign-off delayed, regulatory deadline approaching"`
- **Problem:** (1) General Counsel does not "sign off" on 10-Q filings -- GC reviews legal disclosures and provides legal sufficiency opinions. (2) Legal review and financial data close typically happen on parallel tracks: GC reviews legal disclosures (litigation contingencies, legal risk factors) while the Controller finalizes financial data. GC unavailability blocks the legal disclosure review, not the overall filing, unless there is a pending legal matter requiring disclosure evaluation. (3) The scenario implies a sequential workflow (data close then GC review then filing) when the actual workflow is parallel.
- **Corrected Text:** `"General Counsel in board meeting — legal sufficiency review of pending litigation disclosures delayed; Controller cannot finalize MD&A legal contingency language until GC provides updated assessment"`
- **Source/Rationale:** Standard 10-Q preparation workflow; parallel workstreams for financial data close and legal/disclosure review.

### Finding 26

- **Location:** `todayFriction.narrativeTemplate` (line 123)
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `"Multi-system data reconciliation with manual version control and email-based sign-off coordination"`
- **Problem:** In 2025-2026, publicly traded financial institutions with $20B+ in assets do not coordinate SEC filing sign-off via email. They use collaborative filing platforms (Workiva/Wdesk is dominant), document management systems, or GRC platforms. The "email-based sign-off" portrayal is approximately 10-15 years out of date for institutions of this size. Smaller public companies might still use email-centric processes, but the scenario describes a "Financial Corp" that appears to be a large institution.
- **Corrected Text:** `"Multi-system data reconciliation with manual version tracking across filing platform, spreadsheet-based variance analysis, and fragmented sign-off coordination across email, filing platform comments, and in-person meetings"`
- **Source/Rationale:** Current market adoption of Workiva/Wdesk, Donnelley Financial Solutions, and similar platforms at publicly traded financial institutions.

### Finding 27

- **Location:** `beforeMetrics.manualTimeHours: 72` (line 111)
- **Issue Type:** Metric Error / Ambiguity
- **Severity:** High
- **Current Text:** `manualTimeHours: 72`
- **Problem:** 72 hours (3 business days) is ambiguous. If this represents the entire quarterly close and filing cycle, it is dramatically understated -- most public companies take 15-25 business days (120-200 hours of elapsed time, with substantially more person-hours) for the full quarterly close. If this represents only the review-and-certification phase (Disclosure Committee review through CEO/CFO certification), 72 hours (3 business days) is plausible but should be explicitly scoped. The metric must specify what it measures.
- **Corrected Text:** `manualTimeHours: 72` (acceptable if explicitly scoped to the review-and-certification phase only). The description should clarify: "72 hours represents the review, Disclosure Committee deliberation, and executive certification phase -- not the full quarterly close cycle."
- **Source/Rationale:** Deloitte CFO Signals survey data on quarterly close cycle times; FERF (Financial Executives Research Foundation) benchmarking data.

### Finding 28

- **Location:** `beforeMetrics.riskExposureDays: 14` (line 112)
- **Issue Type:** Metric Error / Ambiguity
- **Severity:** Medium
- **Current Text:** `riskExposureDays: 14`
- **Problem:** "14 days of risk exposure" is undefined. Risk exposure to what? If this means the period during which the filing could be late, that depends on the filing deadline (40 days for large accelerated filers) and when the close process started. If this means the period during which unsigned/uncertified financial data exists (creating control risk), that needs to be defined. The metric should specify: 14 days between what events, and what risk materializes during that window.
- **Corrected Text:** `riskExposureDays: 14` (acceptable if defined as: "14 calendar days between 10-Q draft completion and filing deadline, during which the filing is in review-and-certification status with no cryptographic proof of authorization state"). The narrative should clarify this definition.
- **Source/Rationale:** SEC Rule 13a-10 filing deadlines; the risk exposure is real (loss of S-3 shelf registration eligibility for late filers under SEC Rule 13a-10(j)).

### Finding 29

- **Location:** `beforeMetrics.auditGapCount: 8` (line 113)
- **Issue Type:** Metric Error
- **Severity:** Medium
- **Current Text:** `auditGapCount: 8`
- **Problem:** "8 audit gaps" is presented without enumeration. To be defensible, these gaps should be specifically identified. Plausible audit gaps in this workflow include: (1) undocumented top-side journal entry authorization, (2) version control failures in draft circulation, (3) unsigned Disclosure Committee sign-off pages, (4) missing evidence of CFO variance analysis review, (5) unreconciled intercompany balances at sign-off time, (6) stale data feeds from sub-ledgers at report generation, (7) undocumented manual overrides in the filing platform, (8) incomplete Disclosure Committee meeting minutes. These 8 gaps are defensible, but the scenario does not enumerate them. More critically, Accumulate can address gaps 1, 2, 3, 4, and 7 (authorization and version proof) but cannot address gaps 5, 6, and 8 (data reconciliation and meeting documentation).
- **Corrected Text:** `auditGapCount: 8` (acceptable if enumerated in supporting documentation). The "after" claim of 0 gaps needs to be revised (see Finding 31).
- **Source/Rationale:** PCAOB AS 2201 requirements for testing controls; common audit findings from PCAOB inspection reports.

### Finding 30

- **Location:** `beforeMetrics.approvalSteps: 10` (line 114)
- **Issue Type:** Metric Error
- **Severity:** Low
- **Current Text:** `approvalSteps: 10`
- **Problem:** The narrative describes approximately 5-7 steps, not 10. The 10 steps are not enumerated or defensible. A realistic step count for the review-and-certification phase would include: (1) Controller finalizes 10-Q draft, (2) Controller distributes to Disclosure Committee, (3) Disclosure Committee review meeting, (4) Disclosure Committee members provide comments, (5) Controller incorporates comments and produces final draft, (6) CFO review of final draft and variance analysis, (7) CEO review of final draft, (8) GC legal sufficiency sign-off, (9) CFO signs 302 certification, (10) CEO signs 302 certification, (11) EDGAR filing submission, (12) EDGAR acceptance confirmation. That is 12 steps, which would make "10 approval steps" understated if we count the full review-and-certification cycle. However, not all of these are "approval" steps in the strict sense.
- **Corrected Text:** `approvalSteps: 10` (acceptable if enumerated; the actual count is plausible for the review-and-certification phase).
- **Source/Rationale:** Standard 10-Q review-and-certification workflow.

### Finding 31

- **Location:** Narrative -- "8 audit gaps -> 0" improvement claim
- **Issue Type:** Over-Claim
- **Severity:** High
- **Current Text:** `"8 audit gaps -> 0"`
- **Problem:** Accumulate can eliminate authorization and sign-off gaps (proving who approved what, when, and what version). It cannot eliminate data reconciliation gaps (unreconciled intercompany balances), data quality gaps (stale sub-ledger feeds), or documentation gaps (incomplete Disclosure Committee minutes). Claiming "0 audit gaps" overstates Accumulate's scope. If 5 of 8 gaps are authorization-related and 3 are data governance-related, the realistic improvement is "8 -> 3."
- **Corrected Text:** `"8 audit gaps -> 3 (authorization and version control gaps eliminated; data reconciliation and documentation gaps require complementary controls)"`
- **Source/Rationale:** Accumulate provides authorization proof, not data lineage or reconciliation. The remaining gaps require data governance tools (Collibra, Alation) and process controls (reconciliation procedures, meeting minute requirements).

### Finding 32

- **Location:** Narrative -- "72 hours -> hours" improvement claim
- **Issue Type:** Over-Claim
- **Severity:** Medium
- **Current Text:** `"72 hours -> hours"`
- **Problem:** If 72 hours represents the review-and-certification phase, Accumulate can accelerate the sign-off/certification step (from days of email chasing to minutes of policy-routed approval). However, Accumulate does not accelerate the Disclosure Committee review, CFO variance analysis review, or GC legal sufficiency review -- those require human judgment. A realistic improvement would be: 72 hours -> 24-48 hours (sign-off coordination time eliminated; substantive review time unchanged).
- **Corrected Text:** `"72 hours -> 24-48 hours (sign-off coordination eliminated; substantive review time unchanged)"`
- **Source/Rationale:** Accumulate accelerates the authorization step but does not accelerate substantive human review.

### Finding 33

- **Location:** Narrative -- "With Accumulate" step 2
- **Issue Type:** Regulatory Error
- **Severity:** Critical
- **Current Text:** `"CFO and Compliance Officer both review and approve. The 2-of-3 threshold is met — the General Counsel's board meeting doesn't block the filing."`
- **Problem:** If this depicts SOX 302 certification, the CFO's approval is necessary but not sufficient -- the CEO must also certify. The Compliance Officer is not a SOX 302 certifier. Bypassing the General Counsel's legal review by filing without it is not a benefit -- it is a legal risk. Filing a 10-Q without the GC's legal sufficiency review means the company is submitting a filing with potentially inadequate legal disclosures. This is presented as a feature but could be characterized as reckless.
- **Corrected Text:** `"Controller and General Counsel complete pre-filing review. CEO and CFO each receive the finalized filing for SOX 302 certification via policy-routed workflow. CFO certifies. CEO certifies. Both mandatory certifications obtained. Filing proceeds to EDGAR submission."`
- **Source/Rationale:** SOX Section 302(a) -- both CEO and CFO must certify before filing.

### Finding 34

- **Location:** Narrative -- "With Accumulate" step 4
- **Issue Type:** Over-Claim
- **Severity:** Medium
- **Current Text:** `"General Counsel reviews asynchronously. The General Counsel can still review and add their approval later within the 48-hour window — creating an even stronger record."`
- **Problem:** A post-filing legal review is not "stronger" -- it is a risk. If GC discovers a legal disclosure issue after filing, the company faces a potential amendment (10-Q/A) filing, which is a significant event that raises SEC staff scrutiny. The "48-hour window" concept makes no sense for SOX 302 certification (which must be complete before filing). If the scenario is restructured so that GC is reviewing pre-filing (not certifying), then GC's review should happen before filing, not after.
- **Corrected Text:** Remove this step. In the corrected workflow, GC's legal sufficiency review is part of the Disclosure Committee pre-filing review phase, which occurs before the CEO/CFO certifications.
- **Source/Rationale:** SEC Rule 13a-15 (disclosure controls and procedures require assessment before filing, not after).

### Finding 35

- **Location:** Narrative -- "With Accumulate" outcome
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `"Report filed on time. Late-filing penalty risk substantially reduced. Full regulatory-grade audit trail."`
- **Problem:** "Regulatory-grade audit trail" is an undefined term. What makes an audit trail "regulatory-grade"? Specificity would strengthen this claim. The correct claim is that Accumulate provides a cryptographically verifiable record of every authorization decision in the filing process, including signer identity, timestamp, authority chain, and document hash -- which satisfies PCAOB AS 2201 requirements for testing the operating effectiveness of authorization controls. This is a powerful and defensible claim.
- **Corrected Text:** `"10-Q filed on time via EDGAR. Late-filing risk eliminated for this cycle. Cryptographic audit trail satisfies PCAOB AS 2201 requirements for authorization control testing -- signer identity, timestamp, authority chain, and document hash independently verifiable."`
- **Source/Rationale:** PCAOB AS 2201 (Audit of Internal Control Over Financial Reporting); the term "regulatory-grade" should be replaced with a specific standard reference.

### Finding 36

- **Location:** Narrative -- "Today's Process" step 1
- **Issue Type:** Overstatement
- **Severity:** Medium
- **Current Text:** `"Report distributed. An email is sent to the CFO, General Counsel, and Compliance Officer with the report PDF and cover memo attached."`
- **Problem:** As noted in Finding 26, email distribution of SEC filing drafts is approximately 10-15 years out of date for large publicly traded financial institutions. Most use Workiva/Wdesk or similar platforms for collaborative review. Additionally, the filing is not a "report PDF" -- it is an XBRL-tagged filing in the filing platform, reviewed in context with footnotes, exhibits, and prior-period comparatives.
- **Corrected Text:** `"10-Q draft distributed. Controller posts the final draft in the filing platform (e.g., Workiva) and sends notification emails to Disclosure Committee members, CFO, and CEO with links to the review workspace and variance analysis package."`
- **Source/Rationale:** Current technology landscape at publicly traded financial institutions.

### Finding 37

- **Location:** Narrative -- "Today's Process" step 2
- **Issue Type:** Incorrect Workflow
- **Severity:** Medium
- **Current Text:** `"Manual reconciliation. Each officer must review the report figures against source data in a separate accounting system. There's no integrated view — they're switching between the PDF, email, and accounting software."`
- **Problem:** The CEO, CFO, and GC do not perform manual reconciliation. Reconciliation is done by the Controller's team during the close process, before the 10-Q draft is finalized. What the officers review is the final 10-Q draft, the variance analysis (prepared by the Controller), and supporting schedules. They are checking for reasonableness and completeness, not reconciling figures. Additionally, they do not switch between "PDF, email, and accounting software" -- they review in the filing platform.
- **Corrected Text:** `"Executive review. CFO reviews variance analysis and financial highlights package prepared by the Controller. CEO reviews the operating narrative and key financial metrics. GC reviews legal disclosures and litigation contingency language. Each uses a combination of the filing platform, variance analysis spreadsheets, and supporting schedules -- no single integrated review workspace consolidates all reviewer inputs."`
- **Source/Rationale:** Standard officer review process for 10-Q filings; Disclosure Committee operating procedures.

### Finding 38

- **Location:** Narrative -- "Today's Process" policy statement
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:** `"Policy: All 3 of 3 must sign. No delegation. Short window. Escalation eventually to CFO."`
- **Problem:** The TypeScript `todayPolicies` has no escalation configured (the escalation field is absent from `todayPolicies`). The narrative says "Escalation eventually to CFO," but the code does not implement this. This is an inconsistency between the narrative and the TypeScript. Additionally, "escalation to CFO" makes no sense when the CFO is already one of the 3 required signers.
- **Corrected Text:** `"Policy: CEO, CFO, and Controller must all certify/approve. No delegation. 40-day filing deadline with internal target of 35 days. No automated escalation — delays require manual intervention by the Controller."`
- **Source/Rationale:** Consistency between TypeScript and narrative; realistic today-state.

### Finding 39

- **Location:** Narrative -- "With Accumulate" policy statement
- **Issue Type:** Regulatory Error
- **Severity:** High
- **Current Text:** `"Policy: 2-of-3 threshold (CFO, General Counsel, Compliance Officer). Auto-escalation to CFO after 35 seconds. 48-hour authority window."`
- **Problem:** Comprehensively wrong. (1) 2-of-3 is impermissible for SOX 302 certification. (2) The CEO is missing. (3) The Compliance Officer is not a certifier. (4) Auto-escalation to CFO makes no sense when CFO is a mandatory certifier. (5) 48-hour authority window has no regulatory basis.
- **Corrected Text:** `"Policy: Pre-filing review requires 2-of-3 from Controller, General Counsel, and Compliance Officer (Disclosure Committee review). Executive certification requires both CEO and CFO (mandatory, no threshold). Auto-escalation to Controller after 4 hours if any pre-filing reviewer has not responded. 48-hour authority window for pre-filing review decisions."`
- **Source/Rationale:** SOX Section 302(a); SEC Rule 13a-14.

---

## 4. Missing Elements

### 4.1 Missing Roles

| Role | Proper Placement | Rationale |
|------|-----------------|-----------|
| **CEO** | Direct report to Financial Corp (parentId: "fin-corp-org") | Required SOX 302 co-certifier (Exhibit 31.1). Legally mandatory. |
| **Controller / CAO** | Under CFO or Finance & Reporting department | Operational owner of the financial close process, 10-Q preparation, and data reconciliation. The person who actually prepares the filing. |
| **Disclosure Committee** | Governance body under Financial Corp | SEC Rule 13a-15 requires disclosure controls; the Disclosure Committee is the governance body that evaluates disclosures before CEO/CFO certification. |
| **Financial Reporting Director** | Under Controller / Finance & Reporting | The operational role that manages the day-to-day 10-Q preparation, XBRL tagging, and EDGAR submission. |
| **External Auditor** | External actor | For 10-K filings, the external auditor provides an opinion on ICFR (SOX 404). Even for 10-Q, the auditor performs a review (SAS 100/SSARS). The auditor's involvement affects the timing and process. |
| **Audit Committee** | Board-level governance body | SOX Section 301 requires audit committee oversight of financial reporting. The audit committee reviews the 10-Q before filing at many institutions. |

### 4.2 Missing Workflow Steps

The current scenario jumps from "report generated" to "officer sign-off." The actual quarterly close and filing lifecycle includes:

1. **Sub-ledger close** (loan systems, trading systems, deposit systems close their books)
2. **General ledger close** (GL entries posted, trial balance generated)
3. **Consolidation** (multi-entity consolidation with intercompany elimination)
4. **Top-side journal entries** (manual adjustments for accruals, reserves, reclassifications)
5. **Account reconciliation** (Controller's team reconciles key accounts)
6. **10-Q draft generation** (filing platform pulls data from GL/consolidation)
7. **Variance analysis** (quarter-over-quarter, year-over-year analysis prepared)
8. **Disclosure Committee review** (cross-functional review of draft filing)
9. **Management discussion** (CFO and Controller discuss material items)
10. **Legal sufficiency review** (GC reviews legal disclosures)
11. **Final draft preparation** (incorporating all comments)
12. **CEO review and SOX 302 certification** (Exhibit 31.1)
13. **CFO review and SOX 302 certification** (Exhibit 31.2)
14. **EDGAR filing submission**
15. **EDGAR acceptance confirmation**

The scenario's value is in steps 8-14 (the review-and-certification phase). This should be explicitly scoped.

### 4.3 Missing Regulatory References

| Framework | Citation | Relevance |
|-----------|----------|-----------|
| **SEC Rule 13a-14** | 17 CFR 240.13a-14 | The rule that implements SOX Section 302 certification requirements |
| **SEC Rule 13a-15** | 17 CFR 240.13a-15 | Disclosure controls and procedures; requires the Disclosure Committee function |
| **SEC Rule 13a-10** | 17 CFR 240.13a-10 | Filing deadlines (40 days for large accelerated filers, 10-Q) |
| **SEC Regulation S-X** | 17 CFR Part 210 | Financial statement form and content requirements |
| **PCAOB AS 2201** | PCAOB Auditing Standard No. 2201 | Audit of ICFR; defines material weakness, significant deficiency; governs how external auditors test controls |
| **SOX Section 906** | 18 USC 1350 | Criminal certification -- the $5M/20-year penalty provision (currently miscited as Section 302) |
| **COSO Framework** | COSO Internal Control -- Integrated Framework (2013) | The control framework used for SOX 404 assessments |
| **BCBS 239** | Basel Committee Principles for effective risk data aggregation | Relevant if discussing data lineage at banking institutions; global standard for data governance |

### 4.4 Missing System References

| System Category | Examples | Role in Filing Process |
|----------------|----------|----------------------|
| **General Ledger** | SAP, Oracle EBS, Workday Financials | Source of trial balance data |
| **Consolidation Platform** | Oracle Hyperion, OneStream, Anaplan | Multi-entity consolidation and intercompany elimination |
| **SEC Filing Platform** | Workiva (Wdesk), Donnelley Financial (ActiveDisclosure), Toppan Merrill | 10-Q/10-K preparation, XBRL tagging, collaborative review |
| **EDGAR** | SEC EDGAR filing system | Electronic submission of SEC filings |
| **XBRL Tagging** | Often integrated into filing platform | Required for SEC filings since 2009 |
| **GRC Platform** | Archer, ServiceNow GRC, AuditBoard | SOX testing, control documentation, certification tracking |

### 4.5 Missing Data Governance Concepts

The scenario title includes "Data Lineage" but does not adequately address:

- **Source-to-report lineage:** Tracing reported figures from sub-ledger entries through GL postings, consolidation entries, top-side adjustments, to the final filed figure
- **Top-side journal entry (TSJE) controls:** TSJEs are the #1 data lineage risk; the scenario mentions "manual adjustments" but does not use the standard term
- **Reconciliation hierarchy:** Account-level, entity-level, intercompany, and source-to-report reconciliations
- **Data quality gates:** Automated validation rules that check data before report generation
- **Distinction between authorization lineage and data lineage:** Accumulate provides authorization lineage. Data lineage requires separate data governance tooling (Collibra, Alation, Informatica). The scenario must clearly distinguish what Accumulate contributes.

---

## 5. Corrected Scenario

### 5.1 Corrected TypeScript Scenario

```typescript
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
```

### 5.2 Corrected Narrative

```markdown
## 4. Quarterly SEC Filing Authorization

**Setting:** Financial Corp's quarterly 10-Q filing is due for submission to the SEC via EDGAR. The Controller has completed the quarterly close process and prepared the 10-Q draft in the filing platform. The filing requires Disclosure Committee review and SOX Section 302 certifications from both the CEO and CFO before submission. Late filings risk loss of Form S-3 shelf registration eligibility, potential SEC enforcement action, and stock exchange scrutiny.

**Players:**
- Financial Corp (organization)
  - Finance & Reporting Department
    - Controller / CAO — manages the close process and 10-Q preparation; initiates the filing workflow
    - SEC Filing Platform — generates the 10-Q draft from GL, sub-ledger, and consolidation data
  - CEO — SOX 302 certifier (Exhibit 31.1)
  - CFO — SOX 302 certifier (Exhibit 31.2)
  - General Counsel — Disclosure Committee member; legal sufficiency review
- SEC (external regulator; filings submitted via EDGAR)

**Action:** Submit the quarterly 10-Q filing (with SOX 302 certifications) to the SEC via EDGAR. Requires Disclosure Committee review (2-of-3 from Controller, General Counsel, and CFO) followed by mandatory CEO and CFO SOX 302 certifications. Late filings risk loss of S-3 eligibility and regulatory scrutiny.

### Today's Process
**Policy:** Controller, CFO, and General Counsel must all approve the pre-filing review. CEO and CFO must both certify. No delegation. Filing deadline: 40 days after quarter-end. No automated escalation.

1. Close complete, 10-Q draft posted. Controller posts the final 10-Q draft in the filing platform and sends notification emails to Disclosure Committee members, CFO, and CEO with links to the review workspace and variance analysis package. (~10 sec delay)
2. Executive review. CFO reviews variance analysis and financial highlights package prepared by the Controller. CEO reviews the operating narrative and key financial metrics. GC reviews legal disclosures and litigation contingency language. Each uses a combination of the filing platform, variance analysis spreadsheets, and supporting schedules — no single integrated review workspace consolidates all reviewer inputs. (~6 sec delay per reviewer)
3. General Counsel unavailable. GC is in a board meeting. Legal sufficiency review of pending litigation disclosures delayed. Controller cannot finalize MD&A legal contingency language until GC provides updated assessment. (~10 sec delay)
4. Filing deadline pressure. With all three pre-filing reviewers required and no delegation, the 10-Q cannot proceed to CEO/CFO certification until GC completes the legal review. If the board meeting runs long, the filing deadline may be at risk.
5. Outcome: Late filing risk. Potential loss of Form S-3 shelf registration eligibility. Audit trail for the review-and-certification phase is scattered across filing platform comments, email threads, and meeting notes.

Metrics: ~72 hours of review-and-certification coordination, 14 days of filing-window risk exposure, 8 audit gaps in the authorization and review trail, 10 manual steps in the review-and-certification phase.

### With Accumulate
**Policy:** Pre-filing review requires 2-of-3 from Controller, General Counsel, and CFO (Disclosure Committee review). CEO and CFO certifications are both mandatory (no threshold). Auto-escalation to Controller after 35 seconds if any pre-filing reviewer has not responded. 48-hour authority window for pre-filing review decisions.

1. 10-Q draft ready. Controller completes the 10-Q draft and submits it for pre-filing review. Accumulate's policy engine routes the review request to Controller, General Counsel, and CFO simultaneously.
2. Pre-filing threshold met. Controller and CFO both complete their pre-filing review. The 2-of-3 Disclosure Committee threshold is met — GC's board meeting does not block the pre-filing review from advancing to the certification step.
3. Executive certification. CEO and CFO each receive the finalized filing for SOX 302 certification via policy-routed workflow. Both certify. Cryptographic proof captures who certified, when, what version of the filing (document hash) was certified, and the complete authority chain.
4. Filing submitted. The 10-Q is submitted to the SEC via EDGAR on time.
5. GC completes legal review. General Counsel completes the legal sufficiency review after the board meeting — confirming no legal disclosure changes are needed. If changes were needed, the filing would be amended (10-Q/A).
6. Outcome: 10-Q filed on time. Late-filing risk eliminated for this cycle. Cryptographic audit trail satisfies PCAOB AS 2201 requirements for authorization control testing — signer identity, timestamp, authority chain, and document hash independently verifiable.

Metrics: 72 hours → 24–48 hours (sign-off coordination eliminated; substantive review time unchanged). 14 days risk exposure → same-cycle resolution. 8 audit gaps → 3 (authorization and version control gaps eliminated; data reconciliation and documentation gaps require complementary controls).
```

---

## 6. Credibility Risk Assessment

### For a CFO Preparing for SOX 302 Certification

**Immediate credibility destroyers:**
- "SOX Section 302 Compliance Report" -- the CFO signs 302 certifications every quarter. They know this is not a report. This single phrase would cause the CFO to question whether the vendor understands what SOX 302 actually is.
- Missing CEO -- the CFO knows they co-certify with the CEO. A scenario that omits the CEO reveals a fundamental misunderstanding of the certification process.
- 2-of-3 threshold for SOX certification -- the CFO cannot certify on behalf of the CEO, and vice versa. A threshold model for certification is legally impossible. The CFO would view this as dangerous.
- "Compliance Officer" performing data reconciliation -- the CFO knows the Controller's team does this. Placing it under Compliance signals unfamiliarity with the finance function.

**Trust builders (if corrected):**
- Cryptographic proof of certification decisions with document hash, timestamp, and authority chain -- this directly addresses the CFO's personal liability concern under SOX 906.
- Accelerating the sign-off coordination phase while acknowledging that substantive review time is not reduced -- this is an honest, defensible claim.
- Referencing PCAOB AS 2201 and specific SEC rules -- demonstrates genuine regulatory knowledge.

### For an SEC Staff Accountant

**Immediate credibility destroyers:**
- "Submit Quarterly SOX Section 302 Compliance Report to Regulatory Authority" -- the SEC staff accountant reviews 10-Q and 10-K filings, not "compliance reports." This terminology is not used in SEC filing requirements.
- "Regulator" instead of "SEC" -- the SEC staff accountant works at the SEC. Calling their agency "Regulator" is vague and suggests the vendor does not know who receives these filings.
- BSA/AML regulatory context on a filing scenario -- the SEC does not administer BSA/AML. This is FinCEN and the banking regulators' domain. Including BSA/AML in an SEC filing scenario demonstrates framework confusion.

**Trust builders (if corrected):**
- Accurate references to SEC Rules 13a-14 and 13a-15 -- shows the vendor has read the actual rules.
- Proper distinction between Section 302 (civil certification) and Section 906 (criminal certification) penalties -- demonstrates nuanced understanding.
- Acknowledgment that Accumulate provides authorization proof, not data lineage -- honest scoping is credible.

### For an OCC Examiner Conducting a Data Governance Targeted Review

**Immediate credibility destroyers:**
- The scenario claims "data lineage" but describes authorization lineage. An OCC examiner reviewing under OCC Bulletin 2017-43 or conducting a BCBS 239 assessment would immediately note that Accumulate does not provide source-to-report data lineage.
- "Supervisory authority focused on data integrity, governance, and controls during exams" -- if this is an SEC filing scenario, the OCC does not examine SEC filing processes. The OCC examines Call Report accuracy and data governance for prudential filings. Conflating SEC and OCC examination scopes would undermine credibility.

**Trust builders (if corrected):**
- Clearly distinguishing authorization lineage (what Accumulate provides) from data lineage (what requires separate tools) -- an examiner would respect this distinction.
- Referencing BCBS 239 principles and acknowledging where Accumulate fits within the broader data governance framework.
- If the scenario is extended to include Call Report filing (which is under OCC examination scope), it would be directly relevant.

### For a Chief Audit Executive (CAE) Evaluating Accumulate

**Immediate credibility destroyers:**
- "8 audit gaps -> 0" -- a CAE would immediately challenge this. Accumulate cannot eliminate data reconciliation gaps or TSJE documentation gaps. Claiming zero gaps overstates the tool's capabilities and would make the CAE skeptical of all other claims.
- Missing Disclosure Committee, missing CEO, wrong department ownership -- a CAE who has built SOX testing programs would flag these as demonstrating insufficient understanding of the control environment.

**Trust builders (if corrected):**
- Honest scoping: "8 audit gaps -> 3 (authorization gaps eliminated; data governance gaps require complementary controls)" -- a CAE would view this as a mature, trustworthy vendor claim.
- Cryptographic proof that satisfies PCAOB AS 2201 testing requirements -- directly relevant to the CAE's SOX testing program.
- Clear mapping of which controls Accumulate addresses vs. which require other solutions.

### For a Big 4 Audit Partner

**Immediate credibility destroyers:**
- Conflation of SOX 302, 404, and 906 -- a Big 4 partner has deep expertise in all three and would immediately detect the conflation. The penalty citation ($5M/20 years) is from Section 906 but attributed to 302/404.
- "Material weakness in authorization controls" -- a Big 4 partner uses PCAOB AS 2201 terminology ("material weakness in ICFR"). "Authorization controls" is a control category, not how material weaknesses are classified.
- The 2-of-3 threshold model -- a Big 4 partner would flag this as a control design deficiency. If the scenario is presented to an audit committee as how the tool would work, the partner would advise against it.

**Trust builders (if corrected):**
- Proper use of PCAOB AS 2201 terminology and concepts -- demonstrates the vendor understands the audit framework.
- Cryptographic proof as a testable control -- the audit partner can design test procedures around Accumulate's output, which makes it audit-friendly.
- Honest distinction between authorization controls (Accumulate's domain) and data governance controls (outside Accumulate's domain) -- the partner would view this as a vendor that understands its own scope.

---

## Summary of Required Changes

| Priority | Change | Impact |
|----------|--------|--------|
| **P0 - Critical** | Rename "SOX Section 302 Compliance Report" to "10-Q Filing with SOX 302 Certifications" throughout | Eliminates the most damaging credibility issue |
| **P0 - Critical** | Add CEO as a required actor and SOX 302 certifier | Fixes the omission of a legally required participant |
| **P0 - Critical** | Replace BSA/AML regulatory context with SOX 302 and SOX 404-specific entries | Eliminates irrelevant framework reference |
| **P0 - Critical** | Fix the 2-of-3 threshold to apply only to pre-filing review, with mandatory CEO+CFO certification as a separate gate | Makes the policy legally permissible |
| **P1 - High** | Rename Compliance department to Finance & Reporting; rename Compliance Officer to Controller/CAO | Corrects organizational ownership |
| **P1 - High** | Fix the SOX penalty attribution (302 vs. 906 penalties) | Eliminates regulatory citation error |
| **P1 - High** | Reduce "8 audit gaps -> 0" claim to "8 -> 3" | Makes the value proposition defensible |
| **P2 - Medium** | Add Disclosure Committee as an actor or governance step | Adds missing SEC Rule 13a-15 governance body |
| **P2 - Medium** | Specify "SEC (EDGAR)" instead of generic "Regulator" | Eliminates vagueness |
| **P2 - Medium** | Update "today" workflow to reflect filing platform usage, not email-based PDF review | Modernizes the "today" state |
| **P2 - Medium** | Fix "72 hours -> hours" improvement claim to "72 hours -> 24-48 hours" | Makes the improvement claim defensible |
| **P3 - Low** | Add references to SEC Rules 13a-14, 13a-15, PCAOB AS 2201 | Strengthens regulatory precision |
| **P3 - Low** | Rename "Data Warehouse / Reporting" to "SEC Filing Platform" | Corrects system landscape accuracy |

---

*Review completed by Regulatory Reporting & Financial Compliance SME. All findings are based on current SEC rules, PCAOB standards, SOX legislation, and direct operational experience with quarterly 10-Q filing processes at publicly traded financial institutions.*
