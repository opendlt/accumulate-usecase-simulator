import { useCallback, useRef } from "react";

interface ResizableHandleProps {
  direction: "horizontal" | "vertical";
  onResize: (delta: number) => void;
}

export function ResizableHandle({ direction, onResize }: ResizableHandleProps) {
  const startPos = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startPos.current = direction === "horizontal" ? e.clientX : e.clientY;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const current = direction === "horizontal" ? moveEvent.clientX : moveEvent.clientY;
        const delta = current - startPos.current;
        startPos.current = current;
        onResize(delta);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [direction, onResize]
  );

  const isH = direction === "horizontal";

  return (
    <div
      onMouseDown={onMouseDown}
      className={`shrink-0 ${
        isH
          ? "w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30"
          : "h-1 cursor-row-resize hover:bg-primary/20 active:bg-primary/30"
      } transition-colors`}
    />
  );
}
