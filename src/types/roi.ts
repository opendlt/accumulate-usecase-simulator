export interface UserROIInputs {
  monthlyWorkflows: number;
  avgTimePerApprovalHours: number;
  avgHourlyCost: number;
  annualAuditFindings: number;
}

export interface ROIProjection {
  annualManualCost: number;
  annualAccumulateCost: number;
  annualSavings: number;
  timeRecoveredHoursPerYear: number;
  auditFindingsEliminated: number;
}

export const INDUSTRY_DEFAULTS: Record<string, Partial<UserROIInputs>> = {
  healthcare: { avgHourlyCost: 85, monthlyWorkflows: 200, avgTimePerApprovalHours: 4, annualAuditFindings: 12 },
  finance: { avgHourlyCost: 120, monthlyWorkflows: 350, avgTimePerApprovalHours: 3, annualAuditFindings: 18 },
  defense: { avgHourlyCost: 95, monthlyWorkflows: 150, avgTimePerApprovalHours: 6, annualAuditFindings: 8 },
  saas: { avgHourlyCost: 90, monthlyWorkflows: 500, avgTimePerApprovalHours: 2, annualAuditFindings: 15 },
  "supply-chain": { avgHourlyCost: 75, monthlyWorkflows: 250, avgTimePerApprovalHours: 5, annualAuditFindings: 10 },
  web3: { avgHourlyCost: 110, monthlyWorkflows: 100, avgTimePerApprovalHours: 3, annualAuditFindings: 6 },
};
