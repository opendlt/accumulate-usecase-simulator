import { useState } from "react";
import { X, Plus } from "@phosphor-icons/react";

interface StepRolesProps {
  departments: string[];
  roles: Record<string, string[]>;
  onRolesChange: (roles: Record<string, string[]>) => void;
}

export function StepRoles({ departments, roles, onRolesChange }: StepRolesProps) {
  const [activeInput, setActiveInput] = useState<Record<string, string>>({});

  const handleAdd = (dept: string) => {
    const name = (activeInput[dept] ?? "").trim();
    if (!name) return;
    const current = roles[dept] ?? [];
    if (current.includes(name)) return;
    onRolesChange({ ...roles, [dept]: [...current, name] });
    setActiveInput({ ...activeInput, [dept]: "" });
  };

  const handleRemove = (dept: string, index: number) => {
    const current = roles[dept] ?? [];
    onRolesChange({ ...roles, [dept]: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-5">
      <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
        Roles by Department
      </label>

      {departments.map((dept) => {
        const deptRoles = roles[dept] ?? [];
        return (
          <div key={dept} className="rounded-xl border border-overlay/[0.06] bg-surface/30 p-3">
            <div className="text-xs font-semibold text-text mb-2">{dept}</div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {deptRoles.map((role, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs bg-overlay/[0.06] text-text-muted px-2.5 py-1 rounded-full"
                >
                  {role}
                  <button
                    onClick={() => handleRemove(dept, i)}
                    className="hover:text-danger transition-colors cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {deptRoles.length === 0 && (
                <span className="text-xs text-text-subtle italic">No roles yet</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={activeInput[dept] ?? ""}
                onChange={(e) => setActiveInput({ ...activeInput, [dept]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAdd(dept)}
                placeholder="Add role name..."
                className="flex-1 h-8 px-2.5 text-xs bg-bg border border-border rounded-[6px] text-text placeholder:text-text-subtle focus:border-primary focus:outline-none transition-colors"
              />
              <button
                onClick={() => handleAdd(dept)}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-text-muted hover:bg-surface/60 hover:text-text transition-colors cursor-pointer"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
