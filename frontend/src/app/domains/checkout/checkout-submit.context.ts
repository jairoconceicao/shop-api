import { computed, inject, signal, type Signal } from '@angular/core';
import type { Subscription } from 'rxjs';

import { OrderService } from '@core/order/order.service';
import { type NormalizedApiError } from '@shared/api';
import type { CartItem, CreateOrderRequest, CustomerAddress, OrderCreated, PaymentMethod } from '@shared/models';

export interface CheckoutSubmitState {
  readonly isSubmitting: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly fieldErrors: Signal<readonly string[]>;
  readonly success: Signal<boolean>;
  readonly createdOrder: Signal<OrderCreated | null>;
  readonly canSubmit: Signal<boolean>;
  submit(request: {
    deliveryAddress: Signal<CustomerAddress>;
    paymentMethod: Signal<PaymentMethod>;
    items: Signal<readonly CartItem[]>;
  }): void;
}

export function createCheckoutSubmitState(): CheckoutSubmitState {
  const orderService = inject(OrderService);
  const isSubmitting = signal(false);
  const error = signal<string | null>(null);
  const fieldErrors = signal<readonly string[]>([]);
  const success = signal(false);
  const createdOrder = signal<OrderCreated | null>(null);
  let subscription: Subscription | undefined;

  return {
    isSubmitting,
    error,
    fieldErrors,
    success,
    createdOrder,
    canSubmit: computed(() => !isSubmitting() && !success()),
    submit(request) {
      const items = request.items();

      if (isSubmitting() || items.length === 0) {
        error.set('Seu carrinho está vazio. Adicione produtos antes de continuar.');
        fieldErrors.set([]);
        return;
      }

      isSubmitting.set(true);
      error.set(null);
      fieldErrors.set([]);
      success.set(false);
      subscription?.unsubscribe();

      const payload: CreateOrderRequest = {
        enderecoEntrega: request.deliveryAddress(),
        formaPagamento: request.paymentMethod(),
        dataPedido: new Date().toISOString(),
        items: items.map((item) => ({
          itemId: item.itemId,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
        })),
      };

      subscription = orderService.create(payload).subscribe({
        next: (order) => {
          createdOrder.set(order);
          success.set(true);
          isSubmitting.set(false);
        },
        error: (submissionError: unknown) => {
          const resolvedError = resolveCheckoutSubmitError(submissionError);
          error.set(resolvedError.message);
          fieldErrors.set(resolvedError.fieldErrors);
          isSubmitting.set(false);
        },
      });
    },
  };
}

function resolveCheckoutSubmitError(error: unknown): { message: string; fieldErrors: readonly string[] } {
  if (!isNormalizedApiError(error)) {
    return {
      message: 'Não foi possível criar o pedido. Tente novamente.',
      fieldErrors: [],
    };
  }

  if (isProductUnavailableError(error)) {
    return {
      message: 'Alguns produtos ficaram indisponíveis ou sem estoque. Atualize o carrinho e tente novamente.',
      fieldErrors: [],
    };
  }

  if (isValidationError(error)) {
    return {
      message: 'Revise os campos destacados e tente novamente.',
      fieldErrors: extractFieldErrors(error),
    };
  }

  return {
    message: error.message,
    fieldErrors: [],
  };
}

function isProductUnavailableError(error: NormalizedApiError): boolean {
  const haystack = `${error.code} ${error.message} ${stringifyDetails(error.details)}`.toLowerCase();

  return (
    haystack.includes('indispon') ||
    haystack.includes('estoque') ||
    haystack.includes('out_of_stock') ||
    error.status === 409
  );
}

function isValidationError(error: NormalizedApiError): boolean {
  return error.status === 422 || error.code.toUpperCase().includes('VALIDATION');
}

function extractFieldErrors(error: NormalizedApiError): readonly string[] {
  const details = error.details;
  const messages = new Set<string>();

  if (Array.isArray(details)) {
    for (const item of details) {
      if (typeof item === 'string' && item.trim()) {
        messages.add(item.trim());
        continue;
      }

      if (item && typeof item === 'object') {
        const candidate = item as { message?: unknown };
        if (typeof candidate.message === 'string' && candidate.message.trim()) {
          messages.add(candidate.message.trim());
        }
      }
    }
  } else if (details && typeof details === 'object') {
    for (const value of Object.values(details)) {
      if (typeof value === 'string' && value.trim()) {
        messages.add(value.trim());
        continue;
      }

      if (Array.isArray(value)) {
        for (const entry of value) {
          if (typeof entry === 'string' && entry.trim()) {
            messages.add(entry.trim());
          }
        }
      }
    }
  } else if (typeof details === 'string' && details.trim()) {
    messages.add(details.trim());
  }

  return [...messages];
}

function stringifyDetails(details: NormalizedApiError['details']): string {
  if (typeof details === 'string') {
    return details;
  }

  if (Array.isArray(details)) {
    return details
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join(' ');
  }

  return details ? JSON.stringify(details) : '';
}

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'status' in error &&
      'code' in error &&
      'message' in error &&
      typeof (error as { status?: unknown }).status === 'number' &&
      typeof (error as { code?: unknown }).code === 'string' &&
      typeof (error as { message?: unknown }).message === 'string',
  );
}
