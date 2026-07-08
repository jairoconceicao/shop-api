import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiRequestError } from "@/shared/api/http";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Input } from "@/shared/components/ui/Input";
import { Modal } from "@/shared/components/ui/Modal";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { toast } from "@/shared/components/ui/Toast";
import { useAuthStore } from "@/features/auth/auth.store";
import { useCartStore } from "@/features/cart";
import {
  createCustomer,
  customerCreateSchema,
  customerLookupSchema,
  customerUpdateSchema,
  deleteCustomer,
  getCustomerByCpf,
  getCustomerById,
  normalizeCpf,
  updateCustomer,
  type CustomerDetail,
  type CustomerFormValues,
} from "@/features/customer";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

function formatCpf(value: string) {
  const digits = normalizeCpf(value).slice(0, 11);

  if (digits.length !== 11) {
    return value;
  }

  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length !== 8) {
    return value;
  }

  return digits.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);

  if (digits.length === 9) {
    return digits.replace(/^(\d{5})(\d{4})$/, "$1-$2");
  }

  if (digits.length === 8) {
    return digits.replace(/^(\d{4})(\d{4})$/, "$1-$2");
  }

  return value;
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function emptyCustomerFormValues(): CustomerFormValues {
  return {
    cpf: "",
    nome: "",
    dataNascimento: "",
    email: "",
    senha: "",
    logradouro: "",
    numero: "",
    complemento: "",
    cep: "",
    bairro: "",
    cidade: "",
    uf: "",
    ddd: "",
    numeroCelular: "",
    whatsApp: true,
  };
}

function buildFormValues(customer: CustomerDetail): CustomerFormValues {
  return {
    cpf: customer.cpf,
    nome: customer.nome,
    dataNascimento: customer.dataNascimento,
    email: customer.email,
    senha: "",
    logradouro: customer.endereco.logradouro,
    numero: customer.endereco.numero,
    complemento: customer.endereco.complemento ?? "",
    cep: customer.endereco.cep,
    bairro: customer.endereco.bairro,
    cidade: customer.endereco.cidade,
    uf: customer.endereco.uf,
    ddd: customer.celular.ddd,
    numeroCelular: customer.celular.numero,
    whatsApp: customer.celular.whatsApp,
  };
}

function buildCustomerFromForm(customerId: number, values: CustomerFormValues): CustomerDetail {
  const parsed = customerUpdateSchema.parse(values);

  return {
    customerId,
    cpf: parsed.cpf,
    nome: parsed.nome,
    dataNascimento: parsed.dataNascimento,
    email: parsed.email,
    endereco: parsed.endereco,
    celular: parsed.celular,
  };
}

function getIssueMessage(issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>, field: string) {
  return issues.find((issue) => issue.path[0] === field)?.message;
}

function CustomerSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-full" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function CustomerPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.session?.token ?? null);
  const sessionCustomerId = useAuthStore((state) => state.session?.customerId ?? null);
  const logout = useAuthStore((state) => state.logout);
  const clearCurrentCart = useCartStore((state) => state.clearCurrentCart);

  const [lookupValues, setLookupValues] = useState({ customerId: "", cpf: "" });
  const [formValues, setFormValues] = useState<CustomerFormValues>(() => emptyCustomerFormValues());
  const [currentCustomer, setCurrentCustomer] = useState<CustomerDetail | null>(null);
  const [activeLookup, setActiveLookup] = useState<"id" | "cpf" | "session" | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(Boolean(sessionCustomerId));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const customerSummary = useMemo(() => {
    if (!currentCustomer) {
      return null;
    }

    return [
      { label: "CPF", value: formatCpf(currentCustomer.cpf) },
      { label: "E-mail", value: currentCustomer.email },
      { label: "Nascimento", value: formatDate(currentCustomer.dataNascimento) },
      { label: "Telefone", value: `(${currentCustomer.celular.ddd}) ${formatPhone(currentCustomer.celular.numero)}` },
    ];
  }, [currentCustomer]);

  useEffect(() => {
    if (!token || !sessionCustomerId || currentCustomer) {
      return;
    }

    let active = true;

    async function loadSessionCustomer() {
      setIsLoadingCustomer(true);
      setLookupError(null);

      try {
        const customer = await getCustomerById(token!, sessionCustomerId!);
        if (!active) {
          return;
        }

        setCurrentCustomer(customer);
        setFormValues(buildFormValues(customer));
        setLookupValues({ customerId: String(customer.customerId), cpf: customer.cpf });
        setActiveLookup("session");
      } catch (error) {
        if (!active) {
          return;
        }

        setLookupError(error instanceof Error ? error.message : "Não foi possível carregar o cliente da sessão.");
      } finally {
        if (active) {
          setIsLoadingCustomer(false);
        }
      }
    }

    void loadSessionCustomer();

    return () => {
      active = false;
    };
  }, [currentCustomer, sessionCustomerId, token]);

  const loadCustomer = async (
    loader: () => Promise<CustomerDetail>,
    lookup: "id" | "cpf" | "session",
    options?: { silent?: boolean },
  ) => {
    if (!token) {
      setLookupError("A sessão precisa estar ativa para consultar clientes.");
      return;
    }

    setIsLoadingCustomer(true);
    setLookupError(null);

    try {
      const customer = await loader();
      setCurrentCustomer(customer);
      setFormValues(buildFormValues(customer));
      setLookupValues({ customerId: String(customer.customerId), cpf: customer.cpf });
      setActiveLookup(lookup);

      if (!options?.silent) {
        toast.success("Conta localizada", `${customer.nome} foi carregado com sucesso.`);
      }
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) {
        setLookupError("Nenhum cliente foi encontrado com os dados informados.");
      } else {
        setLookupError(error instanceof Error ? error.message : "Não foi possível consultar o cliente.");
      }
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  const handleLookupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setLookupError("A sessão precisa estar ativa para consultar clientes.");
      return;
    }

    const nativeEvent = event.nativeEvent as SubmitEvent;
    const action = (nativeEvent.submitter as HTMLButtonElement | null)?.value ?? "id";
    const parsed = customerLookupSchema.safeParse(lookupValues);

    if (!parsed.success) {
      const message =
        getIssueMessage(parsed.error.issues, action === "cpf" ? "cpf" : "customerId") ??
        "Informe um dado válido para a consulta.";

      setLookupError(message);
      toast.error("Busca inválida", message);
      return;
    }

    if (action === "cpf") {
      if (!parsed.data.cpf) {
        setLookupError("Informe um CPF válido para a consulta.");
        return;
      }

      await loadCustomer(() => getCustomerByCpf(token, parsed.data.cpf), "cpf");
      return;
    }

    const customerId = parsed.data.customerId;
    if (typeof customerId !== "number") {
      setLookupError("Informe um ID válido para a consulta.");
      return;
    }

    await loadCustomer(() => getCustomerById(token, customerId), "id");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setFormError("A sessão precisa estar ativa para salvar os dados.");
      return;
    }

    const isEditing = Boolean(currentCustomer);
    const parsed = isEditing ? customerUpdateSchema.safeParse(formValues) : customerCreateSchema.safeParse(formValues);

    if (!parsed.success) {
      const issues = parsed.error.issues;
      const message =
        getIssueMessage(issues, "cpf") ??
        getIssueMessage(issues, "nome") ??
        getIssueMessage(issues, "dataNascimento") ??
        getIssueMessage(issues, "email") ??
        getIssueMessage(issues, "senha") ??
        getIssueMessage(issues, "logradouro") ??
        getIssueMessage(issues, "numero") ??
        getIssueMessage(issues, "cep") ??
        getIssueMessage(issues, "bairro") ??
        getIssueMessage(issues, "cidade") ??
        getIssueMessage(issues, "uf") ??
        getIssueMessage(issues, "ddd") ??
        getIssueMessage(issues, "numeroCelular") ??
        "Corrija os campos do cadastro.";

      setFormError(message);
      toast.error("Conta inválido", message);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      if (currentCustomer) {
        const result = await updateCustomer(token, currentCustomer.customerId, formValues);
        const nextCustomer = buildCustomerFromForm(result.customerId, formValues);
        setCurrentCustomer(nextCustomer);
        setLookupValues({ customerId: String(nextCustomer.customerId), cpf: nextCustomer.cpf });
        setActiveLookup("id");
        toast.success("Conta atualizada", "Os dados do cliente foram salvos com sucesso.");
        return;
      }

      const result = await createCustomer(token, formValues);
      const nextCustomer = buildCustomerFromForm(result.customerId, formValues);
      setCurrentCustomer(nextCustomer);
      setLookupValues({ customerId: String(nextCustomer.customerId), cpf: nextCustomer.cpf });
      setActiveLookup("id");
      toast.success("Conta cadastrada", "O novo cliente foi criado com sucesso.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível salvar o cliente.");
    } finally {
      setIsSaving(false);
    }
  };

  const clearForm = () => {
    setCurrentCustomer(null);
    setFormValues(emptyCustomerFormValues());
    setLookupValues({ customerId: "", cpf: "" });
    setLookupError(null);
    setFormError(null);
    setDeleteError(null);
    setActiveLookup(null);
  };

  const retryLookup = () => {
    if (!token) {
      return;
    }

    if (lookupValues.customerId) {
      void loadCustomer(() => getCustomerById(token, lookupValues.customerId), "id");
      return;
    }

    const cpf = normalizeCpf(lookupValues.cpf);
    if (cpf) {
      void loadCustomer(() => getCustomerByCpf(token, cpf), "cpf");
    }
  };

  const confirmDelete = async () => {
    if (!token || !currentCustomer) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteCustomer(token, currentCustomer.customerId);
      await logout();
      clearCurrentCart();
      toast.success("Conta excluída", "A conta de foi removido e a sessão foi encerrada.");
      setDeleteOpen(false);
      clearForm();
      navigate("/login", { replace: true });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Não foi possível excluir a conta.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isCreateMode = !currentCustomer;

  return (
    <>
      <div className="space-y-8">
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden border-spanish-green-200 bg-white">
            <CardHeader className="gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Conta</Badge>
                <Badge variant="info">Conta</Badge>
                <Badge variant="neutral">CPF e ID</Badge>
              </div>
              <CardTitle className="text-3xl sm:text-4xl">Minha conta e dados de entrega.</CardTitle>
              <CardDescription className="max-w-3xl text-base">
                Consulte por ID ou CPF, carregue os dados da conta autenticada, atualize as informações e
                gerencie a conta quando necessário.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-spanish-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Conta atual</p>
                <p className="mt-2 text-lg font-semibold text-spanish-green-950">
                  {currentCustomer ? `Conta #${currentCustomer.customerId}` : "Aguardando consulta"}
                </p>
              </div>
              <div className="rounded-3xl bg-spanish-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                  Busca ativa
                </p>
                <p className="mt-2 text-lg font-semibold text-spanish-green-950">
                  {activeLookup ? activeLookup.toUpperCase() : "Nenhuma"}
                </p>
              </div>
              <div className="rounded-3xl bg-spanish-green-50 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">
                  Conta autenticada
                </p>
                <p className="mt-2 text-lg font-semibold text-spanish-green-950">
                  {sessionCustomerId ? `#${sessionCustomerId}` : "Sessão sem cliente vinculado"}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between gap-3">
              <p className="text-sm text-spanish-green-600">
                Use a busca para consultar sua conta ou localizar outro cadastro.
              </p>
              <Button variant="secondary" size="sm" onClick={clearForm}>
                Limpar conta
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
            <CardHeader>
              <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
                Busca
              </Badge>
              <CardTitle className="text-white">Localizar cadastro</CardTitle>
              <CardDescription className="text-spanish-green-100">
                A busca carrega os dados da conta para edição.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleLookupSubmit}>
                <Input
                  label="ID da conta"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  placeholder="9999"
                  value={lookupValues.customerId}
                  onChange={(event) => {
                    setLookupValues((current) => ({ ...current, customerId: event.target.value }));
                    if (lookupError) {
                      setLookupError(null);
                    }
                  }}
                  className="bg-white"
                />

                <Input
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={lookupValues.cpf}
                  onChange={(event) => {
                    setLookupValues((current) => ({ ...current, cpf: event.target.value }));
                    if (lookupError) {
                      setLookupError(null);
                    }
                  }}
                  className="bg-white"
                />

                {lookupError ? (
                  <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    {lookupError}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" value="id" isLoading={isLoadingCustomer}>
                    Buscar por conta
                  </Button>
                  <Button type="submit" value="cpf" variant="secondary" isLoading={isLoadingCustomer}>
                    Buscar por CPF
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        {isLoadingCustomer ? (
          <CustomerSkeleton />
        ) : currentCustomer ? (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="border-spanish-green-200 bg-white">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">Conta carregada</Badge>
                  <Badge variant="neutral">#{currentCustomer.customerId}</Badge>
                </div>
                <CardTitle>{currentCustomer.nome}</CardTitle>
                <CardDescription>
                  {formatCpf(currentCustomer.cpf)} • {currentCustomer.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {customerSummary?.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-spanish-green-950">{item.value}</p>
                  </div>
                ))}
                <div className="rounded-3xl border border-spanish-green-200 bg-spanish-green-50 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                    Endereço
                  </p>
                  <p className="mt-2 text-sm font-semibold text-spanish-green-950">
                    {currentCustomer.endereco.logradouro}, {currentCustomer.endereco.numero}
                    {currentCustomer.endereco.complemento ? ` - ${currentCustomer.endereco.complemento}` : ""}
                    <br />
                    {currentCustomer.endereco.bairro} • {currentCustomer.endereco.cidade}/
                    {currentCustomer.endereco.uf} • CEP {formatCep(currentCustomer.endereco.cep)}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-between gap-3">
                <p className="text-sm text-spanish-green-600">
                  Atualize seus dados abaixo ou remova a conta.
                </p>
                <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                  Excluir minha conta
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-spanish-green-200 bg-white">
              <CardHeader>
                <Badge variant={isCreateMode ? "info" : "success"}>
                  {isCreateMode ? "Conta" : "Atualização"}
                </Badge>
                <CardTitle>{isCreateMode ? "Cadastrar conta" : "Editar conta"}</CardTitle>
                <CardDescription>
                  {isCreateMode
                    ? "Crie uma nova conta com os dados pessoais, endereço e celular."
                    : "Altere os campos e salve para atualizar a conta existente."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleSave}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="CPF"
                      placeholder="000.000.000-00"
                      value={formValues.cpf}
                      onChange={(event) => setFormValues((current) => ({ ...current, cpf: event.target.value }))}
                    />
                    <Input
                      label="Nome completo"
                      placeholder="Fulano de Tal"
                      value={formValues.nome}
                      onChange={(event) => setFormValues((current) => ({ ...current, nome: event.target.value }))}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Data de nascimento"
                      type="date"
                      value={formValues.dataNascimento}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, dataNascimento: event.target.value }))
                      }
                    />
                    <Input
                      label="E-mail"
                      type="email"
                      autoComplete="email"
                      placeholder="cliente@exemplo.com"
                      value={formValues.email}
                      onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
                    />
                  </div>

                  {isCreateMode ? (
                    <Input
                      label="Senha"
                      type="password"
                      autoComplete="new-password"
                      placeholder="mínimo 6 caracteres"
                      value={formValues.senha}
                      onChange={(event) => setFormValues((current) => ({ ...current, senha: event.target.value }))}
                      hint="A senha é enviada apenas no cadastro."
                    />
                  ) : (
                    <div className="rounded-2xl border border-spanish-green-200 bg-spanish-green-50/70 px-4 py-3 text-sm leading-6 text-spanish-green-700">
                      A senha permanece inalterada neste fluxo.
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Logradouro"
                      placeholder="Rua Exemplo"
                      value={formValues.logradouro}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, logradouro: event.target.value }))
                      }
                    />
                    <Input
                      label="Número"
                      placeholder="123"
                      value={formValues.numero}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, numero: event.target.value }))
                      }
                    />
                  </div>

                  <Input
                    label="Complemento"
                    placeholder="Apto 10"
                    value={formValues.complemento}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, complemento: event.target.value }))
                    }
                    hint="Opcional no cadastro."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="CEP"
                      placeholder="00000-000"
                      value={formValues.cep}
                      onChange={(event) => setFormValues((current) => ({ ...current, cep: event.target.value }))}
                    />
                    <Input
                      label="Bairro"
                      placeholder="Centro"
                      value={formValues.bairro}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, bairro: event.target.value }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Cidade"
                      placeholder="São Paulo"
                      value={formValues.cidade}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, cidade: event.target.value }))
                      }
                    />
                    <Input
                      label="UF"
                      placeholder="SP"
                      maxLength={2}
                      value={formValues.uf}
                      onChange={(event) => setFormValues((current) => ({ ...current, uf: event.target.value }))}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="DDD"
                      placeholder="11"
                      maxLength={2}
                      value={formValues.ddd}
                      onChange={(event) => setFormValues((current) => ({ ...current, ddd: event.target.value }))}
                    />
                    <Input
                      label="Celular"
                      placeholder="99999-9999"
                      value={formValues.numeroCelular}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, numeroCelular: event.target.value }))
                      }
                    />
                  </div>

                  <Checkbox
                    label="WhatsApp"
                    checked={formValues.whatsApp}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, whatsApp: event.target.checked }))
                    }
                    hint="Marque quando o número também receber mensagens no WhatsApp."
                  />

                  {formError ? (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {formError}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" isLoading={isSaving}>
                      {isCreateMode ? "Cadastrar conta" : "Salvar alterações"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        if (currentCustomer) {
                          setFormValues(buildFormValues(currentCustomer));
                          return;
                        }

                        setFormValues(emptyCustomerFormValues());
                      }}
                    >
                      Recarregar dados
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : lookupError ? (
          <EmptyState
            tone="error"
            title="Falha ao consultar a conta"
            description={lookupError}
            action={{ label: "Tentar novamente", onClick: retryLookup, variant: "secondary" }}
          />
        ) : (
          <EmptyState
            tone="empty"
            title="Consulte ou cadastre uma conta para começar"
            description="Use a busca por ID ou CPF para carregar seus dados. Se preferir, preencha o formulário e crie uma nova conta."
            action={
              sessionCustomerId
                ? {
                    label: "Carregar minha conta",
                    onClick: () => {
                      if (!token || !sessionCustomerId) {
                        return;
                      }

                      void loadCustomer(() => getCustomerById(token!, sessionCustomerId!), "session");
                    },
                    variant: "secondary",
                  }
                : undefined
            }
          />
        )}
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteError(null);
        }}
        title="Excluir minha conta do cliente"
        description="Essa ação remove a conta e encerra a sessão ativa."
        tone="accent"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteError(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={isDeleting}>
              Excluir conta
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-spanish-green-700">
            A conta de <strong>{currentCustomer?.nome}</strong> será removida do sistema.
          </p>
          {deleteError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {deleteError}
            </p>
          ) : null}
        </div>
      </Modal>
    </>
  );
}





