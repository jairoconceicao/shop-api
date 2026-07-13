export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export type ButtonSize = 'sm' | 'md' | 'lg'

const baseClasses =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold tracking-tight transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-ink-950 shadow-lg shadow-brand-500/20 hover:bg-brand-400 active:bg-brand-600',
  secondary:
    'border border-ink-700 bg-ink-800 text-zinc-100 hover:border-ink-600 hover:bg-ink-750 active:bg-ink-700',
  ghost:
    'bg-transparent text-zinc-300 hover:bg-ink-800 hover:text-zinc-50 active:bg-ink-700',
  danger:
    'border border-rose-500/30 bg-transparent text-rose-300 hover:border-rose-500/50 hover:bg-rose-500/10 active:bg-rose-500/20',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-2 text-xs',
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-12 px-6 py-3 text-base',
}

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'size-9 p-2',
  md: 'size-11 p-2.5',
  lg: 'size-12 p-3',
}

export function getButtonClasses({
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  iconOnly?: boolean
  className?: string
}) {
  return [
    baseClasses,
    variantClasses[variant],
    iconOnly ? iconSizeClasses[size] : sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')
}
