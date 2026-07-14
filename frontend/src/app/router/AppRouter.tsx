import { Route, Routes } from 'react-router-dom'

import { AccountLayout } from '../layouts/AccountLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { StoreLayout } from '../layouts/StoreLayout'
import { NotFoundPage } from './NotFoundPage'
import { RoutePlaceholder } from './RoutePlaceholder'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<RoutePlaceholder title="Catálogo" />} />
        <Route path="produtos/:produtoId" element={<RoutePlaceholder title="Produto" />} />
        <Route path="carrinho" element={<RoutePlaceholder title="Carrinho" />} />
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

      <Route element={<PublicLayout />}>
        <Route path="entrar" element={<RoutePlaceholder title="Entrar" />} />
        <Route path="cadastro" element={<RoutePlaceholder title="Cadastro" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
