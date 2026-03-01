import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatCircleDots, ChartBar, Eye, ArrowCounterClockwise } from "@phosphor-icons/react";
import type { BeforeAfterComparison } from "@/types/evidence";
import type { RegulatoryContext } from "@/types/regulatory";
import { AuditLogTab } from "@/components/evidence/AuditLogTab";
import { TimelineTab } from "@/components/evidence/TimelineTab";
import { ProofArtifactTab } from "@/components/evidence/ProofArtifactTab";
import { VerificationTab } from "@/components/evidence/VerificationTab";
import { ExportButton } from "@/components/evidence/ExportButton";
import { AssessmentDownloadButton } from "@/components/shared/AssessmentDownloadButton";
import { AuthorityScoreCard } from "@/components/shared/AuthorityScoreCard";
import { SocialProofBar } from "@/components/shared/SocialProofBar";
import { PulseBeacon } from "@/components/shared/PulseBeacon";
import { useSimulationStore, useUIStore, useScenarioStore } from "@/store";
import { useROIStore } from "@/store/roi-store";
import { trackEvent } from "@/lib/analytics";
import { saveSession } from "@/lib/session-persistence";
import { cn } from "@/lib/utils";

interface ComparisonOverlayProps {
  comparisons: BeforeAfterComparison[];
  onContinue: () => void;
  onViewEvidence?: () => void;
  regulatoryContext?: RegulatoryContext[];
  todayViolationCount?: number;
}

const EVIDENCE_TABS = ["Audit Log", "Timeline", "Proof", "Verification"] as const;

