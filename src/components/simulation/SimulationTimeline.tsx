import { motion } from "framer-motion";
import { useSimulationStore } from "@/store";
import { SimulationEventType } from "@/types/simulation";
import { cn } from "@/lib/utils";

const eventColors: Record<string, string> = {
  [SimulationEventType.REQUEST_CREATED]: "#3B82F6",
  [SimulationEventType.APPROVAL_REQUESTED]: "#F59E0B",
  [SimulationEventType.APPROVED]: "#22C55E",
  [SimulationEventType.DENIED]: "#EF4444",
  [SimulationEventType.DELEGATED]: "#06B6D4",
  [SimulationEventType.ESCALATED]: "#F59E0B",
  [SimulationEventType.EXPIRED]: "#EF4444",
  [SimulationEventType.FINALIZED]: "#8B5CF6",
};

export function SimulationTimeline() {
  const { run, currentEventIndex } = useSimulationStore();

  if (!run) return null;

  return (
    <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
      {run.events.map((event, index) => {
        const isPast = index < currentEventIndex;
        const isCurrent = index === currentEventIndex;
        const isFuture = index > currentEventIndex;
        const color = eventColors[event.type] ?? "#94A3B8";

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: isFuture ? 0.3 : 1, x: 0 }}
            transition={{ duration: 0.2, delay: isCurrent ? 0.1 : 0 }}
            className={cn(
              "flex items-start gap-2 text-[0.65rem] py-1 px-2 rounded-[6px] transition-colors",
              isCurrent && "bg-overlay/[0.04]"
            )}
          >
            {/* Dot */}
            <div className="mt-1 shrink-0">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isCurrent && "ring-2 ring-offset-1 ring-offset-bg"
                )}
                style={{
                  background: color,
                  boxShadow: isCurrent ? `0 0 8px ${color}` : undefined,
                  ["--tw-ring-color" as string]: isCurrent ? color : undefined,
                }}
              />
            </div>

            {/* Time */}
            <span
              className={cn(
                "font-mono w-8 shrink-0",
                isPast && "text-text-subtle",
                isCurrent && "text-text font-semibold",
                isFuture && "text-text-subtle"
              )}
            >
              {event.timestamp}s
            </span>

            {/* Description */}
            <span
              className={cn(
                "flex-1",
                isPast && "text-text-muted",
                isCurrent && "text-text",
                isFuture && "text-text-subtle"
              )}
            >
              {event.description}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
