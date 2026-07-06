import { create } from "zustand";
import { ApiRequestError } from "@/shared/api/http";
import { login as loginRequest, logout as logoutRequest } from "@/features/auth/auth.api";
import {
  clearStoredSession,
  persistSession,
  readStoredSession,
  shouldExpireSession,
} from "@/features/auth/auth.storage";
import type { AuthSession, LoginCredentials } from "@/features/auth/auth.types";

type AuthState = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isReady: boolean;
  isSubmitting: boolean;
  error: string | null;
  initializeSession: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

let sessionExpiryTimer: number | null = null;

function clearExpiryTimer() {
  if (sessionExpiryTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(sessionExpiryTimer);
  }

  sessionExpiryTimer = null;
}

function scheduleSessionExpiry(session: AuthSession, expire: () => void) {
  clearExpiryTimer();

  if (typeof window === "undefined") {
    return;
  }

  const expiresAt = new Date(session.expiresAt).getTime();
  if (Number.isNaN(expiresAt)) {
    return;
  }

  const delay = Math.max(expiresAt - Date.now(), 0);
  sessionExpiryTimer = window.setTimeout(() => {
    expire();
  }, delay);
}

export const useAuthStore = create<AuthState>((set, get) => {
  const clearSession = () => {
    clearExpiryTimer();
    clearStoredSession();
    set({
      session: null,
      isAuthenticated: false,
      isSubmitting: false,
      error: null,
    });
  };

  return {
    session: null,
    isAuthenticated: false,
    isReady: false,
    isSubmitting: false,
    error: null,
    initializeSession: () => {
      const storedSession = readStoredSession();

      if (!storedSession || shouldExpireSession(storedSession)) {
        clearSession();
        set({ isReady: true });
        return;
      }

      persistSession(storedSession);
      scheduleSessionExpiry(storedSession, clearSession);
      set({
        session: storedSession,
        isAuthenticated: true,
        isReady: true,
        error: null,
      });
    },
    login: async (credentials) => {
      set({ isSubmitting: true, error: null });

      try {
        const session = await loginRequest(credentials);
        persistSession(session);
        scheduleSessionExpiry(session, clearSession);
        set({
          session,
          isAuthenticated: true,
          isSubmitting: false,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof ApiRequestError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Não foi possível autenticar sua conta.";

        set({
          session: null,
          isAuthenticated: false,
          isSubmitting: false,
          error: message,
        });

        throw error;
      }
    },
    logout: async () => {
      const session = get().session;

      set({ isSubmitting: true, error: null });

      try {
        if (session) {
          await logoutRequest(session.token);
        }
      } catch {
        // O logout local continua funcionando mesmo se a revogação falhar no backend.
      } finally {
        clearSession();
      }
    },
    clearSession,
  };
});
