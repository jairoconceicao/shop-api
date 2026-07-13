import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { FieldError } from './FieldError'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  error?: ReactNode
  description?: ReactNode
}

export function Checkbox({
  label,
  error,
  description,
  id: providedId,
  className,
  'aria-describedby': ariaDescribedBy,
  ...props
}: CheckboxProps) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [ariaDescribedBy, descriptionId, errorId]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div>
      <div className="flex min-h-10 items-start gap-3">
        <input
          type="checkbox"
          id={id}
          className={`mt-2 size-4 shrink-0 cursor-pointer accent-brand-500 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        <div className="pt-1.5">
          <label htmlFor={id} className="cursor-pointer text-sm font-medium text-zinc-200">
            {label}
          </label>
          {description ? <p id={descriptionId} className="mt-1 text-sm text-zinc-400">{description}</p> : null}
        </div>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}
