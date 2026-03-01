import { useState, useCallback, useContext, useEffect, useRef } from "react";
import type React from "react";
import { Handle, Position } from "@xyflow/react";
import { motion, AnimatePresence, type TargetAndTransition } from "framer-motion";
import { NODE_TYPE_META } from "@/lib/constants";
import { PolicyPill } from "@/components/shared/PolicyPill";
import { useCanvasStore } from "@/store";
import { ReadOnlyContext } from "@/components/canvas/SimulatorCanvas";
import type { SimNodeData, SimulationNodeStatus } from "@/types/canvas";

function NodeIcon({ type, size = 14 }: { type: string; size?: number }) {
  const color = NODE_TYPE_META[type as keyof typeof NODE_TYPE_META]?.color ?? "#94A3B8";

  switch (type) {
    case "organization":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <rect x="4" y="1" width="8" height="6" rx="1" stroke={color} strokeWidth="1.5" />
          <rect x="1" y="9" width="5" height="6" rx="1" stroke={color} strokeWidth="1.5" />
          <rect x="10" y="9" width="5" height="6" rx="1" stroke={color} strokeWidth="1.5" />
          <line x1="8" y1="7" x2="8" y2="9" stroke={color} strokeWidth="1.5" />
          <line x1="3.5" y1="9" x2="12.5" y2="9" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "department":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke={color} strokeWidth="1.5" />
          <line x1="2" y1="6" x2="14" y2="6" stroke={color} strokeWidth="1.5" />
          <line x1="6" y1="6" x2="6" y2="14" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "vendor":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <path d="M2 6L8 2L14 6V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V6Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="6" y="9" width="4" height="5" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "role":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5" r="3" stroke={color} strokeWidth="1.5" />
          <path d="M3 14C3 11.2386 5.23858 9 8 9C10.7614 9 13 11.2386 13 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "system":
    case "regulator":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="8" rx="1.5" stroke={color} strokeWidth="1.5" />
          <line x1="5" y1="14" x2="11" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="11" x2="8" y2="14" stroke={color} strokeWidth="1.5" />
          <circle cx="8" cy="7" r="1" fill={color} />
        </svg>
      );
    case "partner":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <circle cx="5" cy="5" r="2.5" stroke={color} strokeWidth="1.5" />
          <circle cx="11" cy="5" r="2.5" stroke={color} strokeWidth="1.5" />
          <circle cx="8" cy="12" r="2.5" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

function StatusRing({ status, color }: { status: SimulationNodeStatus; color: string }) {
  if (status === "idle") return null;

  const ringColors: Record<string, string> = {
    requesting: "#F59E0B",
    approving: "#3B82F6",
    approved: "#22C55E",
    denied: "#EF4444",
    delegating: "#06B6D4",
    escalating: "#F59E0B",
    expired: "#EF4444",
    "manual-step": "#EF4444",
    waiting: "#F59E0B",
  };

  const ringColor = ringColors[status] ?? color;
  const isPulsing =
    status === "requesting" ||
    status === "approving" ||
    status === "escalating" ||
    status === "manual-step" ||
    status === "waiting";
  const isDashed = status === "delegating";
  const isAggressivePulse = status === "manual-step" || status === "waiting";
  const isFriction = status === "manual-step" || status === "waiting";

  return (
    <>
      {/* Primary ring */}
      <motion.div
        className="absolute -inset-[4px] rounded-[16px] pointer-events-none"
        style={{
          border: `${isFriction ? 3 : 2}px ${isDashed ? "dashed" : "solid"} ${ringColor}`,
          opacity: 0.7,
        }}
        animate={
          isPulsing
            ? isAggressivePulse
              ? { opacity: [0.3, 1, 0.3], scale: [1, 1.08, 1] }
              : { opacity: [0.4, 0.9, 0.4], scale: [1, 1.04, 1] }
            : { opacity: 0.7 }
        }
        transition={
          isPulsing
            ? {
                duration: isAggressivePulse ? 0.7 : 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : {}
        }
      />
      {/* Outer glow ring for friction states */}
      {isFriction && (
        <motion.div
          className="absolute -inset-[10px] rounded-[22px] pointer-events-none"
          style={{
            border: `1px solid ${ringColor}`,
            boxShadow: `0 0 16px ${ringColor}60, inset 0 0 8px ${ringColor}20`,
          }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </>
  );
}

function StatusIcon({ status }: { status: SimulationNodeStatus }) {
  if (status === "approved") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-success flex items-center justify-center shadow-lg"
        style={{ boxShadow: "0 0 12px rgba(34, 197, 94, 0.5)" }}
      >
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 5L4.5 7L7.5 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    );
  }
  if (status === "denied" || status === "expired") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger flex items-center justify-center shadow-lg"
        style={{ boxShadow: "0 0 12px rgba(239, 68, 68, 0.5)" }}
      >
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
          <path d="M3 3L7 7M7 3L3 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </motion.div>
    );
  }
  if (status === "manual-step") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: "#EF4444", boxShadow: "0 0 16px rgba(239, 68, 68, 0.6)" }}
      >
        {/* Warning triangle */}
        <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
          <path d="M5 1.5L9 8.5H1L5 1.5Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
          <line x1="5" y1="4.5" x2="5" y2="6.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="5" cy="7.5" r="0.5" fill="white" />
        </svg>
      </motion.div>
    );
  }
  if (status === "waiting") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, scale: { duration: 0.2 } }}
        className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: "#F59E0B", boxShadow: "0 0 16px rgba(245, 158, 11, 0.6)" }}
      >
        {/* Clock */}
        <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke="white" strokeWidth="1.2" />
          <line x1="5" y1="3" x2="5" y2="5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="5" y1="5" x2="6.5" y2="5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </motion.div>
    );
  }
  return null;
}

