import { useMemo } from "react";
import { ReactFlow, Background, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ScenarioTemplate } from "@/types/scenario";
import { NODE_TYPE_META } from "@/lib/constants";

interface OrgPreviewProps {
  scenario: ScenarioTemplate;
  className?: string;
}

function layoutNodes(scenario: ScenarioTemplate): { nodes: Node[]; edges: Edge[] } {
  const actors = scenario.actors;
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  // Simple hierarchical layout via BFS
  const roots = actors.filter((a) => !a.parentId || !actorMap.has(a.parentId));
  const levels: string[][] = [];
  const visited = new Set<string>();
  let queue = roots.map((a) => a.id);

  while (queue.length > 0) {
    levels.push([...queue]);
    queue.forEach((id) => visited.add(id));
    const nextQueue: string[] = [];
    for (const id of queue) {
      for (const actor of actors) {
        if (actor.parentId === id && !visited.has(actor.id)) {
          nextQueue.push(actor.id);
        }
      }
    }
    queue = nextQueue;
  }

  // Add any unvisited actors
  for (const actor of actors) {
    if (!visited.has(actor.id)) {
      if (levels.length === 0) levels.push([]);
      levels[levels.length - 1]!.push(actor.id);
    }
  }

  const nodes: Node[] = [];
  const xSpacing = 160;
  const ySpacing = 80;

  for (let level = 0; level < levels.length; level++) {
    const row = levels[level]!;
    const totalWidth = (row.length - 1) * xSpacing;
    const startX = -totalWidth / 2;

    for (let i = 0; i < row.length; i++) {
      const actorId = row[i]!;
      const actor = actorMap.get(actorId);
      if (!actor) continue;

      const meta = NODE_TYPE_META[actor.type] ?? NODE_TYPE_META.role;

      nodes.push({
        id: actor.id,
        position: { x: startX + i * xSpacing, y: level * ySpacing },
        data: { label: actor.label },
        style: {
          background: meta.bgAccent,
          border: `1px solid ${meta.color}40`,
          borderRadius: "8px",
          padding: "6px 10px",
          fontSize: "10px",
          color: "var(--text-color)",
          fontWeight: 500,
          minWidth: "80px",
          textAlign: "center" as const,
        },
      });
    }
  }

  const edges: Edge[] = scenario.edges.map((e, i) => ({
    id: `preview-edge-${i}`,
    source: e.sourceId,
    target: e.targetId,
    type: "default",
    style: {
      stroke: e.type === "delegation" ? "#F59E0B" : "#3B82F640",
      strokeWidth: 1,
      strokeDasharray: e.type === "delegation" ? "4 2" : undefined,
    },
  }));

  return { nodes, edges };
}

export function OrgPreview({ scenario, className }: OrgPreviewProps) {
  const { nodes, edges } = useMemo(() => layoutNodes(scenario), [scenario]);

  return (
    <div className={className ?? "w-full h-full"}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="var(--border-color)" />
      </ReactFlow>
    </div>
  );
}
