import type { HTMLAttributes } from 'react'
import { getCardClasses, type CardVariant } from './surfaceStyles'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant
}

export function Card({
  variant = 'default',
  className,
  ...props
}: CardProps) {
  return (
    <article className={getCardClasses(variant, className)} {...props} />
  )
}
