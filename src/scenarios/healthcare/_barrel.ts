import type { ScenarioTemplate } from "@/types/scenario";
import { patientDataAccessScenario } from "./patient-data-access";
import { researchCollaborationScenario } from "./research-collaboration";
import { trialProtocolScenario } from "./trial-protocol";
import { emergencyAccessScenario } from "./emergency-access";

export const healthcareScenarios: ScenarioTemplate[] = [
  patientDataAccessScenario,
  researchCollaborationScenario,
  trialProtocolScenario,
  emergencyAccessScenario,
];
