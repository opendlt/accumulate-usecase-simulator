import { useState } from "react";
import { X, Plus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface StepStructureProps {
  departments: string[];
  onDepartmentsChange: (departments: string[]) => void;
}

export function StepStructure({ departments, onDepartmentsChange }: StepStructureProps) {
  const [newDept, setNewDept] = useState("");

  const handleAdd = () => {
    const trimmed = newDept.trim();
    if (trimmed && !departments.includes(trimmed)) {
      onDepartmentsChange([...departments, trimmed]);
      setNewDept("");
    }
  };

  const handleRemove = (index: number) => {
    onDepartmentsChange(departments.filter((_, i) => i !== index));
  };

  const handleRename = (index: number, newName: string) => {
    const updated = [...departments];
    updated[index] = newName;
    onDepartmentsChange(updated);
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
        Departments
      </label>

      <div className="space-y-2">
        {departments.map((dept, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={dept}
              onChange={(e) => handleRename(i, e.target.value)}
              className="flex-1 h-9 px-3 text-sm bg-bg border border-border rounded-[8px] text-text focus:border-primary focus:outline-none transition-colors"
            />
            <button
              onClick={() => handleRemove(i)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newDept}
          onChange={(e) => setNewDept(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add department..."
          className="flex-1 h-9 px-3 text-sm bg-bg border border-border rounded-[8px] text-text placeholder:text-text-subtle focus:border-primary focus:outline-none transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!newDept.trim()}
          className={cn(
            "h-9 px-3 text-xs font-medium rounded-[8px] border transition-colors cursor-pointer",
            "border-border text-text-muted hover:bg-surface/60 hover:text-text disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
