import { create } from "zustand";
import { ApiRequestError } from "@/shared/api/http";
import {
  addCartItem,
  createCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/features/cart/cart.api";
import { clearStoredCartRef, persistStoredCartRef, readStoredCartRef } from "@/features/cart/cart.storage";
import type { Cart, CartItemInput } from "@/features/cart/cart.types";

type CartAuthContext = {
  token: string;
  customerId: number;
};

type CartState = {
  currentCart: Cart | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  initializeCart: (context: CartAuthContext | null) => Promise<void>;
  loadCurrentCart: (context: CartAuthContext) => Promise<Cart | null>;
  createCurrentCart: (context: CartAuthContext) => Promise<Cart>;
  addItemToCurrentCart: (context: CartAuthContext, item: CartItemInput) => Promise<Cart>;
  updateCurrentCartItem: (context: CartAuthContext, itemId: number, quantity: number) => Promise<Cart>;
  removeCurrentCartItem: (context: CartAuthContext, itemId: number) => Promise<Cart>;
  clearCurrentCart: () => void;
};

function getFriendlyError(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível atualizar o carrinho.";
}

function toStoredRef(cart: Cart) {
  return {
    cartId: cart.cartId,
    customerId: cart.customerId,
    createdAt: cart.createdAt,
  };
}

export const useCartStore = create<CartState>((set, get) => {
  const resetToEmpty = () => {
    clearStoredCartRef();
    set({
      currentCart: null,
      isLoading: false,
      isSubmitting: false,
      error: null,
    });
  };

  const syncCurrentCart = async (context: CartAuthContext) => {
    const storedRef = readStoredCartRef();

    if (!storedRef || storedRef.customerId !== context.customerId) {
      resetToEmpty();
      return null;
    }

    const cart = await getCart(storedRef.cartId, context.token);
    persistStoredCartRef(toStoredRef(cart));
    set({ currentCart: cart, error: null });
    return cart;
  };

  const runMutation = async <T>(_context: CartAuthContext, mutation: () => Promise<T>) => {
    set({ isSubmitting: true, error: null });

    try {
      const result = await mutation();
      return result;
    } catch (error) {
      set({ error: getFriendlyError(error) });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  };

  return {
    currentCart: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    initializeCart: async (context) => {
      if (!context) {
        resetToEmpty();
        return;
      }

      set({ isLoading: true, error: null });

      try {
        await syncCurrentCart(context);
      } catch (error) {
        const storedRef = readStoredCartRef();

        if (error instanceof ApiRequestError && error.status === 404 && storedRef) {
          resetToEmpty();
          return;
        }

        set({ error: getFriendlyError(error) });
      } finally {
        set({ isLoading: false });
      }
    },
    loadCurrentCart: async (context) => {
      set({ isLoading: true, error: null });

      try {
        return await syncCurrentCart(context);
      } catch (error) {
        const storedRef = readStoredCartRef();

        if (error instanceof ApiRequestError && error.status === 404 && storedRef) {
          resetToEmpty();
          return null;
        }

        set({ error: getFriendlyError(error) });
        return null;
      } finally {
        set({ isLoading: false });
      }
    },
    createCurrentCart: async (context) => {
      const existingCart = get().currentCart;
      if (existingCart && existingCart.customerId === context.customerId) {
        persistStoredCartRef(toStoredRef(existingCart));
        return existingCart;
      }

      const cart = await runMutation(context, async () => {
        const createdCart = await createCart(context.customerId, context.token);

        const nextCart: Cart = {
          ...createdCart,
          customerId: context.customerId,
          items: [],
        };

        persistStoredCartRef(toStoredRef(nextCart));
        set({ currentCart: nextCart, error: null });
        return nextCart;
      });

      return cart;
    },
    addItemToCurrentCart: async (context, item) => {
      return runMutation(context, async () => {
        const currentCart =
          get().currentCart ?? (await get().loadCurrentCart(context)) ?? (await get().createCurrentCart(context));

        await addCartItem(context.token, item);
        const refreshedCart = await getCart(currentCart.cartId, context.token);
        persistStoredCartRef(toStoredRef(refreshedCart));
        set({ currentCart: refreshedCart, error: null });
        return refreshedCart;
      });
    },
    updateCurrentCartItem: async (context, itemId, quantity) => {
      return runMutation(context, async () => {
        const currentCart = get().currentCart ?? (await get().loadCurrentCart(context));
        if (!currentCart) {
          throw new ApiRequestError("Carrinho não encontrado.", { status: 404 });
        }

        await updateCartItem(context.token, itemId, { quantity });
        const refreshedCart = await getCart(currentCart.cartId, context.token);
        persistStoredCartRef(toStoredRef(refreshedCart));
        set({ currentCart: refreshedCart, error: null });
        return refreshedCart;
      });
    },
    removeCurrentCartItem: async (context, itemId) => {
      return runMutation(context, async () => {
        const currentCart = get().currentCart ?? (await get().loadCurrentCart(context));
        if (!currentCart) {
          throw new ApiRequestError("Carrinho não encontrado.", { status: 404 });
        }

        await removeCartItem(context.token, itemId);
        const refreshedCart = await getCart(currentCart.cartId, context.token);
        persistStoredCartRef(toStoredRef(refreshedCart));
        set({ currentCart: refreshedCart, error: null });
        return refreshedCart;
      });
    },
    clearCurrentCart: resetToEmpty,
  };
});



