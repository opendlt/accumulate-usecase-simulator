import { useState } from "react";
import { DownloadSimple, Copy, CheckCircle, ShareNetwork } from "@phosphor-icons/react";
import { useSimulationStore, useScenarioStore } from "@/store";
import { setScenarioIdInUrl, buildShareUrl } from "@/lib/url-codec";

export function ExportButton() {
  const { evidence } = useSimulationStore();
  const { activeScenario } = useScenarioStore();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  if (!evidence) return null;

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(evidence, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accumulate-evidence-${activeScenario?.id ?? "run"}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHash = async () => {
    await navigator.clipboard.writeText(evidence.proofArtifact.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (activeScenario) {
      setScenarioIdInUrl(activeScenario.id);
      await navigator.clipboard.writeText(buildShareUrl(activeScenario.id));
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const btnClass =
    "flex items-center gap-1.5 px-2.5 py-1.5 text-[0.65rem] font-medium rounded-[8px] border border-border text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer";

  return (
    <div className="flex items-center gap-1">
      <button onClick={downloadJson} className={btnClass}>
        <DownloadSimple size={12} />
        Export JSON
      </button>
      <button onClick={copyHash} className={btnClass}>
        {copied ? (
          <CheckCircle size={12} className="text-success" />
        ) : (
          <Copy size={12} />
        )}
        Copy Hash
      </button>
      <button onClick={shareLink} className={btnClass}>
        {linkCopied ? (
          <CheckCircle size={12} className="text-success" />
        ) : (
          <ShareNetwork size={12} />
        )}
        Share Link
      </button>
    </div>
  );
}
