import type { CatalogProduct } from '../contracts/catalog'
import { LinkButton } from '../../../shared/ui/buttons/LinkButton'
import { Badge } from '../../../shared/ui/indicators/Badge'
import { ProductImage } from '../../../shared/ui/media/ProductImage'
import { Card } from '../../../shared/ui/surfaces/Card'

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export interface ProductCardProps {
  product: CatalogProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const isAvailable = product.stock >= 1
  const availability = isAvailable ? 'Em estoque' : 'Esgotado'

  return (
    <Card className="flex min-w-0 flex-col gap-4 p-4">
      <ProductImage
        alt={product.title}
        className="shrink-0"
        src={product.thumbnail}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="truncate text-sm text-zinc-400">{product.category.title}</p>
        <h2 className="line-clamp-2 break-words text-lg font-semibold text-zinc-100">
          {product.title}
        </h2>
        <p className="text-xl font-bold text-zinc-100">
          {brlFormatter.format(product.price)}
        </p>
        <Badge
          aria-label={availability}
          className="self-start"
          role="status"
          status={isAvailable ? 'success' : 'danger'}
        >
          {availability}
        </Badge>
        <LinkButton className="mt-auto w-full" to={`/produtos/${product.id}`}>
          Ver detalhes
        </LinkButton>
      </div>
    </Card>
  )
}
