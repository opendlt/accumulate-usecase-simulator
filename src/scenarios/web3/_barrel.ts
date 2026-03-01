import type { ScenarioTemplate } from "@/types/scenario";
import { treasuryGovernanceScenario } from "./treasury-governance";
import { emergencyPauseScenario } from "./emergency-pause";
import { riskParameterScenario } from "./risk-parameter";
import { delegatedVotingScenario } from "./delegated-voting";
import { securityCouncilScenario } from "./security-council";
import { crossChainScenario } from "./cross-chain";

export const web3Scenarios: ScenarioTemplate[] = [
  treasuryGovernanceScenario,
  emergencyPauseScenario,
  riskParameterScenario,
  delegatedVotingScenario,
  securityCouncilScenario,
  crossChainScenario,
];
