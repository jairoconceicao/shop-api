import { Route, Routes } from 'react-router-dom'

import { AccountLayout } from '../layouts/AccountLayout'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { HomePage } from '../../features/catalog/pages/HomePage'
import { ProductDetailPage } from '../../features/catalog/pages/ProductDetailPage'
import { CartPage } from '../../features/cart/pages/CartPage'
import { RegistrationPage } from '../../features/customer/pages/RegistrationPage'
import { ProtectedRoute } from '../../features/auth/routing/ProtectedRoute'
import { PublicLayout } from '../layouts/PublicLayout'
import { StoreLayout } from '../layouts/StoreLayout'
import { NotFoundPage } from './NotFoundPage'
import { RoutePlaceholder } from './RoutePlaceholder'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="produtos/:produtoId" element={<ProductDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="carrinho" element={<CartPage />} />
          <Route path="checkout" element={<RoutePlaceholder title="Checkout" />} />
          <Route
            path="pedido-confirmado/:pedidoId"
            element={<RoutePlaceholder title="Pedido confirmado" />}
          />
          <Route path="pedidos" element={<RoutePlaceholder title="Pedidos" />} />
          <Route path="pedidos/:pedidoId" element={<RoutePlaceholder title="Detalhes do pedido" />} />
          <Route path="minha-conta" element={<AccountLayout />}>
            <Route path="dados" element={<RoutePlaceholder title="Dados pessoais" />} />
            <Route path="senha" element={<RoutePlaceholder title="Alterar senha" />} />
          </Route>
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="entrar" element={<LoginPage />} />
        <Route path="cadastro" element={<RegistrationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
