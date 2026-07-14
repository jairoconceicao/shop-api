import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

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
}

type BrowserStorageName = 'localStorage' | 'sessionStorage'

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
    try {
      const persisted = JSON.parse(value) as {
        state?: { persistence?: AuthPersistence }
      }
      const useLocalStorage = persisted.state?.persistence === 'local'
      const target = useLocalStorage ? 'localStorage' : 'sessionStorage'
      const stale = useLocalStorage ? 'sessionStorage' : 'localStorage'

      window[target].setItem(key, value)
      removeFromStorage(stale, key)
    } catch {
      // The in-memory session remains usable when browser storage is unavailable.
    }
  },
  removeItem: (key) => {
    removeFromStorage('localStorage', key)
    removeFromStorage('sessionStorage', key)
  },
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
    }),
    {
      name: AUTH_STORE_KEY,
      version: AUTH_STORE_VERSION,
      storage: createJSONStorage(() => authStateStorage),
      partialize: ({ session, persistence }) => ({ session, persistence }),
    },
  ),
)
