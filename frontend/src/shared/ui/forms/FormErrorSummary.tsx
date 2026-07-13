import type { HTMLAttributes } from 'react'
import { joinClasses } from './fieldStyles'

export interface FormError {
  fieldId?: string
  message: string
}

export interface FormErrorSummaryProps extends HTMLAttributes<HTMLDivElement> {
  errors: FormError[]
  title?: string
}

export function FormErrorSummary({
  errors,
  title = 'Revise os campos destacados',
  className,
  ...props
}: FormErrorSummaryProps) {
  if (errors.length === 0) return null

  return (
    <div
      role="alert"
      tabIndex={-1}
      className={joinClasses(
        'rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200',
        className,
      )}
      {...props}
    >
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {errors.map((error, index) => (
          <li key={`${error.fieldId ?? 'form'}-${index}`}>
            {error.fieldId ? (
              <a className="underline underline-offset-2 hover:text-rose-100" href={`#${error.fieldId}`}>
                {error.message}
              </a>
            ) : error.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
