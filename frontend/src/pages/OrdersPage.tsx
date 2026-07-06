import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ApiRequestError } from "@/shared/api/http";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Input } from "@/shared/components/ui/Input";
import { Pagination } from "@/shared/components/ui/Pagination";
import { Select } from "@/shared/components/ui/Select";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { toast } from "@/shared/components/ui/Toast";
import { useAuthStore } from "@/features/auth/auth.store";
import {
  formatOrderStatus,
  formatPaymentMethod,
  getOrdersByCpf,
  normalizeCpf,
  ordersFeature,
  orderSearchSchema,
  type OrderListPage,
  type OrderSearchFormValues,
  type OrderSummary,
} from "@/features/orders";

const pageSizeOptions = [10, 20, 50] as const;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function formatCpf(value: string) {
  const digits = normalizeCpf(value).slice(0, 11);

  if (digits.length !== 11) {
    return value;
  }

  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

function orderBadgeVariant(status: string) {
  switch (status) {
    case "Cancelado":
      return "danger" as const;
    case "Processado":
      return "success" as const;
    case "EmProcessamento":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

function readSearchParams(searchParams: URLSearchParams): OrderSearchFormValues {
  return {
    cpf: searchParams.get("cpf") ?? "",
    dataInicio: searchParams.get("dataInicio") ?? "",
    dataFim: searchParams.get("dataFim") ?? "",
    page: searchParams.get("page") ?? "1",
    size: searchParams.get("size") ?? "10",
  };
}

function buildSearchParams(values: OrderSearchFormValues) {
  const params = new URLSearchParams();
  const parsedCpf = normalizeCpf(values.cpf);

  if (parsedCpf) {
    params.set("cpf", parsedCpf);
  }

  if (values.dataInicio) {
    params.set("dataInicio", values.dataInicio);
  }

  if (values.dataFim) {
    params.set("dataFim", values.dataFim);
  }

  params.set("page", String(values.page));
  params.set("size", String(values.size));

  return params;
}

function getInlineError(issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>, field: string) {
  return issues.find((issue) => issue.path[0] === field)?.message;
}

function OrdersSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index}>
          <CardHeader className="gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-3/5" />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OrderCard({ order, from }: { order: OrderSummary; from: string }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant={orderBadgeVariant(order.status)}>{formatOrderStatus(order.status)}</Badge>
            <Badge variant="neutral">#{order.orderId}</Badge>
          </div>
          <CardTitle>{formatPaymentMethod(order.paymentMethod)}</CardTitle>
          <CardDescription>
            Pedido em {formatDateTime(order.orderDate)} para cliente #{order.customerId}
          </CardDescription>
        </div>
        <div className="rounded-3xl bg-spanish-green-50 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
            Valor total
          </p>
          <p className="mt-2 text-2xl font-semibold text-spanish-green-950">
            {formatCurrency(order.totalValue)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-spanish-green-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">Itens</p>
          <p className="mt-2 text-lg font-semibold text-spanish-green-950">{order.totalItems}</p>
        </div>
        <div className="rounded-3xl border border-spanish-green-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">Pedido</p>
          <p className="mt-2 text-lg font-semibold text-spanish-green-950">#{order.orderId}</p>
        </div>
        <div className="rounded-3xl border border-spanish-green-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">Carrinho</p>
          <p className="mt-2 text-lg font-semibold text-spanish-green-950">#{order.cartId}</p>
        </div>
        <div className="rounded-3xl border border-spanish-green-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">Entrega</p>
          <p className="mt-2 text-lg font-semibold text-spanish-green-950">
            {order.deliveryAddress.cidade}/{order.deliveryAddress.uf}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between gap-3">
        <p className="text-sm text-spanish-green-600">
          {order.items.length} linhas de itens • CEP {order.deliveryAddress.cep}
        </p>
        <Link
          to={ordersFeature.routes.detail(String(order.orderId))}
          state={{ from }}
          className="rounded-2xl bg-spanish-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-spanish-green-600"
        >
          Ver pedido
        </Link>
      </CardFooter>
    </Card>
  );
}

export function OrdersPage() {
  const location = useLocation();
  const token = useAuthStore((state) => state.session?.token ?? null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [formValues, setFormValues] = useState<OrderSearchFormValues>(() => readSearchParams(searchParams));
  const [pageData, setPageData] = useState<OrderListPage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const searchSignature = searchParams.toString();
  const formSignature = useMemo(() => JSON.stringify(formValues), [formValues]);

  useEffect(() => {
    setFormValues(readSearchParams(searchParams));
  }, [searchSignature]);

  const parsedFilters = useMemo(() => orderSearchSchema.safeParse(formValues), [formSignature]);
  const filterIssues = parsedFilters.success ? [] : parsedFilters.error.issues;
  const hasCpf = parsedFilters.success && normalizeCpf(parsedFilters.data.cpf).length === 11;
  const orderFilters = parsedFilters.success ? parsedFilters.data : null;

  useEffect(() => {
    if (!token) {
      setPageData(null);
      setIsLoading(false);
      return;
    }

    if (!orderFilters) {
      return;
    }

    if (!hasCpf) {
      setPageData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let active = true;

    async function loadOrders() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getOrdersByCpf(token as string, orderFilters as NonNullable<typeof orderFilters>);
        if (!active) {
          return;
        }

        setPageData(data);
      } catch (loadError) {
        if (!active) {
          return;
        }

        if (loadError instanceof ApiRequestError && loadError.status === 404) {
          setPageData(null);
          setError("Nenhum pedido foi encontrado para o CPF informado.");
        } else {
          setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os pedidos.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [hasCpf, orderFilters, token]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = orderSearchSchema.safeParse(formValues);
    if (!result.success) {
      const cpfIssue = getInlineError(result.error.issues, "cpf");
      const dateStartIssue = getInlineError(result.error.issues, "dataInicio");
      const dateEndIssue = getInlineError(result.error.issues, "dataFim");
      const message = cpfIssue ?? dateStartIssue ?? dateEndIssue ?? "Corrija os dados da busca.";

      setFormError(message);
      toast.error("Busca inválida", message);
      return;
    }

    setFormError(null);
    setSearchParams(buildSearchParams({ ...result.data, page: 1 }), { replace: true });
  };

  const handleClear = () => {
    setFormError(null);
    setPageData(null);
    setError(null);
    setSearchParams({}, { replace: true });
    setFormValues({
      cpf: "",
      dataInicio: "",
      dataFim: "",
      page: "1",
      size: "10",
    });
  };

  const handlePageChange = (page: number) => {
    if (!orderFilters) {
      return;
    }

    setSearchParams(buildSearchParams({ ...orderFilters, page }), { replace: true });
  };

  const retrySearch = () => {
    if (!orderFilters) {
      return;
    }

    setSearchParams(buildSearchParams(orderFilters), { replace: true });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-spanish-green-200 bg-white">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Fase 6</Badge>
              <Badge variant="info">Pedidos</Badge>
              <Badge variant="neutral">CPF obrigatório</Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">Busca de pedidos por CPF com paginação.</CardTitle>
            <CardDescription className="max-w-3xl text-base">
              A consulta usa a API v1, permite filtrar por intervalo de datas e leva para o detalhe
              de cada pedido com a possibilidade de cancelamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                CPF pesquisado
              </p>
              <p className="mt-2 text-lg font-semibold text-spanish-green-950">
                {hasCpf ? formatCpf(formValues.cpf) : "Ainda não informado"}
              </p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Total encontrado
              </p>
              <p className="mt-2 text-lg font-semibold text-spanish-green-950">
                {pageData ? pageData.totalItems : "—"}
              </p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Página atual
              </p>
              <p className="mt-2 text-lg font-semibold text-spanish-green-950">
                {pageData ? `${pageData.currentPage}/${pageData.totalPages}` : "—"}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-3">
            <p className="text-sm text-spanish-green-600">Baseado em {location.pathname}</p>
            <Button variant="secondary" size="sm" onClick={handleClear}>
              Limpar busca
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
          <CardHeader>
            <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
              Filtros
            </Badge>
            <CardTitle className="text-white">Localize pedidos rapidamente</CardTitle>
            <CardDescription className="text-spanish-green-100">
              Informe o CPF, escolha o intervalo de datas opcional e ajuste o tamanho da página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Input
                label="CPF"
                value={formValues.cpf}
                onChange={(event) => setFormValues((current) => ({ ...current, cpf: event.target.value }))}
                placeholder="000.000.000-00"
                error={getInlineError(filterIssues, "cpf")}
                className="bg-white"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Data inicial"
                  type="datetime-local"
                  value={formValues.dataInicio}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, dataInicio: event.target.value }))
                  }
                  error={getInlineError(filterIssues, "dataInicio")}
                  className="bg-white"
                />
                <Input
                  label="Data final"
                  type="datetime-local"
                  value={formValues.dataFim}
                  onChange={(event) => setFormValues((current) => ({ ...current, dataFim: event.target.value }))}
                  error={getInlineError(filterIssues, "dataFim")}
                  className="bg-white"
                />
              </div>

              <Select
                label="Itens por página"
                value={String(formValues.size)}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, size: event.target.value, page: "1" }))
                }
                className="bg-white"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>

              {formError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" isLoading={isLoading}>
                  Buscar pedidos
                </Button>
                <Button type="button" variant="secondary" onClick={handleClear}>
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        {!hasCpf ? (
          <EmptyState
            tone="empty"
            title="Informe um CPF para começar"
            description="A listagem de pedidos é filtrada por CPF. Depois da busca, a paginação e o detalhe ficam disponíveis."
          />
        ) : isLoading ? (
          <OrdersSkeleton />
        ) : error ? (
          <EmptyState
            tone="error"
            title="Falha ao carregar os pedidos"
            description={error}
            action={{
              label: "Tentar novamente",
              onClick: retrySearch,
              variant: "secondary",
            }}
          />
        ) : pageData && pageData.items.length === 0 ? (
          <EmptyState
            tone="empty"
            title="Nenhum pedido encontrado"
            description="A API respondeu sem resultados para os filtros informados."
            action={{
              label: "Ajustar busca",
              onClick: () => setFormError(null),
              variant: "secondary",
            }}
          />
        ) : pageData ? (
          <>
            <div className="grid gap-4">
              {pageData.items.map((order) => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  from={`${location.pathname}${location.search}`}
                />
              ))}
            </div>

            <Pagination
              currentPage={pageData.currentPage}
              totalPages={pageData.totalPages || 1}
              onPageChange={handlePageChange}
            />
          </>
        ) : null}
      </section>
    </div>
  );
}



