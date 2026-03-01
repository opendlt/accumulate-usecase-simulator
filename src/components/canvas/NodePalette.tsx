import { NODE_TYPE_META } from "@/lib/constants";
import type { NodeType } from "@/types/organization";
import { useCallback } from "react";

const nodeTypes: { type: NodeType; label: string }[] = [
  { type: "organization" as NodeType, label: "Organization" },
  { type: "department" as NodeType, label: "Department" },
  { type: "role" as NodeType, label: "Role" },
  { type: "vendor" as NodeType, label: "Vendor" },
  { type: "partner" as NodeType, label: "Partner" },
  { type: "system" as NodeType, label: "System" },
];

export function NodePalette() {
  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: string) => {
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  return (
    <div className="p-3">
      <div className="text-[0.6875rem] font-semibold uppercase tracking-wider mb-3 text-text-subtle">
        Node Types
      </div>
      <div className="flex flex-col gap-1.5">
        {nodeTypes.map(({ type, label }) => {
          const meta = NODE_TYPE_META[type as keyof typeof NODE_TYPE_META];
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-[10px] text-[0.75rem] font-medium cursor-grab active:cursor-grabbing border border-overlay/[0.06] hover:border-overlay/[0.12] transition-all duration-200 select-none"
              style={{
                background: "color-mix(in srgb, var(--surface) 50%, transparent)",
                color: "var(--text-muted)",
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: meta?.color ?? "#94A3B8" }}
              />
              <span className="truncate">{label}</span>
              <span className="ml-auto text-[0.6rem] opacity-50">+</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
