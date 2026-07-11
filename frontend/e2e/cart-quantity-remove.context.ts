export const cartQuantityRemoveSession = {
  token: 'jwt-token',
  tipo: 'Bearer',
  expiraEm: '2099-07-11T12:00:00Z',
  usuarioId: 10,
  clienteId: 20,
  email: 'cliente@shopapi.dev',
} as const;

export const cartQuantityRemoveProduct = {
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

