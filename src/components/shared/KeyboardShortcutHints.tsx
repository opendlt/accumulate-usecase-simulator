import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  { key: "Space", action: "Play / Pause" },
  { key: "F", action: "Skip to results" },
  { key: "R", action: "Reset simulation" },
  { key: "?", action: "Toggle this help" },
] as const;

export function KeyboardShortcutHints() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => !!localStorage.getItem("aas-shortcuts-dismissed")
  );

  // Show hint briefly after 10 seconds on first visit, then hide
  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 10000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (!visible || dismissed) return;
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [visible, dismissed]);

  // Listen for ? key to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("aas-shortcuts-dismissed", "true");
  };

  return (
    <>
      {/* Floating hint trigger */}
      <button
        onClick={() => setVisible((v) => !v)}
        className={cn(
          "fixed bottom-4 left-4 z-[45] w-8 h-8 flex items-center justify-center",
          "rounded-lg bg-surface/80 border border-border/50 text-text-subtle",
          "hover:text-text hover:bg-surface transition-all cursor-pointer",
          "backdrop-blur-sm shadow-sm"
        )}
        title="Keyboard shortcuts (?)"
      >
        <Keyboard size={14} />
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-14 left-4 z-[45] bg-surface/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-xl min-w-[180px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">
                Shortcuts
              </span>
              <button
                onClick={handleDismiss}
                className="text-text-subtle hover:text-text transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
            <div className="space-y-1.5">
              {SHORTCUTS.map(({ key, action }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-[0.65rem] text-text-muted">{action}</span>
                  <kbd className="text-[0.6rem] font-mono bg-bg px-1.5 py-0.5 rounded border border-border text-text-subtle">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
