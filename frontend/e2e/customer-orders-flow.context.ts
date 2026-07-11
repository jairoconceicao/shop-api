export const customerOrdersFlowSession = {
  token: 'jwt-token',
  tipo: 'Bearer',
  expiraEm: '2099-07-11T12:00:00Z',
  usuarioId: 10,
  clienteId: 20,
  email: 'cliente@shopapi.dev',
} as const;

export const customerOrdersFlowProfile = {
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
} as const;

export const customerOrdersFlowList = {
  pages: 1,
  size: 20,
  totalItems: 1,
  data: [
    {
      pedidoId: 500,
      clienteId: 20,
      dataPedido: '2026-07-10T12:00:00-03:00',
      formaPagamento: 'Pix',
      status: 'Criado',
      valorTotal: 3499.9,
    },
  ],
} as const;

export const customerOrdersFlowDetail = {
  pedidoId: 500,
  clienteId: 20,
  dataPedido: '2026-07-10T12:00:00-03:00',
  formaPagamento: 'Pix',
  status: 'Criado',
  valorTotal: 3499.9,
  enderecoEntrega: {
    logradouro: 'Rua Central',
    numero: '100',
    complemento: 'Apto 12',
    bairro: 'Centro',
    cidade: 'Sao Paulo',
    uf: 'SP',
    cep: '01001000',
  },
  items: [
    {
      itemId: 77,
      produtoId: 101,
      quantidade: 1,
      valorUnitario: 3499.9,
    },
  ],
} as const;

export const customerOrdersFlowCanceled = {
  pedidoId: 500,
  clienteId: 20,
  dataPedido: '2026-07-10T12:00:00-03:00',
  formaPagamento: 'Pix',
  status: 'Cancelado',
  valorTotal: 3499.9,
  enderecoEntrega: customerOrdersFlowDetail.enderecoEntrega,
  items: customerOrdersFlowDetail.items,
} as const;
