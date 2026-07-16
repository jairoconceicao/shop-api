import { z } from 'zod'

import { normalizeId, normalizeNumber } from '../../../shared/adapters/numbers'
import {
  deliveryAddressSchema,
  paymentMethodSchema,
  type DeliveryAddress,
  type PaymentMethod,
} from '../../checkout/contracts/checkout'

const transportIdSchema = z.union([
  z.number().int().safe(),
  z.string().regex(/^-?(?:0|[1-9]\d*)$/),
])

const transportNumberSchema = z.union([
  z.number().finite(),
  z.string().regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/),
])

export const orderStatuses = [
  'Criado',
  'EmProcessamento',
  'Processado',
  'Cancelado',
  'Devolvido',
] as const

export const orderStatusSchema = z.enum(orderStatuses)

const orderItemSchema = z.object({
  itemId: transportIdSchema,
  produtoId: transportIdSchema,
  quantidade: transportNumberSchema,
  valorUnitario: transportNumberSchema,
}).strict()

const orderSchema = z.object({
  pedidoId: transportIdSchema,
  carrinhoId: transportIdSchema,
  clienteId: transportIdSchema,
  enderecoEntrega: deliveryAddressSchema,
  dataPedido: z.iso.datetime({ offset: true }),
  formaPagamento: paymentMethodSchema,
  status: orderStatusSchema,
  items: z.array(orderItemSchema),
}).strict()

const ordersPageSchema = z.object({
  status: z.literal(true),
  message: z.string().optional(),
  pagination: z.object({
    pages: transportIdSchema,
    size: transportIdSchema,
    totalItems: transportIdSchema,
    data: z.array(orderSchema),
  }).strict(),
}).strict()

const orderResponseSchema = z.object({
  status: z.literal(true),
  message: z.string().optional(),
  data: orderSchema.nullable(),
}).strict()

const cancelledOrderSchema = z.object({
  pedidoId: transportIdSchema,
  clienteId: transportIdSchema,
  dataPedido: z.iso.datetime({ offset: true }),
  status: z.literal('Cancelado'),
}).strict()

const cancelledOrderResponseSchema = z.object({
  status: z.literal(true),
  message: z.string().optional(),
  data: cancelledOrderSchema.nullable(),
}).strict()

export type OrderStatus = (typeof orderStatuses)[number]

export type OrderItem = {
  itemId: number
  productId: number
  quantity: number
  unitPrice: number
}

export type Order = {
  id: number
  cartId: number
  customerId: number
  deliveryAddress: DeliveryAddress
  createdAt: string
  paymentMethod: PaymentMethod
  status: OrderStatus
  items: OrderItem[]
}

export type OrdersPage = {
  pages: number
  size: number
  totalItems: number
  orders: Order[]
}

export type CancelledOrder = {
  id: number
  customerId: number
  createdAt: string
  status: 'Cancelado'
}

function positiveId(value: number | string, name: string): number {
  const id = normalizeId(value)
  if (id <= 0) throw new TypeError(`${name} must be positive`)
  return id
}

function nonNegativeSafeInteger(value: number | string, name: string): number {
  const result = normalizeId(value)
  if (result < 0) throw new TypeError(`${name} must be non-negative`)
  return result
}

function positiveSafeInteger(value: number | string, name: string): number {
  const result = normalizeId(value)
  if (result <= 0) throw new TypeError(`${name} must be positive`)
  return result
}

function nonNegativeNumber(value: number | string, name: string): number {
  const result = normalizeNumber(value)
  if (result < 0) throw new TypeError(`${name} must be non-negative`)
  return result
}

function adaptOrder(order: z.infer<typeof orderSchema>): Order {
  return {
    id: positiveId(order.pedidoId, 'Order ID'),
    cartId: positiveId(order.carrinhoId, 'Cart ID'),
    customerId: positiveId(order.clienteId, 'Customer ID'),
    deliveryAddress: order.enderecoEntrega,
    createdAt: order.dataPedido,
    paymentMethod: order.formaPagamento,
    status: order.status,
    items: order.items.map((item) => ({
      itemId: positiveId(item.itemId, 'Order item ID'),
      productId: positiveId(item.produtoId, 'Product ID'),
      quantity: nonNegativeNumber(item.quantidade, 'Quantity'),
      unitPrice: nonNegativeNumber(item.valorUnitario, 'Unit price'),
    })),
  }
}

export function adaptOrdersPage(response: unknown): OrdersPage {
  const parsed = ordersPageSchema.parse(response)

  return {
    pages: nonNegativeSafeInteger(parsed.pagination.pages, 'Page count'),
    size: positiveSafeInteger(parsed.pagination.size, 'Page size'),
    totalItems: nonNegativeSafeInteger(parsed.pagination.totalItems, 'Total items'),
    orders: parsed.pagination.data.map(adaptOrder),
  }
}

export function adaptOrderResponse(response: unknown): Order {
  const parsed = orderResponseSchema.parse(response)
  if (!parsed.data) {
    throw new TypeError('Order response does not contain successful data')
  }
  return adaptOrder(parsed.data)
}

export function adaptCancelledOrderResponse(response: unknown): CancelledOrder {
  const parsed = cancelledOrderResponseSchema.parse(response)
  if (!parsed.data) {
    throw new TypeError('Order cancellation response does not contain successful data')
  }

  return {
    id: positiveId(parsed.data.pedidoId, 'Order ID'),
    customerId: positiveId(parsed.data.clienteId, 'Customer ID'),
    createdAt: parsed.data.dataPedido,
    status: parsed.data.status,
  }
}

export function createCancelOrderRequest() {
  return { status: 'Cancelado' } as const
}
