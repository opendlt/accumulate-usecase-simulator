import { INDUSTRIES } from "@/scenarios/industries";
import type { IndustryId } from "@/types/industry";
import { cn } from "@/lib/utils";

interface StepIndustryProps {
  orgName: string;
  industryId: IndustryId | null;
  onOrgNameChange: (name: string) => void;
  onIndustryChange: (id: IndustryId) => void;
}

export function StepIndustry({ orgName, industryId, onOrgNameChange, onIndustryChange }: StepIndustryProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Organization Name
        </label>
        <input
          type="text"
          value={orgName}
          onChange={(e) => onOrgNameChange(e.target.value)}
          placeholder="e.g., Acme Corp"
          className="w-full h-11 px-4 text-sm bg-bg border border-border rounded-[10px] text-text placeholder:text-text-subtle focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          Industry
        </label>
        <div className="grid grid-cols-2 gap-2">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              onClick={() => onIndustryChange(ind.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left cursor-pointer",
                industryId === ind.id
                  ? "border-primary/40 bg-primary/10 text-text"
                  : "border-border bg-surface/40 text-text-muted hover:border-border hover:bg-surface/60"
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: ind.color }}
              />
              <span className="text-xs font-medium">{ind.shortName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
