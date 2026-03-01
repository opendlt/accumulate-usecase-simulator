import { motion, AnimatePresence } from "framer-motion";
import type { SplitScreenProgress } from "@/hooks/useSplitScreenPlayback";
import type { CinematicProgress } from "@/hooks/useCinematicPlayback";
import type { ComparisonMetrics } from "@/types/scenario";

interface SplitScreenScoreboardProps {
  progress: SplitScreenProgress | CinematicProgress;
  beforeMetrics?: ComparisonMetrics;
}

function ProgressBar({ value, max, color, shimmer }: { value: number; max: number; color: string; shimmer?: boolean }) {
  const pct = max > 0 ? Math.min(((value + 1) / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-border/50 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: shimmer
            ? `linear-gradient(90deg, ${color}, ${color}CC, ${color}FF, ${color}CC, ${color})`
            : color,
          backgroundSize: shimmer ? "200% 100%" : undefined,
          animation: shimmer ? "gradient-shift 1.5s ease infinite" : undefined,
        }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

function StatusDot({ complete, running, color }: { complete: boolean; running: boolean; color: string }) {
  return (
    <motion.div
      className="w-2 h-2 rounded-full"
      style={{ background: complete ? color : running ? color : "#64748B" }}
      animate={running && !complete ? { opacity: [0.4, 1, 0.4] } : { opacity: 1 }}
      transition={running && !complete ? { duration: 1, repeat: Infinity } : {}}
    />
  );
}

export function SplitScreenScoreboard({ progress, beforeMetrics }: SplitScreenScoreboardProps) {
  const { todayIndex, todayTotal, accIndex, accTotal, todayComplete, accComplete, todayManualSteps } = progress;
  const isRunning = !progress.bothComplete && (todayTotal > 0 || accTotal > 0);

  // Map today's event progress to real-world hours
  const realWorldHoursElapsed = beforeMetrics && todayTotal > 0
    ? Math.round((beforeMetrics.manualTimeHours * (todayIndex + 1)) / todayTotal)
    : null;

  // Accumulate elapsed simulated seconds (proportional to event count, assume ~2s per event)
  const accSecondsElapsed = accTotal > 0 ? Math.round(((accIndex + 1) / accTotal) * accTotal * 2) : 0;

  return (
    <div className="w-[160px] shrink-0 border-x border-border bg-surface/60 backdrop-blur-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border/50 text-center">
        <span className="text-[0.6rem] font-bold text-text-muted uppercase tracking-wider">
          Live Comparison
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3 px-3 py-3 overflow-y-auto">
        {/* Today side */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <StatusDot complete={todayComplete} running={isRunning} color="#EF4444" />
            <span className="text-[0.6rem] font-semibold text-danger/80 uppercase tracking-wider">Today</span>
          </div>
          <ProgressBar value={todayIndex} max={todayTotal} color="#EF4444" />
          <div className="text-[0.55rem] text-text-muted">
            {todayComplete ? (
              <span className="text-danger">Complete</span>
            ) : accComplete && !todayComplete ? (
              <motion.span
                className="text-danger font-semibold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                Still running...
              </motion.span>
            ) : (
              `${Math.max(0, todayIndex + 1)}/${todayTotal} events`
            )}
          </div>
        </div>

        {/* Accumulate side — dimmed during Act 1 (accIndex < 0) */}
        <div className="space-y-1.5 transition-opacity duration-500" style={{ opacity: accIndex < 0 ? 0.3 : 1 }}>
          <div className="flex items-center gap-1.5">
            <StatusDot complete={accComplete} running={isRunning && accIndex >= 0} color="#22C55E" />
            <span className="text-[0.6rem] font-semibold text-success/80 uppercase tracking-wider">Accumulate</span>
          </div>
          <ProgressBar
            value={accIndex}
            max={accTotal}
            color="#22C55E"
            shimmer={accComplete && !todayComplete}
          />
          <div className="text-[0.55rem] text-text-muted">
            {accIndex < 0 ? (
              <span className="text-text-subtle">Waiting...</span>
            ) : accComplete && !todayComplete ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1"
              >
                <span
                  className="text-[0.55rem] font-bold text-success px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(34,197,94,0.12)",
                    boxShadow: "0 0 8px rgba(34,197,94,0.3)",
                  }}
                >
                  COMPLETE
                </span>
              </motion.span>
            ) : accComplete ? (
              <span className="text-success">Complete</span>
            ) : (
              `${Math.max(0, accIndex + 1)}/${accTotal} events`
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* Real-world elapsed */}
        {realWorldHoursElapsed !== null && (
          <div className="space-y-0.5">
            <div className="text-[0.55rem] font-semibold text-text-muted uppercase tracking-wider">
              Real-world time
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={realWorldHoursElapsed}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-bold text-danger tabular-nums"
                >
                  {todayComplete ? `${beforeMetrics!.manualTimeHours}+` : realWorldHoursElapsed}
                </motion.span>
              </AnimatePresence>
              <span className="text-[0.55rem] text-text-muted">hours</span>
            </div>
          </div>
        )}

        {/* Accumulate elapsed */}
        <div className="space-y-0.5 transition-opacity duration-500" style={{ opacity: accIndex < 0 ? 0.3 : 1 }}>
          <div className="text-[0.55rem] font-semibold text-text-muted uppercase tracking-wider">
            Accumulate time
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={accSecondsElapsed}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-bold text-success tabular-nums"
              >
                {accSecondsElapsed}
              </motion.span>
            </AnimatePresence>
            <span className="text-[0.55rem] text-text-muted">seconds</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* Friction counter */}
        <div className="space-y-0.5">
          <div className="text-[0.55rem] font-semibold text-text-muted uppercase tracking-wider">
            Friction events
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={todayManualSteps}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-bold tabular-nums"
                style={{ color: todayManualSteps > 0 ? "#EF4444" : "#64748B" }}
              >
                {todayManualSteps}
              </motion.span>
            </AnimatePresence>
            <span className="text-[0.55rem] text-text-muted">manual steps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
