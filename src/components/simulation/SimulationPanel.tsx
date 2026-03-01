import { Lightning } from "@phosphor-icons/react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/shared/Button";
import { ProofStamp } from "@/components/shared/ProofStamp";
import { PlaybackControls } from "./PlaybackControls";
import { SimulationTimeline } from "./SimulationTimeline";
import { useSimulationStore, useScenarioStore, useCanvasStore } from "@/store";
import { useSimulationPlayback } from "@/hooks/useSimulationPlayback";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SimulationStatus } from "@/types/simulation";

export function SimulationPanel() {
  const { activeScenario, policies } = useScenarioStore();
  const { status, run, useRandomSeed } = useSimulationStore();
  const nodes = useCanvasStore((s) => s.nodes);
  const toggleRandomSeed = useSimulationStore((s) => s.toggleRandomSeed);
  const { startSimulation } = useSimulationPlayback();

  useKeyboardShortcuts(startSimulation);

  if (!activeScenario) return null;

  const isIdle = status === SimulationStatus.Idle;
  const hasRun = run !== null;
  const canRun = nodes.length >= 2 && policies.length > 0;
  const runDisabledReason = nodes.length < 2
    ? "Add at least 2 nodes to run"
    : policies.length === 0
      ? "Attach a policy to at least one node"
      : "";

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-4">
        {/* Left: Controls */}
        <div className="shrink-0 space-y-2">
          {isIdle && (
            <div className="flex items-center gap-2" data-tour="run-button">
              <div className="relative group">
                <Button onClick={startSimulation} size="sm" disabled={!canRun}>
                  <Lightning size={14} weight="fill" className="mr-1.5" />
                  Run Simulation
                </Button>
                {!canRun && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[0.625rem] text-text-muted bg-surface border border-border rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {runDisabledReason}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useRandomSeed}
                  onChange={toggleRandomSeed}
                  className="accent-primary"
                />
                Random seed
              </label>
            </div>
          )}

          {hasRun && <PlaybackControls />}

          {/* Outcome badge */}
          {status === SimulationStatus.Completed && run && (
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                run.outcome === "approved"
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-danger/10 text-danger border border-danger/20"
              }`}
            >
              {run.outcome === "approved" ? "Approved" : "Denied"}
            </div>
          )}
          <AnimatePresence>
            {status === SimulationStatus.Completed && run?.outcome === "approved" && (
              <ProofStamp />
            )}
          </AnimatePresence>
        </div>

        {/* Right: Timeline */}
        {hasRun && (
          <div className="flex-1 min-w-0">
            <SimulationTimeline />
          </div>
        )}

        {/* Info when idle */}
        {isIdle && !hasRun && (
          <div className="flex-1 text-xs text-text-subtle">
            <p className="font-medium text-text-muted">{activeScenario.defaultWorkflow.name}</p>
            <p className="mt-0.5">{activeScenario.defaultWorkflow.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
