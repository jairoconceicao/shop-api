import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { cartFeature, useCartStore } from "@/features/cart";
import { customerFeature } from "@/features/customer";
import { ordersFeature } from "@/features/orders";
import { useAuthStore } from "@/features/auth/auth.store";

export function AccountPage() {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const clearCurrentCart = useCartStore((state) => state.clearCurrentCart);
  const currentCart = useCartStore((state) => state.currentCart);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const accountCards = useMemo(
    () => [
      {
        title: "Meus dados",
        description: "Atualize dados pessoais, endereço e celular.",
        to: customerFeature.routes.root,
      },
      {
        title: "Meus pedidos",
        description: "Consulte o histórico e o detalhe das compras.",
        to: ordersFeature.routes.list,
      },
      {
        title: "Alterar senha",
        description: "Fluxo reservado para uma etapa futura do backend.",
        to: "/account/password",
        disabled: true,
      },
    ],
    [],
  );

  const accountStatus = useMemo(
    () => [
      {
        label: "Sessao",
        value: session ? "Ativa" : "Inativa",
        tone: session ? "success" : "neutral",
      },
      {
        label: "Perfil",
        value: session?.customerId ? `#${session.customerId}` : "Sem vinculo",
        tone: session?.customerId ? "info" : "neutral",
      },
      {
        label: "Carrinho",
        value: currentCart ? `#${currentCart.cartId}` : "Nao sincronizado",
        tone: currentCart ? "accent" : "neutral",
      },
    ],
    [currentCart, session],
  );

  const recentActivities = useMemo(
    () => [
      {
        title: "Conta pronta para uso",
        description: session ? `Sessao autenticada com ${session.email}.` : "Nenhuma sessao ativa no momento.",
      },
      {
        title: "Perfil",
        description: session?.customerId
          ? `Fluxo principal disponível em /account/profile para o cliente #${session.customerId}.`
          : "A rota /account/profile continua disponivel para consulta e cadastro.",
      },
      {
        title: "Pedidos",
        description: `Historico consolidado em /account/orders com ${currentCart ? "carrinho sincronizado" : "sincronizacao pendente"}.`,
      },
    ],
    [currentCart, session],
  );

  const handleLogout = async () => {
    await logout();
    clearCurrentCart();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden border-spanish-green-200 bg-white">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Conta</Badge>
              <Badge variant="info">Hub</Badge>
              <Badge variant="neutral">Sessão ativa</Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">Minha conta</CardTitle>
            <CardDescription className="max-w-2xl text-base">
              Um ponto de entrada para dados pessoais, pedidos e ações da sessão ativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Cliente</p>
              <p className="mt-2 text-lg font-semibold text-spanish-green-950">
                {session ? session.email : "Sem sessão"}
              </p>
              <p className="mt-2 text-sm leading-6 text-spanish-green-600">
                Acesso comercial centralizado para dados, pedidos e checkout.
              </p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Token</p>
              <p className="mt-2 text-lg font-semibold text-spanish-green-950">{session?.tokenType ?? "-"}</p>
              <p className="mt-2 text-sm leading-6 text-spanish-green-600">
                Sessão autenticada para os fluxos privados da loja.
              </p>
            </div>
            <div className="rounded-3xl bg-spanish-green-50 p-4 sm:col-span-2 xl:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Carrinho</p>
              <p className="mt-2 text-lg font-semibold text-spanish-green-950">
                {currentCart ? `#${currentCart.cartId}` : "Nenhum carrinho sincronizado"}
              </p>
              <p className="mt-2 text-sm leading-6 text-spanish-green-600">
                O estado atual da compra permanece visível nesta hub.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
          <CardHeader>
            <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
              Acesso rápido
            </Badge>
            <CardTitle className="text-white">Painel da conta</CardTitle>
            <CardDescription className="text-spanish-green-100">
              Status, atividades recentes e atalhos para os fluxos principais.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {accountStatus.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-100">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-spanish-green-200">{item.tone}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-200">
                Atividades recentes
              </p>
              <div className="grid gap-3">
                {recentActivities.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-spanish-green-100">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {accountCards.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                aria-disabled={item.disabled || undefined}
                className={[
                  "rounded-2xl border border-white/10 px-4 py-3 transition",
                  item.disabled
                    ? "pointer-events-none bg-white/5 text-spanish-green-200"
                    : "bg-white/10 text-white hover:bg-white/15",
                ].join(" ")}
              >
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-spanish-green-100">{item.description}</p>
              </Link>
            ))}
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="mt-2 bg-white text-spanish-green-900 hover:bg-spanish-green-50"
            >
              Sair da conta
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Hora local", value: now.toLocaleTimeString("pt-BR") },
          { label: "Pedidos", value: "Consultar em /account/orders" },
          { label: "Perfil", value: "Editar em /account/profile" },
        ].map((item) => (
          <Card key={item.label} className="bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-spanish-green-950">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { title: "Meus dados", description: "Abra o formulário de cadastro e edição.", to: customerFeature.routes.root },
          { title: "Meus pedidos", description: "Veja compras, status e detalhes.", to: ordersFeature.routes.list },
          { title: "Carrinho", description: "Volte à revisão da compra atual.", to: cartFeature.routes.current },
        ].map((item) => (
          <Card key={item.title} className="bg-white">
            <CardHeader>
              <Badge variant="accent">Navegação</Badge>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate(item.to)}>
                Abrir
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}