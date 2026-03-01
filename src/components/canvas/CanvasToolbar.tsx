import { MagnifyingGlassPlus, MagnifyingGlassMinus, CornersOut, MapTrifold } from "@phosphor-icons/react";
import { useReactFlow } from "@xyflow/react";

interface CanvasToolbarProps {
  minimapVisible: boolean;
  onToggleMinimap: () => void;
}

export function CanvasToolbar({ minimapVisible, onToggleMinimap }: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const btnClass =
    "p-1.5 rounded-[8px] text-text-muted hover:text-text hover:bg-overlay/[0.06] transition-colors cursor-pointer";

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-1 bg-surface/80 backdrop-blur-sm border border-border rounded-[10px] p-1 z-10">
      <button onClick={() => zoomIn()} className={btnClass} aria-label="Zoom in">
        <MagnifyingGlassPlus size={16} />
      </button>
      <button onClick={() => zoomOut()} className={btnClass} aria-label="Zoom out">
        <MagnifyingGlassMinus size={16} />
      </button>
      <button onClick={() => fitView({ padding: 0.3 })} className={btnClass} aria-label="Fit view">
        <CornersOut size={16} />
      </button>
      <div className="h-px bg-border mx-0.5" />
      <button
        onClick={onToggleMinimap}
        className={`${btnClass} ${minimapVisible ? "text-primary" : ""}`}
        aria-label="Toggle minimap"
      >
        <MapTrifold size={16} />
      </button>
    </div>
  );
}
