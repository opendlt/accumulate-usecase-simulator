import type { ScenarioTemplate } from "@/types/scenario";
import { subcontractorAccessScenario } from "./subcontractor-access";
import { coalitionDataSharingScenario } from "./coalition-data-sharing";
import { classifiedDelegationScenario } from "./classified-delegation";
import { emergencyOverrideScenario } from "./emergency-override";
import { supplyChainCertScenario } from "./supply-chain-cert";

export const defenseScenarios: ScenarioTemplate[] = [
  subcontractorAccessScenario,
  coalitionDataSharingScenario,
  classifiedDelegationScenario,
  emergencyOverrideScenario,
  supplyChainCertScenario,
];
