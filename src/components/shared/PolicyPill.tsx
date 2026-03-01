import { cn } from "@/lib/utils";

interface PolicyPillProps {
  children: React.ReactNode;
  className?: string;
  variant?: "policy" | "identity";
}

const variantStyles = {
  policy: "bg-primary-soft text-primary font-semibold border-primary/20",
  identity: "bg-success/8 text-success/70 font-medium border-success/15",
} as const;

export function PolicyPill({ children, className, variant = "policy" }: PolicyPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs rounded-[999px] px-2.5 py-1 border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
