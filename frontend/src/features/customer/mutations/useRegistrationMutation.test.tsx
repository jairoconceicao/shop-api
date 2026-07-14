import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { useRegistrationMutation } from './useRegistrationMutation'

const { registerCustomer } = vi.hoisted(() => ({ registerCustomer: vi.fn() }))

vi.mock('../services/registrationService', () => ({ registerCustomer }))

describe('useRegistrationMutation', () => {
  it('does not retry a customer registration', async () => {
    registerCustomer.mockRejectedValueOnce(
      new AppError({ kind: 'http', status: 409, message: 'CPF já cadastrado.' }),
    )
    const queryClient = new QueryClient()
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRegistrationMutation(), { wrapper })

    act(() => {
      result.current.mutate({
        senha: 'Senha@123', cpf: '12345678901', nome: 'Cliente',
        dataNascimento: '1990-05-20', email: 'cliente@exemplo.com',
        endereco: { logradouro: 'Rua', numero: '1', complemento: null, cep: '12345678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' },
        celular: { ddd: '11', numero: '912345678', whatsApp: false },
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(registerCustomer).toHaveBeenCalledOnce()
  })
})
