import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlaybackControls } from "@/components/simulation/PlaybackControls";
import { useSimulationStore } from "@/store";
import { SimulationStatus, PlaybackSpeed, SimulationEventType } from "@/types/simulation";

beforeEach(() => {
  useSimulationStore.setState({
    run: {
      id: "test-run",
      scenarioId: "test",
      seed: 42,
      events: [
        {
          id: "e1",
          type: SimulationEventType.REQUEST_CREATED,
          timestamp: 0,
          actorId: "a1",
          description: "Request created",
          metadata: {},
        },
        {
          id: "e2",
          type: SimulationEventType.APPROVED,
          timestamp: 1,
          actorId: "a2",
          description: "Approved",
          metadata: {},
        },
        {
          id: "e3",
          type: SimulationEventType.FINALIZED,
          timestamp: 2,
          actorId: "a1",
          description: "Finalized",
          metadata: { outcome: "approved" },
        },
      ],
      states: [],
      startedAt: 0,
      completedAt: 2,
      outcome: "approved",
    },
    status: SimulationStatus.Paused,
    currentEventIndex: 1,
    speed: PlaybackSpeed.Normal,
  });
});

describe("PlaybackControls", () => {
  it("renders play/pause button", () => {
    render(<PlaybackControls />);
    expect(screen.getByLabelText("Play")).toBeTruthy();
  });

  it("renders step backward button", () => {
    render(<PlaybackControls />);
    expect(screen.getByLabelText("Step backward")).toBeTruthy();
  });

  it("renders step forward button", () => {
    render(<PlaybackControls />);
    expect(screen.getByLabelText("Step forward")).toBeTruthy();
  });

  it("renders reset button", () => {
    render(<PlaybackControls />);
    expect(screen.getByLabelText("Reset")).toBeTruthy();
  });

  it("shows progress as 2/3", () => {
    render(<PlaybackControls />);
    expect(screen.getByText("2/3")).toBeTruthy();
  });

  it("renders speed selector with 4 options", () => {
    render(<PlaybackControls />);
    expect(screen.getByText("0.5x")).toBeTruthy();
    expect(screen.getByText("1x")).toBeTruthy();
    expect(screen.getByText("2x")).toBeTruthy();
    expect(screen.getByText("Max")).toBeTruthy();
  });

  it("shows Pause when status is Running", () => {
    useSimulationStore.setState({ status: SimulationStatus.Running });
    render(<PlaybackControls />);
    expect(screen.getByLabelText("Pause")).toBeTruthy();
  });
});
