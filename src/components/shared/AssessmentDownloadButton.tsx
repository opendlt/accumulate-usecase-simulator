import { FileArrowDown } from "@phosphor-icons/react";
import { generateAssessmentHTML } from "@/lib/assessment-generator";
import { useSimulationStore, useScenarioStore } from "@/store";
import { useROIStore } from "@/store/roi-store";
import { generateDualComparison, generateVerificationQueries } from "@/engine/verification";
import { cn } from "@/lib/utils";

interface AssessmentDownloadButtonProps {
  variant?: "primary" | "secondary";
  className?: string;
}

export function AssessmentDownloadButton({ variant = "secondary", className }: AssessmentDownloadButtonProps) {
  const { todayRun, accumulateRun } = useSimulationStore();
  const { activeScenario } = useScenarioStore();
  const { inputs: roiInputs } = useROIStore();

  const handleDownload = () => {
    if (!todayRun || !accumulateRun || !activeScenario) return;

    const comparisons = generateDualComparison(todayRun, accumulateRun, activeScenario.beforeMetrics);
    const verification = generateVerificationQueries(accumulateRun, activeScenario.policies, activeScenario.actors);

    const html = generateAssessmentHTML({
      scenarioName: activeScenario.name,
      scenarioDescription: activeScenario.description,
      industryName: activeScenario.industryId ?? "General",
      actors: activeScenario.actors,
      comparisons,
      verification,
      regulatoryContext: activeScenario.regulatoryContext,
      roiInputs: roiInputs ?? undefined,
      accTimeSeconds: accumulateRun.events[accumulateRun.events.length - 1]?.timestamp ?? 0,
      proofHash: `SHA-256: ${accumulateRun.id.slice(0, 16)}...`,
      todayOutcome: todayRun.outcome,
      accumulateOutcome: accumulateRun.outcome,
    });

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  const isDisabled = !todayRun || !accumulateRun || !activeScenario;

  return (
    <button
      onClick={handleDownload}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "primary"
          ? "h-9 px-4 text-xs font-semibold rounded-[10px] bg-primary text-white hover:bg-primary-hover"
          : "h-8 px-3 text-xs text-text-muted rounded-[8px] border border-border hover:bg-surface-2 hover:text-text",
        className
      )}
    >
      <FileArrowDown size={14} />
      Download Assessment
    </button>
  );
}
