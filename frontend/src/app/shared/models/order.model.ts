import type { EntityId, IsoDateTimeString } from './common.model';
import type { CustomerAddress } from './customer.model';

export type PaymentMethod = 'Pix' | 'Cartao' | 'Boleto';

export type OrderStatus = 'Criado' | 'EmProcessamento' | 'Processado' | 'Cancelado' | 'Devolvido';

export interface OrderItemRequest {
  itemId: EntityId | null;
  produtoId: EntityId;
  quantidade: number | string;
  valorUnitario: number | string;
}

export interface CreateOrderRequest {
  enderecoEntrega: CustomerAddress;
  formaPagamento: PaymentMethod;
  dataPedido: IsoDateTimeString;
  items: OrderItemRequest[];
}

export interface OrderItem {
  itemId: EntityId;
  produtoId: EntityId;
  quantidade: number | string;
  valorUnitario: number | string;
}

export interface Order {
  pedidoId: EntityId;
  carrinhoId: EntityId;
  clienteId: EntityId;
  enderecoEntrega: CustomerAddress;
  dataPedido: IsoDateTimeString;
  formaPagamento: PaymentMethod;
  status: OrderStatus;
  items: OrderItem[];
}

export interface OrderCreated {
  pedidoId: EntityId;
  clienteId: EntityId;
  dataPedido: IsoDateTimeString;
  formaPagamento: PaymentMethod;
  status: OrderStatus;
  valorTotal: number | string;
}

export interface OrderCanceled {
  pedidoId: EntityId;
  clienteId: EntityId;
  dataPedido: IsoDateTimeString;
  status: OrderStatus;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderListParams {
  cpf: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  size?: number;
}

