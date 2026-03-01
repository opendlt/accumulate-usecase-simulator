import { motion } from "framer-motion";
import { ArrowLeft, PencilSimpleLine } from "@phosphor-icons/react";
import { GlowOrb } from "@/components/shared/GlowOrb";
import { IndustryCard } from "@/components/shared/IndustryCard";
import { FlowBreadcrumb } from "@/components/shared/FlowBreadcrumb";
import { useUIStore, useScenarioStore } from "@/store";
import { INDUSTRIES, getIndustryById } from "@/scenarios/industries";
import { prefetchIndustryScenarios } from "@/scenarios";
import type { IndustryId } from "@/types/industry";

export function IndustryPicker() {
  const { navigateTo, selectIndustry } = useUIStore();
  const { setActiveIndustry } = useScenarioStore();

  const handleSelect = (id: IndustryId) => {
    const industry = getIndustryById(id);
    if (!industry) return;
    selectIndustry(id);
    setActiveIndustry(industry);
    localStorage.setItem("aas-last-industry", id);
    navigateTo("scenario-selector");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg overflow-y-auto">
      <FlowBreadcrumb />
      <div className="flex-1 flex items-center justify-center relative">
      <GlowOrb color="#3B82F6" size={600} className="top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <GlowOrb color="#8B5CF6" size={400} className="bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-[0.04]" />

      <div className="relative z-10 max-w-4xl w-full px-6 py-12">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigateTo("hero")}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-heading text-xl md:text-2xl font-bold text-text mb-2">
            Choose your industry
          </h2>
          <p className="text-sm text-text-muted">
            Pick the closest match to see a tailored authorization scenario.
          </p>
        </motion.div>

        {/* Industry grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDUSTRIES.map((industry, i) => (
            <IndustryCard
              key={industry.id}
              industry={industry}
              index={i}
              onClick={() => handleSelect(industry.id)}
              onHover={() => prefetchIndustryScenarios(industry.id)}
            />
          ))}

          {/* Build Your Own card */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * INDUSTRIES.length }}
            onClick={() => navigateTo("org-builder")}
            className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-surface/20 hover:bg-surface/40 transition-all duration-300 cursor-pointer min-h-[140px]"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <PencilSimpleLine size={20} className="text-primary" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                Build Your Own
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                Model your org structure
              </div>
            </div>
          </motion.button>
        </div>
      </div>
      </div>
    </div>
  );
}
