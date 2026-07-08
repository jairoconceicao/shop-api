import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Input({
  label,
  hint,
  error,
  success,
  leadingIcon,
  trailingIcon,
  className,
  id,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const message = error ?? success ?? hint;

  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-2 block text-sm font-medium text-spanish-green-800">{label}</span>
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-spanish-green-500">
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={cn(
            "h-12 w-full rounded-2xl border bg-white px-4 text-sm text-spanish-green-950 placeholder:text-spanish-green-400 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-spanish-green-100",
            leadingIcon ? "pl-11" : "",
            trailingIcon ? "pr-11" : "",
            error
              ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
              : success
                ? "border-emerald-300 focus-visible:border-emerald-400 focus-visible:ring-emerald-100"
                : "border-spanish-green-200 focus-visible:border-spanish-green-500 focus-visible:ring-spanish-green-200",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? `${inputId}-message` : undefined}
          {...props}
        />
        {trailingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-spanish-green-500">
            {trailingIcon}
          </span>
        ) : null}
      </div>
      {message ? (
        <p
          id={`${inputId}-message`}
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
