import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
  type Connection,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStore, type StoreApi } from "zustand";
import { useCanvasStore, useUIStore, type CanvasStore } from "@/store";
import { SimulatorNode } from "./nodes/SimulatorNode";
import { AuthorityEdge } from "./edges/AuthorityEdge";
import { CanvasToolbar } from "./CanvasToolbar";
import { NODE_TYPE_META } from "@/lib/constants";
import { NodeType } from "@/types/organization";
import type { Actor } from "@/types/organization";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: NodeTypes = { simNode: SimulatorNode as any };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes: EdgeTypes = { simEdge: AuthorityEdge as any };

let dropCounter = 0;

/** Context so child nodes (NodeShell) know when editing is disabled */
export const ReadOnlyContext = createContext(false);

export interface SimulatorCanvasProps {
  storeApi?: StoreApi<CanvasStore>;
  readOnly?: boolean;
  tintColor?: string;
  label?: string;
  /** Change this value to trigger a fitView (e.g. after canvas resize transitions). */
  fitViewTrigger?: number;
  /** When set, the camera smoothly pans to center on this node. */
  focusNodeId?: string;
}

function useCanvasStoreSlice<T>(storeApi: StoreApi<CanvasStore> | undefined, selector: (s: CanvasStore) => T): T {
  // When a storeApi is provided, read from it; otherwise fall back to the singleton
  const fromApi = useStore(storeApi ?? useCanvasStore, selector);
  return fromApi;
}

function SimulatorCanvasInner({ storeApi, readOnly, tintColor, label, fitViewTrigger, focusNodeId }: SimulatorCanvasProps) {
  const theme = useUIStore((s) => s.theme);
  const nodes = useCanvasStoreSlice(storeApi, (s) => s.nodes);
  const edges = useCanvasStoreSlice(storeApi, (s) => s.edges);
  const onNodesChange = useCanvasStoreSlice(storeApi, (s) => s.onNodesChange);
  const onEdgesChange = useCanvasStoreSlice(storeApi, (s) => s.onEdgesChange);
  const selectNode = useCanvasStoreSlice(storeApi, (s) => s.selectNode);
  const addNode = useCanvasStoreSlice(storeApi, (s) => s.addNode);
  const addEdge = useCanvasStoreSlice(storeApi, (s) => s.addEdge);

  const { screenToFlowPosition, fitView, setCenter } = useReactFlow();

  // Re-fit when fitViewTrigger changes (e.g. after canvas resize transitions)
  const prevTrigger = useRef(fitViewTrigger);
  useEffect(() => {
    if (fitViewTrigger !== undefined && fitViewTrigger !== prevTrigger.current) {
      prevTrigger.current = fitViewTrigger;
      // Small delay to let the DOM settle after Framer Motion animation
      const timer = setTimeout(() => fitView({ padding: 0.3, duration: 400 }), 150);
      return () => clearTimeout(timer);
    }
  }, [fitViewTrigger, fitView]);

  // Camera follow: smoothly pan to the focused node
  const prevFocusRef = useRef(focusNodeId);
  useEffect(() => {
    if (!focusNodeId || focusNodeId === prevFocusRef.current) {
      prevFocusRef.current = focusNodeId;
      return;
    }
    prevFocusRef.current = focusNodeId;
    const targetNode = nodes.find((n) => n.id === focusNodeId);
    if (!targetNode) return;
    const nodeWidth = targetNode.measured?.width ?? 140;
    const nodeHeight = targetNode.measured?.height ?? 60;
    const x = (targetNode.position?.x ?? 0) + nodeWidth / 2;
    const y = (targetNode.position?.y ?? 0) + nodeHeight / 2;
    setCenter(x, y, { duration: 500, zoom: 0.95 });
  }, [focusNodeId, nodes, setCenter]);

  const [minimapVisible, setMinimapVisible] = useState(!readOnly);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      if (!readOnly) selectNode(node.id);
    },
    [selectNode, readOnly]
  );

  const onPaneClick = useCallback(() => {
    if (!readOnly) selectNode(null);
  }, [selectNode, readOnly]);

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (readOnly) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [readOnly]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (readOnly) return;
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/reactflow");
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const meta = NODE_TYPE_META[nodeType as keyof typeof NODE_TYPE_META];
      dropCounter++;
      const actor: Actor = {
        id: `dropped-${nodeType}-${dropCounter}`,
        type: nodeType as NodeType,
        label: meta?.label ?? nodeType,
        parentId: null,
        organizationId: "custom",
        color: meta?.color ?? "#94A3B8",
      };

      addNode(actor, position);
    },
    [screenToFlowPosition, addNode, readOnly]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly) return;
      const { source, target, sourceHandle } = connection;
      if (!source || !target || source === target) return;

      const edgeId = `${source}-${target}-${sourceHandle ?? "authority"}`;
      if (edges.some((e) => e.id === edgeId)) return;

      const edgeType = sourceHandle === "delegation" ? "delegation" : "authority";
      addEdge({
        id: edgeId,
        source,
        target,
        type: "simEdge",
        data: { type: edgeType, isAnimating: false },
      });
    },
    [edges, addEdge, readOnly]
  );

  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 0.85 }), []);
  const dotColor = tintColor
    ? `${tintColor}30`
    : "var(--border-color)";

  return (
    <ReadOnlyContext.Provider value={readOnly ?? false}>
      <div
        className="relative w-full h-full bg-bg"
        style={
          tintColor
            ? { border: `2px solid ${tintColor}30`, borderRadius: 12, overflow: "hidden" }
            : undefined
        }
      >
        {label && (
          <div
            className="absolute top-2 left-3 z-10 px-2.5 py-1 rounded-[8px] text-[0.65rem] font-bold uppercase tracking-wider backdrop-blur-sm"
            style={{
              background: `${tintColor ?? "#94A3B8"}18`,
              color: tintColor ?? "#94A3B8",
              border: `1px solid ${tintColor ?? "#94A3B8"}30`,
            }}
          >
            {label}
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onConnect={readOnly ? undefined : onConnect}
          connectionMode={ConnectionMode.Loose}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={defaultViewport}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
          colorMode={theme}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={dotColor} />
          {minimapVisible && !readOnly && (
            <MiniMap
              nodeColor={(node) => {
                const data = node.data as { actor?: { color?: string } } | undefined;
                return data?.actor?.color ?? "#94A3B8";
              }}
              maskColor="rgba(11, 15, 23, 0.7)"
              className="!rounded-[10px]"
            />
          )}
        </ReactFlow>
        {!readOnly && (
          <CanvasToolbar
            minimapVisible={minimapVisible}
            onToggleMinimap={() => setMinimapVisible((v) => !v)}
          />
        )}
      </div>
    </ReadOnlyContext.Provider>
  );
}

export function SimulatorCanvas(props: SimulatorCanvasProps) {
  return (
    <ReactFlowProvider>
      <SimulatorCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
