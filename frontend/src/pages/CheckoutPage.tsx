import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Skeleton } from "@/shared/components/ui/Skeleton";
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

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
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
      <Card>
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

      <Card>
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
      const orderDate = new Date().toISOString();
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
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">Fase 5</Badge>
              <Badge variant="neutral">Checkout</Badge>
              <Badge variant={detailsLoading ? "warning" : "success"}>
                {detailsLoading ? "Carregando itens" : "Itens prontos"}
              </Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">Finalize o pedido</CardTitle>
            <CardDescription className="max-w-3xl text-base">
              Informe o endereço de entrega e escolha a forma de pagamento. O pedido será criado a partir
              do carrinho sincronizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Produtos
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

        <Card>
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
            <form className="grid gap-4" onSubmit={submitOrder}>
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

              <Input
                label="Complemento"
                value={values.address.complemento}
                onChange={(event) => handleAddressChange("complemento", event.target.value)}
                placeholder="Apartamento, bloco, ponto de referência"
              />

              <div className="grid gap-4 sm:grid-cols-3">
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

              <div className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
                <Input
                  label="Cidade"
                  value={values.address.cidade}
                  onChange={(event) => handleAddressChange("cidade", event.target.value)}
                  error={fieldErrors.cidade}
                />
                <Select
                  label="Forma de pagamento"
                  value={values.paymentMethod}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, paymentMethod: event.target.value as CheckoutFormValues["paymentMethod"] }));
                    handleClearError("paymentMethod");
                  }}
                  error={fieldErrors.paymentMethod}
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartao">Cartão</option>
                  <option value="Boleto">Boleto</option>
                </Select>
              </div>

              <Button type="submit" isLoading={isSubmittingOrder} className="sm:justify-self-start">
                Criar pedido
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
          <CardHeader>
            <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
              Carrinho
            </Badge>
            <CardTitle className="text-white">Itens que irão para o pedido</CardTitle>
            <CardDescription className="text-spanish-green-100">
              O checkout envia exatamente os itens presentes no carrinho atual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {itemsWithDetails.map((item) => (
              <div key={item.itemId} className="flex gap-3 rounded-2xl bg-white/10 p-3">
                <div className="size-16 overflow-hidden rounded-2xl bg-white/10">
                  <CheckoutItemImage product={item.product ?? undefined} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {item.product?.title ?? `Produto ${item.productId}`}
                  </p>
                  <p className="text-xs text-spanish-green-100">
                    {item.quantity} x {formatCurrency(item.unitValue)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatCurrency(getCartItemSubtotal(item.quantity, item.unitValue))}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="info">Resumo</Badge>
            <CardTitle>Revisão final</CardTitle>
            <CardDescription>
              O pedido será criado para o cliente vinculado na sessão atual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Carrinho
              </p>
              <p className="mt-2 text-sm font-semibold text-spanish-green-950">#{currentCart.cartId}</p>
            </div>
            <div className="rounded-2xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Criado em
              </p>
              <p className="mt-2 text-sm font-semibold text-spanish-green-950">
                {formatDate(currentCart.createdAt)}
              </p>
            </div>
            <div className="rounded-2xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                Total
              </p>
              <p className="mt-2 text-3xl font-semibold text-spanish-green-950">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => navigate(cartFeature.routes.current)}>
                Voltar ao carrinho
              </Button>
              <Button variant="ghost" onClick={() => navigate(catalogFeature.routes.list)}>
                Continuar comprando
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
