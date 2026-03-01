import { lazy, Suspense, useRef, useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { StoreApi } from "zustand";
import { SimulatorCanvas } from "@/components/canvas/SimulatorCanvas";
import { SimulationTimeline } from "@/components/simulation/SimulationTimeline";
import { PlaybackControls } from "@/components/simulation/PlaybackControls";
import { DualRunToggle } from "@/components/shared/DualRunToggle";
import { ComparisonOverlay } from "@/components/shared/ComparisonOverlay";
import { SplitScreenScoreboard } from "@/components/shared/SplitScreenScoreboard";
import { NarrativeTicker } from "@/components/shared/NarrativeTicker";
import { EventDetailBanner } from "@/components/shared/EventDetailBanner";
import { VictoryFlash } from "@/components/shared/VictoryFlash";
import { Button } from "@/components/shared/Button";
import { ProofStamp } from "@/components/shared/ProofStamp";
import { ROICalculatorDrawer } from "@/components/shared/ROICalculatorDrawer";
import { ConfettiCelebration } from "@/components/shared/ConfettiCelebration";
import { ComplianceCalloutStack, buildViolationCallouts, buildSafeguardCallouts } from "@/components/shared/ComplianceCallout";
import type { ComplianceCalloutItem } from "@/components/shared/ComplianceCallout";
import { TopBar } from "@/components/layout/TopBar";
import { FlowBreadcrumb } from "@/components/shared/FlowBreadcrumb";
import { Lightning, FastForward, ArrowCounterClockwise, Calculator, X } from "@phosphor-icons/react";
import { useSimulationStore, useUIStore, useScenarioStore, createCanvasStore } from "@/store";
import { useROIStore } from "@/store/roi-store";
import type { CanvasStore } from "@/store";
import { useDualSimulationPlayback } from "@/hooks/useDualSimulationPlayback";
import { useCinematicPlayback } from "@/hooks/useCinematicPlayback";
import type { CinematicAct } from "@/hooks/useCinematicPlayback";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SimulationStatus } from "@/types/simulation";
import { generateDualComparison } from "@/engine/verification";
import { generateComparativeNarrative } from "@/lib/comparative-narrative";
import { trackEvent } from "@/lib/analytics";

const GuidedTour = lazy(() =>
  import("@/components/onboarding/GuidedTour").then((m) => ({
    default: m.GuidedTour,
  }))
);

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// ---------------------------------------------------------------------------
// Framer Motion variants for cinematic canvas positioning
// ---------------------------------------------------------------------------

const springTransition = { type: "spring" as const, stiffness: 180, damping: 28 };

// Today: large center in Act 1, shrinks to small left reference in Act 2,
// then expands to left half in resolution.
const todayVariants = {
  idle:          { left: "4%",    width: "92%",   top: "0%", height: "100%", opacity: 1 },
  prerun:        { left: "4%",    width: "92%",   top: "0%", height: "100%", opacity: 1 },
  act1:          { left: "2%",    width: "92%",   top: "0%", height: "100%", opacity: 1 },
  transition12:  { left: "0.5%",  width: "22%",   top: "0%", height: "100%", opacity: 0.5 },
  act2:          { left: "0.5%",  width: "22%",   top: "0%", height: "100%", opacity: 0.35 },
  transition2r:  { left: "0.5%",  width: "48.5%", top: "0%", height: "100%", opacity: 0.9 },
  resolution:    { left: "0.5%",  width: "48.5%", top: "0%", height: "100%", opacity: 1 },
};

// Accumulate: hidden in Act 1, takes center stage (92% like Today had) in Act 2,
// then settles to right half in resolution.
const accVariants = {
  idle:          { left: "100%",  width: "0%",    top: "0%", height: "100%", opacity: 0 },
  prerun:        { left: "100%",  width: "0%",    top: "0%", height: "100%", opacity: 0 },
  act1:          { left: "100%",  width: "0%",    top: "0%", height: "100%", opacity: 0 },
  transition12:  { left: "4%",    width: "92%",   top: "0%", height: "100%", opacity: 0.6 },
  act2:          { left: "4%",    width: "92%",   top: "0%", height: "100%", opacity: 1 },
  transition2r:  { left: "50.5%", width: "48.5%", top: "0%", height: "100%", opacity: 1 },
  resolution:    { left: "50.5%", width: "48.5%", top: "0%", height: "100%", opacity: 1 },
};

