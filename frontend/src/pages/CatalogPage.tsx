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

function getPurchaseHint(stock: number) {
  if (stock <= 0) {
    return "Volte depois para ver reposição.";
  }

  if (stock <= 5) {
    return "Compra rápida para não perder estoque.";
  }

  return "Disponível para compra imediata.";
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

function buildPageSearchParams(query: string, page: number) {
  const nextParams = new URLSearchParams();

  if (query.trim()) {
    nextParams.set("q", query.trim());
  }

  nextParams.set("page", String(page));

  return nextParams;
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
  const purchaseHint = getPurchaseHint(product.stock);
  const installmentValue = product.price / 10;

  return (
    <Link
      to={to}
      state={{ from }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-spanish-green-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-spanish-green-200"
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
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(108,127,101,0.24),_rgba(23,31,20,0.08))] p-6">
            <span className="max-w-[80%] text-center text-sm font-semibold uppercase tracking-[0.22em] text-spanish-green-700">
              {product.title}
            </span>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant={getStockVariant(product.stock)}>{stockLabel}</Badge>
          <Badge variant="neutral" className="bg-white/90 text-spanish-green-700 ring-white/60">
            Compra segura
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-6 text-spanish-green-950">
            {product.title}
          </h3>
          <div className="space-y-1">
            <p className="text-3xl font-semibold tracking-tight text-spanish-green-900">
              {formatCurrency(product.price)}
            </p>
            <p className="text-sm text-spanish-green-600">
              ou 10x de {formatInstallment(installmentValue)} sem juros
            </p>
          </div>
        </div>

        <div className="mt-auto rounded-3xl bg-spanish-green-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Estoque
              </p>
              <p className="mt-1 text-sm font-semibold text-spanish-green-950">
                {product.stock > 0 ? `${product.stock} unidades` : "Sem estoque"}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-spanish-green-700 ring-1 ring-spanish-green-200 transition group-hover:bg-spanish-green-700 group-hover:text-white">
              Ver oferta
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-spanish-green-700">{purchaseHint}</p>
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
            <Skeleton className="h-8 w-1/2" />
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
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [stockFilter, setStockFilter] = useState<CatalogStockFilter>("all");
  const [sortBy, setSortBy] = useState<CatalogSort>("relevance");

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  useEffect(() => {
    if (location.pathname === "/products") {
      setQuery(searchParams.get("q") ?? "");
    }
  }, [location.pathname, searchParams]);

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

  const totalWithStock = useMemo(
    () => visibleProducts.filter((product) => product.stock > 0).length,
    [visibleProducts],
  );

  const lowStockCount = useMemo(
    () => visibleProducts.filter((product) => product.stock > 0 && product.stock <= 5).length,
    [visibleProducts],
  );

  const averagePrice = useMemo(() => {
    if (!visibleProducts.length) {
      return 0;
    }

    return visibleProducts.reduce((sum, product) => sum + product.price, 0) / visibleProducts.length;
  }, [visibleProducts]);

  const clearFilters = () => {
    setQuery("");
    setStockFilter("all");
    setSortBy("relevance");
    setSearchParams(buildPageSearchParams("", 1), { replace: true });
  };

  const updatePage = (nextPage: number) => {
    setSearchParams(buildPageSearchParams(query, nextPage), { replace: true });
  };

  const applySearch = () => {
    setSearchParams(buildPageSearchParams(query, 1), { replace: true });
  };

  const quickFilter = (nextQuery: string) => {
    setQuery(nextQuery);
    setSearchParams(buildPageSearchParams(nextQuery, 1), { replace: true });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-spanish-green-200 bg-white">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Descoberta</Badge>
              <Badge variant="info">Catálogo</Badge>
              <Badge variant="neutral">Compra guiada</Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">
              Encontre ofertas, compare preço e leve para o carrinho com menos atrito.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base">
              A vitrine privilegia busca, comparação e sinais de compra. O filtro do topo passa por esta
              página e a listagem responde com estoque, preço e navegação clara para o detalhe.
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
                Itens visíveis
              </p>
              <p className="mt-2 text-2xl font-semibold text-spanish-green-950">{visibleProducts.length}</p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Ticket médio
              </p>
              <p className="mt-2 text-2xl font-semibold text-spanish-green-950">
                {visibleProducts.length ? formatCurrency(averagePrice) : "—"}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-3">
            <p className="text-sm text-spanish-green-600">{location.pathname} • foco em navegação comercial</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
              <Button variant="ghost" size="sm" onClick={() => updatePage(1)} disabled={page === 1}>
                Primeira página
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
          <CardHeader>
            <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
              Filtros
            </Badge>
            <CardTitle className="text-white">Refine a vitrine</CardTitle>
            <CardDescription className="text-spanish-green-100">
              Busque um produto específico ou filtre a página atual por disponibilidade e preço.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form className="grid gap-4" onSubmit={(event) => {
              event.preventDefault();
              applySearch();
            }}>
              <Input
                label="Buscar na vitrine"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex.: notebook, headset, monitor"
                className="bg-white"
              />

              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  className="rounded-full bg-white/10 px-3 py-1 font-medium text-white transition hover:bg-white/15"
                  onClick={() => quickFilter("oferta")}
                >
                  oferta
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white/10 px-3 py-1 font-medium text-white transition hover:bg-white/15"
                  onClick={() => quickFilter("notebook")}
                >
                  notebook
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white/10 px-3 py-1 font-medium text-white transition hover:bg-white/15"
                  onClick={() => quickFilter("smartphone")}
                >
                  smartphone
                </button>
              </div>

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

              <Button type="submit" variant="secondary" className="justify-self-start bg-white text-spanish-green-800 hover:bg-spanish-green-50">
                Aplicar busca
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-spanish-green-200 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Disponíveis</p>
            <p className="mt-2 text-3xl font-semibold text-spanish-green-950">{totalWithStock}</p>
            <p className="mt-2 text-sm leading-6 text-spanish-green-600">Itens prontos para compra na página atual.</p>
          </CardContent>
        </Card>
        <Card className="border-spanish-green-200 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Últimas unidades</p>
            <p className="mt-2 text-3xl font-semibold text-spanish-green-950">{lowStockCount}</p>
            <p className="mt-2 text-sm leading-6 text-spanish-green-600">Produtos que merecem destaque no carrinho.</p>
          </CardContent>
        </Card>
        <Card className="border-spanish-green-200 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Filtro ativo</p>
            <p className="mt-2 text-3xl font-semibold text-spanish-green-950">{query.trim() || "Todos"}</p>
            <p className="mt-2 text-sm leading-6 text-spanish-green-600">A busca do topo também chega aqui via `q`.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <CatalogSkeleton />
        ) : error ? (
          <EmptyState
            tone="error"
            title="Falha ao carregar a vitrine"
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
            description="A API respondeu sem itens para esta página. Tente navegar para outra página ou recarregar a listagem."
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


