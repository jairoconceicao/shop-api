import {
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import { getFocusableElements } from './focus'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  initialFocusRef?: RefObject<HTMLElement | null>
  closeDisabled?: boolean
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  initialFocusRef,
  closeDisabled = false,
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    returnFocusRef.current = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    const firstFocusTarget = initialFocusRef?.current ?? (dialog && getFocusableElements(dialog)[0])
    firstFocusTarget?.focus()

    return () => returnFocusRef.current?.focus()
  }, [initialFocusRef, open])

  if (!open) return null

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onOpenChange(false)
      return
    }

    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = getFocusableElements(dialogRef.current)
    const first = focusable[0]
    const last = focusable.at(-1)

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="surface-raised w-full max-w-lg p-6"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-zinc-50">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-2 text-sm text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Fechar dialogo"
            aria-disabled={closeDisabled || undefined}
            disabled={closeDisabled}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl text-zinc-300 hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              if (!closeDisabled) onOpenChange(false)
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
