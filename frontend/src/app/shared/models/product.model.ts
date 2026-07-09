import type { EntityId } from './common.model';
import type { ProductCategory } from './category.model';

export interface ProductCatalogItem {
  produtoId: EntityId;
  titulo: string;
  thumb: string | null;
  preco: number | string;
  estoque: number | string;
  categoria: ProductCategory;
}

export interface ProductDetails {
  produtoId: EntityId;
  titulo: string;
  descricao: string | null;
  modelo: string | null;
  foto: string | null;
  preco: number | string;
  estoque: number | string;
  categoria: ProductCategory;
}

