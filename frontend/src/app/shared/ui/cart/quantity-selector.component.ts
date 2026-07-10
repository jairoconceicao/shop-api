import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-quantity-selector',
  template: `
    <div class="inline-flex items-center rounded-2xl border border-shop-border bg-white">
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-l-2xl text-lg font-black text-shop-text transition hover:bg-shop-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        [disabled]="disabled() || quantity() <= min()"
        (click)="decrease()"
        aria-label="Diminuir quantidade"
      >
        -
      </button>

      <span class="min-w-12 px-3 text-center text-sm font-bold text-shop-text">
        {{ quantity() }}
      </span>

      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-r-2xl text-lg font-black text-shop-text transition hover:bg-shop-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        [disabled]="disabled() || quantity() >= max()"
        (click)="increase()"
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantitySelectorComponent {
  readonly quantity = input(1);
  readonly min = input(1);
  readonly max = input(Number.POSITIVE_INFINITY);
  readonly step = input(1);
  readonly disabled = input(false);

  readonly quantityChange = output<number>();

  protected readonly canDecrease = computed(() => this.quantity() > this.min());
  protected readonly canIncrease = computed(() => this.quantity() < this.max());

  protected decrease(): void {
    if (!this.canDecrease()) {
      return;
    }

    this.quantityChange.emit(Math.max(this.min(), this.quantity() - this.step()));
  }

  protected increase(): void {
    if (!this.canIncrease()) {
      return;
    }

    this.quantityChange.emit(Math.min(this.max(), this.quantity() + this.step()));
  }
}
