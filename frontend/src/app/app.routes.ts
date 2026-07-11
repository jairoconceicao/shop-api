import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { LoginPageComponent } from '@domains/auth/login-page.component';
import { CartPageComponent } from '@domains/cart/cart-page.component';
import { CheckoutPageComponent } from '@domains/checkout/checkout-page.component';
import { RegisterPageComponent } from '@domains/auth/register-page.component';
import { ProductDetailsPageComponent } from '@domains/catalog/product-details-page.component';
import { ProductsPageComponent } from '@domains/catalog/products-page.component';
import { AccountPageComponent } from '@domains/customer/account-page.component';
import { OrderDetailPageComponent } from '@domains/customer/order-detail-page.component';
import { OrdersPageComponent } from '@domains/customer/orders-page.component';
import { ProfilePageComponent } from '@domains/customer/profile-page.component';
import { PasswordPageComponent } from '@domains/customer/password-page.component';
import { HomePageComponent } from '@domains/home/home-page.component';

import { publicAppRoutes } from './app.routes.context';
import { protectedAppRoutes } from './app.routes.protected.context';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: publicAppRoutes.home,
        component: HomePageComponent,
        title: 'Shop API | Home',
      },
      {
        path: publicAppRoutes.login,
        component: LoginPageComponent,
        title: 'Shop API | Login',
      },
      {
        path: publicAppRoutes.register,
        component: RegisterPageComponent,
        title: 'Shop API | Cadastro',
      },
      {
        path: publicAppRoutes.products,
        component: ProductsPageComponent,
        title: 'Shop API | Catalogo',
      },
      {
        path: publicAppRoutes.productDetails,
        component: ProductDetailsPageComponent,
        title: 'Shop API | Detalhe do produto',
      },
      {
        path: protectedAppRoutes.cart,
        component: CartPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Carrinho',
      },
      {
        path: protectedAppRoutes.checkout,
        component: CheckoutPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Checkout',
      },
      {
        path: protectedAppRoutes.account,
        component: AccountPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Minha conta',
      },
      {
        path: protectedAppRoutes.accountProfile,
        component: ProfilePageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Meus dados',
      },
      {
        path: protectedAppRoutes.accountPassword,
        component: PasswordPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Alterar senha',
      },
      {
        path: protectedAppRoutes.accountOrders,
        component: OrdersPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Meus pedidos',
      },
      {
        path: protectedAppRoutes.accountOrderDetails,
        component: OrderDetailPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Detalhe do pedido',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
