import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { createCheckoutAddressState } from './checkout-address.context';
import { createCheckoutCustomerState } from './checkout-customer.context';
import { createCheckoutPaymentState } from './checkout-payment.context';
import { createCheckoutState } from './checkout.context';
import { CartItemComponent } from '@shared/ui/cart/cart-item.component';
import { CartSummaryComponent } from '@shared/ui/cart/cart-summary.component';
import { InputComponent } from '@shared/ui/base/input.component';
import { EmptyStateComponent } from '@shared/ui/states/empty-state.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';
import type { PaymentMethod } from '@shared/models';

@Component({
  selector: 'app-checkout-page',
  imports: [
    RouterLink,
    PageContainerComponent,
    EmptyStateComponent,
    CartItemComponent,
    CartSummaryComponent,
    InputComponent,
  ],
  template: `
    <app-page-container [wide]="true">
      <section class="space-y-6">
        <article class="overflow-hidden rounded-[2rem] border border-shop-border bg-white shadow-soft">
          <div class="bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#dbeafe_100%)] px-5 py-6 text-white lg:px-10 lg:py-10">
            <span class="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-white/80">
              Checkout protegido
            </span>
            <h1 class="mt-4 text-4xl font-black tracking-tight text-balance sm:text-5xl">
              Finalize sua compra com segurança.
            </h1>
            <p class="mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
              Esta rota já está protegida por autenticação e recebe a base do fluxo de compra, sem antecipar os
              campos do pedido.
            </p>
          </div>

          <div class="grid gap-4 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:px-10 lg:py-10">
            @if (isEmpty()) {
              <div class="rounded-[1.5rem] bg-shop-background p-5">
                <app-empty-state
                  eyebrow="Carrinho ativo"
                  title="Adicione produtos ao carrinho antes de continuar"
                  description="O checkout reutiliza os dados do carrinho ativo para manter o fluxo de compra consistente."
                >
                  <a
                    routerLink="/cart"
                    class="rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover"
                  >
                    Ir para o carrinho
                  </a>
                </app-empty-state>
              </div>
            } @else {
              <section class="space-y-4" aria-labelledby="checkout-items-title">
                <div>
                  <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                    Carrinho ativo
                  </p>
                  <h2 id="checkout-items-title" class="text-shop-text mt-2 text-2xl font-black tracking-tight">
                    Itens prontos para o pedido
                  </h2>
                  <p class="text-shop-text-muted mt-3 text-sm leading-7">
                    O checkout reaproveita os itens, quantidades e valores atuais do carrinho ativo.
                  </p>
                </div>

                <div class="space-y-3">
                  @for (item of items(); track item.itemId) {
                    <app-cart-item [item]="item" />
                  }
                </div>
              </section>

              <section class="rounded-[1.5rem] border border-shop-border bg-white p-5 shadow-soft" aria-labelledby="checkout-payment-title">
                <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                  Pagamento
                </p>
                <h2 id="checkout-payment-title" class="text-shop-text mt-2 text-xl font-black tracking-tight">
                  Selecione a forma de pagamento
                </h2>
                <p class="text-shop-text-muted mt-3 text-sm leading-7">
                  A escolha fica registrada no checkout para ser enviada ao pedido em uma etapa posterior.
                </p>

                <label class="mt-5 block">
                  <span class="mb-2 block text-sm font-semibold text-shop-text">
                    Forma de pagamento
                    <span class="ml-1 text-shop-danger" aria-hidden="true">*</span>
                  </span>
                  <select
                    class="w-full rounded-2xl border border-shop-border bg-shop-background px-4 py-3 text-shop-text outline-none transition focus:border-shop-primary focus:bg-white focus:ring-2 focus:ring-shop-primary/10"
                    [value]="paymentMethod()"
                    (change)="setPaymentMethod(getSelectValue($event))"
                  >
                    @for (option of paymentOptions; track option) {
                      <option [value]="option">{{ paymentLabel(option) }}</option>
                    }
                  </select>
                </label>

                <div class="mt-4 rounded-2xl bg-shop-background p-4 text-sm text-shop-text-muted">
                  Selecionado:
                  <span class="font-semibold text-shop-text">{{ paymentLabel(paymentMethod()) }}</span>
                </div>
              </section>

              <app-cart-summary [subtotal]="subtotal()" [shipping]="shipping()" ctaLabel="Continuar checkout">
                <div class="mt-3 space-y-3">
                  <a
                    routerLink="/cart"
                    class="border-shop-border text-shop-text hover:border-shop-primary/30 hover:text-shop-primary inline-flex w-full items-center justify-center rounded-2xl border px-5 py-3 text-sm font-bold transition"
                  >
                    Revisar carrinho
                  </a>
                  <a
                    routerLink="/products"
                    class="border-shop-border text-shop-text hover:border-shop-primary/30 hover:text-shop-primary inline-flex w-full items-center justify-center rounded-2xl border px-5 py-3 text-sm font-bold transition"
                  >
                    Continuar comprando
                  </a>
                </div>
              </app-cart-summary>
            }
          </div>

          @if (baseAddress()) {
            <div class="border-t border-shop-border bg-shop-background px-5 py-6 lg:px-10">
              <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <div class="rounded-[1.5rem] border border-shop-border bg-white p-5 shadow-soft">
                  <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                    Endereco base
                  </p>
                  <h2 class="text-shop-text mt-2 text-xl font-black tracking-tight">
                    Dados carregados do perfil do cliente
                  </h2>
                  <dl class="text-shop-text-muted mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt class="text-shop-text-light text-xs font-bold uppercase tracking-[0.18em]">
                        Logradouro
                      </dt>
                      <dd class="mt-1 font-medium text-shop-text">{{ baseAddress()?.logradouro }}</dd>
                    </div>
                    <div>
                      <dt class="text-shop-text-light text-xs font-bold uppercase tracking-[0.18em]">
                        Numero
                      </dt>
                      <dd class="mt-1 font-medium text-shop-text">{{ baseAddress()?.numero }}</dd>
                    </div>
                    <div>
                      <dt class="text-shop-text-light text-xs font-bold uppercase tracking-[0.18em]">
                        Bairro
                      </dt>
                      <dd class="mt-1 font-medium text-shop-text">{{ baseAddress()?.bairro }}</dd>
                    </div>
                    <div>
                      <dt class="text-shop-text-light text-xs font-bold uppercase tracking-[0.18em]">
                        Cidade / UF
                      </dt>
                      <dd class="mt-1 font-medium text-shop-text">
                        {{ baseAddress()?.cidade }} / {{ baseAddress()?.uf }}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-shop-text-light text-xs font-bold uppercase tracking-[0.18em]">
                        CEP
                      </dt>
                      <dd class="mt-1 font-medium text-shop-text">{{ baseAddress()?.cep }}</dd>
                    </div>
                    <div>
                      <dt class="text-shop-text-light text-xs font-bold uppercase tracking-[0.18em]">
                        Complemento
                      </dt>
                      <dd class="mt-1 font-medium text-shop-text">
                        {{ baseAddress()?.complemento ?? '-' }}
                      </dd>
                    </div>
                  </dl>
                </div>

                <form class="rounded-[1.5rem] border border-shop-border bg-white p-5 shadow-soft" novalidate>
                  <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                    Endereco de entrega
                  </p>
                  <h2 class="text-shop-text mt-2 text-xl font-black tracking-tight">
                    Edite os dados antes de finalizar
                  </h2>
                  <p class="text-shop-text-muted mt-3 text-sm leading-7">
                    O checkout permite ajustar explicitamente o endereco de entrega sem alterar o cadastro do cliente.
                  </p>

                  <div class="mt-5 grid gap-4 sm:grid-cols-2">
                    <div class="sm:col-span-2">
                      <app-input
                        label="Logradouro"
                        autocomplete="address-line1"
                        [required]="true"
                        [value]="deliveryAddress().logradouro"
                        (valueChange)="setDeliveryAddressField('logradouro', $event)"
                      />
                    </div>
                    <app-input
                      label="Numero"
                      autocomplete="address-line2"
                      inputMode="numeric"
                      [required]="true"
                      [value]="deliveryAddress().numero"
                      (valueChange)="setDeliveryAddressField('numero', $event)"
                    />
                    <app-input
                      label="Complemento"
                      autocomplete="address-line2"
                      [value]="deliveryAddress().complemento"
                      (valueChange)="setDeliveryAddressField('complemento', $event)"
                    />
                    <app-input
                      label="CEP"
                      autocomplete="postal-code"
                      inputMode="numeric"
                      [required]="true"
                      [value]="deliveryAddress().cep"
                      (valueChange)="setDeliveryAddressField('cep', $event)"
                    />
                    <app-input
                      label="Bairro"
                      autocomplete="address-level2"
                      [required]="true"
                      [value]="deliveryAddress().bairro"
                      (valueChange)="setDeliveryAddressField('bairro', $event)"
                    />
                    <app-input
                      label="Cidade"
                      autocomplete="address-level2"
                      [required]="true"
                      [value]="deliveryAddress().cidade"
                      (valueChange)="setDeliveryAddressField('cidade', $event)"
                    />
                    <label class="block">
                      <span class="mb-2 block text-sm font-semibold text-shop-text">
                        UF
                        <span class="ml-1 text-shop-danger" aria-hidden="true">*</span>
                      </span>
                      <select
                        class="w-full rounded-2xl border border-shop-border bg-shop-background px-4 py-3 text-shop-text outline-none transition focus:border-shop-primary focus:bg-white focus:ring-2 focus:ring-shop-primary/10"
                        [value]="deliveryAddress().uf"
                        (change)="setDeliveryAddressField('uf', getSelectValue($event))"
                      >
                        <option value="">Selecione</option>
                        @for (uf of ufOptions; track uf) {
                          <option [value]="uf">{{ uf }}</option>
                        }
                      </select>
                    </label>
                  </div>
                </form>
              </div>
            </div>
          }
        </article>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent {
  private readonly checkoutState = createCheckoutState();
  private readonly checkoutCustomerState = createCheckoutCustomerState();
  private readonly checkoutAddressState = createCheckoutAddressState(this.checkoutCustomerState.baseAddress);
  private readonly checkoutPaymentState = createCheckoutPaymentState();

  protected readonly items = this.checkoutState.items;
  protected readonly subtotal = this.checkoutState.subtotal;
  protected readonly shipping = this.checkoutState.shipping;
  protected readonly isEmpty = this.checkoutState.isEmpty;
  protected readonly baseAddress = this.checkoutCustomerState.baseAddress;
  protected readonly deliveryAddress = this.checkoutAddressState.deliveryAddress;
  protected readonly paymentMethod = this.checkoutPaymentState.paymentMethod;
  protected readonly paymentOptions = this.checkoutPaymentState.paymentOptions;
  protected readonly ufOptions = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  protected setDeliveryAddressField(field: 'logradouro' | 'numero' | 'complemento' | 'cep' | 'bairro' | 'cidade' | 'uf', value: string): void {
    this.checkoutAddressState.setDeliveryAddressField(field, value);
  }

  protected setPaymentMethod(paymentMethod: string): void {
    if (paymentMethod === 'Pix' || paymentMethod === 'Cartao' || paymentMethod === 'Boleto') {
      this.checkoutPaymentState.setPaymentMethod(paymentMethod);
    }
  }

  protected paymentLabel(paymentMethod: PaymentMethod): string {
    if (paymentMethod === 'Cartao') {
      return 'Cartão';
    }

    return paymentMethod;
  }

  protected getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
