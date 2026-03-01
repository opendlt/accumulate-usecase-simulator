import { useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, ArrowCounterClockwise } from "@phosphor-icons/react";
import { useSimulationStore, useUIStore } from "@/store";
import { SimulationStatus, PlaybackSpeed } from "@/types/simulation";
import type { SplitScreenProgress } from "@/hooks/useSplitScreenPlayback";
import type { CinematicProgress } from "@/hooks/useCinematicPlayback";

interface SplitPlayback {
  pause: () => void;
  resume: () => void;
  seekTo: (fraction: number) => void;
  progress: SplitScreenProgress | CinematicProgress;
  actLabel?: string;
}

interface PlaybackControlsProps {
  splitPlayback?: SplitPlayback;
}

export function PlaybackControls({ splitPlayback }: PlaybackControlsProps) {
  const {
    status,
    currentEventIndex,
    run,
    speed,
    setStatus,
    stepForward,
    stepBackward,
    setSpeed,
    resetSimulation,
  } = useSimulationStore();

  const dualRunPhase = useUIStore((s) => s.dualRunPhase);
  const isSplitMode = dualRunPhase === "split-running" || dualRunPhase === "accumulate-done";

  const totalEvents = run?.events.length ?? 0;
  const isPlaying = status === SimulationStatus.Running;
  const isCompleted = status === SimulationStatus.Completed;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!splitPlayback) return;
      const fraction = Number(e.target.value) / 1000;
      splitPlayback.seekTo(fraction);
    },
    [splitPlayback]
  );

  const handleSliderMouseDown = useCallback(() => {
    if (!splitPlayback || splitPlayback.progress.isPaused || splitPlayback.progress.bothComplete) return;
    splitPlayback.pause();
  }, [splitPlayback]);

  return (
    <div className="flex items-center gap-3">
      {/* Playback buttons — in split mode, show pause/resume instead of step controls */}
      {!isSplitMode && (
        <div className="flex items-center gap-1">
          <button
            onClick={stepBackward}
            disabled={currentEventIndex <= 0}
            className="p-1.5 rounded-[8px] text-text-muted hover:text-text hover:bg-overlay/[0.04] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Step backward"
          >
            <SkipBack size={16} weight="fill" />
          </button>

          <button
            onClick={() => {
              if (isPlaying) {
                setStatus(SimulationStatus.Paused);
              } else if (isCompleted) {
                // Do nothing, use reset
              } else {
                setStatus(SimulationStatus.Running);
              }
            }}
            disabled={isCompleted}
            className="p-2 rounded-[10px] bg-primary/15 text-primary hover:bg-primary/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
          </button>

          <button
            onClick={stepForward}
            disabled={currentEventIndex >= totalEvents - 1}
            className="p-1.5 rounded-[8px] text-text-muted hover:text-text hover:bg-overlay/[0.04] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Step forward"
          >
            <SkipForward size={16} weight="fill" />
          </button>

          <button
            onClick={resetSimulation}
            className="p-1.5 rounded-[8px] text-text-muted hover:text-text hover:bg-overlay/[0.04] transition-colors cursor-pointer ml-1"
            aria-label="Reset"
          >
            <ArrowCounterClockwise size={16} />
          </button>
        </div>
      )}

      {/* Progress — show single bar for sequential */}
      {!isSplitMode && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="font-mono">
            {Math.max(0, currentEventIndex + 1)}/{totalEvents}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${totalEvents > 0 ? ((currentEventIndex + 1) / totalEvents) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Split mode: pause/resume + scrubber */}
      {isSplitMode && splitPlayback && (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Pause / Resume */}
          <button
            onClick={() => {
              if (splitPlayback.progress.bothComplete) return;
              if (splitPlayback.progress.isPaused) {
                splitPlayback.resume();
              } else {
                splitPlayback.pause();
              }
            }}
            disabled={splitPlayback.progress.bothComplete}
            className="p-2 rounded-[10px] bg-primary/15 text-primary hover:bg-primary/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
            aria-label={splitPlayback.progress.isPaused ? "Resume" : "Pause"}
          >
            {splitPlayback.progress.isPaused || splitPlayback.progress.bothComplete ? (
              <Play size={18} weight="fill" />
            ) : (
              <Pause size={18} weight="fill" />
            )}
          </button>

          {/* Scrubber slider */}
          <div className="flex-1 min-w-[100px] max-w-[240px]">
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(splitPlayback.progress.fraction * 1000)}
              onChange={handleSliderChange}
              onMouseDown={handleSliderMouseDown}
              onTouchStart={handleSliderMouseDown}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:shadow-[0_0_4px_rgba(59,130,246,0.4)]
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-primary
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(59 130 246) ${splitPlayback.progress.fraction * 100}%, rgb(var(--color-border)) ${splitPlayback.progress.fraction * 100}%)`,
              }}
            />
          </div>

          {/* Status text */}
          <span className="text-[0.65rem] text-text-muted font-medium whitespace-nowrap shrink-0">
            {splitPlayback.progress.bothComplete
              ? (splitPlayback.actLabel ?? "Complete")
              : splitPlayback.progress.isPaused
                ? "Paused"
                : (splitPlayback.actLabel ?? "Playing")}
            {" "}
            <span className="font-mono">{Math.round(splitPlayback.progress.fraction * 100)}%</span>
          </span>
        </div>
      )}

      {/* Fallback label when split mode has no splitPlayback prop */}
      {isSplitMode && !splitPlayback && (
        <div className="text-[0.65rem] text-text-muted font-medium">
          {dualRunPhase === "split-running" ? "Both canvases running simultaneously" : "Comparison complete"}
        </div>
      )}

      {/* Speed selector */}
      <div className="flex items-center gap-1 ml-auto">
        {[
          { label: "0.5x", value: PlaybackSpeed.Slow },
          { label: "1x", value: PlaybackSpeed.Normal },
          { label: "2x", value: PlaybackSpeed.Fast },
          { label: "Max", value: PlaybackSpeed.Instant },
        ].map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setSpeed(value)}
            className={`px-2 py-1 text-[0.65rem] font-medium rounded-[6px] transition-colors cursor-pointer ${
              speed === value
                ? "bg-primary/15 text-primary"
                : "text-text-subtle hover:text-text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
