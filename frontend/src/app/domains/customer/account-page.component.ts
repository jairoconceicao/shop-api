import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CustomerStore } from './customer.store';
import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-account-page',
  imports: [RouterLink, PageContainerComponent],
  template: `
    <app-page-container [wide]="true">
      <section class="space-y-6">
        <div class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-10">
          <span class="inline-flex rounded-full bg-shop-primary-soft px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-shop-primary">
            Conta
          </span>

          <div class="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 class="text-3xl font-black tracking-tight text-shop-text lg:text-4xl">
                {{ accountTitle() }}
              </h1>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-shop-text-muted lg:text-base">
                Gerencie seus dados pessoais, ajuste sua senha e acompanhe seus pedidos em um unico lugar.
              </p>
            </div>

            <a
              routerLink="/"
              class="inline-flex items-center justify-center rounded-2xl border border-shop-border px-5 py-3 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
            >
              Voltar para home
            </a>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside class="rounded-[2rem] border border-shop-border bg-white p-5 shadow-soft">
            <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">Menu da conta</p>

            <nav class="mt-4 space-y-2" aria-label="Menu da area do cliente">
              <a
                routerLink="/account/profile"
                class="block rounded-2xl bg-shop-surface-muted px-4 py-3 font-semibold text-shop-text transition hover:bg-shop-primary-soft hover:text-shop-primary"
              >
                Meus dados
              </a>
              <a
                routerLink="/account/password"
                class="block rounded-2xl bg-shop-surface-muted px-4 py-3 font-semibold text-shop-text transition hover:bg-shop-primary-soft hover:text-shop-primary"
              >
                Alterar senha
              </a>
              <a
                routerLink="/account/orders"
                class="block rounded-2xl bg-shop-surface-muted px-4 py-3 font-semibold text-shop-text transition hover:bg-shop-primary-soft hover:text-shop-primary"
              >
                Meus pedidos
              </a>
              <button
                type="button"
                class="block w-full rounded-2xl bg-shop-danger-soft px-4 py-3 text-left font-semibold text-shop-danger transition hover:opacity-90"
              >
                Sair da conta
              </button>
            </nav>
          </aside>

          <div class="space-y-6">
            <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-8">
              <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">Resumo da conta</p>

              <dl class="mt-5 grid gap-4 sm:grid-cols-2">
                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <dt class="text-sm font-medium text-shop-text-muted">Nome</dt>
                  <dd class="mt-1 text-base font-bold text-shop-text">{{ customerName() }}</dd>
                </div>

                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <dt class="text-sm font-medium text-shop-text-muted">E-mail</dt>
                  <dd class="mt-1 text-base font-bold text-shop-text">{{ customerEmail() }}</dd>
                </div>

                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <dt class="text-sm font-medium text-shop-text-muted">CPF</dt>
                  <dd class="mt-1 text-base font-bold text-shop-text">{{ customerCpf() }}</dd>
                </div>

                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <dt class="text-sm font-medium text-shop-text-muted">Telefone</dt>
                  <dd class="mt-1 text-base font-bold text-shop-text">{{ customerPhone() }}</dd>
                </div>
              </dl>
            </article>

            <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-8">
              <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">Atalhos</p>

              <div class="mt-5 grid gap-3 sm:grid-cols-3">
                <a
                  routerLink="/account/profile"
                  class="rounded-2xl border border-shop-border bg-shop-surface-muted px-4 py-4 font-semibold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
                >
                  Atualizar dados
                </a>
                <a
                  routerLink="/account/password"
                  class="rounded-2xl border border-shop-border bg-shop-surface-muted px-4 py-4 font-semibold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
                >
                  Trocar senha
                </a>
                <a
                  routerLink="/account/orders"
                  class="rounded-2xl border border-shop-border bg-shop-surface-muted px-4 py-4 font-semibold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
                >
                  Ver pedidos
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPageComponent {
  private readonly customerStore = inject(CustomerStore);

  protected readonly customerName = computed(() => this.customerStore.displayName() || 'Cliente');
  protected readonly customerEmail = computed(() => this.customerStore.email() || 'E-mail nao carregado');
  protected readonly customerCpf = computed(() => this.customerStore.cpf() || 'Nao informado');
  protected readonly customerPhone = computed(() => this.customerStore.primaryPhone() || 'Nao informado');

  protected readonly accountTitle = computed(() => {
    const name = this.customerName().trim();
    return name && name !== 'Cliente' ? `Minha conta, ${name}` : 'Minha conta';
  });
}
