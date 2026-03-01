import { motion } from "framer-motion";
import { Lightning } from "@phosphor-icons/react";
import type { ScenarioTemplate } from "@/types/scenario";
import { cn } from "@/lib/utils";

interface ScenarioCardProps {
  scenario: ScenarioTemplate;
  index: number;
  isActive?: boolean;
  onClick: () => void;
}

export function ScenarioCard({ scenario, index, isActive, onClick }: ScenarioCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 + index * 0.06 }}
      onClick={onClick}
      className={cn(
        "group w-full text-left p-4 rounded-[14px] border transition-all duration-300 cursor-pointer relative overflow-hidden",
        isActive
          ? "border-primary/40 bg-primary/5 shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]"
          : "border-overlay/[0.06] bg-surface/40 hover:border-primary/20 hover:bg-surface/60 hover:-translate-y-0.5 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]"
      )}
    >
      <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-primary/10 via-transparent to-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <p className="relative text-xs font-medium text-text leading-relaxed">
        {scenario.prompt ?? `What happens when ${scenario.defaultWorkflow.description.toLowerCase()}?`}
      </p>

      <div className="relative mt-2 flex items-center justify-between">
        <span className="text-[0.6rem] text-text-subtle">
          {scenario.actors.length} actors &middot; {scenario.policies.length} {scenario.policies.length === 1 ? "policy" : "policies"}
        </span>
        <span className="inline-flex items-center gap-1 text-[0.6rem] text-primary/70">
          <Lightning size={10} weight="fill" />
          ~25s
        </span>
      </div>
    </motion.button>
  );
}
