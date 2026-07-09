import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  template: `
    <section
      class="rounded-[2rem] border border-shop-danger/20 bg-white p-6 shadow-soft"
      role="alert"
      aria-live="assertive"
    >
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-100 text-shop-danger" aria-hidden="true">
        <span class="text-3xl font-black leading-none">!</span>
      </div>

      <div class="mt-5 space-y-2 text-center">
        <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-danger">
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

      @if (details()) {
        <div class="mx-auto mt-6 max-w-2xl rounded-2xl border border-shop-danger/20 bg-shop-danger/10 px-4 py-3 text-sm text-shop-danger">
          {{ details() }}
        </div>
      }

      @if (hasProjectedContent) {
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <ng-content />
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  readonly eyebrow = input('Erro');
  readonly title = input('Algo deu errado');
  readonly description = input('');
  readonly details = input('');
  readonly hasProjectedContent = true;
}
