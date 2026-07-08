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
import { cartFeature, useCartStore } from "@/features/cart";
import { catalogFeature, type CatalogProductDetail } from "@/features/catalog";
import { getProductById } from "@/features/catalog/catalog.api";

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

function getDecisionHint(stock: number) {
  if (stock <= 0) {
    return "O item está fora de estoque e não pode seguir para compra neste momento.";
  }

  if (stock <= 5) {
    return "As últimas unidades pedem decisão rápida para não perder disponibilidade.";
  }

  return "Produto pronto para compra imediata com fluxo simples até o carrinho.";
}

function getShippingLabel(price: number) {
  return price >= 250 ? "Frete grátis acima de R$ 250" : "Frete calculado no checkout";
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="overflow-hidden border-spanish-green-200 bg-white">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="grid gap-3 border-t border-spanish-green-200/70 p-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>

        <Card className="border-spanish-green-200 bg-white">
          <CardHeader className="gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-6 w-3/5" />
          </CardHeader>
          <CardContent className="space-y-5">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Skeleton className="h-24 w-full rounded-3xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="border-spanish-green-200 bg-white">
          <CardHeader>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 w-full rounded-3xl" />
              <Skeleton className="h-20 w-full rounded-3xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
          <CardHeader>
            <Skeleton className="h-4 w-24 bg-white/15" />
            <Skeleton className="h-8 w-2/3 bg-white/15" />
            <Skeleton className="h-5 w-full bg-white/15" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-20 w-full rounded-3xl bg-white/15" />
            <Skeleton className="h-20 w-full rounded-3xl bg-white/15" />
            <Skeleton className="h-20 w-full rounded-3xl bg-white/15" />
          </CardContent>
        </Card>
      </div>
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

function RatingRow() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-spanish-green-600">
      <div className="flex items-center gap-1 text-amber-500" aria-label="Avaliação da vitrine 4.8 de 5">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index}>★</span>
        ))}
      </div>
      <span className="font-semibold text-spanish-green-900">4.8/5</span>
      <span>•</span>
      <span>Curadoria comercial da vitrine</span>
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthStore((state) => state.session);
  const isSubmitting = useCartStore((state) => state.isSubmitting);
  const addItemToCurrentCart = useCartStore((state) => state.addItemToCurrentCart);
  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const backTarget = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? catalogFeature.routes.list;
  }, [location.state]);

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
    let active = true;

    async function loadProduct(productId: string) {
      setIsLoading(true);
      setError(null);

      try {
        if (!session?.token) {
          throw new Error("Sessão ausente.");
        }

        const data = await getProductById(productId, session.token);
        if (!active) {
          return;
        }

        setProduct(data);
        setQuantity(1);
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

    void loadProduct(id);

    return () => {
      active = false;
    };
  }, [id, session?.token]);

  const canAddToCart = Boolean(product && context && product.stock > 0);
  const canIncreaseQuantity = Boolean(product && product.stock > 0 && quantity < product.stock);
  const totalSelectedValue = product ? quantity * product.price : 0;

  const handleRetry = async () => {
    if (!id) {
      setError("Produto inválido.");
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!session?.token) {
      setError("Sessão ausente.");
      setIsLoading(false);
      return;
    }

    try {
      const data = await getProductById(id, session.token);
      setProduct(data);
      setQuantity(1);
    } catch (retryError) {
      if (retryError instanceof ApiRequestError && retryError.status === 404) {
        setError("O produto solicitado não foi encontrado.");
        return;
      }

      setError(retryError instanceof Error ? retryError.message : "Não foi possível carregar o produto.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    if (!context) {
      toast.error("Sessão inválida", "Você precisa estar autenticado para adicionar itens.");
      return;
    }

    if (product.stock <= 0) {
      toast.warning("Produto indisponível", "Não há estoque suficiente para adicionar este item.");
      return;
    }

    const nextQuantity = Math.min(Math.max(quantity, 1), product.stock);

    try {
      await addItemToCurrentCart(context, {
        productId: product.id,
        quantity: nextQuantity,
        unitValue: product.price,
      });
      toast.success("Adicionado ao carrinho", `${product.title} foi incluído com sucesso.`);
      navigate(cartFeature.routes.current);
    } catch {
      toast.error("Não foi possível adicionar o item", "Tente novamente em instantes.");
    }
  };

  const specs = product
    ? [
        { label: "Código do produto", value: `#${product.id}` },
        { label: "Modelo", value: product.model ?? "Sem modelo informado" },
        { label: "Disponibilidade", value: getStockLabel(product.stock) },
        { label: "Estoque", value: product.stock > 0 ? `${product.stock} unidades` : "Sem estoque" },
        { label: "Parcelamento", value: `10x de ${formatInstallment(product.price / 10)} sem juros` },
        { label: "Frete", value: getShippingLabel(product.price) },
      ]
    : [];

  const trustPoints = [
    "Compra protegida com sessão ativa e carrinho sincronizado.",
    "Pedido rastreável do carrinho ao checkout.",
    "Volta ao catálogo sem perder o contexto da navegação.",
  ];

  const purchaseSupport = [
    { title: "Pagamento", description: "Fluxo guiado para conclusão no carrinho e checkout." },
    { title: "Entrega", description: "Frete e prazo confirmados na próxima etapa." },
    { title: "Trocas", description: "Processo acompanhado pela área do pedido." },
  ];

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
            void handleRetry();
          },
          variant: "secondary",
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="rounded-3xl border border-spanish-green-200 bg-white px-4 py-3 shadow-sm">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-spanish-green-600">
          <li>
            <Link className="font-medium text-spanish-green-700 hover:text-spanish-green-950" to="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="font-medium text-spanish-green-700 hover:text-spanish-green-950" to={catalogFeature.routes.list}>
              Produtos
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate font-semibold text-spanish-green-950" aria-current="page">
            {product.title}
          </li>
        </ol>
      </nav>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="overflow-hidden border-spanish-green-200 bg-white">
          <div className="relative aspect-square bg-spanish-green-100">
            <DetailImage product={product} />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Badge variant={getStockVariant(product.stock)}>{getStockLabel(product.stock)}</Badge>
              {product.model ? <Badge variant="neutral">Modelo {product.model}</Badge> : null}
              <Badge variant="info">Galeria principal</Badge>
            </div>
          </div>

          <div className="grid gap-3 border-t border-spanish-green-200/70 p-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-3">
              <div className="aspect-square overflow-hidden rounded-2xl bg-white shadow-sm">
                <DetailImage product={product} />
              </div>
            </div>
            <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Produto</p>
              <p className="mt-2 text-sm font-semibold text-spanish-green-950">{product.title}</p>
              <p className="mt-1 text-sm leading-6 text-spanish-green-600">Imagem principal e leitura rápida do item.</p>
            </div>
            <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Compra</p>
              <p className="mt-2 text-sm font-semibold text-spanish-green-950">{getShippingLabel(product.price)}</p>
              <p className="mt-1 text-sm leading-6 text-spanish-green-600">Confirmação completa no checkout.</p>
            </div>
          </div>
        </Card>

        <Card className="border-spanish-green-200 bg-white">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStockVariant(product.stock)}>{getStockLabel(product.stock)}</Badge>
              <Badge variant="info">Compra guiada</Badge>
            </div>
            <CardTitle className="text-3xl leading-tight sm:text-4xl">{product.title}</CardTitle>
            <CardDescription className="text-base">{getDecisionHint(product.stock)}</CardDescription>
            <RatingRow />
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Preço total</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-spanish-green-950">
                {formatCurrency(product.price)}
              </p>
              <p className="mt-2 text-sm text-spanish-green-600">
                ou 10x de {formatInstallment(product.price / 10)} sem juros
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="rounded-3xl border border-spanish-green-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">Quantidade</p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <div className="min-w-16 rounded-2xl border border-spanish-green-200 bg-spanish-green-50 px-4 py-2 text-center text-sm font-semibold text-spanish-green-950">
                    {quantity}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setQuantity((current) => (product.stock > 0 ? Math.min(product.stock, current + 1) : current))
                    }
                    disabled={!canIncreaseQuantity}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl bg-spanish-green-900 px-4 py-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-100">Seleção atual</p>
                <p className="mt-2 text-sm font-semibold text-spanish-green-50">
                  {quantity} x {formatCurrency(product.price)}
                </p>
                <p className="mt-1 text-2xl font-semibold">{formatCurrency(totalSelectedValue)}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button onClick={handleAddToCart} disabled={!canAddToCart} isLoading={isSubmitting} size="lg">
                Adicionar ao carrinho
              </Button>
              <Button variant="secondary" onClick={() => navigate(cartFeature.routes.current)} size="lg">
                Revisar carrinho
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {trustPoints.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-spanish-green-50 px-4 py-3 text-sm leading-6 text-spanish-green-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="border-spanish-green-200 bg-white">
          <CardHeader>
            <Badge variant="neutral">Detalhes</Badge>
            <CardTitle>Especificações e descrição</CardTitle>
            <CardDescription>
              Estrutura pensada para apoiar a decisão sem competir com o bloco de compra.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl bg-spanish-green-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Descrição</p>
              <p className="mt-3 text-sm leading-7 text-spanish-green-800">{product.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-3xl border border-spanish-green-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">{spec.label}</p>
                  <p className="mt-2 text-sm font-semibold text-spanish-green-950">{spec.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
          <CardHeader>
            <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
              Confiança
            </Badge>
            <CardTitle className="text-white">Informações de apoio à compra</CardTitle>
            <CardDescription className="text-spanish-green-100">
              Resumo dos pontos que ajudam a concluir a compra com menos atrito.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {purchaseSupport.map((item) => (
              <div key={item.title} className="rounded-3xl bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-100">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-spanish-green-50">{item.description}</p>
              </div>
            ))}

            <div className="rounded-3xl bg-white/10 p-4 text-sm leading-6 text-spanish-green-50">
              Frete, prazo, troca e acompanhamento seguem o fluxo do carrinho e do pedido. Isso mantém a página do
              produto focada em conversão e reduz informação repetida.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-spanish-green-500">
              Continue explorando
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-spanish-green-950">
              Produtos semelhantes e rotas de retorno
            </h2>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate(catalogFeature.routes.list)}>
            Ver catálogo completo
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Oferta do dia", query: "oferta" },
            { label: "Notebooks", query: "notebook" },
            { label: "Smartphones", query: "smartphone" },
          ].map((item) => (
            <button
              key={item.query}
              type="button"
              className="rounded-3xl border border-spanish-green-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => navigate(`/products?q=${encodeURIComponent(item.query)}&page=1`)}
            >
              <Badge variant="info">Explorar</Badge>
              <p className="mt-3 text-lg font-semibold text-spanish-green-950">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-spanish-green-600">
                Buscar por {item.query} leva você de volta para a vitrine com contexto comercial.
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
