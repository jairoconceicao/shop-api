import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { z } from 'zod'

export const AUTH_STORE_KEY = 'shop-api:auth'
export const AUTH_STORE_VERSION = 1

export type AuthSession = {
  token: string
  tipo: string
  expiraEm: string
  usuarioId: number
  clienteId: number
  email: string
}

export type AuthPersistence = 'session' | 'local'

type AuthState = {
  session: AuthSession | null
  persistence: AuthPersistence
  setSession: (session: AuthSession, persistence: AuthPersistence) => void
  clearSession: () => void
  invalidateExpiredSession: (now?: number) => void
}

type BrowserStorageName = 'localStorage' | 'sessionStorage'

const authSessionSchema = z.object({
  token: z.string().trim().min(1),
  tipo: z.string().trim().min(1),
  expiraEm: z.iso.datetime({ offset: true }),
  usuarioId: z.number().int().safe(),
  clienteId: z.number().int().safe(),
  email: z.email(),
}).strict()

const persistedAuthStateSchema = z.object({
  session: authSessionSchema.nullable(),
  persistence: z.enum(['session', 'local']),
}).strict()

function readStorage(storageName: BrowserStorageName, key: string) {
  try {
    return window[storageName].getItem(key)
  } catch {
    return null
  }
}

function removeFromStorage(storageName: BrowserStorageName, key: string) {
  try {
    window[storageName].removeItem(key)
  } catch {
    // The in-memory session remains usable when browser storage is unavailable.
  }
}

const authStateStorage: StateStorage = {
  getItem: (key) =>
    readStorage('localStorage', key) ?? readStorage('sessionStorage', key),
  setItem: (key, value) => {
    let target: BrowserStorageName
    let stale: BrowserStorageName

    try {
      const persisted = JSON.parse(value) as {
        state?: { persistence?: AuthPersistence }
      }
      const useLocalStorage = persisted.state?.persistence === 'local'
      target = useLocalStorage ? 'localStorage' : 'sessionStorage'
      stale = useLocalStorage ? 'sessionStorage' : 'localStorage'
    } catch {
      return
    }

    try {
      window[target].setItem(key, value)
    } catch {
      // The in-memory session remains usable when browser storage is unavailable.
    } finally {
      removeFromStorage(stale, key)
    }
  },
  removeItem: (key) => {
    removeFromStorage('localStorage', key)
    removeFromStorage('sessionStorage', key)
  },
}

export function isAuthSessionExpired(session: AuthSession, now = Date.now()) {
  const expiration = Date.parse(session.expiraEm)

  return !session.token.trim() || !Number.isFinite(expiration) || expiration <= now
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      persistence: 'session',
      setSession: (session, persistence) => {
        authStateStorage.removeItem?.(AUTH_STORE_KEY)
        set({ session, persistence })
      },
      clearSession: () => {
        set({ session: null, persistence: 'session' })
        authStateStorage.removeItem?.(AUTH_STORE_KEY)
      },
      invalidateExpiredSession: (now = Date.now()) => {
        const session = useAuthStore.getState().session

        if (session && isAuthSessionExpired(session, now)) {
          useAuthStore.getState().clearSession()
        }
      },
    }),
    {
      name: AUTH_STORE_KEY,
      version: AUTH_STORE_VERSION,
      storage: createJSONStorage(() => authStateStorage),
      partialize: ({ session, persistence }) => ({ session, persistence }),
      migrate: () => ({ session: null, persistence: 'session' }),
      merge: (persistedState, currentState) => {
        const parsedState = persistedAuthStateSchema.safeParse(persistedState)

        if (!parsedState.success) {
          authStateStorage.removeItem?.(AUTH_STORE_KEY)
          return currentState
        }

        return { ...currentState, ...parsedState.data }
      },
      onRehydrateStorage: () => (state, error) => {
        if (error || !state?.session) {
          authStateStorage.removeItem?.(AUTH_STORE_KEY)
          return
        }

        state.invalidateExpiredSession()
      },
    },
  ),
)
