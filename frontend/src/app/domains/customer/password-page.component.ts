import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-password-page',
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
                Alterar senha
              </h1>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-shop-text-muted lg:text-base">
                A rota para troca de senha ja esta disponivel. O formulario e a integracao com a API serao adicionados nesta etapa seguinte da area do cliente.
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
          <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">Progresso da tarefa</p>

          <div class="mt-4 rounded-2xl bg-shop-surface-muted px-4 py-4 text-sm leading-6 text-shop-text-muted">
            Nesta entrega, a pagina existe e esta protegida por autenticacao. Os campos de senha, validacoes e envio para a API serao implementados na proxima tarefa do backlog.
          </div>
        </article>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordPageComponent {}
