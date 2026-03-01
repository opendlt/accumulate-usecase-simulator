import type { ScenarioTemplate } from "@/types/scenario";
import { fraudEscalationScenario } from "./fraud-escalation";
import { riskCommitteeScenario } from "./risk-committee";
import { regulatoryReportingScenario } from "./regulatory-reporting";
import { vendorComplianceScenario } from "./vendor-compliance";
import { treasuryTransferScenario } from "../treasury-transfer";

export const financeScenarios: ScenarioTemplate[] = [
  treasuryTransferScenario,
  fraudEscalationScenario,
  riskCommitteeScenario,
  regulatoryReportingScenario,
  vendorComplianceScenario,
];
