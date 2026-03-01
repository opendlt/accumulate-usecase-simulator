import { motion } from "framer-motion";
import { ArrowRight, Buildings, ArrowClockwise } from "@phosphor-icons/react";
import { GlowOrb } from "@/components/shared/GlowOrb";
import { useUIStore } from "@/store";
import { INDUSTRIES } from "@/scenarios/industries";
import { getSavedSession } from "@/lib/session-persistence";

const outcomes = [
  { metric: "80%", label: "faster approvals" },
  { metric: "100%", label: "audit coverage" },
  { metric: "0", label: "manual handoffs" },
];

export function HeroScreen() {
  const { navigateTo } = useUIStore();
  const savedSession = getSavedSession();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg overflow-y-auto">
      <GlowOrb color="#3B82F6" size={600} className="top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <GlowOrb color="#8B5CF6" size={400} className="bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-[0.04]" />

      <div className="relative z-10 max-w-3xl w-full px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2.5">
            <img
              src="/accumulate-logo.png"
              alt="Accumulate"
              className="w-10 h-10"
            />
            <span className="text-sm font-heading font-semibold text-text-muted">
              Accumulate
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="font-heading text-2xl md:text-4xl font-bold leading-tight">
            <span className="gradient-text">
              See how your organization can eliminate approval delays, security gaps, and audit failures
            </span>
            <br />
            <span className="text-text">in minutes.</span>
          </h1>
        </motion.div>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center text-text-muted text-sm md:text-base max-w-xl mx-auto mb-8"
        >
          Watch a real approval workflow in 60 seconds. See every bottleneck, every delay — then watch Accumulate eliminate them.
        </motion.p>

        {/* Outcome metrics */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex items-center justify-center gap-8 sm:gap-12 mb-8"
        >
          {outcomes.map((o) => (
            <div key={o.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">{o.metric}</div>
              <div className="text-[0.65rem] text-text-muted mt-0.5">{o.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Returning visitor welcome-back */}
        {savedSession && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex justify-center mb-4"
          >
            <button
              onClick={() => navigateTo("industry-picker")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/15 text-xs text-primary hover:bg-primary/10 transition-all cursor-pointer"
            >
              <ArrowClockwise size={14} weight="bold" />
              Welcome back! You last explored: <span className="font-semibold">{savedSession.scenarioName}</span>
              {savedSession.authorityGrade && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary/10 rounded text-[0.6rem] font-bold">
                  Score: {savedSession.authorityGrade}
                </span>
              )}
            </button>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => navigateTo("industry-picker")}
              className="inline-flex items-center gap-2 h-12 px-6 text-sm font-semibold rounded-[10px] bg-primary text-white hover:bg-primary-hover hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 cursor-pointer"
            >
              {savedSession ? "Run Another Simulation" : "Run a Simulation"}
              <ArrowRight size={16} weight="bold" />
            </button>
            <button
              onClick={() => navigateTo("org-builder")}
              className="inline-flex items-center gap-2 h-10 px-5 text-xs font-medium rounded-[10px] text-text-muted border border-border hover:bg-surface/60 hover:text-text transition-all duration-300 cursor-pointer"
            >
              <Buildings size={14} />
              Model Your Organization
            </button>
          </div>
        </motion.div>

        {/* Trust row — industry badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center justify-center gap-4 flex-wrap mb-4"
        >
          {INDUSTRIES.map((ind) => (
            <span
              key={ind.id}
              className="inline-flex items-center gap-1.5 text-[0.65rem] text-text-subtle px-2.5 py-1 rounded-full border border-overlay/[0.06] bg-surface/40"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: ind.color }}
              />
              {ind.shortName}
            </span>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center text-[0.65rem] text-text-subtle"
        >
          Trusted by teams in defense, finance, healthcare, and SaaS
        </motion.p>
      </div>
    </div>
  );
}
