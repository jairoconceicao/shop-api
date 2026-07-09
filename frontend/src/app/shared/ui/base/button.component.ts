import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  imports: [NgClass],
  template: `
    <button
      [attr.type]="type()"
      [disabled]="disabled()"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      [ngClass]="classes()"
    >
      <ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60';
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-shop-primary text-shop-text-inverted shadow-[0_18px_34px_rgba(37,99,235,0.22)] hover:bg-shop-primary-hover',
      secondary:
        'bg-shop-secondary text-shop-text-inverted shadow-[0_18px_34px_rgba(249,115,22,0.22)] hover:bg-shop-secondary-hover',
      outline: 'border border-shop-border bg-white text-shop-text hover:border-shop-primary hover:text-shop-primary',
      ghost: 'bg-transparent text-shop-text-muted hover:bg-shop-surface-muted hover:text-shop-text',
    };
    const sizes: Record<ButtonSize, string> = {
      sm: 'rounded-xl px-4 py-2 text-sm',
      md: 'rounded-2xl px-5 py-3 text-sm',
      lg: 'rounded-2xl px-6 py-3.5 text-base',
    };

    return [
      base,
      variants[this.variant()],
      sizes[this.size()],
      this.block() ? 'w-full' : '',
    ];
  });
}
