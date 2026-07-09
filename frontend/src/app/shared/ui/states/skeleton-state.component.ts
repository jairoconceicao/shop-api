import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-state',
  imports: [NgClass],
  template: `
    <section
      class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="space-y-2">
        <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">
          {{ eyebrow() }}
        </p>
        <div class="h-8 max-w-md rounded-2xl bg-shop-surface-muted" aria-hidden="true"></div>
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
        <div class="space-y-4 rounded-[1.75rem] border border-shop-border bg-shop-surface p-4">
          <div class="h-48 rounded-[1.35rem] bg-shop-surface-muted" aria-hidden="true"></div>
          @for (line of lines(); track $index) {
            <div
              class="h-4 rounded-full bg-shop-surface-muted animate-pulse"
              [ngClass]="line"
              aria-hidden="true"
            ></div>
          }
        </div>

        <div class="space-y-4 rounded-[1.75rem] border border-shop-border bg-shop-surface p-4">
          @for (block of sideBlocks(); track $index) {
            <div
              class="h-16 rounded-[1.1rem] bg-shop-surface-muted animate-pulse"
              [ngClass]="block"
              aria-hidden="true"
            ></div>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonStateComponent {
  readonly eyebrow = input('Carregando estrutura');
  readonly count = input(3);

  protected readonly lines = computed(() => {
    const widths = ['w-full', 'w-11/12', 'w-5/6', 'w-3/5'];
    return Array.from({ length: this.count() }, (_, index) => widths[index % widths.length]);
  });

  protected readonly sideBlocks = computed(() => ['w-full', 'w-5/6', 'w-2/3']);
}
