import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '@shared/ui/states/empty-state.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';

import { createOrdersPageContext } from './orders-page.context';

@Component({
  selector: 'app-orders-page',
  imports: [RouterLink, EmptyStateComponent, PageContainerComponent],
  template: `
    <app-page-container [wide]="true">
      <section class="space-y-6">
        <div class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-10">
          <span class="inline-flex rounded-full bg-shop-primary-soft px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-shop-primary">
            {{ context.eyebrow }}
          </span>

          <div class="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 class="text-3xl font-black tracking-tight text-shop-text lg:text-4xl">
                {{ context.title }}
              </h1>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-shop-text-muted lg:text-base">
                {{ context.description }}
              </p>
            </div>

            <a
              routerLink="/account"
              class="inline-flex items-center justify-center rounded-2xl border border-shop-border px-5 py-3 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
            >
              {{ context.accountLinkLabel }}
            </a>
          </div>
        </div>

        <app-empty-state
          [eyebrow]="context.emptyStateEyebrow"
          [title]="context.emptyStateTitle"
          [description]="context.emptyStateDescription"
        />
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPageComponent implements OnInit {
  protected readonly context = createOrdersPageContext();

  ngOnInit(): void {
    this.context.ensureCustomerProfileLoaded();
  }
}
