# SME Review #18: Export Control & ITAR/EAR Compliance Authorization Governance

**Reviewer:** Senior Export Control Compliance, ITAR/EAR Regulatory Governance, and Empowered Official Subject Matter Expert
**Date:** 2026-02-28
**Scenario:** Export Control & ITAR/EAR Compliance Authorization (`src/scenarios/supply-chain/export-control.ts`)
**Narrative:** Section 4 of `docs/scenario-journeys/supply-chain-scenarios.md`
**Regulatory Data:** `src/lib/regulatory-data.ts` (supply-chain entries)

---

## 1. Executive Assessment

**Overall Credibility Score: D+**

This scenario demonstrates a basic understanding that ITAR/EAR export compliance involves classification (ECCN/USML), denied party screening, and time-sensitive shipping windows. However, it fundamentally mismodels the legal authority structure that governs export authorization at defense contractors and dual-use technology companies. The delegation model is inverted, the Empowered Official role is missing entirely, the Deputy Empowered Official is simultaneously a primary approver and a delegation target (circular), no mandatory approver is enforced for the legally required EO/DEO signature, and the regulatory context references a generic shared database entry (EAR section 764 -- enforcement penalties) rather than the specific export authorization frameworks (ITAR 22 CFR 120.67, 22 CFR 123, OFAC SDN screening). A DDTC compliance examiner, a BIS Export Compliance Officer, or any Empowered Official at a major defense contractor would immediately reject this authorization model as legally non-compliant.

### Top 3 Most Critical Issues

1. **CRITICAL -- Missing Empowered Official (EO) and Inverted Delegation Model.** Under ITAR (22 CFR 120.67), the Empowered Official is the ONLY person with legal authority to sign export license applications and export authorizations. The Deputy Empowered Official is the designated alternate. The scenario has no EO at all, and delegates FROM the Export Officer (an analyst) TO the DEO -- inverting the authority hierarchy. The Export Officer prepares authorization packages; the EO or DEO signs them. This is not a stylistic preference -- it is a legal requirement with criminal penalties (up to $1M per violation and 20 years imprisonment under 22 CFR 127).

2. **CRITICAL -- DEO Is Both Primary Approver and Delegation Target (Circular).** The `deputy-empowered-official` appears in both `approverRoleIds` (as one of the three approvers counting toward the 2-of-3 threshold) and `delegateToRoleId` (as the delegation target when the Export Officer is unavailable). This creates a logical paradox: if the DEO is already a primary approver who counts toward the threshold, delegating to them adds nothing. If they are the delegation target, they should not also be in the primary pool. Under ITAR, the EO/DEO are the legal signatories -- they are not interchangeable with compliance analysts in a threshold pool.

3. **HIGH -- Regulatory Context Uses Generic Shared Database Instead of ITAR/EAR-Specific Frameworks.** The scenario references `REGULATORY_DB["supply-chain"]`, which contains only EAR section 764 (enforcement penalties -- about what happens AFTER a violation) and ISO 9001:2015 Clause 8.4 (supplier evaluation -- irrelevant to export authorization). The directly applicable frameworks -- ITAR 22 CFR 120.67 (Empowered Official authority), ITAR 22 CFR 123 (export licenses), OFAC 31 CFR 500 (SDN screening), FTR 15 CFR 30 (AES/EEI filing), and EAR 15 CFR 744 (Entity List/end-use controls) -- are completely absent.

### Top 3 Strengths

1. **Accurate shipping window cost pressure.** The scenario correctly identifies that missed international shipping windows at defense contractors result in customer penalties, delay costs, and regulatory risk. The 10-day risk exposure is plausible for international defense shipments where the next carrier window may be 2-4 weeks away.

2. **Correct identification of Export Officer at seminar as a realistic bottleneck.** Trade compliance seminars (ECTI, BIS Export Control Reform, SIA, NDAA compliance) are frequent, and export compliance staff attend regularly. This is a realistic unavailability scenario.

3. **Appropriate use of the Logistics Coordinator as initiator with no compliance authority.** Correctly models that the Logistics/Shipping function initiates the shipment request but has no compliance approval authority -- this is accurate for defense contractor export workflows.

---

## 2. Line-by-Line Findings

### Finding 1: Missing Empowered Official (EO) Role

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 16-88 (actors array)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** No Empowered Official actor exists. Only the Deputy Empowered Official is present.
- **Problem:** Under ITAR (22 CFR 120.67), every ITAR-registered organization must have a designated Empowered Official -- an officer of the applicant who has been empowered to sign license applications and export authorizations, and who understands the provisions and requirements of the ITAR. The EO is the PRIMARY signatory; the DEO is the BACKUP. Without an EO, the entire authorization model is legally incomplete. No defense contractor exports ITAR-controlled articles without an EO on the organizational chart. This is the foundational legal role in ITAR compliance -- equivalent to having a hospital scenario without a physician.
- **Corrected Text:** Add an `empowered-official` actor as a Role within the Export Control Office, with a description referencing 22 CFR 120.67 designation, ITAR legal signatory authority, and personal liability. See corrected scenario in Section 4.
- **Source/Rationale:** ITAR 22 CFR 120.67 defines the Empowered Official as a legally designated officer with personal liability for ITAR compliance. Every ITAR-registered company (DDTC registration under 22 CFR 122) must designate at least one EO. Major defense contractors (Raytheon, Lockheed Martin, Northrop Grumman, L3Harris, General Dynamics) have an EO and typically one or more DEOs.

### Finding 2: Inverted Delegation Model (Export Officer -> DEO)

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 99-101 and 111
- **Issue Type:** Incorrect Workflow
- **Severity:** Critical
- **Current Text:**
  ```typescript
  delegateToRoleId: "deputy-empowered-official",
  ```
  and edge:
  ```typescript
  { sourceId: "export-officer", targetId: "deputy-empowered-official", type: "delegation" },
  ```
- **Problem:** The delegation flows FROM the Export Officer TO the DEO. This is backwards. Under ITAR, the Export Officer is a compliance analyst who reviews and prepares export authorization packages -- they do NOT have signatory authority. The EO (or DEO as alternate) is the legal signatory. The correct delegation model is: EO delegates to DEO (same legal authority level, different person), or the DEO is inherently authorized as an alternate signatory. Delegating FROM an analyst TO a legal signatory conflates two entirely different levels of authority. It would be as if a paralegal "delegated" to a licensed attorney -- the attorney's authority is inherent, not derived from the paralegal.
- **Corrected Text:** Delegation should flow from the Empowered Official to the Deputy Empowered Official:
  ```typescript
  delegateToRoleId: "deputy-empowered-official",
  ```
  with delegation edge:
  ```typescript
  { sourceId: "empowered-official", targetId: "deputy-empowered-official", type: "delegation" },
  ```
- **Source/Rationale:** Under 22 CFR 120.67, the EO delegates to the DEO. The Export Officer (analyst) prepares the authorization package, then routes it to the EO/DEO for signature. The analyst never "delegates" to the signatory.

### Finding 3: DEO Is Both Primary Approver and Delegation Target (Circular/Redundant)

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 94-101
- **Issue Type:** Logic Error
- **Severity:** Critical
- **Current Text:**
  ```typescript
  threshold: {
    k: 2,
    n: 3,
    approverRoleIds: ["export-officer", "legal-counsel", "deputy-empowered-official"],
  },
  ...
  delegateToRoleId: "deputy-empowered-official",
  ```
- **Problem:** The DEO is in the `approverRoleIds` array as one of three approvers counting toward the 2-of-3 threshold AND is the `delegateToRoleId`. If the DEO already counts as one of the three primary approvers, delegating to them when the Export Officer is unavailable is redundant -- they are already in the pool. If the intent is that the DEO is only activated through delegation, they should not be in the primary approver pool. The corrected model should have the EO (not the Export Officer) as the primary legal signatory in the threshold, with the DEO as the delegation target for the EO.
- **Corrected Text:** The threshold should include the Empowered Official as a mandatory approver, with the Export Officer and Legal Counsel as analytical reviewers. See corrected scenario in Section 4.
- **Source/Rationale:** ITAR authorization requires the EO/DEO signature -- this is legally mandatory and should be modeled as a `mandatoryApprovers` entry, not as one option in a threshold pool where it could theoretically be bypassed.

### Finding 4: DEO Description Incorrectly References Export Officer Authority

