# Risk Committee Delegation for Large Trades -- SME Review

**Reviewer Profile:** Senior Capital Markets Risk Management & Trading Governance SME (FRM, PRM)
**Review Date:** 2026-02-28
**Scenario:** `finance-risk-committee` -- Risk Committee Delegation for Large Trades
**Files Reviewed:**
- `src/scenarios/finance/risk-committee.ts`
- `docs/scenario-journeys/finance-scenarios.md` (Section 3)
- `src/lib/regulatory-data.ts` (finance entries)
- `src/scenarios/archetypes.ts` (delegated-authority)

---

## 1. Executive Assessment

**Overall Credibility Score: D+ (4.0/10)**

The scenario identifies a genuine pain point in capital markets operations -- the governance breakdown that occurs when a derivatives trade exceeds desk-level risk limits and the designated approving authority is unavailable with only informal delegation documentation. This is a real and recurring problem that has been cited in OCC and Federal Reserve enforcement actions. However, the execution contains fundamental structural errors in organizational modeling, workflow design, regulatory framing, and terminology that would cause immediate credibility loss with any audience possessing operational experience in sell-side risk management.

The organizational structure conflates a risk governance committee (a periodic governance body that meets on a scheduled cadence to set risk policy and review limit frameworks) with a permanent operating department. The workflow bypasses the entire first-line and second-line escalation chain that exists at every regulated investment bank -- the Desk Head (Managing Director), the embedded Business Unit Risk Manager, and Middle Office are all absent. The regulatory context cites SOX Section 302/404 and BSA/AML (31 CFR 1020.320) -- frameworks that have no direct applicability to derivatives trade limit governance -- while omitting every relevant regulatory framework: Dodd-Frank Section 619 (Volcker Rule), FINRA Rule 3110/3120 (Supervision), SEC Rule 15c3-5 (Market Access Rule), OCC Bulletin 2019-1 (Trading Activities), OCC Heightened Standards (12 CFR Part 30, Appendix D), and Basel III/IV FRTB. The $10M notional amount is uncalibrated for a desk-level limit breach at any institution large enough to have a Risk Committee Chair. The scenario fundamentally fails to distinguish between pre-trade risk controls (which are automated and sub-second under SEC Rule 15c3-5) and post-trade limit governance (which is a human escalation process with an entirely different workflow and regulatory framework).

A Chief Risk Officer at a G-SIB would not engage with this scenario past the second sentence. A Federal Reserve LISCC examiner would flag the organizational structure as reflecting a misunderstanding of the three lines of defense model. A Head of Market Risk would note that traders do not contact the Risk Committee Chair directly -- ever -- and that the absence of a Desk Head, Business Unit Risk Manager, and Middle Office from the workflow renders it structurally unsound. An MD of a derivatives trading desk would observe that their own role (Desk Head) has been eliminated from the approval chain entirely. The scenario requires substantial reworking of its organizational model, workflow, regulatory context, and terminology before it can credibly represent derivatives trade limit governance.

### Top 3 Most Critical Issues

1. **Regulatory context is entirely wrong (Critical).** SOX Section 302/404 governs internal controls over financial reporting, not trading limit governance. BSA/AML (31 CFR 1020.320) governs suspicious activity reporting and anti-money-laundering programs, not derivatives trade approval. Neither framework has direct applicability to a risk limit breach escalation scenario. The correct frameworks are: Dodd-Frank Section 619 (Volcker Rule) for proprietary trading limits, FINRA Rule 3110/3120 for supervisory systems, SEC Rule 15c3-5 for pre-trade market access risk controls, OCC Bulletin 2019-1 for trading activities supervision, Federal Reserve SR 11-7 for model risk (correctly scoped), OCC Heightened Standards (12 CFR Part 30, Appendix D) for risk governance, and Basel III/IV FRTB for capital requirements on trading book positions. Every single regulatory reference must be replaced.

2. **Organizational structure and workflow bypass the entire escalation chain (Critical).** The scenario depicts a trader directly contacting the "Risk Chair" for trade approval. At every regulated investment bank, the escalation chain is: Trader -> Desk Head/Managing Director -> Business Unit Risk Manager -> Market Risk Committee (or designated limit authority) -> CRO (only for firm-level limit breaches). The trader's direct supervisor (Desk Head/MD) is the first and most important approval point. The embedded Business Unit Risk Manager performs the independent risk assessment. Middle Office provides independent trade validation. Compliance reviews Volcker Rule implications. None of these roles exist in the scenario. The workflow as written reflects a misunderstanding of the three lines of defense model and the separation between front office (first line), independent risk management (second line), and internal audit (third line).

3. **Pre-trade vs. post-trade limit governance conflation (Critical).** Under SEC Rule 15c3-5 (the Market Access Rule), broker-dealers must implement automated pre-trade risk controls that prevent orders exceeding pre-set risk limits from reaching the market. If a desk limit is a pre-trade control, the order is automatically blocked -- it does not sit in a queue waiting for the Risk Chair to approve it. If the scenario depicts a post-trade limit breach (where the position is already on the books and market movement has caused the limit to be exceeded), the workflow is entirely different: it involves limit breach notification, temporary limit waiver, position reduction plan, or permanent limit increase -- none of which are described. The scenario must explicitly state which type of limit event it depicts, because the two have fundamentally different workflows, timelines, and regulatory implications.

### Top 3 Strengths

1. **Core pain point is authentic.** Delegation of authority for risk limit decisions is genuinely problematic at many institutions. Informal delegation documentation, unclear authority chains during out-of-office periods, and the tension between trading urgency and governance compliance are real operational challenges that the OCC and Federal Reserve have cited in enforcement actions.

2. **Delegation-to-Deputy mechanic maps well to Accumulate's value proposition.** The concept of cryptographically verifiable, pre-configured delegation authority with auditable provenance is a genuinely differentiated capability for this use case. If the organizational structure and workflow are corrected, the Accumulate value proposition for delegation governance in capital markets is strong.

3. **Escalation timer concept is directionally correct.** The auto-escalation from delegate to CRO after a timeout period reflects the real regulatory expectation (OCC Heightened Standards) that risk limit breaches must be escalated through a defined chain with specified timeframes. The concept needs calibration (30 seconds is unrealistic for real-world application; 30-60 minutes is standard for intraday limit breaches), but the simulation-compression mechanic is sound.

---

## 2. Line-by-Line Findings

### Finding 1: "Risk Committee" Labeled as a Department -- Fundamental Organizational Error

- **Location:** `risk-committee.ts`, line 27 (`type: NodeType.Department, label: "Risk Committee"`); `finance-scenarios.md`, line 138 ("Risk Department" in Players section)
- **Issue Type:** Inaccuracy
- **Severity:** Critical
- **Current Text (TS):** `type: NodeType.Department, label: "Risk Committee", description: "Governs trade approval thresholds, capital allocation, and risk policy enforcement"`
- **Current Text (MD):** `Risk Department` (Players section)
- **Problem:** A risk committee is a governance body, not a department. At investment banks, the organizational structure is: (a) the **Risk Management Department** (or Division), which is the permanent organizational unit employing risk managers, risk analysts, and risk technology staff; and (b) **risk committees** (Market Risk Committee, Credit Risk Committee, Operational Risk Committee, Enterprise Risk Committee), which are periodic governance bodies that meet on scheduled cadences (weekly, biweekly, monthly) to review risk positions, approve limit changes, and set risk policy. The Market Risk Committee does not "govern trade approval thresholds" on a real-time basis -- it sets the limit framework, and designated authorities (Head of Market Risk, CRO, or their delegates) exercise approval authority between committee meetings under that framework. The description also references "capital allocation," which is a Treasury/Finance function, not a risk committee function. Furthermore, the TypeScript labels the entity "Risk Committee" while the markdown calls it "Risk Department" -- an internal inconsistency that compounds the confusion. Neither label is correct for the organizational unit that houses the roles described.
- **Corrected Text (TS):** `type: NodeType.Department, label: "Market Risk Management", description: "Independent risk oversight function responsible for the risk limit framework, position monitoring, limit breach escalation, and risk policy enforcement"`
- **Corrected Text (MD):** `Market Risk Management` (consistently in all references)
- **Source/Rationale:** OCC Bulletin 2019-1 (Trading Activities) requires independent risk management functions with organizational separation from the front office. OCC Heightened Standards (12 CFR Part 30, Appendix D) require a risk governance framework with clearly defined roles for risk management units vs. risk committees. Federal Reserve SR 12-13/SR 21-3 on risk governance likewise distinguish the risk management function (permanent organization) from risk governance committees (periodic governance bodies).

---

### Finding 2: "Risk Chair" Title is Non-Standard and Misleading

- **Location:** `risk-committee.ts`, line 36 (`label: "Risk Chair"`); `finance-scenarios.md`, line 139 and throughout
- **Issue Type:** Incorrect Jargon
- **Severity:** High
- **Current Text:** `label: "Risk Chair", description: "Primary authority for approving trades exceeding desk limits -- currently out of office"`
- **Problem:** "Risk Chair" is not a standard title at investment banks. The person who chairs the Market Risk Committee is typically the **Head of Market Risk** (or Managing Director, Market Risk), or at some institutions, the **CRO** chairs the Enterprise Risk Committee. The title "Risk Chair" is ambiguous -- chair of which committee? More importantly, the person who has day-to-day authority to approve temporary limit waivers or limit increases between committee meetings is typically the **Head of Market Risk** or a designated **Senior Risk Officer**, not the committee chair per se. Committee chairs set policy and framework at periodic meetings; designated risk officers exercise intraday authority under that framework. The description also inaccurately states they are the "primary authority for approving trades" -- the Head of Market Risk approves limit waivers, not trades themselves. Trades are approved by front-office management (Desk Head). The scenario conflates trade approval with limit waiver approval.
- **Corrected Text:** `label: "Head of Market Risk", description: "Senior risk officer with delegated authority to approve temporary limit waivers for desk-level risk limit breaches between Risk Committee meetings"`
- **Source/Rationale:** Industry-standard organizational charts at Goldman Sachs, JP Morgan, Morgan Stanley, and Barclays all use "Head of Market Risk" (or "Global Head of Market Risk") as the senior risk officer title. OCC Bulletin 2019-1 refers to "senior risk management officials" and the "chief risk officer," not "Risk Chair." The distinction between trade approval (front office) and limit waiver approval (risk management) is fundamental to the three lines of defense model.

---

### Finding 3: "Deputy Chair" Title is Non-Standard

