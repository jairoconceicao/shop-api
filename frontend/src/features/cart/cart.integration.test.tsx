import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppRouter } from '../../app/router/AppRouter'
import { renderIntegration } from '../../shared/testing/renderIntegration'
import { server } from '../../shared/testing/server'
import { useAuthStore } from '../auth/store/authStore'
import type { Cart } from './contracts/cart'
import { useAddProductToCart } from './hooks/useAddProductToCart'
import { useDeleteCartItemMutation } from './mutations/useDeleteCartItemMutation'
import { useUpdateCartItemMutation } from './mutations/useUpdateCartItemMutation'
import { cartQueryKeys } from './queries/useCartQuery'
import { useCartSessionStore } from './store/cartSessionStore'

const created = {
  status: true,
  data: { carrinhoId: 70, dataCarrinho: '2026-07-16T10:00:00Z' },
} as const
const added = { status: true, data: { itemId: 701 } } as const
const changed = {
  status: true,
  data: { itemId: 701, produtoId: 42 },
} as const
const categories = {
  status: true,
  data: [
    {
      categoriaId: 5,
      titulo: 'Hardware',
      descricao: 'Componentes',
    },
  ],
} as const
const product = {
  status: true,
  data: {
    produtoId: 42,
    titulo: 'Teclado Mecânico',
    descricao: 'ABNT2',
    modelo: 'TK42',
    foto: null,
    preco: 199.9,
    estoque: 8,
    categoria: { categoriaId: 5, titulo: 'Hardware' },
  },
} as const
const cart: Cart = {
  customerId: 7,
  id: 70,
  createdAt: '2026-07-16T10:00:00Z',
  items: [
    { id: 701, productId: 42, quantity: 2, unitPrice: 199.9 },
    { id: 702, productId: 43, quantity: 1, unitPrice: 50 },
  ],
}

