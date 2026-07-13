import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import { FieldError } from './FieldError'
import { fieldControlClasses, joinClasses } from './fieldStyles'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: ReactNode
  error?: ReactNode
  hint?: ReactNode
}

export function Select({
  label,
  error,
  hint,
  id: providedId,
  className,
  children,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SelectProps) {
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
      <select
        id={id}
        className={joinClasses(fieldControlClasses, 'cursor-pointer', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </select>
      {hint ? <p id={hintId} className="mt-1.5 text-sm text-zinc-400">{hint}</p> : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}
