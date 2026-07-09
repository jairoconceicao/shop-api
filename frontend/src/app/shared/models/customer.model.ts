import type { EntityId, IsoDateString } from './common.model';

export interface CustomerAddress {
  logradouro: string;
  numero: string;
  complemento: string | null;
  cep: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface CustomerCellphone {
  ddd: string;
  numero: string;
  whatsApp: boolean;
}

export interface CustomerCreateRequest {
  senha: string;
  cpf: string;
  nome: string;
  dataNascimento: IsoDateString;
  email: string;
  endereco: CustomerAddress;
  celular: CustomerCellphone;
}

export interface CustomerUpdateRequest {
  cpf: string;
  nome: string;
  dataNascimento: IsoDateString;
  email: string;
  endereco: CustomerAddress;
  celular: CustomerCellphone;
}

export interface CustomerUpdatePasswordRequest {
  senhaAtual: string;
  senhaNova: string;
}

export interface CustomerIdResponse {
  clienteId: EntityId;
}

export interface CustomerDetails {
  clienteId: EntityId;
  cpf: string;
  nome: string;
  dataNascimento: IsoDateString;
  email: string;
  endereco: CustomerAddress;
  celular: CustomerCellphone;
}

