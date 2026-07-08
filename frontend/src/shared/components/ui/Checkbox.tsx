import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/shared/lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  hint?: string;
  error?: string;
};

export function Checkbox({ label, hint, error, className, id, ...props }: CheckboxProps) {
  const autoId = useId();
  const checkboxId = id ?? autoId;
  const message = error ?? hint;

  return (
    <div className="block">
      <label
        htmlFor={checkboxId}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-2xl border bg-white px-4 py-3 transition",
          error ? "border-red-300" : "border-spanish-green-200 hover:bg-spanish-green-50",
          className,
        )}
      >
        <input
          id={checkboxId}
          type="checkbox"
          className="mt-1 size-4 rounded border-spanish-green-300 text-spanish-green-700 focus-visible:ring-4 focus-visible:ring-spanish-green-200"
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? `${checkboxId}-message` : undefined}
          {...props}
        />
        <span className="flex-1">
          <span className="block text-sm font-medium text-spanish-green-900">{label}</span>
          {message ? (
            <span id={`${checkboxId}-message`} className={cn("mt-1 block text-xs leading-5", error ? "text-red-600" : "text-spanish-green-600")}>
              {message}
            </span>
          ) : null}
        </span>
      </label>
    </div>
  );
}
