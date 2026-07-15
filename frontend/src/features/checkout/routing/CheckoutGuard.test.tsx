import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useOutletContext } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Cart } from '../../cart/contracts/cart'
import { CheckoutGuard } from './CheckoutGuard'

const cartQuery: {
  data?: Cart
  hasCart: boolean
  isError: boolean
  isPending: boolean
} = {
  hasCart: true,
  isError: false,
  isPending: false,
}

const { profileQuery, useCustomerProfileQuery } = vi.hoisted(() => {
  const profileQuery = {
    data: undefined as {
      customerId: number
      cpf: string
      nome: string
      dataNascimento: string
      email: string
      endereco: { logradouro: string; numero: string; complemento: null; cep: string; bairro: string; cidade: string; uf: string }
      celular: { ddd: string; numero: string; whatsApp: boolean }
    } | undefined,
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  }

  return { profileQuery, useCustomerProfileQuery: vi.fn(() => profileQuery) }
})

vi.mock('../../cart/queries/useCartQuery', () => ({ useCartQuery: () => cartQuery }))
vi.mock('../../customer/queries/useCustomerProfileQuery', () => ({ useCustomerProfileQuery }))

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <Routes>
        <Route element={<CheckoutGuard />}>
          <Route path="checkout" element={<h1>Formulário de checkout</h1>} />
        </Route>
        <Route path="carrinho" element={<h1>Carrinho</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

function CheckoutAddressProbe() {
  const { profile } = useOutletContext<{ profile: { address: { logradouro: string } } }>()
  return <p>Endereço canônico: {profile.address.logradouro}</p>
}

describe('CheckoutGuard', () => {
  beforeEach(() => {
    cartQuery.data = undefined
    cartQuery.hasCart = true
    cartQuery.isError = false
    cartQuery.isPending = false
    profileQuery.data = undefined
    profileQuery.isError = false
    profileQuery.isPending = false
    profileQuery.refetch.mockReset()
    useCustomerProfileQuery.mockClear()
  })

  it('exibe carregamento sem liberar o checkout enquanto aguarda o carrinho confirmado', () => {
    cartQuery.isPending = true

    renderGuard()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando carrinho')
    expect(screen.queryByRole('heading', { name: 'Formulário de checkout' })).not.toBeInTheDocument()
  })

  it('exibe erro sem liberar o checkout quando a consulta falha', () => {
    cartQuery.isError = true

    renderGuard()

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o carrinho')
    expect(screen.queryByRole('heading', { name: 'Formulário de checkout' })).not.toBeInTheDocument()
  })

  it.each([
    ['não existe associação de carrinho', false, undefined],
    ['o carrinho confirmado está ausente', true, undefined],
    ['o carrinho confirmado está vazio', true, { customerId: 1, id: 2, createdAt: '2026-07-14T12:00:00Z', items: [] }],
  ])('redireciona para o carrinho quando %s', (_scenario, hasCart, data) => {
    cartQuery.hasCart = hasCart
    cartQuery.data = data

    renderGuard()

    expect(screen.getByRole('heading', { name: 'Carrinho' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Formulário de checkout' })).not.toBeInTheDocument()
  })

  it('libera o checkout quando o carrinho confirmado contém itens', () => {
    cartQuery.data = {
      customerId: 1,
      id: 2,
      createdAt: '2026-07-14T12:00:00Z',
      items: [{ id: 3, productId: 4, quantity: 1, unitPrice: 99.9 }],
    }

    profileQuery.data = {
      customerId: 1,
      cpf: '12345678901',
      nome: 'Cliente',
      dataNascimento: '1990-01-01',
      email: 'cliente@example.com',
      endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '12345678', bairro: 'Centro', cidade: 'Sao Paulo', uf: 'SP' },
      celular: { ddd: '11', numero: '999999999', whatsApp: true },
    }
    renderGuard()

    expect(screen.getByRole('heading', { name: 'Formulário de checkout' })).toBeInTheDocument()
    expect(useCustomerProfileQuery).toHaveBeenCalledWith(true)
  })

  it('projects the updated address from the same canonical profile query', () => {
    cartQuery.data = { customerId: 1, id: 2, createdAt: '2026-07-14T12:00:00Z', items: [{ id: 3, productId: 4, quantity: 1, unitPrice: 99.9 }] }
    profileQuery.data = {
      customerId: 1, cpf: '12345678901', nome: 'Cliente', dataNascimento: '1990-01-01', email: 'cliente@example.com',
      endereco: { logradouro: 'Rua atualizada', numero: '20', complemento: null, cep: '87654321', bairro: 'Novo', cidade: 'Campinas', uf: 'SP' },
      celular: { ddd: '11', numero: '999999999', whatsApp: true },
    }

    const view = render(
      <MemoryRouter initialEntries={['/checkout']}><Routes><Route element={<CheckoutGuard />}><Route path="checkout" element={<CheckoutAddressProbe />} /></Route></Routes></MemoryRouter>,
    )
    expect(screen.getByText('Endereço canônico: Rua atualizada')).toBeVisible()
    profileQuery.data = { ...profileQuery.data, endereco: { ...profileQuery.data.endereco, logradouro: 'Rua reconciliada' } }
    view.rerender(<MemoryRouter initialEntries={['/checkout']}><Routes><Route element={<CheckoutGuard />}><Route path="checkout" element={<CheckoutAddressProbe />} /></Route></Routes></MemoryRouter>)
    expect(screen.getByText('Endereço canônico: Rua reconciliada')).toBeVisible()
    expect(useCustomerProfileQuery).toHaveBeenLastCalledWith(true)
  })

  it('mantém a pré-carga desabilitada antes de confirmar um carrinho não vazio', () => {
    cartQuery.isPending = true

    renderGuard()

    expect(useCustomerProfileQuery).toHaveBeenCalledWith(false)
  })

  it('exibe carregamento do endereço sem liberar o checkout', () => {
    cartQuery.data = {
      customerId: 1,
      id: 2,
      createdAt: '2026-07-14T12:00:00Z',
      items: [{ id: 3, productId: 4, quantity: 1, unitPrice: 99.9 }],
    }
    profileQuery.isPending = true

    renderGuard()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando endereço de entrega')
    expect(screen.queryByRole('heading', { name: 'Formulário de checkout' })).not.toBeInTheDocument()
  })

  it('exibe erro acionável e tenta carregar o endereço novamente', () => {
    cartQuery.data = {
      customerId: 1,
      id: 2,
      createdAt: '2026-07-14T12:00:00Z',
      items: [{ id: 3, productId: 4, quantity: 1, unitPrice: 99.9 }],
    }
    profileQuery.isError = true

    renderGuard()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o endereço')
    expect(profileQuery.refetch).toHaveBeenCalledOnce()
    expect(screen.queryByRole('heading', { name: 'Formulário de checkout' })).not.toBeInTheDocument()
  })

  it('não libera o checkout sem perfil válido mesmo após a consulta encerrar', () => {
    cartQuery.data = {
      customerId: 1,
      id: 2,
      createdAt: '2026-07-14T12:00:00Z',
      items: [{ id: 3, productId: 4, quantity: 1, unitPrice: 99.9 }],
    }

    renderGuard()

    expect(screen.queryByRole('heading', { name: 'Formulário de checkout' })).not.toBeInTheDocument()
  })
})
