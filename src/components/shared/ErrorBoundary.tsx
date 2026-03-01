import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { Button } from "./Button";
import { ArrowCounterClockwise, WarningCircle } from "@phosphor-icons/react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Label shown in the recovery UI (e.g. "Simulation", "Canvas") */
  region?: string;
  /** Optional callback when an error is caught */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Optional custom fallback — if omitted, the default recovery card is rendered */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.region ? ` – ${this.props.region}` : ""}]`, error, info);
    this.props.onError?.(error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const regionLabel = this.props.region ?? "This section";

      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center h-full min-h-[200px]">
          <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
            <WarningCircle size={24} weight="duotone" className="text-danger" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-text mb-1">
              Something went wrong
            </h3>
            <p className="text-xs text-text-muted max-w-xs">
              {regionLabel} encountered an unexpected error. You can retry or return to the start.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={this.handleRetry} size="sm" variant="secondary">
              <ArrowCounterClockwise size={14} weight="bold" className="mr-1.5" />
              Retry
            </Button>
            <Button
              onClick={() => {
                window.location.hash = "";
                window.location.reload();
              }}
              size="sm"
              variant="tertiary"
            >
              Start over
            </Button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 text-[0.6rem] text-danger/60 bg-danger/5 rounded-lg p-3 max-w-md overflow-auto text-left whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
