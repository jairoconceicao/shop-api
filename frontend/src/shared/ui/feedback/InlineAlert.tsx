import type { HTMLAttributes, ReactNode } from 'react'

export type FeedbackVariant = 'info' | 'success' | 'warning' | 'error'

const variantClasses: Record<FeedbackVariant, string> = {
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
}

export interface InlineAlertProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  variant?: FeedbackVariant
  action?: ReactNode
}

export function InlineAlert({
  title,
  variant = 'info',
  action,
  children,
  className,
  role,
  ...props
}: InlineAlertProps) {
  return (
    <div
      role={role ?? (variant === 'error' ? 'alert' : 'status')}
      className={[
        'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between',
        variantClasses[variant],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      <div>
        <p className="font-semibold">{title}</p>
        {children ? <div className="mt-1 text-sm text-zinc-300">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
