export const authSessionFixture = {
  status: true,
  data: {
    token: 'token-7',
    tipo: 'Bearer',
    expiraEm: '2099-07-17T12:00:00Z',
    usuarioId: 3,
    clienteId: 7,
    email: 'ana@example.com',
  },
} as const
