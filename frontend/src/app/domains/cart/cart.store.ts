import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import type { CartItem, EntityId } from '@shared/models';

interface CartState {
  readonly items: readonly CartItem[];
  readonly hasActiveCart: boolean;
}

const initialState: CartState = { items: [], hasActiveCart: false };

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items, hasActiveCart }) => ({
    itemCount: computed(() =>
      items().reduce((total, item) => total + toNumber(item.quantidade), 0),
    ),
    subtotal: computed(() =>
      items().reduce(
        (total, item) => total + toNumber(item.quantidade) * toNumber(item.valorUnitario),
        0,
      ),
    ),
    isEmpty: computed(() => items().length === 0),
    hasCart: computed(() => hasActiveCart()),
  })),
  withMethods((store) => ({
    ensureCart(): void {
      if (!store.hasActiveCart()) {
        patchState(store, { hasActiveCart: true });
      }
    },

    setItems(items: readonly CartItem[]): void {
      patchState(store, { items: [...items], hasActiveCart: true });
    },

    addItem(item: CartItem): void {
      if (!store.hasActiveCart()) {
        patchState(store, { hasActiveCart: true });
      }
      const existingItem = store.items().find((current) => current.produtoId === item.produtoId);

      if (!existingItem) {
        patchState(store, { items: [...store.items(), item] });
        return;
      }

      patchState(store, {
        items: store
          .items()
          .map((current) =>
            current.produtoId === item.produtoId
              ? { ...current, quantidade: toNumber(current.quantidade) + toNumber(item.quantidade) }
              : current,
          ),
      });
    },

    updateQuantity(produtoId: EntityId, quantidade: number): void {
      if (quantidade <= 0 || !Number.isFinite(quantidade)) {
        patchState(store, { items: store.items().filter((item) => item.produtoId !== produtoId) });
        return;
      }

      patchState(store, {
        items: store
          .items()
          .map((item) => (item.produtoId === produtoId ? { ...item, quantidade } : item)),
      });
    },

    removeItem(produtoId: EntityId): void {
      patchState(store, { items: store.items().filter((item) => item.produtoId !== produtoId) });
    },

    clear(): void {
      patchState(store, initialState);
    },
  })),
);

function toNumber(value: number | string): number {
  const result = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(result) ? result : 0;
}
