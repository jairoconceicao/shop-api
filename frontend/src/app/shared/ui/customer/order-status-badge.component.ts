import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { OrderStatus } from '@shared/models';

type OrderStatusVariant = 'neutral' | 'info' | 'success' | 'danger';

@Component({
  selector: 'app-order-status-badge',
  imports: [NgClass],
  template: `
    <span [ngClass]="classes()" aria-label="Status do pedido">
      {{ label() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusBadgeComponent {
  readonly status = input<OrderStatus | string>('');

  protected readonly label = computed(() => this.resolveLabel(this.status()));
  protected readonly classes = computed(() => {
    const base = 'inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.22em]';
    const variants: Record<OrderStatusVariant, string> = {
      neutral: 'bg-shop-surface-muted text-shop-text',
      info: 'bg-shop-primary-soft text-shop-primary',
      success: 'bg-shop-success-soft text-shop-success',
      danger: 'bg-shop-danger-soft text-shop-danger',
    };

    return [base, variants[this.resolveVariant(this.status())]];
  });

  private resolveLabel(status: OrderStatus | string): string {
    const normalized = this.normalizeStatus(status);

    const labels: Record<OrderStatus, string> = {
      Criado: 'Criado',
      EmProcessamento: 'Em processamento',
      Processado: 'Processado',
      Cancelado: 'Cancelado',
      Devolvido: 'Devolvido',
    };

    return normalized ? labels[normalized] : status || 'Status indefinido';
  }

  private resolveVariant(status: OrderStatus | string): OrderStatusVariant {
    const normalized = this.normalizeStatus(status);

    if (normalized === 'Cancelado') {
      return 'danger';
    }

    if (normalized === 'Processado') {
      return 'success';
    }

    if (normalized === 'EmProcessamento') {
      return 'info';
    }

    return 'neutral';
  }

  private normalizeStatus(status: OrderStatus | string): OrderStatus | null {
    const normalized = status.replace(/\s+/g, '');

    switch (normalized) {
      case 'Criado':
      case 'EmProcessamento':
      case 'Processado':
      case 'Cancelado':
      case 'Devolvido':
        return normalized;
      default:
        return null;
    }
  }
}
