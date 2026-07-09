import type { EntityId, IsoDateTimeString } from './common.model';

export interface AuthLoginRequest {
  email: string;
  senha: string;
}

export interface AuthLoginResponse {
  token: string;
  tipo: string;
  expiraEm: IsoDateTimeString;
  usuarioId: EntityId;
  clienteId: EntityId;
  email: string;
}

export interface AuthLogoutResponse {
  jti: string;
  revogadaEm: IsoDateTimeString;
}

export type AuthSession = AuthLoginResponse;

