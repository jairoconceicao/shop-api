import type { HTMLAttributes, ReactNode } from 'react'
import { joinClasses } from './fieldStyles'

export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode
}

export function FieldError({ children, className, ...props }: FieldErrorProps) {
  if (!children) return null

  return (
    <p
      className={joinClasses('mt-1.5 text-sm text-rose-300', className)}
      {...props}
    >
      {children}
    </p>
  )
}
