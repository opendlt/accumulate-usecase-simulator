import { useCallback } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { useSimulationStore, useUIStore } from "@/store";

export function VerificationTab() {
  const { evidence } = useSimulationStore();
  const { setEvidenceTab } = useUIStore();

  const handleRefClick = useCallback(
    (ref: string) => {
      // Switch to Audit Log tab (index 0)
      setEvidenceTab(0);

      // Extract index from ref like "Event #3" or "audit-3"
      const indexMatch = ref.match(/\d+/);
      if (indexMatch) {
        const index = indexMatch[0];
        // Scroll to the matching audit row after a brief delay for tab switch
        requestAnimationFrame(() => {
          const row = document.querySelector(`[data-audit-index="${index}"]`);
          if (row) {
            row.scrollIntoView({ behavior: "smooth", block: "center" });
            // Brief highlight
            row.classList.add("!bg-primary/10");
            setTimeout(() => row.classList.remove("!bg-primary/10"), 1500);
          }
        });
      }
    },
    [setEvidenceTab]
  );

  if (!evidence) {
    return (
      <div className="text-xs text-text-subtle text-center py-8">
        Run a simulation to see verification results.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {evidence.verification.map((query, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
        >
          <GlassCard className="!p-3">
            <p className="text-xs font-semibold text-text">{query.question}</p>
            <p className="text-[0.7rem] text-text-muted mt-1.5 leading-relaxed">
              {query.answer}
            </p>
            {query.evidence.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {query.evidence.map((ref, j) => (
                  <button
                    key={j}
                    onClick={() => handleRefClick(ref)}
                    className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded bg-primary-soft text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    {ref}
                  </button>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