function ReceiveRipple({ trigger, color }: { trigger?: number; color: string }) {
  if (!trigger || trigger <= 0) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={trigger}
        className="absolute -inset-[8px] rounded-[20px] pointer-events-none"
        style={{ border: `2px solid ${color}`, boxShadow: `0 0 12px ${color}40` }}
        initial={{ scale: 0.85, opacity: 0.8 }}
        animate={{ scale: 1.8, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </AnimatePresence>
  );
}

function FrictionLabel({ status, description }: { status: SimulationNodeStatus; description?: string }) {
  const isFriction = status === "manual-step" || status === "waiting";
  if (!isFriction || !description) return null;

  const isManual = status === "manual-step";
  const accentColor = isManual ? "#EF4444" : "#F59E0B";
  const tagLabel = isManual ? "PAIN POINT" : "BOTTLENECK";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.92 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 pointer-events-none"
        style={{ top: "100%" }}
      >
        <motion.div
          animate={{
            boxShadow: [
              `0 0 8px ${accentColor}30, 0 2px 8px rgba(0,0,0,0.2)`,
              `0 0 20px ${accentColor}50, 0 4px 16px rgba(0,0,0,0.3)`,
              `0 0 8px ${accentColor}30, 0 2px 8px rgba(0,0,0,0.2)`,
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-lg overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentColor}18, color-mix(in srgb, var(--surface) 90%, transparent))`,
            border: `1.5px solid ${accentColor}60`,
            minWidth: 160,
            maxWidth: 260,
          }}
        >
          {/* Tag header */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1"
            style={{ background: `${accentColor}20`, borderBottom: `1px solid ${accentColor}30` }}
          >
            {/* Icon */}
            {isManual ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1.5L9 8.5H1L5 1.5Z" stroke={accentColor} strokeWidth="1.2" strokeLinejoin="round" />
                <line x1="5" y1="4" x2="5" y2="6" stroke={accentColor} strokeWidth="1" strokeLinecap="round" />
                <circle cx="5" cy="7.2" r="0.4" fill={accentColor} />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="3.5" stroke={accentColor} strokeWidth="1.2" />
                <line x1="5" y1="3" x2="5" y2="5" stroke={accentColor} strokeWidth="1" strokeLinecap="round" />
                <line x1="5" y1="5" x2="6.5" y2="5" stroke={accentColor} strokeWidth="1" strokeLinecap="round" />
              </svg>
            )}
            <span
              className="text-[0.5rem] font-extrabold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              {tagLabel}
            </span>
          </div>
          {/* Description */}
          <div className="px-2.5 py-1.5">
            <span
              className="text-[0.68rem] font-semibold leading-tight block"
              style={{ color: accentColor }}
            >
              {description}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface NodeShellProps {
  data: SimNodeData;
  selected: boolean;
  children?: React.ReactNode;
}

export function NodeShell({ data, selected }: NodeShellProps) {
  const { actor, policy, policyRole, accumulateIdentity, simulationStatus, isActive, frictionDescription } = data;
  const meta = NODE_TYPE_META[actor.type as keyof typeof NODE_TYPE_META];
  const isDashed = actor.type === "vendor" || actor.type === "partner";
  const readOnly = useContext(ReadOnlyContext);

  const updateNodeLabel = useCanvasStore((s) => s.updateNodeLabel);
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(actor.label);

  // Micro-interaction: detect status transitions
  const prevStatusRef = useRef<SimulationNodeStatus>("idle");
  const [microAnim, setMicroAnim] = useState<TargetAndTransition>({});
  const [showApprovalFlash, setShowApprovalFlash] = useState(false);
  const [showDeniedFlash, setShowDeniedFlash] = useState(false);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = simulationStatus;
    if (prev === simulationStatus) return;

    switch (simulationStatus) {
      case "approved":
        setMicroAnim({ scale: [1, 1.15, 1] });
        setShowApprovalFlash(true);
        setTimeout(() => setShowApprovalFlash(false), 800);
        break;
      case "denied":
      case "expired":
        setMicroAnim({ x: [0, -6, 6, -5, 5, -3, 3, -1, 0] });
        setShowDeniedFlash(true);
        setTimeout(() => setShowDeniedFlash(false), 800);
        break;
      case "requesting":
        setMicroAnim({ scale: [1, 1.06, 1] });
        break;
      case "approving":
        setMicroAnim({ scale: [1, 1.08, 1] });
        break;
      case "escalating":
        setMicroAnim({ scale: [1, 1.07, 1], y: [0, -4, 0] });
        break;
      case "delegating":
        setMicroAnim({ scale: [1, 0.94, 1] });
        break;
      case "manual-step":
        setMicroAnim({ y: [0, 3, 0], scale: [1, 1.03, 1] });
        break;
      case "waiting":
        setMicroAnim({ y: [0, 2, 0] });
        break;
      default:
        setMicroAnim({ x: 0, y: 0, scale: 1 });
    }
  }, [simulationStatus]);

  const commitLabel = useCallback(() => {
    const trimmed = editLabel.trim();
    if (trimmed && trimmed !== actor.label) {
      updateNodeLabel(actor.id, trimmed);
    } else {
      setEditLabel(actor.label);
    }
    setEditing(false);
  }, [editLabel, actor.label, actor.id, updateNodeLabel]);

  const glowColor = meta?.color ?? "#94A3B8";
  const isFriction = simulationStatus === "manual-step" || simulationStatus === "waiting";
  const frictionColor = simulationStatus === "manual-step" ? "#EF4444" : "#F59E0B";

  return (
    <motion.div
      className="relative"
      animate={microAnim}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary/50 !border-primary/30 !w-2 !h-2" />

      <StatusRing status={simulationStatus} color={meta?.color ?? "#94A3B8"} />
      <ReceiveRipple trigger={data.receiveRipple} color={meta?.color ?? "#94A3B8"} />
      <StatusIcon status={simulationStatus} />

      <div
        className={`relative rounded-[12px] px-3 py-2.5 backdrop-blur-sm border transition-all duration-200 min-w-[140px] max-w-[220px] ${isDashed ? "border-dashed" : ""} ${isActive ? "animate-active-glow" : ""}`}
        style={{
          "--glow-color": `${glowColor}44`,
          background: isFriction
            ? `linear-gradient(135deg, ${frictionColor}10, color-mix(in srgb, var(--surface) 70%, transparent))`
            : `linear-gradient(135deg, ${meta?.bgAccent ?? "rgba(148,163,184,0.06)"}, color-mix(in srgb, var(--surface) 70%, transparent))`,
          borderColor: selected
            ? meta?.color ?? "#94A3B8"
            : isFriction
              ? `${frictionColor}50`
              : "color-mix(in srgb, var(--overlay) 6%, transparent)",
          boxShadow: selected
            ? `0 0 20px ${meta?.color ?? "#94A3B8"}33`
            : isFriction
              ? `0 0 20px ${frictionColor}35, 0 0 8px ${frictionColor}20`
              : isActive
                ? `0 0 20px ${glowColor}55, 0 0 8px ${glowColor}30`
                : undefined,
        } as React.CSSProperties}
      >
        {/* Approval flash overlay */}
        <AnimatePresence>
          {showApprovalFlash && (
            <motion.div
              className="absolute inset-0 rounded-[12px] pointer-events-none"
              style={{ background: "rgba(34, 197, 94, 0.25)" }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}
        </AnimatePresence>
        {/* Denied flash overlay */}
        <AnimatePresence>
          {showDeniedFlash && (
            <motion.div
              className="absolute inset-0 rounded-[12px] pointer-events-none"
              style={{ background: "rgba(239, 68, 68, 0.2)" }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2">
          <NodeIcon type={actor.type} size={14} />
          <div className="flex-1 min-w-0">
            {editing && !readOnly ? (
              <input
                autoFocus
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={commitLabel}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitLabel();
                  if (e.key === "Escape") {
                    setEditLabel(actor.label);
                    setEditing(false);
                  }
                }}
                className="w-full text-[0.75rem] font-semibold text-text bg-transparent border-b border-primary/50 outline-none"
              />
            ) : (
              <div
                className={`text-[0.75rem] font-semibold truncate text-text ${readOnly ? "" : "cursor-text"}`}
                onDoubleClick={
                  readOnly
                    ? undefined
                    : () => {
                        setEditLabel(actor.label);
                        setEditing(true);
                      }
                }
              >
                {actor.label}
              </div>
            )}
            <div className="text-[0.625rem] truncate text-text-subtle">{meta?.label ?? actor.type}</div>
          </div>
        </div>

        {policy && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {/* Owner (department): full policy details */}
            {(!policyRole || policyRole === "owner") && (
              <>
                <PolicyPill>{policy.threshold.k}-of-{policy.threshold.n}</PolicyPill>
                {policy.expirySeconds > 0 && (
                  <PolicyPill>
                    {policy.expirySeconds >= 86400
                      ? `${Math.round(policy.expirySeconds / 86400)}d`
                      : policy.expirySeconds >= 3600
                        ? `${Math.round(policy.expirySeconds / 3600)}h`
                        : `${policy.expirySeconds}s`}
                  </PolicyPill>
                )}
                {policy.delegationAllowed && <PolicyPill>Delegate</PolicyPill>}
                {policy.escalation && <PolicyPill>Escalation</PolicyPill>}
              </>
            )}
            {/* Approver role: show they participate in the threshold */}
            {policyRole === "approver" && (
              <>
                <PolicyPill>Approver</PolicyPill>
                <PolicyPill>{policy.threshold.k}-of-{policy.threshold.n}</PolicyPill>
              </>
            )}
            {/* Delegate target */}
            {policyRole === "delegate" && (
              <PolicyPill>Delegate Target</PolicyPill>
            )}
            {/* Escalation target */}
            {policyRole === "escalation" && (
              <PolicyPill>Escalation</PolicyPill>
            )}
          </div>
        )}

        {!policy && accumulateIdentity && accumulateIdentity.pills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {accumulateIdentity.pills.map((label) => (
              <PolicyPill key={label} variant="identity">{label}</PolicyPill>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary/50 !border-primary/30 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} id="delegation" className="!bg-warning/50 !border-warning/30 !w-2 !h-2" />

      <FrictionLabel status={simulationStatus} description={frictionDescription} />
    </motion.div>
  );
}
