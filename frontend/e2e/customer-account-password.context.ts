export const customerAccountPasswordSession = {
  token: 'jwt-token',
  tipo: 'Bearer',
  expiraEm: '2099-07-11T12:00:00Z',
  usuarioId: 10,
  clienteId: 20,
  email: 'cliente@shopapi.dev',
} as const;

export const customerAccountPasswordProfile = {
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

export const customerAccountPasswordUpdateResponse = {
  clienteId: 20,
} as const;

