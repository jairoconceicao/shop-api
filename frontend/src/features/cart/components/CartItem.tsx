import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { formatCurrency } from '../../../shared/formatting/currency'
import { ProductImage } from '../../../shared/ui/media/ProductImage'
import { Card } from '../../../shared/ui/surfaces/Card'
import type { CartItem as CartItemContract } from '../contracts/cart'
import type { CartProductResult } from '../queries/useCartProductsQuery'

export interface CartItemProps {
  actions: ReactNode
  fallbackAction: ReactNode
  item: CartItemContract
  productResult: CartProductResult
  quantityControl: ReactNode
}

export function CartItem({
  actions,
  fallbackAction,
  item,
  productResult,
  quantityControl,
}: CartItemProps) {
  const product = productResult.status === 'success'
    ? productResult.product
    : null
  const title = product?.title ?? `Produto ${item.productId}`
  const subtotal = item.unitPrice * item.quantity

  return (
    <Card className="grid min-w-0 gap-4 p-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <ProductImage
        alt={title}
        className="mx-auto max-w-32 sm:mx-0"
        src={product?.photo}
      />

      <div className="flex min-w-0 flex-col gap-4">
        <h2 className="break-words text-lg font-semibold text-zinc-100">
          <Link className="hover:text-primary-400 focus-visible:outline-2" to={`/produtos/${item.productId}`}>
            {title}
          </Link>
        </h2>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-zinc-400">Preço unitário</dt>
          <dd className="text-right text-zinc-100">
            {formatCurrency(item.unitPrice)}
          </dd>
          <dt className="text-zinc-400">Quantidade</dt>
          <dd className="text-right text-zinc-100">{item.quantity}</dd>
          <dt className="font-semibold text-zinc-200">Subtotal</dt>
          <dd className="text-right font-semibold text-zinc-100">
            {formatCurrency(subtotal)}
          </dd>
        </dl>

        <div aria-label="Ações do item" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>{quantityControl}</div>
          <div className="flex flex-wrap gap-3">
            {actions}
            {product ? null : fallbackAction}
          </div>
        </div>
      </div>
    </Card>
  )
}