- **Location:** `risk-committee.ts`, line 45 (`label: "Deputy Chair"`); `finance-scenarios.md`, line 140 and throughout
- **Issue Type:** Incorrect Jargon
- **Severity:** Medium
- **Current Text:** `label: "Deputy Chair", description: "Delegation target with informally documented authority -- requires manual verification of delegation scope"`
- **Problem:** "Deputy Chair" is not a standard role at investment banks. When the Head of Market Risk is unavailable, the designated delegate is typically a **Deputy Head of Market Risk**, **Senior Risk Manager** covering the relevant asset class, or a specifically named **Designated Alternate** in the Delegation of Authority Matrix. The term "Deputy Chair" implies a committee governance structure, not an operational delegation of limit-approval authority. Additionally, the description's framing ("delegation target") is system-language from the Accumulate product, not role-language from the investment bank. A person's role description should describe their function in the organization, not their function in a software product.
- **Corrected Text:** `label: "Deputy Head of Market Risk", description: "Designated alternate with formally documented authority to act in the Head of Market Risk's absence -- authority scope defined in the Delegation of Authority Matrix"`
- **Source/Rationale:** OCC Heightened Standards (12 CFR Part 30, Appendix D, Section III.B) require documented delegation of authority with defined scope and accountability. Investment bank delegation matrices identify specific named alternates with defined scope (product type, dollar/risk limit, duration), not generalized "deputy chairs."

---

### Finding 4: CRO Description Mischaracterizes the CRO's Role in Trade Approval

- **Location:** `risk-committee.ts`, line 55 (CRO description); `finance-scenarios.md`, line 143
- **Issue Type:** Inaccuracy
- **Severity:** High
- **Current Text:** `description: "Chief Risk Officer -- backstop escalation authority for governance and capital policy decisions"`
- **Problem:** The CRO does not serve as a "backstop escalation authority" for individual trade approvals or routine desk-level limit waivers. The CRO oversees the enterprise risk framework, sets the risk appetite statement, chairs (or delegates chairing of) the Enterprise Risk Committee, and approves firm-level limit changes. The CRO would be involved in a limit breach escalation only if: (a) the breach is at the firm-level aggregate limit (not a desk-level breach); (b) the limit breach involves a novel or outsized risk that the Head of Market Risk determines exceeds their own delegated authority; or (c) the Head of Market Risk and all designated alternates are unavailable and the breach requires immediate resolution. For a routine desk-level limit breach, the CRO would not be in the approval chain. The phrase "capital policy decisions" is also out of context -- capital policy is a distinct function (Treasury/Capital Management) related to regulatory capital planning and distribution, and is not part of intraday trade limit governance.
- **Corrected Text:** `description: "Chief Risk Officer -- senior enterprise risk authority with oversight of the risk limit framework; escalation target for limit breaches that exceed the Head of Market Risk's delegated authority or involve novel/outsized risk positions"`
- **Source/Rationale:** OCC Heightened Standards (12 CFR Part 30, Appendix D, Section III.A) define the CRO's role as overseeing the risk management framework, not approving individual trades or routine limit waivers. Federal Reserve SR 15-18 (Board Effectiveness) and SR 21-3 address the delineation between the CRO's framework oversight role and the operational risk management function's day-to-day limit authority.

---

### Finding 5: Missing Desk Head / Managing Director Role -- Critical Escalation Gap

- **Location:** `risk-committee.ts`, actors array (lines 15-77); `finance-scenarios.md`, Players section (lines 136-143)
- **Issue Type:** Missing Element
- **Severity:** Critical
- **Current Text:** The scenario has: Trader -> (directly to) Risk Chair. No intermediate authority exists.
- **Problem:** At every regulated investment bank, the trader's immediate supervisor is the **Desk Head** (typically a Managing Director or Executive Director). The Desk Head is the first approval authority for position management, the first escalation point for limit utilization concerns, and the person responsible for managing the desk's aggregate risk within its limit framework. A trader never contacts the Head of Market Risk directly for a limit issue -- the Desk Head does. The Desk Head also has their own delegated authority to approve temporary limit usage within defined bands (e.g., up to 10% over desk limit for intraday only, subject to same-day resolution). The absence of this role breaks the scenario's fundamental workflow and violates the first-line supervisory structure required by FINRA Rule 3110.
- **Corrected Text (new actor):**
  ```typescript
  {
    id: "desk-head",
    type: NodeType.Role,
    label: "Desk Head (MD)",
    description: "Managing Director overseeing the derivatives desk -- first-line supervisory authority for limit utilization and initial escalation point for limit breaches per FINRA Rule 3110",
    parentId: "trade-desk",
    organizationId: "inv-bank-org",
    color: "#94A3B8",
  },
  ```
- **Source/Rationale:** FINRA Rule 3110(a) requires each member firm to establish and maintain a system for supervising the activities of each registered representative, registered principal, and associated person. The desk head/managing director is the designated supervising principal for the trading desk. OCC Bulletin 2019-1 (Trading Activities) requires that front office management is responsible for first-line risk management of trading activities.

---

### Finding 6: Missing Business Unit Risk Manager Role

- **Location:** `risk-committee.ts`, actors array (lines 15-77)
- **Issue Type:** Missing Element
- **Severity:** High
- **Current Text:** No Business Unit Risk Manager in the actor list.
- **Problem:** Every major trading desk at a regulated investment bank has an embedded **Business Unit Risk Manager** (also called "Desk Risk Manager" or "Market Risk Manager -- [asset class]"). This person is the independent second-line risk function assigned to the desk. They perform independent risk assessment of limit breach requests, review the risk metrics (VaR, Greeks, stress test impact), and provide a risk recommendation to the Head of Market Risk before any limit waiver or increase is approved. The Business Unit Risk Manager is the critical link between the first line (trading desk) and the second line (market risk management). Without this role, the scenario skips the independent risk assessment that regulators specifically require under the three lines of defense model.
- **Corrected Text (new actor):**
  ```typescript
  {
    id: "bu-risk-mgr",
    type: NodeType.Role,
    label: "Desk Risk Manager",
    description: "Independent second-line risk manager embedded with the derivatives desk -- performs risk assessment and provides limit breach recommendation to Head of Market Risk",
    parentId: "risk-dept",
    organizationId: "inv-bank-org",
    color: "#94A3B8",
  },
  ```
- **Source/Rationale:** OCC Bulletin 2019-1 requires independent risk management oversight of trading activities, including independent valuation, risk measurement, and limit monitoring. The three lines of defense model (Basel Committee, "Principles for the Sound Management of Operational Risk," 2011) requires that second-line risk management is organizationally independent of the business units it oversees.

---

### Finding 7: Trader Directly Contacting Risk Chair -- Incorrect Escalation Chain

