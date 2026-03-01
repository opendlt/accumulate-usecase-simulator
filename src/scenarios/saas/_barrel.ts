import type { ScenarioTemplate } from "@/types/scenario";
import { prodReleaseScenario } from "./prod-release";
import { privilegedAccessScenario } from "./privileged-access";
import { infraChangeScenario } from "./infra-change";
import { vendorAccessScenario } from "../vendor-access";
import { incidentEscalationScenario } from "../incident-escalation";

export const saasScenarios: ScenarioTemplate[] = [
  vendorAccessScenario,
  incidentEscalationScenario,
  prodReleaseScenario,
  privilegedAccessScenario,
  infraChangeScenario,
];
