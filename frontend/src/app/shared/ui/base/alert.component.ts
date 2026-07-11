import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-alert',
  imports: [NgClass],
  template: `
    <aside [ngClass]="classes()" role="alert">
      @if (title()) {
        <p class="text-sm font-black uppercase tracking-[0.22em]">{{ title() }}</p>
      }

      <div class="text-sm leading-6">
        <ng-content />
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  readonly variant = input<AlertVariant>('info');
  readonly title = input<string>('');

  protected readonly classes = computed(() => {
    const base = 'rounded-2xl border px-4 py-3';
    const variants: Record<AlertVariant, string> = {
      info: 'border-shop-primary/20 bg-shop-primary-soft text-shop-text',
      success: 'border-shop-success/20 bg-shop-success-soft text-shop-text',
      warning: 'border-shop-warning/20 bg-shop-warning-soft text-shop-text',
      danger: 'border-shop-danger/20 bg-shop-danger-soft text-shop-text',
    };

    return [base, variants[this.variant()]];
  });
}
