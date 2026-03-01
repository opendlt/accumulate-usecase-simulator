import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    tr: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props;
      return <tr {...rest}>{children}</tr>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useMotionValue: () => ({ set: () => {}, get: () => 0, on: () => () => {} }),
  useSpring: (v: unknown) => v,
  useInView: () => true,
}));

import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { useSimulationStore, useUIStore } from "@/store";

beforeEach(() => {
  useUIStore.setState({ evidenceTab: 0 });
  useSimulationStore.setState({
    evidence: null,
    currentEventIndex: -1,
  });
});

describe("EvidencePanel", () => {
  it("renders 5 tab names", () => {
    render(<EvidencePanel />);
    expect(screen.getByText("Audit Log")).toBeTruthy();
    expect(screen.getByText("Timeline")).toBeTruthy();
    expect(screen.getByText("Proof")).toBeTruthy();
    expect(screen.getByText("Verification")).toBeTruthy();
    expect(screen.getByText("Before/After")).toBeTruthy();
  });

  it("renders Evidence header", () => {
    render(<EvidencePanel />);
    expect(screen.getByText("Evidence")).toBeTruthy();
  });

  it("shows empty state when no evidence", () => {
    render(<EvidencePanel />);
    expect(screen.getByText("Run a simulation to see the audit log.")).toBeTruthy();
  });
});
