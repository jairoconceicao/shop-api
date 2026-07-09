import type { EntityId, IsoDateTimeString } from './common.model';

export interface CartItem {
  itemId: EntityId;
  produtoId: EntityId;
  quantidade: number | string;
  valorUnitario: number | string;
}

export interface Cart {
  clienteId: EntityId;
  carrinhoId: EntityId;
  dataCarrinho: IsoDateTimeString;
  items: CartItem[];
}

export interface CartCreated {
  carrinhoId: EntityId;
  dataCarrinho: IsoDateTimeString;
}

export interface CartItemId {
  itemId: EntityId;
  produtoId: EntityId;
}

export interface AddCartItemRequest {
  produtoId: EntityId;
  quantidade: number | string;
  valorUnitario: number | string;
}

export interface UpdateCartItemRequest {
  quantidade: number | string;
}

export interface AddCartItemResponse {
  itemId: EntityId;
}

