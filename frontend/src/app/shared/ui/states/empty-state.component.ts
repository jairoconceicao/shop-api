import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <section
      class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft"
      role="status"
      aria-live="polite"
    >
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl border border-dashed border-shop-primary/30 bg-shop-primary-soft text-2xl font-black text-shop-primary" aria-hidden="true">
        0
      </div>

      <div class="mt-5 space-y-2 text-center">
        <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-primary">
          {{ eyebrow() }}
        </p>
        <h2 class="text-2xl font-black tracking-tight text-shop-text">
          {{ title() }}
        </h2>
        @if (description()) {
          <p class="mx-auto max-w-2xl text-sm leading-6 text-shop-text-muted">
            {{ description() }}
          </p>
        }
      </div>

      @if (hasProjectedContent) {
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <ng-content />
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly eyebrow = input('Sem resultados');
  readonly title = input('Nada encontrado');
  readonly description = input('');
  readonly hasProjectedContent = true;
}
