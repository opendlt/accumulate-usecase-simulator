import { motion, AnimatePresence } from "framer-motion";
import { ChatCircleDots, ShareNetwork, Wrench, ChartBar } from "@phosphor-icons/react";
import { useUIStore } from "@/store";
import { useROIStore } from "@/store/roi-store";
import { AssessmentDownloadButton } from "@/components/shared/AssessmentDownloadButton";
import { PulseBeacon } from "@/components/shared/PulseBeacon";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function CtaBar() {
  const {
    showCtaBar,
    screen,
    enterAdvancedMode,
    cinematicActive,
    dualRunPhase,
    pilotInterestSubmitted,
    setShowPilotInterestModal,
    setShowShareResultsModal,
  } = useUIStore();
  const { openDrawer: openROIDrawer } = useROIStore();

  // Hide when comparison overlay is showing (resolution phase on simulation screen)
  const comparisonVisible = screen === "simulation" && dualRunPhase === "accumulate-done";
  const visible = showCtaBar && (screen === "simulation" || screen === "evidence") && !cinematicActive && !comparisonVisible;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md"
        >
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Primary CTA */}
            {pilotInterestSubmitted ? (
              <span className="inline-flex items-center gap-2 h-9 px-4 text-xs font-semibold rounded-[10px] bg-success/10 text-success border border-success/20">
                Pilot Request Sent
              </span>
            ) : (
              <button
                onClick={() => {
                  trackEvent("cta_talk_to_engineer", { source: "cta_bar" });
                  setShowPilotInterestModal(true);
                }}
                className={cn(
                  "inline-flex items-center gap-2 h-9 px-4 text-xs font-semibold rounded-[10px] transition-colors cursor-pointer",
                  "bg-primary text-white hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                )}
              >
                <PulseBeacon color="#ffffff" />
                <ChatCircleDots size={14} weight="bold" />
                Talk to an Engineer
              </button>
            )}

            {/* Secondary actions */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={openROIDrawer}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-text-muted rounded-[8px] border border-border hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
              >
                <ChartBar size={13} />
                <span className="hidden sm:inline">ROI Calculator</span>
              </button>

              <button
                onClick={() => setShowShareResultsModal(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-text-muted rounded-[8px] border border-border hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
              >
                <ShareNetwork size={13} />
                <span className="hidden sm:inline">Share</span>
              </button>

              <AssessmentDownloadButton />

              <button
                onClick={enterAdvancedMode}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-text-muted rounded-[8px] border border-border hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
              >
                <Wrench size={13} />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
