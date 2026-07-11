import { describe, expect, it } from 'vitest';

import { authGuard } from '@core/auth/auth.guard';

import { routes } from './app.routes';

describe('app routes', () => {
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

  it('routes account profile to the customer profile page and keeps it protected', () => {
    const profileRoute = routes[0]?.children?.find((route) => route.path === 'account/profile');

    expect(profileRoute).toBeDefined();
    expect(profileRoute?.canActivate).toEqual([authGuard]);
    expect(profileRoute?.title).toBe('Shop API | Meus dados');
  });

  it('routes account password to the password page and keeps it protected', () => {
    const passwordRoute = routes[0]?.children?.find((route) => route.path === 'account/password');

    expect(passwordRoute).toBeDefined();
    expect(passwordRoute?.canActivate).toEqual([authGuard]);
    expect(passwordRoute?.title).toBe('Shop API | Alterar senha');
  });

  it('routes account orders to the orders page and keeps it protected', () => {
    const ordersRoute = routes[0]?.children?.find((route) => route.path === 'account/orders');

    expect(ordersRoute).toBeDefined();
    expect(ordersRoute?.canActivate).toEqual([authGuard]);
    expect(ordersRoute?.title).toBe('Shop API | Meus pedidos');
  });

  it('routes account order detail to the order detail page and keeps it protected', () => {
    const orderDetailRoute = routes[0]?.children?.find((route) => route.path === 'account/orders/:pedidoId');

    expect(orderDetailRoute).toBeDefined();
    expect(orderDetailRoute?.canActivate).toEqual([authGuard]);
    expect(orderDetailRoute?.title).toBe('Shop API | Detalhe do pedido');
  });
});
