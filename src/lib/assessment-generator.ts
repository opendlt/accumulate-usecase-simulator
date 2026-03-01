import type { Actor } from "@/types/organization";
import type { BeforeAfterComparison, VerificationQuery } from "@/types/evidence";
import type { RegulatoryContext } from "@/types/regulatory";
import type { UserROIInputs } from "@/types/roi";
import { computeROIProjection, formatCurrency, formatHours } from "@/lib/roi-calculator";

interface AssessmentData {
  scenarioName: string;
  scenarioDescription: string;
  industryName: string;
  actors: Actor[];
  comparisons: BeforeAfterComparison[];
  verification: VerificationQuery[];
  regulatoryContext?: RegulatoryContext[];
  roiInputs?: UserROIInputs;
  accTimeSeconds: number;
  proofHash: string;
  todayOutcome: string;
  accumulateOutcome: string;
  shareUrl?: string;
}

export function generateAssessmentHTML(data: AssessmentData): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Check for org name from pilot submission
  let orgName: string | null = null;
  try {
    const pilotData = localStorage.getItem("aas-pilot-submission");
    if (pilotData) {
      const parsed = JSON.parse(pilotData);
      if (parsed.organization) orgName = parsed.organization;
    }
  } catch { /* ignore */ }

  const confidentialHeader = orgName
    ? `<div style="text-align:center;font-size:0.75em;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;">CONFIDENTIAL &mdash; Prepared for ${orgName}</div>`
    : "";

  const roiSection = data.roiInputs
    ? buildROISection(data.roiInputs, data.accTimeSeconds)
    : "";

  const regulatorySection = data.regulatoryContext?.length
    ? buildRegulatorySection(data.regulatoryContext)
    : "";

  const comparisonRows = data.comparisons
    .map(
      (c) => `
      <tr>
        <td style="padding:10px 12px;font-weight:600;border-bottom:1px solid #e5e7eb;">${c.metric}</td>
        <td style="padding:10px 12px;text-align:center;color:#dc2626;border-bottom:1px solid #e5e7eb;">${String(c.before)}</td>
        <td style="padding:10px 12px;text-align:center;color:#16a34a;font-weight:600;border-bottom:1px solid #e5e7eb;">${String(c.after)}</td>
        <td style="padding:10px 12px;text-align:center;border-bottom:1px solid #e5e7eb;">
          <span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:20px;font-size:0.8em;font-weight:600;">${c.improvement}</span>
        </td>
      </tr>`
    )
    .join("");

  const verificationRows = data.verification
    .map(
      (q) => `
      <div style="margin-bottom:16px;">
        <p style="font-weight:700;font-size:0.95em;margin:0 0 4px;color:#1e293b;">Q: ${q.question}</p>
        <p style="font-size:0.9em;color:#475569;margin:0;">A: ${q.answer}</p>
      </div>`
    )
    .join("");

  const actorList = data.actors
    .filter((a) => a.type === "role" || a.type === "organization")
    .map((a) => `<span style="display:inline-block;background:#f1f5f9;padding:3px 10px;border-radius:6px;margin:2px 4px;font-size:0.85em;">${a.label}</span>`)
    .join(" ");

  const shareUrlSection = data.shareUrl
    ? `<p style="color:#94a3b8;font-size:0.75em;margin:8px 0 0;"><strong>Re-run this scenario:</strong> <a href="${data.shareUrl}" style="color:#3b82f6;">${data.shareUrl}</a></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authority Assessment — ${data.scenarioName}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.6;
    }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; }
    h1, h2, h3 { color: #0f172a; }
    .section { margin-bottom: 32px; }
    .divider { border: none; border-top: 2px solid #e5e7eb; margin: 32px 0; }
    .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #94a3b8; font-size: 0.75em; }
  </style>
</head>
<body>
  ${confidentialHeader}

  <!-- Cover -->
  <div style="text-align:center;margin-bottom:48px;padding-bottom:32px;border-bottom:3px solid #3b82f6;">
    <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;">
      <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="#3b82f6" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M8 6V10" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M6 8H10" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span style="font-size:1.1em;font-weight:700;color:#64748b;">Accumulate</span>
    </div>
    <h1 style="font-size:1.8em;margin:0 0 8px;">Authority Assessment</h1>
    <p style="font-size:1.1em;color:#3b82f6;font-weight:600;margin:0 0 4px;">${data.scenarioName}</p>
    <p style="color:#64748b;margin:0;font-size:0.9em;">${capitalize(data.industryName)} &middot; ${date}</p>
  </div>

  <!-- Scenario Summary -->
  <div class="section">
    <h2 style="font-size:1.2em;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Scenario Summary</h2>
    <p style="font-size:0.95em;color:#475569;">${data.scenarioDescription}</p>
    <div style="margin-top:12px;">
      <p style="font-size:0.8em;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">Actors Involved</p>
      <div>${actorList}</div>
    </div>
  </div>

  <hr class="divider">

  <!-- Comparison Table -->
  <div class="section">
    <h2 style="font-size:1.2em;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Before vs. After Comparison</h2>
    <table>
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 12px;font-size:0.75em;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;border-bottom:2px solid #e5e7eb;">Metric</th>
          <th style="padding:10px 12px;text-align:center;font-size:0.75em;text-transform:uppercase;letter-spacing:0.05em;color:#dc2626;border-bottom:2px solid #e5e7eb;">Today</th>
          <th style="padding:10px 12px;text-align:center;font-size:0.75em;text-transform:uppercase;letter-spacing:0.05em;color:#16a34a;border-bottom:2px solid #e5e7eb;">Accumulate</th>
          <th style="padding:10px 12px;text-align:center;font-size:0.75em;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;border-bottom:2px solid #e5e7eb;">Improvement</th>
        </tr>
      </thead>
      <tbody>
        ${comparisonRows}
      </tbody>
    </table>
    <p style="font-size:0.8em;color:#94a3b8;margin-top:8px;">
      Today: ${data.todayOutcome === "approved" ? "Approved (with issues)" : "Denied"} &middot;
      Accumulate: ${data.accumulateOutcome === "approved" ? "Approved (clean)" : "Denied"}
    </p>
  </div>

  ${roiSection}
  ${regulatorySection}

  <hr class="divider">

  <!-- Verification Q&A -->
  <div class="section">
    <h2 style="font-size:1.2em;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Auditor Verification Q&A</h2>
    ${verificationRows}
  </div>

  <hr class="divider">

  <!-- Proof Summary -->
  <div class="section">
    <h2 style="font-size:1.2em;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Proof Artifact Summary</h2>
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;font-family:monospace;font-size:0.85em;">
      <p style="margin:0 0 4px;"><strong>Hash:</strong> ${data.proofHash}</p>
      <p style="margin:0 0 4px;"><strong>Signatures:</strong> ${data.actors.filter(a => a.type === "role").length} signers verified</p>
      <p style="margin:0;"><strong>Merkle Receipt:</strong> Included (independently verifiable)</p>
    </div>
  </div>

  <hr class="divider">

  <!-- CTA -->
  <div style="text-align:center;padding:32px 0;background:#f0f9ff;border-radius:12px;margin-top:24px;">
    <h3 style="margin:0 0 8px;font-size:1.1em;">Ready to eliminate approval bottlenecks?</h3>
    <p style="color:#475569;font-size:0.9em;margin:0 0 16px;">Book a 30-minute Authority Mapping Session</p>
    <a
      href="https://accumulatenetwork.io/pilot"
      style="display:inline-block;background:#3b82f6;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95em;"
    >
      Schedule Now
    </a>
    <p style="color:#64748b;font-size:0.8em;margin:12px 0 0;">
      Or email us: <a href="mailto:pilot@accumulatenetwork.io" style="color:#3b82f6;">pilot@accumulatenetwork.io</a>
    </p>
    ${shareUrlSection}
  </div>

  <div class="footer">
    Generated by Accumulate Authority Simulator &middot; <a href="https://accumulatenetwork.io" style="color:#3b82f6;text-decoration:none;">accumulatenetwork.io</a> &middot; ${date}
  </div>
</body>
</html>`;
}

