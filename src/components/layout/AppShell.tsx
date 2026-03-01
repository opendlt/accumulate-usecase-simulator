import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { TopBar } from "./TopBar";
import { SimulatorCanvas } from "@/components/canvas/SimulatorCanvas";
import { NodePalette } from "@/components/canvas/NodePalette";
import { PolicyPanel } from "@/components/policy/PolicyPanel";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { GlowOrb } from "@/components/shared/GlowOrb";
import { ResizableHandle } from "@/components/shared/ResizableHandle";
import { MobileTabBar } from "./MobileTabBar";
import { useUIStore, useScenarioStore, useCanvasStore, useSimulationStore } from "@/store";
import { getScenarioByIdAsync } from "@/scenarios";
import { getScenarioIdFromUrl } from "@/lib/url-codec";

const LandingOverlay = lazy(() =>
  import("@/components/onboarding/LandingOverlay").then((m) => ({
    default: m.LandingOverlay,
  }))
);

const HelpDrawer = lazy(() =>
  import("@/components/onboarding/HelpDrawer").then((m) => ({
    default: m.HelpDrawer,
  }))
);

const GuidedTour = lazy(() =>
  import("@/components/onboarding/GuidedTour").then((m) => ({
    default: m.GuidedTour,
  }))
);

export function AppShell() {
  const { showLandingOverlay, showHelpDrawer, guidedTourActive, setShowLandingOverlay, activeMobilePanel } = useUIStore();
  const { activeScenario, setActiveScenario } = useScenarioStore();
  const { selectedNodeId } = useCanvasStore();
  const loadScenario = useCanvasStore((s) => s.loadScenario);
  const { status } = useSimulationStore();

  // Resizable panel widths
  const [paletteWidth, setPaletteWidth] = useState(130);
  const [policyWidth, setPolicyWidth] = useState(300);
  const [evidenceHeight, setEvidenceHeight] = useState(280);

  const handlePaletteResize = useCallback((delta: number) => {
    setPaletteWidth((w) => Math.max(80, Math.min(250, w + delta)));
  }, []);

  const handlePolicyResize = useCallback((delta: number) => {
    setPolicyWidth((w) => Math.max(200, Math.min(500, w - delta)));
  }, []);

  const handleEvidenceResize = useCallback((delta: number) => {
    setEvidenceHeight((h) => Math.max(120, Math.min(500, h - delta)));
  }, []);

  // Load scenario from URL hash on mount
  useEffect(() => {
    const scenarioId = getScenarioIdFromUrl();
    if (scenarioId) {
      getScenarioByIdAsync(scenarioId).then((scenario) => {
        if (scenario) {
          setActiveScenario(scenario);
          setShowLandingOverlay(false);
        }
      });
    }
  }, [setActiveScenario, setShowLandingOverlay]);

  // Load scenario into canvas when active scenario changes
  useEffect(() => {
    if (activeScenario) {
      loadScenario(activeScenario);
    }
  }, [activeScenario, loadScenario]);

  const showPolicyPanel = selectedNodeId !== null && status === "idle";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg relative">
      {/* Background glow orbs */}
      <GlowOrb color="#3B82F6" size={600} className="-top-40 -left-40" />
      <GlowOrb color="#8B5CF6" size={400} className="-bottom-40 -right-40 opacity-[0.04]" />

      <TopBar />

      {/* Desktop / Tablet layout (md+) */}
      <div className="flex-1 flex overflow-hidden hidden md:flex">
        {/* Left: Node Palette */}
        {activeScenario && (
          <>
            <div
              className="border-r border-border bg-surface/40 shrink-0 overflow-y-auto hidden md:block"
              style={{ width: paletteWidth }}
            >
              <NodePalette />
            </div>
            <ResizableHandle direction="horizontal" onResize={handlePaletteResize} />
          </>
        )}

        {/* Center: Canvas + Simulation Runner */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 relative">
            <SimulatorCanvas />
          </div>

          {/* Simulation Panel (bottom of canvas area) */}
          {activeScenario && (
            <div className="border-t border-border bg-surface/60 backdrop-blur-sm">
              <SimulationPanel />
            </div>
          )}
        </div>

        {/* Right: Policy Panel (desktop inline, tablet slide-out) */}
        {showPolicyPanel && (
          <>
            <ResizableHandle direction="horizontal" onResize={handlePolicyResize} />
            <div
              className="border-l border-border bg-surface/40 shrink-0 overflow-y-auto hidden lg:block"
              style={{ width: policyWidth }}
              data-tour="policy-panel"
            >
              <PolicyPanel />
            </div>
            {/* Tablet: slide-out drawer */}
            <div
              className="fixed right-0 top-14 bottom-0 border-l border-border bg-surface/95 backdrop-blur-md shrink-0 overflow-y-auto z-30 lg:hidden"
              style={{ width: 300 }}
              data-tour="policy-panel"
            >
              <PolicyPanel />
            </div>
          </>
        )}
      </div>

      {/* Bottom: Evidence Panel (desktop/tablet) */}
      {activeScenario && (
        <div className="hidden md:block border-t border-border bg-surface/60 backdrop-blur-sm shrink-0">
          <ResizableHandle direction="vertical" onResize={handleEvidenceResize} />
          <div style={{ maxHeight: evidenceHeight }} className="overflow-y-auto" data-tour="evidence-panel">
            <EvidencePanel />
          </div>
        </div>
      )}

      {/* Mobile layout (below md) */}
      <div className="flex-1 flex flex-col overflow-hidden md:hidden">
        <div className="flex-1 overflow-y-auto">
          {activeMobilePanel === "canvas" && (
            <div className="h-full relative">
              <SimulatorCanvas />
            </div>
          )}
          {activeMobilePanel === "policy" && (
            <div data-tour="policy-panel">
              {selectedNodeId ? <PolicyPanel /> : (
                <div className="text-xs text-text-subtle text-center py-10">
                  Select a node on the canvas to edit its policy.
                </div>
              )}
            </div>
          )}
          {activeMobilePanel === "simulation" && (
            <div>
              {activeScenario ? <SimulationPanel /> : (
                <div className="text-xs text-text-subtle text-center py-10">
                  Select a scenario first.
                </div>
              )}
            </div>
          )}
          {activeMobilePanel === "evidence" && (
            <div data-tour="evidence-panel">
              <EvidencePanel />
            </div>
          )}
        </div>
        <MobileTabBar />
      </div>

      {/* Overlays */}
      <Suspense fallback={null}>
        {showLandingOverlay && <LandingOverlay />}
        {showHelpDrawer && <HelpDrawer />}
        {guidedTourActive && <GuidedTour />}
      </Suspense>
    </div>
  );
}
