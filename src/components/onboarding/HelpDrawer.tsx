import { motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { useUIStore } from "@/store";

const sections = [
  {
    title: "1. Choose Your Industry",
    description:
      "Select the industry closest to your organization. Each industry has pre-built scenarios reflecting real-world authorization challenges.",
  },
  {
    title: "2. Pick a Scenario",
    description:
      "Choose a workflow to simulate. You'll see a side-by-side comparison of today's manual process vs. Accumulate's automated approach.",
  },
  {
    title: "3. Watch the Comparison",
    description:
      "The simulator runs both processes in sequence. Watch bottlenecks and delays in today's process, then see Accumulate eliminate them.",
  },
  {
    title: "4. Review the Evidence",
    description:
      "After the simulation, explore the audit trail, cryptographic proof, and compliance verification. Everything is independently verifiable.",
  },
];

const glossary = [
  { term: "Digital Identity", definition: "A named, verifiable identity for any organization, team, or role — not a username, but a cryptographic anchor." },
  { term: "Authority", definition: "The right to approve actions, governed by programmable policies instead of email chains." },
  { term: "Threshold", definition: "A k-of-n approval requirement — e.g., 2-of-3 authorized signers must approve before an action proceeds." },
  { term: "Delegation", definition: "Temporarily transferring approval authority to another identity, with automatic constraints and expiry." },
  { term: "Authority Registry", definition: "Defines who can sign and what they need to approve — the programmable replacement for org charts and spreadsheets." },
  { term: "Audit Evidence", definition: "Cryptographic proof that an action was properly authorized — auditors can independently verify every authorization." },
];

export function HelpDrawer() {
  const { setShowHelpDrawer, setShowPilotInterestModal } = useUIStore();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowHelpDrawer(false)}
        className="fixed inset-0 z-40 bg-black/40"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[360px] max-w-full bg-surface border-l border-border overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-lg font-semibold text-text">
              Quick Guide
            </h2>
            <button
              onClick={() => setShowHelpDrawer(false)}
              className="p-1.5 rounded-[8px] text-text-muted hover:text-text hover:bg-overlay/[0.04] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 60-second guide */}
          <div className="space-y-4 mb-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <h3 className="text-sm font-semibold text-text">{section.title}</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {section.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* What is Accumulate */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-text mb-2">What is Accumulate?</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Accumulate is a blockchain protocol that gives every organization a programmable,
              verifiable identity. Authority policies (thresholds, delegation, expiry) are
              enforced at the protocol level, producing audit-ready cryptographic proof that
              any action was properly authorized.
            </p>
          </div>

          {/* Glossary */}
          <div>
            <h3 className="text-sm font-semibold text-text mb-3">Glossary</h3>
            <div className="space-y-2">
              {glossary.map((item) => (
                <div key={item.term}>
                  <span className="text-xs font-semibold text-primary">{item.term}</span>
                  <p className="text-[0.65rem] text-text-muted mt-0.5">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="mt-8 pt-4 border-t border-border">
            <a
              href="https://docs.accumulatenetwork.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Full Documentation
            </a>
            <span className="text-text-subtle mx-2">|</span>
            <a
              href="https://accumulatenetwork.io/pilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Start a Pilot
            </a>
            <span className="text-text-subtle mx-2">|</span>
            <button
              onClick={() => {
                setShowHelpDrawer(false);
                setShowPilotInterestModal(true);
              }}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Talk to an Engineer
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
