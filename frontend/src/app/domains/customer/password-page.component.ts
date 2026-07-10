import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@shared/ui/base/button.component';
import { InputComponent } from '@shared/ui/base/input.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';

import { createEmptyPasswordFormValue, type PasswordFormValue } from './password-form.context';

@Component({
  selector: 'app-password-page',
  imports: [RouterLink, ButtonComponent, InputComponent, PageContainerComponent],
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
                Atualize sua senha de acesso informando a senha atual, a nova senha e a confirmacao.
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

        <form class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-8" (submit)="handleSubmit($event)" novalidate>
          <div class="grid gap-4 lg:grid-cols-3">
            <app-input
              label="Senha atual"
              type="password"
              autocomplete="current-password"
              placeholder="Digite sua senha atual"
              [required]="true"
              [value]="form().senhaAtual"
              (valueChange)="setField('senhaAtual', $event)"
            />

            <app-input
              label="Nova senha"
              type="password"
              autocomplete="new-password"
              placeholder="Crie uma nova senha"
              [required]="true"
              [value]="form().senhaNova"
              (valueChange)="setField('senhaNova', $event)"
            />

            <app-input
              label="Confirmacao da senha"
              type="password"
              autocomplete="new-password"
              placeholder="Repita a nova senha"
              [required]="true"
              [value]="form().confirmacaoSenha"
              (valueChange)="setField('confirmacaoSenha', $event)"
            />
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <app-button type="submit" size="lg" [block]="true">
              Salvar senha
            </app-button>
          </div>
        </form>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordPageComponent {
  readonly form = signal<PasswordFormValue>(createEmptyPasswordFormValue());

  handleSubmit(event: Event): void {
    event.preventDefault();
  }

  setField(field: keyof PasswordFormValue, value: string): void {
    this.form.update((current) => ({
      ...current,
      [field]: value,
    }));
  }
}
