import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiRequestError } from "@/shared/api/http";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { catalogFeature, type CatalogProductDetail } from "@/features/catalog";
import { getProductById } from "@/features/catalog/catalog.api";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function getStockLabel(stock: number) {
  if (stock <= 0) {
    return "Indisponível";
  }

  if (stock <= 5) {
    return "Últimas unidades";
  }

  return "Em estoque";
}

function getStockVariant(stock: number) {
  if (stock <= 0) {
    return "danger" as const;
  }

  if (stock <= 5) {
    return "warning" as const;
  }

  return "success" as const;
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="overflow-hidden">
        <Skeleton className="aspect-square w-full rounded-none" />
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-6 w-2/5" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailImage({ product }: { product: CatalogProductDetail }) {
  if (product.imageUrl) {
    return <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />;
  }

  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(108,127,101,0.22),_rgba(23,31,20,0.08))] p-8">
      <span className="max-w-[80%] text-center text-xl font-semibold uppercase tracking-[0.18em] text-spanish-green-700">
        {product.title}
      </span>
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backTarget = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? catalogFeature.routes.list;
  }, [location.state]);

  useEffect(() => {
    let active = true;

    async function loadProduct(productId: string) {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getProductById(productId);
        if (!active) {
          return;
        }

        setProduct(data);
      } catch (loadError) {
        if (!active) {
          return;
        }

        if (loadError instanceof ApiRequestError && loadError.status === 404) {
          setError("O produto solicitado não foi encontrado.");
        } else {
          setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o produto.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (!id) {
      setIsLoading(false);
      setError("Produto inválido.");
      return () => {
        active = false;
      };
    }

    loadProduct(id);

    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !product) {
    return (
      <EmptyState
        tone="error"
        title="Falha ao abrir o produto"
        description={error ?? "Não foi possível carregar os dados do produto."}
        action={{
          label: "Voltar ao catálogo",
          onClick: () => navigate(backTarget, { replace: true }),
          variant: "secondary",
        }}
        secondaryAction={{
          label: "Tentar novamente",
          onClick: () => {
            if (!id) {
              return;
            }

            setIsLoading(true);
            setError(null);

            void getProductById(id)
              .then((data) => setProduct(data))
              .catch((retryError) =>
                setError(retryError instanceof Error ? retryError.message : "Não foi possível carregar o produto."),
              )
              .finally(() => setIsLoading(false));
          },
          variant: "secondary",
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => navigate(backTarget, { replace: true })}>
          Voltar
        </Button>
        <Link
          className="text-sm font-semibold text-spanish-green-700 hover:text-spanish-green-900"
          to={catalogFeature.routes.list}
        >
          Ver catálogo completo
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden">
          <div className="aspect-square bg-spanish-green-100">
            <DetailImage product={product} />
          </div>
        </Card>

        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStockVariant(product.stock)}>{getStockLabel(product.stock)}</Badge>
              {product.model ? <Badge variant="neutral">Modelo {product.model}</Badge> : null}
            </div>
            <CardTitle className="text-3xl sm:text-4xl">{product.title}</CardTitle>
            <CardDescription className="text-base">
              {formatCurrency(product.price)}
              {product.stock > 0 ? ` • ${product.stock} unidades disponíveis` : " • indisponível"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-3xl bg-spanish-green-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Descrição
              </p>
              <p className="mt-3 text-sm leading-7 text-spanish-green-800">{product.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-spanish-green-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                  Produto
                </p>
                <p className="mt-2 text-sm font-semibold text-spanish-green-950">#{product.id}</p>
              </div>
              <div className="rounded-3xl border border-spanish-green-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                  Estoque
                </p>
                <p className="mt-2 text-sm font-semibold text-spanish-green-950">{product.stock}</p>
              </div>
              <div className="rounded-3xl border border-spanish-green-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                  Preço
                </p>
                <p className="mt-2 text-sm font-semibold text-spanish-green-950">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

