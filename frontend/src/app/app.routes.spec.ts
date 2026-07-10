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
});
