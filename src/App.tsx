import { lazy, Suspense, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore, useScenarioStore, useCanvasStore } from "@/store";
import { CtaBar } from "@/components/shared/CtaBar";
import { PilotInterestModal } from "@/components/shared/PilotInterestModal";
import { ShareResultsModal } from "@/components/shared/ShareResultsModal";
import { KeyboardShortcutHints } from "@/components/shared/KeyboardShortcutHints";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { getScenarioIdFromUrl, getIndustryIdFromUrl, getAutoplayFromUrl } from "@/lib/url-codec";
import { getScenarioByIdAsync } from "@/scenarios";
import { getIndustryById } from "@/scenarios/industries";
import { trackEvent, isReturningVisitor } from "@/lib/analytics";
import { incrementVisitCount } from "@/lib/session-persistence";
import { usePageTitle } from "@/hooks/usePageTitle";

const HeroScreen = lazy(() =>
  import("@/components/screens/HeroScreen").then((m) => ({ default: m.HeroScreen }))
);
const IndustryPicker = lazy(() =>
  import("@/components/screens/IndustryPicker").then((m) => ({ default: m.IndustryPicker }))
);
const ScenarioSelector = lazy(() =>
  import("@/components/screens/ScenarioSelector").then((m) => ({ default: m.ScenarioSelector }))
);
const DualSimulationScreen = lazy(() =>
  import("@/components/screens/DualSimulationScreen").then((m) => ({ default: m.DualSimulationScreen }))
);
const EvidenceScreen = lazy(() =>
  import("@/components/screens/EvidenceScreen").then((m) => ({ default: m.EvidenceScreen }))
);
const SandboxScreen = lazy(() =>
  import("@/components/screens/SandboxScreen").then((m) => ({ default: m.SandboxScreen }))
);
const OrgBuilderScreen = lazy(() =>
  import("@/components/screens/OrgBuilderScreen").then((m) => ({ default: m.OrgBuilderScreen }))
);

const defaultTransition = { duration: 0.25, ease: "easeInOut" as const };

function ScreenWrapper({ children, deeper }: { children: React.ReactNode; deeper?: boolean }) {
  const yIn = deeper ? 20 : 8;
  return (
    <motion.div
      initial={{ opacity: 0, y: yIn }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={defaultTransition}
      className="h-screen"
    >
      {children}
    </motion.div>
  );
}

function CurrentScreen({ screen }: { screen: string }) {
  switch (screen) {
    case "hero":
      return <ScreenWrapper><HeroScreen /></ScreenWrapper>;
    case "industry-picker":
      return <ScreenWrapper><IndustryPicker /></ScreenWrapper>;
    case "scenario-selector":
      return <ScreenWrapper><ScenarioSelector /></ScreenWrapper>;
    case "simulation":
      return (
        <ScreenWrapper>
          <ErrorBoundary region="Simulation">
            <DualSimulationScreen />
          </ErrorBoundary>
        </ScreenWrapper>
      );
    case "evidence":
      return (
        <ScreenWrapper deeper>
          <ErrorBoundary region="Evidence">
            <EvidenceScreen />
          </ErrorBoundary>
        </ScreenWrapper>
      );
    case "sandbox":
      return (
        <ScreenWrapper>
          <ErrorBoundary region="Sandbox">
            <SandboxScreen />
          </ErrorBoundary>
        </ScreenWrapper>
      );
    case "org-builder":
      return (
        <ScreenWrapper>
          <ErrorBoundary region="Organization Builder">
            <OrgBuilderScreen />
          </ErrorBoundary>
        </ScreenWrapper>
      );
    default:
      return null;
  }
}

export function App() {
  const screen = useUIStore((s) => s.screen);
  const scenarioName = useScenarioStore((s) => s.activeScenario?.name);

  // Dynamic page title
  usePageTitle(screen, scenarioName);

  // Track page views + returning visitors on mount
  useEffect(() => {
    const visitCount = incrementVisitCount();
    trackEvent("hero_viewed");

    if (isReturningVisitor()) {
      trackEvent("returning_visitor", { visitCount });
    }
  }, []);

  // Track screen changes
  useEffect(() => {
    if (screen === "industry-picker") trackEvent("industry_selected");
    if (screen === "evidence") trackEvent("evidence_screen_opened");
  }, [screen]);

  // Deep-link autoplay handler
  useEffect(() => {
    const scenarioId = getScenarioIdFromUrl();
    const industryId = getIndustryIdFromUrl();
    const autoplay = getAutoplayFromUrl();

    if (!scenarioId) return;

    getScenarioByIdAsync(scenarioId).then((scenario) => {
      if (!scenario) return;

      const industry = getIndustryById(scenario.industryId ?? industryId ?? "");
      if (industry) {
        useUIStore.getState().selectIndustry(industry.id);
        useScenarioStore.getState().setActiveIndustry(industry);
      }

      useScenarioStore.getState().loadScenarioForDualRun(scenario);
      useCanvasStore.getState().loadScenario(scenario);
      useUIStore.getState().navigateTo("simulation");

      if (autoplay === "results") {
        sessionStorage.setItem("aas-autoplay", "results");
        trackEvent("autoplay_triggered", { scenarioId });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Suspense fallback={<div className="h-screen bg-bg" />}>
      <AnimatePresence mode="wait">
        <CurrentScreen key={screen} screen={screen} />
      </AnimatePresence>
      <CtaBar />
      <PilotInterestModal />
      <ShareResultsModal />
      {screen === "simulation" && <KeyboardShortcutHints />}
    </Suspense>
  );
}
