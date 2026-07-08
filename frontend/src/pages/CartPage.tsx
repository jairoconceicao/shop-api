import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { toast } from "@/shared/components/ui/Toast";
import { useAuthStore } from "@/features/auth/auth.store";
import { catalogFeature, getProductById, type CatalogProductDetail } from "@/features/catalog";
import { useCartStore } from "@/features/cart";
import { checkoutFeature } from "@/features/checkout";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function getStockLabel(stock?: number) {
  if (stock === undefined) {
    return "Produto";
  }

  if (stock <= 0) {
    return "Indisponível";
  }

  if (stock <= 5) {
    return "Últimas unidades";
  }

  return "Em estoque";
}

function getStockVariant(stock?: number) {
  if (stock === undefined) {
    return "neutral" as const;
  }

  if (stock <= 0) {
    return "danger" as const;
  }

  if (stock <= 5) {
    return "warning" as const;
  }

  return "success" as const;
}

function getCartItemSubtotal(quantity: number, unitValue: number) {
  return quantity * unitValue;
}

function CartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-3/5" />
          <Skeleton className="h-5 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex gap-4 rounded-3xl border border-spanish-green-200 p-4">
              <Skeleton className="size-24 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function CartItemImage({ product }: { product?: CatalogProductDetail }) {
  if (product?.imageUrl) {
    return <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />;
  }

  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(108,127,101,0.22),_rgba(23,31,20,0.08))] p-4">
      <span className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-700">
        Produto
      </span>
    </div>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const currentCart = useCartStore((state) => state.currentCart);
  const isLoading = useCartStore((state) => state.isLoading);
  const isSubmitting = useCartStore((state) => state.isSubmitting);
  const error = useCartStore((state) => state.error);
  const initializeCart = useCartStore((state) => state.initializeCart);
  const loadCurrentCart = useCartStore((state) => state.loadCurrentCart);
  const createCurrentCart = useCartStore((state) => state.createCurrentCart);
  const updateCurrentCartItem = useCartStore((state) => state.updateCurrentCartItem);
  const removeCurrentCartItem = useCartStore((state) => state.removeCurrentCartItem);

  const [productDetails, setProductDetails] = useState<Record<number, CatalogProductDetail>>({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  const context = useMemo(() => {
    if (!session?.token || !session.customerId) {
      return null;
    }

    return {
      token: session.token,
      customerId: session.customerId,
    };
  }, [session?.customerId, session?.token]);

  useEffect(() => {
    void initializeCart(context);
  }, [context, initializeCart]);

  useEffect(() => {
    if (!currentCart?.items.length) {
      setProductDetails({});
      setDetailsLoading(false);
      return;
    }

    let active = true;
    setDetailsLoading(true);

    if (!context?.token) {
      setProductDetails({});
      setDetailsLoading(false);
      return;
    }

    Promise.allSettled(currentCart.items.map((item) => getProductById(item.productId, context.token))).then((results) => {
      if (!active) {
        return;
      }

      const nextDetails: Record<number, CatalogProductDetail> = {}
;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          nextDetails[currentCart.items[index]!.productId] = result.value;
        }
      });

      setProductDetails(nextDetails);
      setDetailsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [context?.token, currentCart]);

  const itemsWithDetails = useMemo(() => {
    if (!currentCart) {
      return [];
    }

    return currentCart.items.map((item) => ({
      ...item,
      product: productDetails[item.productId] ?? null,
    }));
  }, [currentCart, productDetails]);

  const totalQuantity = useMemo(
    () => itemsWithDetails.reduce((sum, item) => sum + item.quantity, 0),
    [itemsWithDetails],
  );
  const totalValue = useMemo(
    () => itemsWithDetails.reduce((sum, item) => sum + getCartItemSubtotal(item.quantity, item.unitValue), 0),
    [itemsWithDetails],
  );

  const handleLoadCart = async () => {
    if (!context) {
      return;
    }

    try {
      await loadCurrentCart(context);
    } catch {
      toast.error("Falha ao carregar o carrinho", "Tente novamente em instantes.");
    }
  };

  const handleCreateCart = async () => {
    if (!context) {
      return;
    }

    try {
      await createCurrentCart(context);
      toast.success("Carrinho criado", "Seu carrinho foi iniciado com sucesso.");
    } catch {
      toast.error("Não foi possível criar o carrinho", "Verifique sua sessão e tente novamente.");
    }
  };

  const handleQuantityChange = async (itemId: number, nextQuantity: number) => {
    if (!context || nextQuantity < 1) {
      return;
    }

    try {
      await updateCurrentCartItem(context, itemId, nextQuantity);
      toast.success("Carrinho atualizado", "A quantidade do item foi alterada.");
    } catch {
      toast.error("Não foi possível atualizar o item", "A API não aceitou a alteração.");
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!context) {
      return;
    }

    try {
      await removeCurrentCartItem(context, itemId);
      toast.success("Item removido", "O produto foi removido do carrinho.");
    } catch {
      toast.error("Não foi possível remover o item", "A API não aceitou a exclusão.");
    }
  };

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (!context) {
    return (
      <EmptyState
        tone="error"
        title="Sessão sem cliente vinculado"
        description="O carrinho precisa de um cliente autenticado para ser criado e sincronizado."
        action={{
          label: "Ir para o login",
          onClick: () => navigate("/login"),
          variant: "secondary",
        }}
      />
    );
  }

  if (error && !currentCart) {
    return (
      <EmptyState
        tone="error"
        title="Falha ao carregar o carrinho"
        description={error}
        action={{
          label: "Tentar novamente",
          onClick: handleLoadCart,
          variant: "secondary",
        }}
      />
    );
  }

  if (!currentCart || currentCart.items.length === 0) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-spanish-green-200 bg-white">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">Carrinho</Badge>
              <Badge variant="neutral">Vitrine pronta</Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">Seu carrinho está vazio</CardTitle>
            <CardDescription className="max-w-3xl text-base">
              Explore o catálogo, abra um produto e adicione itens para começar a montar a compra.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => navigate(catalogFeature.routes.list)}>Explorar catálogo</Button>
            <Button variant="secondary" onClick={handleCreateCart} isLoading={isSubmitting}>
              Criar carrinho
            </Button>
          </CardContent>
        </Card>

        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
          <CardHeader>
            <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
              Próximos passos
            </Badge>
            <CardTitle className="text-white">Seu fluxo de compra começa no catálogo</CardTitle>
            <CardDescription className="text-spanish-green-100">
              O carrinho é criado automaticamente ao adicionar o primeiro item. Depois disso, ele passa a
              ser sincronizado pela API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-spanish-green-50">
              1. Escolha um produto no catálogo.
            </div>
            <div className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-spanish-green-50">
              2. Abra o detalhe e adicione a quantidade desejada.
            </div>
            <div className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-spanish-green-50">
              3. Revise o carrinho e siga para o checkout.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">Carrinho</Badge>
              <Badge variant="neutral">Compra em andamento</Badge>
              <Badge variant={detailsLoading ? "warning" : "success"}>
                {detailsLoading ? "Atualizando produtos" : "Sincronizado"}
              </Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">Revise sua compra antes de fechar o pedido</CardTitle>
            <CardDescription className="max-w-3xl text-base">
              O carrinho é o ponto de revisão final. Ajuste quantidades, remova o que não quiser e avance
              para o checkout com segurança.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Itens
              </p>
              <p className="mt-2 text-2xl font-semibold text-spanish-green-950">{currentCart.items.length}</p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Quantidade
              </p>
              <p className="mt-2 text-2xl font-semibold text-spanish-green-950">{totalQuantity}</p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Total
              </p>
              <p className="mt-2 text-2xl font-semibold text-spanish-green-950">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <EmptyState
            tone="error"
            title="O carrinho precisa de atenção"
            description={error}
            action={{
              label: "Recarregar",
              onClick: handleLoadCart,
              variant: "secondary",
            }}
          />
        ) : null}

        <div className="space-y-4">
          {itemsWithDetails.map((item) => {
            const stock = item.product?.stock;
            const unitSubtotal = getCartItemSubtotal(item.quantity, item.unitValue);
            const canIncrement = stock === undefined || item.quantity < stock;

            return (
              <Card key={item.itemId} className="overflow-hidden">
                <CardContent className="grid gap-4 p-4 sm:grid-cols-[108px_1fr] sm:p-5">
                  <div className="overflow-hidden rounded-3xl bg-spanish-green-100">
                    <div className="aspect-square">
                      <CartItemImage product={item.product ?? undefined} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getStockVariant(stock)}>{getStockLabel(stock)}</Badge>
                          <Badge variant="neutral">Item #{item.itemId}</Badge>
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight text-spanish-green-950">
                          {item.product?.title ?? `Produto ${item.productId}`}
                        </h3>
                        <p className="text-sm leading-6 text-spanish-green-700">
                          {item.product?.description?.slice(0, 140) ??
                            "Produto adicionado ao carrinho aguardando mais informações do catálogo."}
                        </p>
                      </div>
                      <div className="rounded-3xl bg-spanish-green-50 px-4 py-3 text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                          Subtotal
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-spanish-green-950">
                          {formatCurrency(unitSubtotal)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[auto_auto_1fr] sm:items-end">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                          Quantidade
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.itemId, item.quantity - 1)}
                            disabled={isSubmitting || item.quantity <= 1}
                          >
                            -
                          </Button>
                          <div className="min-w-16 rounded-2xl border border-spanish-green-200 bg-white px-4 py-2 text-center text-sm font-semibold text-spanish-green-950">
                            {item.quantity}
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)}
                            disabled={isSubmitting || !canIncrement}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-spanish-green-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                          Valor unitário
                        </p>
                        <p className="mt-1 text-sm font-semibold text-spanish-green-950">
                          {formatCurrency(item.unitValue)}
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(catalogFeature.routes.detail(item.productId))}
                        >
                          Ver produto
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveItem(item.itemId)}
                          isLoading={isSubmitting}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-28 self-start">
        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
          <CardHeader>
            <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
              Resumo
            </Badge>
            <CardTitle className="text-white">Fechamento do carrinho</CardTitle>
            <CardDescription className="text-spanish-green-100">
              O checkout usa exatamente os itens e quantidades sincronizados aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-100">
                Total atual
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(totalValue)}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-100">
                  Itens
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{currentCart.items.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-100">
                  Quantidade
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{totalQuantity}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-spanish-green-50">
              Frete, prazo e pagamento são confirmados no checkout com o endereço do cliente.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="info">Checkout</Badge>
            <CardTitle>Pronto para finalizar</CardTitle>
            <CardDescription>
              Quando estiver satisfeito com o carrinho, avance para informar endereço e forma de pagamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate(checkoutFeature.routes.root)} disabled={currentCart.items.length === 0}>
              Ir para checkout
            </Button>
            <Button variant="secondary" onClick={handleLoadCart} isLoading={isSubmitting}>
              Atualizar carrinho
            </Button>
            <div className="space-y-2 text-sm leading-6 text-spanish-green-700">
              {[
                "Resumo de compra em destaque",
                "Sem linguagem de revisão interna",
                "CTA principal sempre visível no desktop",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-spanish-green-50 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}


