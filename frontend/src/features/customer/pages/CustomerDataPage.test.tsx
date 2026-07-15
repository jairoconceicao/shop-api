import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CustomerProfile } from '../contracts/customerProfile'
import { CustomerDataForm, CustomerDataPage } from './CustomerDataPage'

const { useCustomerProfileQueryMock } = vi.hoisted(() => ({
  useCustomerProfileQueryMock: vi.fn(),
}))

vi.mock('../queries/useCustomerProfileQuery', () => ({
  useCustomerProfileQuery: useCustomerProfileQueryMock,
}))

const profile: CustomerProfile = {
  customerId: 7,
  cpf: '12345678901',
  nome: 'Ana Cliente',
  dataNascimento: '1990-01-02',
  email: 'ana@example.com',
  endereco: {
    logradouro: 'Rua A', numero: '10', complemento: null, cep: '12345-678',
    bairro: 'Centro', cidade: 'São Paulo', uf: 'SP',
  },
  celular: { ddd: '11', numero: '999999999', whatsApp: true },
}

describe('CustomerDataPage', () => {
  beforeEach(() => useCustomerProfileQueryMock.mockReset())

  it('shows a stable accessible loading state before rendering the form', () => {
    useCustomerProfileQueryMock.mockReturnValue({ isPending: true })
    render(<CustomerDataPage />)

    expect(screen.getByRole('status', { name: 'Carregando dados do cliente' })).toHaveClass('min-h-96')
    expect(screen.queryByRole('form', { name: 'Meus dados' })).not.toBeInTheDocument()
  })

  it('shows an error and retries manually', () => {
    const refetch = vi.fn().mockResolvedValue(undefined)
    useCustomerProfileQueryMock.mockReturnValue({ isPending: false, isError: true, refetch })
    render(<CustomerDataPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('renders the complete profile only after valid data is available', () => {
    useCustomerProfileQueryMock.mockReturnValue({ isPending: false, isError: false, data: profile })
    render(<CustomerDataPage />)

    expect(screen.getByRole('form', { name: 'Meus dados' })).toBeVisible()
    expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-01')
    expect(screen.getByLabelText('DDD')).toHaveValue('11')
    expect(screen.getByLabelText('Celular')).toHaveValue('999999999')
    expect(screen.getByRole('checkbox', { name: 'Este celular também é WhatsApp' })).toBeChecked()
  })
})

describe('CustomerDataForm', () => {
  afterEach(() => vi.useRealTimers())

  it('uses the local civil date as the maximum birth date near a UTC rollover', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-16T01:00:00.000Z'))

    render(<CustomerDataForm profile={profile} />)

    expect(screen.getByLabelText('Data de nascimento')).toHaveAttribute('max', '2026-07-15')
  })

  it('preserves dirty fields and refreshes untouched fields when the snapshot changes', () => {
    const { rerender } = render(<CustomerDataForm profile={profile} />)
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Nome em edição' } })

    rerender(<CustomerDataForm profile={{ ...profile, nome: 'Nome remoto', email: 'novo@example.com' }} />)

    expect(screen.getByLabelText('Nome completo')).toHaveValue('Nome em edição')
    expect(screen.getByLabelText('E-mail')).toHaveValue('novo@example.com')
  })

  it('validates locally, associates errors and focuses the summary', async () => {
    const onValidRequest = vi.fn()
    render(<CustomerDataForm profile={profile} onValidRequest={onValidRequest} />)
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    const summary = await screen.findByRole('alert')
    await waitFor(() => expect(summary).toHaveFocus())
    expect(screen.getByLabelText('CPF')).toHaveAccessibleDescription('Informe um CPF com 11 dígitos.')
    expect(screen.getByLabelText('Nome completo')).toHaveAccessibleDescription('Informe seu nome.')
    expect(onValidRequest).not.toHaveBeenCalled()
  })

  it('awaits an async callback with the strict normalized request', async () => {
    let release: (() => void) | undefined
    const onValidRequest = vi.fn(() => new Promise<void>((resolve) => { release = resolve }))
    render(<CustomerDataForm profile={profile} onValidRequest={onValidRequest} />)
    fireEvent.change(screen.getByLabelText('Complemento (opcional)'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(onValidRequest).toHaveBeenCalledOnce())
    expect(onValidRequest).toHaveBeenCalledWith(expect.objectContaining({
      cpf: '12345678901',
      endereco: expect.objectContaining({ complemento: null }),
      celular: { ddd: '11', numero: '999999999', whatsApp: true },
    }))
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled()
    release?.()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled())
  })
})
