import type { Cart } from '../../cart/contracts/cart'
import type { OrderItem } from '../contracts/order'

export function buildOrderItems(cart: Cart | null | undefined): OrderItem[] {
  if (!cart || cart.items.length === 0) {
    throw new TypeError('Confirmed cart must contain at least one item')
  }

  return cart.items.map((item) => ({
    itemId: item.id,
    produtoId: item.productId,
    quantidade: item.quantity,
    valorUnitario: item.unitPrice,
  }))
}
