import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const badgeClasses: Record<BadgeVariant, string> = {
  neutral: "bg-spanish-green-100 text-spanish-green-700 ring-spanish-green-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  accent: "bg-amber-100 text-amber-800 ring-amber-200",
};

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        badgeClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
