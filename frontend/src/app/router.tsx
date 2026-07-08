import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AccountPage } from "@/pages/AccountPage";
import { CartPage } from "@/pages/CartPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { CustomerPage } from "@/pages/CustomerPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "catalogo", element: <Navigate to="/products" replace /> },
      { path: "produto/:id", element: <Navigate to="/products/:id" replace /> },
      { path: "carrinho", element: <Navigate to="/cart" replace /> },
      { path: "cliente", element: <Navigate to="/account/profile" replace /> },
      { path: "pedidos", element: <Navigate to="/account/orders" replace /> },
      { path: "pedidos/:id", element: <Navigate to="/account/orders/:id" replace /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "products", element: <CatalogPage /> },
          { path: "products/:id", element: <ProductDetailPage /> },
          { path: "cart", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "account", element: <AccountPage /> },
          { path: "account/profile", element: <CustomerPage /> },
          { path: "account/orders", element: <OrdersPage /> },
          { path: "account/orders/:id", element: <OrderDetailPage /> },
          { path: "account/password", element: <PlaceholderPage title="Alterar senha" /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
