import type { OrderItem, OrderStatus } from '../contracts/orders'

const statusLabels: Record<OrderStatus, string> = {
  Criado: 'Criado',
  EmProcessamento: 'Em processamento',
  Processado: 'Processado',
  Cancelado: 'Cancelado',
  Devolvido: 'Devolvido',
}

export function calculateOrderTotal(items: readonly OrderItem[]): number {
  return items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  )
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return statusLabels[status]
}
