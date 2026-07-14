import type { HTMLAttributes } from 'react'

export type BadgeStatus =
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'brand'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus
}

const statusClasses: Record<BadgeStatus, string> = {
  success:
    'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  danger: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
  neutral: 'border-ink-700 bg-ink-800 text-zinc-400',
  brand: 'border-brand-500/20 bg-brand-500/10 text-brand-300',
}

export function Badge({
  status = 'neutral',
  className,
  ...props
}: BadgeProps) {
  const classes = [
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
    statusClasses[status],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={classes} {...props} />
}
