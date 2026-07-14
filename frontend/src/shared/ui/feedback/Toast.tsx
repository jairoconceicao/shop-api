import type { HTMLAttributes } from 'react'
import type { FeedbackVariant } from './InlineAlert'

const variantClasses: Record<FeedbackVariant, string> = {
  info: 'border-sky-500/30',
  success: 'border-emerald-500/30',
  warning: 'border-amber-500/30',
  error: 'border-rose-500/30',
}

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  message: string
  variant?: FeedbackVariant
  onDismiss?: () => void
}

export function Toast({
  message,
  variant = 'info',
  onDismiss,
  className,
  ...props
}: ToastProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={[
        'surface-raised flex w-full max-w-sm items-start gap-3 border p-4 text-sm text-zinc-100',
        variantClasses[variant],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      <p className="min-w-0 flex-1">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          className="-m-2 flex min-h-10 min-w-10 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100"
          aria-label="Fechar notificação"
          onClick={onDismiss}
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
    </div>
  )
}
