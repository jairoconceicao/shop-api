import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientService, type ApiResponse } from '@shared/api';
import type { CustomerCreateRequest, CustomerIdResponse } from '@shared/models';

import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  const apiClientMock = {
    post: vi.fn(),
  };

  beforeEach(() => {
    apiClientMock.post.mockReset();

    TestBed.configureTestingModule({
      providers: [
        CustomerService,
        {
          provide: ApiClientService,
          useValue: apiClientMock,
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates a customer through POST /api/v1/cliente', () => {
    const request: CustomerCreateRequest = {
      senha: '12345678',
      cpf: '12345678901',
      nome: 'Cliente Shop',
      dataNascimento: '1990-01-01',
      email: 'cliente@shopapi.dev',
      endereco: {
        logradouro: 'Rua Central',
        numero: '100',
        complemento: null,
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
    };

    const response = {
      status: true,
      message: '',
      data: {
        clienteId: 20,
      },
    } satisfies ApiResponse<CustomerIdResponse>;

    apiClientMock.post.mockReturnValue(of(response));

    const service = TestBed.inject(CustomerService);
    const receivedResponses: CustomerIdResponse[] = [];

    service.create(request).subscribe((createdCustomer) => {
      receivedResponses.push(createdCustomer);
    });

    expect(apiClientMock.post).toHaveBeenCalledWith('/api/v1/cliente', request, undefined);
    expect(receivedResponses).toEqual([response.data]);
  });
});
