import { useEffect } from "react";
import type { ScreenId } from "@/store/ui-store";
import { APP_NAME } from "@/lib/constants";

const TITLES: Record<ScreenId, string> = {
  hero: APP_NAME,
  "industry-picker": `Choose Your Industry | ${APP_NAME}`,
  "scenario-selector": `Pick a Scenario | ${APP_NAME}`,
  simulation: `Running Simulation | ${APP_NAME}`,
  evidence: `Evidence Deep Dive | ${APP_NAME}`,
  sandbox: `Advanced Mode | ${APP_NAME}`,
  "org-builder": `Build Your Organization | ${APP_NAME}`,
};

export function usePageTitle(screen: ScreenId, scenarioName?: string) {
  useEffect(() => {
    let title = TITLES[screen] ?? APP_NAME;

    if (screen === "simulation" && scenarioName) {
      title = `${scenarioName} | ${APP_NAME}`;
    }

    document.title = title;

    return () => {
      document.title = APP_NAME;
    };
  }, [screen, scenarioName]);
}
