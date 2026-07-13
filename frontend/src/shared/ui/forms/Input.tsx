import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { FieldError } from './FieldError'
import { fieldControlClasses, joinClasses } from './fieldStyles'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode
  error?: ReactNode
  hint?: ReactNode
}

export function Input({
  label,
  error,
  hint,
  id: providedId,
  className,
  'aria-describedby': ariaDescribedBy,
  ...props
}: InputProps) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [ariaDescribedBy, hintId, errorId]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-200">
        {label}
      </label>
      <input
        id={id}
        className={joinClasses(fieldControlClasses, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint ? <p id={hintId} className="mt-1.5 text-sm text-zinc-400">{hint}</p> : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}
