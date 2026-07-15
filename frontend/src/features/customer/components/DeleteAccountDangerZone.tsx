import { useRef, useState } from 'react'

import { Button } from '../../../shared/ui/buttons/Button'
import { getButtonClasses } from '../../../shared/ui/buttons/buttonStyles'
import { Checkbox } from '../../../shared/ui/forms/Checkbox'
import { Dialog } from '../../../shared/ui/overlays/Dialog'

export interface DeleteAccountDangerZoneProps {
  pending: boolean
  error: string | null
  onConfirm: () => void | Promise<void>
}

export function DeleteAccountDangerZone({
  pending,
  error,
  onConfirm,
}: DeleteAccountDangerZoneProps) {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const confirmInFlightRef = useRef(false)
  const backButtonRef = useRef<HTMLButtonElement>(null)

  const closeWhenAllowed = () => {
    if (pending) return
    setOpen(false)
    setConfirmed(false)
  }

  const confirmOnce = async () => {
    if (!confirmed || pending || confirmInFlightRef.current) return
    confirmInFlightRef.current = true
    try {
      await onConfirm()
    } finally {
      confirmInFlightRef.current = false
    }
  }

  return (
    <section
      aria-labelledby="delete-account-heading"
      className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4 sm:p-6"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">Área de perigo</p>
      <h2 id="delete-account-heading" className="mt-2 text-xl font-bold text-zinc-50">Cancelar conta</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-300">
        O cancelamento é permanente. Você perderá o acesso à conta, ao carrinho e ao histórico dos seus pedidos.
      </p>
      <Button className="mt-5 w-full sm:w-auto" variant="danger" onClick={() => setOpen(true)}>
        Cancelar minha conta
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeWhenAllowed()
        }}
        title="Confirmar cancelamento da conta"
        description="Esta ação é permanente e não pode ser desfeita. Seus dados de acesso e o vínculo com o carrinho serão removidos."
        initialFocusRef={backButtonRef}
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-zinc-200">
            <p className="font-semibold text-rose-200">Antes de continuar, saiba que:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>você não poderá mais entrar nesta conta;</li>
              <li>o vínculo com o carrinho será removido;</li>
              <li>o acesso ao histórico dos pedidos será perdido.</li>
            </ul>
          </div>

          {error ? <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</p> : null}

          <Checkbox
            id="delete-account-confirmation"
            checked={confirmed}
            disabled={pending}
            label="Entendo que o cancelamento é permanente e quero continuar"
            onChange={(event) => setConfirmed(event.target.checked)}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button ref={backButtonRef} type="button" className={getButtonClasses({ variant: 'secondary' })} disabled={pending} onClick={closeWhenAllowed}>
              Voltar
            </button>
            <Button variant="danger" disabled={!confirmed || pending} onClick={() => { void confirmOnce() }}>
              {pending ? 'Cancelando conta…' : 'Cancelar conta permanentemente'}
            </Button>
          </div>
        </div>
      </Dialog>
    </section>
  )
}
