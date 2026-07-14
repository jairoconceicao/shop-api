import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

export const CART_SESSION_STORE_KEY = 'shop-api:cart-session'
export const CART_SESSION_STORE_VERSION = 1

type CartIdsByCustomer = Record<string, number>

type CartSessionState = {
  cartIdsByCustomer: CartIdsByCustomer
  getCartId: (customerId: number) => number | undefined
  setCartId: (customerId: number, cartId: number) => void
  removeCartId: (customerId: number) => void
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function sanitizeCartIdsByCustomer(value: unknown): CartIdsByCustomer {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  const sanitized: CartIdsByCustomer = {}

  for (const [customerId, cartId] of Object.entries(value)) {
    const numericCustomerId = Number(customerId)

    if (isPositiveInteger(numericCustomerId) && isPositiveInteger(cartId)) {
      sanitized[String(numericCustomerId)] = cartId
    }
  }

  return sanitized
}

function sanitizePersistedCartSession(persistedState: unknown) {
  if (!persistedState || typeof persistedState !== 'object' || Array.isArray(persistedState)) {
    return { cartIdsByCustomer: {} }
  }

  const { cartIdsByCustomer } = persistedState as { cartIdsByCustomer?: unknown }

  return { cartIdsByCustomer: sanitizeCartIdsByCustomer(cartIdsByCustomer) }
}

function migrateCartSession(persistedState: unknown) {
  return sanitizePersistedCartSession(persistedState)
}

const cartSessionStorage: StateStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // The in-memory map remains usable when browser storage is unavailable.
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      // The in-memory map remains usable when browser storage is unavailable.
    }
  },
}

export const useCartSessionStore = create<CartSessionState>()(
  persist(
    (set, get) => ({
      cartIdsByCustomer: {},
      getCartId: (customerId) => get().cartIdsByCustomer[String(customerId)],
      setCartId: (customerId, cartId) =>
        set((state) => ({
          cartIdsByCustomer: {
            ...state.cartIdsByCustomer,
            [String(customerId)]: cartId,
          },
        })),
      removeCartId: (customerId) =>
        set((state) => {
          const cartIdsByCustomer = { ...state.cartIdsByCustomer }
          delete cartIdsByCustomer[String(customerId)]

          return { cartIdsByCustomer }
        }),
    }),
    {
      name: CART_SESSION_STORE_KEY,
      version: CART_SESSION_STORE_VERSION,
      storage: createJSONStorage(() => cartSessionStorage),
      partialize: ({ cartIdsByCustomer }) => ({ cartIdsByCustomer }),
      migrate: migrateCartSession,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...sanitizePersistedCartSession(persistedState),
      }),
    },
  ),
)
