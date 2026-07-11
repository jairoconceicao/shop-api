import { describe, expect, it } from 'vitest';

import { authGuard } from '@core/auth/auth.guard';

import { publicAppRoutes } from './app.routes.context';
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

  it('protects the checkout route with the auth guard', () => {
    const checkoutRoute = routes[0]?.children?.find((route) => route.path === 'checkout');

    expect(checkoutRoute).toBeDefined();
    expect(checkoutRoute?.canActivate).toEqual([authGuard]);
    expect(checkoutRoute?.title).toBe('Shop API | Checkout');
  });

  it('routes account to the customer area and keeps it protected', () => {
    const accountRoute = routes[0]?.children?.find((route) => route.path === 'account');

    expect(accountRoute).toBeDefined();
    expect(accountRoute?.canActivate).toEqual([authGuard]);
    expect(accountRoute?.title).toBe('Shop API | Minha conta');
  });
});
