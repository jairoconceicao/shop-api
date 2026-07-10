import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { TokenStorageService } from '@core/auth/token-storage.service';
import { CustomerService } from '@core/customer/customer.service';
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

  it('renders the active cart data in checkout', async () => {
    const cartStore = TestBed.inject(CartStore);
    const customerService = {
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
    const tokenStorage = {
      getSession: vi.fn().mockReturnValue({
        token: 'jwt-token',
        tipo: 'Bearer',
        expiraEm: '2026-07-09T12:00:00Z',
        usuarioId: 10,
        clienteId: 20,
        email: 'cliente@shopapi.dev',
      }),
    };

    cartStore.setItems([item(), item({ itemId: 2, produtoId: 20, quantidade: 1, valorUnitario: 50 })]);

    await render(CheckoutPageComponent, {
      providers: [
        provideRouter([]),
        { provide: CustomerService, useValue: customerService },
        { provide: TokenStorageService, useValue: tokenStorage },
      ],
    });

    expect(screen.getByRole('heading', { name: 'Finalize sua compra com segurança.' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Itens prontos para o pedido' })).toBeVisible();
    expect(screen.getByText('Produto #10')).toBeVisible();
    expect(screen.getByText('Produto #20')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Dados carregados do perfil do cliente' })).toBeVisible();
    expect(screen.getByText('Rua Central')).toBeVisible();
    expect(screen.getByText('Centro')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Continuar checkout' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Revisar carrinho' })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: 'Continuar comprando' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('shows an empty state when there is no active cart data', async () => {
    TestBed.inject(CartStore).clear();

    await render(CheckoutPageComponent, {
      providers: [
        provideRouter([]),
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

    expect(
      screen.getByRole('heading', { name: 'Adicione produtos ao carrinho antes de continuar' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ir para o carrinho' })).toHaveAttribute('href', '/cart');
  });
});
