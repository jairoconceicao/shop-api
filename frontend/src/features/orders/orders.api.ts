import { z } from "zod";
import { requestJson } from "@/shared/api/http";
import { normalizeCpf, orderSearchSchema } from "@/features/orders/orders.schemas";
import type {
  OrderCancelResult,
  OrderDetail,
  OrderListPage,
  OrderPaymentMethod,
  OrderSearchFilters,
  OrderStatus,
  OrderSummary,
} from "@/features/orders/orders.types";

const orderAddressSchema = z.object({
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  complemento: z.string().min(1),
  cep: z.string().min(1),
  bairro: z.string().min(1),
  cidade: z.string().min(1),
  uf: z.string().min(1),
});

const orderItemSchema = z.object({
  itemId: z.number().int(),
  produtoId: z.number().int(),
  quantidade: z.number().int().positive(),
  valorUnitario: z.number().positive(),
});

const orderDataSchema = z.object({
  pedidoId: z.number().int(),
  carrinhoId: z.number().int(),
  clienteId: z.number().int(),
  enderecoEntrega: orderAddressSchema,
  dataPedido: z.string().min(1),
  formaPagamento: z.enum(["Pix", "Cartao", "Boleto"]),
  status: z.enum(["Criado", "EmProcessamento", "Processado", "Cancelado", "Devolvido"]),
  items: z.array(orderItemSchema),
});

const pagedOrdersResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    pagination: z
      .object({
        pages: z.number().int().nonnegative(),
        size: z.number().int().positive(),
        totalItems: z.number().int().nonnegative().optional(),
        data: z.array(orderDataSchema).optional(),
        results: z.array(orderDataSchema).optional(),
        count: z.number().int().nonnegative().optional(),
        currentPage: z.number().int().positive().optional(),
        next: z.boolean().optional(),
        previous: z.boolean().optional(),
      })
      .passthrough(),
  })
  .transform(({ pagination }) => {
    const orders = pagination.data ?? pagination.results ?? [];
    const totalItems = pagination.totalItems ?? pagination.count ?? orders.length;

    return {
      currentPage: pagination.currentPage ?? 1,
      totalPages: pagination.pages,
      pageSize: pagination.size,
      totalItems,
      hasNext: pagination.next ?? false,
      hasPrevious: pagination.previous ?? (pagination.currentPage ?? 1) > 1,
      items: orders.map(mapOrder),
    } satisfies OrderListPage;
  });

const orderDetailResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    data: orderDataSchema,
  })
  .transform(({ data }) => mapOrder(data));

const cancelOrderResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    data: z.object({
      pedidoId: z.number().int(),
      clienteId: z.number().int(),
      dataPedido: z.string().min(1),
      status: z.enum(["Criado", "EmProcessamento", "Processado", "Cancelado", "Devolvido"]),
    }),
  })
  .transform(({ data }) => ({
    orderId: data.pedidoId,
    customerId: data.clienteId,
    orderDate: data.dataPedido,
    status: data.status,
  } satisfies OrderCancelResult));

function mapOrder(order: z.infer<typeof orderDataSchema>): OrderSummary {
  const items = order.items.map((item) => ({
    itemId: item.itemId,
    productId: item.produtoId,
    quantity: item.quantidade,
    unitValue: item.valorUnitario,
  }));

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.unitValue, 0);

  return {
    orderId: order.pedidoId,
    cartId: order.carrinhoId,
    customerId: order.clienteId,
    deliveryAddress: {
      logradouro: order.enderecoEntrega.logradouro,
      numero: order.enderecoEntrega.numero,
      complemento: order.enderecoEntrega.complemento,
      cep: order.enderecoEntrega.cep,
      bairro: order.enderecoEntrega.bairro,
      cidade: order.enderecoEntrega.cidade,
      uf: order.enderecoEntrega.uf,
    },
    orderDate: order.dataPedido,
    paymentMethod: order.formaPagamento as OrderPaymentMethod,
    status: order.status as OrderStatus,
    items,
    totalItems,
    totalValue,
  };
}

function buildOrderSearchParams(filters: OrderSearchFilters) {
  const params = new URLSearchParams({
    cpf: normalizeCpf(filters.cpf),
    page: String(filters.page),
    size: String(filters.size),
  });

  if (filters.dataInicio) {
    params.set("dataInicio", new Date(filters.dataInicio).toISOString());
  }

  if (filters.dataFim) {
    params.set("dataFim", new Date(filters.dataFim).toISOString());
  }

  return params;
}

export async function getOrdersByCpf(token: string, filters: OrderSearchFilters): Promise<OrderListPage> {
  const parsedFilters = orderSearchSchema.parse(filters);
  const params = buildOrderSearchParams(parsedFilters);

  return pagedOrdersResponseSchema.parse(
    await requestJson<unknown>(`/pedido?${params.toString()}`, { token }),
  );
}

export async function getOrderById(token: string, orderId: string | number): Promise<OrderDetail> {
  return orderDetailResponseSchema.parse(await requestJson<unknown>(`/pedido/${orderId}`, { token }));
}

export async function cancelOrder(token: string, orderId: string | number) {
  return cancelOrderResponseSchema.parse(
    await requestJson<unknown>(`/pedido/${orderId}`, {
      method: "PATCH",
      token,
      body: { status: "Cancelado" },
    }),
  );
}
