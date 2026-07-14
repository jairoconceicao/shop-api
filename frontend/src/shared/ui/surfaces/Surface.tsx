import type { HTMLAttributes } from 'react'
import {
  getSurfaceClasses,
  type SurfaceVariant,
} from './surfaceStyles'

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant
}

export function Surface({
  variant = 'base',
  className,
  ...props
}: SurfaceProps) {
  return (
    <div className={getSurfaceClasses(variant, className)} {...props} />
  )
}
