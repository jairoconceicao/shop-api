import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';

import { CustomerService } from '@core/customer/customer.service';
import { TokenStorageService } from '@core/auth/token-storage.service';
import { type NormalizedApiError } from '@shared/api';
import { ButtonComponent } from '@shared/ui/base/button.component';
import { FormErrorComponent } from '@shared/ui/base/form-error.component';
import { InputComponent } from '@shared/ui/base/input.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';
import { ErrorStateComponent } from '@shared/ui/states/error-state.component';
import { SuccessStateComponent } from '@shared/ui/states/success-state.component';

import {
  createEmptyPasswordFormErrors,
  createEmptyPasswordFormValue,
  passwordFormSchema,
  type PasswordFormErrors,
  type PasswordFormValue,
} from './password-form.schema';

@Component({
  selector: 'app-password-page',
  imports: [
    RouterLink,
    ButtonComponent,
    FormErrorComponent,
    InputComponent,
    PageContainerComponent,
    ErrorStateComponent,
    SuccessStateComponent,
  ],
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

        @if (successMessage()) {
          <app-success-state
            eyebrow="Senha atualizada"
            title="Sua senha foi alterada"
            [description]="successMessage() ?? ''"
          />
        }

        @if (submissionError()) {
          <app-error-state
            eyebrow="Nao foi possivel concluir"
            title="Verifique os dados informados"
            description="Corrija os campos destacados ou confirme a senha atual e tente novamente."
            [details]="submissionError() ?? ''"
          />
        }

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
            <app-button type="submit" size="lg" [block]="true" [disabled]="isSaving()">
              @if (isSaving()) {
                Salvando...
              } @else {
                Salvar senha
              }
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
  readonly isSaving = signal(false);
  readonly submissionError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  private readonly submitAttempted = signal(false);
  private readonly hasValidationErrors = computed(() => {
    if (!this.submitAttempted()) {
      return false;
    }

    return Object.values(this.formErrors()).some((messages) => messages.length > 0);
  });

  handleSubmit(event: Event): void {
    event.preventDefault();
    if (this.isSaving()) {
      return;
    }

    this.submitAttempted.set(true);

    const result = passwordFormSchema.validate(this.form());
    this.formErrors.set(result.errors);
    this.submissionError.set(null);
    this.successMessage.set(null);

    if (!result.success) {
      return;
    }

    const session = this.tokenStorage.getSession();
    const customerId = Number(session?.clienteId);

    if (!Number.isFinite(customerId)) {
      return;
    }

    this.isSaving.set(true);
    this.passwordUpdateSubscription?.unsubscribe();
    this.passwordUpdateSubscription = this.customerService
      .updatePassword(customerId, {
        senhaAtual: this.form().senhaAtual,
        senhaNova: this.form().senhaNova,
      })
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
          this.passwordUpdateSubscription = null;
        }),
      )
      .subscribe({
        next: () => {
          this.form.set(createEmptyPasswordFormValue());
          this.formErrors.set(createEmptyPasswordFormErrors());
          this.successMessage.set('Sua senha foi atualizada com sucesso. Use a nova senha no próximo acesso.');
        },
        error: (error: unknown) => {
          const resolved = resolvePasswordUpdateError(error);
          this.submissionError.set(resolved.message);
          this.formErrors.set(resolved.fieldErrors);
        },
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
    return this.hasValidationErrors() ? Object.values(this.formErrors()).flat() : [];
  }
}

function resolvePasswordUpdateError(error: unknown): { message: string; fieldErrors: PasswordFormErrors } {
  if (!isNormalizedApiError(error)) {
    return {
      message: 'Nao foi possivel atualizar a senha. Tente novamente.',
      fieldErrors: createEmptyPasswordFormErrors(),
    };
  }

  if (isValidationError(error)) {
    return {
      message: 'Revise os campos destacados e tente novamente.',
      fieldErrors: extractFieldErrors(error),
    };
  }

  if (isCurrentPasswordError(error)) {
    return {
      message: 'A senha atual informada esta incorreta. Verifique os dados e tente novamente.',
      fieldErrors: {
        ...createEmptyPasswordFormErrors(),
        senhaAtual: ['A senha atual informada esta incorreta.'],
      },
    };
  }

  return {
    message: error.message,
    fieldErrors: createEmptyPasswordFormErrors(),
  };
}

function isValidationError(error: NormalizedApiError): boolean {
  return error.status === 422 || error.code.toUpperCase().includes('VALIDATION');
}

function isCurrentPasswordError(error: NormalizedApiError): boolean {
  const haystack = `${error.code} ${error.message} ${stringifyDetails(error.details)}`.toLowerCase();

  return (
    error.status === 401 ||
    error.status === 403 ||
    haystack.includes('senha atual') ||
    haystack.includes('senha incorreta') ||
    haystack.includes('senha invalida') ||
    haystack.includes('current password')
  );
}

function extractFieldErrors(error: NormalizedApiError): PasswordFormErrors {
  const errors = createEmptyPasswordFormErrors();
  const details = error.details;

  if (details && typeof details === 'object' && !Array.isArray(details)) {
    for (const [field, value] of Object.entries(details)) {
      if (!isPasswordFormField(field)) {
        continue;
      }

      errors[field].push(...normalizeMessages(value));
    }
  } else {
    errors.senhaAtual.push(...normalizeMessages(details));
  }

  if (errors.senhaAtual.length === 0 && isCurrentPasswordError(error)) {
    errors.senhaAtual.push('A senha atual informada esta incorreta.');
  }

  return errors;
}

function normalizeMessages(value: unknown): string[] {
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function stringifyDetails(details: NormalizedApiError['details']): string {
  if (typeof details === 'string') {
    return details;
  }

  if (Array.isArray(details)) {
    return details
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join(' ');
  }

  return details ? JSON.stringify(details) : '';
}

function isPasswordFormField(value: string): value is keyof PasswordFormErrors {
  return value === 'senhaAtual' || value === 'senhaNova' || value === 'confirmacaoSenha';
}

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'status' in error &&
      'code' in error &&
      'message' in error &&
      typeof (error as { status?: unknown }).status === 'number' &&
      typeof (error as { code?: unknown }).code === 'string' &&
      typeof (error as { message?: unknown }).message === 'string',
  );
}
