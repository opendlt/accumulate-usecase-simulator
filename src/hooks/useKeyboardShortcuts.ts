import { useEffect } from "react";
import { useSimulationStore } from "@/store";
import { SimulationStatus } from "@/types/simulation";

export function useKeyboardShortcuts(startSimulation: () => void) {
  const { status, setStatus, stepForward, stepBackward, resetSimulation } =
    useSimulationStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (status === SimulationStatus.Running) {
            setStatus(SimulationStatus.Paused);
          } else if (
            status === SimulationStatus.Paused ||
            status === SimulationStatus.Idle
          ) {
            if (status === SimulationStatus.Idle) {
              startSimulation();
            } else {
              setStatus(SimulationStatus.Running);
            }
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          stepForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          stepBackward();
          break;
        case "KeyR":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            resetSimulation();
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, setStatus, stepForward, stepBackward, resetSimulation, startSimulation]);
}
