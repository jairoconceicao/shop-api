import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomerService } from '@core/customer/customer.service';
import { ButtonComponent } from '@shared/ui/base/button.component';
import { CheckboxComponent } from '@shared/ui/base/checkbox.component';
import { FormErrorComponent } from '@shared/ui/base/form-error.component';
import { InputComponent } from '@shared/ui/base/input.component';

import {
  createEmptyRegisterFormValue,
  registerFormCepMask,
  registerFormCpfMask,
  registerFormDddMask,
  registerFormPhoneMask,
  registerFormUfOptions,
  type RegisterFormValue,
} from './register-form.context';
import {
  createEmptyRegisterFormErrors,
  normalizeRegisterFormValue,
  registerFormSchema,
  type RegisterFormErrors,
  type RegisterFormField,
} from './register-form.schema';

@Component({
  selector: 'app-register-form',
  imports: [RouterLink, ButtonComponent, CheckboxComponent, FormErrorComponent, InputComponent],
  host: {
    class: 'block h-full',
  },
  template: `
    <article class="h-full rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-10">
      <div class="space-y-2">
        <span class="inline-flex rounded-full bg-shop-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-shop-primary">
          Cadastro publico
        </span>
        <h2 class="text-2xl font-black tracking-tight text-shop-text lg:text-3xl">Dados pessoais, endereco e celular</h2>
        <p class="text-sm leading-7 text-shop-text-muted lg:text-base">
          Um unico formulario para criar a conta do cliente com os dados usados na jornada de compra.
        </p>
      </div>

      <form class="mt-8 space-y-8" (submit)="handleSubmit($event)" novalidate>
        <fieldset class="space-y-4">
          <legend class="text-sm font-bold uppercase tracking-[0.2em] text-shop-text-muted">Dados pessoais</legend>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <app-input
                label="Nome completo"
                autocomplete="name"
                placeholder="Cliente Shop"
                [required]="true"
                [value]="form().nome"
                [error]="getFieldErrors('nome')"
                (valueChange)="setPersonalField('nome', $event)"
              />
            </div>

            <app-input
              label="CPF"
              autocomplete="off"
              inputMode="numeric"
              placeholder="123.456.789-01"
              hint="A mascara sera aplicada automaticamente."
              [required]="true"
              [mask]="registerFormCpfMask"
              [value]="form().cpf"
              [error]="getFieldErrors('cpf')"
              (valueChange)="setPersonalField('cpf', $event)"
            />

            <app-input
              label="Data de nascimento"
              type="date"
              autocomplete="bday"
              [required]="true"
              [value]="form().dataNascimento"
              [error]="getFieldErrors('dataNascimento')"
              (valueChange)="setPersonalField('dataNascimento', $event)"
            />

            <app-input
              label="E-mail"
              type="email"
              autocomplete="email"
              placeholder="cliente@shopapi.dev"
              [required]="true"
              [value]="form().email"
              [error]="getFieldErrors('email')"
              (valueChange)="setPersonalField('email', $event)"
            />

            <app-input
              label="Senha"
              type="password"
              autocomplete="new-password"
              placeholder="Crie uma senha"
              [required]="true"
              [value]="form().senha"
              [error]="getFieldErrors('senha')"
              (valueChange)="setPersonalField('senha', $event)"
            />
          </div>
        </fieldset>

        <fieldset class="space-y-4">
          <legend class="text-sm font-bold uppercase tracking-[0.2em] text-shop-text-muted">Endereco</legend>

          <div class="grid gap-4 md:grid-cols-2">
            <app-input
              label="CEP"
              autocomplete="postal-code"
              inputMode="numeric"
              placeholder="01001-000"
              hint="A mascara sera aplicada automaticamente."
              [required]="true"
              [mask]="registerFormCepMask"
              [value]="form().endereco.cep"
              [error]="getFieldErrors('cep')"
              (valueChange)="setAddressField('cep', $event)"
            />

            <app-input
              label="Logradouro"
              autocomplete="address-line1"
              placeholder="Rua Exemplo"
              [required]="true"
              [value]="form().endereco.logradouro"
              [error]="getFieldErrors('logradouro')"
              (valueChange)="setAddressField('logradouro', $event)"
            />

            <app-input
              label="Numero"
              autocomplete="address-line2"
              inputMode="numeric"
              placeholder="123"
              [required]="true"
              [value]="form().endereco.numero"
              [error]="getFieldErrors('numero')"
              (valueChange)="setAddressField('numero', $event)"
            />

            <app-input
              label="Complemento"
              autocomplete="address-line2"
              placeholder="Apto 10"
              [value]="form().endereco.complemento"
              [error]="getFieldErrors('complemento')"
              (valueChange)="setAddressField('complemento', $event)"
            />

            <app-input
              label="Bairro"
              autocomplete="address-level2"
              placeholder="Centro"
              [required]="true"
              [value]="form().endereco.bairro"
              [error]="getFieldErrors('bairro')"
              (valueChange)="setAddressField('bairro', $event)"
            />

            <app-input
              label="Cidade"
              autocomplete="address-level2"
              placeholder="Sao Paulo"
              [required]="true"
              [value]="form().endereco.cidade"
              [error]="getFieldErrors('cidade')"
              (valueChange)="setAddressField('cidade', $event)"
            />

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-shop-text">
                UF
                <span class="ml-1 text-shop-danger" aria-hidden="true">*</span>
              </span>
              <select
                class="w-full rounded-2xl border border-shop-border bg-shop-background px-4 py-3 text-shop-text outline-none transition focus:border-shop-primary focus:bg-white focus:ring-2 focus:ring-shop-primary/10"
                [value]="form().endereco.uf"
                [attr.aria-invalid]="getFieldErrors('uf') ? 'true' : null"
                (change)="setAddressField('uf', getSelectValue($event))"
              >
                <option value="">Selecione</option>
                @for (uf of ufOptions; track uf) {
                  <option [value]="uf">{{ uf }}</option>
                }
              </select>
              <app-form-error [error]="getFieldErrors('uf')" />
            </label>
          </div>
        </fieldset>

        <fieldset class="space-y-4">
          <legend class="text-sm font-bold uppercase tracking-[0.2em] text-shop-text-muted">Celular</legend>

          <div class="grid gap-4 md:grid-cols-[120px_1fr]">
            <app-input
              label="DDD"
              autocomplete="tel-area-code"
              inputMode="numeric"
              placeholder="11"
              hint="Dois digitos do seu DDD."
              [required]="true"
              [mask]="registerFormDddMask"
              [value]="form().celular.ddd"
              [error]="getFieldErrors('ddd')"
              (valueChange)="setCellphoneField('ddd', $event)"
            />

            <app-input
              label="Telefone celular"
              type="tel"
              autocomplete="tel-national"
              placeholder="99999-9999"
              [required]="true"
              [mask]="registerFormPhoneMask"
              [value]="form().celular.numero"
              [error]="getFieldErrors('telefone')"
              (valueChange)="setCellphoneField('numero', $event)"
            />
          </div>

          <app-checkbox
            label="Este numero usa WhatsApp"
            hint="Marque se o celular informado tambem recebe mensagens no WhatsApp."
            [checked]="form().celular.whatsApp"
            (checkedChange)="setWhatsApp($event)"
          />
        </fieldset>

        <div class="flex flex-col gap-3 sm:flex-row">
          <app-button type="submit" size="lg" [block]="true" [disabled]="isSubmitting()">Criar conta</app-button>
          <a
            routerLink="/login"
            class="inline-flex items-center justify-center rounded-2xl border border-shop-border px-5 py-3.5 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
          >
            Ja tenho conta
          </a>
        </div>
      </form>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterFormComponent {
  private readonly customerService = inject(CustomerService);
  readonly form = signal<RegisterFormValue>(createEmptyRegisterFormValue());
  private readonly submitAttempted = signal(false);
  protected readonly isSubmitting = signal(false);
  private readonly validationErrors = signal<RegisterFormErrors>(createEmptyRegisterFormErrors());
  protected readonly registerFormCpfMask = registerFormCpfMask;
  protected readonly registerFormCepMask = registerFormCepMask;
  protected readonly registerFormDddMask = registerFormDddMask;
  protected readonly registerFormPhoneMask = registerFormPhoneMask;
  protected readonly ufOptions = registerFormUfOptions;

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.submitAttempted.set(true);

    const candidate = normalizeRegisterFormValue(this.form());
    const result = registerFormSchema.validate(candidate);
    this.validationErrors.set(result.errors);

    if (!result.success) {
      return;
    }

    this.isSubmitting.set(true);

    this.customerService
      .create({
        senha: candidate.senha,
        cpf: candidate.cpf,
        nome: candidate.nome,
        dataNascimento: candidate.dataNascimento,
        email: candidate.email,
        endereco: {
          logradouro: candidate.endereco.logradouro,
          numero: candidate.endereco.numero,
          complemento: candidate.endereco.complemento || null,
          cep: candidate.endereco.cep,
          bairro: candidate.endereco.bairro,
          cidade: candidate.endereco.cidade,
          uf: candidate.endereco.uf,
        },
        celular: {
          ddd: candidate.celular.ddd,
          numero: candidate.celular.numero,
          whatsApp: candidate.celular.whatsApp,
        },
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe();
  }

  setPersonalField(field: 'nome' | 'cpf' | 'dataNascimento' | 'email' | 'senha', value: string): void {
    this.form.update((current) => ({
      ...current,
      [field]: value,
    }));
  }

  setAddressField(
    field: 'logradouro' | 'numero' | 'complemento' | 'cep' | 'bairro' | 'cidade' | 'uf',
    value: string,
  ): void {
    this.form.update((current) => ({
      ...current,
      endereco: {
        ...current.endereco,
        [field]: value,
      },
    }));
  }

  setCellphoneField(field: 'ddd' | 'numero', value: string): void {
    this.form.update((current) => ({
      ...current,
      celular: {
        ...current.celular,
        [field]: value,
      },
    }));
  }

  setWhatsApp(value: boolean): void {
    this.form.update((current) => ({
      ...current,
      celular: {
        ...current.celular,
        whatsApp: value,
      },
    }));
  }

  protected getFieldErrors(field: RegisterFormField): readonly string[] | null {
    if (!this.submitAttempted()) {
      return null;
    }

    const messages = this.validationErrors()[field];
    return messages.length > 0 ? messages : null;
  }

  getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
