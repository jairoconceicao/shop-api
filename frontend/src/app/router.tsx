import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CatalogPage } from "@/pages/CatalogPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { LoginPage } from "@/pages/LoginPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/catalogo" replace /> },
      { path: "login", element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "catalogo", element: <CatalogPage /> },
          { path: "produto/:id", element: <ProductDetailPage /> },
          { path: "carrinho", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "pedidos", element: <PlaceholderPage title="Pedidos" /> },
          { path: "pedidos/:id", element: <PlaceholderPage title="Pedido" /> },
          { path: "cliente", element: <PlaceholderPage title="Cliente" /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