const scrimVariants = {
  idle:          { opacity: 0 },
  prerun:        { opacity: 0 },
  act1:          { opacity: 0 },
  transition12:  { opacity: 0.4 },
  act2:          { opacity: 0.4 },
  transition2r:  { opacity: 0 },
  resolution:    { opacity: 0 },
};

function actLabel(act: CinematicAct): string {
  switch (act) {
    case "act1": return "Today's Process";
    case "transition12": return "Transitioning...";
    case "act2": return "With Accumulate";
    case "transition2r": return "Completing...";
    case "resolution": return "Complete";
    default: return "";
  }
}

// ---------------------------------------------------------------------------
// Act stepper breadcrumb
// ---------------------------------------------------------------------------

const STEPS = [
  { key: "act1", label: "Today's Process", color: "#EF4444" },
  { key: "act2", label: "With Accumulate", color: "#22C55E" },
  { key: "resolution", label: "Results", color: "#3B82F6" },
] as const;

function actToStepIndex(act: CinematicAct): number {
  if (act === "idle" || act === "prerun") return -1;
  if (act === "act1") return 0;
  if (act === "transition12") return 0; // still "at" step 1, transitioning
  if (act === "act2") return 1;
  if (act === "transition2r") return 1;
  return 2; // resolution
}

function ActStepper({ act }: { act: CinematicAct }) {
  const current = actToStepIndex(act);
  if (current < 0) return null;

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const isComplete = i < current;
        const isActive = i === current;
        const isPending = i > current;
        return (
          <div key={step.key} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className="w-4 h-px"
                style={{ background: isComplete || isActive ? step.color : "var(--border-color)" }}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: isComplete || isActive ? step.color : "transparent",
                  border: `1.5px solid ${isComplete || isActive ? step.color : "var(--text-muted)"}`,
                  boxShadow: isActive ? `0 0 6px ${step.color}80` : "none",
                }}
              />
              <span
                className="text-[0.6rem] font-medium tracking-wide transition-colors duration-300"
                style={{
                  color: isActive ? step.color : isComplete ? "var(--text-muted)" : isPending ? "var(--text-subtle)" : undefined,
                }}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DualSimulationScreen() {
  const {
    run,
    status,
    activeMode,
    todayRun,
    accumulateRun,
    switchToMode,
    resetDualRun,
  } = useSimulationStore();
  const { dualRunPhase, navigateTo, guidedTourActive, setGuidedTourActive, setDualRunPhase } = useUIStore();
  const { activeScenario } = useScenarioStore();
  const { inputs: roiInputs, openDrawer: openROIDrawer } = useROIStore();

  const isWide = useMediaQuery("(min-width: 768px)");

  // Create two independent canvas stores for split-screen
  const todayStoreRef = useRef<StoreApi<CanvasStore>>(null);
  const accStoreRef = useRef<StoreApi<CanvasStore>>(null);
  if (todayStoreRef.current === null) {
    todayStoreRef.current = createCanvasStore();
  }
  if (accStoreRef.current === null) {
    accStoreRef.current = createCanvasStore();
  }

  // Cinematic playback (desktop)
  const {
    loadPreview,
    startCinematic,
    progress,
    skipToResults,
    todayEvents,
    accEvents,
    actors,
    pause,
    resume,
    seekTo,
    resetCinematic,
  } = useCinematicPlayback(todayStoreRef.current, accStoreRef.current);

  // Fallback for mobile: legacy sequential dual playback
  const { startDualSimulation } = useDualSimulationPlayback();

  const handleStart = isWide
    ? () => {
        trackEvent("simulation_started", { scenarioId: activeScenario?.id ?? "" });
        startCinematic();
      }
    : () => {
        trackEvent("simulation_started", { scenarioId: activeScenario?.id ?? "" });
        startDualSimulation();
      };

  useKeyboardShortcuts(handleStart);

  // Auto-trigger guided tour on first visit
  useEffect(() => {
    if (!localStorage.getItem("aas-tour-completed") && !guidedTourActive) {
      // Small delay so the canvas has time to render before the tour positions its tooltips
      const timer = setTimeout(() => setGuidedTourActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load org chart preview on mount / scenario change (fixes blank canvas bug)
  useEffect(() => {
    if (isWide && activeScenario && progress.act === "idle") {
      loadPreview();
    }
  }, [isWide, activeScenario, progress.act, loadPreview]);

  const act = progress.act;

  // Trigger fitView when act changes (canvas resizes during transitions)
  const [fitViewTrigger, setFitViewTrigger] = useState(0);
  const prevActRef = useRef(act);
  useEffect(() => {
    if (act !== prevActRef.current) {
      prevActRef.current = act;
      // Trigger after the spring animation mostly settles (~600ms)
      const timer = setTimeout(() => setFitViewTrigger((n) => n + 1), 600);
      return () => clearTimeout(timer);
    }
  }, [act]);

  // Show Act 2 title card briefly when entering act2
  const [showAct2Title, setShowAct2Title] = useState(false);
  useEffect(() => {
    if (act === "act2") {
      setShowAct2Title(true);
      const timer = setTimeout(() => setShowAct2Title(false), 2200);
      return () => clearTimeout(timer);
    } else {
      setShowAct2Title(false);
    }
  }, [act]);

  const isIdle = act === "idle" || act === "prerun";
  const isRunning = act === "act1" || act === "transition12" || act === "act2" || act === "transition2r";
  const isResolution = act === "resolution";
  const hasRun = run !== null;

  // Delay ComparisonOverlay so canvases finish settling into side-by-side first
  const [showComparison, setShowComparison] = useState(false);
  useEffect(() => {
    if (isResolution) {
      const timer = setTimeout(() => setShowComparison(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowComparison(false);
    }
  }, [isResolution]);

  // ROI nudge toast — 5s after comparison overlay appears
  const [showRoiNudge, setShowRoiNudge] = useState(false);
  const roiNudgeDismissedRef = useRef(false);
  useEffect(() => {
    if (showComparison && !roiInputs && !roiNudgeDismissedRef.current) {
      const timer = setTimeout(() => setShowRoiNudge(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowRoiNudge(false);
    }
  }, [showComparison, roiInputs]);

  const dismissRoiNudge = () => {
    roiNudgeDismissedRef.current = true;
    setShowRoiNudge(false);
    trackEvent("roi_nudge_dismissed");
  };

  // Deep-link autoplay: check sessionStorage hint
  const autoplayHandled = useRef(false);
  useEffect(() => {
    if (autoplayHandled.current) return;
    const hint = sessionStorage.getItem("aas-autoplay");
    if (hint === "results" && activeScenario && isIdle && isWide) {
      autoplayHandled.current = true;
      sessionStorage.removeItem("aas-autoplay");
      // Start cinematic then immediately skip to results
      const timer = setTimeout(() => {
        startCinematic();
        // Give a small tick for the runs to be computed, then skip
        setTimeout(() => skipToResults(), 100);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeScenario, isIdle, isWide, startCinematic, skipToResults]);

  // Toggle cinematicActive in UI store for CtaBar auto-hide
  useEffect(() => {
    const isActive = act === "act1" || act === "transition12" || act === "act2" || act === "transition2r";
    useUIStore.setState({ cinematicActive: isActive });
    return () => useUIStore.setState({ cinematicActive: false });
  }, [act]);

  // For mobile fallback
  const isSplitRunning = dualRunPhase === "split-running";
  const isDualComplete = dualRunPhase === "accumulate-done";
  const isSequentialRunning = dualRunPhase === "today-running" || dualRunPhase === "today-done" || dualRunPhase === "accumulate-running";
  const isMobileRunning = isSplitRunning || isSequentialRunning;

  const dualComparison = useMemo(() => {
    if (todayRun && accumulateRun) {
      return generateDualComparison(
        todayRun,
        accumulateRun,
        activeScenario?.beforeMetrics,
        roiInputs,
        activeScenario?.regulatoryContext,
      );
    }
    return null;
  }, [todayRun, accumulateRun, activeScenario?.beforeMetrics, roiInputs, activeScenario?.regulatoryContext]);

  // Compliance callouts — build from today's events + scenario regulatory context
  const todayViolationCallouts = useMemo<ComplianceCalloutItem[]>(() => {
    if (!activeScenario?.regulatoryContext?.length) return [];
    const violationEventIds = todayEvents
      .filter((e) => e.metadata?.complianceViolation)
      .map((e) => e.id);
    if (violationEventIds.length === 0) return [];
    return buildViolationCallouts(activeScenario.regulatoryContext, violationEventIds);
  }, [todayEvents, activeScenario?.regulatoryContext]);

  const accSafeguardCallouts = useMemo<ComplianceCalloutItem[]>(() => {
    if (!activeScenario?.regulatoryContext?.length) return [];
    return buildSafeguardCallouts(activeScenario.regulatoryContext);
  }, [activeScenario?.regulatoryContext]);

  // Track which callouts are currently visible based on event progress
  const visibleViolations = useMemo(() => {
    if (act !== "act1" || progress.todayIndex < 0) return [];
    const violationEvents = todayEvents
      .slice(0, progress.todayIndex + 1)
      .filter((e) => e.metadata?.complianceViolation);
    const count = Math.min(violationEvents.length, todayViolationCallouts.length);
    return todayViolationCallouts.slice(0, count);
  }, [act, progress.todayIndex, todayEvents, todayViolationCallouts]);

  const visibleSafeguards = useMemo(() => {
    if (act !== "act2") return [];
    // Show safeguards progressively during act2
    const pct = progress.accTotal > 0 ? (progress.accIndex + 1) / progress.accTotal : 0;
    const count = Math.ceil(pct * accSafeguardCallouts.length);
    return accSafeguardCallouts.slice(0, count);
  }, [act, progress.accIndex, progress.accTotal, accSafeguardCallouts]);

  const todayViolationCount = useMemo(() => {
    if (!todayRun) return 0;
    return todayRun.events.filter((e) => e.metadata?.complianceViolation).length;
  }, [todayRun]);

  // Build comparison annotations for Act 2 narrative ticker
  const accComparisons = useMemo(() => {
    if (progress.todayFrictionDescriptions.length === 0 || accEvents.length === 0) return undefined;
    const result: Record<number, string> = {};
    accEvents.forEach((evt, i) => {
      const cmp = generateComparativeNarrative(evt, actors, progress.todayFrictionDescriptions);
      if (cmp.comparison) {
        result[i] = cmp.comparison;
      }
    });
    return Object.keys(result).length > 0 ? result : undefined;
  }, [accEvents, actors, progress.todayFrictionDescriptions]);

  const handleToggleMode = (mode: "today" | "accumulate") => {
    if (isMobileRunning) return;
    switchToMode(mode);
  };

  const handleReset = () => {
    resetDualRun();
    setDualRunPhase("idle");
    resetCinematic();
  };

  // ---- Desktop: Cinematic layout ----
  if (isWide) {
    const showNarrativeToday = act === "act1" || act === "resolution";
    const showNarrativeAcc = act === "act2" || act === "resolution";
    const showScoreboard = act !== "idle";
    const showAccCanvas = act === "transition12" || act === "act2" || act === "transition2r" || act === "resolution";
    const showPlayback = act !== "idle";

    return (
      <div className="flex flex-col h-screen overflow-hidden bg-bg relative">
        <TopBar compact={isRunning || isResolution} />
        {isIdle && <FlowBreadcrumb />}

        {/* Control bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface/40 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {isIdle && activeScenario && (
              <span className="text-xs text-text-subtle truncate">
                {activeScenario.defaultWorkflow.name}
              </span>
            )}
            {!isIdle && <ActStepper act={act} />}
          </div>

          <div className="flex items-center gap-2">
            {isRunning && (
              <Button onClick={skipToResults} size="sm" variant="tertiary">
                <FastForward size={14} weight="fill" className="mr-1.5" />
                Skip to Results
              </Button>
            )}
            {isResolution && (
              <Button onClick={handleReset} size="sm" variant="tertiary">
                <ArrowCounterClockwise size={14} weight="bold" className="mr-1.5" />
                Reset
              </Button>
            )}
            {isIdle && (
              <>
                <Button onClick={openROIDrawer} size="sm" variant="tertiary">
                  <Calculator size={14} weight="bold" className="mr-1.5" />
                  Customize Your Numbers
                </Button>
                <Button onClick={handleStart} size="sm">
                  <Lightning size={14} weight="fill" className="mr-1.5" />
                  Run Comparison
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Scenario briefing — visible during idle only */}
        <AnimatePresence>
          {isIdle && activeScenario && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden border-b border-border/40 bg-surface/20 backdrop-blur-sm"
            >
              <div className="px-5 py-2.5 flex items-start gap-4 max-w-[1200px]">
                <div className="flex-1 min-w-0">
                  <p className="text-[0.8rem] text-text-secondary leading-relaxed">
                    {activeScenario.description}
                  </p>
                  {activeScenario.prompt && (
                    <p className="text-[0.75rem] text-text-muted italic mt-1">
                      {activeScenario.prompt}
                    </p>
                  )}
                </div>
                {activeScenario.beforeMetrics && (
                  <div className="shrink-0 flex items-center gap-3 text-[0.65rem] text-text-muted">
                    <span><span className="font-bold text-danger tabular-nums">{activeScenario.beforeMetrics.manualTimeHours}h+</span> manual time</span>
                    <span><span className="font-bold text-danger tabular-nums">{activeScenario.beforeMetrics.approvalSteps}</span> approval steps</span>
                    <span><span className="font-bold text-warning tabular-nums">{activeScenario.beforeMetrics.auditGapCount}</span> audit gaps</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main cinematic area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Backdrop scrim */}
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ zIndex: 15 }}
            variants={scrimVariants}
            animate={act}
            transition={{ duration: 0.6 }}
          />

          {/* Today canvas */}
          <motion.div
            className="absolute overflow-hidden rounded-lg"
            style={{ zIndex: 10 }}
            variants={todayVariants}
            animate={act}
            transition={springTransition}
          >
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 relative min-w-0">
                <SimulatorCanvas
                  storeApi={todayStoreRef.current}
                  readOnly
                  tintColor="#EF4444"
                  label="Today's Process"
                  fitViewTrigger={fitViewTrigger}
                  focusNodeId={act === "act1" && progress.todayIndex >= 0 ? todayEvents[progress.todayIndex]?.actorId : undefined}
                />
                {act === "act1" && todayEvents.length > 0 && progress.todayIndex >= 0 && (
                  <EventDetailBanner
                    event={todayEvents[progress.todayIndex] ?? null}
                    stepIndex={progress.todayIndex}
                    totalSteps={progress.todayTotal}
                    actors={actors}
                    side="today"
                    currentTimestamp={todayEvents[progress.todayIndex]?.timestamp ?? 0}
                    totalTimestamp={todayEvents[todayEvents.length - 1]?.timestamp ?? 1}
                    manualTimeHours={activeScenario?.beforeMetrics?.manualTimeHours}
                  />
                )}
                {act === "act1" && visibleViolations.length > 0 && (
                  <ComplianceCalloutStack violations={visibleViolations} safeguards={[]} />
                )}
              </div>
              {showNarrativeToday && todayEvents.length > 0 && (
                <NarrativeTicker
                  side="today"
                  events={todayEvents}
                  currentIndex={progress.todayIndex}
                  isComplete={progress.todayComplete}
                  beforeMetrics={activeScenario?.beforeMetrics}
                  actors={actors}
                  manualSteps={progress.todayManualSteps}
                />
              )}
            </div>
          </motion.div>

          {/* Accumulate canvas */}
          <AnimatePresence>
            {showAccCanvas && (
              <motion.div
                className="absolute overflow-hidden rounded-lg"
                style={{ zIndex: 20 }}
                variants={accVariants}
                initial="act1"
                animate={act}
                exit="act1"
                transition={springTransition}
              >
                <div className="w-full h-full flex flex-col bg-bg rounded-[inherit]">
                  <div className="flex-1 relative min-w-0">
                    <SimulatorCanvas
                      storeApi={accStoreRef.current}
                      readOnly
                      tintColor="#22C55E"
                      label="With Accumulate"
                      fitViewTrigger={fitViewTrigger}
                      focusNodeId={act === "act2" && progress.accIndex >= 0 ? accEvents[progress.accIndex]?.actorId : undefined}
                    />
                    {act === "act2" && accEvents.length > 0 && progress.accIndex >= 0 && (
                      <EventDetailBanner
                        event={accEvents[progress.accIndex] ?? null}
                        stepIndex={progress.accIndex}
                        totalSteps={progress.accTotal}
                        actors={actors}
                        side="accumulate"
                        currentTimestamp={accEvents[progress.accIndex]?.timestamp ?? 0}
                        totalTimestamp={accEvents[accEvents.length - 1]?.timestamp ?? 1}
                      />
                    )}
                    {act === "act2" && visibleSafeguards.length > 0 && (
                      <ComplianceCalloutStack violations={[]} safeguards={visibleSafeguards} />
                    )}
                    <AnimatePresence>
                      {progress.accComplete && !progress.todayComplete && <VictoryFlash />}
                    </AnimatePresence>
                  </div>
                  {showNarrativeAcc && accEvents.length > 0 && (
                    <NarrativeTicker
                      side="accumulate"
                      events={accEvents}
                      currentIndex={progress.accIndex}
                      isComplete={progress.accComplete}
                      actors={actors}
                      comparisons={accComparisons}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating scoreboard */}
          {showScoreboard && (
            <motion.div
              className="absolute right-3 top-3"
              style={{ zIndex: 25 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SplitScreenScoreboard
                progress={progress}
                beforeMetrics={activeScenario?.beforeMetrics}
              />
            </motion.div>
          )}

          {/* Act 1 summary interstitial — during transition12 */}
          <AnimatePresence>
            {act === "transition12" && activeScenario?.beforeMetrics && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 30 }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl px-8 py-5 max-w-md text-center shadow-2xl">
                  <div className="text-[0.65rem] font-bold uppercase tracking-widest text-danger/70 mb-2">
                    Today's Process Complete
                  </div>
                  <div className="flex items-center justify-center gap-6 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-danger tabular-nums">{activeScenario.beforeMetrics.manualTimeHours}+</div>
                      <div className="text-[0.6rem] text-text-muted">hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-danger tabular-nums">{progress.todayManualSteps}</div>
                      <div className="text-[0.6rem] text-text-muted">manual steps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning tabular-nums">{activeScenario.beforeMetrics.auditGapCount}</div>
                      <div className="text-[0.6rem] text-text-muted">audit gaps</div>
                    </div>
                  </div>
                  <div className="text-[0.7rem] text-text-muted">
                    Now watch the same scenario with Accumulate...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Act 2 title card — shown briefly at start of act2 */}
          <AnimatePresence>
            {showAct2Title && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 30 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-surface/80 backdrop-blur-md border border-success/20 rounded-2xl px-8 py-4 text-center shadow-2xl">
                  <div className="text-[0.65rem] font-bold uppercase tracking-widest text-success/70 mb-1">
                    Act 2
                  </div>
                  <div className="text-sm font-semibold text-success">
                    With Accumulate
                  </div>
                  <div className="text-[0.65rem] text-text-muted mt-1">
                    Same scenario, policy-driven automation
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comparison overlay (during resolution, delayed for canvas settle) */}
          <AnimatePresence>
            {showComparison && dualComparison && (
              <ComparisonOverlay
                comparisons={dualComparison}
                regulatoryContext={activeScenario?.regulatoryContext}
                todayViolationCount={todayViolationCount}
                onContinue={() => navigateTo("scenario-selector")}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Bottom: Playback controls */}
        {showPlayback && (
          <div className="border-t border-border bg-surface/60 backdrop-blur-sm px-4 py-2 flex items-center gap-4">
            <PlaybackControls
              splitPlayback={{
                pause,
                resume,
                seekTo,
                progress,
                actLabel: actLabel(act),
              }}
            />

            <AnimatePresence>
              {isResolution && accumulateRun?.outcome === "approved" && (
                <ProofStamp />
              )}
            </AnimatePresence>
          </div>
        )}

        <ROICalculatorDrawer />

        {/* ROI Nudge Toast */}
        <AnimatePresence>
          {showRoiNudge && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-20 right-4 z-[55] bg-surface/95 backdrop-blur-md border border-primary/20 rounded-xl px-4 py-3 shadow-xl max-w-[280px]"
            >
              <button
                onClick={dismissRoiNudge}
                className="absolute top-2 right-2 text-text-subtle hover:text-text transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
              <p className="text-xs text-text-muted pr-4">
                See projected savings for your organization
              </p>
              <button
                onClick={() => {
                  trackEvent("roi_nudge_clicked");
                  dismissRoiNudge();
                  openROIDrawer();
                }}
                className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                Calculate Your ROI &rarr;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti on resolution */}
        <ConfettiCelebration trigger={showComparison} />

        <Suspense fallback={null}>
          {guidedTourActive && <GuidedTour />}
        </Suspense>
      </div>
    );
  }

  // ---- Mobile: fallback to sequential single-canvas layout ----
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg relative">
      <TopBar />

      {/* Mode indicator */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <DualRunToggle
            activeMode={activeMode}
            onToggle={handleToggleMode}
            todayComplete={todayRun !== null}
            accumulateComplete={accumulateRun !== null}
            disabled={isMobileRunning}
          />

          {isMobileRunning && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-text-muted"
            >
              {dualRunPhase === "today-running" ? "Running today's process..." : "Running with Accumulate..."}
            </motion.span>
          )}

          {dualRunPhase === "today-done" && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-warning"
            >
              Today's process complete — transitioning to Accumulate...
            </motion.span>
          )}
        </div>

        {status === SimulationStatus.Idle && dualRunPhase === "idle" && (
          <div className="flex items-center gap-2">
            <Button onClick={handleStart} size="sm">
              <Lightning size={14} weight="fill" className="mr-1.5" />
              Run Comparison
            </Button>
          </div>
        )}
      </div>

      {/* Main simulation area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative min-w-0">
          <SimulatorCanvas />

          <AnimatePresence>
            {isDualComplete && dualComparison && (
              <ComparisonOverlay
                comparisons={dualComparison}
                regulatoryContext={activeScenario?.regulatoryContext}
                todayViolationCount={todayViolationCount}
                onContinue={() => navigateTo("scenario-selector")}
              />
            )}
          </AnimatePresence>
        </div>

        {hasRun && (
          <div className="w-[280px] border-l border-border bg-surface/40 overflow-y-auto shrink-0 hidden lg:block">
            <div className="px-3 py-2 border-b border-border/50">
              <span className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">
                Event Stream
              </span>
            </div>
            <div className="p-3">
              <SimulationTimeline />
            </div>
          </div>
        )}
      </div>

      {hasRun && (
        <div className="border-t border-border bg-surface/60 backdrop-blur-sm px-4 py-2 flex items-center gap-4">
          <PlaybackControls />

          {status === SimulationStatus.Completed && run && (
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                run.outcome === "approved"
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-danger/10 text-danger border border-danger/20"
              }`}
            >
              {activeMode === "today" ? "Today: " : "Accumulate: "}
              {run.outcome === "approved" ? "Approved" : "Denied"}
            </div>
          )}

          <AnimatePresence>
            {status === SimulationStatus.Completed && run?.outcome === "approved" && activeMode === "accumulate" && (
              <ProofStamp />
            )}
          </AnimatePresence>

          {status === SimulationStatus.Idle && dualRunPhase === "idle" && activeScenario && (
            <div className="flex-1 text-xs text-text-subtle truncate">
              {activeScenario.defaultWorkflow.name}
            </div>
          )}
        </div>
      )}

      <Suspense fallback={null}>
        {guidedTourActive && <GuidedTour />}
      </Suspense>
    </div>
  );
}
