import { cn } from "@/lib/utils";

interface GlowOrbProps {
  color?: string;
  size?: number;
  className?: string;
}

export function GlowOrb({ color = "#3B82F6", size = 500, className }: GlowOrbProps) {
  return (
    <div
      className={cn("absolute rounded-full opacity-[0.06] blur-[120px] pointer-events-none", className)}
      style={{ width: size, height: size, background: color }}
      aria-hidden="true"
    />
  );
}
