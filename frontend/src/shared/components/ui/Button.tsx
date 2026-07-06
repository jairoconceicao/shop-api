import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-spanish-green-700 text-white shadow-sm shadow-spanish-green-950/10 hover:bg-spanish-green-600",
  secondary:
    "border border-spanish-green-200 bg-white text-spanish-green-800 hover:border-spanish-green-300 hover:bg-spanish-green-50",
  ghost: "text-spanish-green-700 hover:bg-spanish-green-100",
  danger: "bg-red-600 text-white shadow-sm shadow-red-950/10 hover:bg-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leadingIcon,
  trailingIcon,
  className,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-spanish-green-200 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      ) : (
        leadingIcon
      )}
      <span>{children}</span>
      {!isLoading ? trailingIcon : null}
    </button>
  );
}
