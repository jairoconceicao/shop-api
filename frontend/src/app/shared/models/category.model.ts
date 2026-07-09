import type { EntityId } from './common.model';

export interface Category {
  categoriaId: EntityId;
  titulo: string;
  descricao: string;
}

export interface ProductCategory {
  categoriaId: EntityId;
  titulo: string;
}

