import type { HTMLAttributes, ReactNode } from 'react'

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  action?: ReactNode
}

export function ErrorState({
  title = 'Não foi possível carregar o conteúdo',
  description = 'Verifique sua conexão e tente novamente.',
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div role="alert" className={['surface flex flex-col items-center px-6 py-10 text-center', className].filter(Boolean).join(' ')} {...props}>
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-xl text-rose-300" aria-hidden="true">!</div>
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-zinc-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
