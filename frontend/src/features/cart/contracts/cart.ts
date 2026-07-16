import { z } from 'zod'

import { normalizeId, normalizeNumber } from '../../../shared/adapters/numbers'
import { createApiResponseSchema } from '../../../shared/contracts/apiEnvelopes'

const transportIdSchema = z.union([
  z.number().int().safe(),
  z.string().regex(/^-?(?:0|[1-9]\d*)$/),
])

const transportNumberSchema = z.union([
  z.number().finite(),
  z.string().regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/),
])

export const addCartItemRequestSchema = z.object({
  produtoId: transportIdSchema,
  quantidade: transportNumberSchema,
  valorUnitario: transportNumberSchema,
}).strict()

export const updateCartItemRequestSchema = z.object({
  quantidade: transportNumberSchema,
}).strict()

const createdCartDataSchema = z.object({
  carrinhoId: transportIdSchema,
  dataCarrinho: z.iso.datetime({ offset: true }),
}).strict()

const addedCartItemDataSchema = z.object({ itemId: transportIdSchema }).strict()

const cartItemIdDataSchema = z.object({
  itemId: transportIdSchema,
  produtoId: transportIdSchema,
}).strict()

const cartItemDataSchema = z.object({
  itemId: transportIdSchema,
  produtoId: transportIdSchema,
  quantidade: transportNumberSchema,
  valorUnitario: transportNumberSchema,
}).strict()

const cartDataSchema = z.object({
  clienteId: transportIdSchema,
  carrinhoId: transportIdSchema,
  dataCarrinho: z.iso.datetime({ offset: true }),
  items: z.array(cartItemDataSchema),
}).strict()

export const createCartResponseSchema = createApiResponseSchema(createdCartDataSchema)
export const cartResponseSchema = createApiResponseSchema(cartDataSchema)
export const addCartItemResponseSchema = createApiResponseSchema(addedCartItemDataSchema)
export const cartItemIdResponseSchema = createApiResponseSchema(cartItemIdDataSchema)

export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>

export type CreatedCart = { id: number; createdAt: string }
export type AddedCartItem = { itemId: number }
export type CartItemIdentifier = { itemId: number; productId: number }
export type CartItem = {
  id: number
  productId: number
  quantity: number
  unitPrice: number
}
export type Cart = {
  customerId: number
  id: number
  createdAt: string
  items: CartItem[]
}

export function adaptAddCartItemRequest(request: unknown): AddCartItemRequest {
  return addCartItemRequestSchema.parse(request)
}

export function adaptUpdateCartItemRequest(request: unknown): UpdateCartItemRequest {
  return updateCartItemRequestSchema.parse(request)
}

export function adaptCreateCartResponse(response: unknown): CreatedCart {
  const parsed = createCartResponseSchema.parse(response)
  if (parsed.status === false || !parsed.data) {
    throw new TypeError('Cart creation response does not contain successful data')
  }
  return { id: normalizeId(parsed.data.carrinhoId), createdAt: parsed.data.dataCarrinho }
}

export function adaptCartResponse(response: unknown): Cart {
  const parsed = cartResponseSchema.parse(response)
  if (parsed.status === false || !parsed.data) {
    throw new TypeError('Cart response does not contain successful data')
  }
  return {
    customerId: normalizeId(parsed.data.clienteId),
    id: normalizeId(parsed.data.carrinhoId),
    createdAt: parsed.data.dataCarrinho,
    items: parsed.data.items.map((item) => ({
      id: normalizeId(item.itemId),
      productId: normalizeId(item.produtoId),
      quantity: normalizeNumber(item.quantidade),
      unitPrice: normalizeNumber(item.valorUnitario),
    })),
  }
}

export function adaptAddCartItemResponse(response: unknown): AddedCartItem {
  const parsed = addCartItemResponseSchema.parse(response)
  if (parsed.status === false || !parsed.data) {
    throw new TypeError('Add cart item response does not contain successful data')
  }
  return { itemId: normalizeId(parsed.data.itemId) }
}

function adaptCartItemIdResponse(response: unknown): CartItemIdentifier {
  const parsed = cartItemIdResponseSchema.parse(response)
  if (parsed.status === false || !parsed.data) {
    throw new TypeError('Cart item response does not contain successful data')
  }
  return {
    itemId: normalizeId(parsed.data.itemId),
    productId: normalizeId(parsed.data.produtoId),
  }
}

export function adaptUpdateCartItemResponse(response: unknown): CartItemIdentifier {
  return adaptCartItemIdResponse(response)
}

export function adaptDeleteCartItemResponse(response: unknown): CartItemIdentifier {
  return adaptCartItemIdResponse(response)
}
