import { useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useSimulationStore, useScenarioStore } from "@/store";
import { generateDualComparison } from "@/engine/verification";

function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref);
  const num = parseFloat(value);

  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 100, damping: 20 });

  useEffect(() => {
    if (isInView && !isNaN(num)) {
      motionVal.set(num);
    }
  }, [isInView, num, motionVal]);

  useEffect(() => {
    const unsubscribe = springVal.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = isNaN(num)
          ? value
          : Number.isInteger(num)
            ? Math.round(v).toString()
            : v.toFixed(1);
      }
    });
    return unsubscribe;
  }, [springVal, num, value]);

  if (isNaN(num)) {
    return <span>{value}</span>;
  }

  return <span ref={ref}>0</span>;
}

export function BeforeAfterTab() {
  const { evidence, todayRun, accumulateRun } = useSimulationStore();
  const { activeScenario } = useScenarioStore();

  // Use real dual-run comparison if both runs are available
  const dualComparison = useMemo(() => {
    if (todayRun && accumulateRun) {
      return generateDualComparison(todayRun, accumulateRun, activeScenario?.beforeMetrics);
    }
    return null;
  }, [todayRun, accumulateRun, activeScenario?.beforeMetrics]);

  const items = dualComparison ?? evidence?.beforeAfter;

  if (!items) {
    return (
      <div className="text-xs text-text-subtle text-center py-8">
        Run a simulation to see the comparison.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.metric}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
          className="rounded-[14px] border border-overlay/[0.06] overflow-hidden"
        >
          {/* Header */}
          <div className="px-3 py-2 bg-overlay/[0.02] border-b border-overlay/[0.04]">
            <span className="text-xs font-semibold text-text">{item.metric}</span>
          </div>

          <div className="flex divide-x divide-overlay/[0.04]">
            {/* Before */}
            <div className="flex-1 px-3 py-2.5">
              <div className="text-[0.55rem] uppercase tracking-wider text-danger/70 font-semibold mb-1">
                {dualComparison ? "Today" : "Manual Process"}
              </div>
              <div className="text-xs text-text-muted">
                <AnimatedNumber value={String(item.before)} />
              </div>
            </div>

            {/* After */}
            <div className="flex-1 px-3 py-2.5">
              <div className="text-[0.55rem] uppercase tracking-wider text-success/70 font-semibold mb-1">
                With Accumulate
              </div>
              <div className="text-xs text-success font-medium">
                <AnimatedNumber value={String(item.after)} />
              </div>
            </div>
          </div>

          {/* Improvement */}
          <div className="px-3 py-1.5 bg-success/5 border-t border-success/10">
            <span className="text-[0.6rem] text-success font-semibold">{item.improvement}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
