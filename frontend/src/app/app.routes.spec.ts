import { describe, expect, it } from 'vitest';

import { authGuard } from '@core/auth/auth.guard';

import { publicAppRoutes } from './app.routes.context';
import { protectedAppRoutes } from './app.routes.protected.context';
import { routes } from './app.routes';

describe('app routes', () => {
  it('defines the public home route', () => {
    const homeRoute = routes[0]?.children?.find((route) => route.path === publicAppRoutes.home);

    expect(homeRoute).toBeDefined();
    expect(homeRoute?.canActivate).toBeUndefined();
    expect(homeRoute?.title).toBe('Shop API | Home');
  });

  it('defines the public login route', () => {
    const loginRoute = routes[0]?.children?.find((route) => route.path === publicAppRoutes.login);

    expect(loginRoute).toBeDefined();
    expect(loginRoute?.canActivate).toBeUndefined();
    expect(loginRoute?.title).toBe('Shop API | Login');
  });

  it('defines the public registration route', () => {
    const registerRoute = routes[0]?.children?.find((route) => route.path === publicAppRoutes.register);

    expect(registerRoute).toBeDefined();
    expect(registerRoute?.canActivate).toBeUndefined();
    expect(registerRoute?.title).toBe('Shop API | Cadastro');
  });

  it('defines the public catalog route', () => {
    const productsRoute = routes[0]?.children?.find((route) => route.path === publicAppRoutes.products);

    expect(productsRoute).toBeDefined();
    expect(productsRoute?.canActivate).toBeUndefined();
    expect(productsRoute?.title).toBe('Shop API | Catalogo');
  });

  it('defines the public product detail route', () => {
    const productDetailsRoute = routes[0]?.children?.find(
      (route) => route.path === publicAppRoutes.productDetails,
    );

    expect(productDetailsRoute).toBeDefined();
    expect(productDetailsRoute?.canActivate).toBeUndefined();
    expect(productDetailsRoute?.title).toBe('Shop API | Detalhe do produto');
  });

  it('defines the protected cart route with the auth guard', () => {
    const cartRoute = routes[0]?.children?.find((route) => route.path === protectedAppRoutes.cart);

    expect(cartRoute).toBeDefined();
    expect(cartRoute?.canActivate).toEqual([authGuard]);
    expect(cartRoute?.title).toBe('Shop API | Carrinho');
  });

  it('defines the protected checkout route with the auth guard', () => {
    const checkoutRoute = routes[0]?.children?.find(
      (route) => route.path === protectedAppRoutes.checkout,
    );

    expect(checkoutRoute).toBeDefined();
    expect(checkoutRoute?.canActivate).toEqual([authGuard]);
    expect(checkoutRoute?.title).toBe('Shop API | Checkout');
  });

  it('defines the protected account routes with the auth guard', () => {
    const accountRoute = routes[0]?.children?.find((route) => route.path === protectedAppRoutes.account);
    const profileRoute = routes[0]?.children?.find(
      (route) => route.path === protectedAppRoutes.accountProfile,
    );
    const passwordRoute = routes[0]?.children?.find(
      (route) => route.path === protectedAppRoutes.accountPassword,
    );
    const ordersRoute = routes[0]?.children?.find(
      (route) => route.path === protectedAppRoutes.accountOrders,
    );

    expect(accountRoute).toBeDefined();
    expect(accountRoute?.canActivate).toEqual([authGuard]);
    expect(accountRoute?.title).toBe('Shop API | Minha conta');
    expect(profileRoute).toBeDefined();
    expect(profileRoute?.canActivate).toEqual([authGuard]);
    expect(profileRoute?.title).toBe('Shop API | Meus dados');
    expect(passwordRoute).toBeDefined();
    expect(passwordRoute?.canActivate).toEqual([authGuard]);
    expect(passwordRoute?.title).toBe('Shop API | Alterar senha');
    expect(ordersRoute).toBeDefined();
    expect(ordersRoute?.canActivate).toEqual([authGuard]);
    expect(ordersRoute?.title).toBe('Shop API | Meus pedidos');
  });
});
