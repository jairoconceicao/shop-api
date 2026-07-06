import { NavLink, Outlet } from "react-router-dom";
import { BrandMark } from "@/shared/components/BrandMark";
import { env } from "@/config/env";

const navItems = [
  { to: "/catalogo", label: "Catálogo" },
  { to: "/carrinho", label: "Carrinho" },
  { to: "/pedidos", label: "Pedidos" },
  { to: "/cliente", label: "Cliente" },
  { to: "/login", label: "Login" },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(76,93,72,0.12),_transparent_34%),linear-gradient(180deg,#f8fbf9_0%,#eef3ee_55%,#e8eee6_100%)] text-spanish-green-950">
      <header className="border-b border-spanish-green-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <BrandMark />

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-spanish-green-700 text-white shadow-sm"
                      : "text-spanish-green-700 hover:bg-spanish-green-100",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
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
    </div>
  );
}
