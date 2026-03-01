import { useState, useCallback } from "react";
import { Copy, CheckCircle, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/shared/Button";
import { GlassCard } from "@/components/shared/GlassCard";
import { useSimulationStore } from "@/store";
import { verifyProofIntegrity } from "@/engine/proof-generator";

export function ProofArtifactTab() {
  const { evidence } = useSimulationStore();
  const [copied, setCopied] = useState(false);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);

  const copyHash = useCallback(async () => {
    if (!evidence) return;
    await navigator.clipboard.writeText(evidence.proofArtifact.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [evidence]);

  const handleVerify = useCallback(async () => {
    if (!evidence) return;
    setVerifying(true);
    const result = await verifyProofIntegrity(evidence.proofArtifact);
    setVerifyResult(result);
    setVerifying(false);
  }, [evidence]);

  if (!evidence) {
    return (
      <div className="text-xs text-text-subtle text-center py-8">
        Run a simulation to see the proof artifact.
      </div>
    );
  }

  const { proofArtifact } = evidence;

  return (
    <div className="space-y-3">
      {/* SHA-256 Hash */}
      <GlassCard className="!p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">
            SHA-256 Hash
          </span>
          <button
            onClick={copyHash}
            className="text-text-subtle hover:text-text transition-colors cursor-pointer"
          >
            {copied ? <CheckCircle size={14} className="text-success" /> : <Copy size={14} />}
          </button>
        </div>
        <p className="font-mono text-[0.6rem] text-success break-all leading-relaxed">
          {proofArtifact.hash}
        </p>
      </GlassCard>

      {/* Signatures */}
      <GlassCard className="!p-3">
        <span className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">
          Signatures ({proofArtifact.signatures.length})
        </span>
        <div className="mt-2 space-y-1.5">
          {proofArtifact.signatures.map((sig, i) => (
            <div key={i} className="flex items-center gap-2 text-[0.6rem]">
              <span className="text-text font-medium w-24 truncate">{sig.roleName}</span>
              <span className="font-mono text-text-subtle flex-1 truncate">
                {sig.signatureHash.slice(0, 20)}...
              </span>
              <span className="font-mono text-text-subtle">{sig.timestamp}s</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Merkle Receipt */}
      <GlassCard className="!p-3">
        <span className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">
          Merkle Receipt
        </span>
        <div className="mt-2 space-y-1 text-[0.6rem]">
          <div>
            <span className="text-text-subtle">Root: </span>
            <span className="font-mono text-primary">{proofArtifact.merkleReceipt.rootHash.slice(0, 24)}...</span>
          </div>
          <div>
            <span className="text-text-subtle">Leaf: </span>
            <span className="font-mono text-info">{proofArtifact.merkleReceipt.leafHash.slice(0, 24)}...</span>
          </div>
          <div>
            <span className="text-text-subtle">Path depth: </span>
            <span className="text-text">{proofArtifact.merkleReceipt.path.length}</span>
          </div>
        </div>
      </GlassCard>

      {/* Verify Button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleVerify}
          variant="secondary"
          size="sm"
          disabled={verifying}
        >
          <ShieldCheck size={14} className="mr-1.5" />
          {verifying ? "Verifying..." : "Verify Integrity"}
        </Button>
        {verifyResult !== null && (
          <span
            className={`text-xs font-semibold ${verifyResult ? "text-success" : "text-danger"}`}
          >
            {verifyResult ? "Hash verified" : "Hash mismatch!"}
          </span>
        )}
      </div>

      {/* Canonical JSON (collapsible) */}
      <details className="group">
        <summary className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text transition-colors">
          Canonical JSON
        </summary>
        <pre className="mt-2 p-3 rounded-[10px] bg-surface border border-border text-[0.55rem] font-mono text-text-muted overflow-x-auto max-h-[200px] overflow-y-auto leading-relaxed">
          {JSON.stringify(JSON.parse(proofArtifact.canonicalJson), null, 2)}
        </pre>
      </details>
    </div>
  );
}
