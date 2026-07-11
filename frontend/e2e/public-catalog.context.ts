export const publicCatalogHomeFeaturedProduct = {
  produtoId: 101,
  titulo: 'Notebook Gamer',
  thumb: null,
  preco: 5999.9,
  estoque: 12,
  categoria: {
    categoriaId: 1,
    titulo: 'Informática',
  },
} as const;

export const publicCatalogSearchProduct = {
  produtoId: 102,
  titulo: 'Notebook Gamer Pro',
  thumb: null,
  preco: 7999.9,
  estoque: 4,
  categoria: {
    categoriaId: 1,
    titulo: 'Informática',
  },
} as const;

export const publicCatalogCategory = {
  categoriaId: 1,
  titulo: 'Informática',
  descricao: 'Produtos de tecnologia',
} as const;
