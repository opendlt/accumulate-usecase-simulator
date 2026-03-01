import { motion } from "framer-motion";
import {
  ShieldCheck,
  CurrencyCircleDollar,
  Heartbeat,
  Cloud,
  Truck,
  CubeFocus,
} from "@phosphor-icons/react";
import type { Industry } from "@/types/industry";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck size={32} weight="duotone" />,
  CurrencyCircleDollar: <CurrencyCircleDollar size={32} weight="duotone" />,
  Heartbeat: <Heartbeat size={32} weight="duotone" />,
  Cloud: <Cloud size={32} weight="duotone" />,
  Truck: <Truck size={32} weight="duotone" />,
  CubeFocus: <CubeFocus size={32} weight="duotone" />,
};

interface IndustryCardProps {
  industry: Industry;
  index: number;
  onClick: () => void;
  onHover?: () => void;
}

export function IndustryCard({ industry, index, onClick, onHover }: IndustryCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={cn(
        "group relative bg-surface/60 backdrop-blur-sm border border-overlay/[0.06] rounded-[14px] p-6 text-left",
        "transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] hover:-translate-y-1 cursor-pointer"
      )}
    >
      <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-primary/10 via-transparent to-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <span
          className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-colors duration-300"
          style={{
            backgroundColor: `${industry.color}15`,
            color: industry.color,
          }}
        >
          {iconMap[industry.icon]}
        </span>

        <h3 className="font-heading text-sm font-semibold text-text mb-1">
          {industry.name}
        </h3>
        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
          {industry.description}
        </p>

        <div className="mt-3 flex items-center gap-1 text-[0.625rem] text-text-subtle">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: industry.color }}
          />
          {industry.scenarioIds.length} scenarios
        </div>
      </div>
    </motion.button>
  );
}
