import type { HTMLAttributes, ReactNode } from 'react'

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={['surface flex flex-col items-center px-6 py-10 text-center', className].filter(Boolean).join(' ')} {...props}>
      {icon ? <div className="mb-4 text-zinc-500" aria-hidden="true">{icon}</div> : null}
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      {description ? <p className="mt-2 max-w-md text-sm text-zinc-400">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
