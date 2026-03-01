import type React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Enable the standard hover effect (lift + border glow + gradient overlay) */
  hoverable?: boolean;
}

export function GlassCard({ children, className, hoverable }: GlassCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-surface/60 backdrop-blur-sm border border-overlay/[0.06] rounded-[14px] p-4 transition-all duration-300",
        hoverable && "hover:border-primary/30 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] hover:-translate-y-1",
        className
      )}
    >
      {hoverable && (
        <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-primary/10 via-transparent to-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