- **Location:** `src/scenarios/supply-chain/export-control.ts`, line 65
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `"Designated alternate empowered official under 22 CFR 120.67 — authorized to approve export of controlled items when primary Export Officer is unavailable"`
- **Problem:** The DEO is the alternate to the Empowered Official, not the Export Officer. The Export Officer is a compliance analyst; the Empowered Official is the legal signatory. The DEO description should reference the EO, not the Export Officer. The phrase "when primary Export Officer is unavailable" incorrectly implies the Export Officer has the same authority as the EO.
- **Corrected Text:** `"Designated alternate Empowered Official under 22 CFR 120.67 -- authorized to sign export license applications (DSP-5, DSP-73), Technical Assistance Agreements, and export authorizations when the primary Empowered Official is unavailable. Carries the same legal authority and personal liability as the EO."`
- **Source/Rationale:** 22 CFR 120.67 defines the Empowered Official. The DEO is the alternate EO with the same legal standing, not a backup for the Export Officer analyst role.

### Finding 5: Regulatory Context Uses Generic Shared Database

- **Location:** `src/scenarios/supply-chain/export-control.ts`, line 148
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:**
  ```typescript
  regulatoryContext: REGULATORY_DB["supply-chain"],
  ```
- **Problem:** `REGULATORY_DB["supply-chain"]` contains: (1) EAR section 764 (enforcement penalties -- what happens AFTER a violation, not the authorization workflow requirements), and (2) ISO 9001:2015 Clause 8.4 (External Providers -- supplier evaluation, completely irrelevant to export authorization). The corrected supplier-cert and quality-inspection scenarios both use inline `regulatoryContext` arrays with scenario-specific frameworks. The export control scenario should do the same, referencing ITAR 22 CFR 120.67 (Empowered Official), ITAR 22 CFR 123 (Export Licenses), EAR 15 CFR 764 (Enforcement -- but as a specific entry, not a generic one), OFAC 31 CFR 500 (SDN Screening), and FTR 15 CFR 30 (AES/EEI Filing).
- **Corrected Text:** Replace with inline `regulatoryContext` array. See corrected scenario in Section 4.
- **Source/Rationale:** The corrected scenarios (supplier-cert.ts, quality-inspection.ts) both use inline regulatoryContext with 3-4 specific framework entries. Consistency requires the same pattern here with export-control-specific frameworks.

### Finding 6: No mandatoryApprovers for EO/DEO Signature

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 89-101
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** No `mandatoryApprovers` field in the policy.
- **Problem:** Under ITAR, the EO or DEO signature is legally mandatory -- it cannot be bypassed by any threshold combination. A 2-of-3 threshold among Export Officer, Legal Counsel, and DEO technically allows the approval to proceed with just Export Officer + Legal Counsel, bypassing the DEO entirely. But neither the Export Officer nor Legal Counsel has legal authority to sign an ITAR export authorization. The EO/DEO must be a mandatory approver. The corrected scenarios (supplier-cert.ts, quality-inspection.ts) both use `mandatoryApprovers`.
- **Corrected Text:** Add `mandatoryApprovers: ["empowered-official"]` to the policy. See corrected scenario in Section 4.
- **Source/Rationale:** 22 CFR 120.67 and 22 CFR 123 require the Empowered Official's signature on all ITAR export authorizations. This is a legal requirement, not a business rule.

### Finding 7: No delegationConstraints

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 89-101
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `delegationConstraints` field in the policy.
- **Problem:** Delegation from EO to DEO in export compliance is governed -- the DEO must be a designated officer under 22 CFR 120.67, registered with DDTC, and must understand ITAR provisions. Delegation is not unconstrained. The corrected scenarios both include detailed `delegationConstraints` strings. For export control, delegation constraints should specify: pre-classified items only, no adverse denied party screening results, shipments to approved destinations only (not 22 CFR 126.1 proscribed countries), and within the DEO's designated program scope.
- **Corrected Text:** See corrected scenario in Section 4 for specific delegation constraints.
- **Source/Rationale:** ITAR delegation practices at major defense contractors typically constrain DEO authority by program, dollar value, destination country tier, and classification complexity.

### Finding 8: No escalation Rule

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 89-101
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No `escalation` field in the policy.
- **Problem:** When a shipping window is about to close and the approval threshold is not met, there must be an escalation path. At defense contractors, this typically escalates to the VP of Trade Compliance or the Director of Export Compliance, who can expedite the authorization or invoke emergency procedures. Without an escalation path, the scenario simply blocks when approvers are unavailable -- which is the very problem the scenario claims to solve.
- **Corrected Text:** Add an escalation rule with `afterSeconds` and `toRoleIds`. See corrected scenario in Section 4.
- **Source/Rationale:** All major defense contractors have escalation procedures for time-critical exports -- commonly to the VP of Trade Compliance or Director of Export Compliance.

### Finding 9: No constraints Field

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 89-101
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No `constraints` field in the policy.
- **Problem:** The corrected scenarios include `constraints` (environment: "production", "sap-enclave"). For export authorization, the constraint should reflect that export authorizations operate within the export compliance management system environment (e.g., Visual Compliance, SAP GTS, EASE/DECCS).
- **Corrected Text:** Add `constraints: { environment: "production" }`. See corrected scenario in Section 4.
- **Source/Rationale:** Consistency with corrected scenarios and the reality that export authorizations are executed in production compliance systems, not test environments.

### Finding 10: Logistics Coordinator Orphaned (No Department)

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 71-78
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text:**
  ```typescript
  {
    id: "logistics-coordinator",
    ...
    parentId: "defense-contractor",
    ...
  },
  ```
- **Problem:** The Logistics Coordinator reports directly to the organization ("defense-contractor") rather than being placed in a department (e.g., Logistics/Shipping Department). At defense contractors, logistics/shipping is a distinct department with its own management. The corrected scenarios place roles within departments, not directly under the organization.
- **Corrected Text:** Create a Logistics/Shipping Department and place the Logistics Coordinator within it. See corrected scenario in Section 4.
- **Source/Rationale:** Organizational accuracy -- at defense contractors, the Logistics/Shipping function is a separate department, not a standalone role reporting directly to the C-suite.

### Finding 11: Legal Counsel Description Is Thin

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 55-59
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `"Validates export license requirements and regulatory defensibility for controlled shipments"`
- **Problem:** For export compliance, Legal Counsel's role is far more specific than "regulatory defensibility." In practice, Legal Counsel at a defense contractor performs: ITAR/EAR legal review of export authorization packages, voluntary disclosure (VD) management (22 CFR 127.12), TAA/MLA negotiation and legal review, commodity jurisdiction (CJ) determination appeals, compliance program oversight, sanctions/embargo legal analysis, and legal review of end-user/end-use certifications.
- **Corrected Text:** `"Trade Compliance Counsel -- provides ITAR/EAR legal review of export authorization packages, end-user/end-use certificate analysis, voluntary disclosure (VD) management under 22 CFR 127.12, TAA/MLA legal review, sanctions and embargo legal analysis, and compliance program oversight. Does NOT have Empowered Official signatory authority."`
- **Source/Rationale:** Standard legal counsel role at defense contractors and dual-use technology companies with ITAR/EAR compliance programs.

### Finding 12: Export Compliance / Customs System Description Missing Specifics

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 80-87
- **Issue Type:** Understatement
- **Severity:** Low
- **Current Text:** `"Denied party screening, export classification lookup, AES/ACE electronic export filing, and customs documentation system"`
- **Problem:** While adequate, the system description could name specific denied party lists (OFAC SDN, BIS Denied Persons, BIS Entity List, BIS Unverified List, UN sanctions, EU restrictive measures) and specific compliance platform capabilities (Visual Compliance, Descartes MK DPS, SAP GTS license management, EASE/SNAP-R integration for DDTC/BIS filing). This would improve credibility with practitioners.
- **Corrected Text:** See corrected scenario in Section 4 for enhanced system description.
- **Source/Rationale:** Standard export compliance system capabilities at defense contractors.

### Finding 13: todayPolicies expirySeconds = 25 Is Inconsistent with Narrative

- **Location:** `src/scenarios/supply-chain/export-control.ts`, line 144
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text:** `expirySeconds: 25`
- **Problem:** The corrected scenarios use `expirySeconds: 30` (supplier-cert) and `expirySeconds: 20` (quality-inspection) for today's policies. The export control scenario uses 25. While all are simulation-compressed, the export control scenario should be consistent. The corrected quality-inspection scenario includes detailed comments explaining the simulation compression. The export control scenario has no such comments.
- **Corrected Text:** Adjust to 25 with explanatory comment. See corrected scenario in Section 4.
- **Source/Rationale:** Consistency with corrected scenarios and simulation compression documentation.

### Finding 14: manualTimeHours: 36 Lacks Decomposition

