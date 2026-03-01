import { motion } from "framer-motion";
import { Badge } from "@/components/shared/Badge";
import { useSimulationStore } from "@/store";

export function AuditLogTab() {
  const { evidence, currentEventIndex } = useSimulationStore();

  if (!evidence) {
    return (
      <div className="text-xs text-text-subtle text-center py-8">
        Run a simulation to see the audit log.
      </div>
    );
  }

  const visibleEntries = evidence.auditLog.filter(
    (_, i) => i <= currentEventIndex || currentEventIndex === -1
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[0.65rem]">
        <thead>
          <tr className="text-text-subtle uppercase tracking-wider border-b border-border">
            <th className="text-left py-2 px-2 font-semibold">#</th>
            <th className="text-left py-2 px-2 font-semibold">Time</th>
            <th className="text-left py-2 px-2 font-semibold">Actor</th>
            <th className="text-left py-2 px-2 font-semibold">Action</th>
            <th className="text-left py-2 px-2 font-semibold">Result</th>
          </tr>
        </thead>
        <tbody>
          {visibleEntries.map((entry, i) => (
            <motion.tr
              key={entry.index}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              data-audit-index={entry.index}
              className="border-b border-border/50 hover:bg-overlay/[0.02] transition-colors"
            >
              <td className="py-1.5 px-2 font-mono text-text-subtle">{entry.index}</td>
              <td className="py-1.5 px-2 font-mono text-text-muted">{entry.timestamp}s</td>
              <td className="py-1.5 px-2 text-text font-medium">{entry.actor}</td>
              <td className="py-1.5 px-2 text-text-muted max-w-[240px] truncate">{entry.action}</td>
              <td className="py-1.5 px-2">
                <Badge
                  variant={
                    entry.result === "success"
                      ? "success"
                      : entry.result === "failure"
                        ? "danger"
                        : "warning"
                  }
                >
                  {entry.result}
                </Badge>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
