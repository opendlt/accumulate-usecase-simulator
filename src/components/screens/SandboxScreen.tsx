import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { SimulatorCanvas } from "@/components/canvas/SimulatorCanvas";
import { NodePalette } from "@/components/canvas/NodePalette";
import { PolicyPanel } from "@/components/policy/PolicyPanel";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { GlowOrb } from "@/components/shared/GlowOrb";
import { ResizableHandle } from "@/components/shared/ResizableHandle";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { useUIStore, useScenarioStore, useCanvasStore, useSimulationStore } from "@/store";

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

export function SandboxScreen() {
  const { showHelpDrawer, guidedTourActive, setGuidedTourActive, activeMobilePanel } = useUIStore();
  const { activeScenario } = useScenarioStore();
  const { selectedNodeId } = useCanvasStore();
  const { status } = useSimulationStore();

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

  // Auto-trigger guided tour on first visit
  useEffect(() => {
    if (!localStorage.getItem("aas-tour-completed") && !guidedTourActive) {
      const timer = setTimeout(() => setGuidedTourActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showPolicyPanel = selectedNodeId !== null && status === "idle";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg relative">
      <GlowOrb color="#3B82F6" size={600} className="-top-40 -left-40" />
      <GlowOrb color="#8B5CF6" size={400} className="-bottom-40 -right-40 opacity-[0.04]" />

      <TopBar />

      {/* Desktop / Tablet layout (md+) */}
      <div className="flex-1 flex overflow-hidden hidden md:flex">
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

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 relative">
            <SimulatorCanvas />
          </div>
          {activeScenario && (
            <div className="border-t border-border bg-surface/60 backdrop-blur-sm">
              <SimulationPanel />
            </div>
          )}
        </div>

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

      {activeScenario && (
        <div className="hidden md:block border-t border-border bg-surface/60 backdrop-blur-sm shrink-0">
          <ResizableHandle direction="vertical" onResize={handleEvidenceResize} />
          <div style={{ maxHeight: evidenceHeight }} className="overflow-y-auto" data-tour="evidence-panel">
            <EvidencePanel />
          </div>
        </div>
      )}

      {/* Mobile layout */}
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

      <Suspense fallback={null}>
        {showHelpDrawer && <HelpDrawer />}
        {guidedTourActive && <GuidedTour />}
      </Suspense>
    </div>
  );
}
