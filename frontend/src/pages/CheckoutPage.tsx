import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { Stepper } from "@/shared/components/ui/Stepper";
import { toast } from "@/shared/components/ui/Toast";
import { useAuthStore } from "@/features/auth/auth.store";
import { catalogFeature, getProductById, type CatalogProductDetail } from "@/features/catalog";
import { cartFeature, useCartStore } from "@/features/cart";
import { checkoutFormSchema, createOrder, type CheckoutFormValues } from "@/features/checkout";
import { getCustomerById, type CustomerDetail } from "@/features/customer";
import { formatOrderStatus, formatPaymentMethod } from "@/features/orders";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const checkoutSteps = [
  { title: "Carrinho", description: "Itens revisados e prontos para seguir." },
  { title: "Entrega", description: "Endereço e dados de recebimento." },
  { title: "Pagamento", description: "Escolha a forma de pagamento." },
  { title: "Confirmação", description: "Pedido criado e rastreável." },
];

const checkoutProgressStep = 1;

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatLocalDateTimeWithoutTimezone(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function getCartItemSubtotal(quantity: number, unitValue: number) {
  return quantity * unitValue;
}

function buildEmptyCheckoutAddress(): CheckoutFormValues["address"] {
  return {
    logradouro: "",
    numero: "",
    complemento: "",
    cep: "",
    bairro: "",
    cidade: "",
    uf: "",
  };
}

function buildCheckoutAddress(customer: CustomerDetail): CheckoutFormValues["address"] {
  return {
    logradouro: customer.endereco.logradouro,
    numero: customer.endereco.numero,
    complemento: customer.endereco.complemento ?? "",
    cep: customer.endereco.cep,
    bairro: customer.endereco.bairro,
    cidade: customer.endereco.cidade,
    uf: customer.endereco.uf,
  };
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="border-spanish-green-200 bg-white shadow-sm">
        <CardHeader>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-3/5" />
          <Skeleton className="h-5 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>

      <Card className="border-spanish-green-200 bg-white shadow-sm">
        <CardHeader>
          <Skeleton className="h-4 w-24" />
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

function CheckoutItemImage({ product }: { product?: CatalogProductDetail }) {
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

function buildCheckoutFallbackDescription(product?: CatalogProductDetail) {
  if (product?.description) {
    return product.description.slice(0, 140);
  }

  return "Produto adicionado ao carrinho aguardando mais informações do catálogo.";
}

type CheckoutFieldName = keyof CheckoutFormValues["address"] | "paymentMethod";

export function CheckoutPage() {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const currentCart = useCartStore((state) => state.currentCart);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const initializeCart = useCartStore((state) => state.initializeCart);
  const loadCurrentCart = useCartStore((state) => state.loadCurrentCart);
  const clearCurrentCart = useCartStore((state) => state.clearCurrentCart);
  const prefilledAddressRef = useRef(false);

  const [productDetails, setProductDetails] = useState<Record<number, CatalogProductDetail>>({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isLoadingCustomerAddress, setIsLoadingCustomerAddress] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderId: number;
    totalValue: number;
    paymentMethod: string;
    status: string;
    orderDate: string;
  } | null>(null);
  const [values, setValues] = useState<CheckoutFormValues>({
    paymentMethod: "Pix",
    address: buildEmptyCheckoutAddress(),
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CheckoutFieldName, string>>>({});

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
    prefilledAddressRef.current = false;

    if (!context?.token || !context.customerId) {
      setIsLoadingCustomerAddress(false);
      return;
    }

    let active = true;
    setIsLoadingCustomerAddress(true);
    setValues((current) => ({
      ...current,
      address: buildEmptyCheckoutAddress(),
    }));

    void getCustomerById(context.token, context.customerId)
      .then((customer) => {
        if (!active) {
          return;
        }

        if (!prefilledAddressRef.current) {
          setValues((current) => ({
            ...current,
            address: buildCheckoutAddress(customer),
          }));
        }
      })
      .catch(() => {
        if (!active) {
          return;
        }

        toast.error(
          "Não foi possível carregar o endereço cadastrado",
          "Preencha os campos manualmente para concluir o checkout.",
        );
      })
      .finally(() => {
        if (active) {
          setIsLoadingCustomerAddress(false);
        }
      });

    return () => {
      active = false;
    };
  }, [context?.customerId, context?.token]);

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

      const nextDetails: Record<number, CatalogProductDetail> = {};

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

  const totalValue = useMemo(
    () => itemsWithDetails.reduce((sum, item) => sum + getCartItemSubtotal(item.quantity, item.unitValue), 0),
    [itemsWithDetails],
  );

  const totalQuantity = useMemo(
    () => itemsWithDetails.reduce((sum, item) => sum + item.quantity, 0),
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

  const handleClearError = (field: CheckoutFieldName) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleAddressChange = <K extends keyof CheckoutFormValues["address"]>(field: K, value: string) => {
    prefilledAddressRef.current = true;
    setValues((current) => ({
      ...current,
      address: {
        ...current.address,
        [field]: value,
      },
    }));
    handleClearError(field);
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!context || !currentCart || currentCart.items.length === 0) {
      toast.error("Carrinho vazio", "Adicione itens antes de concluir o pedido.");
      return;
    }

    const parsed = checkoutFormSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Partial<Record<CheckoutFieldName, string>> = {};

      for (const issue of parsed.error.issues) {
        const [section, field] = issue.path;

        if (section === "address" && typeof field === "string" && !(field in nextErrors)) {
          nextErrors[field as keyof CheckoutFormValues["address"]] = issue.message;
        }

        if (section === "paymentMethod" && !nextErrors.paymentMethod) {
          nextErrors.paymentMethod = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmittingOrder(true);

    try {
      const orderDate = formatLocalDateTimeWithoutTimezone(new Date());
      const result = await createOrder(context.token, {
        customerId: context.customerId,
        cartId: currentCart.cartId,
        address: parsed.data.address,
        paymentMethod: parsed.data.paymentMethod,
        orderDate,
        items: currentCart.items,
      });

      clearCurrentCart();
      setOrderResult({
        orderId: result.orderId,
        totalValue: result.totalValue,
        paymentMethod: result.paymentMethod,
        status: result.status,
        orderDate: result.orderDate,
      });

      toast.success("Pedido criado", `Pedido #${result.orderId} registrado com sucesso.`);
    } catch {
      toast.error("Não foi possível concluir o pedido", "Revise os dados e tente novamente.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  if (!context) {
    return (
      <EmptyState
        tone="error"
        title="Sessão sem cliente vinculado"
        description="O checkout precisa de um cliente autenticado para criar o pedido."
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
        title="Falha ao carregar o checkout"
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
      <EmptyState
        tone="empty"
        title="Nenhum carrinho disponível para checkout"
        description="Adicione itens ao carrinho antes de prosseguir com o fechamento do pedido."
        action={{
          label: "Ir ao carrinho",
          onClick: () => navigate(cartFeature.routes.current),
        }}
        secondaryAction={{
          label: "Explorar catálogo",
          onClick: () => navigate(catalogFeature.routes.list),
          variant: "secondary",
        }}
      />
    );
  }

  if (orderResult) {
    return (
      <EmptyState
        tone="success"
        title={`Pedido #${orderResult.orderId} criado com sucesso`}
        description={`Forma de pagamento ${formatPaymentMethod(orderResult.paymentMethod)}, status ${formatOrderStatus(orderResult.status)} e total de ${formatCurrency(orderResult.totalValue)}.`}
        action={{
          label: "Continuar comprando",
          onClick: () => navigate(catalogFeature.routes.list),
        }}
        secondaryAction={{
          label: "Voltar ao carrinho",
          onClick: () => navigate(cartFeature.routes.current),
          variant: "secondary",
        }}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-4">
        <Card className="overflow-hidden border-spanish-green-200 bg-white shadow-sm">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">Checkout</Badge>
              <Badge variant="neutral">Compra protegida</Badge>
              <Badge variant={detailsLoading ? "warning" : "success"}>
                {detailsLoading ? "Carregando itens" : "Itens prontos"}
              </Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">Finalize o pedido com clareza e menos atrito</CardTitle>
            <CardDescription className="max-w-3xl text-base">
              O fluxo abaixo mostra onde você está, confirma os dados de entrega e mantém o resumo sempre
              visível no desktop.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Stepper steps={checkoutSteps} currentStep={checkoutProgressStep} />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Total</p>
                <p className="mt-2 text-2xl font-semibold text-spanish-green-950">{formatCurrency(totalValue)}</p>
              </div>
              <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Produtos</p>
                <p className="mt-2 text-2xl font-semibold text-spanish-green-950">{currentCart.items.length}</p>
              </div>
              <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                  Quantidade
                </p>
                <p className="mt-2 text-2xl font-semibold text-spanish-green-950">{totalQuantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card className="border-amber-200 bg-amber-50 shadow-sm">
            <CardHeader className="gap-3">
              <Badge variant="warning">Sincronização</Badge>
              <CardTitle className="text-amber-950">O carrinho foi carregado, mas a API retornou um erro</CardTitle>
              <CardDescription className="text-amber-900">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={handleLoadCart} isLoading={isLoading}>
                Tentar sincronizar novamente
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-spanish-green-200 bg-white shadow-sm">
          <CardHeader>
            <Badge variant="neutral">Dados de entrega</Badge>
            <CardTitle>Endereço e pagamento</CardTitle>
            <CardDescription>
              Os campos abaixo são validados com Zod antes do envio para a API.
            </CardDescription>
            {isLoadingCustomerAddress ? (
              <p className="text-sm text-spanish-green-600">Carregando o endereço cadastrado do cliente.</p>
            ) : (
              <p className="text-sm text-spanish-green-600">
                O endereço do cadastro é preenchido automaticamente e pode ser ajustado antes do checkout.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form className="grid gap-5" onSubmit={submitOrder}>
              <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-spanish-green-500">
                      Entrega
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-spanish-green-950">Dados do endereço</h3>
                  </div>
                  <Badge variant="info">Obrigatório</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Logradouro"
                    value={values.address.logradouro}
                    onChange={(event) => handleAddressChange("logradouro", event.target.value)}
                    error={fieldErrors.logradouro}
                    placeholder="Rua, avenida, alameda"
                  />
                  <Input
                    label="Número"
                    value={values.address.numero}
                    onChange={(event) => handleAddressChange("numero", event.target.value)}
                    error={fieldErrors.numero}
                    placeholder="123"
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Input
                    label="CEP"
                    value={values.address.cep}
                    onChange={(event) => handleAddressChange("cep", event.target.value.replace(/\D/g, "").slice(0, 8))}
                    error={fieldErrors.cep}
                    placeholder="00000000"
                    inputMode="numeric"
                  />
                  <Input
                    label="Bairro"
                    value={values.address.bairro}
                    onChange={(event) => handleAddressChange("bairro", event.target.value)}
                    error={fieldErrors.bairro}
                  />
                  <Input
                    label="UF"
                    value={values.address.uf}
                    onChange={(event) => handleAddressChange("uf", event.target.value.toUpperCase().slice(0, 2))}
                    error={fieldErrors.uf}
                    placeholder="SP"
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
                  <Input
                    label="Cidade"
                    value={values.address.cidade}
                    onChange={(event) => handleAddressChange("cidade", event.target.value)}
                    error={fieldErrors.cidade}
                  />
                  <Input
                    label="Complemento"
                    value={values.address.complemento}
                    onChange={(event) => handleAddressChange("complemento", event.target.value)}
                    placeholder="Apartamento, bloco, referência"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-spanish-green-500">
                      Pagamento
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-spanish-green-950">Escolha como pagar</h3>
                  </div>
                  <Badge variant="info">Seguro</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
                  <Select
                    label="Forma de pagamento"
                    value={values.paymentMethod}
                    onChange={(event) => {
                      setValues((current) => ({
                        ...current,
                        paymentMethod: event.target.value as CheckoutFormValues["paymentMethod"],
                      }));
                      handleClearError("paymentMethod");
                    }}
                    error={fieldErrors.paymentMethod}
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartao">Cartão</option>
                    <option value="Boleto">Boleto</option>
                  </Select>
                  <div className="rounded-2xl border border-spanish-green-200 bg-white p-4 text-sm leading-6 text-spanish-green-700">
                    O pedido será enviado com os itens do carrinho atual e o cliente da sessão ativa.
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-spanish-green-200 bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm leading-6 text-spanish-green-700">
                    Ao continuar, você confirma os dados de entrega e o método de pagamento selecionado.
                  </div>
                  <Button type="submit" isLoading={isSubmittingOrder} className="sm:justify-self-start">
                    Criar pedido
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4 self-start lg:sticky lg:top-28">
        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50 shadow-sm">
          <CardHeader>
            <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
              Resumo fixo
            </Badge>
            <CardTitle className="text-white">Itens que irão para o pedido</CardTitle>
            <CardDescription className="text-spanish-green-100">
              O checkout envia exatamente os itens presentes no carrinho atual.
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-100">Produtos</p>
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

        <Card className="border-spanish-green-200 bg-white shadow-sm">
          <CardHeader>
            <Badge variant="info">Carrinho</Badge>
            <CardTitle>Revisão do pedido</CardTitle>
            <CardDescription>
              O resumo abaixo reforça o que será convertido em pedido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {itemsWithDetails.map((item) => (
              <div
                key={item.itemId}
                className="grid gap-3 rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-3 sm:grid-cols-[72px_1fr]"
              >
                <div className="size-16 overflow-hidden rounded-2xl bg-white">
                  <CheckoutItemImage product={item.product ?? undefined} />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-spanish-green-950">
                      {item.product?.title ?? `Produto ${item.productId}`}
                    </p>
                    <Badge variant="neutral">Qtd. {item.quantity}</Badge>
                  </div>
                  <p className="text-xs text-spanish-green-600">{buildCheckoutFallbackDescription(item.product ?? undefined)}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-medium text-spanish-green-700">
                      {item.quantity} x {formatCurrency(item.unitValue)}
                    </span>
                    <span className="font-semibold text-spanish-green-950">
                      {formatCurrency(getCartItemSubtotal(item.quantity, item.unitValue))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

