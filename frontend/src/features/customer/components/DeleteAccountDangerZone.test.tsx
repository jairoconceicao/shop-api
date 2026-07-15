import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DeleteAccountDangerZone } from './DeleteAccountDangerZone'

describe('DeleteAccountDangerZone', () => {
  it('describes irreversible consequences and requires a second confirmed step', () => {
    const onConfirm = vi.fn()
    render(<DeleteAccountDangerZone pending={false} error={null} onConfirm={onConfirm} />)

    const region = screen.getByRole('region', { name: 'Cancelar conta' })
    expect(region).toHaveTextContent('permanente')
    expect(region).toHaveTextContent('pedidos')
    expect(region).toHaveTextContent('carrinho')

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar minha conta' }))

    const dialog = screen.getByRole('dialog', { name: 'Confirmar cancelamento da conta' })
    expect(dialog).toHaveAccessibleDescription()
    expect(onConfirm).not.toHaveBeenCalled()
    const confirm = screen.getByRole('button', { name: 'Cancelar conta permanentemente' })
    expect(confirm).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: /entendo que o cancelamento é permanente/i }))
    expect(confirm).toBeEnabled()
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('focuses the safe action, traps focus, closes safely and restores the trigger focus', async () => {
    render(<DeleteAccountDangerZone pending={false} error={null} onConfirm={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: 'Cancelar minha conta' })
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Confirmar cancelamento da conta' })
    const back = screen.getByRole('button', { name: 'Voltar' })
    expect(back).toHaveFocus()

    const close = screen.getByRole('button', { name: 'Fechar dialogo' })
    close.focus()
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(back).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(dialog).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('keeps the synchronous latch until pending completes and blocks every closing path while pending', async () => {
    const onConfirm = vi.fn()
    const { rerender } = render(<DeleteAccountDangerZone pending={false} error={null} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar minha conta' }))
    fireEvent.click(screen.getByRole('checkbox', { name: /entendo que o cancelamento é permanente/i }))
    const confirm = screen.getByRole('button', { name: 'Cancelar conta permanentemente' })
    fireEvent.click(confirm)
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledOnce()
    await Promise.resolve()
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledOnce()

    rerender(<DeleteAccountDangerZone pending error={null} onConfirm={onConfirm} />)

    const dialog = screen.getByRole('dialog', { name: 'Confirmar cancelamento da conta' })
    expect(screen.getByRole('button', { name: 'Cancelando conta…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeDisabled()
    const close = screen.getByRole('button', { name: 'Fechar dialogo' })
    expect(close).toBeDisabled()
    fireEvent.click(close)
    fireEvent.keyDown(dialog, { key: 'Escape' })
    fireEvent.mouseDown(dialog.parentElement!)

    expect(dialog).toBeInTheDocument()
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('captures a rejected confirmation and leaves the dialog retryable', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('request failed'))
    render(<DeleteAccountDangerZone pending={false} error="Não foi possível cancelar a conta." onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar minha conta' }))
    fireEvent.click(screen.getByRole('checkbox', { name: /entendo que o cancelamento é permanente/i }))
    const confirm = screen.getByRole('button', { name: 'Tentar novamente' })

    fireEvent.click(confirm)
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce())
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeVisible()

    fireEvent.click(confirm)
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(2))
  })

  it('announces an error and keeps the dialog available for retry', () => {
    const onConfirm = vi.fn()
    render(<DeleteAccountDangerZone pending={false} error="Não foi possível cancelar a conta." onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar minha conta' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível cancelar a conta.')
    fireEvent.click(screen.getByRole('checkbox', { name: /entendo que o cancelamento é permanente/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
