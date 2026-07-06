import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { CardStack } from "@/shared/components/ui/Card";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Input } from "@/shared/components/ui/Input";
import { toast } from "@/shared/components/ui/Toast";
import { loginSchema } from "@/features/auth/auth.schemas";
import { useAuthStore } from "@/features/auth/auth.store";

const loginFormSchema = loginSchema;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isReady = useAuthStore((state) => state.isReady);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const error = useAuthStore((state) => state.error);

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/catalogo";
  }, [location.state]);

  const [values, setValues] = useState({
    email: "",
    senha: "",
    rememberSession: true,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"email" | "senha", string>>>({});

  useEffect(() => {
    if (!isReady) {
      initializeSession();
    }
  }, [initializeSession, isReady]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, navigate]);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = loginFormSchema.safeParse(values);
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: issues.email?.[0],
        senha: issues.senha?.[0],
      });
      return;
    }

    setFieldErrors({});

    try {
      await login(parsed.data);
      toast.success("Login concluído", "Sua sessão foi iniciada com sucesso.");
      navigate(from, { replace: true });
    } catch {
      // A mensagem já está exposta no store e renderizada abaixo.
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <CardStack
        className="bg-white/90"
        eyebrow={
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Fase 3</Badge>
            <Badge variant="info">Autenticação</Badge>
          </div>
        }
        title="Entre com sua conta"
        description="A sessão é validada com token JWT, expiração controlada e redirecionamento automático para áreas protegidas."
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => toast.info("Fluxo futuro", "Recuperação de senha entra em uma próxima etapa.")}
            >
              Esqueci minha senha
            </Button>
            <Button type="submit" form="login-form" isLoading={isSubmitting}>
              Entrar
            </Button>
          </>
        }
      >
        <form id="login-form" className="grid gap-4" onSubmit={submitLogin}>
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            hint="Use o mesmo e-mail do cadastro."
            value={values.email}
            onChange={(event) => {
              setValues((current) => ({ ...current, email: event.target.value }));
              if (fieldErrors.email) {
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }
            }}
            error={fieldErrors.email}
          />

          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.senha}
            onChange={(event) => {
              setValues((current) => ({ ...current, senha: event.target.value }));
              if (fieldErrors.senha) {
                setFieldErrors((current) => ({ ...current, senha: undefined }));
              }
            }}
            error={fieldErrors.senha}
          />

          <Checkbox
            label="Manter minha sessão ativa"
            checked={values.rememberSession}
            onChange={(event) => setValues((current) => ({ ...current, rememberSession: event.target.checked }))}
            hint="A sessão será preservada até a expiração do token."
          />

          {error ? (
            <EmptyState
              tone="error"
              title="Não foi possível entrar"
              description={error}
              action={{
                label: "Tentar novamente",
                onClick: () => {
                  setValues((current) => ({ ...current, senha: "" }));
                  useAuthStore.setState({ error: null });
                },
                variant: "secondary",
              }}
            />
          ) : null}
        </form>
      </CardStack>

      <div className="grid gap-6">
        <CardStack
          eyebrow={<Badge variant="neutral">Sessão</Badge>}
          title="O que acontece após o login"
          description="A aplicação salva o token, reidrata a sessão ao recarregar a página e fecha o acesso quando o JWT expira."
        >
          <div className="grid gap-3">
            {[
              "Token enviado em Authorization: Bearer.",
              "Redirecionamento automático para a rota anterior.",
              "Logout limpa estado local e revoga a sessão no backend.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-spanish-green-200 bg-spanish-green-50/70 p-4 text-sm leading-6 text-spanish-green-800"
              >
                {item}
              </div>
            ))}
          </div>
        </CardStack>

        <CardStack
          eyebrow={<Badge variant="warning">Acesso</Badge>}
          title="Rotas protegidas"
          description="Catálogo, carrinho, checkout, pedidos, detalhe de pedido e cliente só ficam visíveis com sessão ativa."
        >
          <p className="text-sm leading-6 text-spanish-green-700">
            Se você entrar diretamente em uma rota autenticada sem sessão válida, o app redireciona para esta tela.
          </p>
        </CardStack>
      </div>
    </section>
  );
}

