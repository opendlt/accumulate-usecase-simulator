import { motion } from "framer-motion";
import type { IndustryId } from "@/types/industry";

interface OrgPreviewCanvasProps {
  orgName: string;
  departments: string[];
  roles: Record<string, string[]>;
  industryId: IndustryId | null;
}

export function OrgPreviewCanvas({ orgName, departments, roles }: OrgPreviewCanvasProps) {
  if (!orgName && departments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-subtle text-xs">
        Your org chart will appear here
      </div>
    );
  }

  const typeStyles = {
    org: "bg-primary/15 border-primary/30 text-primary font-semibold",
    dept: "bg-cyan-500/10 border-cyan-500/25 text-cyan-400",
    role: "bg-slate-500/10 border-slate-500/20 text-text-muted",
  };

  return (
    <div className="h-full overflow-auto p-4">
      <div className="space-y-3">
        {/* Org node */}
        {orgName && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs ${typeStyles.org}`}
          >
            {orgName}
          </motion.div>
        )}

        {/* Department groups */}
        {departments.length > 0 && (
          <div className="ml-4 border-l border-border/40 pl-4 space-y-3">
            {departments.map((dept) => {
              const deptRoles = roles[dept] ?? [];
              return (
                <motion.div
                  key={dept}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs ${typeStyles.dept}`}>
                    {dept}
                  </div>
                  {deptRoles.length > 0 && (
                    <div className="ml-4 border-l border-border/30 pl-3 mt-1.5 space-y-1">
                      {deptRoles.map((role) => (
                        <motion.div
                          key={`${dept}-${role}`}
                          layout
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[0.65rem] ${typeStyles.role}`}
                        >
                          {role}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