- **Location:** `risk-committee.ts`, line 108 (`initiatorRoleId: "trader"`); todayFriction manual steps (lines 121-124); `finance-scenarios.md`, Steps 1-2 (lines 153-156)
- **Issue Type:** Incorrect Workflow
- **Severity:** Critical
- **Current Text (TS):** `initiatorRoleId: "trader"` with target approver "risk-chair"
- **Current Text (MD):** "The trader emails the trade approval request to the Risk Chair" (line 153) and "trader calling desk heads to locate someone with signing authority" (line 155)
- **Problem:** A trader would never directly contact the Risk Chair (or Head of Market Risk) for a limit breach. The workflow at a regulated investment bank is: (1) Trader identifies that a proposed position would breach the desk limit (or the OMS/risk system blocks the order pre-trade); (2) Trader informs the Desk Head; (3) Desk Head evaluates whether to request a temporary limit waiver; (4) Desk Head contacts the Business Unit Risk Manager, who performs an independent risk assessment; (5) Business Unit Risk Manager (if the breach is within their recommendation authority) or Head of Market Risk (if it exceeds the BU risk manager's authority) approves or denies the temporary limit waiver. The trader also would not be "calling desk heads" (plural) -- the Desk Head is the trader's direct boss and typically sits on the same desk, often within shouting distance on the trading floor.
- **Corrected Text (workflow description):** `"Desk Head requests a temporary limit waiver from Market Risk Management after a proposed interest rate derivatives position would breach the desk DV01 limit. The Head of Market Risk is out of office with delegation to the Deputy Head. The Desk Risk Manager provides an independent risk assessment while the delegation chain is resolved."`
- **Corrected Text (initiatorRoleId):** `"desk-head"` (the Desk Head initiates the escalation to risk management, not the trader)
- **Source/Rationale:** FINRA Rule 3110 supervisory requirements; OCC Bulletin 2019-1 trading activities supervision; industry-standard limit breach escalation procedures at G-SIBs.

---

### Finding 8: "$10M Derivatives Position" -- Uncalibrated Notional Amount

- **Location:** `risk-committee.ts`, line 109 (`targetAction`); `finance-scenarios.md`, lines 134, 145
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `"Approve $10M Derivatives Position Exceeding Desk Limit"`
- **Problem:** $10M notional is not a meaningful desk-level limit threshold at any institution large enough to have a Risk Committee Chair, a Deputy Chair, and a CRO in the approval chain. At bulge-bracket investment banks, derivatives desk limits are typically expressed in risk metrics (VaR, DV01, CS01, vega, gamma) rather than notional amounts, because notional is a poor measure of risk. A single plain-vanilla interest rate swap might have $500M+ notional but modest risk (small DV01). An exotic options position might have $10M notional but very high risk (large gamma and vega exposure). The relevant measure for limit governance is the risk metric, not the notional. If the scenario must use a dollar amount for accessibility, it should be calibrated to a level that plausibly exceeds a desk limit. For a mid-tier desk at a large bank, a limit breach might involve $50M-$200M in incremental market value or a $2M-$5M incremental VaR. Alternatively, the scenario should frame the limit in risk terms that reflect how limits actually operate.
- **Corrected Text:** `"Approve Temporary Limit Waiver -- Interest Rate Derivatives Desk DV01 Limit Breach ($500K over $5M desk DV01 limit)"`
- **Source/Rationale:** Desk-level risk limits at G-SIBs are expressed in VaR, stressed VaR, DV01/PV01, CS01, vega, gamma, and other Greek-based metrics per Basel III FRTB framework and OCC Bulletin 2019-1. Notional amount alone is not a meaningful risk limit measure for derivatives. The OCC examination handbook for trading activities evaluates risk limits in terms of risk metrics, not notional exposure.

---

### Finding 9: SOX Section 302/404 Regulatory Reference is Inapplicable

- **Location:** `regulatory-data.ts`, lines 64-72 (applied via `REGULATORY_DB.finance`); `risk-committee.ts`, line 141 (`regulatoryContext: REGULATORY_DB.finance`)
- **Issue Type:** Regulatory Error
- **Severity:** Critical
- **Current Text:** `{ framework: "SOX", displayName: "SOX §302/404", clause: "Internal Controls over Financial Reporting", violationDescription: "Material weakness if fraud losses from monitoring failures materially affect financial statements" }`
- **Problem:** SOX Section 302 requires CEO/CFO certification of financial reports. SOX Section 404 requires management assessment and auditor attestation of internal controls over financial reporting (ICFR). Neither provision governs derivatives trading risk limit governance. The connection between a desk-level limit breach approval process and financial reporting controls is extremely attenuated. A risk limit governance failure could theoretically lead to trading losses that affect reported earnings, but SOX applies to the financial reporting controls, not to the trading controls themselves. The directly applicable frameworks for this scenario are:
  - **FINRA Rule 3110** (Supervision): Requires firms to establish supervisory systems including written supervisory procedures for all securities activities
  - **FINRA Rule 3120** (Supervisory Control System): Requires annual testing of supervisory procedures
  - **SEC Rule 15c3-5** (Market Access Rule): Requires automated pre-trade risk controls preventing orders exceeding pre-set limits from reaching the market
  - **OCC Bulletin 2019-1** (Trading Activities): Comprehensive guidance on risk management of trading activities including limit governance
  - **OCC Heightened Standards (12 CFR Part 30, Appendix D)**: Requires documented risk governance framework with delegation of authority
  - **Dodd-Frank Section 619 (Volcker Rule)**: Restricts proprietary trading and requires risk limit frameworks for permitted activities

  Note: Because `REGULATORY_DB.finance` is shared across all finance scenarios, the scenario should override the shared regulatory context with scenario-specific entries rather than modifying the shared database (which serves the Treasury Transfer and other scenarios where SOX may be more relevant).
- **Corrected Text:** Replace the scenario's `regulatoryContext` with scenario-specific entries:
  ```typescript
  regulatoryContext: [
    {
      framework: "FINRA",
      displayName: "FINRA Rule 3110/3120",
      clause: "Supervision and Supervisory Control Systems",
      violationDescription: "Failure to establish and maintain supervisory system for trading activities, including written supervisory procedures for limit breach escalation and delegation of authority",
      fineRange: "Censure, fine up to $5M per violation, suspension, or expulsion; individual supervisors subject to statutory disqualification",
      severity: "critical",
      safeguardDescription: "Accumulate provides cryptographically verifiable delegation authority and limit breach escalation records, supporting written supervisory procedure documentation requirements under FINRA Rule 3110",
    },
    {
      framework: "SEC",
      displayName: "SEC Rule 15c3-5",
      clause: "Market Access Risk Management Controls",
      violationDescription: "Failure to establish, document, and maintain risk management controls for market access, including pre-trade risk limits and supervisory procedures for limit exception processing",
      fineRange: "SEC enforcement action; fines of $1M+ per violation; broker-dealer registration suspension; individual liability for supervisory failures",
      severity: "critical",
      safeguardDescription: "Accumulate enforces documented delegation authority for limit exception approvals with cryptographic proof of the complete authorization chain, supporting SEC Rule 15c3-5 compliance documentation for supervisory risk limit procedures",
    },
  ],
  ```
- **Source/Rationale:** FINRA Rule 3110(a)-(b); FINRA Rule 3120; FINRA Regulatory Notice 14-10 (Supervision and Supervisory Controls); SEC Rule 15c3-5 (adopted 2010, effective 2011); SEC Release No. 34-63241; SEC enforcement actions against Knight Capital Group (2013) and Latour Trading (2014) for market access risk control failures.

---

### Finding 10: BSA/AML Regulatory Reference is Inapplicable

- **Location:** `regulatory-data.ts`, lines 74-81 (applied via `REGULATORY_DB.finance`); `risk-committee.ts`, line 141
- **Issue Type:** Regulatory Error
- **Severity:** Critical
- **Current Text:** `{ framework: "BSA/AML", displayName: "BSA/AML (31 CFR 1020.320)", clause: "Suspicious Activity Reporting", violationDescription: "Inadequate suspicious activity monitoring program with untimely alert investigation and SAR filing delays" }`
- **Problem:** BSA/AML (Bank Secrecy Act / Anti-Money Laundering) applies to financial crimes monitoring -- suspicious activity reporting, customer due diligence, and sanctions screening. It has zero applicability to a derivatives desk risk limit breach governance scenario. A desk limit breach is a market risk event, not a financial crimes event. The BSA/AML framework does not govern how investment banks approve temporary limit waivers for trading desks. The BSA/AML entry is appropriate for the Fraud Detection Escalation scenario (Scenario 2) but not for this scenario. As noted in Finding 9, the scenario should override the shared `REGULATORY_DB.finance` with scenario-specific regulatory entries.
- **Corrected Text:** Replace with SEC Rule 15c3-5 as specified in Finding 9, or add OCC Bulletin 2019-1:
  ```typescript
  {
    framework: "OCC",
    displayName: "OCC Bulletin 2019-1",
    clause: "Trading Activities Risk Management",
    violationDescription: "Inadequate risk governance framework for trading activities, including deficient delegation of authority documentation, insufficient limit breach escalation procedures, and lack of independent risk assessment for limit waivers",
    fineRange: "Consent order, civil money penalties, removal and prohibition orders against individuals; institutional penalties of $1M-$100M+",
    severity: "critical",
    safeguardDescription: "Accumulate provides independently verifiable proof of delegation authority activation, scope, and exercise, supporting OCC Bulletin 2019-1 expectations for documented risk governance and limit breach management",
  }
  ```
- **Source/Rationale:** OCC Bulletin 2019-1 (Trading Activities); OCC enforcement actions for trading risk management deficiencies; OCC Heightened Standards (12 CFR Part 30, Appendix D).

---

### Finding 11: "Trade Approval Request Sent via Risk Platform and Email with Position Details"

- **Location:** `risk-committee.ts`, line 122 (todayFriction, first manual step); `finance-scenarios.md`, line 153 (Step 1)
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text (TS):** `"Trade approval request sent via risk platform and email with position details -- market moving while awaiting response"`
- **Current Text (MD):** `"The trader emails the trade approval request to the Risk Chair with a position details spreadsheet attached."`
- **Problem:** Trade approval requests at investment banks are not sent via email with spreadsheet attachments. In 2025/2026, limit breach notifications are generated automatically by the risk management system (Murex, Calypso/Adenza, Bloomberg TOMS, or proprietary limit management platforms) when a proposed trade or an existing position breaches a pre-configured limit. The system generates a limit breach alert that routes through the firm's limit management workflow. The Desk Head (not the trader) would request a temporary limit waiver through the limit management system, which then routes to the appropriate risk authority based on the limit tier and the breach magnitude. The "position details spreadsheet" framing is outdated and would be flagged by any audience at a bank with modern risk technology infrastructure. Furthermore, the TypeScript and markdown contradict each other -- the TypeScript says "risk platform and email" (somewhat more modern) while the markdown says "emails... with a position details spreadsheet attached" (significantly more outdated).
- **Corrected Text (TS):** `"Limit breach notification generated by risk management system -- Desk Head initiates temporary limit waiver request through the limit management workflow"`
- **Corrected Text (MD):** `"Limit breach flagged. The risk management system flags the desk limit breach and the Desk Head initiates a temporary limit waiver request through the limit management platform. The request includes the proposed position, current limit utilization, risk metrics (VaR, DV01, Greeks), and business rationale."`
- **Source/Rationale:** OCC Bulletin 2019-1 requires that risk management systems provide "timely and accurate risk measurement, monitoring, and reporting." Automated limit monitoring is a baseline expectation for any bank with active trading operations. Manual email-based limit breach requests would be flagged as a control deficiency by OCC or Federal Reserve examiners.

---

### Finding 12: "Trader Calling Desk Heads to Locate Someone with Signing Authority"

- **Location:** `risk-committee.ts`, line 123 (todayFriction, second manual step); `finance-scenarios.md`, line 155 (Step 2)
- **Issue Type:** Incorrect Workflow
- **Severity:** High
- **Current Text:** `"Risk Chair out of office -- trader calling desk heads to locate someone with signing authority, delegation documented informally"`
- **Problem:** Multiple errors compound in this single step: (1) The trader would not be making these calls -- the Desk Head or the Business Unit Risk Manager would handle the escalation. Traders trade; desk management and risk management handle the limit breach escalation. (2) "Calling desk heads" (plural) makes no sense -- the trader has one Desk Head, who is the trader's direct supervisor. If anyone is calling around to identify the designated alternate authority, it would be the Desk Head or the embedded Desk Risk Manager calling the Market Risk Management office. (3) "Signing authority" is not the standard term; the correct term is "limit approval authority," "delegated authority for limit waivers," or simply "limit waiver authority." "Signing authority" refers to the authority to execute legal documents, contracts, or checks -- a fundamentally different concept. (4) The real friction in the "today" state is not a phone-tree search for any warm body with authority; it is that the Delegation of Authority Matrix may not clearly specify who has authority in the Head of Market Risk's absence, or the delegate's authority scope (dollar/risk limit, product type, duration) may be ambiguously defined.
- **Corrected Text:** `"Head of Market Risk out of office -- Desk Risk Manager contacting Market Risk Management office to identify designated alternate with limit waiver authority per Delegation of Authority Matrix"`
- **Source/Rationale:** OCC Heightened Standards (12 CFR Part 30, Appendix D) require documented delegation of authority. The real-world friction is ambiguity or inaccessibility of the delegation matrix, not a phone-tree search. FINRA Rule 3110 requires designated supervisory principals with defined authority.

---

### Finding 13: "Deputy Chair Verifying Delegation Scope in Email Chain"

- **Location:** `risk-committee.ts`, line 124 (todayFriction, third manual step); `finance-scenarios.md`, line 157 (Step 3)
- **Issue Type:** Inaccuracy
- **Severity:** Medium
- **Current Text:** `"Deputy Chair verifying delegation scope in email chain and cross-checking trade details against capital allocation system"`
- **Problem:** Two distinct errors: (1) Delegation authority at well-governed banks is not documented in email chains. It is documented in the **Delegation of Authority Matrix (DoA)**, which is a formal, Board-approved or CRO-approved document specifying who can exercise what authority, under what conditions, and with what limits. The "today" state friction is that the DoA may be a static PDF or spreadsheet stored on a shared drive that is not easily accessible, may be out of date, or may not clearly specify the delegate's authority scope for the specific limit tier and product type -- not that delegation is "in an email chain." An email chain might be used for ad-hoc, informal delegation in a degraded state, but describing it as the primary documentation mechanism overstates the dysfunction. (2) "Capital allocation system" is the wrong term entirely. The delegate would cross-check the trade details in the **risk management system** (limit utilization report, VaR impact, DV01 exposure, Greek exposure, stress test results), not a "capital allocation system." Capital allocation is a Treasury/Finance function related to regulatory capital distribution across business units -- a quarterly/annual strategic exercise, not an intraday trade-level check.
- **Corrected Text:** `"Deputy Head of Market Risk locating and reviewing the Delegation of Authority Matrix to verify their authority scope for this limit tier and product type, then reviewing risk metrics (VaR, DV01, stress impact) in the risk management system"`
- **Source/Rationale:** OCC Heightened Standards require "clearly defined and well-documented" delegation of authority. The friction is in the static, non-integrated, and sometimes ambiguous nature of the DoA document, not in searching email chains. Capital allocation vs. limit utilization: fundamentally different concepts per OCC Bulletin 2019-1 and Basel III capital framework.

---

### Finding 14: "Position Entered Informally Without Proper Sign-Off"

- **Location:** `finance-scenarios.md`, line 159 (Step 4); `risk-committee.ts`, line 10 (description)
- **Issue Type:** Overstatement
- **Severity:** High
- **Current Text (MD):** `"the position is entered informally without proper sign-off, creating a compliance gap"`
- **Problem:** Under SEC Rule 15c3-5, broker-dealers are required to have automated pre-trade risk controls that prevent orders exceeding pre-set credit or capital thresholds from reaching the market. If the desk limit is enforced as a pre-trade control (which is the regulatory requirement for market access), the trade cannot be "entered informally" -- the system blocks it. The scenario may be depicting a limit that is enforced post-trade (i.e., monitored and flagged rather than hard-blocked), which is a legitimate scenario for some types of aggregate portfolio-level limits that can only be evaluated after trade booking. But the scenario does not make this distinction. If the scenario means that a trader bypasses pre-trade controls and enters a trade without authorization, that is a SEC Rule 15c3-5 violation, a FINRA Rule 3110 supervisory failure, and potentially a rogue trading event -- a scenario of far greater severity than an approval delay. The casual framing of "entered informally" severely understates the gravity of what is being described while simultaneously conflicting with how pre-trade controls work at regulated broker-dealers.
- **Corrected Text (MD):** `"The proposed trade remains blocked by the pre-trade limit control in the OMS. The Desk Head must decide whether to scale down the position to fit within existing limits (losing the full opportunity), or to continue seeking limit waiver approval while the market window narrows. In some cases, post-trade limit breaches caused by market movements are managed via temporary limit breach acknowledgments, but new position-initiated breaches require pre-approval."`
- **Source/Rationale:** SEC Rule 15c3-5(c)(1)(i)-(ii) requires pre-trade controls for market access including credit thresholds and capital thresholds. SEC Release No. 34-63241 explicitly states that financial risk management controls must be automated and must prevent orders from being submitted if they would exceed pre-set limits.

---

### Finding 15: "Model Risk" in the Description is Incorrect

- **Location:** `risk-committee.ts`, line 10 (description)
- **Issue Type:** Incorrect Jargon
- **Severity:** Medium
- **Current Text:** `"creating model risk, governance gaps, and audit challenges"`
- **Problem:** "Model risk" has a specific regulatory definition under Federal Reserve SR 11-7 (Guidance on Model Risk Management): "the potential for adverse consequences from decisions based on incorrect or misused model outputs and reports." Model risk relates to the risk that quantitative models (VaR models, pricing models, stress test models) produce inaccurate outputs. It does not relate to delegation governance or approval delays. The risk created by informal delegation and approval delays is **operational risk** (specifically, internal process failure risk under the Basel Committee's operational risk taxonomy), **governance risk** (failure of the risk governance framework), and potentially **market risk** (if positions are left unmanaged during the delay or trading opportunities are lost). Using "model risk" incorrectly signals unfamiliarity with the risk taxonomy to any CRO or Head of Market Risk.
- **Corrected Text:** `"creating operational risk, governance gaps, and audit challenges"`
- **Source/Rationale:** Federal Reserve SR 11-7 (Guidance on Model Risk Management, April 2011); Basel Committee "Principles for Sound Management of Operational Risk" (June 2011); OCC Bulletin 2011-12 (Model Risk Management). Model risk is the risk of adverse consequences from incorrect or misused models -- not the risk of governance process failure.

---

### Finding 16: "Approval Delays of 1-6 Hours" -- Uncalibrated Range

- **Location:** `risk-committee.ts`, line 10 (description)
- **Issue Type:** Metric Error
- **Severity:** Medium
- **Current Text:** `"Approval delays of 1-6 hours are common during peak periods"`
- **Problem:** This range is directionally plausible for certain types of limit breach resolutions but is not well-calibrated and lacks specificity about what drives the variance. For a standard intraday desk-level limit breach where the authority is clearly defined and available, resolution typically occurs within 15-60 minutes. For a breach where the authority is unavailable and delegation is unclear, delays of 2-4 hours are realistic. 6 hours would represent an extreme case (e.g., a multi-timezone escalation involving Asia/London/New York handoff, or a breach discovered late in the trading day during a holiday period). The scenario should be more precise about the condition driving the delay -- the delegation ambiguity is the key friction, not generic "peak periods."
- **Corrected Text:** `"Approval delays of 30 minutes to 4 hours are common when delegated authority is unclear, with extreme cases extending to a full trading day when the designated authority and all alternates are unavailable"`
- **Source/Rationale:** Based on OCC and Federal Reserve examination findings regarding limit breach resolution timelines; industry benchmarks from Risk Management Association (RMA) surveys of limit governance practices at G-SIBs.

---

### Finding 17: "10 Hours of Delay" (manualTimeHours: 10) -- Inflated

- **Location:** `risk-committee.ts`, line 114 (`manualTimeHours: 10`); `finance-scenarios.md`, line 163
- **Issue Type:** Metric Error
- **Severity:** Medium
- **Current Text:** `manualTimeHours: 10`; Markdown: "~10 hours of delay"
- **Problem:** 10 hours of cumulative delay for a desk-level limit breach resolution is an outlier scenario, not a typical or representative case. The US equity and derivatives markets are open for 6.5 hours (9:30 AM - 4:00 PM ET). A 10-hour delay exceeds the entire trading day. While after-hours and multi-timezone scenarios exist, framing 10 hours as the representative delay overstates the problem and would be challenged by any Head of Market Risk who resolves these issues regularly. A more defensible figure for the "today" state with informal delegation is 2-4 hours average, with a range of 30 minutes to 8 hours depending on time zone, personnel availability, and limit tier.
- **Corrected Text:** `manualTimeHours: 4` with narrative: "~2-4 hours average delay, with resolution sometimes extending across the full trading session"
- **Source/Rationale:** US equity market hours (6.5 hours); US derivatives market hours vary by product (CME Globex is nearly 24 hours but the primary trading session is shorter); industry benchmarks for limit breach resolution; OCC examination findings on limit breach governance timelines.

---

### Finding 18: "4 Days of Risk Exposure" (riskExposureDays: 4) -- Ambiguous and Inflated

- **Location:** `risk-committee.ts`, line 115 (`riskExposureDays: 4`); `finance-scenarios.md`, line 163
- **Issue Type:** Metric Error
- **Severity:** Medium
- **Current Text:** `riskExposureDays: 4`; Markdown: "4 days of risk exposure"
- **Problem:** "Risk exposure" is undefined in context and the metric is ambiguous. If the trade has not been executed (because the pre-trade control blocked it), there is no position risk -- there is only **opportunity cost** (lost trading opportunity) and **governance exposure** (the unresolved state of the limit breach process). If the trade was executed with an unresolved limit breach (a post-trade scenario), the risk exposure is the duration between the breach and its formal resolution (approval of a temporary limit waiver, position reduction, or permanent limit increase). In the post-trade case, most banks require limit breaches to be resolved within 1-2 business days, with daily escalation to successively senior authorities until resolution. 4 days of an unresolved limit breach would trigger Board-level Risk Committee notification at most G-SIBs. The metric needs to specify what type of risk exposure it measures and should be calibrated to the governance exposure window, not a vague "risk exposure."
- **Corrected Text:** `riskExposureDays: 2` with narrative: "~1-2 business days of governance exposure (unresolved limit breach status, with escalating notification requirements) until formal delegation authority is confirmed and the waiver is documented"
- **Source/Rationale:** OCC Bulletin 2019-1 requires prompt resolution of limit breaches. OCC Heightened Standards require escalation of unresolved risk issues. G-SIB internal policies typically require limit breach resolution within T+1 (one business day) for desk-level breaches, with Board Risk Committee notification for breaches unresolved beyond T+3.

---

### Finding 19: "5 Audit Gaps" (auditGapCount: 5) -- Not Enumerated

- **Location:** `risk-committee.ts`, line 116 (`auditGapCount: 5`); `finance-scenarios.md`, line 163
- **Issue Type:** Metric Error
- **Severity:** Low
- **Current Text:** `auditGapCount: 5`; Markdown: "5 audit gaps"
- **Problem:** The scenario claims 5 audit gaps but does not enumerate them anywhere, making the metric undefensible in front of a knowledgeable audience. For a delegation governance scenario in the context of a trading limit waiver, the defensible audit gaps are: (1) No formal, dated delegation document with defined scope (product type, dollar/risk limit, duration); (2) No evidence of when delegation was activated (i.e., when did the Head of Market Risk become unavailable and when did the delegate's authority begin?); (3) No evidence that the delegate verified their authority scope before acting; (4) No evidence that the delegate reviewed the specific risk metrics (VaR, DV01, Greeks, stress impact) before approving; (5) No evidence of post-hoc notification to the Head of Market Risk upon their return; (6) No documented rationale for the waiver approval decision. That is 6 defensible gaps.
- **Corrected Text:** `auditGapCount: 6` with narrative enumeration: "6 audit gaps: (1) no formal delegation document with defined scope, (2) no timestamp on delegation activation, (3) no evidence delegate verified authority scope, (4) no evidence of independent risk assessment review, (5) no post-hoc notification to Head of Market Risk, (6) no documented rationale for waiver approval"
- **Source/Rationale:** OCC Heightened Standards (12 CFR Part 30, Appendix D) documentation requirements; FINRA Rule 3110(b) written supervisory procedures requirements; standard internal audit programs for trading activities at G-SIBs.

---

### Finding 20: "7 Approval Steps" (approvalSteps: 7) -- Not Enumerated and Uncalibrated

- **Location:** `risk-committee.ts`, line 117 (`approvalSteps: 7`); `finance-scenarios.md`, line 163
- **Issue Type:** Metric Error
- **Severity:** Low
- **Current Text:** `approvalSteps: 7`; Markdown: "7 manual steps"
- **Problem:** The narrative describes only 4-5 steps, not 7, making the metric inconsistent with the narrative. The corrected workflow (with the proper escalation chain) would involve: (1) Trader identifies limit constraint and informs Desk Head; (2) Desk Head reviews position and decides to request limit waiver; (3) Desk Head submits waiver request through limit management system; (4) Desk Risk Manager performs independent risk assessment; (5) Waiver request routed to Head of Market Risk for approval; (6) Head of Market Risk is unavailable -- delegate identification process begins via DoA Matrix review; (7) Delegate (Deputy Head) located and notified; (8) Delegate verifies authority scope in DoA Matrix; (9) Delegate reviews risk metrics and approves/denies the waiver. That is 9 steps in the corrected workflow. The metric of 7 is actually an undercount for the corrected workflow but is unsubstantiated for the current narrative.
- **Corrected Text:** `approvalSteps: 9` with the full step enumeration in the narrative
- **Source/Rationale:** Enumeration based on standard limit breach escalation procedures at major investment banks. Metrics must be traceable to enumerable steps.

---

### Finding 21: "Derivatives Position" is Excessively Vague

- **Location:** `risk-committee.ts`, line 109 (`targetAction`); line 10 (description); `finance-scenarios.md`, lines 134, 145
- **Issue Type:** Incorrect Jargon
- **Severity:** Medium
- **Current Text:** `"derivatives position"` (used throughout without specification)
- **Problem:** "Derivatives position" is extremely vague and signals unfamiliarity with capital markets. Derivatives desks at investment banks are organized by asset class and product type: interest rate derivatives (swaps, swaptions, caps/floors), credit derivatives (CDS, CDX/iTraxx, CLNs), equity derivatives (options, variance swaps, structured products), FX derivatives (forwards, options, cross-currency swaps), and commodity derivatives. The type of derivative significantly affects: the risk metrics used for limit monitoring (DV01/PV01 for rates, CS01 for credit, delta/vega/gamma for equity options), the approval authority (different limit frameworks per asset class), and the regulatory treatment (Volcker Rule implications differ by product type). The scenario should specify at least the asset class to demonstrate familiarity, or explicitly acknowledge that the workflow applies generically across asset classes.
- **Corrected Text:** Either specify: `"interest rate derivatives position (interest rate swap portfolio addition)"` or frame generically: `"derivatives desk position that would breach the desk-level DV01 risk limit"` with a note that the workflow applies across asset classes.
- **Source/Rationale:** Investment bank trading desks are organized by asset class. OCC Bulletin 2019-1 discusses risk limits in terms of specific risk metrics by asset class, not generic "derivatives positions."

---

### Finding 22: "Volatile Market Conditions" is Generic and Unconnected to the Workflow

- **Location:** `risk-committee.ts`, lines 10, 14, 73, 111; `finance-scenarios.md`, line 134
- **Issue Type:** Understatement
- **Severity:** Low
- **Current Text:** `"volatile market conditions"` (used repeatedly without connection to the workflow)
- **Problem:** "Volatile market conditions" is stated as environmental context but is never connected to the workflow mechanics in a specific way. During volatile markets, VaR and Expected Shortfall increase, which can cause desk limits to be breached even without new trades (a "passive breach" due to market movement). This is a distinct scenario from a trader wanting to put on a new position that would actively exceed the limit. The scenario should specify whether the breach is: (a) a passive breach due to market-driven increases in risk metrics, or (b) an active breach from a proposed new trade during volatile conditions. The two have different urgency profiles, different approval considerations, and different outcomes. Connecting the volatility to the specific mechanism makes the scenario more credible.
- **Corrected Text:** Add to description: `"Market volatility has increased the desk's VaR utilization to near-limit levels, and a proposed new interest rate swap position would breach the desk DV01 limit, requiring a temporary limit waiver."` This connects the volatility to the specific limit breach mechanism.
- **Source/Rationale:** OCC Bulletin 2019-1 discusses market risk limit monitoring and the distinction between active and passive limit breaches. Both have different governance implications.

---

### Finding 23: "Signing Authority" -- Incorrect Terminology

- **Location:** `risk-committee.ts`, line 123 (manual step); `finance-scenarios.md`, line 155 (Step 2)
- **Issue Type:** Incorrect Jargon
- **Severity:** Low
- **Current Text:** `"someone with signing authority"`
- **Problem:** "Signing authority" refers to the authority to sign legal documents, contracts, or checks -- it is a corporate governance and legal concept. In the context of electronic trade limit approval, the correct term is **"limit approval authority"**, **"delegated authority"**, or **"limit waiver authority."** No one "signs" a limit waiver in the traditional sense -- they approve it in the risk management system (or, in a degraded process, confirm approval via phone/email that is subsequently documented in the limit management system).
- **Corrected Text:** `"someone with limit waiver authority"` or `"someone with delegated limit approval authority"`
- **Source/Rationale:** Industry-standard terminology per OCC Bulletin 2019-1 and internal delegation of authority matrices at major banks. "Signing authority" has a different meaning in the banking context (authority to sign contracts, legal documents, and payment instruments).

---

### Finding 24: "Capital Allocation" -- Wrong Concept for This Context

- **Location:** `risk-committee.ts`, line 28 (Risk Committee description: "capital allocation"); line 124 (manual step: "capital allocation system")
- **Issue Type:** Incorrect Jargon
- **Severity:** Medium
- **Current Text:** `"Governs trade approval thresholds, capital allocation, and risk policy enforcement"` (description); `"cross-checking trade details against capital allocation system"` (manual step)
- **Problem:** "Capital allocation" is a strategic finance function: the process of distributing economic and regulatory capital across business units, desks, and trading strategies. It is performed by Treasury/Capital Management on a quarterly or annual basis as part of the firm's capital planning process. It is not an intraday function and is not part of trade-level limit governance. The relevant concept for this scenario is **"limit utilization"** (how much of the desk's risk limit is currently used) or **"risk capacity"** (how much incremental risk can be added before the limit is breached). The delegate would check the desk's current limit utilization in the risk management system, not a "capital allocation system."
- **Corrected Text (description):** `"Governs risk limit framework, limit breach escalation, and risk policy enforcement"`
- **Corrected Text (manual step):** `"cross-checking trade risk metrics against the desk limit utilization report in the risk management system"`
- **Source/Rationale:** Capital allocation is a distinct function from risk limit monitoring. OCC Bulletin 2019-1 discusses risk limits and limit utilization. Basel III FRTB addresses capital requirements for trading book positions, but the capital requirement calculation is a separate process from intraday limit governance.

---

### Finding 25: Inconsistency Between TypeScript and Markdown -- "Risk Committee" vs. "Risk Department"

- **Location:** `risk-committee.ts`, line 27 (`label: "Risk Committee"`); `finance-scenarios.md`, line 138 ("Risk Department")
- **Issue Type:** Inconsistency
- **Severity:** Medium
- **Current Text (TS):** `"Risk Committee"` / **Current Text (MD):** `"Risk Department"`
- **Problem:** The TypeScript file labels the entity "Risk Committee" while the markdown narrative calls it "Risk Department." These are different organizational concepts (as discussed in Finding 1). A risk committee is a governance body that meets periodically; a risk department is a permanent organizational unit. Both are individually problematic for this scenario, and the inconsistency between the two source files compounds the confusion and signals a lack of review coordination.
- **Corrected Text:** Both should use `"Market Risk Management"` consistently.
- **Source/Rationale:** Internal consistency requirement; corrected terminology per Finding 1.

---

### Finding 26: Inconsistency -- Delay in Step 1 (TypeScript 8 sec vs. Markdown ~5 sec)

- **Location:** `risk-committee.ts`, line 122 (`delaySeconds: 8`); `finance-scenarios.md`, line 153 ("~5 sec delay")
- **Issue Type:** Inconsistency
- **Severity:** Low
- **Current Text (TS):** `delaySeconds: 8` / **Current Text (MD):** `"(~5 sec delay)"`
- **Problem:** The TypeScript simulation specifies 8 seconds for the "after-request" step, but the markdown narrative says "~5 sec delay." These should be aligned. The simulation engine will use the TypeScript value, so the markdown documentation is misleading to anyone reading the narrative without running the simulation.
- **Corrected Text:** Align both to the same value. Use `delaySeconds: 8` in TypeScript and `"(~8 sec delay)"` in the markdown (or align both to a corrected value).
- **Source/Rationale:** Internal consistency between the code and the documentation.

---

### Finding 27: "Trade Approved in Seconds" -- Over-Claim

- **Location:** `finance-scenarios.md`, line 179 (Step 5 Outcome, "With Accumulate" section)
- **Issue Type:** Over-Claim
- **Severity:** High
- **Current Text:** `"Trade approved in seconds."`
- **Problem:** Accumulate can route the delegation authority and escalation in seconds. However, the risk assessment itself -- reviewing the proposed position's risk metrics (VaR impact, DV01 utilization, Greek exposure, stress test results), evaluating the limit breach magnitude and business rationale, assessing current market conditions, and deciding whether to approve the temporary waiver -- requires human judgment and takes time regardless of the authorization infrastructure. An experienced risk officer might take 5-15 minutes to review a limit waiver request for a straightforward desk-level breach, and longer for complex or outsized positions. The claim that the trade is "approved in seconds" conflates the authorization routing speed with the total approval time. This over-claim would be immediately challenged by any Head of Market Risk or Desk Risk Manager, who knows the risk review takes time no matter how fast the delegation is routed.
- **Corrected Text:** `"Delegation routing completed in seconds. The Deputy Head of Market Risk receives the limit waiver request with verified delegation authority and full risk metrics. After reviewing the position details and risk impact, the waiver is approved -- total time measured in minutes rather than hours."`
- **Source/Rationale:** Risk assessment requires human judgment and review time. Accumulate accelerates the authorization routing and delegation verification, not the substantive risk assessment decision itself. Over-claiming undermines credibility with the exact audience the scenario targets.

---

### Finding 28: "No Compliance Gaps" -- Over-Claim

- **Location:** `finance-scenarios.md`, line 179 (Step 5 Outcome, "With Accumulate" section)
- **Issue Type:** Over-Claim
- **Severity:** Medium
- **Current Text:** `"No compliance gaps."`
- **Problem:** Accumulate can eliminate delegation documentation gaps and authorization provenance gaps. It cannot guarantee zero compliance gaps across the entire trade approval process. Compliance gaps can arise from: inadequate risk assessment by the delegate (Accumulate does not perform risk assessment), Volcker Rule classification errors, mark-to-market disputes, incorrect limit calculations in the risk system, counterparty credit limit issues, position reporting errors, and many other sources that are outside Accumulate's scope. The claim "no compliance gaps" is categorical and indefensible.
- **Corrected Text:** `"Delegation authority and approval chain fully documented with cryptographic proof -- no governance gaps in the authorization chain."`
- **Source/Rationale:** Precision in claims. Accumulate addresses authorization governance, not all possible compliance risks. A CRO or compliance officer would immediately challenge a categorical "no compliance gaps" claim.

---

### Finding 29: "Cryptographic Proof Shows Risk Chair -> Deputy Chair -> Approval"

- **Location:** `finance-scenarios.md`, line 179 (Step 5 Outcome, "With Accumulate" section)
- **Issue Type:** Incorrect Jargon
- **Severity:** Low
- **Current Text:** `"Cryptographic proof shows Risk Chair -> Deputy Chair -> approval"`
- **Problem:** Given the corrected role titles, this should reference "Head of Market Risk" and "Deputy Head of Market Risk." Additionally, the proof chain should be more specific about what exactly is captured: not just the delegation chain but also the scope of the delegated authority (product type, limit tier, maximum breach magnitude), the time the delegation was activated, and the specific action that was authorized. This specificity is what makes the Accumulate value proposition compelling for this use case.
- **Corrected Text:** `"Cryptographic proof captures the complete delegation chain: Head of Market Risk -> Deputy Head of Market Risk, including the delegation scope (product type, limit tier, maximum waiver amount), activation timestamp, specific limit waiver authorized, and the delegate's approval decision with timestamp."`
- **Source/Rationale:** Precision in value proposition description; alignment with OCC Heightened Standards documentation requirements for delegation of authority.

---

### Finding 30: 30-Second Escalation Timer is Unrealistic Without Context

- **Location:** `risk-committee.ts`, line 93 (`escalation afterSeconds: 30`); `finance-scenarios.md`, line 169
- **Issue Type:** Inaccuracy
- **Severity:** Low (for simulation purposes; would be High if presented as a real-world recommendation)
- **Current Text:** `afterSeconds: 30` / Markdown: "30 seconds"
- **Problem:** 30 seconds is the simulation-compressed value, which is understood for demonstration purposes. However, the scenario does not annotate this as simulation-compressed in all locations. In reality, an escalation from the Deputy Head of Market Risk to the CRO for an unacknowledged desk-level limit waiver request would typically occur after 30-60 minutes, not 30 seconds. The escalation timeline depends on the limit tier (desk-level vs. business-unit-level vs. firm-level) and the time sensitivity (e.g., an intraday limit breach during active trading hours has a shorter escalation clock than an end-of-day limit breach). The scenario should include a comment or note in both the TypeScript and markdown indicating the simulation compression factor and citing the realistic timeframe.
- **Corrected Text:** Add a comment in TypeScript: `afterSeconds: 30, // Simulation-compressed; represents 30-60 minute real-world escalation SLA for intraday desk-level limit breaches`. Add a note in markdown: `"Auto-escalation to CRO after 30 seconds (simulation-compressed; represents 30-60 minute real-world escalation SLA)"`.
- **Source/Rationale:** Industry-standard escalation timelines for limit breaches per OCC Bulletin 2019-1 and G-SIB internal limit governance frameworks.

---

### Finding 31: "~10 Hours -> Minutes" Improvement Claim -- Overstated

- **Location:** `finance-scenarios.md`, line 163 (Metrics line, "With Accumulate" section)
- **Issue Type:** Over-Claim
- **Severity:** Medium
- **Current Text:** `"~10 hours -> minutes"` (implied in the Metrics comparison)
- **Problem:** Even with the corrected "today" baseline of ~2-4 hours, the improvement claim of "minutes" is overstated if it implies the entire end-to-end process is completed in minutes. Accumulate accelerates the delegation routing and authority verification to near-instant. But the risk assessment, review, and decision-making by the delegate still takes time. A realistic improvement claim separates the two components: routing/delegation verification (reduced from 1-3 hours to seconds) and risk assessment/review (unchanged at 10-20 minutes). Total end-to-end approval time is reduced from 2-4 hours to 15-30 minutes, dominated by the delegate's risk review time.
- **Corrected Text:** `"~2-4 hours -> 15-30 minutes (delegation routing and authority verification reduced from hours to seconds; risk assessment review time unchanged)"`
- **Source/Rationale:** Accumulate accelerates authorization infrastructure, not human risk judgment. The improvement claim must be decomposed to maintain credibility with an audience that knows how long risk assessment takes.

---

## 3. Missing Elements

### Missing Roles (Critical)

| Role | Why It Matters | Where to Add |
|---|---|---|
| **Desk Head (Managing Director)** | First-line supervisory authority; initiates limit waiver requests on behalf of the trading desk; required by FINRA Rule 3110 as the designated supervising principal for the desk | Add as a Role under `trade-desk` |
| **Business Unit Risk Manager (Desk Risk Manager)** | Independent second-line risk assessment; required by OCC Bulletin 2019-1 and the three lines of defense model; performs independent risk assessment before any limit waiver is approved | Add as a Role under `risk-dept` (Market Risk Management) |
| **Middle Office / Trade Support** | Independent trade validation, P&L attribution, and risk analytics; provides the data that the risk authority reviews when approving a limit waiver; organizationally independent of front office | Consider noting in description or adding as a department |
| **Compliance Officer** | Volcker Rule review for the specific trade (is the position market-making or proprietary trading?); market conduct review; required for Dodd-Frank Section 619 compliance | Consider noting in description or adding as a Role |

### Missing Workflow Steps

| Step | Current Gap |
|---|---|
| Trader informs Desk Head of limit constraint | Scenario starts with trader contacting Risk Chair directly, bypassing first-line supervision |
| Desk Head reviews and decides to request waiver | No first-line management review or business rationale assessment |
| Desk Head submits waiver through limit management system | No system-of-record step for the waiver request |
| Business Unit Risk Manager performs independent risk assessment | No second-line risk assessment; regulators would flag this omission |
| Limit breach formally logged in limit management system | No system-of-record step for the breach event |
| Post-hoc notification to Head of Market Risk upon return | No close-the-loop step; OCC Heightened Standards require this |

### Missing Regulatory References (Critical)

| Framework | Relevance | Current Status |
|---|---|---|
| **FINRA Rule 3110 (Supervision)** | Requires supervisory systems and written supervisory procedures for all trading activities; directly governs the delegation of supervisory authority | Not referenced; must replace SOX |
| **FINRA Rule 3120 (Supervisory Control System)** | Requires annual testing of supervisory procedures including delegation of authority | Not referenced |
| **SEC Rule 15c3-5 (Market Access Rule)** | Requires automated pre-trade risk controls; fundamental to understanding pre-trade vs. post-trade limit governance | Not referenced; must replace BSA/AML |
| **OCC Bulletin 2019-1 (Trading Activities)** | Comprehensive trading risk management guidance including limit governance, delegation of authority, and independent risk management | Not referenced |
| **OCC Heightened Standards (12 CFR Part 30, Appendix D)** | Risk governance framework and delegation of authority requirements for large banks | Not referenced |
| **Dodd-Frank Section 619 (Volcker Rule)** | Restricts proprietary trading; requires risk limit frameworks for permitted market-making and hedging activities | Not referenced |
| **Federal Reserve SR 11-7** | Model risk management -- currently misused in the description; should be correctly scoped if referenced | Misused in description (cited as "model risk" for governance failures) |
| **Basel III/IV FRTB** | Capital requirements framework for trading book; basis for the risk limit structures (VaR, stressed VaR, Expected Shortfall) that define desk limits | Not referenced |

### Missing System References

| System | Relevance |
|---|---|
| **Order Management System (OMS) / Execution Management System (EMS)** | Where the trade order is entered and where pre-trade limit checks occur per SEC Rule 15c3-5 |
| **Limit Management System/Module** | Where limit waivers are formally requested and approved (often a module within Murex, Calypso/Adenza, or proprietary risk systems) |
| **Real-time risk analytics dashboards** (VaR, Greeks, stress test) | What the risk authority actually reviews when deciding on a limit waiver |
| **Delegation of Authority Matrix** | The formal document that defines who can exercise what authority, under what conditions, and with what limits -- the central document for this scenario's pain point |

---

## 4. Corrected Scenario

### Corrected TypeScript (`risk-committee.ts`)

```typescript
import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";

export const riskCommitteeScenario: ScenarioTemplate = {
  id: "finance-risk-committee",
  name: "Risk Limit Delegation for Derivatives Desk Breach",
  description:
    "A proposed interest rate derivatives position would breach the desk-level DV01 risk limit during a period of elevated market volatility. The Head of Market Risk is out of office, and delegation to the Deputy Head is documented in the Delegation of Authority Matrix but the matrix is a static document with ambiguous scope definitions. The Desk Head escalates through the Business Unit Risk Manager, but delays of 2-4 hours are common as the delegate's authority is verified and the risk assessment is reviewed, creating operational risk, governance gaps, and audit challenges.",
  icon: "UserSwitch",
  industryId: "finance",
  archetypeId: "delegated-authority",
  prompt: "What happens when a derivatives desk risk limit breach requires a temporary waiver and the Head of Market Risk is unavailable with ambiguously documented delegation authority?",
  actors: [
    {
      id: "inv-bank-org",
      type: NodeType.Organization,
      label: "Investment Bank",
      parentId: null,
      organizationId: "inv-bank-org",
      color: "#3B82F6",
    },
    {
      id: "risk-dept",
      type: NodeType.Department,
      label: "Market Risk Management",
      description:
        "Independent risk oversight function responsible for the risk limit framework, position monitoring, limit breach escalation, and risk policy enforcement",
      parentId: "inv-bank-org",
      organizationId: "inv-bank-org",
      color: "#06B6D4",
    },
    {
      id: "risk-chair",
      type: NodeType.Role,
      label: "Head of Market Risk",
      description:
        "Senior risk officer with delegated authority to approve temporary limit waivers for desk-level risk limit breaches between Risk Committee meetings -- currently out of office",
      parentId: "risk-dept",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
    {
      id: "deputy-chair",
      type: NodeType.Role,
      label: "Deputy Head of Market Risk",
      description:
        "Designated alternate with authority to act in the Head of Market Risk's absence -- authority scope defined in the Delegation of Authority Matrix",
      parentId: "risk-dept",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
    {
      id: "bu-risk-mgr",
      type: NodeType.Role,
      label: "Desk Risk Manager",
      description:
        "Independent second-line risk manager embedded with the derivatives desk -- performs risk assessment and provides limit breach recommendation to Head of Market Risk",
      parentId: "risk-dept",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
    {
      id: "cro",
      type: NodeType.Role,
      label: "CRO",
      description:
        "Chief Risk Officer -- senior enterprise risk authority with oversight of the risk limit framework; escalation target for limit breaches exceeding the Head of Market Risk's delegated authority or involving novel/outsized risk positions",
      parentId: "inv-bank-org",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
    {
      id: "trade-desk",
      type: NodeType.Department,
      label: "Interest Rate Derivatives Desk",
      description:
        "Derivatives trading desk operating under DV01, VaR, and Greek-based risk limits set by the Market Risk Committee",
      parentId: "inv-bank-org",
      organizationId: "inv-bank-org",
      color: "#06B6D4",
    },
    {
      id: "desk-head",
      type: NodeType.Role,
      label: "Desk Head (MD)",
      description:
        "Managing Director overseeing the derivatives desk -- first-line supervisory authority for limit utilization and initial escalation point for limit breaches per FINRA Rule 3110",
      parentId: "trade-desk",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
    {
      id: "trader",
      type: NodeType.Role,
      label: "Senior Trader",
      description:
        "Proposes interest rate derivatives position that would breach the desk DV01 limit during elevated market volatility",
      parentId: "trade-desk",
      organizationId: "inv-bank-org",
      color: "#94A3B8",
    },
  ],
  policies: [
    {
      id: "policy-risk-delegation",
      actorId: "risk-dept",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["risk-chair"],
      },
      expirySeconds: 86400,
      delegationAllowed: true,
      delegateToRoleId: "deputy-chair",
      escalation: {
        afterSeconds: 30, // Simulation-compressed; represents 30-60 minute real-world escalation SLA
        toRoleIds: ["cro"],
      },
    },
  ],
  edges: [
    { sourceId: "inv-bank-org", targetId: "risk-dept", type: "authority" },
    { sourceId: "risk-dept", targetId: "risk-chair", type: "authority" },
    { sourceId: "risk-dept", targetId: "deputy-chair", type: "authority" },
    { sourceId: "risk-dept", targetId: "bu-risk-mgr", type: "authority" },
    { sourceId: "inv-bank-org", targetId: "cro", type: "authority" },
    { sourceId: "inv-bank-org", targetId: "trade-desk", type: "authority" },
    { sourceId: "trade-desk", targetId: "desk-head", type: "authority" },
    { sourceId: "trade-desk", targetId: "trader", type: "authority" },
    { sourceId: "risk-chair", targetId: "deputy-chair", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "Derivatives desk risk limit waiver during volatile markets",
    initiatorRoleId: "desk-head",
    targetAction:
      "Approve Temporary DV01 Limit Waiver -- Interest Rate Derivatives Desk",
    description:
      "The Desk Head requests a temporary limit waiver after a proposed interest rate derivatives position would breach the desk DV01 limit during elevated market volatility. The Head of Market Risk is out of office with delegation to the Deputy Head documented in the Delegation of Authority Matrix. The Desk Risk Manager provides an independent risk assessment while the delegation chain is resolved.",
  },
  beforeMetrics: {
    manualTimeHours: 4,
    riskExposureDays: 2,
    auditGapCount: 6,
    approvalSteps: 9,
  },
  todayFriction: {
    ...ARCHETYPES["delegated-authority"].defaultFriction,
    manualSteps: [
      {
        trigger: "after-request",
        description:
          "Desk Head submits limit waiver request through risk management system -- Desk Risk Manager begins independent risk assessment while awaiting limit authority response",
        delaySeconds: 8,
      },
      {
        trigger: "on-unavailable",
        description:
          "Head of Market Risk out of office -- Desk Risk Manager contacts Market Risk Management office to identify designated alternate with limit waiver authority per Delegation of Authority Matrix",
        delaySeconds: 10,
      },
      {
        trigger: "before-approval",
        description:
          "Deputy Head of Market Risk locating and reviewing Delegation of Authority Matrix to verify authority scope for this limit tier and product type, then reviewing risk metrics (VaR, DV01, stress impact) in the risk management system",
        delaySeconds: 6,
      },
    ],
    narrativeTemplate:
      "Limit management system plus manual delegation verification against static Delegation of Authority Matrix",
  },
  todayPolicies: [
    {
      id: "policy-risk-delegation-today",
      actorId: "risk-dept",
      threshold: {
        k: 1,
        n: 1,
        approverRoleIds: ["risk-chair"],
      },
      expirySeconds: 25,
      delegationAllowed: false,
    },
  ],
  regulatoryContext: [
    {
      framework: "FINRA",
      displayName: "FINRA Rule 3110/3120",
      clause: "Supervision and Supervisory Control Systems",
      violationDescription:
        "Failure to establish and maintain supervisory system for trading activities, including written supervisory procedures for limit breach escalation and delegation of authority",
      fineRange:
        "Censure, fine up to $5M per violation, suspension, or expulsion; individual supervisors subject to statutory disqualification",
      severity: "critical",
      safeguardDescription:
        "Accumulate provides cryptographically verifiable delegation authority and limit breach escalation records, supporting written supervisory procedure documentation requirements under FINRA Rule 3110",
    },
    {
      framework: "SEC",
      displayName: "SEC Rule 15c3-5",
      clause: "Market Access Risk Management Controls",
      violationDescription:
        "Failure to establish, document, and maintain risk management controls for market access, including pre-trade risk limits and supervisory procedures for limit exception processing",
      fineRange:
        "SEC enforcement action; fines of $1M+ per violation; broker-dealer registration suspension; individual liability for supervisory failures",
      severity: "critical",
      safeguardDescription:
        "Accumulate enforces documented delegation authority for limit exception approvals with cryptographic proof of the complete authorization chain, supporting SEC Rule 15c3-5 compliance documentation for supervisory risk limit procedures",
    },
  ],
  tags: [
    "risk",
    "delegation",
    "trading",
    "derivatives",
    "market-risk",
    "desk-limits",
    "limit-waiver",
    "DV01",
    "FINRA-3110",
    "SEC-15c3-5",
  ],
};
```

### Corrected Markdown Narrative

```markdown
## 3. Risk Limit Delegation for Derivatives Desk Breach

**Setting:** A Senior Trader at an Investment Bank proposes an interest rate derivatives position that would breach the desk-level DV01 risk limit during a period of elevated market volatility. The Head of Market Risk is out of office and has delegated authority to the Deputy Head of Market Risk as documented in the Delegation of Authority Matrix -- but the matrix is a static document with ambiguously defined authority scope.

**Players:**
- **Investment Bank** (organization)
  - Market Risk Management
    - Head of Market Risk -- primary limit waiver authority (out of office)
    - Deputy Head of Market Risk -- designated alternate per Delegation of Authority Matrix
    - Desk Risk Manager -- independent second-line risk assessment
  - Interest Rate Derivatives Desk
    - Desk Head (MD) -- first-line supervisory authority; initiates the limit waiver request
    - Senior Trader -- proposes the position that triggers the limit breach
  - CRO -- escalation authority for breaches exceeding Head of Market Risk's delegated authority

**Action:** Desk Head requests a temporary DV01 limit waiver from Market Risk Management after a proposed interest rate derivatives position would breach the desk limit. Requires 1-of-1 approval from Head of Market Risk, with delegation to Deputy Head of Market Risk and CRO escalation for unresolved breaches.

---

### Today's Process

**Policy:** 1-of-1 from Head of Market Risk. Delegation documented in static Delegation of Authority Matrix but not enforceable in the limit management system. Short expiry.

1. **Limit breach flagged.** The risk management system flags that the proposed position would breach the desk DV01 limit. The Desk Head reviews the position and decides to request a temporary limit waiver through the limit management platform. The request includes the proposed position, current limit utilization, risk metrics (VaR, DV01, Greeks), and business rationale. *(~8 sec delay)*

2. **Head of Market Risk out of office.** The Desk Risk Manager contacts the Market Risk Management office to identify the designated alternate with limit waiver authority per the Delegation of Authority Matrix. The matrix is a static PDF that must be located and manually reviewed. *(~10 sec delay)*

3. **Authority scope ambiguity.** The Deputy Head of Market Risk is identified as the designated alternate but must verify their authority scope in the Delegation of Authority Matrix -- does their authority cover this limit tier, this product type, and this breach magnitude? They then review the risk metrics (VaR, DV01, stress test impact) in the risk management system. *(~6 sec delay)*

4. **Trading window narrows.** While authority is being verified, the proposed trade remains blocked by the pre-trade limit control in the OMS. The Desk Head must decide whether to scale down the position to fit within existing limits (losing the full opportunity) or to continue seeking limit waiver approval while the market window narrows.

5. **Outcome:** Either a reduced position within existing limits (lost opportunity) or a delayed approval after 2-4 hours of delegation verification. The Delegation of Authority Matrix was never verified in real-time. No cryptographic proof exists of the delegation activation, authority scope, or approval rationale. Six audit gaps remain: (1) no formal timestamp on delegation activation, (2) no evidence delegate verified their authority scope, (3) no evidence of independent risk assessment documentation, (4) no post-hoc notification to Head of Market Risk, (5) no documented waiver rationale, (6) no formal delegation scope tied to the specific action.

**Metrics:** ~2-4 hours average delay, 1-2 business days of governance exposure, 6 audit gaps, 9 manual steps.

---

### With Accumulate

**Policy:** 1-of-1 from Head of Market Risk. Formal delegation to Deputy Head of Market Risk with defined scope (product type, limit tier, maximum waiver amount). Auto-escalation to CRO after 30 seconds *(simulation-compressed; represents 30-60 minute real-world escalation SLA)*. 24-hour authority window.

1. **Limit waiver request submitted.** Desk Head submits the temporary limit waiver request through the limit management workflow. Accumulate's policy engine identifies the Head of Market Risk as the designated approver and routes the request.

2. **Head of Market Risk unavailable -- auto-delegate.** The system recognizes the Head of Market Risk is unavailable and automatically invokes the pre-configured delegation to the Deputy Head of Market Risk. The delegation scope (product type, limit tier, maximum breach magnitude) is explicitly encoded in the policy -- no phone calls, no manual matrix lookup, no authority confusion.

3. **Deputy Head of Market Risk reviews and approves.** The Deputy Head receives the delegated request with verified delegation authority, the Desk Risk Manager's independent risk assessment, and full risk metrics (VaR impact, DV01 utilization, stress test results). After reviewing the risk assessment, they approve the temporary limit waiver.

4. **CRO escalation available.** If neither the Head of Market Risk nor Deputy Head responds within the escalation SLA, the system auto-escalates to the CRO.

5. **Outcome:** Delegation routing completed in seconds. The Deputy Head of Market Risk receives the limit waiver request with verified delegation authority and full risk metrics. After reviewing the position details and risk impact, the waiver is approved -- total time measured in minutes rather than hours. Delegation authority and approval chain fully documented with cryptographic proof -- no governance gaps in the authorization chain. Cryptographic proof captures the complete delegation chain: Head of Market Risk -> Deputy Head of Market Risk, including the delegation scope, activation timestamp, specific limit waiver authorized, and the delegate's approval decision with timestamp.

**Metrics:** ~2-4 hours -> 15-30 minutes (delegation routing and authority verification reduced from hours to seconds; risk assessment review time unchanged). 1-2 days governance exposure -> same day. 6 audit gaps -> 0 authorization governance gaps.

---

### Takeaway

| Dimension | Today | With Accumulate |
|---|---|---|
| Delegation model | Static Delegation of Authority Matrix (PDF/spreadsheet), ambiguous scope | Formal, pre-configured, cryptographically recorded with defined scope |
| When Head of Market Risk is out | Desk Risk Manager searches DoA Matrix, calls Market Risk office | Auto-delegate to Deputy Head of Market Risk |
| Trading window risk | Position blocked by pre-trade control; opportunity lost during delegation verification | Waiver approved in minutes with verified delegation authority |
| Authority verification | Manual review of static DoA Matrix; scope ambiguity | Built into the policy system with explicit scope parameters |
| Regulatory exposure | 6 audit gaps, unverifiable delegation chain | Full provenance chain, verifiable delegation authority, FINRA 3110 compliant |
```

---

## 5. Credibility Risk Assessment

### Chief Risk Officer at a G-SIB

**Current scenario credibility: Fail.**

The CRO would immediately identify: (1) the conflation of the risk committee (governance body) with the risk management department (organizational unit) -- a distinction the CRO manages daily; (2) the absence of the three lines of defense structure (no Desk Head, no Business Unit Risk Manager) -- a model the CRO is responsible for implementing; (3) the use of SOX and BSA/AML as regulatory references for a trading limit scenario (these frameworks are managed by different functions entirely -- the Controller's office for SOX and the BSA/AML Officer for financial crimes); (4) the incorrect use of "model risk" (a term with a specific meaning under SR 11-7 that the CRO's model risk management team manages); and (5) the $10M notional framing (risk limits are expressed in VaR/Greeks, not notional -- the CRO signs the firm's risk appetite statement in these terms). The CRO would conclude that the scenario was written by someone without operational experience in investment bank risk management and would not engage further.

**Corrected scenario credibility: Acceptable with caveats.** The corrected scenario would pass an initial screen and the CRO would recognize the operational pain point. The scenario would benefit from specifying the risk limit tier structure and the delegation of authority matrix mechanics in more detail to fully resonate with the CRO's experience.

### Federal Reserve LISCC Examiner

**Current scenario credibility: Fail.**

The LISCC examiner would flag: (1) the organizational structure does not reflect the three lines of defense model required by Federal Reserve supervisory expectations (SR 12-13, SR 21-3); (2) no reference to OCC Heightened Standards, SR 11-7, or SR 12-7; (3) the workflow bypasses the first-line supervisory structure (Desk Head) and the second-line risk assessment (Business Unit Risk Manager); (4) the regulatory context (SOX, BSA/AML) is inapplicable to trading activities supervision; and (5) the scenario does not distinguish between pre-trade and post-trade limits, which is a fundamental distinction in the examination of trading activities. The examiner would assess the scenario as reflecting a fundamental misunderstanding of how trading risk governance operates at supervised institutions.

**Corrected scenario credibility: Acceptable.** The corrected scenario aligns with the Federal Reserve's supervisory expectations for risk governance at large banking organizations and properly references the applicable regulatory framework.

### OCC National Bank Examiner (Trading Activities)

**Current scenario credibility: Fail.**

The OCC examiner specializing in trading activities under OCC Bulletin 2019-1 would flag: (1) no reference to OCC Bulletin 2019-1 or OCC Heightened Standards -- the primary examination guidance for this exact scenario; (2) the "email with spreadsheet" workflow does not reflect the automated limit monitoring and management systems that OCC examiners expect to see at banks with active trading operations; (3) the "position entered informally without proper sign-off" would be flagged as inconsistent with SEC Rule 15c3-5 pre-trade controls and would represent a Matters Requiring Attention (MRA) or Matters Requiring Immediate Attention (MRIA) in an examination; (4) the absence of independent risk management roles in the workflow (Business Unit Risk Manager) violates the three lines of defense expectations; and (5) "capital allocation" is conflated with limit utilization, which are distinct functions.

**Corrected scenario credibility: Acceptable.** The corrected scenario addresses OCC Bulletin 2019-1 expectations and properly references the regulatory framework for trading activities. The examiner would recognize the delegation of authority pain point as consistent with findings in supervisory activities.

### Head of Market Risk at a Major Investment Bank

**Current scenario credibility: Fail.**

The Head of Market Risk would find: (1) "Risk Chair" is not their title -- they are the Head of Market Risk; (2) traders do not contact them directly for limit issues -- the Desk Head does, through the embedded Desk Risk Manager; (3) delegation is not documented in "email chains" but in the Delegation of Authority Matrix, which they maintain; (4) "$10M derivatives position" is meaningless without specifying the risk metric (DV01, VaR, gamma, etc.) -- they set limits in risk terms, not notional; (5) "capital allocation system" is a different function entirely that sits in Treasury; and (6) the claim of "approved in seconds" is operationally unrealistic because they know that reviewing a limit waiver request (checking VaR impact, DV01 utilization, stress test results, desk P&L, and business rationale) takes 10-20 minutes minimum for a straightforward case. The Head of Market Risk would conclude the scenario was written without consulting anyone who has operated a trading desk risk limit framework.

**Corrected scenario credibility: Good.** The corrected scenario uses appropriate terminology, correct organizational structure, and defensible metrics. A Head of Market Risk would recognize the operational pain point -- the friction in the static DoA matrix and the ambiguity of delegation scope -- and find the Accumulate value proposition credible for the specific problem of delegation authority verification and audit trail.

### Managing Director of a Derivatives Trading Desk

**Current scenario credibility: Fail.**

The MD would note: (1) the trader does not contact the Risk Chair directly -- the MD (Desk Head) handles all limit escalations on behalf of the desk; (2) $10M notional is insignificant (their desk might trade $1B+ notional in a single day; limits are expressed in DV01, VaR, and Greeks, not notional); (3) "volatile market conditions" is meaningless without specifics about which market factor and how it affects the desk's limit utilization; (4) "derivatives position" without specifying the product type (rates, credit, equity, FX) is amateurish; (5) the workflow omits the Desk Head entirely, which is the MD's own role -- the most important first-line supervisory role in the approval chain; and (6) the "position entered informally" framing suggests rogue trading, which is a regulatory crisis, not a delegation governance issue. The MD would dismiss the scenario as written by someone who has never worked on a trading floor.

**Corrected scenario credibility: Good.** The corrected scenario positions the Desk Head (MD) as the initiator, uses appropriate risk metrics (DV01), specifies the asset class (interest rate derivatives), and accurately describes the limit waiver process. The MD would recognize their own operational experience in the corrected workflow and find the Accumulate value proposition relevant to the real friction they experience when the Head of Market Risk is unavailable.

---

## Appendix: Summary of All Findings

| # | Finding | Severity | Issue Type |
|---|---|---|---|
| 1 | "Risk Committee" labeled as Department -- fundamental org error | Critical | Inaccuracy |
| 2 | "Risk Chair" is non-standard title | High | Incorrect Jargon |
| 3 | "Deputy Chair" is non-standard title | Medium | Incorrect Jargon |
| 4 | CRO description mischaracterizes role in trade approval | High | Inaccuracy |
| 5 | Missing Desk Head / Managing Director role | Critical | Missing Element |
| 6 | Missing Business Unit Risk Manager role | High | Missing Element |
| 7 | Trader directly contacting Risk Chair -- incorrect escalation chain | Critical | Incorrect Workflow |
| 8 | "$10M Derivatives Position" uncalibrated notional | Medium | Inaccuracy |
| 9 | SOX Section 302/404 regulatory reference inapplicable | Critical | Regulatory Error |
| 10 | BSA/AML regulatory reference inapplicable | Critical | Regulatory Error |
| 11 | Trade approval via email/spreadsheet -- incorrect workflow | High | Incorrect Workflow |
| 12 | Trader calling desk heads -- incorrect escalation | High | Incorrect Workflow |
| 13 | Delegation scope verified in email chain -- inaccurate | Medium | Inaccuracy |
| 14 | "Position entered informally" conflicts with pre-trade controls | High | Overstatement |
| 15 | "Model risk" used incorrectly (SR 11-7 has specific definition) | Medium | Incorrect Jargon |
| 16 | "Approval delays of 1-6 hours" uncalibrated range | Medium | Metric Error |
| 17 | "10 hours of delay" inflated beyond trading day | Medium | Metric Error |
| 18 | "4 days of risk exposure" ambiguous and inflated | Medium | Metric Error |
| 19 | "5 audit gaps" not enumerated | Low | Metric Error |
| 20 | "7 approval steps" not enumerated or calibrated | Low | Metric Error |
| 21 | "Derivatives position" excessively vague | Medium | Incorrect Jargon |
| 22 | "Volatile market conditions" generic and unconnected to workflow | Low | Understatement |
| 23 | "Signing authority" incorrect terminology | Low | Incorrect Jargon |
| 24 | "Capital allocation" wrong concept for limit governance | Medium | Incorrect Jargon |
| 25 | TypeScript/Markdown naming inconsistency (Committee vs. Department) | Medium | Inconsistency |
| 26 | Delay seconds inconsistency (TS: 8 sec vs. MD: ~5 sec) | Low | Inconsistency |
| 27 | "Trade approved in seconds" over-claim | High | Over-Claim |
| 28 | "No compliance gaps" over-claim | Medium | Over-Claim |
| 29 | Delegation proof chain uses incorrect role titles | Low | Incorrect Jargon |
| 30 | 30-second escalation timer unrealistic without context note | Low | Inaccuracy |
| 31 | "~10 hours -> minutes" improvement claim overstated | Medium | Over-Claim |

**Critical findings: 5 | High findings: 8 | Medium findings: 12 | Low findings: 6**

**Total findings: 31**

---

*Review conducted with the rigor expected of a Federal Reserve LISCC examination of trading activities risk governance at a G-SIB. Every finding is sourced to specific regulatory guidance (FINRA Rules 3110/3120, SEC Rule 15c3-5, OCC Bulletin 2019-1, OCC Heightened Standards 12 CFR Part 30 Appendix D, Federal Reserve SR 11-7/SR 12-13/SR 21-3, Basel III FRTB, Dodd-Frank Section 619), industry-standard practices, or operational experience at bulge-bracket investment banks.*
