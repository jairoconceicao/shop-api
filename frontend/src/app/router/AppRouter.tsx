import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AccountLayout } from '../layouts/AccountLayout'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { HomePage } from '../../features/catalog/pages/HomePage'
import { ProductDetailPage } from '../../features/catalog/pages/ProductDetailPage'
import { CartPage } from '../../features/cart/pages/CartPage'
import { RegistrationPage } from '../../features/customer/pages/RegistrationPage'
import { ProtectedRoute } from '../../features/auth/routing/ProtectedRoute'
import { CheckoutGuard } from '../../features/checkout/routing/CheckoutGuard'
import { PublicLayout } from '../layouts/PublicLayout'
import { StoreLayout } from '../layouts/StoreLayout'
import { NotFoundPage } from './NotFoundPage'
import { RoutePlaceholder } from './RoutePlaceholder'

const CheckoutPage = lazy(() => import('../../features/checkout/pages/CheckoutPage').then(
  ({ CheckoutPage: Page }) => ({ default: Page }),
))
const OrderConfirmationPage = lazy(() => import(
  '../../features/checkout/pages/OrderConfirmationPage'
).then(({ OrderConfirmationPage: Page }) => ({ default: Page })))
const CustomerDataPage = lazy(() => import(
  '../../features/customer/pages/CustomerDataPage'
).then(({ CustomerDataPage: Page }) => ({ default: Page })))
const CustomerPasswordPage = lazy(() => import(
  '../../features/customer/pages/CustomerPasswordPage'
).then(({ CustomerPasswordPage: Page }) => ({ default: Page })))
const OrdersPage = lazy(() => import('../../features/orders/pages/OrdersPage').then(
  ({ OrdersPage: Page }) => ({ default: Page }),
))

function CheckoutRouteFallback() {
  return (
    <div role="status" aria-label="Carregando checkout" aria-live="polite">
      Carregando checkout…
    </div>
  )
}

function LazyCheckoutRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<CheckoutRouteFallback />}>{children}</Suspense>
}

function CustomerDataRouteFallback() {
  return (
    <div
      role="status"
      aria-label="Carregando página de dados"
      aria-live="polite"
      className="surface min-h-96 p-6"
    >
      Carregando página de dados…
    </div>
  )
}

function CustomerPasswordRouteFallback() {
  return <div role="status" aria-label="Carregando página de senha" aria-live="polite" className="surface min-h-96 p-6">Carregando página de senha…</div>
}

function OrdersRouteFallback() {
  return <div role="status" aria-label="Carregando pedidos" aria-live="polite" className="surface min-h-96 p-6">Carregando pedidos…</div>
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="produtos/:produtoId" element={<ProductDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="carrinho" element={<CartPage />} />
          <Route element={<CheckoutGuard />}>
            <Route
              path="checkout"
              element={<LazyCheckoutRoute><CheckoutPage /></LazyCheckoutRoute>}
            />
          </Route>
          <Route
            path="pedido-confirmado/:pedidoId"
            element={(
              <LazyCheckoutRoute>
                <OrderConfirmationPage />
              </LazyCheckoutRoute>
            )}
          />
          <Route path="pedidos" element={<Suspense fallback={<OrdersRouteFallback />}><OrdersPage /></Suspense>} />
          <Route path="pedidos/:pedidoId" element={<RoutePlaceholder title="Detalhes do pedido" />} />
          <Route path="minha-conta" element={<AccountLayout />}>
            <Route
              path="dados"
              element={<Suspense fallback={<CustomerDataRouteFallback />}><CustomerDataPage /></Suspense>}
            />
            <Route path="senha" element={<Suspense fallback={<CustomerPasswordRouteFallback />}><CustomerPasswordPage /></Suspense>} />
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
