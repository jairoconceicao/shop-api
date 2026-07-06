import { z } from "zod";
import { requestJson } from "@/shared/api/http";
import type { CheckoutOrderRequest, CheckoutOrderResult } from "@/features/checkout/checkout.types";

const checkoutResponseSchema = z
  .object({
    status: z.boolean(),
    message: z.string(),
    data: z.object({
      pedidoId: z.number().int(),
      clienteId: z.number().int(),
      dataPedido: z.string().min(1),
      formaPagamento: z.enum(["Pix", "Cartao", "Boleto"]),
      status: z.string().min(1),
      valorTotal: z.number().positive(),
    }),
  })
  .transform(({ data }) => ({
    orderId: data.pedidoId,
    customerId: data.clienteId,
    orderDate: data.dataPedido,
    paymentMethod: data.formaPagamento,
    status: data.status,
    totalValue: data.valorTotal,
  } satisfies CheckoutOrderResult));

export async function createOrder(token: string, request: CheckoutOrderRequest): Promise<CheckoutOrderResult> {
  return checkoutResponseSchema.parse(
    await requestJson<unknown>("/pedido", {
      method: "POST",
      token,
      body: {
        clienteId: request.customerId,
        carrinhoId: request.cartId,
        enderecoEntrega: request.address,
        formaPagamento: request.paymentMethod,
        dataPedido: request.orderDate,
        items: request.items.map((item) => ({
          itemId: item.itemId,
          produtoId: item.productId,
          quantidade: item.quantity,
          valorUnitario: item.unitValue,
        })),
      },
    }),
  );
}

