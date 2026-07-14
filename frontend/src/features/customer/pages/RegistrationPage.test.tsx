import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { RegistrationPage } from './RegistrationPage'

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe('RegistrationPage', () => {
  it('renders one address and the WhatsApp indicator', () => {
    render(<RegistrationPage />, { wrapper: MemoryRouter })

    expect(screen.getAllByRole('group', { name: 'Endereço' })).toHaveLength(1)
    expect(screen.getByRole('checkbox', { name: 'Este celular também é WhatsApp' })).toBeVisible()
  })

  it('normalizes masked fields and maps the WhatsApp indicator on submit', async () => {
    const onSubmit = vi.fn()
    render(<RegistrationPage onSubmit={onSubmit} />, { wrapper: MemoryRouter })

    fill('Nome completo', 'Cliente Exemplo')
    fill('CPF', '12345678901')
    fill('Data de nascimento', '1990-05-20')
    fill('E-mail', 'cliente@exemplo.com')
    fill('Senha', 'Senha@123')
    fill('CEP', '12345678')
    fill('Logradouro', 'Rua Um')
    fill('Número', '123')
    fill('Bairro', 'Centro')
    fill('Cidade', 'São Paulo')
    fill('UF', 'sp')
    fill('Celular', '11912345678')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Este celular também é WhatsApp' }))
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-01')
    expect(screen.getByLabelText('CEP')).toHaveValue('12345-678')
    expect(onSubmit).toHaveBeenCalledWith({
      senha: 'Senha@123',
      cpf: '12345678901',
      nome: 'Cliente Exemplo',
      dataNascimento: '1990-05-20',
      email: 'cliente@exemplo.com',
      endereco: {
        logradouro: 'Rua Um',
        numero: '123',
        complemento: null,
        cep: '12345678',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
      },
      celular: { ddd: '11', numero: '912345678', whatsApp: true },
    })
  })

  it('shows validation errors without submitting an empty form', async () => {
    const onSubmit = vi.fn()
    render(<RegistrationPage onSubmit={onSubmit} />, { wrapper: MemoryRouter })

    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect((await screen.findAllByText('Informe seu CPF.')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Informe o logradouro.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Informe o celular.').length).toBeGreaterThan(0)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
