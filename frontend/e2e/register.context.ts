export const registerClientSession = {
  clienteId: 21,
} as const;

export const registerClientForm = {
  nome: 'Cliente Shop',
  cpf: '123.456.789-01',
  dataNascimento: '1990-01-01',
  email: 'cliente.novo@shopapi.dev',
  senha: '12345678',
  endereco: {
    logradouro: 'Rua Central',
    numero: '100',
    complemento: 'Apto 10',
    cep: '01001-000',
    bairro: 'Centro',
    cidade: 'Sao Paulo',
    uf: 'SP',
  },
  celular: {
    ddd: '11',
    numero: '99999-9999',
    whatsApp: true,
  },
} as const;
