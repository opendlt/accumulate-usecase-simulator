import { cn } from "@/lib/utils";

interface StepPolicyProps {
  totalRoles: number;
  threshold: number;
  expiryHours: number;
  delegationAllowed: boolean;
  onThresholdChange: (n: number) => void;
  onExpiryChange: (h: number) => void;
  onDelegationChange: (allowed: boolean) => void;
}

export function StepPolicy({
  totalRoles,
  threshold,
  expiryHours,
  delegationAllowed,
  onThresholdChange,
  onExpiryChange,
  onDelegationChange,
}: StepPolicyProps) {
  const maxThreshold = Math.max(1, totalRoles - 1); // -1 because initiator is one role

  return (
    <div className="space-y-6">
      <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
        Approval Policy
      </label>

      {/* Sentence builder */}
      <div className="rounded-xl border border-overlay/[0.06] bg-surface/30 p-4">
        <p className="text-sm text-text leading-relaxed">
          Require{" "}
          <select
            value={threshold}
            onChange={(e) => onThresholdChange(Number(e.target.value))}
            className="inline-block h-7 px-2 text-sm bg-bg border border-border rounded-md text-primary font-semibold focus:border-primary focus:outline-none cursor-pointer"
          >
            {Array.from({ length: maxThreshold }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {" "}of {totalRoles > 1 ? totalRoles - 1 : 1} approver{totalRoles > 2 ? "s" : ""} to approve.
        </p>

        <p className="text-sm text-text leading-relaxed mt-3">
          Authority expires in{" "}
          <input
            type="number"
            min={1}
            max={720}
            value={expiryHours}
            onChange={(e) => onExpiryChange(Math.max(1, Number(e.target.value)))}
            className="inline-block w-16 h-7 px-2 text-sm bg-bg border border-border rounded-md text-primary font-semibold text-center focus:border-primary focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {" "}hour{expiryHours !== 1 ? "s" : ""}.
        </p>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => onDelegationChange(!delegationAllowed)}
            className={cn(
              "relative w-10 h-5 rounded-full transition-colors cursor-pointer",
              delegationAllowed ? "bg-primary" : "bg-border"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                delegationAllowed ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
          <span className="text-sm text-text">
            {delegationAllowed ? "Delegation allowed" : "Delegation disabled"}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="text-xs text-text-muted">
        This creates a {threshold}-of-{Math.max(1, totalRoles - 1)} threshold policy with a{" "}
        {expiryHours}-hour expiry window.{" "}
        {delegationAllowed
          ? "If an approver is unavailable, they can delegate to another role."
          : "Approvers cannot delegate their authority."}
      </div>
    </div>
  );
}