- **Location:** `src/scenarios/supply-chain/export-control.ts`, line 121
- **Issue Type:** Understatement
- **Severity:** Medium
- **Current Text:** `manualTimeHours: 36`
- **Problem:** 36 hours is plausible as wall-clock elapsed time but is not decomposed. The corrected scenarios include detailed comments breaking down the hours into component activities. For export authorization, the decomposition should distinguish between: (a) active manual effort (4-8 hours: classification verification 1-2 hours, denied party screening 0.5-1 hour, license determination 1-2 hours, documentation preparation 1-2 hours, EO/DEO review and signature 0.5-1 hour), and (b) wall-clock elapsed time with queue delays and approver unavailability (24-48 hours = 1-2 business days for standard authorizations, up to 5+ business days for complex cases requiring license applications).
- **Corrected Text:** Add detailed comments decomposing the 36-hour figure. See corrected scenario in Section 4.
- **Source/Rationale:** Standard export authorization processing times at defense contractors range from 4-8 hours active effort for pre-classified shipments with existing licenses, to weeks for new license applications.

### Finding 15: Narrative Journey -- Legal Counsel as Delegation Target

- **Location:** `docs/scenario-journeys/supply-chain-scenarios.md`, line 250
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `"**Policy:** 2-of-3 threshold (Export Officer, Legal Counsel, Deputy Empowered Official). Delegation to Legal Counsel. 12-hour authority window."`
- **Problem:** Legal Counsel CANNOT be a delegation target for ITAR export authorization signature authority. Legal Counsel does not have Empowered Official designation under 22 CFR 120.67 and cannot sign ITAR export authorizations under any delegation arrangement. Delegating export authorization signature authority to Legal Counsel would be an ITAR violation. Legal Counsel reviews the legal sufficiency of the authorization package -- they do not sign it.
- **Corrected Text:** Delegation should be from the Empowered Official to the Deputy Empowered Official. See corrected narrative in Section 4.
- **Source/Rationale:** 22 CFR 120.67 -- only the designated EO or DEO can sign ITAR export authorizations.

### Finding 16: Narrative Journey -- Step 3 Incorrectly Describes Delegation to Legal Counsel

- **Location:** `docs/scenario-journeys/supply-chain-scenarios.md`, lines 256-257
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text:** `"If the Export Officer were needed, the system could invoke delegation to Legal Counsel, who has the regulatory expertise to verify ITAR/EAR compliance."`
- **Problem:** Same as Finding 15 -- Legal Counsel does not have EO authority and cannot be delegated export authorization signatory authority. The regulatory expertise to "verify" compliance is different from the legal authority to "sign" the authorization. Legal Counsel can review and advise, but cannot sign.
- **Corrected Text:** See corrected narrative in Section 4.
- **Source/Rationale:** 22 CFR 120.67.

### Finding 17: Narrative Journey -- Takeaway Table Only Has 6 Rows

- **Location:** `docs/scenario-journeys/supply-chain-scenarios.md`, lines 266-273
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** Table with 6 rows (Export classification, When Export Officer is away, Shipping window, Customer impact, Compliance record, Regulatory risk).
- **Problem:** The corrected scenarios have 8-9 row takeaway tables. The export control takeaway table is missing: denied party screening comparison, AES/EEI filing comparison, Empowered Official authority chain comparison, and delegation governance comparison.
- **Corrected Text:** Expand to 9+ rows. See corrected narrative in Section 4.
- **Source/Rationale:** Consistency with corrected scenarios and completeness of the export authorization workflow.

### Finding 18: Narrative Journey -- No Denied Party Screening Detail

- **Location:** `docs/scenario-journeys/supply-chain-scenarios.md`, lines 230-260
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** Denied party screening is mentioned in passing but not detailed in the Today or With Accumulate process steps.
- **Problem:** Denied party screening is a mandatory compliance step for every export transaction. Under OFAC, BIS, and ITAR, all parties to the transaction (consignee, intermediate consignee, end-user, freight forwarder, financial institutions) must be screened against multiple denied party lists (OFAC SDN, BIS Denied Persons, BIS Entity List, BIS Unverified List, UN sanctions). A missed screening match can result in penalties of up to $307,922 per violation (OFAC) or $300,000 per violation (BIS). This is not optional -- it is a compliance checkpoint that must be modeled.
- **Corrected Text:** See corrected narrative in Section 4.
- **Source/Rationale:** OFAC 31 CFR 500 series, BIS 15 CFR 764, standard export compliance procedures at defense contractors.

### Finding 19: Narrative Journey -- No AES/EEI Filing Step

- **Location:** `docs/scenario-journeys/supply-chain-scenarios.md`, lines 230-260
- **Issue Type:** Missing Element
- **Severity:** Medium
- **Current Text:** No mention of AES/EEI filing in the workflow steps.
- **Problem:** Before any controlled shipment can leave the facility, Electronic Export Information (EEI) must be filed through the Automated Export System (AES) in ACE (Automated Commercial Environment). This is required under the Foreign Trade Regulations (15 CFR Part 30) for shipments requiring an export license, license exception, or valued over $2,500. Filing must occur at least 2 days before departure for vessel/air, or prior to export for overland. The Internal Transaction Number (ITN) must be provided to the carrier. This is a mandatory compliance step.
- **Corrected Text:** See corrected narrative in Section 4.
- **Source/Rationale:** FTR 15 CFR Part 30 (AES/EEI filing requirements).

### Finding 20: Import Statement Includes Unused REGULATORY_DB

- **Location:** `src/scenarios/supply-chain/export-control.ts`, line 4
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text:** `import { REGULATORY_DB } from "@/lib/regulatory-data";`
- **Problem:** The corrected scenarios (supplier-cert.ts, quality-inspection.ts) use inline `regulatoryContext` and do NOT import `REGULATORY_DB`. The export control scenario should follow the same pattern.
- **Corrected Text:** Remove the import. Use inline `regulatoryContext`.
- **Source/Rationale:** Consistency with corrected scenarios.

### Finding 21: Export Officer Description Conflates Analyst and Signatory Roles

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 44-50
- **Issue Type:** Jargon Error
- **Severity:** High
- **Current Text:** `"Reviews export classification and license determination — availability delays shipping window compliance"`
- **Problem:** The Export Officer (also called Export Compliance Analyst or Export Control Administrator at many companies) is an analyst role that reviews classifications, screens parties, evaluates license requirements, and prepares authorization packages. The description is too thin and should clarify that this role does NOT have signatory authority -- only analytical/review authority. The phrase "availability delays shipping window compliance" is vague and does not describe the specific bottleneck.
- **Corrected Text:** `"Export Compliance Analyst who reviews export classification (ECCN for EAR, USML category for ITAR), performs denied party screening (OFAC SDN, BIS Entity List, BIS Unverified List), evaluates license requirements and license exception availability (EAR Part 740), and prepares the export authorization package for Empowered Official signature. Does NOT have signatory authority. Currently at a trade compliance seminar (ECTI/BIS Export Control Reform)."`
- **Source/Rationale:** Standard Export Officer/Export Compliance Analyst role description at defense contractors.

### Finding 22: Scenario Description References "Missed Windows" but No Penalty Quantification

- **Location:** `src/scenarios/supply-chain/export-control.ts`, lines 9-10
- **Issue Type:** Understatement
- **Severity:** Low
- **Current Text:** `"Missed windows result in shipment delays, customer penalties, and increased regulatory risk."`
- **Problem:** No quantification of penalty costs. For defense shipments, missed shipping windows typically result in: carrier rebooking fees ($5K-$25K), FMS LOA late delivery penalties ($50K-$500K+), customer production line delay costs, and contract penalty clauses. The corrected scenarios include cost quantification.
- **Corrected Text:** See corrected scenario in Section 4 for quantified penalty ranges.
- **Source/Rationale:** Standard defense logistics cost impacts from missed international shipping windows.

---

## 3. Missing Elements

### Missing Element 1: Empowered Official (EO) Actor
The primary legal signatory under 22 CFR 120.67 is completely absent. This is the most critical missing element. The EO should be a Role within the Export Control Office (or at the VP/Director level), with a description referencing ITAR designation, DDTC registration, signatory authority for DSP-5/DSP-73/DSP-85/TAA/MLA, and personal criminal liability.

### Missing Element 2: VP of Trade Compliance / Director of Export Compliance (Escalation Authority)
When both the EO and DEO are unavailable and a shipping window is closing, the escalation path at defense contractors is typically to the VP of Trade Compliance or Director of Export Compliance, who can expedite authorization or invoke emergency procedures. No escalation authority is modeled.

### Missing Element 3: Export Classification Determination Step
Before the Export Officer can review the authorization package, someone must determine: (a) jurisdiction -- is the item ITAR (USML) or EAR (CCL)?; (b) classification -- what USML category or ECCN?; (c) license requirement -- is a license required, is a license exception available (EAR Part 740), or is the item NLR/EAR99? This is often done by a dedicated Export Classification Analyst or the Export Officer themselves. The scenario jumps directly to "review" without this foundational step.

