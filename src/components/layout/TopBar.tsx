import { Question, ShareNetwork, CaretRight, Wrench, House } from "@phosphor-icons/react";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useUIStore, useScenarioStore } from "@/store";
import { buildShareUrl, setScenarioIdInUrl } from "@/lib/url-codec";

interface TopBarProps {
  compact?: boolean;
}

export function TopBar({ compact }: TopBarProps) {
  const { screen, setShowHelpDrawer, navigateTo, enterAdvancedMode } = useUIStore();
  const { activeScenario, activeIndustry } = useScenarioStore();

  const isGuidedFlow = screen === "simulation" || screen === "evidence";
  const isSandbox = screen === "sandbox";

  return (
    <header className={`${compact ? "h-10" : "h-14"} border-b border-border flex items-center justify-between px-4 bg-surface/80 backdrop-blur-sm shrink-0 transition-all duration-300`}>
      {/* Left: Logo + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigateTo("hero")}
          className="shrink-0 cursor-pointer"
        >
          <Logo />
        </button>

        {/* Breadcrumbs for guided flow (hidden in compact mode) */}
        {!compact && isGuidedFlow && activeIndustry && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-text-muted min-w-0">
            <CaretRight size={10} className="text-text-subtle shrink-0" />
            <button
              onClick={() => navigateTo("industry-picker")}
              className="hover:text-text transition-colors cursor-pointer truncate"
            >
              {activeIndustry.shortName}
            </button>
            {activeScenario && (
              <>
                <CaretRight size={10} className="text-text-subtle shrink-0" />
                <button
                  onClick={() => navigateTo("scenario-selector")}
                  className="hover:text-text transition-colors cursor-pointer truncate"
                >
                  {activeScenario.name}
                </button>
              </>
            )}
          </div>
        )}

        {/* Sandbox indicator */}
        {isSandbox && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-text-muted">
            <CaretRight size={10} className="text-text-subtle" />
            <span className="text-warning font-medium">Advanced Mode</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Back to guided demo (when in sandbox) */}
        {isSandbox && (
          <button
            onClick={() => navigateTo("hero")}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-text-muted rounded-[8px] border border-border hover:bg-surface-2 hover:text-text transition-colors cursor-pointer mr-1"
          >
            <House size={13} />
            Guided Demo
          </button>
        )}

        {/* Advanced Mode (when in guided flow, hidden in compact mode) */}
        {!compact && isGuidedFlow && (
          <button
            onClick={enterAdvancedMode}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-text-muted rounded-[8px] border border-border hover:bg-surface-2 hover:text-text transition-colors cursor-pointer mr-1"
          >
            <Wrench size={13} />
            <span className="hidden sm:inline">Advanced</span>
          </button>
        )}

        {/* Share */}
        <button
          onClick={() => {
            if (activeScenario) {
              setScenarioIdInUrl(activeScenario.id);
              navigator.clipboard.writeText(buildShareUrl(activeScenario.id));
            }
          }}
          className="p-2 rounded-[10px] text-text-muted hover:text-text hover:bg-overlay/[0.04] transition-colors cursor-pointer"
          aria-label="Share"
        >
          <ShareNetwork size={18} />
        </button>

        {/* Help */}
        <button
          onClick={() => setShowHelpDrawer(true)}
          className="p-2 rounded-[10px] text-text-muted hover:text-text hover:bg-overlay/[0.04] transition-colors cursor-pointer"
          aria-label="Help"
        >
          <Question size={18} />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
