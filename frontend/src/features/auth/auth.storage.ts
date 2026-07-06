import { authSessionSchema, type AuthSession } from "@/features/auth/auth.types";

const STORAGE_KEY = "shop-api.auth.session";

type StorageKind = "localStorage" | "sessionStorage";

function getStorage(kind: StorageKind) {
  if (typeof window === "undefined") {
    return null;
  }

  return kind === "localStorage" ? window.localStorage : window.sessionStorage;
}

function readStoredSessionFrom(kind: StorageKind) {
  const storage = getStorage(kind);
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = authSessionSchema.parse(JSON.parse(raw));
    return { kind, session: parsed };
  } catch {
    storage.removeItem(STORAGE_KEY);
    return null;
  }
}

function isSessionExpired(expiresAt: string) {
  const expiryTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryTime)) {
    return true;
  }

  return expiryTime <= Date.now();
}

export function readStoredSession() {
  const localSession = readStoredSessionFrom("localStorage");
  if (localSession) {
    return localSession.session;
  }

  const sessionSession = readStoredSessionFrom("sessionStorage");
  if (sessionSession) {
    return sessionSession.session;
  }

  return null;
}

export function persistSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  const targetStorage = getStorage(session.rememberSession ? "localStorage" : "sessionStorage");
  const fallbackStorage = getStorage(session.rememberSession ? "sessionStorage" : "localStorage");

  targetStorage?.setItem(STORAGE_KEY, JSON.stringify(session));
  fallbackStorage?.removeItem(STORAGE_KEY);
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function shouldExpireSession(session: AuthSession) {
  return isSessionExpired(session.expiresAt);
}
