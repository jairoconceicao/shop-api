import { useEffect, useState, type FormEvent } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BrandMark } from "@/shared/components/BrandMark";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { ToastViewport } from "@/shared/components/ui/Toast";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/auth.store";
import { useCartStore } from "@/features/cart";

const primaryNavItems = [
  { to: "/catalogo", label: "Catálogo" },
  { to: "/carrinho", label: "Carrinho" },
];

const accountNavItems = [
  { to: "/pedidos", label: "Pedidos" },
  { to: "/cliente", label: "Conta" },
];

const commerceHighlights = ["Entrega rápida", "Troca facilitada", "Checkout seguro"];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isReady = useAuthStore((state) => state.isReady);
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const initializeCart = useCartStore((state) => state.initializeCart);
  const clearCurrentCart = useCartStore((state) => state.clearCurrentCart);
  const cartItemCount = useCartStore((state) =>
    state.currentCart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    if (!isReady) {
      initializeSession();
    }
  }, [initializeSession, isReady]);

  useEffect(() => {
    if (location.pathname === "/catalogo") {
      setSearchQuery(searchParams.get("q") ?? "");
      return;
    }

    setSearchQuery("");
  }, [location.pathname, searchParams]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated || !session?.token || !session.customerId) {
      clearCurrentCart();
      return;
    }

    void initializeCart({ token: session.token, customerId: session.customerId });
  }, [clearCurrentCart, initializeCart, isAuthenticated, isReady, session?.customerId, session?.token]);

  const isLoginRoute = location.pathname === "/login";

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextParams = new URLSearchParams();
    if (searchQuery.trim()) {
      nextParams.set("q", searchQuery.trim());
    }
    nextParams.set("page", "1");

    navigate(`/catalogo?${nextParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(76,93,72,0.12),_transparent_34%),linear-gradient(180deg,#f8fbf9_0%,#eef3ee_55%,#e8eee6_100%)] text-spanish-green-950">
      <header className="sticky top-0 z-40 border-b border-spanish-green-200/80 bg-white/88 backdrop-blur">
        <div className="border-b border-spanish-green-200/60 bg-spanish-green-950 text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
            <span className="font-medium tracking-wide text-white/90">
              Compra rápida, checkout protegido e foco em conversão.
            </span>
            <div className="flex flex-wrap gap-2">
              {commerceHighlights.map((item) => (
                <Badge key={item} variant="neutral" className="bg-white/10 text-white ring-white/15">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-4">
              <BrandMark />
              {isAuthenticated && session ? (
                <div className="flex items-center gap-2 xl:hidden">
                  <Badge variant="neutral" className="bg-spanish-green-100 text-spanish-green-700">
                    {cartItemCount} no carrinho
                  </Badge>
                </div>
              ) : null}
            </div>

            {isAuthenticated ? (
              <form className="w-full max-w-2xl xl:flex-1" onSubmit={handleSearchSubmit} role="search">
                <Input
                  label="Buscar produtos"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Procure por categoria, marca ou produto"
                  className="bg-white"
                />
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-spanish-green-600">
                  <span className="font-medium text-spanish-green-500">Sugestões:</span>
                  <button
                    type="button"
                    className="rounded-full bg-spanish-green-100 px-3 py-1 font-medium text-spanish-green-700 transition hover:bg-spanish-green-200"
                    onClick={() => setSearchQuery("oferta")}
                  >
                    oferta
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-spanish-green-100 px-3 py-1 font-medium text-spanish-green-700 transition hover:bg-spanish-green-200"
                    onClick={() => setSearchQuery("notebook")}
                  >
                    notebook
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-spanish-green-100 px-3 py-1 font-medium text-spanish-green-700 transition hover:bg-spanish-green-200"
                    onClick={() => setSearchQuery("smartphone")}
                  >
                    smartphone
                  </button>
                </div>
              </form>
            ) : isLoginRoute ? (
              <Badge variant="neutral">Acesso do cliente</Badge>
            ) : (
              <div className="flex items-center gap-3">
                <Badge variant="warning">Sessão ausente</Badge>
                <NavLink
                  to="/login"
                  className="rounded-full bg-spanish-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-spanish-green-600"
                >
                  Entrar
                </NavLink>
              </div>
            )}

            {isAuthenticated && session ? (
              <div className="hidden items-center gap-3 xl:flex">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">
                    Sessão ativa
                  </span>
                  <span className="text-sm font-medium text-spanish-green-900">{session.email}</span>
                </div>
                <Badge variant="neutral" className="bg-spanish-green-100 text-spanish-green-700">
                  {session.tokenType}
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    await logout();
                    clearCurrentCart();
                    navigate("/login", { replace: true });
                  }}
                  isLoading={isSubmitting}
                >
                  Sair
                </Button>
              </div>
            ) : null}
          </div>

          {isAuthenticated ? (
            <div className="flex flex-col gap-3 rounded-3xl border border-spanish-green-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <nav className="flex flex-wrap gap-2">
                {primaryNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                        isActive
                          ? "bg-spanish-green-700 text-white shadow-sm"
                          : "border border-spanish-green-200 bg-spanish-green-50 text-spanish-green-700 hover:border-spanish-green-300 hover:bg-spanish-green-100",
                      ].join(" ")
                    }
                  >
                    <span>{item.label}</span>
                    {item.to === "/carrinho" && cartItemCount > 0 ? (
                      <Badge variant="neutral" className="bg-white/15 text-current ring-white/10">
                        {cartItemCount}
                      </Badge>
                    ) : null}
                  </NavLink>
                ))}
              </nav>

              <nav className="flex flex-wrap gap-2">
                {accountNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-spanish-green-100 text-spanish-green-900"
                          : "text-spanish-green-600 hover:bg-spanish-green-50 hover:text-spanish-green-900",
                      ].join(" ")
                    }
                  >
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-185px)] max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-spanish-green-200/80 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-spanish-green-600 sm:px-6 lg:px-8">
          <span className="font-medium text-spanish-green-800">{env.appName}</span>
          <span>Vitrine SPA de e-commerce com foco em descoberta, compra e acompanhamento de pedidos.</span>
          <span>Backend local esperado em {env.apiBaseUrl}</span>
        </div>
      </footer>

      <ToastViewport />
    </div>
  );
}
