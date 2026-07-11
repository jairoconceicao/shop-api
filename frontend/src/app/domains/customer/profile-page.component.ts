import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CustomerStore } from './customer.store';
import {
  createEmptyProfileFormErrors,
  createEmptyProfileFormValue,
  normalizeProfileFormValue,
  profileFormSchema,
  type ProfileFormErrors,
  type ProfileFormField,
  type ProfileFormValue,
} from './profile-form.schema';
import { ButtonComponent } from '@shared/ui/base/button.component';
import { CheckboxComponent } from '@shared/ui/base/checkbox.component';
import { FormErrorComponent } from '@shared/ui/base/form-error.component';
import { InputComponent } from '@shared/ui/base/input.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-profile-page',
  imports: [
    RouterLink,
    ButtonComponent,
    CheckboxComponent,
    FormErrorComponent,
    InputComponent,
    PageContainerComponent,
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
                Meus dados
              </h1>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-shop-text-muted lg:text-base">
                Atualize os dados cadastrais usados na sua conta Shop API.
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

        <form class="space-y-6" (submit)="handleSubmit($event)" novalidate>
          <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-8">
            <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">Dados do cliente</p>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <app-input
                  label="Nome completo"
                  autocomplete="name"
                  placeholder="Cliente Shop"
                  [required]="true"
                  [value]="form().nome"
                  [error]="getFieldErrors('nome')"
                  (valueChange)="setField('nome', $event)"
                />
              </div>

              <app-input
                label="CPF"
                autocomplete="off"
                inputMode="numeric"
                placeholder="123.456.789-01"
                [required]="true"
                [value]="form().cpf"
                [error]="getFieldErrors('cpf')"
                (valueChange)="setField('cpf', $event)"
              />

              <app-input
                label="Data de nascimento"
                type="date"
                autocomplete="bday"
                [required]="true"
                [value]="form().dataNascimento"
                [error]="getFieldErrors('dataNascimento')"
                (valueChange)="setField('dataNascimento', $event)"
              />

              <div class="sm:col-span-2">
                <app-input
                  label="E-mail"
                  type="email"
                  autocomplete="email"
                  placeholder="cliente@shopapi.dev"
                  [required]="true"
                  [value]="form().email"
                  [error]="getFieldErrors('email')"
                  (valueChange)="setField('email', $event)"
                />
              </div>
            </div>
          </article>

          <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-8">
            <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">Endereco</p>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <app-input
                label="CEP"
                autocomplete="postal-code"
                inputMode="numeric"
                placeholder="01001-000"
                [required]="true"
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
                  class="w-full rounded-2xl border border-shop-border bg-shop-background px-4 py-3 text-shop-text outline-none transition focus-visible:border-shop-primary focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-shop-primary/10"
                  [value]="form().endereco.uf"
                  [attr.aria-describedby]="getFieldErrors('uf') ? 'profile-uf-error' : null"
                  [attr.aria-invalid]="getFieldErrors('uf') ? 'true' : null"
                  (change)="setAddressField('uf', getSelectValue($event))"
                >
                  <option value="">Selecione</option>
                  @for (uf of ufOptions; track uf) {
                    <option [value]="uf">{{ uf }}</option>
                  }
                </select>
                <app-form-error id="profile-uf-error" [error]="getFieldErrors('uf')" />
              </label>
            </div>
          </article>

          <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-8">
            <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">Celular</p>

            <div class="mt-5 grid gap-4 md:grid-cols-[120px_1fr]">
              <app-input
                label="DDD"
                autocomplete="tel-area-code"
                inputMode="numeric"
                placeholder="11"
                [required]="true"
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
                [value]="form().celular.numero"
                [error]="getFieldErrors('telefone')"
                (valueChange)="setCellphoneField('numero', $event)"
              />
            </div>

            <div class="mt-4">
              <app-checkbox
                label="Este numero usa WhatsApp"
                hint="Marque se o celular informado tambem recebe mensagens no WhatsApp."
                [checked]="form().celular.whatsApp"
                (checkedChange)="setWhatsApp($event)"
              />
            </div>
          </article>

          @if (customerStore.error()) {
            <app-form-error [error]="customerStore.error()" />
          }

          <div class="flex flex-col gap-3 sm:flex-row">
            <app-button type="submit" size="lg" [block]="true" [disabled]="customerStore.isLoading()">
              Salvar alteracoes
            </app-button>
            <a
              routerLink="/account"
              class="inline-flex items-center justify-center rounded-2xl border border-shop-border px-5 py-3.5 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
            >
              Cancelar
            </a>
          </div>
        </form>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  protected readonly customerStore = inject(CustomerStore);
  protected readonly form = signal<ProfileFormValue>(createEmptyProfileFormValue());
  private readonly submitAttempted = signal(false);
  private readonly validationErrors = signal<ProfileFormErrors>(createEmptyProfileFormErrors());
  protected readonly ufOptions = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  constructor() {
    effect(() => {
      const profile = this.customerStore.profile();

      if (!profile) {
        return;
      }

      this.form.set({
        cpf: profile.cpf,
        nome: profile.nome,
        dataNascimento: profile.dataNascimento,
        email: profile.email,
        endereco: {
          logradouro: profile.endereco.logradouro,
          numero: profile.endereco.numero,
          complemento: profile.endereco.complemento ?? '',
          cep: profile.endereco.cep,
          bairro: profile.endereco.bairro,
          cidade: profile.endereco.cidade,
          uf: profile.endereco.uf,
        },
        celular: {
          ddd: profile.celular.ddd,
          numero: profile.celular.numero,
          whatsApp: profile.celular.whatsApp,
        },
      });
    });
  }

  ngOnInit(): void {
    this.customerStore.loadProfile();
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.submitAttempted.set(true);

    const candidate = this.form();
    const result = profileFormSchema.validate(candidate);
    const errors = result.errors;
    this.validationErrors.set(errors);

    if (!result.success) {
      return;
    }

    this.customerStore.updateProfile(normalizeProfileFormValue(candidate));
  }

  setField(field: 'cpf' | 'nome' | 'dataNascimento' | 'email', value: string): void {
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

  getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  protected getFieldErrors(field: ProfileFormField): readonly string[] | null {
    if (!this.submitAttempted()) {
      return null;
    }

    const messages = this.validationErrors()[field];
    return messages.length > 0 ? messages : null;
  }
}
