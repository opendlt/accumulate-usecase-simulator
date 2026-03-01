import { motion } from "framer-motion";
import { useSimulationStore } from "@/store";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  completed: "#22C55E",
  active: "#3B82F6",
  pending: "#F59E0B",
  failed: "#EF4444",
};

export function TimelineTab() {
  const { evidence } = useSimulationStore();

  if (!evidence) {
    return (
      <div className="text-xs text-text-subtle text-center py-8">
        Run a simulation to see the timeline.
      </div>
    );
  }

  return (
    <div className="space-y-0 pl-4 relative">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

      {evidence.timeline.map((entry, i) => {
        const color = statusColors[entry.status] ?? "#94A3B8";
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            className="flex items-start gap-3 py-2 relative"
          >
            {/* Dot */}
            <div
              className={cn("w-3 h-3 rounded-full shrink-0 border-2 -ml-4 z-10")}
              style={{
                borderColor: color,
                background: entry.status === "completed" || entry.status === "failed" ? color : "var(--bg)",
              }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-mono text-text-subtle">{entry.timestamp}s</span>
                <span className="text-xs font-medium text-text">{entry.label}</span>
              </div>
              <p className="text-[0.65rem] text-text-muted mt-0.5">{entry.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
