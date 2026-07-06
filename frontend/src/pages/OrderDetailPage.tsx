import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiRequestError } from "@/shared/api/http";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { toast } from "@/shared/components/ui/Toast";
import { useAuthStore } from "@/features/auth/auth.store";
import {
  cancelOrder,
  formatOrderStatus,
  formatPaymentMethod,
  getOrderById,
  ordersFeature,
  type OrderDetail,
} from "@/features/orders";

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

function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/5" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthStore((state) => state.session);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const backTarget = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? ordersFeature.routes.list;
  }, [location.state]);

  useEffect(() => {
    let active = true;

    async function loadOrder(orderId: string) {
      setIsLoading(true);
      setError(null);

      try {
        if (!session?.token) {
          throw new Error("Sessão ausente.");
        }

        const data = await getOrderById(session.token, orderId);
        if (!active) {
          return;
        }

        setOrder(data);
      } catch (loadError) {
        if (!active) {
          return;
        }

        if (loadError instanceof ApiRequestError && loadError.status === 404) {
          setError("O pedido solicitado não foi encontrado.");
        } else {
          setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o pedido.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (!id) {
      setIsLoading(false);
      setError("Pedido inválido.");
      return () => {
        active = false;
      };
    }

    loadOrder(id);

    return () => {
      active = false;
    };
  }, [id, session?.token]);

  const handleCancel = async () => {
    if (!id || !order) {
      return;
    }

    if (!session?.token) {
      toast.error("Sessão inválida", "Você precisa estar autenticado para cancelar pedidos.");
      return;
    }

    const confirmed = window.confirm(`Cancelar o pedido #${order.orderId}?`);
    if (!confirmed) {
      return;
    }

    try {
      setIsCancelling(true);
      await cancelOrder(session.token, id);
      setOrder((current) => (current ? { ...current, status: "Cancelado" } : current));
      toast.success("Pedido cancelado", `O pedido #${order.orderId} foi marcado como cancelado.`);
    } catch (cancelError) {
      toast.error(
        "Não foi possível cancelar",
        cancelError instanceof Error ? cancelError.message : "A API não aceitou a solicitação.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !order) {
    return (
      <EmptyState
        tone="error"
        title="Falha ao abrir o pedido"
        description={error ?? "Não foi possível carregar os dados do pedido."}
        action={{
          label: "Voltar para pedidos",
          onClick: () => navigate(backTarget, { replace: true }),
          variant: "secondary",
        }}
      />
    );
  }

  const canCancel = order.status !== "Cancelado";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => navigate(backTarget, { replace: true })}>
          Voltar
        </Button>
        <Link
          className="text-sm font-semibold text-spanish-green-700 hover:text-spanish-green-900"
          to={ordersFeature.routes.list}
        >
          Ver todos os pedidos
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={orderBadgeVariant(order.status)}>{formatOrderStatus(order.status)}</Badge>
              <Badge variant="neutral">#{order.orderId}</Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">Pedido #{order.orderId}</CardTitle>
            <CardDescription className="text-base">
              {formatPaymentMethod(order.paymentMethod)} • {formatDateTime(order.orderDate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Cliente</p>
              <p className="mt-2 text-lg font-semibold text-spanish-green-950">#{order.customerId}</p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Carrinho</p>
              <p className="mt-2 text-lg font-semibold text-spanish-green-950">#{order.cartId}</p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Itens</p>
              <p className="mt-2 text-lg font-semibold text-spanish-green-950">{order.totalItems}</p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Total</p>
              <p className="mt-2 text-lg font-semibold text-spanish-green-950">
                {formatCurrency(order.totalValue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-4">
            <CardTitle>Entrega e ações</CardTitle>
            <CardDescription>Endereço de entrega, status atual e operação de cancelamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-spanish-green-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Endereço de entrega
              </p>
              <div className="mt-3 space-y-1 text-sm leading-6 text-spanish-green-800">
                <p>
                  {order.deliveryAddress.logradouro}, {order.deliveryAddress.numero}
                </p>
                <p>{order.deliveryAddress.complemento}</p>
                <p>
                  {order.deliveryAddress.bairro} - {order.deliveryAddress.cidade}/{order.deliveryAddress.uf}
                </p>
                <p>CEP {order.deliveryAddress.cep}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Status atual
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={orderBadgeVariant(order.status)}>{formatOrderStatus(order.status)}</Badge>
                <Badge variant="neutral">{formatPaymentMethod(order.paymentMethod)}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-spanish-green-700">
                O cancelamento é enviado para a API com status `Cancelado`.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCancel} isLoading={isCancelling} disabled={!canCancel}>
                Cancelar pedido
              </Button>
              <Button variant="secondary" onClick={() => navigate(ordersFeature.routes.list)}>
                Voltar à lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Itens do pedido</CardTitle>
          <CardDescription>Detalhamento dos produtos incluídos na compra.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.itemId}
              className="grid gap-3 rounded-3xl border border-spanish-green-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto_auto]"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                  Item
                </p>
                <p className="mt-2 text-sm font-semibold text-spanish-green-950">Produto #{item.productId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                  Quantidade
                </p>
                <p className="mt-2 text-sm font-semibold text-spanish-green-950">{item.quantity}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                  Valor unitário
                </p>
                <p className="mt-2 text-sm font-semibold text-spanish-green-950">
                  {formatCurrency(item.unitValue)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                  Subtotal
                </p>
                <p className="mt-2 text-sm font-semibold text-spanish-green-950">
                  {formatCurrency(item.quantity * item.unitValue)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
