import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { OrdersStore } from '../checkout/orders.store';
import { OrderDetailPageComponent } from './order-detail-page.component';

describe('OrderDetailPageComponent', () => {
  it('shows the order detail and loads by pedidoId', async () => {
    const order = {
      pedidoId: 42,
      carrinhoId: 100,
      clienteId: 20,
      enderecoEntrega: {
        logradouro: 'Rua Central',
        numero: '100',
        complemento: 'Apto 12',
        cep: '01001000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
      dataPedido: '2026-07-11T12:00:00-03:00',
      formaPagamento: 'Pix',
      status: 'Criado',
      items: [
        {
          itemId: 1,
          produtoId: 77,
          quantidade: 2,
          valorUnitario: 199.9,
        },
      ],
    };

    const ordersStoreMock = {
      loadOrderDetail: vi.fn(),
      clearCurrentOrder: vi.fn(),
      currentOrder: vi.fn(() => order),
      isLoadingDetail: vi.fn(() => false),
      error: vi.fn(() => null),
    };

    await render(OrderDetailPageComponent, {
      providers: [
        provideRouter([{ path: 'account/orders/:pedidoId', component: OrderDetailPageComponent }]),
        { provide: OrdersStore, useValue: ordersStoreMock },
      ],
      route: '/account/orders/42',
    });

    expect(ordersStoreMock.loadOrderDetail).toHaveBeenCalledWith('42');
    expect(screen.getByRole('heading', { name: 'Detalhe do pedido #42' })).toBeVisible();
    expect(screen.getByText('Criado')).toBeVisible();
    expect(screen.getByText('Produto #77')).toBeVisible();
    expect(screen.getByText('Voltar para pedidos')).toHaveAttribute('href', '/account/orders');
  });
});