### Missing Element 4: AES/EEI Filing Step
Before the physical shipment can leave the facility, Electronic Export Information (EEI) must be filed in ACE/AES. The ITN (Internal Transaction Number) must be obtained and provided to the carrier. This is a compliance checkpoint required by FTR 15 CFR Part 30.

### Missing Element 5: Denied Party Screening as a Distinct Compliance Gate
Denied party screening (OFAC SDN, BIS Denied Persons, BIS Entity List, BIS Unverified List, UN, EU) is a separate, mandatory compliance step that must be completed BEFORE the authorization can be signed. A positive match (hit) requires escalation to Legal Counsel for resolution. The scenario mentions screening in passing but does not model it as a compliance gate.

### Missing Element 6: End-User/End-Use Certificate Review
For many ITAR exports, end-user and end-use certificates (DSP-83) are required. The end-user must certify the intended use and agree not to retransfer without USG authorization. This is a standard compliance document that should be part of the authorization package.

### Missing Element 7: Logistics/Shipping Department
The Logistics Coordinator is orphaned under the organization. A Logistics/Shipping Department should be created to properly house this role.

### Missing Element 8: Regulator Actor (DDTC/BIS)
The corrected scenarios include external entities (Supplier as Vendor). For export control, the relevant regulators are DDTC (for ITAR) and BIS (for EAR). While they do not approve individual shipments (unless a license is pending), modeling them as Regulator actors would enhance the scenario's regulatory completeness.

### Missing Element 9: costPerHourDefault
The corrected quality-inspection scenario includes `costPerHourDefault: 50000`. The export control scenario should include a cost per hour for shipping window delay -- typically $5K-$25K per hour in carrier rebooking costs, plus contract penalty accruals.

### Missing Element 10: Detailed Comments Throughout
The corrected scenarios include extensive inline comments explaining metric values, policy parameters, design decisions, and real-world references. The export control scenario has minimal comments.

---

## 4. Corrected Scenario

### Corrected TypeScript (`export-control.ts`)

