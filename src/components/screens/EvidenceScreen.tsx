import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import { TopBar } from "@/components/layout/TopBar";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { DualRunToggle } from "@/components/shared/DualRunToggle";
import { FlowBreadcrumb } from "@/components/shared/FlowBreadcrumb";
import { useSimulationStore, useUIStore } from "@/store";

export function EvidenceScreen() {
  const { activeMode, todayRun, accumulateRun, evidence, switchToMode } = useSimulationStore();
  const { navigateTo } = useUIStore();

  if (!evidence && !todayRun && !accumulateRun) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-bg">
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-text-muted">Loading evidence data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">
      <TopBar />
      <FlowBreadcrumb />

      {/* Sub-header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface/40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo("simulation")}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Simulation
          </button>

          {todayRun && accumulateRun && (
            <DualRunToggle
              activeMode={activeMode}
              onToggle={switchToMode}
              todayComplete
              accumulateComplete
            />
          )}
        </div>

        <span className="text-[0.65rem] text-text-subtle font-medium uppercase tracking-wider">
          Evidence Deep Dive
        </span>
      </div>

      {/* Main evidence content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-5xl mx-auto p-6">
          <EvidencePanel />
        </div>
      </motion.div>
    </div>
  );
}