const cartResponse = (value: Cart) => ({
  status: true,
  data: {
    clienteId: value.customerId,
    carrinhoId: value.id,
    dataCarrinho: value.createdAt,
    items: value.items.map((item) => ({
      itemId: item.id,
      produtoId: item.productId,
      quantidade: item.quantity,
      valorUnitario: item.unitPrice,
    })),
  },
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function seedSession() {
  useAuthStore.getState().setSession(
    {
      token: 'token-7',
      tipo: 'Bearer',
      expiraEm: '2099-07-17T12:00:00Z',
      usuarioId: 3,
      clienteId: 7,
      email: 'ana@example.com',
    },
    'session',
  )
}

function MutationHarness() {
  const update = useUpdateCartItemMutation({
    customerId: 7,
    cartId: 70,
    itemId: 701,
    token: 'token-7',
  })
  const remove = useDeleteCartItemMutation({
    customerId: 7,
    cartId: 70,
    itemId: 701,
    token: 'token-7',
  })

  return (
    <>
      <button onClick={() => update.mutate(3)}>PATCH 701</button>
      <button onClick={() => remove.mutate()}>DELETE 701</button>
    </>
  )
}

function AddHarness() {
  const add = useAddProductToCart()
  const session = useAuthStore((state) => state.session)

  return (
    <button
      onClick={() =>
        void add.addProduct({
          session: session!,
          productId: 42,
          quantity: 1,
          displayedUnitPrice: 199.9,
        })
      }
    >
      Adicionar produto
    </button>
  )
}

describe('TASK-114 cart integration', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    localStorage.clear()
    sessionStorage.clear()
    useAuthStore.getState().clearSession()
    useCartSessionStore.setState({ cartIdsByCustomer: {} })
  })

  it('posts an empty-body cart, adds the item once and stores the cart link', async () => {
    seedSession()
    const ledger: Array<{ method: string; path: string; text: string }> = []
    server.use(
      http.get('*/api/v1/produto/42', () => HttpResponse.json(product)),
      http.post('*/api/v1/carrinho/criar', async ({ request }) => {
        ledger.push({
          method: request.method,
          path: new URL(request.url).pathname,
          text: await request.text(),
        })
        return HttpResponse.json(created, { status: 201 })
      }),
      http.post('*/api/v1/carrinho/items', async ({ request }) => {
        ledger.push({
          method: request.method,
          path: new URL(request.url).pathname,
          text: await request.text(),
        })
        return HttpResponse.json(added, { status: 201 })
      }),
    )

    const { user } = renderIntegration(<AddHarness />)
    await user.click(
      screen.getByRole('button', { name: 'Adicionar produto' }),
    )

    await waitFor(() =>
      expect(useCartSessionStore.getState().getCartId(7)).toBe(70),
    )
    expect(ledger).toEqual([
      { method: 'POST', path: '/api/v1/carrinho/criar', text: '' },
      {
        method: 'POST',
        path: '/api/v1/carrinho/items',
        text: JSON.stringify({
          produtoId: 42,
          quantidade: 1,
          valorUnitario: 199.9,
        }),
      },
    ])
    expect(ledger.filter((entry) => entry.method === 'POST')).toHaveLength(2)
  })

  it('reads an existing cart without create POST', async () => {
    seedSession()
    useCartSessionStore.getState().setCartId(7, 70)
    let creates = 0
    let reads = 0
    server.use(
      http.get('*/api/v1/categoria', () => HttpResponse.json(categories)),
      http.post('*/api/v1/carrinho/criar', () => {
        creates += 1
        return HttpResponse.json(created)
      }),
      http.get('*/api/v1/carrinho/70', () => {
        reads += 1
        return HttpResponse.json(cartResponse(cart))
      }),
      http.get('*/api/v1/produto/42', () => HttpResponse.json(product)),
      http.get('*/api/v1/produto/43', () =>
        HttpResponse.json({
          ...product,
          data: { ...product.data, produtoId: 43, titulo: 'Mouse' },
        }),
      ),
    )

    renderIntegration(<AppRouter />, { initialEntries: ['/carrinho'] })

    expect(
      await screen.findByRole('heading', { name: 'Carrinho' }),
    ).toBeInTheDocument()
    await waitFor(() => expect(reads).toBe(1))
    expect(creates).toBe(0)
    expect(
      screen.getByRole('link', { name: 'Carrinho com 3 itens' }),
    ).toBeInTheDocument()
  })

  it.each(['PATCH', 'DELETE'] as const)(
    'restores only item 701 after failed %s and preserves concurrent item 702',
    async (method) => {
      seedSession()
      useCartSessionStore.getState().setCartId(7, 70)
      const gate = deferred<Response>()
      server.use(
        http.patch('*/api/v1/carrinho/items/701', async () => gate.promise),
        http.delete('*/api/v1/carrinho/items/701', async () => gate.promise),
      )
      const { user, queryClient } = renderIntegration(<MutationHarness />)
      queryClient.setQueryData(cartQueryKeys.detail(7, 70), cart)

      await user.click(
        screen.getByRole('button', { name: `${method} 701` }),
      )
      await waitFor(() => {
        const value = queryClient.getQueryData<Cart>(
          cartQueryKeys.detail(7, 70),
        )
        expect(
          method === 'PATCH'
            ? value?.items[0]?.quantity
            : value?.items.some((item) => item.id === 701),
        ).toBe(method === 'PATCH' ? 3 : false)
      })

      queryClient.setQueryData<Cart>(
        cartQueryKeys.detail(7, 70),
        (current) => ({
          ...current!,
          items: current!.items.map((item) =>
            item.id === 702 ? { ...item, quantity: 4 } : item,
          ),
        }),
      )
      gate.resolve(
        HttpResponse.json(
          { error: { message: 'falha controlada' } },
          { status: 500 },
        ),
      )

      await waitFor(() => {
        const value = queryClient.getQueryData<Cart>(
          cartQueryKeys.detail(7, 70),
        )
        expect(
          value?.items.find((item) => item.id === 701)?.quantity,
        ).toBe(2)
        expect(
          value?.items.find((item) => item.id === 702)?.quantity,
        ).toBe(4)
      })
    },
  )

  it('sends strict PATCH and DELETE bodies and reconciles confirmed empty cart', async () => {
    seedSession()
    useCartSessionStore.getState().setCartId(7, 70)
    const ledger: Array<[string, string]> = []
    let reads = 0
    server.use(
      http.get('*/api/v1/categoria', () => HttpResponse.json(categories)),
      http.get('*/api/v1/carrinho/70', () => {
        reads += 1
        const state =
          reads === 1
            ? { ...cart, items: [cart.items[0]] }
            : reads === 2
              ? { ...cart, items: [{ ...cart.items[0], quantity: 3 }] }
              : { ...cart, items: [] }
        return HttpResponse.json(cartResponse(state))
      }),
      http.get('*/api/v1/produto/42', () => HttpResponse.json(product)),
      http.patch(
        '*/api/v1/carrinho/items/701',
        async ({ request }) => {
          ledger.push(['PATCH', await request.text()])
          return HttpResponse.json(changed)
        },
      ),
      http.delete(
        '*/api/v1/carrinho/items/701',
        async ({ request }) => {
          ledger.push(['DELETE', await request.text()])
          return HttpResponse.json(changed)
        },
      ),
    )

    const { user, queryClient } = renderIntegration(<AppRouter />, {
      initialEntries: ['/carrinho'],
    })
    const quantity = await screen.findByRole('spinbutton', {
      name: 'Quantidade de Teclado Mecânico',
    })
    quantity.focus()
    await user.keyboard('{ArrowUp}')

    await waitFor(() =>
      expect(ledger[0]).toEqual([
        'PATCH',
        JSON.stringify({ quantidade: 3 }),
      ]),
    )
    const summary = screen.getByRole('complementary', {
      name: 'Resumo do carrinho',
    })
    await waitFor(() =>
      expect(
        within(summary).getByText('Subtotal').nextElementSibling,
      ).toHaveTextContent('R$ 599,70'),
    )
    expect(
      within(summary).getByText('Total').nextElementSibling,
    ).toHaveTextContent('R$ 599,70')
    expect(
      screen.getByRole('link', { name: 'Carrinho com 3 itens' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Remover Teclado Mecânico' }),
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Remover item do carrinho?',
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Remover item' }),
    )

    await waitFor(() => expect(ledger[1]).toEqual(['DELETE', '']))
    await waitFor(() =>
      expect(
        queryClient.getQueryData<Cart>(cartQueryKeys.detail(7, 70))
          ?.items,
      ).toEqual([]),
    )
    expect(
      screen.getByRole('heading', { name: 'Seu carrinho está vazio' }),
    ).toBeInTheDocument()
    const storeActions = screen.getByRole('navigation', {
      name: 'Ações da loja',
    })
    await waitFor(() =>
      expect(
        within(storeActions).getByRole('link', { name: 'Carrinho' }),
      ).toBeInTheDocument(),
    )
  })

  it('removes only customer 7 link and detail after cart 404', async () => {
    seedSession()
    useCartSessionStore.getState().setCartId(7, 70)
    useCartSessionStore.getState().setCartId(8, 80)
    server.use(
      http.get('*/api/v1/categoria', () => HttpResponse.json(categories)),
      http.get('*/api/v1/carrinho/70', () =>
        HttpResponse.json(
          { error: { message: 'ausente' } },
          { status: 404 },
        ),
      ),
    )

    const { queryClient } = renderIntegration(<AppRouter />, {
      initialEntries: ['/carrinho'],
    })
    queryClient.setQueryData(cartQueryKeys.detail(8, 80), {
      ...cart,
      customerId: 8,
      id: 80,
    })

    await waitFor(() =>
      expect(
        useCartSessionStore.getState().getCartId(7),
      ).toBeUndefined(),
    )
    expect(useCartSessionStore.getState().getCartId(8)).toBe(80)
    expect(
      queryClient.getQueryData(cartQueryKeys.detail(7, 70)),
    ).toBeUndefined()
    expect(
      queryClient.getQueryData(cartQueryKeys.detail(8, 80)),
    ).toBeDefined()
  })
})
