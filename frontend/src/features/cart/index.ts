export const cartFeature = {
  key: "cart",
  routes: {
    current: "/cart",
  },
} as const;

export { addCartItem, createCart, getCart, removeCartItem, updateCartItem } from "./cart.api";
export { cartItemInputSchema, cartItemQuantitySchema, createCartSchema } from "./cart.schemas";
export { useCartStore } from "./cart.store";
export type { Cart, CartItem, CartItemInput, CartItemQuantityInput, CartRef } from "./cart.types";
