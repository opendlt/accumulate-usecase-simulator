import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { SimNodeData } from "@/types/canvas";
import { NodeShell } from "./NodeShell";

function SimulatorNodeComponent(props: NodeProps) {
  const data = props.data as SimNodeData;
  const selected = props.selected ?? false;
  return <NodeShell data={data} selected={selected} />;
}

export const SimulatorNode = memo(SimulatorNodeComponent);
