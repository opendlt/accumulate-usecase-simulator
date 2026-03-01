import type { RegulatoryContext } from "@/types/regulatory";
import type { IndustryId } from "@/types/industry";

export const REGULATORY_DB: Record<IndustryId, RegulatoryContext[]> = {
  healthcare: [
    {
      framework: "HIPAA",
      displayName: "HIPAA \u00A7164.312",
      clause: "Access Controls",
      violationDescription: "Unauthorized access to PHI without proper authorization verification",
      fineRange: "$100K \u2014 $1.9M per incident",
      severity: "critical",
      safeguardDescription: "Accumulate enforces policy-driven access with cryptographic proof of authorization before any PHI access is granted",
    },
    {
      framework: "HITECH",
      displayName: "HITECH Act",
      clause: "Breach Notification",
      violationDescription: "Failure to document access authorization creates breach notification liability",
      fineRange: "$100K \u2014 $1.5M per violation category",
      severity: "high",
      safeguardDescription: "Every access authorization is cryptographically signed and immutably logged, eliminating breach notification gaps",
    },
  ],
  defense: [
    {
      framework: "NISPOM",
      displayName: "NISPOM 32 CFR Part 117",
      clause: "Industrial Security",
      violationDescription: "Unauthorized access to classified information without verified clearance and need-to-know determination",
      fineRange: "Facility clearance revocation + criminal penalties under 18 USC 793-798",
      severity: "critical",
      safeguardDescription: "Accumulate enforces verified clearance status and need-to-know determination with cryptographic proof before any classified access is granted",
    },
    {
      framework: "DoD 5205.07",
      displayName: "DoD 5205.07",
      clause: "SAP Policy",
      violationDescription: "SAP indoctrination or access without proper GPSO adjudication and CPSO coordination",
      fineRange: "Program access revocation + security incident investigation + potential criminal referral",
      severity: "critical",
      safeguardDescription: "Policy-enforced SAP access workflow ensures GPSO need-to-know adjudication, FSO clearance validation, and CPSO indoctrination coordination with complete audit trail",
    },
    {
      framework: "NDP-1",
      displayName: "NDP-1 / DoDI 5230.11",
      clause: "Foreign Disclosure",
      violationDescription: "Foreign disclosure of classified information without FDO determination or OCA marking authorization",
      fineRange: "Loss of FDO certification + compromise investigation + potential espionage referral under 18 USC 794",
      severity: "critical",
      safeguardDescription: "Mandatory FDO approval gate with certified AFDO delegation, OCA marking authorization, and sanitization review — all captured in cryptographic proof chain",
    },
    {
      framework: "DFARS",
      displayName: "DFARS 252.204-7012",
      clause: "Safeguarding CDI",
      violationDescription: "Audit gap in controlled information access authorization",
      fineRange: "Contract termination + False Claims Act liability",
      severity: "critical",
      safeguardDescription: "Complete audit trail with Merkle-receipt proof for every controlled information access decision",
    },
  ],
  finance: [
    {
      framework: "SOX",
      displayName: "SOX §302/404",
      clause: "Internal Controls over Financial Reporting",
      violationDescription: "Material weakness if fraud losses from monitoring failures materially affect financial statements",
      fineRange: "Personal CEO/CFO liability, up to $5M + 20 years",
      severity: "critical",
      safeguardDescription: "Accumulate provides independently verifiable proof of every authorization decision, supporting ICFR documentation requirements",
    },
    {
      framework: "BSA/AML",
      displayName: "BSA/AML (31 CFR 1020.320)",
      clause: "Suspicious Activity Reporting",
      violationDescription: "Inadequate suspicious activity monitoring program with untimely alert investigation and SAR filing delays",
      fineRange: "$25K per negligent violation; up to $1M or 2x transaction value per willful violation; institutional consent orders commonly $10M–$500M+",
      severity: "critical",
      safeguardDescription: "Policy-enforced escalation timers ensure fraud alerts are investigated and escalated within institutional SLAs, with cryptographic proof of timing for examination readiness",
    },
  ],
  "supply-chain": [
    {
      framework: "EAR",
      displayName: "EAR \u00A7764",
      clause: "Export Administration",
      violationDescription: "Shipment of controlled goods without verified authorization chain",
      fineRange: "Up to $300K per violation or 2x transaction value",
      severity: "critical",
      safeguardDescription: "Accumulate verifies complete authorization chains before any controlled goods shipment with cryptographic proof",
    },
    {
      framework: "ISO 9001",
      displayName: "ISO 9001:2015",
      clause: "8.4 External Providers",
      violationDescription: "Supplier certification gap in documented verification trail",
      fineRange: "Certification revocation + customer contract penalties",
      severity: "high",
      safeguardDescription: "Automated supplier certification verification with immutable audit trail for ISO compliance",
    },
  ],
  saas: [
    {
      framework: "SOC2",
      displayName: "SOC2 CC6.1",
      clause: "Logical Access",
      violationDescription: "Privileged access granted without documented multi-party approval",
      fineRange: "Audit qualification + customer contract SLA penalties",
      severity: "high",
      safeguardDescription: "Accumulate enforces multi-party approval with cryptographic signatures before any privileged access is granted",
    },
    {
      framework: "GDPR",
      displayName: "GDPR Art. 32",
      clause: "Security of Processing",
      violationDescription: "Inadequate access authorization documentation for personal data",
      fineRange: "Up to 4% annual turnover or \u20AC20M",
      severity: "critical",
      safeguardDescription: "Complete, immutable documentation of every access authorization decision for personal data processing",
    },
  ],
  web3: [
    {
      framework: "MiCA",
      displayName: "MiCA Art. 68",
      clause: "Asset Safeguarding",
      violationDescription: "Treasury action without verified multi-sig authorization",
      fineRange: "Up to \u20AC5M or 3% annual turnover",
      severity: "critical",
      safeguardDescription: "Accumulate replaces manual multi-sig ceremonies with programmable threshold policies and cryptographic proof",
    },
    {
      framework: "SEC",
      displayName: "SEC Rule 206(4)-2",
      clause: "Custody Rule",
      violationDescription: "Digital asset custody action without qualified custodian verification",
      fineRange: "Enforcement action + disgorgement",
      severity: "high",
      safeguardDescription: "Verifiable custody authorization with policy-enforced multi-party approval and complete audit trail",
    },
  ],
};

export function getRegulatoryContext(industryId: IndustryId): RegulatoryContext[] {
  return REGULATORY_DB[industryId] ?? [];
}
