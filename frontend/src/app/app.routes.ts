import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { LoginPageComponent } from '@domains/auth/login-page.component';
import { CartPageComponent } from '@domains/cart/cart-page.component';
import { RegisterPageComponent } from '@domains/auth/register-page.component';
import { ProductDetailsPageComponent } from '@domains/catalog/product-details-page.component';
import { ProductsPageComponent } from '@domains/catalog/products-page.component';
import { HomePageComponent } from '@domains/home/home-page.component';
import { PlaceholderPageComponent } from '@shared/ui/placeholder-page.component';

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
        path: 'account',
        component: PlaceholderPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Minha conta',
        data: {
          eyebrow: 'Conta',
          title: 'Area do cliente isolada por dominio.',
          description:
            'A fundacao ja separa rotas publicas e privadas para integrar perfil, senha e pedidos sem misturar o layout base.',
        },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