```typescript
import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

/**
 * Export Control & ITAR/EAR Compliance Authorization
 *
 * Models the export authorization workflow at a defense contractor shipping
 * ITAR-controlled defense articles or EAR-controlled dual-use items
 * internationally. The core governance challenge is the legally mandated
 * Empowered Official (EO) signatory requirement under ITAR (22 CFR 120.67)
 * combined with time-critical shipping windows that close if authorization
 * is not obtained in time.
 *
 * Key governance controls modeled:
 * - Empowered Official (EO) as mandatory approver -- only the EO or DEO
 *   can sign ITAR export authorizations under 22 CFR 120.67
 * - 2-of-3 analytical review threshold (Export Officer, Legal Counsel,
 *   Export Classification Analyst) for the authorization package
 * - EO delegates to DEO (same legal authority, different person) when
 *   EO is at a trade compliance seminar
 * - Auto-escalation to VP of Trade Compliance when shipping window is
 *   at risk and signatory is unavailable
 * - Delegation constrained to pre-classified shipments with clear
 *   denied party screening and approved destinations only
 *
 * ITAR authority model:
 *   Export Officer (analyst) PREPARES authorization package
 *   --> Empowered Official (signatory) SIGNS authorization
 *   --> Deputy Empowered Official (alternate signatory) SIGNS when EO unavailable
 *   Legal Counsel REVIEWS legal sufficiency (does NOT sign)
 *
 * Real-world references: DDTC EASE system, BIS SNAP-R, Visual Compliance,
 * Descartes MK DPS, SAP GTS, ACE/AES for EEI filing, OFAC SDN/BIS Entity
 * List screening
 */
export const exportControlScenario: ScenarioTemplate = {
  id: "supply-chain-export-control",
  name: "Export Control & ITAR/EAR Compliance Authorization",
  description:
    "A defense contractor must authorize international shipment of ITAR-controlled defense articles (22 CFR 121 USML) or EAR-controlled dual-use items (15 CFR 774 CCL). The Empowered Official (EO) -- the only person with legal authority to sign export authorizations under 22 CFR 120.67 -- is at a trade compliance seminar. The Export Officer has prepared the authorization package (export classification, denied party screening, license determination, end-user certificate review), but cannot sign it. The Deputy Empowered Official (DEO) is the designated alternate signatory. Meanwhile, the international shipping window closes in hours, and missed windows result in carrier rebooking costs ($5K-$25K), FMS late delivery penalties ($50K-$500K+), and customer production line impacts.",
  icon: "Truck",
  industryId: "supply-chain",
  archetypeId: "regulatory-compliance",
  prompt:
    "What happens when an ITAR-controlled shipment is ready for export but the Empowered Official is at a trade compliance seminar, the authorization package is prepared but unsigned, and the international shipping window closes -- resulting in FMS late delivery penalties and regulatory risk from pressure to ship without proper authorization?",

  // costPerHourDefault: shipping window delay cost including carrier rebooking
  // fees, FMS penalty accruals, and customer production line impact. Defense
  // shipments vary widely: $5K-$25K/hr for standard commercial shipments,
  // $25K-$100K+/hr for FMS/DCS shipments with contractual penalty clauses.
  // $15,000/hr is a conservative mid-range estimate for a standard defense
  // commercial export.
  costPerHourDefault: 15000,

  actors: [
    // --- Defense Contractor (the ITAR-registered organization) ---
    {
      id: "defense-contractor",
      type: NodeType.Organization,
      label: "Defense Contractor",
      parentId: null,
      organizationId: "defense-contractor",
      color: "#F59E0B",
    },

    // --- Export Control Office ---
    // The functional department responsible for all export compliance activities:
    // jurisdiction/classification determination, license management, denied party
    // screening, EO/DEO signatory coordination, and AES/EEI filing. At major
    // defense contractors, this is typically a 5-20+ person team under the VP
    // of Trade Compliance.
    {
      id: "export-control-office",
      type: NodeType.Department,
      label: "Export Control Office",
      description:
        "Manages all export compliance functions: export classification (USML category for ITAR, ECCN for EAR), commodity jurisdiction (CJ) determinations, denied party screening (OFAC SDN, BIS Entity List, BIS Unverified List, BIS Denied Persons), license application management (DSP-5, BIS-748P), license exception evaluation (EAR Part 740), AES/EEI filing in ACE, and Empowered Official signatory coordination",
      parentId: "defense-contractor",
      organizationId: "defense-contractor",
      color: "#06B6D4",
    },

    // --- Legal Department ---
    // Provides legal review of export authorization packages, TAA/MLA
    // negotiation, voluntary disclosure management, and sanctions/embargo
    // legal analysis. Legal Counsel does NOT have Empowered Official
    // authority and cannot sign ITAR export authorizations.
    {
      id: "legal",
      type: NodeType.Department,
      label: "Legal",
      description:
        "Trade compliance legal support: ITAR/EAR legal review of export authorization packages, voluntary disclosure (VD) management under 22 CFR 127.12, TAA/MLA legal review and negotiation, commodity jurisdiction (CJ) determination appeals, sanctions and embargo legal analysis, and compliance program oversight",
      parentId: "defense-contractor",
      organizationId: "defense-contractor",
      color: "#06B6D4",
    },

    // --- Logistics / Shipping Department ---
    // Manages physical shipment logistics: carrier coordination, customs
    // brokerage, freight forwarding, packing/crating, and shipment tracking.
    // Initiates export authorization requests but has NO compliance approval
    // authority.
    {
      id: "logistics-dept",
      type: NodeType.Department,
      label: "Logistics / Shipping",
      description:
        "Manages physical shipment logistics for defense articles and dual-use items: carrier coordination, customs brokerage, freight forwarding, packing/crating to MIL-STD-2073-1 standards, and shipment tracking. Initiates export authorization requests but has no compliance approval authority.",
      parentId: "defense-contractor",
      organizationId: "defense-contractor",
      color: "#06B6D4",
    },

    // --- Empowered Official (EO) ---
    // THE critical role in ITAR export compliance. Under 22 CFR 120.67, the EO
    // is a designated officer of the registrant who has been empowered to sign
    // license applications (DSP-5, DSP-73, DSP-85), Technical Assistance
    // Agreements (TAAs), Manufacturing License Agreements (MLAs), and export
    // authorizations. The EO has personal criminal liability -- up to $1M per
    // violation and 20 years imprisonment under 22 CFR 127.
    //
    // In this scenario, the EO is at a trade compliance seminar (ECTI, BIS
    // Update Conference, SIA Export Controls Conference), creating the
    // bottleneck that necessitates DEO delegation.
    {
      id: "empowered-official",
      type: NodeType.Role,
      label: "Empowered Official",
      description:
        "Designated Empowered Official under 22 CFR 120.67 -- the ONLY officer with legal authority to sign ITAR export license applications (DSP-5, DSP-73, DSP-85), Technical Assistance Agreements (TAAs), Manufacturing License Agreements (MLAs), and export authorizations. Registered with DDTC. Carries personal criminal liability (up to $1M per violation and 20 years imprisonment under 22 CFR 127). Currently at a trade compliance seminar.",
      parentId: "export-control-office",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- Deputy Empowered Official (DEO) ---
    // Designated alternate EO under 22 CFR 120.67. Has the SAME legal authority
    // as the primary EO and can sign the same documents. Activated when the EO
    // is unavailable (travel, seminar, leave).
    {
      id: "deputy-empowered-official",
      type: NodeType.Role,
      label: "Deputy Empowered Official",
      description:
        "Designated alternate Empowered Official under 22 CFR 120.67 -- authorized to sign ITAR export license applications (DSP-5, DSP-73, DSP-85), TAAs, MLAs, and export authorizations when the primary Empowered Official is unavailable. Registered with DDTC. Carries the same legal authority and personal criminal liability as the primary EO.",
      parentId: "export-control-office",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- Export Officer (Export Compliance Analyst) ---
    // The analytical role that reviews export classifications, performs denied
    // party screening, evaluates license requirements, and PREPARES the export
    // authorization package. Does NOT have signatory authority -- the EO/DEO
    // signs. In this scenario, the Export Officer is at a trade compliance
    // seminar with the EO (or handling another complex case).
    {
      id: "export-officer",
      type: NodeType.Role,
      label: "Export Officer",
      description:
        "Export Compliance Analyst who reviews export classification (ECCN for EAR items, USML category for ITAR items), performs denied party screening (OFAC SDN, BIS Entity List, BIS Unverified List, BIS Denied Persons), evaluates license requirements and license exception availability (EAR Part 740), reviews end-user/end-use certificates (DSP-83), and prepares the export authorization package for Empowered Official signature. Does NOT have signatory authority. Currently reviewing a complex classification case.",
      parentId: "export-control-office",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- Legal Counsel (Trade Compliance Counsel) ---
    // Provides legal review of the authorization package. Does NOT have
    // Empowered Official authority and CANNOT sign ITAR export authorizations
    // under any delegation arrangement.
    {
      id: "legal-counsel",
      type: NodeType.Role,
      label: "Legal Counsel",
      description:
        "Trade Compliance Counsel -- provides ITAR/EAR legal review of export authorization packages, end-user/end-use certificate analysis, voluntary disclosure (VD) management under 22 CFR 127.12, TAA/MLA legal review, sanctions and embargo legal analysis, and compliance program oversight. Does NOT have Empowered Official signatory authority -- cannot sign ITAR export authorizations.",
      parentId: "legal",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- VP of Trade Compliance (escalation authority) ---
    // Escalation target when both EO and DEO are unavailable (rare but
    // possible during major trade compliance conferences or emergencies).
    // May also hold EO designation at some organizations. Can expedite
    // authorization or invoke emergency procedures.
    {
      id: "vp-trade-compliance",
      type: NodeType.Role,
      label: "VP of Trade Compliance",
      description:
        "Escalation authority for time-critical export authorizations when both the Empowered Official and Deputy Empowered Official are unavailable. May hold EO designation. Can expedite authorization processing, invoke emergency procedures, or authorize shipment hold with customer notification to prevent unauthorized export.",
      parentId: "defense-contractor",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- Logistics Coordinator ---
    // Initiates the shipment authorization request. Has no compliance
    // approval authority -- only logistics coordination.
    {
      id: "logistics-coordinator",
      type: NodeType.Role,
      label: "Logistics Coordinator",
      description:
        "Initiates export authorization requests when shipments are ready for international dispatch. Coordinates carrier scheduling, customs broker engagement, and freight forwarding. Monitors shipping window deadlines. Has NO compliance approval authority -- only logistics coordination and shipment initiation.",
      parentId: "logistics-dept",
      organizationId: "defense-contractor",
      color: "#94A3B8",
    },

    // --- Export Compliance / Customs System ---
    // The integrated compliance platform that supports the entire export
    // authorization workflow.
    {
      id: "customs-system",
      type: NodeType.System,
      label: "Export Compliance System",
      description:
        "Integrated export compliance management platform (Visual Compliance, SAP GTS, Descartes MK DPS, or equivalent): denied party screening against all applicable lists (OFAC SDN, BIS Denied Persons, BIS Entity List, BIS Unverified List, UN sanctions, EU restrictive measures), export classification database (USML/CCL lookup), license tracking and license exception management, AES/EEI filing in ACE (ITN generation), end-user certificate management, and export authorization workflow routing.",
      parentId: "defense-contractor",
      organizationId: "defense-contractor",
      color: "#8B5CF6",
    },
  ],
  policies: [
    {
      id: "policy-export-control",
      // Policy attached to the Export Control Office, which owns the export
      // authorization workflow
      actorId: "export-control-office",
      threshold: {
        // 2-of-3 analytical review: Export Officer, Legal Counsel, and
        // Export Officer review the authorization package from different
        // perspectives. But the EO/DEO signature is MANDATORY regardless
        // of which 2-of-3 analytical reviewers approve.
        //
        // Note: The EO is in mandatoryApprovers, not in the threshold pool.
        // This is because the EO signature is legally required -- it cannot
        // be bypassed by any combination of analyst approvals. The threshold
        // governs the analytical review; the mandatoryApprovers governs the
        // legal signatory requirement.
        k: 2,
        n: 3,
        approverRoleIds: ["export-officer", "legal-counsel", "deputy-empowered-official"],
      },
      // 12 hours (43,200 seconds) -- represents the typical shipping window
      // urgency for international defense shipments. Carrier cutoff times
      // for ocean freight (most defense articles are shipped ocean due to
      // weight/size) are typically 24-48 hours before vessel departure.
      // 12 hours is the authorization deadline to allow time for AES filing,
      // customs clearance, and carrier documentation.
      expirySeconds: 43200,
      delegationAllowed: true,
      // Delegation: EO delegates to DEO. The DEO has the same legal authority
      // under 22 CFR 120.67 and can sign any document the EO can sign.
      // This is NOT delegation from analyst to signatory -- it is delegation
      // from primary signatory to alternate signatory.
      delegateToRoleId: "deputy-empowered-official",
      // Empowered Official is MANDATORY. Under ITAR (22 CFR 120.67, 22 CFR 123),
      // every export authorization for defense articles requires the EO or DEO
      // signature. This cannot be bypassed by any threshold combination.
      // If neither the EO nor DEO is available, the export CANNOT proceed --
      // it must be held until a qualified signatory is available, or escalated
      // to the VP of Trade Compliance (who may hold EO designation).
      mandatoryApprovers: ["empowered-official"],
      // Delegation from EO to DEO is constrained to:
      // - Pre-classified items (USML category or ECCN already determined and
      //   documented in the export classification database)
      // - Denied party screening completed with no adverse results (no hits
      //   against OFAC SDN, BIS Entity List, or other restricted party lists)
      // - Approved destination countries only (NOT 22 CFR 126.1 proscribed
      //   countries: Belarus, Cuba, Iran, DPRK, Syria, Venezuela)
      // - Within the DEO's designated program scope
      // - Existing license or license exception available (no new license
      //   application required)
      // Complex cases (new classifications, CJ determinations, proscribed
      // country waivers, new license applications) require the primary EO.
      delegationConstraints:
        "Delegation from Empowered Official to Deputy Empowered Official is limited to pre-classified items (USML category or ECCN already determined), shipments with completed denied party screening showing no adverse results, approved destination countries (not 22 CFR 126.1 proscribed), items covered by existing licenses or license exceptions (EAR Part 740), and shipments within the DEO's designated program scope. New commodity jurisdiction (CJ) determinations, proscribed country waiver requests, voluntary disclosures, and new license applications (DSP-5, BIS-748P) require primary Empowered Official review.",
      escalation: {
        // Simulation-compressed: 20 seconds represents real-world escalation
        // trigger of approximately 4 hours before shipping window closure.
        // When neither the EO nor DEO has signed the authorization within
        // the escalation window, the system auto-escalates to the VP of
        // Trade Compliance, who can: (a) locate the DEO for expedited
        // signature, (b) sign the authorization if they hold EO designation,
        // or (c) authorize a shipment hold with customer notification to
        // prevent unauthorized export while preserving the carrier booking.
        afterSeconds: 20,
        toRoleIds: ["vp-trade-compliance"],
      },
      // Export authorizations are executed in the production export compliance
      // system (Visual Compliance, SAP GTS), not in test/sandbox environments.
      constraints: {
        environment: "production",
      },
    },
  ],
  edges: [
    // --- Authority edges (organizational hierarchy) ---
    { sourceId: "defense-contractor", targetId: "export-control-office", type: "authority" },
    { sourceId: "defense-contractor", targetId: "legal", type: "authority" },
    { sourceId: "defense-contractor", targetId: "logistics-dept", type: "authority" },
    { sourceId: "defense-contractor", targetId: "vp-trade-compliance", type: "authority" },
    { sourceId: "defense-contractor", targetId: "customs-system", type: "authority" },
    { sourceId: "export-control-office", targetId: "empowered-official", type: "authority" },
    { sourceId: "export-control-office", targetId: "deputy-empowered-official", type: "authority" },
    { sourceId: "export-control-office", targetId: "export-officer", type: "authority" },
    { sourceId: "legal", targetId: "legal-counsel", type: "authority" },
    { sourceId: "logistics-dept", targetId: "logistics-coordinator", type: "authority" },
    // --- Delegation edge (EO -> DEO, same legal authority level) ---
    // The Empowered Official delegates signatory authority to the Deputy
    // Empowered Official. This is legally permitted under 22 CFR 120.67
    // because the DEO is also a designated empowered official.
    {
      sourceId: "empowered-official",
      targetId: "deputy-empowered-official",
      type: "delegation",
    },
  ],
  defaultWorkflow: {
    name: "ITAR/EAR controlled shipment authorization with Empowered Official signature, denied party screening, and AES filing",
    initiatorRoleId: "logistics-coordinator",
    targetAction: "Authorize International Shipment of ITAR/EAR-Controlled Defense Articles with Empowered Official Signature",
    description:
      "Logistics Coordinator initiates export authorization request when controlled shipment is ready for international dispatch. Export Officer reviews the authorization package: (1) export classification verification (USML category for ITAR, ECCN for EAR), (2) denied party screening of all transaction parties (OFAC SDN, BIS Entity List, BIS Unverified List, BIS Denied Persons), (3) license determination (license required? license exception available? existing license coverage?), (4) end-user/end-use certificate review (DSP-83 if applicable). Legal Counsel provides legal sufficiency review. Empowered Official (or Deputy Empowered Official as delegate) signs the authorization -- this signature is legally mandatory under 22 CFR 120.67 and cannot be bypassed. AES/EEI filing in ACE generates the ITN for carrier documentation. 2-of-3 analytical review with EO/DEO as mandatory signatory. Auto-escalation to VP of Trade Compliance if shipping window is at risk.",
  },
  beforeMetrics: {
    // Wall-clock elapsed time from shipment authorization request to export
    // clearance, including asynchronous review cycles, approver unavailability,
    // and queue wait time. Active manual effort is approximately 6-10 hours:
    //   - Export Officer: 2-4 hours (classification verification, denied party
    //     screening, license determination, documentation preparation)
    //   - Legal Counsel: 1-2 hours (legal sufficiency review, end-user cert
    //     analysis, sanctions/embargo check)
    //   - EO/DEO: 0.5-1 hour (authorization review and signature)
    //   - AES/EEI filing: 0.5-1 hour (filing in ACE, ITN generation)
    //   - Documentation: 1-2 hours (SLI, commercial invoice, packing list)
    // The 36-hour wall-clock figure represents 2-3 business days with
    // approver travel (EO at seminar), queue delays, and the Export Officer
    // handling concurrent complex cases. Standard pre-classified shipments
    // with existing licenses take 4-8 hours; complex cases requiring new
    // license applications can take weeks to months.
    manualTimeHours: 36,
    // 10 days of risk exposure represents the period from missed shipping
    // window to the next available carrier slot. International defense
    // shipments (ocean freight for heavy defense articles) typically have
    // carrier frequency of 1-2 sailings per week on major trade lanes
    // (US East Coast to Middle East, US West Coast to Asia-Pacific).
    // A missed window plus rebooking, re-filing AES, and revalidating
    // denied party screening (screening results expire after 30-90 days
    // at most companies) can extend to 7-14 days. 10 days is a realistic
    // midpoint for Middle East / Asia-Pacific defense shipments.
    riskExposureDays: 10,
    // Five audit gaps in the current manual process:
    // (1) Export classification verification not linked to authorization
    //     record -- classification done in a separate database lookup with
    //     no system-enforced link to the specific shipment authorization
    // (2) Denied party screening results not integrated into the
    //     authorization workflow -- screening done in Visual Compliance or
    //     Descartes MK DPS with results printed or emailed separately
    // (3) EO/DEO signature captured on paper form or wet-ink document
    //     with no cryptographic verification or timestamped audit trail
    // (4) AES/EEI filing done in ACE separately from the authorization
    //     workflow -- no system-enforced link between the ITN and the
    //     export authorization record
    // (5) Delegation from EO to DEO is informal (phone call or email)
    //     with no system record of delegation scope, constraints, or
    //     the specific authorization delegated
    auditGapCount: 5,
    // Seven manual steps in the current export authorization process:
    // (1) Logistics Coordinator initiates shipment authorization request
    // (2) Export Officer verifies export classification (USML/ECCN)
    // (3) Export Officer performs denied party screening
    // (4) Export Officer evaluates license requirement and prepares package
    // (5) Legal Counsel reviews legal sufficiency
    // (6) EO/DEO reviews and signs authorization
    // (7) AES/EEI filing in ACE and documentation preparation
    approvalSteps: 7,
  },
  todayFriction: {
    ...ARCHETYPES["regulatory-compliance"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Logistics Coordinator submits export authorization request via email with export classification sheet, shipment details, and end-user information. Export Compliance System initiates automated denied party screening against OFAC SDN, BIS Entity List, BIS Unverified List, and BIS Denied Persons lists. Request routed to Export Officer's queue.",
        // Simulation-compressed: represents 2-4 hours real-world elapsed time
        // for request submission, initial screening, and queue routing
        delaySeconds: 8,
      },
      {
        trigger: "before-approval",
        description:
          "Export Officer manually verifying export classification -- cross-referencing USML category (22 CFR 121) for ITAR items or ECCN against Commerce Control List (15 CFR 774) for EAR items. Checking license determination: is a specific license required (DSP-5 for ITAR, BIS-748P for EAR), is a license exception available (EAR Part 740: STA, TMP, RPL, GOV, TSR), or is the item NLR? Reviewing end-user/end-use certificate (DSP-83) and evaluating destination country controls.",
        // Simulation-compressed: represents 2-4 hours real-world elapsed time
        // for thorough classification verification and license determination,
        // especially for complex multi-item shipments or dual-jurisdiction items
        delaySeconds: 7,
      },
      {
        trigger: "on-unavailable",
        description:
          "Empowered Official at a trade compliance seminar (ECTI / BIS Update Conference). Authorization package prepared by Export Officer but cannot be signed. DEO not immediately reachable. Shipping window closing -- carrier cutoff in hours. Customer penalties accruing under FMS LOA or DCS contract terms. Logistics Coordinator escalating informally to find a signatory.",
        // Simulation-compressed: represents 8-16 hours real-world elapsed time
        // while the EO is at the seminar and the DEO is being located
        delaySeconds: 12,
      },
    ],
    narrativeTemplate:
      "Manual export classification review with EO at seminar, unsigned authorization package, closing shipping window, and informal escalation to locate DEO signatory",
  },
  todayPolicies: [
    {
      id: "policy-export-control-today",
      actorId: "export-control-office",
      threshold: {
        // Today: all 3 of 3 must approve AND the EO must sign. In practice,
        // the all-3-of-3 analytical review plus the EO signature requirement
        // means a single unavailable person blocks the entire authorization.
        // With the EO at a seminar, nothing moves.
        k: 3,
        n: 3,
        approverRoleIds: ["export-officer", "legal-counsel", "empowered-official"],
      },
      // Simulation-compressed: represents the real-world condition where
      // the authorization window effectively expires because the EO is
      // at a seminar and the 3-of-3 requirement with no delegation means
      // the package sits unsigned until the EO returns. The short simulation
      // expiry models the practical effect: the shipping window closes
      // before the authorization can be obtained.
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],

  // Inline regulatoryContext: specific to ITAR/EAR export authorization
  // governance. The shared REGULATORY_DB["supply-chain"] entries (EAR section
  // 764 enforcement penalties, ISO 9001:2015 Clause 8.4 supplier evaluation)
  // are not specific enough for this scenario. ITAR 22 CFR 120.67 (EO
  // authority), ITAR 22 CFR 127 (violations), OFAC sanctions, and FTR
  // AES filing requirements are the directly applicable frameworks.
  regulatoryContext: [
    {
      framework: "ITAR",
      displayName: "ITAR 22 CFR 120.67 / 22 CFR 123",
      clause: "Empowered Official & Export Licenses",
      violationDescription:
        "Export of ITAR-controlled defense articles without proper Empowered Official authorization -- export authorization signed by a person who is not the designated EO or DEO, or export authorization package incomplete (missing classification verification, denied party screening, or end-user certification)",
      fineRange:
        "Criminal: up to $1M per violation and 20 years imprisonment (22 CFR 127.3). Civil: consent agreements commonly $10M-$100M+ for systemic violations (22 CFR 127.10). Debarment from all future ITAR exports.",
      severity: "critical",
      safeguardDescription:
        "Accumulate enforces mandatory Empowered Official (or DEO delegate) signature as a policy precondition for export authorization, with cryptographic proof of EO/DEO identity, delegation chain, classification verification, and denied party screening results -- satisfying 22 CFR 120.67 and 22 CFR 123 documentation requirements",
    },
    {
      framework: "EAR",
      displayName: "EAR 15 CFR 764",
      clause: "Enforcement and Penalties",
      violationDescription:
        "Export of EAR-controlled items without required license or valid license exception, or without completing denied party screening against BIS Entity List (Supplement No. 4 to 15 CFR 744) and BIS Denied Persons List",
      fineRange:
        "Civil: up to $300K per violation or 2x the transaction value (whichever is greater). Criminal: up to $1M per violation and 20 years imprisonment. Denial of export privileges.",
      severity: "critical",
      safeguardDescription:
        "Policy-enforced export authorization workflow ensures license determination, license exception evaluation (EAR Part 740), and denied party screening are completed and verified before authorization -- all captured in cryptographic proof chain",
    },
    {
      framework: "OFAC",
      displayName: "OFAC 31 CFR 500 series",
      clause: "Sanctions and SDN Screening",
      violationDescription:
        "Export transaction involving a Specially Designated National (SDN), blocked person, or sanctioned entity -- failure to screen all parties to the transaction (consignee, intermediate consignee, end-user, freight forwarder, financial institutions) against the OFAC SDN list before export",
      fineRange:
        "Civil: up to $307,922 per violation (adjusted annually) or 2x the transaction value. Criminal: up to $1M per violation and 20 years imprisonment. Potential asset seizure and forfeiture.",
      severity: "critical",
      safeguardDescription:
        "Automated denied party screening integrated into the authorization workflow -- all transaction parties screened against OFAC SDN, BIS lists, UN sanctions, and EU restrictive measures with screening results cryptographically linked to the export authorization record",
    },
    {
      framework: "FTR",
      displayName: "FTR 15 CFR Part 30",
      clause: "AES/EEI Filing Requirements",
      violationDescription:
        "Failure to file Electronic Export Information (EEI) through the Automated Export System (AES) in ACE before export of controlled items or items requiring export license -- missing or late AES filing, incorrect Schedule B classification, or failure to provide ITN to carrier",
      fineRange:
        "Civil: up to $10,000 per violation for late filing; up to $10,000 per day for failure to file. Criminal: up to $10,000 and 5 years imprisonment for knowingly filing false EEI.",
      severity: "high",
      safeguardDescription:
        "Export authorization workflow includes mandatory AES/EEI filing checkpoint -- the policy engine does not generate final authorization proof until AES filing is confirmed and ITN is recorded in the authorization record",
    },
  ],
  tags: [
    "supply-chain",
    "export-control",
    "compliance",
    "itar",
    "ear",
    "usml",
    "eccn",
    "empowered-official",
    "denied-party-screening",
    "ofac-sdn",
    "bis-entity-list",
    "customs",
    "shipping-window",
    "aes-filing",
    "defense-contractor",
    "fms",
    "22-cfr-120-67",
    "dsp-5",
    "license-determination",
  ],
};
```

