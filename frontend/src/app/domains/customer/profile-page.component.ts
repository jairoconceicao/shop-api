import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CustomerStore } from './customer.store';
import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-profile-page',
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
                Meus dados
              </h1>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-shop-text-muted lg:text-base">
                Consulte as informações cadastrais usadas na sua conta Shop API.
              </p>
            </div>

            <a
              routerLink="/account"
              class="inline-flex items-center justify-center rounded-2xl border border-shop-border px-5 py-3 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
            >
              Voltar para conta
            </a>
          </div>
        </div>

        <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-8">
          <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">Dados do cliente</p>

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

            <div class="rounded-2xl bg-shop-surface-muted p-4 sm:col-span-2">
              <dt class="text-sm font-medium text-shop-text-muted">Endereço</dt>
              <dd class="mt-1 text-base font-bold text-shop-text">{{ customerAddress() }}</dd>
            </div>

            <div class="rounded-2xl bg-shop-surface-muted p-4 sm:col-span-2">
              <dt class="text-sm font-medium text-shop-text-muted">Nascimento</dt>
              <dd class="mt-1 text-base font-bold text-shop-text">{{ customerBirthDate() }}</dd>
            </div>
          </dl>
        </article>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  private readonly customerStore = inject(CustomerStore);

  protected readonly customerName = computed(() => this.customerStore.displayName() || 'Cliente');
  protected readonly customerEmail = computed(() => this.customerStore.email() || 'E-mail nao carregado');
  protected readonly customerCpf = computed(() => this.customerStore.cpf() || 'Nao informado');
  protected readonly customerPhone = computed(() => this.customerStore.primaryPhone() || 'Nao informado');
  protected readonly customerAddress = computed(() => {
    const address = this.customerStore.profile()?.endereco;
    if (!address) {
      return 'Nao informado';
    }

    const complement = address.complemento?.trim();
    return [address.logradouro, address.numero, complement, address.bairro, address.cidade, address.uf]
      .filter((value): value is string => Boolean(value))
      .join(', ');
  });
  protected readonly customerBirthDate = computed(() => this.customerStore.profile()?.dataNascimento ?? 'Nao informado');

  ngOnInit(): void {
    this.customerStore.loadProfile();
  }
}
