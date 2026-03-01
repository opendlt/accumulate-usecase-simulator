import { useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SimulationEvent } from "@/types/simulation";
import type { Actor } from "@/types/organization";
import type { ComparisonMetrics } from "@/types/scenario";
import { eventToNarrative, completionSummary } from "@/lib/narrative";

interface NarrativeTickerProps {
  side: "today" | "accumulate";
  events: SimulationEvent[];
  currentIndex: number;
  isComplete: boolean;
  beforeMetrics?: ComparisonMetrics;
  actors: Actor[];
  manualSteps?: number;
  /** Optional comparison annotations keyed by event index. */
  comparisons?: Record<number, string>;
}

export function NarrativeTicker({
  side,
  events,
  currentIndex,
  isComplete,
  beforeMetrics,
  actors,
  manualSteps,
  comparisons,
}: NarrativeTickerProps) {
  const visibleLines = useMemo(() => {
    const getComplianceLabel = (evt: SimulationEvent): string | undefined => {
      const cv = evt.metadata?.complianceViolation as { displayName?: string; fineRange?: string } | undefined;
      if (!cv) return undefined;
      return `${cv.displayName} \u2014 potential fine: ${cv.fineRange}`;
    };

    if (isComplete) {
      // Show last event + summary
      const lastEvt = events[events.length - 1];
      const last = lastEvt
        ? [{
            ...eventToNarrative(lastEvt, actors, side),
            eventIndex: events.length - 1,
            complianceLabel: getComplianceLabel(lastEvt),
          }]
        : [];
      const summary = {
        ...completionSummary(side, beforeMetrics, manualSteps),
        eventIndex: -1,
        complianceLabel: undefined as string | undefined,
      };
      return [...last, summary];
    }

    if (currentIndex < 0) return [];

    // Show only the current event
    const evt = events[currentIndex];
    if (!evt) return [];
    return [{
      ...eventToNarrative(evt, actors, side),
      eventIndex: currentIndex,
      complianceLabel: getComplianceLabel(evt),
    }];
  }, [events, currentIndex, isComplete, side, actors, beforeMetrics, manualSteps]);

  // Build screen reader announcement text from current visible lines
  const announcement = useMemo(() => {
    return visibleLines.map((line) => {
      let text = line.text;
      if (line.complianceLabel) text += ` — ${line.complianceLabel}`;
      return text;
    }).join(". ");
  }, [visibleLines]);

  // Use a ref to alternate key so aria-live always announces even if text is similar
  const announceKey = useRef(0);
  useEffect(() => {
    announceKey.current += 1;
  }, [announcement]);

  if (visibleLines.length === 0) return null;

  return (
    <div
      className="h-[72px] border-t border-border/40 bg-surface/40 backdrop-blur-sm px-4 py-2 overflow-hidden flex flex-col justify-end gap-1"
    >
      {/* Screen reader live region — visually hidden */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        key={announceKey.current}
      >
        {side === "today" ? "Today's process: " : "With Accumulate: "}
        {announcement}
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {visibleLines.map((line, i) => {
          const comparison =
            comparisons && line.eventIndex >= 0
              ? comparisons[line.eventIndex]
              : undefined;
          return (
            <motion.div
              key={`${currentIndex}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-[0.8rem] leading-snug line-clamp-2"
              style={{ color: line.color ?? "var(--text-muted)" }}
              aria-hidden="true"
            >
              <TypewriterText text={line.text} />
              {line.complianceLabel && (
                <span className="ml-2 text-[0.65rem] text-red-400/80 font-medium">
                  {line.complianceLabel}
                </span>
              )}
              {comparison && (
                <span className="ml-2 text-[0.7rem] text-success/70 italic">
                  {comparison}
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  return (
    <motion.span
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="inline-block"
    >
      {text}
    </motion.span>
  );
}
