import type { ScenarioTemplate } from "@/types/scenario";
import { supplierCertScenario } from "./supplier-cert";
import { qualityInspectionScenario } from "./quality-inspection";
import { jointDesignScenario } from "./joint-design";
import { exportControlScenario } from "./export-control";
import { warrantyChainScenario } from "./warranty-chain";

export const supplyChainScenarios: ScenarioTemplate[] = [
  supplierCertScenario,
  qualityInspectionScenario,
  jointDesignScenario,
  exportControlScenario,
  warrantyChainScenario,
];
