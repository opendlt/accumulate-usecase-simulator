import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial: _i, animate: _a, exit: _e, transition: _t, whileHover: _w, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial: _i, animate: _a, exit: _e, transition: _t, whileHover: _w, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock phosphor icons
vi.mock("@phosphor-icons/react", () => ({
  Buildings: () => <span data-testid="icon-buildings" />,
  CurrencyCircleDollar: () => <span data-testid="icon-currency" />,
  Warning: () => <span data-testid="icon-warning" />,
}));

// Mock scenario loaders
vi.mock("@/scenarios", () => ({
  loadAllScenarios: vi.fn(() =>
    Promise.resolve([
      {
        id: "vendor-access",
        name: "Vendor Access Request",
        description: "Test description",
        icon: "Buildings",
        actors: [],
        policies: [],
        edges: [],
        defaultWorkflow: { name: "Test", initiatorRoleId: "", targetAction: "", description: "" },
        beforeMetrics: { manualTimeHours: 4, riskExposureDays: 2, auditGapCount: 2, approvalSteps: 3 },
      },
      {
        id: "treasury-transfer",
        name: "Treasury Transfer",
        description: "Test description",
        icon: "CurrencyCircleDollar",
        actors: [],
        policies: [],
        edges: [],
        defaultWorkflow: { name: "Test", initiatorRoleId: "", targetAction: "", description: "" },
        beforeMetrics: { manualTimeHours: 4, riskExposureDays: 2, auditGapCount: 2, approvalSteps: 3 },
      },
      {
        id: "incident-escalation",
        name: "Incident Escalation",
        description: "Test description",
        icon: "Warning",
        actors: [],
        policies: [],
        edges: [],
        defaultWorkflow: { name: "Test", initiatorRoleId: "", targetAction: "", description: "" },
        beforeMetrics: { manualTimeHours: 4, riskExposureDays: 2, auditGapCount: 2, approvalSteps: 3 },
      },
    ])
  ),
}));

import { LandingOverlay } from "@/components/onboarding/LandingOverlay";
import { useUIStore, useScenarioStore, useCanvasStore } from "@/store";

beforeEach(() => {
  useUIStore.setState({ showLandingOverlay: true });
  useScenarioStore.setState({ activeScenario: null, policies: [] });
  useCanvasStore.setState({ nodes: [], edges: [], selectedNodeId: null });
});

describe("LandingOverlay", () => {
  it("renders 3 scenario cards", async () => {
    render(<LandingOverlay />);
    await waitFor(() => {
      expect(screen.getByText("Vendor Access Request")).toBeTruthy();
    });
    expect(screen.getByText("Treasury Transfer")).toBeTruthy();
    expect(screen.getByText("Incident Escalation")).toBeTruthy();
  });

  it("renders blank canvas option", () => {
    render(<LandingOverlay />);
    expect(screen.getByText("Or start with a blank canvas")).toBeTruthy();
  });

  it("renders the main heading", () => {
    render(<LandingOverlay />);
    expect(screen.getByText("See how programmable authority works.")).toBeTruthy();
  });
});