export function ComparisonOverlay({ comparisons, onContinue, regulatoryContext, todayViolationCount }: ComparisonOverlayProps) {
  const [evidenceTab, setEvidenceTab] = useState<number | null>(null);
  const { evidence } = useSimulationStore();
  const { pilotInterestSubmitted, setShowPilotInterestModal, navigateTo, setShowShareResultsModal } = useUIStore();
  const { activeScenario, activeIndustry } = useScenarioStore();
  const { openDrawer: openROIDrawer } = useROIStore();
  const showEvidence = evidenceTab !== null;

  // Track comparison viewed + save session
  useState(() => {
    trackEvent("comparison_viewed", {
      scenarioId: activeScenario?.id ?? "",
      industryId: activeIndustry?.id ?? "",
    });
    if (activeScenario) {
      saveSession({
        scenarioId: activeScenario.id,
        scenarioName: activeScenario.name,
        industryId: activeScenario.industryId ?? "",
        industryName: activeIndustry?.name ?? "",
        completedAt: Date.now(),
      });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center px-4 sm:px-6 py-4 pointer-events-none"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-bg/60 backdrop-blur-sm pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onContinue}
      />

      {/* Modal — scrollable container */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
        className="pointer-events-auto relative bg-surface/95 backdrop-blur-md border border-overlay/[0.08] rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* ── Sticky header ── */}
        <div className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 pt-5 pb-4 border-b border-overlay/[0.06] bg-surface/95 backdrop-blur-md rounded-t-2xl">
          <div>
            <h2 className="font-heading text-lg font-bold text-text">
              Comparison Results
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Manual process vs. Accumulate&apos;s programmable authority
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {evidence && <ExportButton />}
            <button
              onClick={() => setShowShareResultsModal(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-text-muted rounded-[8px] border border-border hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
            >
              Share
            </button>
            <AssessmentDownloadButton />
            <button
              onClick={() => navigateTo("evidence")}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-[8px] transition-colors cursor-pointer",
                "text-text-muted border border-border hover:bg-surface-2 hover:text-text"
              )}
            >
              <Eye size={13} />
              View Evidence
            </button>
            {pilotInterestSubmitted ? (
              <span className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-[10px] bg-success/10 text-success border border-success/20">
                Request Sent
              </span>
            ) : (
              <button
                onClick={() => {
                  trackEvent("cta_talk_to_engineer", { source: "comparison_overlay" });
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
            <button
              onClick={onContinue}
              className={cn(
                "h-8 px-3 text-xs font-medium rounded-[8px] transition-colors cursor-pointer",
                "text-text-muted border border-border hover:bg-surface-2 hover:text-text"
              )}
            >
              <ArrowCounterClockwise size={13} className="inline mr-1" />
              Run Another Scenario
            </button>
          </div>
        </div>

        {/* ── Comparison table ── */}
        <div className="px-4 sm:px-6 pt-4 pb-3">
          <div className="rounded-xl border border-overlay/[0.06] overflow-hidden">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-0 bg-overlay/[0.04] border-b border-overlay/[0.06] text-[0.65rem] uppercase tracking-wider font-semibold text-text-muted">
              <div className="px-4 py-2.5">Metric</div>
              <div className="px-4 py-2.5 text-center text-danger/80">Today</div>
              <div className="px-4 py-2.5 text-center text-success/80">Accumulate</div>
              <div className="px-4 py-2.5 text-center">Improvement</div>
            </div>

            {/* Data rows */}
            {comparisons.map((item, i) => (
              <motion.div
                key={item.metric}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className={cn(
                  "grid grid-cols-2 sm:grid-cols-[1.2fr_1fr_1fr_1fr] gap-0 items-center",
                  i < comparisons.length - 1 && "border-b border-overlay/[0.04]"
                )}
              >
                <div className="px-4 py-3 text-sm font-medium text-text col-span-2 sm:col-span-1">{item.metric}</div>
                <div className="px-4 py-2 sm:py-3 text-center text-sm text-text-muted">
                  <span className="sm:hidden text-[0.6rem] text-danger/60 uppercase block">Today</span>
                  {String(item.before)}
                </div>
                <div className="px-4 py-2 sm:py-3 text-center text-sm text-success font-semibold">
                  <span className="sm:hidden text-[0.6rem] text-success/60 uppercase block">Accumulate</span>
                  {String(item.after)}
                </div>
                <div className="px-4 py-2 sm:py-3 text-center col-span-2 sm:col-span-1">
                  <span className="text-xs text-success font-semibold bg-success/10 px-3 py-1 rounded-full">
                    {item.improvement}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── ROI Teaser Banner ── */}
        <div className="px-4 sm:px-6 pb-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10"
          >
            <div className="flex items-center gap-2.5">
              <ChartBar size={18} className="text-primary shrink-0" weight="bold" />
              <div>
                <div className="text-sm font-semibold text-text">
                  What does this mean for your organization?
                </div>
                <div className="text-xs text-text-muted">
                  Enter your numbers to see projected annual savings
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                trackEvent("roi_calculator_opened", { source: "comparison_overlay" });
                openROIDrawer();
              }}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-[10px] transition-colors cursor-pointer shrink-0",
                "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
              )}
            >
              Calculate Your ROI
            </button>
          </motion.div>
        </div>

        {/* ── Authority Score Card ── */}
        <div className="px-4 sm:px-6 pb-3">
          <AuthorityScoreCard
            comparisons={comparisons}
            todayViolationCount={todayViolationCount ?? 0}
          />
        </div>

        {/* ── Social Proof ── */}
        <div className="px-4 sm:px-6 pb-3">
          <SocialProofBar industryFilter={activeIndustry?.shortName} />
        </div>

        {/* ── Regulatory Exposure section ── */}
        {regulatoryContext && regulatoryContext.length > 0 && (
          <div className="px-4 sm:px-6 pb-3">
            <div className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider mb-2">
              Regulatory Exposure
            </div>
            <div className="rounded-xl border border-overlay/[0.06] overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1.2fr_1fr_1fr_0.8fr] gap-0 bg-overlay/[0.04] border-b border-overlay/[0.06] text-[0.6rem] uppercase tracking-wider font-semibold text-text-muted">
                <div className="px-4 py-2">Framework</div>
                <div className="px-4 py-2 text-danger/80">Violation (Today)</div>
                <div className="px-4 py-2 text-success/80">Safeguard (Accumulate)</div>
                <div className="px-4 py-2 text-center">Fine Range</div>
              </div>
              {regulatoryContext.map((reg, i) => (
                <motion.div
                  key={reg.framework}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className={cn(
                    "grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr_0.8fr] gap-0 items-start",
                    i < regulatoryContext.length - 1 && "border-b border-overlay/[0.04]"
                  )}
                >
                  <div className="px-4 py-2.5">
                    <span className="text-xs font-semibold text-text">{reg.displayName}</span>
                    {reg.clause && <span className="block text-[0.6rem] text-text-muted">{reg.clause}</span>}
                  </div>
                  <div className="px-4 py-2.5 text-[0.7rem] text-danger/80">
                    <span className="sm:hidden text-[0.55rem] text-danger/50 uppercase">Violation: </span>
                    {reg.violationDescription}
                  </div>
                  <div className="px-4 py-2.5 text-[0.7rem] text-success/80">
                    <span className="sm:hidden text-[0.55rem] text-success/50 uppercase">Safeguard: </span>
                    {reg.safeguardDescription}
                  </div>
                  <div className="px-4 py-2.5 text-center">
                    <span className="text-[0.6rem] text-danger font-semibold bg-danger/10 px-2 py-0.5 rounded-full">
                      {reg.fineRange}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            {todayViolationCount !== undefined && todayViolationCount > 0 && (
              <p className="text-[0.7rem] text-danger/70 mt-2">
                {todayViolationCount} compliance violation{todayViolationCount === 1 ? "" : "s"} detected during today&apos;s simulation run
              </p>
            )}
          </div>
        )}

        {/* ── Evidence section ── */}
        <div className="px-4 sm:px-6 pb-5">
          {/* Evidence tab bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider mr-1">
              Evidence
            </span>
            <div className="flex gap-1 p-1 rounded-[10px] bg-surface/60 border border-overlay/[0.06]">
              {EVIDENCE_TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setEvidenceTab(evidenceTab === i ? null : i)}
                  className={cn(
                    "px-3 py-1.5 text-[0.65rem] font-medium rounded-[8px] transition-all duration-200 cursor-pointer",
                    evidenceTab === i
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "text-text-muted hover:text-text hover:bg-overlay/[0.04] border border-transparent"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Evidence content — rendered inline, scrolls with modal */}
          <AnimatePresence mode="wait">
            {showEvidence && evidence && (
              <motion.div
                key={evidenceTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-xl border border-overlay/[0.06] p-4">
                  {evidenceTab === 0 && <AuditLogTab />}
                  {evidenceTab === 1 && <TimelineTab />}
                  {evidenceTab === 2 && <ProofArtifactTab />}
                  {evidenceTab === 3 && <VerificationTab />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
