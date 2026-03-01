import { CheckCircle } from "@phosphor-icons/react";
import { useUIStore } from "@/store";
import type { ScreenId } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "hero" as const, label: "Start", screen: "hero" as ScreenId },
  { id: "industry" as const, label: "Industry", screen: "industry-picker" as ScreenId },
  { id: "scenario" as const, label: "Scenario", screen: "scenario-selector" as ScreenId },
  { id: "simulation" as const, label: "Simulation", screen: "simulation" as ScreenId },
  { id: "results" as const, label: "Results", screen: "evidence" as ScreenId },
] as const;

function screenToStepIndex(screen: ScreenId): number {
  switch (screen) {
    case "hero": return 0;
    case "industry-picker": return 1;
    case "scenario-selector": return 2;
    case "simulation": return 3;
    case "evidence": return 4;
    default: return -1;
  }
}

export function FlowBreadcrumb() {
  const { screen, navigateTo, cinematicActive } = useUIStore();

  // Don't show during cinematic playback or on hero/sandbox/org-builder
  if (cinematicActive || screen === "hero" || screen === "sandbox" || screen === "org-builder") {
    return null;
  }

  const currentIndex = screenToStepIndex(screen);
  if (currentIndex < 0) return null;

  const handleClick = (stepIndex: number) => {
    // Only allow backward navigation
    if (stepIndex < currentIndex) {
      navigateTo(STEPS[stepIndex]!.screen);
    }
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-surface/30 border-b border-border/30">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIndex;
        const isActive = i === currentIndex;
        const isFuture = i > currentIndex;
        const isClickable = i < currentIndex;

        return (
          <div key={step.id} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={cn(
                  "w-4 sm:w-6 h-px transition-colors",
                  isComplete ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <button
              onClick={() => handleClick(i)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-1 text-[0.6rem] sm:text-[0.65rem] font-medium tracking-wide transition-colors",
                isActive && "text-primary",
                isComplete && "text-text-muted hover:text-primary cursor-pointer",
                isFuture && "text-text-subtle",
                !isClickable && "cursor-default"
              )}
            >
              {isComplete ? (
                <CheckCircle size={12} weight="fill" className="text-primary shrink-0" />
              ) : (
                <div
                  className={cn(
                    "w-2 h-2 rounded-full border-[1.5px] transition-all shrink-0",
                    isActive
                      ? "border-primary bg-primary shadow-[0_0_6px_rgba(59,130,246,0.4)]"
                      : "border-text-subtle bg-transparent"
                  )}
                />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
