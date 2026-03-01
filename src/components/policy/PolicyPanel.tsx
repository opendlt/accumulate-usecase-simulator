import { useCanvasStore, useScenarioStore } from "@/store";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/shared/Button";
import type { Policy } from "@/types/policy";

export function PolicyPanel() {
  const { selectedNodeId, nodes, updateNodePolicy } = useCanvasStore();
  const { policies, updatePolicy, addPolicy } = useScenarioStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  if (!selectedNode) return null;

  const { actor } = selectedNode.data;
  const policy = policies.find((p) => p.actorId === actor.id);

  const handleUpdatePolicy = (policyId: string, updates: Partial<Policy>) => {
    updatePolicy(policyId, updates);
    const updated = { ...policies.find((p) => p.id === policyId)!, ...updates };
    updateNodePolicy(actor.id, updated);
  };

  const handleCreatePolicy = () => {
    const newPolicy: Policy = {
      id: `policy-${actor.id}`,
      actorId: actor.id,
      threshold: { k: 1, n: 1, approverRoleIds: [actor.id] },
      expirySeconds: 0,
      delegationAllowed: false,
    };
    addPolicy(newPolicy);
    updateNodePolicy(actor.id, newPolicy);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-heading text-sm font-semibold text-text">{actor.label}</h3>
        <p className="text-xs text-text-muted mt-0.5 capitalize">{actor.type}</p>
      </div>

      {policy ? (
        <>
          {/* Threshold Editor */}
          <GlassCard className="!p-3">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Approval Threshold
            </label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="number"
                min={1}
                max={policy.threshold.n}
                value={policy.threshold.k}
                onChange={(e) =>
                  handleUpdatePolicy(policy.id, {
                    threshold: {
                      ...policy.threshold,
                      k: Math.max(1, Math.min(Number(e.target.value), policy.threshold.n)),
                    },
                  })
                }
                className="w-14 h-8 rounded-[8px] bg-surface border border-border text-center text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <span className="text-xs text-text-muted">of</span>
              <span className="text-sm font-semibold text-text">{policy.threshold.n}</span>
              <span className="text-xs text-text-muted">required</span>
            </div>
            <input
              type="range"
              min={1}
              max={policy.threshold.n}
              value={policy.threshold.k}
              onChange={(e) =>
                handleUpdatePolicy(policy.id, {
                  threshold: { ...policy.threshold, k: Number(e.target.value) },
                })
              }
              className="w-full mt-2 accent-primary"
            />
          </GlassCard>

          {/* Expiry Editor */}
          <GlassCard className="!p-3">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Authority Expiry
            </label>
            <select
              value={policy.expirySeconds}
              onChange={(e) =>
                handleUpdatePolicy(policy.id, { expirySeconds: Number(e.target.value) })
              }
              className="w-full mt-2 h-8 px-2 rounded-[8px] bg-surface border border-border text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
            >
              <option value={0}>No expiry</option>
              <option value={1800}>30 minutes</option>
              <option value={3600}>1 hour</option>
              <option value={14400}>4 hours</option>
              <option value={43200}>12 hours</option>
              <option value={86400}>24 hours</option>
              <option value={604800}>7 days</option>
            </select>
          </GlassCard>

          {/* Delegation Toggle */}
          <GlassCard className="!p-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Delegation
              </label>
              <button
                onClick={() =>
                  handleUpdatePolicy(policy.id, {
                    delegationAllowed: !policy.delegationAllowed,
                  })
                }
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                  policy.delegationAllowed ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    policy.delegationAllowed ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
            {policy.delegationAllowed && policy.delegateToRoleId && (
              <p className="text-xs text-text-subtle mt-1.5">
                Can delegate to: <span className="text-primary">{policy.delegateToRoleId}</span>
              </p>
            )}
          </GlassCard>

          {/* Escalation Info */}
          {policy.escalation && (
            <GlassCard className="!p-3">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Escalation
              </label>
              <p className="text-xs text-text mt-1.5">
                After{" "}
                <span className="font-semibold text-warning">
                  {policy.escalation.afterSeconds}s
                </span>
                , escalate to{" "}
                <span className="text-primary">
                  {policy.escalation.toRoleIds.join(", ")}
                </span>
              </p>
            </GlassCard>
          )}

          {/* Constraints */}
          {policy.constraints && (
            <GlassCard className="!p-3">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Constraints
              </label>
              <div className="mt-1.5 space-y-1">
                {policy.constraints.amountMax !== undefined && (
                  <p className="text-xs text-text">
                    Max amount: <span className="font-semibold">${policy.constraints.amountMax.toLocaleString()}</span>
                  </p>
                )}
                {policy.constraints.environment && (
                  <p className="text-xs text-text">
                    Environment: <span className="font-semibold capitalize">{policy.constraints.environment}</span>
                  </p>
                )}
              </div>
            </GlassCard>
          )}
        </>
      ) : (
        <div className="text-xs text-text-subtle text-center py-6 space-y-3">
          <p>No policy attached to this node.</p>
          <Button size="sm" onClick={handleCreatePolicy}>
            Create Policy
          </Button>
        </div>
      )}
    </div>
  );
}
