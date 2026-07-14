import { describe, expect, it } from 'vitest'

import {
  adaptCatalogResponse,
  adaptCategoriesResponse,
  adaptProductDetailResponse,
} from './catalog'

const transportCategory = {
  categoriaId: '12',
  titulo: 'Hardware',
}

const transportProduct = {
  produtoId: '42',
  titulo: 'Teclado mecânico',
  thumb: null,
  preco: '349.90',
  estoque: '8.75',
  categoria: transportCategory,
}

describe('adaptCategoriesResponse', () => {
  it('normalizes category IDs and preserves nullable descriptions', () => {
    expect(
      adaptCategoriesResponse({
        status: true,
        data: [
          { ...transportCategory, descricao: 'Componentes e periféricos' },
          { categoriaId: 13, titulo: 'Games', descricao: null },
        ],
      }),
    ).toEqual([
      {
        id: 12,
        title: 'Hardware',
        description: 'Componentes e periféricos',
      },
      { id: 13, title: 'Games', description: null },
    ])
  })

  it.each([
    {},
    { status: true, data: null },
    { status: false, data: [] },
  ])('rejects an unsuccessful category envelope', (response) => {
    expect(() => adaptCategoriesResponse(response)).toThrow(
      'Category response does not contain successful data',
    )
  })
})

describe('adaptCatalogResponse', () => {
  it('normalizes products and pagination returned as transport strings', () => {
    expect(
      adaptCatalogResponse({
        status: true,
        pagination: {
          pages: '3',
          size: '20',
          totalItems: '41',
          data: [transportProduct],
        },
      }),
    ).toEqual({
      products: [
        {
          id: 42,
          title: 'Teclado mecânico',
          thumbnail: null,
          price: 349.9,
          stock: 8.75,
          category: { id: 12, title: 'Hardware' },
        },
      ],
      pagination: { pages: 3, size: 20, totalItems: 41 },
    })
  })

  it.each([
    {},
    { status: true, pagination: {} },
    {
      status: true,
      pagination: { pages: 0, size: 20, totalItems: 0, data: undefined },
    },
    {
      status: false,
      pagination: { pages: 0, size: 20, totalItems: 0, data: [] },
    },
  ])('rejects an incomplete catalog envelope', (response) => {
    expect(() => adaptCatalogResponse(response)).toThrow(
      'Catalog response does not contain successful pagination data',
    )
  })
})

describe('adaptProductDetailResponse', () => {
  it('normalizes a product detail and preserves nullable optional content', () => {
    expect(
      adaptProductDetailResponse({
        status: true,
        data: {
          ...transportProduct,
          descricao: null,
          modelo: 'TK-42',
          foto: null,
        },
      }),
    ).toEqual({
      id: 42,
      title: 'Teclado mecânico',
      description: null,
      model: 'TK-42',
      photo: null,
      price: 349.9,
      stock: 8.75,
      category: { id: 12, title: 'Hardware' },
    })
  })

  it.each([
    {},
    { status: true, data: null },
    {
      status: false,
      data: {
        ...transportProduct,
        descricao: null,
        modelo: null,
        foto: null,
      },
    },
  ])('rejects an unsuccessful product detail envelope', (response) => {
    expect(() => adaptProductDetailResponse(response)).toThrow(
      'Product detail response does not contain successful data',
    )
  })

  it('rejects malformed numeric transport values', () => {
    expect(() =>
      adaptProductDetailResponse({
        status: true,
        data: {
          ...transportProduct,
          produtoId: '042',
          descricao: null,
          modelo: null,
          foto: null,
        },
      }),
    ).toThrow()
  })
})
