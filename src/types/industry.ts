export type IndustryId = "defense" | "finance" | "healthcare" | "saas" | "supply-chain" | "web3";

export interface Industry {
  id: IndustryId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  scenarioIds: string[];
}
