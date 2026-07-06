import { useEffect, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

type ProtectedRouteProps = {
  children?: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isReady = useAuthStore((state) => state.isReady);
  const initializeSession = useAuthStore((state) => state.initializeSession);

  useEffect(() => {
    if (!isReady) {
      initializeSession();
    }
  }, [initializeSession, isReady]);

  if (!isReady) {
    return (
      <section className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-3xl border border-spanish-green-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-spanish-green-500">
            Carregando sessão
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-spanish-green-950">Validando acesso</h1>
          <p className="text-sm leading-6 text-spanish-green-700">
            Estamos verificando se existe uma sessão válida antes de liberar esta área.
          </p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}
