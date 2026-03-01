export type ViolationSeverity = "critical" | "high" | "medium";

export interface RegulatoryContext {
  framework: string;
  displayName: string;
  clause?: string;
  violationDescription: string;
  fineRange: string;
  severity: ViolationSeverity;
  safeguardDescription: string;
}

export interface RegulatoryCalloutEvent {
  framework: string;
  displayName: string;
  clause?: string;
  violationDescription: string;
  fineRange: string;
  severity: ViolationSeverity;
  eventId: string;
  timestamp: number;
}
