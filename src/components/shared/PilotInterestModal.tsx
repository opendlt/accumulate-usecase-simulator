import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "@phosphor-icons/react";
import { z } from "zod";
import { useUIStore, useScenarioStore } from "@/store";
import { PILOT_TRACKS, PILOT_EMAIL, API_ENDPOINTS } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "aas-pilot-submission";

const PilotFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  organization: z.string().min(1, "Organization is required"),
  industry: z.string().min(1, "Industry is required"),
  pilotTrack: z.string().min(1, "Please select a pilot track"),
  urgency: z.string().min(1, "Please select urgency"),
  workflowDescription: z.string().optional(),
});

type PilotFormData = z.infer<typeof PilotFormSchema>;

const URGENCY_OPTIONS = [
  { id: "exploring", label: "Just exploring" },
  { id: "evaluating", label: "Actively evaluating (1-3 months)" },
  { id: "urgent", label: "Urgent need (< 1 month)" },
] as const;

export function PilotInterestModal() {
  const {
    showPilotInterestModal,
    setShowPilotInterestModal,
    pilotInterestSubmitted,
    setPilotInterestSubmitted,
  } = useUIStore();
  const { activeScenario, activeIndustry } = useScenarioStore();

  const [form, setForm] = useState<PilotFormData>({
    name: "",
    email: "",
    organization: "",
    industry: activeIndustry?.name ?? "",
    pilotTrack: "",
    urgency: "",
    workflowDescription: activeScenario?.name ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PilotFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pre-fill from stored submission or scenario context
  useEffect(() => {
    if (showPilotInterestModal) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setForm((f) => ({ ...f, ...parsed }));
        } catch { /* ignore */ }
      }
      // Auto-fill from context
      setForm((f) => ({
        ...f,
        industry: f.industry || activeIndustry?.name || "",
        workflowDescription: f.workflowDescription || activeScenario?.name || "",
      }));
    }
  }, [showPilotInterestModal, activeIndustry?.name, activeScenario?.name]);

  const handleChange = (field: keyof PilotFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const result = PilotFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof PilotFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PilotFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(API_ENDPOINTS.pilotIntake, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) throw new Error("API error");

      handleSuccess(result.data);
    } catch {
      // Fallback: mailto
      const subject = encodeURIComponent(
        `Pilot Interest: ${form.organization} — ${form.pilotTrack}`
      );
      const body = encodeURIComponent(
        [
          `Name: ${form.name}`,
          `Email: ${form.email}`,
          `Organization: ${form.organization}`,
          `Industry: ${form.industry}`,
          `Pilot Track: ${form.pilotTrack}`,
          `Urgency: ${form.urgency}`,
          `Workflow: ${form.workflowDescription || "N/A"}`,
          ``,
          `Submitted from Accumulate Authority Simulator`,
        ].join("\n")
      );
      window.open(`mailto:${PILOT_EMAIL}?subject=${subject}&body=${body}`, "_blank");
      handleSuccess(result.data);
    }
  };

  const handleSuccess = (data: PilotFormData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem("aas-pilot-submitted", "true");
    setPilotInterestSubmitted(true);
    setSubmitting(false);
    setSuccess(true);
    trackEvent("pilot_form_submitted", {
      industry: data.industry,
      pilotTrack: data.pilotTrack,
      urgency: data.urgency,
    });
  };

  const handleClose = () => {
    setShowPilotInterestModal(false);
    // Reset success state after modal closes
    setTimeout(() => setSuccess(false), 300);
  };

  return (
    <AnimatePresence>
      {showPilotInterestModal && (
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
            className="relative bg-surface/95 backdrop-blur-md border border-overlay/[0.08] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-overlay/[0.06]">
              <div>
                <h2 className="font-heading text-lg font-bold text-text">
                  {success ? "Request Submitted!" : "Start a Pilot"}
                </h2>
                {!success && (
                  <p className="text-xs text-text-muted mt-0.5">
                    Tell us about your organization and we&apos;ll reach out within 2 business days
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-overlay/[0.06] transition-colors cursor-pointer"
              >
                <X size={16} className="text-text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <AnimatePresence mode="wait">
                {success || pilotInterestSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-8 gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    >
                      <CheckCircle size={56} weight="fill" className="text-success" />
                    </motion.div>
                    <div className="text-center">
                      <h3 className="text-base font-semibold text-text mb-1">
                        We&apos;ll be in touch within 2 business days
                      </h3>
                      <p className="text-xs text-text-muted">
                        In the meantime, feel free to explore more scenarios or download your assessment report.
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="h-9 px-5 text-xs font-semibold rounded-[10px] bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
                    >
                      Continue Exploring
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        label="Name"
                        value={form.name}
                        onChange={(v) => handleChange("name", v)}
                        error={errors.name}
                        placeholder="Your name"
                      />
                      <FormField
                        label="Email"
                        value={form.email}
                        onChange={(v) => handleChange("email", v)}
                        error={errors.email}
                        type="email"
                        placeholder="you@company.com"
                      />
                    </div>

                    {/* Organization & Industry */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        label="Organization"
                        value={form.organization}
                        onChange={(v) => handleChange("organization", v)}
                        error={errors.organization}
                        placeholder="Your company"
                      />
                      <FormField
                        label="Industry"
                        value={form.industry}
                        onChange={(v) => handleChange("industry", v)}
                        error={errors.industry}
                        placeholder="e.g. Financial Services"
                      />
                    </div>

                    {/* Pilot Track */}
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">
                        Pilot Track
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PILOT_TRACKS.map((track) => (
                          <button
                            key={track.id}
                            onClick={() => handleChange("pilotTrack", track.id)}
                            className={cn(
                              "px-3 py-1.5 text-xs rounded-[8px] border transition-all cursor-pointer",
                              form.pilotTrack === track.id
                                ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                                : "text-text-muted border-border hover:bg-overlay/[0.04]"
                            )}
                          >
                            {track.label}
                          </button>
                        ))}
                      </div>
                      {errors.pilotTrack && (
                        <p className="text-[0.65rem] text-danger mt-1">{errors.pilotTrack}</p>
                      )}
                    </div>

                    {/* Urgency */}
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">
                        Timeline
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {URGENCY_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleChange("urgency", opt.id)}
                            className={cn(
                              "px-3 py-1.5 text-xs rounded-[8px] border transition-all cursor-pointer",
                              form.urgency === opt.id
                                ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                                : "text-text-muted border-border hover:bg-overlay/[0.04]"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {errors.urgency && (
                        <p className="text-[0.65rem] text-danger mt-1">{errors.urgency}</p>
                      )}
                    </div>

                    {/* Workflow Description */}
                    <FormField
                      label="Workflow Description (optional)"
                      value={form.workflowDescription ?? ""}
                      onChange={(v) => handleChange("workflowDescription", v)}
                      placeholder="Describe the approval workflow you'd like to automate"
                      multiline
                    />

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className={cn(
                        "w-full h-10 text-sm font-semibold rounded-[10px] transition-colors cursor-pointer",
                        "bg-primary text-white hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
                      )}
                    >
                      {submitting ? "Submitting..." : "Request a Pilot"}
                    </button>

                    <p className="text-[0.6rem] text-text-subtle text-center">
                      We&apos;ll reach out within 2 business days. No spam, ever.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FormField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const inputClasses = cn(
    "w-full px-3 text-sm bg-bg border rounded-[8px] text-text focus:border-primary focus:outline-none transition-colors",
    error ? "border-danger" : "border-border"
  );

  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={cn(inputClasses, "py-2 resize-none")}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(inputClasses, "h-9")}
        />
      )}
      {error && <p className="text-[0.65rem] text-danger mt-1">{error}</p>}
    </div>
  );
}
