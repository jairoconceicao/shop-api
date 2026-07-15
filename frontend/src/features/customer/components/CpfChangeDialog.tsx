import { useRef } from 'react'

import { formatCpf } from '../../../shared/formatting/personalData'
import { Button } from '../../../shared/ui/buttons/Button'
import { getButtonClasses } from '../../../shared/ui/buttons/buttonStyles'
import { Dialog } from '../../../shared/ui/overlays/Dialog'

export interface CpfChangeDialogProps {
  open: boolean
  previousCpf: string
  nextCpf: string
  pending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function CpfChangeDialog({
  open,
  previousCpf,
  nextCpf,
  pending,
  onCancel,
  onConfirm,
}: CpfChangeDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const cancelWhenAllowed = () => {
    if (!pending) onCancel()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) cancelWhenAllowed()
      }}
      title="Confirmar alteração do CPF"
      description="Confira os dados antes de continuar. A alteração do CPF exige confirmação específica."
      initialFocusRef={cancelButtonRef}
      closeDisabled={pending}
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-zinc-400">CPF atual</dt>
          <dd className="mt-1 font-semibold text-zinc-100">{formatCpf(previousCpf)}</dd>
        </div>
        <div>
          <dt className="text-sm text-zinc-400">Novo CPF</dt>
          <dd className="mt-1 font-semibold text-zinc-100">{formatCpf(nextCpf)}</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button ref={cancelButtonRef} type="button" className={getButtonClasses({ variant: 'secondary' })} disabled={pending} onClick={cancelWhenAllowed}>
          Voltar
        </button>
        <Button disabled={pending} onClick={onConfirm}>
          {pending ? 'Confirmando…' : 'Confirmar alteração'}
        </Button>
      </div>
    </Dialog>
  )
}
