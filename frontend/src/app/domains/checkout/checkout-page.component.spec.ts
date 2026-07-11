import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { TokenStorageService } from '@core/auth/token-storage.service';
import { CustomerService } from '@core/customer/customer.service';
import { OrderService } from '@core/order/order.service';
import { NormalizedApiError } from '@shared/api/api-error.model';
import type { CartItem } from '@shared/models';

import { CartStore } from '@domains/cart/cart.store';
import { CheckoutPageComponent } from './checkout-page.component';

describe('CheckoutPageComponent', () => {
  const item = (overrides: Partial<CartItem> = {}): CartItem => ({
    itemId: 1,
    produtoId: 10,
    quantidade: 2,
    valorUnitario: 199.9,
    ...overrides,
  });

  const customerMock = {
    getById: vi.fn().mockReturnValue(
      of({
        clienteId: 20,
        cpf: '12345678901',
        nome: 'Cliente Shop',
        dataNascimento: '1990-01-01',
        email: 'cliente@shopapi.dev',
        endereco: {
          logradouro: 'Rua Central',
          numero: '100',
          complemento: 'Apto 12',
          cep: '01001000',
          bairro: 'Centro',
          cidade: 'Sao Paulo',
          uf: 'SP',
        },
        celular: {
          ddd: '11',
          numero: '999999999',
          whatsApp: true,
        },
      }),
    ),
  };

  const tokenStorageMock = {
    getSession: vi.fn().mockReturnValue({
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEm: '2026-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    }),
  };

  it('renders the active cart data in checkout', fakeAsync(async () => {
    const orderService = {
      create: vi.fn().mockReturnValue(
        of({
          pedidoId: 9999,
          clienteId: 20,
          dataPedido: '2026-07-10T12:00:00-03:00',
          formaPagamento: 'Pix',
          status: 'Criado',
          valorTotal: 449.7,
        }),
      ),
    };

    const { fixture } = await render(CheckoutPageComponent, {
      providers: [
        provideRouter([]),
        CartStore,
        { provide: CustomerService, useValue: customerMock },
        { provide: OrderService, useValue: orderService },
        { provide: TokenStorageService, useValue: tokenStorageMock },
      ],
    });

    tick();
    fixture.detectChanges();

    TestBed.inject(CartStore).setItems([item(), item({ itemId: 2, produtoId: 20, quantidade: 1, valorUnitario: 50 })]);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(screen.getByRole('heading', { name: 'Finalize sua compra com segurança.' })).toBeVisible();
    expect(await screen.findByRole('heading', { name: 'Itens prontos para o pedido' })).toBeVisible();
    expect(screen.getByText('Produto #10')).toBeVisible();
    expect(screen.getByText('Produto #20')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Dados carregados do perfil do cliente' })).toBeVisible();
    expect(screen.getByText('Rua Central')).toBeVisible();
    expect(screen.getByText('Centro')).toBeVisible();
    expect(screen.getByText('Endereco de entrega')).toBeVisible();
    expect(screen.getByDisplayValue('Rua Central')).toBeVisible();
    expect(screen.getByDisplayValue('100')).toBeVisible();
    expect(screen.getByDisplayValue('Apto 12')).toBeVisible();
    expect(screen.getByDisplayValue('01001000')).toBeVisible();
    expect(screen.getAllByDisplayValue('Centro').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('Sao Paulo')).toBeVisible();
    expect(await screen.findByDisplayValue('SP')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Selecione a forma de pagamento' })).toBeVisible();
    expect(screen.getByDisplayValue('Pix')).toBeVisible();
    expect(screen.getByText('Selecionado:').parentElement).toHaveTextContent('Pix');
    expect(await screen.findByRole('button', { name: 'Finalizar pedido' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Revisar carrinho' })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: 'Continuar comprando' })).toHaveAttribute(
      'href',
      '/products',
    );
  }));

  it('shows an empty state when there is no active cart data', async () => {
    await render(CheckoutPageComponent, {
      providers: [
        provideRouter([]),
        CartStore,
        {
          provide: CustomerService,
          useValue: {
            getById: vi.fn(),
          },
        },
        {
          provide: TokenStorageService,
          useValue: {
            getSession: vi.fn().mockReturnValue(null),
          },
        },
      ],
    });

    TestBed.inject(CartStore).clear();

    expect(
      screen.getByRole('heading', { name: 'Adicione produtos ao carrinho antes de continuar' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ir para o carrinho' })).toHaveAttribute('href', '/cart');
  });

  it('allows explicit editing of the delivery address without changing the customer profile address', fakeAsync(async () => {
    const { fixture } = await render(CheckoutPageComponent, {
      providers: [
        provideRouter([]),
        CartStore,
        { provide: CustomerService, useValue: customerMock },
        { provide: TokenStorageService, useValue: tokenStorageMock },
      ],
    });

    tick();
    fixture.detectChanges();

    TestBed.inject(CartStore).setItems([item()]);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const deliveryLogradouro = await screen.findByDisplayValue('Rua Central') as HTMLInputElement;
    const deliveryNumero = await screen.findByDisplayValue('100') as HTMLInputElement;
    const deliveryUf = await screen.findByDisplayValue('SP') as HTMLSelectElement;

    deliveryLogradouro.value = '  Rua Nova ';
    deliveryLogradouro.dispatchEvent(new Event('input'));
    deliveryNumero.value = ' 250 ';
    deliveryNumero.dispatchEvent(new Event('input'));
    deliveryUf.value = 'RJ';
    deliveryUf.dispatchEvent(new Event('change'));

    expect(deliveryLogradouro).toHaveValue('Rua Nova');
    expect(deliveryNumero).toHaveValue('250');
    expect(deliveryUf).toHaveValue('RJ');
    expect(screen.getByText('Rua Central')).toBeVisible();
    expect(screen.getByText('100')).toBeVisible();
  }));

  it('allows selecting a payment method during checkout', async () => {
    await render(CheckoutPageComponent, {
      providers: [
        provideRouter([]),
        CartStore,
        { provide: CustomerService, useValue: customerMock },
        { provide: TokenStorageService, useValue: tokenStorageMock },
      ],
    });

    TestBed.inject(CartStore).setItems([item()]);

    const paymentMethod = await screen.findByDisplayValue('Pix') as HTMLSelectElement;

    paymentMethod.value = 'Boleto';
    paymentMethod.dispatchEvent(new Event('change'));

    expect(paymentMethod).toHaveValue('Boleto');
    expect(screen.getByText('Selecionado:').parentElement).toHaveTextContent('Boleto');
  });

  it('creates an order with the supported payload when checkout is submitted', async () => {
    const orderService = {
      create: vi.fn().mockReturnValue(
        of({
          pedidoId: 9999,
          clienteId: 20,
          dataPedido: '2026-07-10T12:00:00-03:00',
          formaPagamento: 'Boleto',
          status: 'Criado',
          valorTotal: 399.9,
        }),
      ),
    };

    await render(CheckoutPageComponent, {
      providers: [
        provideRouter([]),
        CartStore,
        { provide: CustomerService, useValue: customerMock },
        { provide: OrderService, useValue: orderService },
        { provide: TokenStorageService, useValue: tokenStorageMock },
      ],
    });

    TestBed.inject(CartStore).setItems([item({ itemId: 11, produtoId: 10, quantidade: 2, valorUnitario: 199.95 })]);

    const paymentMethod = await screen.findByDisplayValue('Pix') as HTMLSelectElement;
    paymentMethod.value = 'Boleto';
    paymentMethod.dispatchEvent(new Event('change'));

    await screen.getByRole('button', { name: 'Finalizar pedido' }).click();

    expect(orderService.create).toHaveBeenCalledTimes(1);
    expect(orderService.create).toHaveBeenCalledWith({
      enderecoEntrega: {
        logradouro: 'Rua Central',
        numero: '100',
        complemento: 'Apto 12',
        cep: '01001000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
      formaPagamento: 'Boleto',
      dataPedido: expect.any(String),
      items: [
        {
          itemId: 11,
          produtoId: 10,
          quantidade: 2,
          valorUnitario: 199.95,
        },
      ],
    });

    const [submittedRequest] = orderService.create.mock.calls[0];
    expect(Object.keys(submittedRequest)).toEqual(['enderecoEntrega', 'formaPagamento', 'dataPedido', 'items']);
    expect('clienteId' in submittedRequest).toBe(false);
    expect('carrinhoId' in submittedRequest).toBe(false);
    expect(await screen.findByRole('status')).toBeVisible();
    expect(screen.getByText('Pedido confirmado')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Seu pedido foi criado com sucesso' })).toBeVisible();
    expect(screen.getByText(/pedido #9999/i)).toBeVisible();
    expect(screen.getByText('Forma de pagamento')).toBeVisible();
    expect(screen.getByText('Boleto')).toBeVisible();
    expect(screen.getByText('Valor total')).toBeVisible();
    expect(screen.getByText('R$ 399,90')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver meus pedidos' })).toHaveAttribute(
      'href',
      '/account/orders',
    );
    expect(screen.getByRole('link', { name: 'Ir para a home' })).toHaveAttribute('href', '/');
  });

  it('shows validation feedback when the backend rejects the checkout submission', async () => {
    const orderService = {
      create: vi.fn(),
    };
    orderService.create.mockReturnValue(
      throwError(
        () =>
          new NormalizedApiError({
            status: 422,
            code: 'VALIDATION_ERROR',
            message: 'Campos invalidos no pedido.',
            details: {
              enderecoEntrega: ['CEP invalido.'],
            },
          }),
      ),
    );

    const { fixture } = await render(CheckoutPageComponent, {
      providers: [
        provideRouter([]),
        CartStore,
        { provide: CustomerService, useValue: customerMock },
        { provide: OrderService, useValue: orderService },
        { provide: TokenStorageService, useValue: tokenStorageMock },
      ],
    });

    TestBed.inject(CartStore).setItems([item({ itemId: 11, produtoId: 10, quantidade: 2, valorUnitario: 199.95 })]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await (await screen.findByRole('button', { name: 'Finalizar pedido' })).click();

    expect(await screen.findByText('Revise os campos destacados e tente novamente.')).toBeVisible();
    expect(await screen.findByText('CEP invalido.')).toBeVisible();
  });
});
