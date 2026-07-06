import type { CartRef } from "@/features/cart/cart.types";

const STORAGE_KEY = "shop-api.cart.current";

type StoredCartRef = CartRef;

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function readStoredCartRef() {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredCartRef;

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.cartId !== "number" ||
      typeof parsed.customerId !== "number" ||
      typeof parsed.createdAt !== "string"
    ) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    storage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function persistStoredCartRef(ref: CartRef) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(ref));
}

export function clearStoredCartRef() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(STORAGE_KEY);
}

