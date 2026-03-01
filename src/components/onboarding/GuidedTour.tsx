import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore, useCanvasStore } from "@/store";

interface TourStep {
  target: string;
  title: string;
  description: string;
}

const STEPS: TourStep[] = [
  {
    target: ".react-flow",
    title: "Your Authority Map",
    description: "Bottlenecks become immediately visible. See how authority flows through your organization.",
  },
  {
    target: ".react-flow__node",
    title: "Every Decision Maker",
    description: "Click any node to see approval thresholds and delegation rules.",
  },
  {
    target: "[data-tour='policy-panel']",
    title: "Programmable Governance",
    description: "Authority rules are enforced automatically instead of via email chains.",
  },
  {
    target: "[data-tour='run-button']",
    title: "See the Difference",
    description: "Most organizations see 80%+ time reduction when comparing today's process to Accumulate.",
  },
  {
    target: "[data-tour='evidence-panel']",
    title: "Audit-Ready Proof",
    description: "Auditors can independently verify every authorization — no more manual evidence gathering.",
  },
];

export function GuidedTour() {
  const { guidedTourStep, setGuidedTourStep, setGuidedTourActive } = useUIStore();
  const { updateNodeHighlight, nodes } = useCanvasStore();
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = STEPS[guidedTourStep];

  // Position tooltip near target element
  useEffect(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (el) {
      setRect(el.getBoundingClientRect());
    } else {
      setRect(null);
    }
  }, [step, guidedTourStep]);

  // Highlight first node on step 2 (Actors step)
  useEffect(() => {
    if (guidedTourStep === 1 && nodes.length > 0 && nodes[0]) {
      updateNodeHighlight(nodes[0].id, true);
      return () => {
        if (nodes[0]) {
          updateNodeHighlight(nodes[0].id, false);
        }
      };
    }
  }, [guidedTourStep, nodes, updateNodeHighlight]);

  const finish = useCallback(() => {
    localStorage.setItem("aas-tour-completed", "true");
    setGuidedTourActive(false);
    setGuidedTourStep(0);
  }, [setGuidedTourActive, setGuidedTourStep]);

  const next = useCallback(() => {
    if (guidedTourStep >= STEPS.length - 1) {
      finish();
    } else {
      setGuidedTourStep(guidedTourStep + 1);
    }
  }, [guidedTourStep, setGuidedTourStep, finish]);

  if (!step) return null;

  // Calculate tooltip position
  const tooltipTop = rect ? rect.bottom + 12 : 200;
  const tooltipLeft = rect ? Math.max(16, Math.min(rect.left, window.innerWidth - 320)) : 100;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-bg/40 pointer-events-auto" onClick={finish} />

      {/* Spotlight cutout */}
      {rect && (
        <div
          className="absolute border-2 border-primary rounded-lg pointer-events-none"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.4), 0 0 20px rgba(59,130,246,0.3)",
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={guidedTourStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-auto bg-surface border border-border rounded-[14px] p-4 shadow-xl max-w-[280px] z-[61]"
          style={{ top: tooltipTop, left: tooltipLeft }}
        >
          <div className="text-xs text-text-subtle mb-1">
            Step {guidedTourStep + 1} of {STEPS.length}
          </div>
          <h4 className="font-heading text-sm font-semibold text-text mb-1">{step.title}</h4>
          <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={finish}
              className="text-xs text-text-subtle hover:text-text transition-colors cursor-pointer"
            >
              Skip tour
            </button>
            <button
              onClick={next}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              {guidedTourStep >= STEPS.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
