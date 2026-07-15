import { useRef } from 'react'

import type { AppError } from '../../../shared/errors/appError'
import { Button } from '../../../shared/ui/buttons/Button'
import { getButtonClasses } from '../../../shared/ui/buttons/buttonStyles'
import { Dialog } from '../../../shared/ui/overlays/Dialog'

export interface CancelOrderDialogProps {
  open: boolean
  pending: boolean
  error: AppError | null
  onCancel: () => void
  onConfirm: () => void
}

export function CancelOrderDialog({ open, pending, error, onCancel, onConfirm }: CancelOrderDialogProps) {
  const backButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !pending) onCancel()
      }}
      title="Cancelar pedido"
      description="Confirme se deseja solicitar o cancelamento deste pedido."
      initialFocusRef={backButtonRef}
      closeDisabled={pending}
    >
      {error ? <p role="alert" className="mt-4 text-sm text-red-300">Não foi possível cancelar o pedido. Tente novamente.</p> : null}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button ref={backButtonRef} type="button" className={getButtonClasses({ variant: 'secondary' })} disabled={pending} onClick={onCancel}>
          Voltar
        </button>
        <Button disabled={pending} onClick={onConfirm}>
          {pending ? 'Cancelando pedido...' : 'Cancelar pedido'}
        </Button>
      </div>
    </Dialog>
  )
}
