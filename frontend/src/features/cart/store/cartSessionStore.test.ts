import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CART_SESSION_STORE_KEY,
  CART_SESSION_STORE_VERSION,
  useCartSessionStore,
} from './cartSessionStore'

describe('useCartSessionStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useCartSessionStore.setState({ cartIdsByCustomer: {} })
  })

  afterEach(() => vi.restoreAllMocks())

  it('persists only the customer-to-cart map with a version', () => {
    useCartSessionStore.getState().setCartId(10, 100)

    expect(JSON.parse(window.localStorage.getItem(CART_SESSION_STORE_KEY) ?? '')).toEqual({
      state: { cartIdsByCustomer: { '10': 100 } },
      version: CART_SESSION_STORE_VERSION,
    })
  })

  it('keeps cart ids independent for each customer', () => {
    useCartSessionStore.getState().setCartId(10, 100)
    useCartSessionStore.getState().setCartId(20, 200)

    expect(useCartSessionStore.getState().getCartId(10)).toBe(100)
    expect(useCartSessionStore.getState().getCartId(20)).toBe(200)
  })

  it('updates only the selected customer cart id', () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100, '20': 200 } })

    useCartSessionStore.getState().setCartId(10, 101)

    expect(useCartSessionStore.getState().cartIdsByCustomer).toEqual({
      '10': 101,
      '20': 200,
    })
  })

  it('removes only the selected customer cart id', () => {
    useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100, '20': 200 } })

    useCartSessionStore.getState().removeCartId(10)

    expect(useCartSessionStore.getState().getCartId(10)).toBeUndefined()
    expect(useCartSessionStore.getState().getCartId(20)).toBe(200)
  })

  it('restores persisted cart ids on rehydration', async () => {
    window.localStorage.setItem(
      CART_SESSION_STORE_KEY,
      JSON.stringify({
        state: { cartIdsByCustomer: { '10': 100 } },
        version: CART_SESSION_STORE_VERSION,
      }),
    )

    await useCartSessionStore.persist.rehydrate()

    expect(useCartSessionStore.getState().getCartId(10)).toBe(100)
  })

  it('migrates version zero while keeping only valid customer-to-cart entries', async () => {
    window.localStorage.setItem(
      CART_SESSION_STORE_KEY,
      JSON.stringify({
        state: {
          cartIdsByCustomer: {
            '10': 100,
            customer: 200,
            '20': 'remote-cart',
            '30': -1,
          },
          remoteCart: { items: [{ id: 1 }] },
        },
        version: 0,
      }),
    )

    await useCartSessionStore.persist.rehydrate()

    expect(useCartSessionStore.getState().cartIdsByCustomer).toEqual({ '10': 100 })
  })

  it('discards an invalid persisted shape during migration', async () => {
    window.localStorage.setItem(
      CART_SESSION_STORE_KEY,
      JSON.stringify({ state: { cartIdsByCustomer: ['invalid'] }, version: 0 }),
    )

    await useCartSessionStore.persist.rehydrate()

    expect(useCartSessionStore.getState().cartIdsByCustomer).toEqual({})
  })

  it('sanitizes a corrupted current-version payload without restoring remote fields', async () => {
    window.localStorage.setItem(
      CART_SESSION_STORE_KEY,
      JSON.stringify({
        state: {
          cartIdsByCustomer: { '10': 100, invalid: 200, '20': 'cart' },
          remoteCart: { items: [{ id: 1 }] },
        },
        version: CART_SESSION_STORE_VERSION,
      }),
    )

    await useCartSessionStore.persist.rehydrate()

    expect(useCartSessionStore.getState().cartIdsByCustomer).toEqual({ '10': 100 })
    expect('remoteCart' in useCartSessionStore.getState()).toBe(false)
  })

  it('canonicalizes numeric customer keys restored from legacy storage', async () => {
    window.localStorage.setItem(
      CART_SESSION_STORE_KEY,
      JSON.stringify({
        state: { cartIdsByCustomer: { '010': 100 } },
        version: 0,
      }),
    )

    await useCartSessionStore.persist.rehydrate()

    expect(useCartSessionStore.getState().cartIdsByCustomer).toEqual({ '10': 100 })
    expect(useCartSessionStore.getState().getCartId(10)).toBe(100)
  })

  it('keeps the in-memory map usable when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })

    expect(() => useCartSessionStore.getState().setCartId(10, 100)).not.toThrow()
    expect(useCartSessionStore.getState().getCartId(10)).toBe(100)
  })
})
