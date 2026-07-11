export const cartCheckoutFlowSession = {
  token: 'jwt-token',
  tipo: 'Bearer',
  expiraEm: '2099-07-11T12:00:00Z',
  usuarioId: 10,
  clienteId: 20,
  email: 'cliente@shopapi.dev',
} as const;

export const cartCheckoutFlowProduct = {
  produtoId: 101,
  titulo: 'Notebook Gamer',
  descricao: 'Notebook para jogos',
  modelo: 'RTX',
  foto: 'https://cdn.shopapi.dev/notebook.jpg',
  preco: 5999.9,
  estoque: 12,
  categoria: {
    categoriaId: 1,
    titulo: 'Informática',
  },
} as const;

export const cartCheckoutFlowCustomer = {
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

export const cartCheckoutFlowOrder = {
  pedidoId: 9999,
  clienteId: 20,
  dataPedido: '2026-07-10T12:00:00-03:00',
  formaPagamento: 'Boleto',
  status: 'Criado',
  valorTotal: 5999.9,
} as const;
