import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';

import { CustomerService } from '@core/customer/customer.service';
import { TokenStorageService } from '@core/auth/token-storage.service';
import { ButtonComponent } from '@shared/ui/base/button.component';
import { FormErrorComponent } from '@shared/ui/base/form-error.component';
import { InputComponent } from '@shared/ui/base/input.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';

import {
  createEmptyPasswordFormErrors,
  createEmptyPasswordFormValue,
  passwordFormSchema,
  type PasswordFormErrors,
  type PasswordFormValue,
} from './password-form.schema';

@Component({
  selector: 'app-password-page',
  imports: [RouterLink, ButtonComponent, FormErrorComponent, InputComponent, PageContainerComponent],
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
              [error]="getFieldError('senhaAtual')"
              (valueChange)="setField('senhaAtual', $event)"
            />

            <app-input
              label="Nova senha"
              type="password"
              autocomplete="new-password"
              placeholder="Crie uma nova senha"
              [required]="true"
              [value]="form().senhaNova"
              [error]="getFieldError('senhaNova')"
              (valueChange)="setField('senhaNova', $event)"
            />

            <app-input
              label="Confirmacao da senha"
              type="password"
              autocomplete="new-password"
              placeholder="Repita a nova senha"
              [required]="true"
              [value]="form().confirmacaoSenha"
              [error]="getFieldError('confirmacaoSenha')"
              (valueChange)="setField('confirmacaoSenha', $event)"
            />
          </div>

          <app-form-error class="mt-6 block" [error]="formErrorMessages()" />

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
export class PasswordPageComponent implements OnDestroy {
  private readonly customerService = inject(CustomerService);
  private readonly tokenStorage = inject(TokenStorageService);
  private passwordUpdateSubscription: Subscription | null = null;

  readonly formErrors = signal<PasswordFormErrors>(createEmptyPasswordFormErrors());
  readonly form = signal<PasswordFormValue>(createEmptyPasswordFormValue());

  handleSubmit(event: Event): void {
    event.preventDefault();

    const result = passwordFormSchema.validate(this.form());
    this.formErrors.set(result.errors);

    if (!result.success) {
      return;
    }

    const session = this.tokenStorage.getSession();
    const customerId = Number(session?.clienteId);

    if (!Number.isFinite(customerId)) {
      return;
    }

    this.passwordUpdateSubscription?.unsubscribe();
    this.passwordUpdateSubscription = this.customerService
      .updatePassword(customerId, {
        senhaAtual: this.form().senhaAtual,
        senhaNova: this.form().senhaNova,
      })
      .pipe(
        finalize(() => {
          this.passwordUpdateSubscription = null;
        }),
      )
      .subscribe({
        next: () => {
          this.form.set(createEmptyPasswordFormValue());
          this.formErrors.set(createEmptyPasswordFormErrors());
        },
        error: () => undefined,
      });
  }

  ngOnDestroy(): void {
    this.passwordUpdateSubscription?.unsubscribe();
  }

  setField(field: keyof PasswordFormValue, value: string): void {
    this.form.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  protected getFieldError(field: keyof PasswordFormErrors): string[] {
    return this.formErrors()[field];
  }

  protected formErrorMessages(): string[] {
    return Object.values(this.formErrors()).flat();
  }
}
