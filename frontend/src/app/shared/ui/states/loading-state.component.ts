import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  template: `
    <section
      class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="flex items-center gap-4">
        <div class="flex size-14 items-center justify-center rounded-2xl bg-shop-primary-soft text-shop-primary">
          <span
            class="h-7 w-7 animate-spin rounded-full border-4 border-shop-primary/20 border-t-shop-primary"
            aria-hidden="true"
          ></span>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-primary">
            {{ eyebrow() }}
          </p>
          <h2 class="text-xl font-black tracking-tight text-shop-text">
            {{ title() }}
          </h2>
          @if (description()) {
            <p class="max-w-2xl text-sm leading-6 text-shop-text-muted">
              {{ description() }}
            </p>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  readonly eyebrow = input('Carregando');
  readonly title = input('Carregando conteúdo');
  readonly description = input('');
}
