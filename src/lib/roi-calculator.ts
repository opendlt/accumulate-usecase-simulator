import type { UserROIInputs, ROIProjection } from "@/types/roi";

/**
 * Compute ROI projection based on user inputs and the Accumulate simulation time.
 * accTimeSeconds is the total time (in seconds) from the Accumulate simulation run.
 */
export function computeROIProjection(
  inputs: UserROIInputs,
  accTimeSeconds: number,
): ROIProjection {
  const annualWorkflows = inputs.monthlyWorkflows * 12;
  const manualHoursPerWorkflow = inputs.avgTimePerApprovalHours;
  const accHoursPerWorkflow = accTimeSeconds / 3600;

  const annualManualCost = annualWorkflows * manualHoursPerWorkflow * inputs.avgHourlyCost;
  const annualAccumulateCost = annualWorkflows * accHoursPerWorkflow * inputs.avgHourlyCost;
  const annualSavings = annualManualCost - annualAccumulateCost;
  const timeRecoveredHoursPerYear = annualWorkflows * (manualHoursPerWorkflow - accHoursPerWorkflow);
  const auditFindingsEliminated = inputs.annualAuditFindings;

  return {
    annualManualCost: Math.round(annualManualCost),
    annualAccumulateCost: Math.round(annualAccumulateCost),
    annualSavings: Math.round(annualSavings),
    timeRecoveredHoursPerYear: Math.round(timeRecoveredHoursPerYear),
    auditFindingsEliminated,
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value}`;
}

export function formatHours(hours: number): string {
  if (hours >= 1_000) {
    return `${(hours / 1_000).toFixed(1)}K hours`;
  }
  return `${hours} hours`;
}
