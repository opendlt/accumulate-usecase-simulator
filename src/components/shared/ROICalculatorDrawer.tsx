import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { useROIStore } from "@/store/roi-store";
import { useScenarioStore } from "@/store";
import { computeROIProjection, formatCurrency, formatHours } from "@/lib/roi-calculator";
import { INDUSTRY_DEFAULTS } from "@/types/roi";
import type { UserROIInputs } from "@/types/roi";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function ROICalculatorDrawer() {
  const { inputs, drawerOpen, setInputs, closeDrawer } = useROIStore();
  const { activeScenario } = useScenarioStore();
  const industryId = activeScenario?.industryId ?? "saas";
  const defaults = INDUSTRY_DEFAULTS[industryId] ?? INDUSTRY_DEFAULTS.saas;

  const [form, setForm] = useState<UserROIInputs>({
    monthlyWorkflows: inputs?.monthlyWorkflows ?? defaults?.monthlyWorkflows ?? 200,
    avgTimePerApprovalHours: inputs?.avgTimePerApprovalHours ?? defaults?.avgTimePerApprovalHours ?? 4,
    avgHourlyCost: inputs?.avgHourlyCost ?? defaults?.avgHourlyCost ?? 85,
    annualAuditFindings: inputs?.annualAuditFindings ?? defaults?.annualAuditFindings ?? 10,
  });

  useEffect(() => {
    if (drawerOpen && !inputs) {
      setForm({
        monthlyWorkflows: defaults?.monthlyWorkflows ?? 200,
        avgTimePerApprovalHours: defaults?.avgTimePerApprovalHours ?? 4,
        avgHourlyCost: defaults?.avgHourlyCost ?? 85,
        annualAuditFindings: defaults?.annualAuditFindings ?? 10,
      });
    }
  }, [drawerOpen, inputs, defaults]);

  const accTimeSeconds = 30; // approximate Accumulate run time
  const projection = computeROIProjection(form, accTimeSeconds);

  const handleChange = (field: keyof UserROIInputs, value: string) => {
    const num = Number(value);
    if (!isNaN(num) && num >= 0) {
      const next = { ...form, [field]: num };
      setForm(next);
      setInputs(next);
    }
  };

  const handleSave = () => {
    setInputs(form);
    closeDrawer();
    trackEvent("roi_calculator_saved", {
      monthlyWorkflows: form.monthlyWorkflows,
      annualSavings: projection.annualSavings,
    });
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[61] bg-surface border-t border-border rounded-t-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-3 bg-surface rounded-t-2xl border-b border-overlay/[0.06]">
              <div>
                <h3 className="font-heading text-base font-bold text-text">
                  Customize Your Numbers
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Enter your org metrics to see projected savings
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-overlay/[0.06] transition-colors cursor-pointer"
              >
                <X size={16} className="text-text-muted" />
              </button>
            </div>

            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input fields */}
              <div className="space-y-4">
                <InputField
                  label="Monthly Approval Workflows"
                  value={form.monthlyWorkflows}
                  onChange={(v) => handleChange("monthlyWorkflows", v)}
                  suffix="per month"
                />
                <InputField
                  label="Avg Time per Approval"
                  value={form.avgTimePerApprovalHours}
                  onChange={(v) => handleChange("avgTimePerApprovalHours", v)}
                  suffix="hours"
                />
                <InputField
                  label="Avg Hourly Cost"
                  value={form.avgHourlyCost}
                  onChange={(v) => handleChange("avgHourlyCost", v)}
                  prefix="$"
                  suffix="/hour"
                />
                <InputField
                  label="Annual Audit Findings"
                  value={form.annualAuditFindings}
                  onChange={(v) => handleChange("annualAuditFindings", v)}
                  suffix="per year"
                />
              </div>

              {/* Live projection preview */}
              <div className="space-y-3">
                <div className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">
                  Projected Annual Impact
                </div>
                <div className="rounded-xl border border-overlay/[0.06] bg-surface/60 p-4 space-y-3">
                  <ProjectionRow
                    label="Current Annual Cost"
                    value={formatCurrency(projection.annualManualCost)}
                    color="text-danger"
                  />
                  <ProjectionRow
                    label="With Accumulate"
                    value={formatCurrency(projection.annualAccumulateCost)}
                    color="text-success"
                  />
                  <div className="border-t border-overlay/[0.06] pt-3">
                    <AnimatedSavingsRow savings={projection.annualSavings} />
                  </div>
                  <ProjectionRow
                    label="Time Recovered"
                    value={formatHours(projection.timeRecoveredHoursPerYear) + "/year"}
                    color="text-primary"
                  />
                  <ProjectionRow
                    label="Audit Findings Eliminated"
                    value={`${projection.auditFindingsEliminated}/year`}
                    color="text-primary"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className={cn(
                    "w-full h-10 text-sm font-semibold rounded-[10px] transition-colors cursor-pointer",
                    "bg-primary text-white hover:bg-primary-hover"
                  )}
                >
                  Apply to Comparison
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm text-text-muted">{prefix}</span>}
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-9 px-3 text-sm bg-bg border border-border rounded-[8px] text-text focus:border-primary focus:outline-none transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && <span className="text-xs text-text-muted">{suffix}</span>}
      </div>
    </div>
  );
}

function ProjectionRow({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-xs text-text-muted", bold && "font-semibold text-text")}>
        {label}
      </span>
      <span className={cn("text-sm tabular-nums", color, bold && "font-bold text-base")}>
        {value}
      </span>
    </div>
  );
}

function AnimatedSavingsRow({ savings }: { savings: number }) {
  const animated = useAnimatedCounter(savings, { duration: 800 });
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-text">
        Projected Annual Savings
      </span>
      <span className="text-base font-bold tabular-nums text-success">
        {formatCurrency(animated)}
      </span>
    </div>
  );
}
