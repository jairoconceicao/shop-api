import { TestBed } from '@angular/core/testing';

import type { CartItem } from '@shared/models';

import { CartStore } from './cart.store';

describe('CartStore', () => {
  const item = (overrides: Partial<CartItem> = {}): CartItem => ({
    itemId: 1,
    produtoId: 10,
    quantidade: 1,
    valorUnitario: 25,
    ...overrides,
  });

  it('starts empty and exposes derived totals', () => {
    const store = TestBed.inject(CartStore);

    expect(store.isEmpty()).toBe(true);
    expect(store.hasCart()).toBe(false);
    expect(store.itemCount()).toBe(0);
    expect(store.subtotal()).toBe(0);
  });

  it('creates the active cart automatically and keeps creation idempotent', () => {
    const store = TestBed.inject(CartStore);

    store.ensureCart();
    store.ensureCart();

    expect(store.hasCart()).toBe(true);
    expect(store.items()).toEqual([]);
  });

  it('creates the active cart when the first item is added', () => {
    const store = TestBed.inject(CartStore);

    store.addItem(item());

    expect(store.hasCart()).toBe(true);
  });

  it('adds items and merges quantities for the same product', () => {
    const store = TestBed.inject(CartStore);

    store.addItem(item());
    store.addItem(item({ itemId: 2, quantidade: '2', valorUnitario: '25' }));

    expect(store.items()).toEqual([{ ...item(), quantidade: 3 }]);
    expect(store.itemCount()).toBe(3);
    expect(store.subtotal()).toBe(75);
  });

  it('updates and removes items, treating non-positive quantities as removal', () => {
    const store = TestBed.inject(CartStore);

    store.setItems([item(), item({ itemId: 2, produtoId: 20, valorUnitario: 10 })]);
    store.updateQuantity(10, 4);
    expect(store.items()[0].quantidade).toBe(4);

    store.updateQuantity(10, 0);
    expect(store.items()).toHaveLength(1);
    store.removeItem(2);
    expect(store.isEmpty()).toBe(true);
    expect(store.hasCart()).toBe(true);
  });

  it('clears the cart state and resets the active cart flag', () => {
    const store = TestBed.inject(CartStore);

    store.setItems([item()]);
    store.clear();

    expect(store.items()).toEqual([]);
    expect(store.isEmpty()).toBe(true);
    expect(store.hasCart()).toBe(false);
    expect(store.itemCount()).toBe(0);
    expect(store.subtotal()).toBe(0);
  });

  it('ignores invalid quantities when updating items', () => {
    const store = TestBed.inject(CartStore);

    store.setItems([item(), item({ itemId: 2, produtoId: 20, valorUnitario: 10 })]);
    store.updateQuantity(10, Number.NaN);

    expect(store.items()).toEqual([item({ itemId: 2, produtoId: 20, valorUnitario: 10 })]);
  });
});
