import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Buildings, CurrencyCircleDollar, Warning } from "@phosphor-icons/react";
import { useUIStore, useScenarioStore, useCanvasStore } from "@/store";
import { loadAllScenarios } from "@/scenarios";
import type { ScenarioTemplate } from "@/types/scenario";
import { GlowOrb } from "@/components/shared/GlowOrb";

const iconMap: Record<string, React.ReactNode> = {
  Buildings: <Buildings size={28} />,
  CurrencyCircleDollar: <CurrencyCircleDollar size={28} />,
  Warning: <Warning size={28} />,
};

export function LandingOverlay() {
  const { setShowLandingOverlay, setGuidedTourActive } = useUIStore();
  const { setActiveScenario } = useScenarioStore();
  const { loadScenario } = useCanvasStore();

  const [scenarios, setScenarios] = useState<ScenarioTemplate[]>([]);

  useEffect(() => {
    loadAllScenarios().then(setScenarios);
  }, []);

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setActiveScenario(scenario);
      loadScenario(scenario);
      setShowLandingOverlay(false);
      // Check if tour was already completed
      if (!localStorage.getItem("aas-tour-completed")) {
        setGuidedTourActive(true);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur-md"
    >
      <GlowOrb color="#3B82F6" size={600} className="top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <GlowOrb color="#8B5CF6" size={400} className="bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-[0.04]" />

      <div className="relative z-10 max-w-3xl w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          {/* Logo */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M8 6V10" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 8H10" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            <span className="gradient-text">See how programmable authority works.</span>
          </h1>
          <p className="text-text-muted text-sm mt-3 max-w-md mx-auto">
            Pick a scenario to simulate. Model organizations, define governance policies, and see
            verifiable evidence artifacts.
          </p>
        </motion.div>

        {/* Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario, i) => (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => handleSelectScenario(scenario.id)}
              className="group relative bg-surface/60 backdrop-blur-sm border border-overlay/[0.06] rounded-[14px] p-5 text-left transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] hover:-translate-y-1 cursor-pointer"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-primary/10 via-transparent to-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-4 transition-colors duration-300 group-hover:bg-primary/20">
                  {iconMap[scenario.icon]}
                </span>

                <h3 className="font-heading text-sm font-semibold text-text">
                  {scenario.name}
                </h3>
                <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-3">
                  {scenario.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Blank canvas option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => {
              const customScenario: ScenarioTemplate = {
                id: "custom",
                name: "Custom Organization",
                description: "Build your own authority structure",
                icon: "Buildings",
                actors: [],
                policies: [],
                edges: [],
                defaultWorkflow: {
                  name: "Custom Approval",
                  initiatorRoleId: "",
                  targetAction: "Custom approval request",
                  description: "Custom approval workflow",
                },
                beforeMetrics: { manualTimeHours: 4, riskExposureDays: 2, auditGapCount: 2, approvalSteps: 3 },
              };
              setActiveScenario(customScenario);
              setShowLandingOverlay(false);
            }}
            className="text-xs text-text-subtle hover:text-primary transition-colors cursor-pointer"
          >
            Or start with a blank canvas
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
