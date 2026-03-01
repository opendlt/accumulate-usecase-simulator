import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "default" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-[10px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer";

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-pressed hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]",
  secondary:
    "bg-transparent border border-border text-text hover:bg-surface-2 active:bg-surface",
  tertiary: "bg-transparent text-text-muted hover:text-text active:text-text",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  default: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  children,
  variant = "primary",
  size = "default",
  className,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      {children}
    </button>
  );
}
