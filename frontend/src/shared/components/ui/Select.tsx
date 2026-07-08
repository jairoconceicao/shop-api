import type { ReactNode, SelectHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/shared/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  children: ReactNode;
};

export function Select({ label, hint, error, success, children, className, id, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const message = error ?? success ?? hint;

  return (
    <label htmlFor={selectId} className="block">
      <span className="mb-2 block text-sm font-medium text-spanish-green-800">{label}</span>
      <select
        id={selectId}
        className={cn(
          "h-12 w-full appearance-none rounded-2xl border bg-white px-4 text-sm text-spanish-green-950 transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:bg-spanish-green-100",
          error
            ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
            : success
              ? "border-emerald-300 focus-visible:border-emerald-400 focus-visible:ring-emerald-100"
              : "border-spanish-green-200 focus-visible:border-spanish-green-500 focus-visible:ring-spanish-green-200",
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? `${selectId}-message` : undefined}
        {...props}
      >
        {children}
      </select>
      {message ? (
        <p
          id={`${selectId}-message`}
          className={cn(
            "mt-2 text-xs leading-5",
            error ? "text-red-600" : success ? "text-emerald-700" : "text-spanish-green-600",
          )}
        >
          {message}
        </p>
      ) : null}
    </label>
  );
}
