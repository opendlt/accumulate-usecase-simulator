import { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { Tabs } from "@/components/shared/Tabs";
import { AuditLogTab } from "./AuditLogTab";
import { TimelineTab } from "./TimelineTab";
import { ProofArtifactTab } from "./ProofArtifactTab";
import { VerificationTab } from "./VerificationTab";
import { BeforeAfterTab } from "./BeforeAfterTab";
import { ExportButton } from "./ExportButton";
import { useSimulationStore } from "@/store";
import { useUIStore } from "@/store";

const TAB_NAMES = ["Audit Log", "Timeline", "Proof", "Verification", "Before/After"];

export function EvidencePanel() {
  const { evidenceTab, setEvidenceTab } = useUIStore();
  const { evidence } = useSimulationStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            {collapsed ? <CaretUp size={14} /> : <CaretDown size={14} />}
          </button>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Evidence
          </span>
          <Tabs tabs={TAB_NAMES} activeTab={evidenceTab} onTabChange={setEvidenceTab} />
        </div>
        {evidence && <ExportButton />}
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="px-4 py-3 max-h-[280px] overflow-y-auto">
          {evidenceTab === 0 && <AuditLogTab />}
          {evidenceTab === 1 && <TimelineTab />}
          {evidenceTab === 2 && <ProofArtifactTab />}
          {evidenceTab === 3 && <VerificationTab />}
          {evidenceTab === 4 && <BeforeAfterTab />}
        </div>
      )}
    </div>
  );
}
