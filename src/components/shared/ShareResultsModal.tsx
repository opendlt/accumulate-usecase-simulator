import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link, EnvelopeSimple, FileArrowDown, Check } from "@phosphor-icons/react";
import { useUIStore, useScenarioStore, useSimulationStore } from "@/store";
import { useROIStore } from "@/store/roi-store";
import { buildShareResultsUrl } from "@/lib/url-codec";
import { generateAssessmentHTML } from "@/lib/assessment-generator";
import { generateDualComparison, generateVerificationQueries } from "@/engine/verification";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function ShareResultsModal() {
  const { showShareResultsModal, setShowShareResultsModal } = useUIStore();
  const { activeScenario } = useScenarioStore();
  const { todayRun, accumulateRun } = useSimulationStore();
  const { inputs: roiInputs } = useROIStore();
  const [copied, setCopied] = useState(false);

  const scenarioId = activeScenario?.id ?? "";
  const industryId = activeScenario?.industryId;
  const shareUrl = buildShareResultsUrl(scenarioId, industryId);

  const handleCopyLink = async () => {
    trackEvent("share_link_copied", { scenarioId });
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmailShare = () => {
    trackEvent("share_email_opened", { scenarioId });
    const scenarioName = activeScenario?.name ?? "this scenario";
    const industryName = activeScenario?.industryId ?? "your industry";
    const subject = encodeURIComponent(
      `See how ${industryName} can eliminate approval delays`
    );
    const body = encodeURIComponent(
      [
        `I ran a simulation comparing today's manual approval process with Accumulate's programmable authority for "${scenarioName}".`,
        ``,
        `The results are striking — check them out:`,
        shareUrl,
        ``,
        `The simulator takes about 60 seconds and requires no signup.`,
      ].join("\n")
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleDownloadAssessment = () => {
    if (!todayRun || !accumulateRun || !activeScenario) return;
    trackEvent("assessment_downloaded", { scenarioId });

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
      shareUrl,
    });

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  const handleClose = () => {
    setShowShareResultsModal(false);
    setCopied(false);
  };

  return (
    <AnimatePresence>
      {showShareResultsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-surface/95 backdrop-blur-md border border-overlay/[0.08] rounded-2xl w-full max-w-md shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-overlay/[0.06]">
              <h2 className="font-heading text-lg font-bold text-text">
                Share Results
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-overlay/[0.06] transition-colors cursor-pointer"
              >
                <X size={16} className="text-text-muted" />
              </button>
            </div>

            {/* Sharing options */}
            <div className="px-6 py-5 space-y-3">
              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer text-left",
                  copied
                    ? "border-success/30 bg-success/5"
                    : "border-overlay/[0.06] bg-surface/60 hover:bg-surface/80"
                )}
              >
                {copied ? (
                  <Check size={18} weight="bold" className="text-success shrink-0" />
                ) : (
                  <Link size={18} className="text-primary shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text">
                    {copied ? "Link copied!" : "Copy share link"}
                  </div>
                  <div className="text-xs text-text-muted truncate">
                    {shareUrl}
                  </div>
                </div>
              </button>

              {/* Email */}
              <button
                onClick={handleEmailShare}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-overlay/[0.06] bg-surface/60 hover:bg-surface/80 transition-all cursor-pointer text-left"
              >
                <EnvelopeSimple size={18} className="text-primary shrink-0" />
                <div>
                  <div className="text-sm font-medium text-text">
                    Email results
                  </div>
                  <div className="text-xs text-text-muted">
                    Pre-filled email with scenario summary and link
                  </div>
                </div>
              </button>

              {/* Download */}
              <button
                onClick={handleDownloadAssessment}
                disabled={!todayRun || !accumulateRun}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-overlay/[0.06] bg-surface/60 hover:bg-surface/80 transition-all cursor-pointer text-left disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileArrowDown size={18} className="text-primary shrink-0" />
                <div>
                  <div className="text-sm font-medium text-text">
                    Download assessment
                  </div>
                  <div className="text-xs text-text-muted">
                    Full PDF report with comparison, ROI, and evidence
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
