import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { LoginPageComponent } from '@domains/auth/login-page.component';
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
        path: 'products',
        component: PlaceholderPageComponent,
        title: 'Shop API | Catalogo',
        data: {
          eyebrow: 'Catalogo',
          title: 'Base pronta para o catalogo.',
          description:
            'A estrutura de dominio, o tema global e as rotas publicas ja estao preparadas para conectar produtos, categorias e busca.',
        },
      },
      {
        path: 'cart',
        component: PlaceholderPageComponent,
        canActivate: [authGuard],
        title: 'Shop API | Carrinho',
        data: {
          eyebrow: 'Carrinho',
          title: 'Fluxo protegido separado do catalogo.',
          description:
            'Esta rota ja existe no shell da aplicacao para receber a store de carrinho, o guard e as integracoes autenticadas.',
        },
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
