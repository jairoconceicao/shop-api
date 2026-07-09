import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-success-state',
  template: `
    <section
      class="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-soft"
      role="status"
      aria-live="polite"
    >
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700" aria-hidden="true">
        <span class="h-4 w-6 rounded-full border-b-4 border-r-4 border-current rotate-[-45deg] translate-y-[-1px]"></span>
      </div>

      <div class="mt-5 space-y-2 text-center">
        <p class="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
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
export class SuccessStateComponent {
  readonly eyebrow = input('Sucesso');
  readonly title = input('Tudo certo');
  readonly description = input('');
  readonly hasProjectedContent = true;
}
