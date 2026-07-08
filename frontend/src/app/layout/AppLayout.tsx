import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BrandMark } from "@/shared/components/BrandMark";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { ToastViewport } from "@/shared/components/ui/Toast";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/auth.store";
import { useCartStore } from "@/features/cart";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Produtos" },
  { to: "/account/orders", label: "Pedidos" },
  { to: "/account", label: "Conta" },
];

const mobileNav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Busca" },
  { to: "/cart", label: "Carrinho" },
  { to: "/account", label: "Conta" },
];

const commerceHighlights = ["Entrega rápida", "Troca facilitada", "Checkout seguro"];

const searchSuggestions = [
  { label: "oferta", value: "oferta" },
  { label: "notebook", value: "notebook" },
  { label: "smartphone", value: "smartphone" },
];

function navClassName({ isActive }: { isActive: boolean }) {
  return [
    "inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-spanish-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    isActive ? "bg-spanish-green-700 text-white shadow-sm" : "text-spanish-green-600 hover:bg-spanish-green-50 hover:text-spanish-green-900",
  ].join(" ");
}

function mobileNavClassName({ isActive }: { isActive: boolean }) {
  return [
    "flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-spanish-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    isActive ? "text-spanish-green-900" : "text-spanish-green-500 hover:text-spanish-green-800",
  ].join(" ");
}

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
  const cartItemCount = useCartStore((state) => state.currentCart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    if (!isReady) {
      initializeSession();
    }
  }, [initializeSession, isReady]);

  useEffect(() => {
    if (location.pathname.startsWith("/products")) {
      setSearchQuery(searchParams.get("q") ?? "");
      return;
    }

    if (location.pathname === "/") {
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
  const showShell = !isLoginRoute;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextParams = new URLSearchParams();
    if (searchQuery.trim()) {
      nextParams.set("q", searchQuery.trim());
    }
    nextParams.set("page", "1");

    navigate(`/products?${nextParams.toString()}`);
  };

  const handleLogout = async () => {
    await logout();
    clearCurrentCart();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(76,93,72,0.12),_transparent_34%),linear-gradient(180deg,#f8fbf9_0%,#eef3ee_55%,#e8eee6_100%)] text-spanish-green-950">
      {showShell ? (
        <a
          href="#main-content"
          className="sr-only z-50 rounded-full bg-white px-4 py-2 text-sm font-semibold text-spanish-green-900 shadow-lg focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-spanish-green-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Pular para o conteúdo principal
        </a>
      ) : null}
      {showShell ? (
        <header className="sticky top-0 z-40 border-b border-spanish-green-200/80 bg-white/90 backdrop-blur">
          <div className="border-b border-spanish-green-200/60 bg-spanish-green-950 text-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
              <span className="font-medium tracking-wide text-white/90">Compra rápida, checkout protegido e foco em conversão.</span>
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
                <Link to="/" aria-label="Ir para a home">
                  <BrandMark />
                </Link>

                <div className="flex items-center gap-2 xl:hidden">
                  {isAuthenticated && session ? <Badge variant="neutral" className="bg-spanish-green-100 text-spanish-green-700">{cartItemCount} itens</Badge> : null}
                  <Link
                    to="/cart"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-spanish-green-200 bg-white px-4 text-sm font-semibold text-spanish-green-800 shadow-sm transition hover:bg-spanish-green-50"
                  >
                    Carrinho
                    {cartItemCount > 0 ? (
                      <span className="ml-2 rounded-full bg-spanish-green-700 px-2 py-0.5 text-xs text-white">{cartItemCount}</span>
                    ) : null}
                  </Link>
                </div>
              </div>

              <form className="w-full max-w-2xl xl:flex-1" onSubmit={submitSearch} role="search">
                <Input
                  label="Buscar produtos"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Procure por categoria, marca ou produto"
                  className="bg-white"
                />
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-spanish-green-600">
                  <span className="font-medium text-spanish-green-500">Sugestões:</span>
                  {searchSuggestions.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className="rounded-full bg-spanish-green-100 px-3 py-1 font-medium text-spanish-green-700 transition hover:bg-spanish-green-200"
                      onClick={() => setSearchQuery(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </form>

              <div className="flex items-center gap-3">
                {isAuthenticated && session ? (
                  <>
                    <div className="hidden flex-col items-end xl:flex">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-spanish-green-500">Sessão ativa</span>
                      <span className="text-sm font-medium text-spanish-green-900">{session.email}</span>
                    </div>
                    <Link
                      to="/cart"
                      className="hidden items-center rounded-full border border-spanish-green-200 bg-white px-4 py-2 text-sm font-semibold text-spanish-green-800 shadow-sm transition hover:bg-spanish-green-50 xl:inline-flex"
                    >
                      Carrinho
                      {cartItemCount > 0 ? <Badge variant="neutral" className="ml-2 bg-spanish-green-100 text-spanish-green-700">{cartItemCount}</Badge> : null}
                    </Link>
                    <Button variant="secondary" size="sm" onClick={handleLogout} isLoading={isSubmitting}>
                      Sair
                    </Button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-full bg-spanish-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-spanish-green-600"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </div>

            <div className="hidden flex-wrap items-center justify-between gap-3 rounded-3xl border border-spanish-green-200 bg-white px-4 py-3 shadow-sm xl:flex">
              <nav className="flex flex-wrap gap-2" aria-label="Navegação principal">
                {quickLinks.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navClassName}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="flex flex-wrap gap-2 text-xs text-spanish-green-500">
                <span className="rounded-full bg-spanish-green-50 px-3 py-1 font-medium text-spanish-green-700">Frete grátis em ofertas selecionadas</span>
                <span className="rounded-full bg-spanish-green-50 px-3 py-1 font-medium text-spanish-green-700">Compra protegida</span>
              </div>
            </div>
          </div>
        </header>
      ) : null}

      <main id="main-content" className={showShell ? "mx-auto flex min-h-[calc(100vh-220px)] max-w-7xl flex-col px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8" : "mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8"}>
        <Outlet />
      </main>

      {showShell ? (
        <>
          <footer className="border-t border-spanish-green-200/80 bg-white/70">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-spanish-green-600 sm:px-6 lg:px-8">
              <span className="font-medium text-spanish-green-800">{env.appName}</span>
              <span>Vitrine SPA de e-commerce com foco em descoberta, compra e acompanhamento de pedidos.</span>
              <span>Backend local esperado em {env.apiBaseUrl}</span>
            </div>
          </footer>

          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-spanish-green-200 bg-white/95 shadow-[0_-10px_30px_rgba(9,14,7,0.08)] backdrop-blur md:hidden" aria-label="Navegação inferior">
            <div className="mx-auto grid max-w-7xl grid-cols-4 gap-1 px-2 py-2">
              {mobileNav.map((item) => (
                <NavLink key={item.to} to={item.to} className={mobileNavClassName}>
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </>
      ) : null}

      <ToastViewport />
    </div>
  );
}
