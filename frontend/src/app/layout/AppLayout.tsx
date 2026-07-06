import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "@/shared/components/BrandMark";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { ToastViewport } from "@/shared/components/ui/Toast";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/auth.store";
import { useCartStore } from "@/features/cart";

const navItems = [
  { to: "/catalogo", label: "Catálogo" },
  { to: "/carrinho", label: "Carrinho" },
  { to: "/pedidos", label: "Pedidos" },
  { to: "/cliente", label: "Cliente" },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!isReady) {
      initializeSession();
    }
  }, [initializeSession, isReady]);

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(76,93,72,0.12),_transparent_34%),linear-gradient(180deg,#f8fbf9_0%,#eef3ee_55%,#e8eee6_100%)] text-spanish-green-950">
      <header className="border-b border-spanish-green-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <BrandMark />

          {isAuthenticated ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-spanish-green-700 text-white shadow-sm"
                          : "text-spanish-green-700 hover:bg-spanish-green-100",
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

              {session ? (
                <div className="flex flex-wrap items-center gap-3 rounded-full border border-spanish-green-200 bg-white px-3 py-2">
                  <div className="flex flex-col">
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
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-145px)] max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-spanish-green-200/80 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-sm text-spanish-green-600 sm:px-6 lg:px-8">
          <span>{env.appName}</span>
          <span>Backend local esperado em {env.apiBaseUrl}</span>
        </div>
      </footer>

      <ToastViewport />
    </div>
  );
}
