import { motion, AnimatePresence } from "framer-motion";
import { ShieldWarning, ShieldCheck } from "@phosphor-icons/react";
import type { RegulatoryContext } from "@/types/regulatory";
import { cn } from "@/lib/utils";

interface ComplianceCalloutProps {
  violations: ComplianceCalloutItem[];
  safeguards: ComplianceCalloutItem[];
}

export interface ComplianceCalloutItem {
  id: string;
  framework: string;
  displayName: string;
  clause?: string;
  description: string;
  fineRange: string;
  severity: "critical" | "high" | "medium";
  timestamp: number;
}

export function ComplianceCalloutStack({ violations, safeguards }: ComplianceCalloutProps) {
  const items = [...violations, ...safeguards];
  if (items.length === 0) return null;

  return (
    <div className="absolute left-3 top-14 z-[25] flex flex-col gap-2 max-w-[320px] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {violations.map((v) => (
          <ComplianceCalloutBadge key={v.id} item={v} variant="violation" />
        ))}
        {safeguards.map((s) => (
          <ComplianceCalloutBadge key={s.id} item={s} variant="safeguard" />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ComplianceCalloutBadge({
  item,
  variant,
}: {
  item: ComplianceCalloutItem;
  variant: "violation" | "safeguard";
}) {
  const isViolation = variant === "violation";
  const severityColors = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "rounded-xl border backdrop-blur-md px-3 py-2.5 pointer-events-auto shadow-lg",
        isViolation
          ? "bg-red-950/80 border-red-500/20"
          : "bg-emerald-950/80 border-emerald-500/20"
      )}
    >
      <div className="flex items-start gap-2">
        {isViolation ? (
          <ShieldWarning size={16} weight="fill" className="text-red-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck size={16} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={cn(
              "text-[0.6rem] font-bold uppercase tracking-wider",
              isViolation ? "text-red-400" : "text-emerald-400"
            )}>
              {item.displayName}
            </span>
            {isViolation && (
              <span className={cn(
                "text-[0.5rem] px-1.5 py-0.5 rounded-full border font-semibold uppercase",
                severityColors[item.severity]
              )}>
                {item.severity}
              </span>
            )}
          </div>
          <p className={cn(
            "text-[0.65rem] leading-snug",
            isViolation ? "text-red-300/80" : "text-emerald-300/80"
          )}>
            {item.description}
          </p>
          {isViolation && (
            <p className="text-[0.6rem] text-red-400/70 mt-1 font-medium">
              Potential fine: {item.fineRange}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Build callout items from a scenario's regulatoryContext and a list of violation event IDs.
 */
export function buildViolationCallouts(
  regulatoryContext: RegulatoryContext[],
  violationEventIds: string[],
): ComplianceCalloutItem[] {
  return regulatoryContext.map((reg, i) => ({
    id: violationEventIds[i] ?? `violation-${i}`,
    framework: reg.framework,
    displayName: reg.displayName,
    clause: reg.clause,
    description: reg.violationDescription,
    fineRange: reg.fineRange,
    severity: reg.severity,
    timestamp: 0,
  }));
}

export function buildSafeguardCallouts(
  regulatoryContext: RegulatoryContext[],
): ComplianceCalloutItem[] {
  return regulatoryContext.map((reg, i) => ({
    id: `safeguard-${i}`,
    framework: reg.framework,
    displayName: reg.displayName,
    clause: reg.clause,
    description: reg.safeguardDescription,
    fineRange: reg.fineRange,
    severity: reg.severity,
    timestamp: 0,
  }));
}
