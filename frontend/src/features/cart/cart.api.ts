import { z } from "zod";
import { requestJson } from "@/shared/api/http";
import type {
  Cart,
  CartItemInput,
  CartItemQuantityInput,
  CartRef,
} from "@/features/cart/cart.types";

const cartItemSchema = z.object({
  itemId: z.number().int(),
  produtoId: z.number().int(),
  quantidade: z.number().int().positive(),
  valorUnitario: z.number().positive(),
});

const createCartResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    data: z.object({
      carrinhoId: z.number().int(),
      dataCarrinho: z.string().min(1),
    }),
  })
  .transform(({ data }) => ({
    cartId: data.carrinhoId,
    customerId: 0,
    createdAt: data.dataCarrinho,
  } satisfies CartRef));

const addCartItemResponseSchema = z.object({
  status: z.boolean(),
  message: z.string(),
  data: z.object({
    itemId: z.number().int(),
  }),
});

const mutateCartItemResponseSchema = z.object({
  status: z.boolean(),
  message: z.string(),
  data: z.object({
    itemId: z.number().int(),
    produtoId: z.number().int(),
  }),
});

const cartResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    data: z.object({
      clienteId: z.number().int(),
      carrinhoId: z.number().int(),
      dataCarrinho: z.string().min(1),
      items: z.array(cartItemSchema),
    }),
  })
  .transform(({ data }) => ({
    cartId: data.carrinhoId,
    customerId: data.clienteId,
    createdAt: data.dataCarrinho,
    items: data.items.map((item) => ({
      itemId: item.itemId,
      productId: item.produtoId,
      quantity: item.quantidade,
      unitValue: item.valorUnitario,
    })),
  } satisfies Cart));

export async function createCart(customerId: number, token: string) {
  return createCartResponseSchema.parse(
    await requestJson<unknown>("/carrinho/criar", {
      method: "POST",
      token,
      body: { clienteId: customerId },
    }),
  );
}

export async function getCart(cartId: number, token: string): Promise<Cart> {
  return cartResponseSchema.parse(
    await requestJson<unknown>(`/carrinho/${cartId}`, {
      token,
    }),
  );
}

export async function addCartItem(token: string, item: CartItemInput) {
  return addCartItemResponseSchema.parse(
    await requestJson<unknown>("/carrinho/items", {
      method: "POST",
      token,
      body: {
        produtoId: item.productId,
        quantidade: item.quantity,
        valorUnitario: item.unitValue,
      },
    }),
  );
}

export async function updateCartItem(token: string, itemId: number, item: CartItemQuantityInput) {
  return mutateCartItemResponseSchema.parse(
    await requestJson<unknown>(`/carrinho/items/${itemId}`, {
      method: "PATCH",
      token,
      body: { quantidade: item.quantity },
    }),
  );
}

export async function removeCartItem(token: string, itemId: number) {
  return mutateCartItemResponseSchema.parse(
    await requestJson<unknown>(`/carrinho/items/${itemId}`, {
      method: "DELETE",
      token,
    }),
  );
}

