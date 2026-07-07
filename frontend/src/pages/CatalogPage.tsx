import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Input } from "@/shared/components/ui/Input";
import { Pagination } from "@/shared/components/ui/Pagination";
import { Select } from "@/shared/components/ui/Select";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import {
  catalogFeature,
  type CatalogProductSummary,
  type CatalogSort,
  type CatalogStockFilter,
} from "@/features/catalog";
import { useAuthStore } from "@/features/auth/auth.store";
import { getCatalogPage } from "@/features/catalog/catalog.api";

const PAGE_SIZE = 12;

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

function sortProducts(items: CatalogProductSummary[], sortBy: CatalogSort) {
  const sorted = [...items];

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((left, right) => left.price - right.price);
    case "price-desc":
      return sorted.sort((left, right) => right.price - left.price);
    case "stock-desc":
      return sorted.sort((left, right) => right.stock - left.stock);
    default:
      return sorted;
  }
}

function filterProducts(items: CatalogProductSummary[], query: string, stockFilter: CatalogStockFilter) {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesQuery = !normalizedQuery || item.title.toLowerCase().includes(normalizedQuery);
    const matchesStock =
      stockFilter === "all"
        ? true
        : stockFilter === "in-stock"
          ? item.stock > 0
          : stockFilter === "low-stock"
            ? item.stock > 0 && item.stock <= 5
            : item.stock <= 0;

    return matchesQuery && matchesStock;
  });
}

function ProductCard({
  product,
  to,
  from,
}: {
  product: CatalogProductSummary;
  to: string;
  from: string;
}) {
  const stockLabel = getStockLabel(product.stock);

  return (
    <Link
      to={to}
      state={{ from }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-spanish-green-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-spanish-green-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-spanish-green-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(108,127,101,0.24),_rgba(23,31,20,0.08))]">
            <span className="max-w-[80%] text-center text-sm font-semibold uppercase tracking-[0.22em] text-spanish-green-700">
              {product.title}
            </span>
          </div>
        )}
        <div className="absolute left-4 top-4">
          <Badge variant={getStockVariant(product.stock)}>{stockLabel}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-semibold leading-6 text-spanish-green-950">
            {product.title}
          </h3>
          <p className="text-2xl font-semibold tracking-tight text-spanish-green-900">
            {formatCurrency(product.price)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 text-sm text-spanish-green-600">
          <span>{product.stock > 0 ? `${product.stock} em estoque` : "Sem estoque"}</span>
          <span className="font-semibold text-spanish-green-700 transition group-hover:text-spanish-green-900">
            Ver detalhes
          </span>
        </div>
      </div>
    </Link>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 12 }, (_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-7 w-1/2" />
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function CatalogPage() {
  const location = useLocation();
  const sessionToken = useAuthStore((state) => state.session?.token ?? null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageData, setPageData] = useState<Awaited<ReturnType<typeof getCatalogPage>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<CatalogStockFilter>("all");
  const [sortBy, setSortBy] = useState<CatalogSort>("relevance");

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setIsLoading(true);
      setError(null);

      try {
        if (!sessionToken) {
          setError("Sessão inválida. Faça login novamente.");
          return;
        }

        const data = await getCatalogPage(page, PAGE_SIZE, sessionToken);
        if (!active) {
          return;
        }

        setPageData(data);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o catálogo.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      active = false;
    };
  }, [page, sessionToken]);

  const visibleProducts = useMemo(() => {
    if (!pageData) {
      return [];
    }

    return sortProducts(filterProducts(pageData.items, query, stockFilter), sortBy);
  }, [pageData, query, sortBy, stockFilter]);

  const clearFilters = () => {
    setQuery("");
    setStockFilter("all");
    setSortBy("relevance");
  };

  const updatePage = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-spanish-green-200 bg-white">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Fase 4</Badge>
              <Badge variant="info">Catálogo</Badge>
              <Badge variant="neutral">Paginado</Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">
              Catálogo pensado para descoberta, comparação e detalhe.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base">
              A listagem consulta a API v1, respeita paginação e navegação por produto e exibe estados
              claros de carregamento, vazio e erro. Os filtros abaixo atuam sobre a página carregada.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Página atual
              </p>
              <p className="mt-2 text-2xl font-semibold text-spanish-green-950">{page}</p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Total na API
              </p>
              <p className="mt-2 text-2xl font-semibold text-spanish-green-950">
                {pageData ? pageData.totalItems : "..."}
              </p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Itens visíveis
              </p>
              <p className="mt-2 text-2xl font-semibold text-spanish-green-950">
                {visibleProducts.length}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-3">
            <p className="text-sm text-spanish-green-600">Baseado em {location.pathname}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
              <Button variant="ghost" size="sm" onClick={() => updatePage(1)} disabled={page === 1}>
                Ir para a primeira página
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
          <CardHeader>
            <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
              Filtros
            </Badge>
            <CardTitle className="text-white">Refine rapidamente a página atual</CardTitle>
            <CardDescription className="text-spanish-green-100">
              Busca por nome, estoque e ordenação para ajudar a localizar itens antes de abrir o detalhe.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              label="Buscar na página"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex.: notebook, headset, monitor"
              className="bg-white"
            />

            <Select
              label="Estoque"
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value as CatalogStockFilter)}
              className="bg-white"
            >
              <option value="all">Todos os itens</option>
              <option value="in-stock">Em estoque</option>
              <option value="low-stock">Últimas unidades</option>
              <option value="out-of-stock">Sem estoque</option>
            </Select>

            <Select
              label="Ordenação"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as CatalogSort)}
              className="bg-white"
            >
              <option value="relevance">Relevância</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="stock-desc">Maior estoque</option>
            </Select>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <CatalogSkeleton />
        ) : error ? (
          <EmptyState
            tone="error"
            title="Falha ao carregar o catálogo"
            description={error}
            action={{
              label: "Tentar novamente",
              onClick: () => updatePage(page),
              variant: "secondary",
            }}
          />
        ) : pageData && pageData.items.length === 0 ? (
          <EmptyState
            tone="empty"
            title="Nenhum produto encontrado"
            description="A API respondeu sem itens para esta página."
            action={{
              label: "Atualizar página",
              onClick: () => updatePage(page),
              variant: "secondary",
            }}
          />
        ) : visibleProducts.length === 0 ? (
          <EmptyState
            tone="empty"
            title="Nenhum item corresponde aos filtros"
            description="Ajuste a busca, o estoque ou a ordenação para enxergar produtos na página atual."
            action={{
              label: "Limpar filtros",
              onClick: clearFilters,
              variant: "secondary",
            }}
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  to={catalogFeature.routes.detail(product.id)}
                  from={`${location.pathname}${location.search}`}
                />
              ))}
            </div>

            {pageData ? (
              <Pagination currentPage={page} totalPages={pageData.totalPages || 1} onPageChange={updatePage} />
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}







