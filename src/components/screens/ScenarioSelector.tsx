import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import { GlowOrb } from "@/components/shared/GlowOrb";
import { ScenarioCard } from "@/components/shared/ScenarioCard";
import { OrgPreview } from "@/components/shared/OrgPreview";
import { FlowBreadcrumb } from "@/components/shared/FlowBreadcrumb";
import { useUIStore, useScenarioStore, useCanvasStore, useSimulationStore } from "@/store";
import { loadIndustryScenarios } from "@/scenarios";
import type { ScenarioTemplate } from "@/types/scenario";

export function ScenarioSelector() {
  const { selectedIndustry, navigateTo, setDualRunPhase } = useUIStore();
  const { activeIndustry, loadScenarioForDualRun } = useScenarioStore();
  const { loadScenario } = useCanvasStore();
  const { resetDualRun } = useSimulationStore();

  const [scenarios, setScenarios] = useState<ScenarioTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedIndustry) {
      setScenarios([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadIndustryScenarios(selectedIndustry).then((s) => {
      setScenarios(s);
      setLoading(false);
    });
  }, [selectedIndustry]);

  const previewScenario = scenarios[0] ?? null;

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    loadScenarioForDualRun(scenario);
    loadScenario(scenario);
    // Reset simulation state so the sim screen starts fresh
    resetDualRun();
    setDualRunPhase("idle");
    navigateTo("simulation");
  };

  if (!selectedIndustry || !activeIndustry) {
    navigateTo("industry-picker");
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg overflow-hidden">
      <FlowBreadcrumb />
      <div className="flex-1 flex overflow-hidden relative">
      <GlowOrb color="#3B82F6" size={400} className="top-0 left-0 -translate-x-1/2 -translate-y-1/2" />

      {/* Left: Org Preview */}
      <div className="hidden md:flex flex-1 items-center justify-center border-r border-border p-6 min-w-0">
        {previewScenario ? (
          <div className="w-full h-full max-h-[500px] rounded-[14px] border border-overlay/[0.06] overflow-hidden bg-bg/50">
            <OrgPreview scenario={previewScenario} className="w-full h-full" />
          </div>
        ) : (
          <div className="text-xs text-text-subtle">
            {loading ? "" : "No scenarios available"}
          </div>
        )}
      </div>

      {/* Right: Scenario selector */}
      <div className="w-full md:w-[400px] lg:w-[440px] shrink-0 flex flex-col overflow-y-auto p-6">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigateTo("industry-picker")}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-4 transition-colors cursor-pointer self-start"
        >
          <ArrowLeft size={14} />
          Change industry
        </motion.button>

        {/* Industry header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeIndustry.color }}
            />
            <span className="text-[0.65rem] text-text-subtle font-medium uppercase tracking-wider">
              {activeIndustry.name}
            </span>
          </div>
          <h2 className="font-heading text-lg font-bold text-text mb-1">
            What happens when...
          </h2>
          <p className="text-xs text-text-muted">
            Pick a scenario to run a side-by-side comparison.
          </p>
        </motion.div>

        {/* Scenario cards — skeleton while loading */}
        <div className="space-y-3 flex-1">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[88px] rounded-[14px] bg-surface/60 border border-overlay/[0.06] animate-pulse"
                />
              ))
            : scenarios.map((scenario, i) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  index={i}
                  onClick={() => handleSelectScenario(scenario.id)}
                />
              ))}
        </div>

        {!loading && scenarios.length === 0 && (
          <div className="text-xs text-text-subtle text-center py-8">
            No scenarios found for this industry.
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