### Corrected Narrative Journey (Section 4 of `supply-chain-scenarios.md`)

```markdown
## 4. Export Control & ITAR/EAR Compliance Authorization

**Setting:** A Defense Contractor needs to ship ITAR-controlled defense articles internationally. Under ITAR (22 CFR 120.67), only the designated Empowered Official (EO) -- or the Deputy Empowered Official (DEO) as alternate -- can sign the export authorization. The Export Officer has prepared the authorization package (export classification verification, denied party screening, license determination, end-user certificate review), but the Empowered Official is at a trade compliance seminar. The Deputy Empowered Official is the designated alternate signatory. The international shipping window closes in hours, and missed windows result in carrier rebooking costs ($5K-$25K), FMS late delivery penalties ($50K-$500K+), and customer production line impacts.

**Players:**
- **Defense Contractor** (organization)
  - Export Control Office
    - Empowered Official -- primary ITAR signatory under 22 CFR 120.67; at a trade compliance seminar
    - Deputy Empowered Official -- designated alternate signatory under 22 CFR 120.67; delegation target for EO
    - Export Officer -- compliance analyst who prepares authorization packages; no signatory authority
  - Legal Department
    - Legal Counsel -- ITAR/EAR legal review; no Empowered Official authority; cannot sign export authorizations
  - Logistics / Shipping Department
    - Logistics Coordinator -- initiator (no compliance approval authority)
  - VP of Trade Compliance -- escalation authority for time-critical authorizations
  - Export Compliance System -- denied party screening (OFAC SDN, BIS Entity List), classification lookup (USML/CCL), AES/EEI filing in ACE, license tracking

**Action:** Logistics Coordinator requests authorization for international shipment of ITAR/EAR-controlled components. Requires 2-of-3 analytical review from Export Officer, Legal Counsel, and Deputy Empowered Official, with the Empowered Official (or DEO as delegate) as mandatory signatory. Delegation from EO to DEO for pre-classified shipments with clear screening results. Auto-escalation to VP of Trade Compliance after 4 hours if shipping window at risk.

---

### Today's Process

**Policy:** All 3 of 3 must approve analytically AND the EO must sign. No delegation. No escalation. No formal DEO activation procedure.

1. **Export authorization request emailed.** The Logistics Coordinator emails the export authorization request to the Export Officer, Legal Counsel, and Empowered Official with the export classification sheet, shipment details, denied party screening printout, and end-user information attached. No system-enforced routing or tracking. *(~8 sec delay; represents 2-4 hours real-world elapsed time)*

2. **Manual export classification verification and denied party screening.** The Export Officer manually verifies the export classification -- cross-referencing the USML category (22 CFR 121) for ITAR items or the ECCN against the Commerce Control List (15 CFR 774) for EAR items. Separately, denied party screening is run in Visual Compliance or Descartes MK DPS against OFAC SDN, BIS Denied Persons, BIS Entity List, and BIS Unverified List. Screening results are printed and added to the paper authorization package -- not linked to the authorization record in any system. *(~7 sec delay; represents 2-4 hours real-world elapsed time)*

3. **Empowered Official at seminar.** The Empowered Official is at a trade compliance seminar (ECTI / BIS Update Conference). The authorization package is prepared and reviewed by the Export Officer, but it cannot be signed because only the EO (or DEO) has legal signatory authority under 22 CFR 120.67. The DEO is not formally notified through any system -- the Logistics Coordinator is calling around trying to locate someone with signatory authority. *(~12 sec delay; represents 8-16 hours real-world while EO is at seminar)*

4. **Shipping window closes.** The carrier cutoff passes. The authorization package sits unsigned. The component must wait for the next available carrier slot -- potentially 1-2 weeks for ocean freight to Middle East or Asia-Pacific destinations. FMS LOA late delivery penalties begin accruing. The customer's production line is impacted.

5. **Outcome:** 36+ hours of wall-clock delay (6-10 hours active effort). 10 days of risk exposure until the next shipping window. Five audit gaps: (1) export classification verification not linked to authorization record, (2) denied party screening results not integrated into authorization workflow -- printed separately, (3) EO/DEO signature on paper form with no cryptographic verification or timestamp, (4) AES/EEI filing done in ACE separately with no system link to authorization, (5) informal delegation (phone call) with no record of scope or constraints. Shipping window missed. Customer delivery delayed. FMS penalties accruing. Pressure building to ship without proper authorization -- an ITAR violation risk.

**Metrics:** ~36 hours elapsed delay (6-10 hours active effort), 10 days of risk exposure, 5 audit gaps, 7 manual steps.

---

### With Accumulate

**Policy:** 2-of-3 analytical review (Export Officer, Legal Counsel, Deputy Empowered Official) with Empowered Official (or DEO delegate) as mandatory signatory. Delegation from EO to DEO for pre-classified shipments. Auto-escalation to VP of Trade Compliance after 4 hours. 12-hour authority window. Production environment constraint.

1. **Authorization submitted through compliance system.** Logistics Coordinator submits the export authorization request through the Export Compliance System. The Accumulate policy engine routes the request to all analytical reviewers (Export Officer, Legal Counsel, DEO) and the mandatory signatory (EO), with export classification data (USML category / ECCN), denied party screening results (OFAC SDN, BIS Entity List -- pre-populated from automated screening), license status (existing license coverage or license exception determination), and end-user certificate status.

2. **Denied party screening integrated.** The compliance system automatically screens all transaction parties (consignee, intermediate consignee, end-user, freight forwarder) against OFAC SDN, BIS Denied Persons, BIS Entity List, BIS Unverified List, and UN sanctions. Results are cryptographically linked to the authorization record -- no separate printouts, no manual reconciliation. Any positive match (hit) automatically escalates to Legal Counsel for resolution before the authorization can proceed.

3. **Analytical review threshold met.** The Export Officer reviews the classification and license determination. Legal Counsel reviews legal sufficiency. The DEO reviews as an analytical reviewer. Two of three approve -- the 2-of-3 analytical threshold is met.

4. **EO signature via delegation to DEO.** The EO is at the trade compliance seminar. The policy engine automatically invokes the pre-configured delegation to the DEO, who is already at the facility and has reviewed the package as an analytical reviewer. The DEO signs the authorization as the mandatory signatory (delegated from EO). Delegation is constrained to pre-classified items with clear screening results and approved destinations (not 22 CFR 126.1 proscribed countries). The delegation chain is cryptographically captured.

5. **AES/EEI filing and shipment authorization.** The Export Compliance System files EEI through AES in ACE, generates the ITN (Internal Transaction Number), and issues the final authorization. The Logistics Coordinator receives the authorization with ITN, shipper's letter of instruction (SLI), and carrier documentation. The component ships within the window.

6. **EO reviews on return.** The Empowered Official reviews the delegation record and the authorization package when returning from the seminar, adding a post-authorization review to strengthen the compliance record. The full delegation chain, classification verification, denied party screening results, and DEO signature are all immutably captured.

7. **Outcome:** Component shipped on time. FMS delivery schedule maintained. Customer production line unaffected. Full ITAR/EAR compliance audit trail with cryptographic proof of: EO-to-DEO delegation chain, export classification verification, denied party screening results, license determination, end-user certification, DEO signature, AES/EEI filing with ITN, and carrier documentation. No unauthorized export risk.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Export classification (ECCN/USML) | Manual database lookup in separate system -- not linked to authorization record | Integrated classification data in authorization request with cryptographic hash |
| Denied party screening | Run in Visual Compliance / Descartes MK DPS -- results printed and filed separately, not linked to authorization | Automated screening of all transaction parties with results cryptographically linked to authorization record |
| Empowered Official authority | EO at seminar -- authorization sits unsigned, informal phone calls to locate DEO | EO-to-DEO delegation automatically invoked per policy, with delegation scope constraints enforced |
| When EO is away | Shipment blocked -- no one can sign, shipping window missed | DEO signs as delegate within pre-defined constraints, 2-of-3 analytical threshold met |
| AES/EEI filing | Filed in ACE separately -- no link between ITN and authorization record | Integrated filing checkpoint -- authorization not finalized until AES filing confirmed and ITN recorded |
| Shipping window | Missed -- next carrier slot 1-2 weeks away for ocean freight | Met -- component ships on time |
| Customer impact | FMS late delivery penalties ($50K-$500K+), customer production line disrupted | On-time delivery, FMS schedule maintained |
| Delegation governance | Informal phone call -- no record of delegation scope, constraints, or authorization | Formal delegation with cryptographic proof, scope constraints (pre-classified, clear screening, approved destinations), and immutable audit trail |
| Compliance record | Paper forms, email chain, separate screening printouts, wet-ink EO signature | Verifiable compliance chain: classification hash, screening results, delegation chain, DEO signature, AES/ITN, all with cryptographic attestation |
```

