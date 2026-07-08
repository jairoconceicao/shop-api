import { Link } from "react-router-dom";
import { Badge } from "@/shared/components/ui/Badge";
import { cn } from "@/shared/lib/cn";
import type { CatalogProductSummary } from "@/features/catalog";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const installmentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatInstallment(value: number) {
  return installmentFormatter.format(value);
}

function getStockBadge(stock: number) {
  if (stock <= 0) {
    return { label: "Sem estoque", variant: "danger" as const };
  }

  if (stock <= 5) {
    return { label: "Últimas unidades", variant: "warning" as const };
  }

  return { label: "Em estoque", variant: "success" as const };
}

function ProductImage({ product }: { product: CatalogProductSummary }) {
  if (product.imageUrl) {
    return <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />;
  }

  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(108,127,101,0.24),_rgba(23,31,20,0.08))] p-6">
      <span className="max-w-[80%] text-center text-xs font-semibold uppercase tracking-[0.22em] text-spanish-green-700">
        {product.title}
      </span>
    </div>
  );
}

type ProductCardProps = {
  product: CatalogProductSummary;
  to: string;
  from?: string;
  className?: string;
  ctaLabel?: string;
};

export function ProductCard({ product, to, from, className, ctaLabel = "Comprar agora" }: ProductCardProps) {
  const stockBadge = getStockBadge(product.stock);
  const installmentValue = product.price / 10;
  const freeShipping = product.price >= 250;

  return (
    <Link
      to={to}
      state={from ? { from } : undefined}
      aria-label={`${product.title} por ${formatCurrency(product.price)}. Abrir detalhes do produto.`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-spanish-green-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-spanish-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-spanish-green-100">
        <ProductImage product={product} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
          <Badge variant="accent" className="bg-white/90 text-amber-800 ring-white/60">
            Oferta
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-spanish-green-950 sm:text-base">
            {product.title}
          </h3>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-spanish-green-500">Avaliação 4.8/5</p>
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight text-spanish-green-950">
            {formatCurrency(product.price)}
          </p>
          <p className="text-sm text-spanish-green-600">ou 10x de {formatInstallment(installmentValue)} sem juros</p>
          <p className={cn("text-xs font-semibold", freeShipping ? "text-emerald-700" : "text-spanish-green-500")}>{freeShipping ? "Frete grátis" : "Frete calculado no checkout"}</p>
        </div>

        <div className="mt-auto">
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-spanish-green-50 px-3 py-2 text-xs text-spanish-green-600">
            <span>Estoque</span>
            <span className="font-semibold text-spanish-green-900">
              {product.stock > 0 ? `${product.stock} un.` : "Indisponível"}
            </span>
          </div>
          <div className="rounded-2xl bg-spanish-green-700 px-4 py-3 text-center text-sm font-semibold text-white transition group-hover:bg-spanish-green-600">
            {ctaLabel}
          </div>
        </div>
      </div>
    </Link>
  );
}
