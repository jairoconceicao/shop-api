import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, PageContainerComponent],
  template: `
    <app-page-container>
      <section class="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-stretch">
        <article class="rounded-[2rem] bg-[linear-gradient(160deg,#0f172a_0%,#1e3a8a_55%,#f97316_180%)] p-6 text-shop-text-inverted shadow-soft lg:p-10">
          <span class="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Acesso do cliente</span>
          <h1 class="mt-5 text-3xl font-black tracking-tight lg:text-5xl">Bem-vindo de volta.</h1>
          <p class="mt-4 max-w-xl text-sm leading-7 text-white/78 lg:text-base">
            Esta tela-base prepara validacao, estados de erro e integracao do login sem bloquear a evolucao do restante
            do backlog.
          </p>
        </article>

        <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-10">
          <h2 class="text-2xl font-black tracking-tight text-shop-text">Entrar</h2>
          <p class="mt-2 text-sm text-shop-text-muted">Acesse sua conta para acompanhar pedidos e finalizar compras.</p>

          <form class="mt-8 space-y-4">
            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-shop-text">E-mail</span>
              <input type="email" placeholder="cliente@shopapi.dev" class="w-full rounded-2xl border border-shop-border bg-shop-background px-4 py-3 text-shop-text outline-none transition placeholder:text-shop-text-light focus:border-shop-primary" />
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-shop-text">Senha</span>
              <input type="password" placeholder="Sua senha" class="w-full rounded-2xl border border-shop-border bg-shop-background px-4 py-3 text-shop-text outline-none transition placeholder:text-shop-text-light focus:border-shop-primary" />
            </label>

            <label class="flex items-center gap-3 text-sm text-shop-text-muted">
              <input type="checkbox" class="h-4 w-4 rounded border-shop-border text-shop-primary" />
              Manter-me conectado
            </label>

            <button type="button" class="w-full rounded-2xl bg-shop-primary px-4 py-3 text-sm font-bold text-shop-text-inverted shadow-[0_18px_34px_rgba(37,99,235,0.22)] transition hover:bg-shop-primary-hover">Entrar</button>
          </form>

          <div class="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <a routerLink="/" class="text-shop-primary transition hover:text-shop-primary-hover">Voltar para home</a>
            <a routerLink="/products" class="text-shop-text-muted transition hover:text-shop-primary">Explorar catalogo</a>
          </div>
        </article>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {}
