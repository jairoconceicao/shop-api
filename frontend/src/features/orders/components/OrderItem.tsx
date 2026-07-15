import { Link } from 'react-router-dom'

import { ProductImage } from '../../../shared/ui/media/ProductImage'
import type { OrderItem as OrderItemContract } from '../contracts/orders'
import type { OrderProductResult } from '../queries/useOrderProductsQuery'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export interface OrderItemProps {
  item: OrderItemContract
  productResult: OrderProductResult | { status: 'pending'; productId: number }
}

export function OrderItem({ item, productResult }: OrderItemProps) {
  const product = productResult.status === 'success' ? productResult.product : null
  const isPending = productResult.status === 'pending'
  const title = product?.title ?? (isPending ? 'Carregando produto…' : 'Produto indisponível')

  return (
    <div className="grid gap-4 sm:grid-cols-[6rem_minmax(0,1fr)]">
      <ProductImage alt={title} className="max-w-24" src={product?.photo} />
      <div className="min-w-0">
        <p className="font-medium text-zinc-100">
          {product ? <Link className="hover:text-primary-400 focus-visible:outline-2" to={`/produtos/${item.productId}`}>{title}</Link> : title}
        </p>
        <p className="mt-1 text-sm text-zinc-400">Quantidade: {item.quantity}</p>
        <p className="text-sm text-zinc-400">{currency.format(item.unitPrice)} cada</p>
        <p className="mt-2 font-semibold text-zinc-100">{currency.format(item.unitPrice * item.quantity)}</p>
        {product || isPending ? null : <Link className="mt-2 inline-block text-sm font-medium text-primary-400 hover:text-primary-300 focus-visible:outline-2" to={`/produtos/${item.productId}`}>Ver produto</Link>}
      </div>
    </div>
  )
}
