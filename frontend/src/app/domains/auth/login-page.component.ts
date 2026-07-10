import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { type NormalizedApiError } from '@shared/api';
import { ButtonComponent } from '@shared/ui/base/button.component';
import { CheckboxComponent } from '@shared/ui/base/checkbox.component';
import { FormErrorComponent } from '@shared/ui/base/form-error.component';
import { InputComponent } from '@shared/ui/base/input.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';
import { ErrorStateComponent } from '@shared/ui/states/error-state.component';
import { LoadingStateComponent } from '@shared/ui/states/loading-state.component';
import { SuccessStateComponent } from '@shared/ui/states/success-state.component';

import {
  createEmptyLoginFormErrors,
  loginFormSchema,
  normalizeLoginFormValue,
  type LoginFormErrors,
  type LoginFormValue,
} from './login-form.schema';

@Component({
  selector: 'app-login-page',
  imports: [
    RouterLink,
    PageContainerComponent,
    InputComponent,
    CheckboxComponent,
    ButtonComponent,
    FormErrorComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    SuccessStateComponent,
  ],
  template: `
    <app-page-container>
      <section class="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-stretch">
        <article class="rounded-[2rem] bg-[linear-gradient(160deg,#0f172a_0%,#1e3a8a_55%,#f97316_180%)] p-6 text-shop-text-inverted shadow-soft lg:p-10">
          <span class="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Acesso do cliente</span>
          <h1 class="mt-5 text-3xl font-black tracking-tight lg:text-5xl">Acesse sua conta.</h1>
          <p class="mt-4 max-w-xl text-sm leading-7 text-white/78 lg:text-base">
            Entre com seus dados e mantenha o acesso pronto para finalizar compras, consultar pedidos e evoluir a
            sessao do cliente.
          </p>
        </article>

        <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-10">
          <h2 class="text-2xl font-black tracking-tight text-shop-text">Entrar</h2>
          <p class="mt-2 text-sm text-shop-text-muted">
            Use o e-mail cadastrado e a senha da conta para acessar sua area do cliente.
          </p>

          @if (loginSuccess()) {
            <app-success-state
              class="mt-8 block"
              eyebrow="Login realizado"
              title="Sessao iniciada"
              [description]="successDescription()"
            >
              <a
                routerLink="/"
                class="rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover"
              >
                Ir para home
              </a>
              <a
                routerLink="/products"
                class="rounded-2xl border border-shop-border px-5 py-3 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
              >
                Explorar catalogo
              </a>
            </app-success-state>
          } @else {
            @if (isLoading()) {
              <app-loading-state
                class="mt-8 block"
                eyebrow="Autenticando"
                title="Entrando na sua conta"
                description="Estamos validando seus dados e preparando sua sessao."
              />
            }

            @if (loginError()) {
              <app-error-state
                class="mt-8 block"
                eyebrow="Falha no login"
                title="Nao foi possivel entrar"
                description="Confira seus dados e tente novamente."
                [details]="loginError() ?? ''"
              />
            }

            <form class="mt-8 space-y-4" (submit)="handleSubmit($event)">
              <app-input
                label="E-mail"
                type="email"
                autocomplete="email"
                placeholder="cliente@shopapi.dev"
                [value]="email()"
                [error]="emailError()"
                [disabled]="isLoading()"
                (valueChange)="email.set($event)"
              />

              <app-input
                label="Senha"
                type="password"
                autocomplete="current-password"
                placeholder="Sua senha"
                [value]="senha()"
                [error]="senhaError()"
                [disabled]="isLoading()"
                (valueChange)="senha.set($event)"
              />

              <app-checkbox
                label="Manter-me conectado"
                hint="Mantem a sessao ativa neste dispositivo."
                [checked]="rememberMe()"
                [disabled]="isLoading()"
                (checkedChange)="rememberMe.set($event)"
              />

              @if (formError()) {
                <app-form-error [error]="formError()" />
              }

              <app-button type="submit" size="lg" [block]="true" [disabled]="isLoading()">
                @if (isLoading()) {
                  Entrando...
                } @else {
                  Entrar
                }
              </app-button>
            </form>
          }

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
export class LoginPageComponent {
  private readonly authService = inject(AuthService);

  readonly email = signal('');
  readonly senha = signal('');
  readonly rememberMe = signal(false);
  readonly isLoading = signal(false);
  readonly loginSuccess = signal(false);

  private readonly submitAttempted = signal(false);
  private readonly validationErrors = signal<LoginFormErrors>(createEmptyLoginFormErrors());
  protected readonly loginError = signal<string | null>(null);
  private readonly successSession = signal<{
    email: string;
  } | null>(null);

  protected readonly emailError = computed(() => {
    if (!this.submitAttempted()) {
      return null;
    }

    return this.validationErrors().email[0] ?? null;
  });

  protected readonly senhaError = computed(() => {
    if (!this.submitAttempted()) {
      return null;
    }

    return this.validationErrors().senha[0] ?? null;
  });

  protected readonly formError = computed(() => {
    if (!this.submitAttempted()) {
      return null;
    }

    const messages = [...this.validationErrors().email, ...this.validationErrors().senha];

    return messages.length > 0 ? messages : null;
  });

  protected readonly successDescription = computed(() => {
    const session = this.successSession();

    if (!session) {
      return 'Sua conta foi autenticada com sucesso.';
    }

    return `A conta ${session.email} foi autenticada com sucesso. Sua sessao ja esta pronta para continuar a navegacao.`;
  });

  handleSubmit(event: Event): void {
    event.preventDefault();
    if (this.isLoading() || this.loginSuccess()) {
      return;
    }

    this.submitAttempted.set(true);

    const candidate: LoginFormValue = {
      email: this.email(),
      senha: this.senha(),
      lembrarMe: this.rememberMe(),
    };

    const result = loginFormSchema.validate(candidate);
    this.validationErrors.set(result.errors);

    if (!result.success) {
      return;
    }

    this.isLoading.set(true);
    this.loginError.set(null);
    this.loginSuccess.set(false);
    this.successSession.set(null);

    this.authService
      .login(normalizeLoginFormValue(candidate))
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (session) => {
          this.successSession.set({
            email: session.email,
          });
          this.loginSuccess.set(true);
        },
        error: (error: unknown) => {
          this.loginError.set(resolveLoginErrorMessage(error));
        },
      });
  }
}

function resolveLoginErrorMessage(error: unknown): string {
  if (isNormalizedApiError(error)) {
    if (error.status === 401 || error.status === 403) {
      return 'E-mail ou senha invalidos. Verifique seus dados e tente novamente.';
    }

    return error.message;
  }

  return 'Nao foi possivel entrar. Tente novamente.';
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
