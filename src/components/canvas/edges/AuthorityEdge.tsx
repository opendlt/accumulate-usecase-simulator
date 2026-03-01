import { memo, useId } from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import type { SimEdgeData } from "@/types/canvas";

function AuthorityEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const edgeData = data as SimEdgeData | undefined;
  const gradId = useId().replace(/:/g, "");
  const glowId = `glow-${gradId}`;
  const isDelegation = edgeData?.type === "delegation";
  const flowDirection = edgeData?.flowDirection ?? "forward";
  const isAnimating = edgeData?.isAnimating ?? false;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  const kp = flowDirection === "reverse" ? "1;0" : "0;1";

  return (
    <>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDelegation ? "#F59E0B" : "#3B82F6"} />
          <stop offset="100%" stopColor={isDelegation ? "#D97706" : "#00A6FB"} />
        </linearGradient>
        <linearGradient id={glowId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDelegation ? "#F59E0B" : "#3B82F6"} stopOpacity="0.4" />
          <stop offset="100%" stopColor={isDelegation ? "#D97706" : "#00A6FB"} stopOpacity="0.2" />
        </linearGradient>
        <filter id={`blur-${gradId}`}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Glow layer — pulse animation when first activated */}
      <BaseEdge
        key={`${id}-glow-${isAnimating}`}
        id={`${id}-glow`}
        path={edgePath}
        style={{
          stroke: `url(#${glowId})`,
          strokeWidth: isAnimating ? 6 : 4,
          filter: "blur(3px)",
          strokeDasharray: isDelegation ? "6 4" : undefined,
          animation: isAnimating ? "edge-active-pulse 0.6s ease-out 1" : undefined,
        }}
      />

      {/* Core line — widens when active */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: `url(#${gradId})`,
          strokeWidth: isAnimating ? 2.5 : 1.5,
          strokeDasharray: isDelegation ? "6 4" : undefined,
          animation: isDelegation ? "dash-flow 1.5s linear infinite" : undefined,
          transition: "stroke-width 0.3s ease",
        }}
      />

      {/* Animated data-flow particles (3 staggered) */}
      {isAnimating && (
        <g className="edge-particles">
          {[0, 1, 2].map((i) => {
            const color = isDelegation ? "#F59E0B" : "#3B82F6";
            const beginOffset = `${i * 0.6}s`;
            return (
              <g key={i}>
                {/* Glow trail */}
                <circle
                  r={5}
                  fill={color}
                  opacity={0.15}
                  filter={`url(#blur-${gradId})`}
                  style={{ animation: "particle-glow 1.8s ease-in-out infinite" }}
                >
                  <animateMotion
                    dur="1.8s"
                    repeatCount="indefinite"
                    path={edgePath}
                    begin={beginOffset}
                    keyPoints={kp}
                    keyTimes="0;1"
                  />
                </circle>
                {/* Core particle */}
                <circle
                  r={2.5 - i * 0.3}
                  fill={color}
                  opacity={0.8 - i * 0.15}
                >
                  <animateMotion
                    dur="1.8s"
                    repeatCount="indefinite"
                    path={edgePath}
                    begin={beginOffset}
                    keyPoints={kp}
                    keyTimes="0;1"
                  />
                </circle>
              </g>
            );
          })}
        </g>
      )}

      {/* Flow Packet Capsule */}
      {edgeData?.flowLabel && (
        <g key={`packet-${edgeData.flowLabel}-${id}`}>
          {/* Glow halo behind the capsule */}
          <circle
            r={12}
            fill={edgeData.flowColor ?? "#3B82F6"}
            opacity={0.2}
            filter={`url(#blur-${gradId})`}
          >
            <animateMotion
              dur="1.4s"
              repeatCount="1"
              fill="freeze"
              path={edgePath}
              keyPoints={kp}
              keyTimes="0;1"
            />
          </circle>
          {/* Capsule background */}
          <rect
            rx={10}
            ry={10}
            width={56}
            height={20}
            x={-28}
            y={-10}
            fill={edgeData.flowColor ?? "#3B82F6"}
            opacity={0.95}
            stroke={edgeData.flowColor ?? "#3B82F6"}
            strokeWidth={1}
          >
            <animateMotion
              dur="1.4s"
              repeatCount="1"
              fill="freeze"
              path={edgePath}
              keyPoints={kp}
              keyTimes="0;1"
            />
          </rect>
          {/* Capsule label text */}
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight={600}
            fill="white"
            style={{ pointerEvents: "none" }}
          >
            {edgeData.flowLabel}
            <animateMotion
              dur="1.4s"
              repeatCount="1"
              fill="freeze"
              path={edgePath}
              keyPoints={kp}
              keyTimes="0;1"
            />
          </text>
        </g>
      )}
    </>
  );
}

export const AuthorityEdge = memo(AuthorityEdgeComponent);
