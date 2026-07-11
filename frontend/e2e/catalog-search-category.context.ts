export const catalogSearchCategoryInitialProduct = {
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

export const catalogSearchCategorySearchProduct = {
  produtoId: 202,
  titulo: 'Notebook Gamer Pro',
  thumb: null,
  preco: 7999.9,
  estoque: 4,
  categoria: {
    categoriaId: 1,
    titulo: 'Informática',
  },
} as const;

export const catalogSearchCategoryCategoryProduct = {
  produtoId: 303,
  titulo: 'Smartphone Gamer',
  thumb: null,
  preco: 3999.9,
  estoque: 7,
  categoria: {
    categoriaId: 2,
    titulo: 'Celulares',
  },
} as const;

export const catalogSearchCategoryCategories = [
  {
    categoriaId: 1,
    titulo: 'Informática',
    descricao: 'Produtos de tecnologia',
  },
  {
    categoriaId: 2,
    titulo: 'Celulares',
    descricao: 'Smartphones e acessórios',
  },
] as const;
