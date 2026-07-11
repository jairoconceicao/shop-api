import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientService, type ApiResponse } from '@shared/api';
import type {
  CustomerCreateRequest,
  CustomerDetails,
  CustomerIdResponse,
  CustomerUpdatePasswordRequest,
  CustomerUpdateRequest,
} from '@shared/models';

import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  const apiClientMock = {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    apiClientMock.post.mockReset();
    apiClientMock.get.mockReset();
    apiClientMock.put.mockReset();
    apiClientMock.delete.mockReset();

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

    expect(apiClientMock.post).toHaveBeenCalledWith('/api/v1/cliente', request);
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

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/v1/cliente/20');
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

    expect(apiClientMock.put).toHaveBeenCalledWith('/api/v1/cliente/20', request);
    expect(receivedResponses).toEqual([response.data]);
  });

  it('updates a customer password through PUT /api/v1/cliente/{clienteId}/senha', () => {
    const request: CustomerUpdatePasswordRequest = {
      senhaAtual: '12345678',
      senhaNova: '87654321',
    };

    const response = {
      status: true,
      message: '',
      data: {
        clienteId: 20,
      },
    } satisfies ApiResponse<CustomerIdResponse>;

    apiClientMock.put.mockReturnValue(of(response));

    const service = TestBed.inject(CustomerService);
    const receivedResponses: CustomerIdResponse[] = [];

    service.updatePassword(20, request).subscribe((result) => {
      receivedResponses.push(result);
    });

    expect(apiClientMock.put).toHaveBeenCalledWith('/api/v1/cliente/20/senha', request);
    expect(receivedResponses).toEqual([response.data]);
  });

  it('deletes a customer through DELETE /api/v1/cliente/{clienteId}', () => {
    const response = {
      status: true,
      message: '',
      data: undefined,
    } satisfies ApiResponse<void>;

    apiClientMock.delete.mockReturnValue(of(response));

    const service = TestBed.inject(CustomerService);
    const receivedResponses: void[] = [];

    service.delete(20).subscribe((result) => {
      receivedResponses.push(result);
    });

    expect(apiClientMock.delete).toHaveBeenCalledWith('/api/v1/cliente/20');
    expect(receivedResponses).toEqual([undefined]);
  });
});
