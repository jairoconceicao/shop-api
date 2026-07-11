import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { fireEvent } from '@testing-library/dom';
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
      cancelOrder: vi.fn(),
      currentOrder: vi.fn(() => order),
      isLoadingDetail: vi.fn(() => false),
      isCancelling: vi.fn(() => false),
      error: vi.fn(() => null),
    };

    await render(OrderDetailPageComponent, {
      providers: [
        provideRouter([{ path: 'account/orders/:pedidoId', component: OrderDetailPageComponent }]),
        { provide: OrdersStore, useValue: ordersStoreMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ pedidoId: '42' }) } },
        },
      ],
    });

    expect(ordersStoreMock.loadOrderDetail).toHaveBeenCalledWith('42');
    expect(screen.getByRole('heading', { name: 'Detalhe do pedido #42' })).toBeVisible();
    expect(screen.getByLabelText('Status do pedido')).toHaveTextContent('Criado');
    expect(screen.getByText('Produto #77')).toBeVisible();
    expect(screen.getByText('Voltar para pedidos')).toHaveAttribute('href', '/account/orders');
    expect(screen.getByRole('button', { name: 'Cancelar pedido' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }));
    expect(await screen.findByRole('button', { name: 'Sim, cancelar pedido' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Sim, cancelar pedido' }));
    expect(ordersStoreMock.cancelOrder).toHaveBeenCalledWith('42');
  });
});
