import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/catalogo" replace /> },
      { path: "catalogo", element: <HomePage /> },
      { path: "produto/:id", element: <PlaceholderPage title="Detalhe do produto" /> },
      { path: "carrinho", element: <PlaceholderPage title="Carrinho" /> },
      { path: "checkout", element: <PlaceholderPage title="Checkout" /> },
      { path: "pedidos", element: <PlaceholderPage title="Pedidos" /> },
      { path: "pedidos/:id", element: <PlaceholderPage title="Pedido" /> },
      { path: "cliente", element: <PlaceholderPage title="Cliente" /> },
      { path: "login", element: <LoginPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
