import { describe, expect, it } from 'vitest';

import type {
  AddCartItemRequest,
  AuthLoginRequest,
  AuthLoginResponse,
  AuthSession,
  Cart,
  Category,
  CreateOrderRequest,
  CustomerCreateRequest,
  CustomerDetails,
  CustomerUpdateRequest,
  Order,
  ProductCatalogItem,
  ProductDetails,
} from './index';

describe('API contract models', () => {
  it('models auth payloads', () => {
    const request = {
      email: 'cliente@shopapi.dev',
      senha: '12345678',
    } satisfies AuthLoginRequest;

    const response = {
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEm: '2026-07-09T12:00:00Z',
      usuarioId: 10,
      clienteId: 20,
      email: 'cliente@shopapi.dev',
    } satisfies AuthLoginResponse;

    const session = response satisfies AuthSession;

    expect(request.email).toContain('@');
    expect(session.email).toBe(response.email);
  });

  it('models customer payloads', () => {
    const request = {
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
    } satisfies CustomerCreateRequest;

    const update = request satisfies CustomerUpdateRequest;

    const details = {
      clienteId: 20,
      cpf: '12345678901',
      nome: 'Cliente Shop',
      dataNascimento: '1990-01-01',
      email: 'cliente@shopapi.dev',
      endereco: request.endereco,
      celular: request.celular,
    } satisfies CustomerDetails;

    expect(update.nome).toBe(details.nome);
  });

  it('models category and product payloads', () => {
    const category = {
      categoriaId: 1,
      titulo: 'Informática',
      descricao: 'Produtos de tecnologia',
    } satisfies Category;

    const catalogItem = {
      produtoId: 101,
      titulo: 'Notebook Gamer',
      thumb: null,
      preco: 5999.9,
      estoque: 12,
      categoria: {
        categoriaId: category.categoriaId,
        titulo: category.titulo,
      },
    } satisfies ProductCatalogItem;

    const details = {
      ...catalogItem,
      descricao: 'Notebook para jogos',
      modelo: 'RTX',
      foto: null,
    } satisfies ProductDetails;

    expect(details.categoria.titulo).toBe(category.titulo);
  });

  it('models cart payloads', () => {
    const addItem = {
      produtoId: 101,
      quantidade: 2,
      valorUnitario: 2999.95,
    } satisfies AddCartItemRequest;

    const cart = {
      clienteId: 20,
      carrinhoId: 100,
      dataCarrinho: '2026-07-09T12:00:00Z',
      items: [
        {
          itemId: 1,
          produtoId: addItem.produtoId,
          quantidade: addItem.quantidade,
          valorUnitario: addItem.valorUnitario,
        },
      ],
    } satisfies Cart;

    expect(cart.items).toHaveLength(1);
  });

  it('models order payloads', () => {
    const order = {
      pedidoId: 500,
      carrinhoId: 100,
      clienteId: 20,
      enderecoEntrega: {
        logradouro: 'Rua Central',
        numero: '100',
        complemento: null,
        cep: '01001000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
      dataPedido: '2026-07-09T12:00:00Z',
      formaPagamento: 'Pix',
      status: 'Criado',
      items: [
        {
          itemId: 1,
          produtoId: 101,
          quantidade: 2,
          valorUnitario: 2999.95,
        },
      ],
    } satisfies Order;

    const request = {
      enderecoEntrega: order.enderecoEntrega,
      formaPagamento: order.formaPagamento,
      dataPedido: order.dataPedido,
      items: [
        {
          itemId: null,
          produtoId: 101,
          quantidade: 2,
          valorUnitario: 2999.95,
        },
      ],
    } satisfies CreateOrderRequest;

    expect(request.items[0].itemId).toBeNull();
  });
});