---

## 5. Credibility Risk Assessment

### Audience 1: Empowered Official at a Major Defense Contractor

**Would challenge in ORIGINAL:**
- "Where is the Empowered Official? You have a DEO but no EO. That is legally impossible under 22 CFR 120.67 -- every ITAR registrant must have a designated EO."
- "Why is the Export Officer 'delegating' to the DEO? The Export Officer is my analyst -- they prepare packages. I sign them. The DEO is my alternate. The analyst does not delegate to me; I delegate to my DEO."
- "The DEO is both an approver and a delegation target? That is circular. The DEO either counts as a primary reviewer or is activated through delegation -- not both."
- "Where is the mandatory signatory requirement? Your threshold allows Export Officer + Legal Counsel to approve without any EO/DEO signature. That is an ITAR violation."

**Would accept in CORRECTED:**
- EO as mandatory approver with DEO delegation model matches how every ITAR-registered company operates.
- Delegation constraints (pre-classified, clear screening, approved destinations) reflect real-world DEO authorization scoping.
- The distinction between analytical review (Export Officer, Legal Counsel) and legal signatory (EO/DEO) is accurate.
- 12-hour authority window for shipping-critical authorizations is realistic.

### Audience 2: BIS / DDTC Compliance Examiner

**Would challenge in ORIGINAL:**
- "The delegation model does not comply with 22 CFR 120.67. The EO designation is missing entirely."
- "Where is the denied party screening checkpoint? It is mentioned but not modeled as a compliance gate."
- "Where is the AES/EEI filing requirement? No controlled shipment leaves the US without an AES filing."
- "The regulatory context references EAR section 764 (enforcement) and ISO 9001:2015 (supplier evaluation). Neither of these is the operative export authorization framework."

