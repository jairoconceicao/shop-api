import type { ButtonHTMLAttributes } from 'react'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

export function Chip({
  selected = false,
  type = 'button',
  className,
  ...props
}: ChipProps) {
  const stateClasses = selected
    ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
    : 'border-ink-700 text-zinc-400 hover:border-brand-500/50 hover:text-zinc-100'
  const classes = [
    'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-40',
    stateClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      aria-pressed={selected}
      className={classes}
      {...props}
    />
  )
}
