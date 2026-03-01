import { AnimatePresence, motion } from "framer-motion";
import { SimulationEventType } from "@/types/simulation";
import type { SimulationEvent } from "@/types/simulation";
import type { Actor } from "@/types/organization";

const EVENT_LABELS: Record<SimulationEventType, { label: string; color: string }> = {
  [SimulationEventType.REQUEST_CREATED]:    { label: "Request Created",    color: "#3B82F6" },
  [SimulationEventType.APPROVAL_REQUESTED]: { label: "Approval Requested", color: "#3B82F6" },
  [SimulationEventType.APPROVED]:           { label: "Approved",           color: "#22C55E" },
  [SimulationEventType.DENIED]:             { label: "Denied",             color: "#EF4444" },
  [SimulationEventType.DELEGATED]:          { label: "Delegated",          color: "#F59E0B" },
  [SimulationEventType.ESCALATED]:          { label: "Escalated",          color: "#F59E0B" },
  [SimulationEventType.EXPIRED]:            { label: "Expired",            color: "#EF4444" },
  [SimulationEventType.FINALIZED]:          { label: "Finalized",          color: "#22C55E" },
  [SimulationEventType.MANUAL_STEP]:        { label: "Manual Step",        color: "#EF4444" },
  [SimulationEventType.WAITING]:            { label: "Waiting",            color: "#F59E0B" },
};

interface EventDetailBannerProps {
  event: SimulationEvent | null;
  stepIndex: number;
  totalSteps: number;
  actors: Actor[];
  side: "today" | "accumulate";
  currentTimestamp?: number;
  totalTimestamp?: number;
  manualTimeHours?: number;
}

function actorLabel(actorId: string, actors: Actor[]): string {
  return actors.find((a) => a.id === actorId)?.label ?? actorId;
}

function formatElapsedTime(
  currentTimestamp: number,
  totalTimestamp: number,
  side: "today" | "accumulate",
  manualTimeHours?: number,
): string {
  if (side === "today" && manualTimeHours && totalTimestamp > 0) {
    const scaledHours = (currentTimestamp / totalTimestamp) * manualTimeHours;
    const h = Math.floor(scaledHours);
    const m = Math.round((scaledHours - h) * 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  // Accumulate side: raw seconds
  if (currentTimestamp < 60) return `${currentTimestamp.toFixed(1)}s`;
  const mins = Math.floor(currentTimestamp / 60);
  const secs = Math.round(currentTimestamp % 60);
  return `${mins}m ${secs}s`;
}

export function EventDetailBanner({
  event,
  stepIndex,
  totalSteps,
  actors,
  side,
  currentTimestamp,
  totalTimestamp,
  manualTimeHours,
}: EventDetailBannerProps) {
  if (!event) return null;

  const meta = EVENT_LABELS[event.type] ?? { label: event.type, color: "#94A3B8" };
  const actor = actorLabel(event.actorId, actors);
  const target = event.targetActorId ? actorLabel(event.targetActorId, actors) : null;
  const borderColor = side === "today" ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)";
  const accentColor = side === "today" ? "#EF4444" : "#22C55E";

  const showElapsed = currentTimestamp != null && totalTimestamp != null;
  const elapsedText = showElapsed
    ? formatElapsedTime(currentTimestamp, totalTimestamp, side, manualTimeHours)
    : "";

  return (
    <div className="absolute top-1.5 left-[150px] z-[12] pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-3 rounded-lg px-3.5 py-1.5 shadow-lg backdrop-blur-md w-fit"
          style={{
            background: "color-mix(in srgb, var(--surface) 85%, transparent)",
            border: `1px solid ${borderColor}`,
          }}
        >
          {/* Step counter */}
          <span className="text-xs font-semibold text-text-muted tabular-nums whitespace-nowrap">
            {stepIndex + 1}/{totalSteps}
          </span>

          {/* Divider */}
          <div className="w-px h-4 bg-border/50 shrink-0" />

          {/* Event type badge */}
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
            style={{
              background: `${meta.color}20`,
              color: meta.color,
              border: `1px solid ${meta.color}40`,
            }}
          >
            {meta.label}
          </span>

          {/* Divider */}
          <div className="w-px h-4 bg-border/50 shrink-0" />

          {/* Actor flow */}
          <span className="text-xs font-semibold text-text whitespace-nowrap">
            {actor}
            {target && (
              <>
                <span className="text-text-muted mx-1.5">&rarr;</span>
                {target}
              </>
            )}
          </span>

          {/* Description */}
          {event.description && (
            <>
              <div className="w-px h-4 bg-border/50 shrink-0" />
              <span className="text-[0.7rem] text-text-muted whitespace-nowrap">
                {event.description}
              </span>
            </>
          )}

          {/* Elapsed time */}
          {showElapsed && (
            <>
              <div className="w-px h-4 bg-border/50 shrink-0" />
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ color: accentColor }}
                >
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="8" y1="4" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="8" y1="8" x2="10.5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: accentColor }}
                >
                  {elapsedText}
                </span>
              </span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