**Would accept in CORRECTED:**
- ITAR 22 CFR 120.67 / 22 CFR 123 as primary regulatory framework with specific violation descriptions and penalty ranges.
- OFAC SDN screening as a separate regulatory context entry with correct penalty ranges.
- FTR 15 CFR Part 30 (AES/EEI filing) as a compliance checkpoint.
- EO/DEO signatory model matches DDTC expectations.

### Audience 3: VP of Trade Compliance ($5B+ Export Program)

**Would challenge in ORIGINAL:**
- "This authorization model would never pass an internal compliance audit at my company. The EO role is missing, the delegation model is backwards, and there is no mandatory signatory requirement."
- "36 hours with no decomposition? I need to know: is that 36 hours of active effort or 36 hours of wall-clock? The difference matters for staffing decisions."
- "No escalation path? When a shipping window is closing and the EO is unreachable, I need to be notified. That is what the VP of Trade Compliance is for."
- "Legal Counsel as a delegation target for export authorization signature? My Legal Counsel would refuse -- and they would be right. They do not have EO designation."

**Would accept in CORRECTED:**
- Complete ITAR authority model (EO/DEO/Export Officer hierarchy).
- Decomposed 36-hour metric (6-10 hours active, 36 hours wall-clock).
- VP of Trade Compliance as escalation authority.
- Delegation constraints that match real-world DEO scoping practices.

### Audience 4: Defense Industry Export Compliance Auditor

**Would challenge in ORIGINAL:**
- "Five audit gaps? I count more. Where is the classification-to-authorization linkage gap? Where is the AES filing gap? Where is the EO signature verification gap?"
- "The denied party screening is mentioned but not modeled as a gate. In my audits, screening is a binary go/no-go checkpoint. A positive match stops everything."
- "No end-user certificate (DSP-83) step? For many ITAR exports, especially to non-NATO countries, the DSP-83 is required."
- "The regulatory context does not include OFAC SDN screening. That is a separate compliance obligation with its own penalty structure."

**Would accept in CORRECTED:**
- Five specific, enumerated audit gaps with clear descriptions.
- Denied party screening as an integrated compliance gate.
- OFAC SDN screening as a separate regulatory context entry.
- AES/EEI filing as a compliance checkpoint.
- End-user/end-use certificate review in the workflow.

### Audience 5: Logistics/Shipping Manager at a Defense Contractor

**Would challenge in ORIGINAL:**
- "10 days of risk exposure is plausible for Middle East/Asia-Pacific ocean freight, but you should specify the trade lane. US-to-Europe is 1-2 weeks; US-to-Middle East is 2-4 weeks."
- "Missed windows typically add $5K-$25K in carrier rebooking costs plus contract penalties. The scenario mentions 'customer penalties' but does not quantify them."
- "Where is the carrier cutoff time in the workflow? I need to know when the authorization must be signed relative to the carrier cutoff."

**Would accept in CORRECTED:**
- Quantified penalty ranges ($5K-$25K carrier rebooking, $50K-$500K+ FMS penalties).
- 12-hour authority window calibrated against carrier cutoff times.
- Logistics Coordinator in a proper Logistics/Shipping Department.
- AES/EEI filing and ITN generation as a shipment prerequisite.