function buildROISection(inputs: UserROIInputs, accTimeSeconds: number): string {
  const projection = computeROIProjection(inputs, accTimeSeconds);
  return `
  <hr class="divider">
  <div class="section">
    <h2 style="font-size:1.2em;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">ROI Projection (Your Numbers)</h2>
    <table>
      <tbody>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">Monthly Workflows</td>
          <td style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;">${inputs.monthlyWorkflows.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">Avg. Time per Approval</td>
          <td style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;">${inputs.avgTimePerApprovalHours} hours</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">Avg. Hourly Cost</td>
          <td style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;">$${inputs.avgHourlyCost}/hr</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:2px solid #e5e7eb;">Annual Audit Findings</td>
          <td style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:2px solid #e5e7eb;">${inputs.annualAuditFindings}</td>
        </tr>
        <tr style="background:#f0fdf4;">
          <td style="padding:12px;font-weight:700;font-size:1.05em;">Projected Annual Savings</td>
          <td style="padding:12px;text-align:right;font-weight:700;font-size:1.2em;color:#16a34a;">${formatCurrency(projection.annualSavings)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;">Time Recovered per Year</td>
          <td style="padding:8px 12px;text-align:right;color:#3b82f6;font-weight:600;">${formatHours(projection.timeRecoveredHoursPerYear)}</td>
        </tr>
      </tbody>
    </table>
  </div>`;
}

function buildRegulatorySection(context: RegulatoryContext[]): string {
  const rows = context
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 12px;font-weight:600;border-bottom:1px solid #e5e7eb;">
          ${r.displayName}
          ${r.clause ? `<br><span style="font-size:0.8em;font-weight:400;color:#64748b;">${r.clause}</span>` : ""}
        </td>
        <td style="padding:10px 12px;color:#dc2626;font-size:0.9em;border-bottom:1px solid #e5e7eb;">${r.violationDescription}</td>
        <td style="padding:10px 12px;color:#16a34a;font-size:0.9em;border-bottom:1px solid #e5e7eb;">${r.safeguardDescription}</td>
        <td style="padding:10px 12px;text-align:center;font-size:0.85em;border-bottom:1px solid #e5e7eb;">
          <span style="background:${r.severity === "critical" ? "#fef2f2" : "#fefce8"};color:${r.severity === "critical" ? "#dc2626" : "#ca8a04"};padding:2px 8px;border-radius:4px;font-weight:600;">${r.fineRange}</span>
        </td>
      </tr>`
    )
    .join("");

  return `
  <hr class="divider">
  <div class="section">
    <h2 style="font-size:1.2em;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Regulatory Context</h2>
    <table>
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 12px;font-size:0.75em;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;border-bottom:2px solid #e5e7eb;">Framework</th>
          <th style="padding:10px 12px;font-size:0.75em;text-transform:uppercase;letter-spacing:0.05em;color:#dc2626;border-bottom:2px solid #e5e7eb;">Risk (Today)</th>
          <th style="padding:10px 12px;font-size:0.75em;text-transform:uppercase;letter-spacing:0.05em;color:#16a34a;border-bottom:2px solid #e5e7eb;">Safeguard (Accumulate)</th>
          <th style="padding:10px 12px;text-align:center;font-size:0.75em;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;border-bottom:2px solid #e5e7eb;">Fine Range</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
