import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../shared/errors/appError'
import { useAuthStore } from '../../auth/store/authStore'
import { CustomerPasswordPage } from './CustomerPasswordPage'

const { mutateAsync } = vi.hoisted(() => ({ mutateAsync: vi.fn() }))
vi.mock('../mutations/useUpdateCustomerPasswordMutation', () => ({
  useUpdateCustomerPasswordMutation: () => ({ mutateAsync }),
}))

function fill(current = 'Atual#123', next = 'Nova#456A') {
  fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: current } })
  fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: next } })
}

describe('CustomerPasswordPage', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    useAuthStore.getState().setSession({ token: 'captured', clienteId: 7, usuarioId: 7, tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', email: 'a@b.com' }, 'session')
  })

  it('has password autocomplete, visible rules and strict local validation', async () => {
    render(<CustomerPasswordPage />)
    expect(screen.getByLabelText('Senha atual')).toHaveAttribute('autocomplete', 'current-password')
    expect(screen.getByLabelText('Nova senha')).toHaveAttribute('autocomplete', 'new-password')
    const rules = screen.getByRole('list', { name: 'Regras da nova senha' })
    expect(rules).toBeVisible()
    expect(screen.getByLabelText('Nova senha')).toHaveAttribute('aria-describedby', expect.stringContaining(rules.id))
    fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus())
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('captures one attempt, blocks duplicate submit and clears both passwords on matching success', async () => {
    let release!: (value: { customerId: number }) => void
    mutateAsync.mockReturnValue(new Promise((resolve) => { release = resolve }))
    render(<CustomerPasswordPage />)
    fill()
    const submit = screen.getByRole('button', { name: 'Alterar senha' })
    fireEvent.click(submit); fireEvent.click(submit)
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    expect(mutateAsync).toHaveBeenCalledWith({ customerId: 7, token: 'captured', request: { senhaAtual: 'Atual#123', senhaNova: 'Nova#456A' } })
    release({ customerId: 7 })
    const confirmation = await screen.findByText('Senha alterada com sucesso.')
    expect(confirmation).toHaveFocus()
    expect(screen.getByLabelText('Senha atual')).toHaveValue('')
    expect(screen.getByLabelText('Nova senha')).toHaveValue('')
  })

  it('maps known 422 details to fields, unknown details to summary, preserves current and clears new password', async () => {
    mutateAsync.mockRejectedValue(new AppError({ kind: 'http', status: 422, message: 'Revise', details: [
      { propertyName: 'SenhaAtual', message: 'Senha atual incorreta.' },
      { propertyName: 'SenhaNova', message: 'A nova senha foi recusada.' },
      { propertyName: 'Outro', message: 'Regra remota desconhecida.' },
    ] }))
    render(<CustomerPasswordPage />); fill(); fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }))
    expect((await screen.findAllByText('Senha atual incorreta.')).length).toBe(2)
    expect(screen.getAllByText('A nova senha foi recusada.')).toHaveLength(2)
    expect(screen.getByLabelText('Nova senha')).toHaveAccessibleDescription(expect.stringContaining('A nova senha foi recusada.'))
    expect(screen.getByText('Regra remota desconhecida.')).toBeVisible()
    expect(screen.getByLabelText('Senha atual')).toHaveValue('Atual#123')
    expect(screen.getByLabelText('Nova senha')).toHaveValue('')
  })

  it('has no UI effects when the session changes before a late response', async () => {
    let release!: (value: { customerId: number }) => void
    mutateAsync.mockReturnValue(new Promise((resolve) => { release = resolve }))
    render(<CustomerPasswordPage />); fill(); fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }))
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    useAuthStore.getState().clearSession(); release({ customerId: 7 })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Alterar senha' })).toBeEnabled())
    expect(screen.queryByText('Senha alterada com sucesso.')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Senha atual')).toHaveValue('Atual#123')
    expect(screen.getByLabelText('Nova senha')).toHaveValue('Nova#456A')
  })
})
