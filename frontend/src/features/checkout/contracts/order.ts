import { z } from 'zod'

import { normalizeId, normalizeNumber } from '../../../shared/adapters/numbers'
import { deliveryAddressSchema, paymentMethodSchema } from './checkout'
import { orderStatusSchema } from '../../orders/contracts/orders'

const transportIdSchema = z.union([
  z.number().int(),
  z.string().regex(/^-?(?:0|[1-9]\d*)$/),
])

const transportNumberSchema = z.union([
  z.number(),
  z.string().regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/),
])

const orderItemRequestSchema = z.object({
  itemId: transportIdSchema.nullable(),
  produtoId: transportIdSchema,
  quantidade: transportNumberSchema,
  valorUnitario: transportNumberSchema,
}).strict()

export const createOrderRequestSchema = z.object({
  enderecoEntrega: deliveryAddressSchema,
  formaPagamento: paymentMethodSchema,
  dataPedido: z.iso.datetime({ offset: true }),
  items: z.array(orderItemRequestSchema),
}).strict()

const createdOrderDataSchema = z.object({
  pedidoId: transportIdSchema,
  clienteId: transportIdSchema,
  dataPedido: z.iso.datetime({ offset: true }),
  formaPagamento: paymentMethodSchema,
  status: orderStatusSchema,
  valorTotal: transportNumberSchema,
}).strict()

const createdOrderResponseSchema = z.object({
  status: z.boolean().optional(),
  message: z.string().optional(),
  data: createdOrderDataSchema.nullable().optional(),
}).strict()

export type OrderItem = {
  itemId: number | null
  produtoId: number
  quantidade: number
  valorUnitario: number
}

export type CreateOrderRequest = {
  enderecoEntrega: z.infer<typeof deliveryAddressSchema>
  formaPagamento: z.infer<typeof paymentMethodSchema>
  dataPedido: string
  items: OrderItem[]
}

export type CreatedOrder = {
  id: number
  customerId: number
  createdAt: string
  paymentMethod: z.infer<typeof paymentMethodSchema>
  status: z.infer<typeof orderStatusSchema>
  total: number
}

function positiveId(value: number | string, name: string): number {
  const id = normalizeId(value)
  if (id <= 0) throw new TypeError(`${name} must be positive`)
  return id
}

function nonNegativeNumber(value: number | string, name: string): number {
  const result = normalizeNumber(value)
  if (result < 0) throw new TypeError(`${name} must be non-negative`)
  return result
}

export function adaptCreateOrderRequest(input: unknown): CreateOrderRequest {
  const parsed = createOrderRequestSchema.parse(input)

  return {
    enderecoEntrega: parsed.enderecoEntrega,
    formaPagamento: parsed.formaPagamento,
    dataPedido: parsed.dataPedido,
    items: parsed.items.map((item) => ({
      itemId: item.itemId === null ? null : normalizeId(item.itemId),
      produtoId: normalizeId(item.produtoId),
      quantidade: normalizeNumber(item.quantidade),
      valorUnitario: normalizeNumber(item.valorUnitario),
    })),
  }
}

export function adaptCreatedOrderResponse(response: unknown): CreatedOrder {
  const parsed = createdOrderResponseSchema.parse(response)

  if (parsed.status === false || !parsed.data) {
    throw new TypeError('Order creation response does not contain successful data')
  }

  return {
    id: positiveId(parsed.data.pedidoId, 'Order ID'),
    customerId: positiveId(parsed.data.clienteId, 'Customer ID'),
    createdAt: parsed.data.dataPedido,
    paymentMethod: parsed.data.formaPagamento,
    status: parsed.data.status,
    total: nonNegativeNumber(parsed.data.valorTotal, 'Order total'),
  }
}
