import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientService, type ApiResponse } from '@shared/api';
import type { CustomerCreateRequest, CustomerDetails, CustomerIdResponse, CustomerUpdateRequest } from '@shared/models';

import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  const apiClientMock = {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  };

  beforeEach(() => {
    apiClientMock.post.mockReset();
    apiClientMock.get.mockReset();
    apiClientMock.put.mockReset();

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

  it('gets a customer by id through GET /api/v1/cliente/{clienteId}', () => {
    const response = {
      status: true,
      message: '',
      data: {
        clienteId: 20,
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
      },
    } satisfies ApiResponse<import('@shared/models').CustomerDetails>;

    apiClientMock.get.mockReturnValue(of(response));

    const service = TestBed.inject(CustomerService);
    const receivedResponses: import('@shared/models').CustomerDetails[] = [];

    service.getById(20).subscribe((customer) => {
      receivedResponses.push(customer);
    });

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/v1/cliente/20', undefined);
    expect(receivedResponses).toEqual([response.data]);
  });

  it('updates a customer through PUT /api/v1/cliente/{clienteId}', () => {
    const request: CustomerUpdateRequest = {
      cpf: '12345678901',
      nome: 'Cliente Shop Atualizado',
      dataNascimento: '1990-01-01',
      email: 'cliente@shopapi.dev',
      endereco: {
        logradouro: 'Rua Central',
        numero: '200',
        complemento: 'Apto 12',
        cep: '01001000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
      celular: {
        ddd: '11',
        numero: '988888888',
        whatsApp: false,
      },
    };

    const response = {
      status: true,
      message: '',
      data: {
        clienteId: 20,
        ...request,
      },
    } satisfies ApiResponse<CustomerDetails>;

    apiClientMock.put.mockReturnValue(of(response));

    const service = TestBed.inject(CustomerService);
    const receivedResponses: CustomerDetails[] = [];

    service.update(20, request).subscribe((customer) => {
      receivedResponses.push(customer);
    });

    expect(apiClientMock.put).toHaveBeenCalledWith('/api/v1/cliente/20', request, undefined);
    expect(receivedResponses).toEqual([response.data]);
  });
});
