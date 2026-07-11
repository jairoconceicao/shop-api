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

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        component: HomePageComponent,
        title: 'Shop API | Home',
      },
      {
        path: 'login',
        component: LoginPageComponent,
        title: 'Shop API | Login',
      },
      {
        path: 'cadastro',
        component: RegisterPageComponent,
        title: 'Shop API | Cadastro',
      },
      {
        path: 'products',
        component: ProductsPageComponent,
        title: 'Shop API | Catalogo',
      },
      {
        path: 'products/:id',
        component: ProductDetailsPageComponent,
        title: 'Shop API | Detalhe do produto',
      },
      {
        path: 'cart',
        component: CartPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Carrinho',
      },
      {
        path: 'checkout',
        component: CheckoutPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Checkout',
      },
      {
        path: 'account',
        component: AccountPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Minha conta',
      },
      {
        path: 'account/profile',
        component: ProfilePageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Meus dados',
      },
      {
        path: 'account/password',
        component: PasswordPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Alterar senha',
      },
      {
        path: 'account/orders',
        component: OrdersPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Meus pedidos',
      },
      {
        path: 'account/orders/:pedidoId',
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
