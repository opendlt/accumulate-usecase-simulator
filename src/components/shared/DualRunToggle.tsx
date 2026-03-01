import { cn } from "@/lib/utils";

interface DualRunToggleProps {
  activeMode: "today" | "accumulate";
  onToggle: (mode: "today" | "accumulate") => void;
  todayComplete?: boolean;
  accumulateComplete?: boolean;
  disabled?: boolean;
}

export function DualRunToggle({
  activeMode,
  onToggle,
  todayComplete,
  accumulateComplete,
  disabled,
}: DualRunToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-[10px] bg-surface/80 border border-overlay/[0.06]">
      <button
        onClick={() => onToggle("today")}
        disabled={disabled}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all duration-200 cursor-pointer",
          activeMode === "today"
            ? "bg-danger/10 text-danger border border-danger/20"
            : "text-text-muted hover:text-text",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        Today
        {todayComplete && <span className="ml-1 text-[0.5rem]">&#10003;</span>}
      </button>
      <button
        onClick={() => onToggle("accumulate")}
        disabled={disabled}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all duration-200 cursor-pointer",
          activeMode === "accumulate"
            ? "bg-success/10 text-success border border-success/20"
            : "text-text-muted hover:text-text",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        With Accumulate
        {accumulateComplete && <span className="ml-1 text-[0.5rem]">&#10003;</span>}
      </button>
    </div>
  );
}
