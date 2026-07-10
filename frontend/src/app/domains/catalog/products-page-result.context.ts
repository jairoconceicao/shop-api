import { computed, type Signal } from '@angular/core';

export interface ProductsPageResultState {
  readonly hasAppliedFilters: Signal<boolean>;
  readonly emptyStateEyebrow: Signal<string>;
  readonly emptyStateTitle: Signal<string>;
  readonly emptyStateDescription: Signal<string>;
}

export function createProductsPageResultState(
  searchword: Signal<string>,
  selectedCategoryId: Signal<number | null>,
  selectedCategoryLabel: Signal<string | null>,
): ProductsPageResultState {
  const hasSearchword = computed(() => searchword().trim().length > 0);
  const hasCategoryFilter = computed(() => selectedCategoryId() !== null);
  const hasAppliedFilters = computed(() => hasSearchword() || hasCategoryFilter());

  return {
    hasAppliedFilters,
    emptyStateEyebrow: computed(() =>
      hasSearchword()
        ? 'Busca vazia'
        : hasCategoryFilter()
          ? 'Categoria vazia'
          : 'Catalogo vazio',
    ),
    emptyStateTitle: computed(() =>
      hasSearchword()
        ? `Nenhum resultado para "${searchword().trim()}"`
        : hasCategoryFilter()
          ? selectedCategoryLabel()
            ? `Nenhum produto em ${selectedCategoryLabel()}`
            : 'Nenhum produto nesta categoria'
          : 'Nenhum produto disponivel',
    ),
    emptyStateDescription: computed(() =>
      hasAppliedFilters()
        ? 'Limpe a busca ou o filtro de categoria para voltar ao catalogo completo.'
        : 'Assim que a API retornar produtos publicos, eles aparecerao aqui.',
    ),
  };
}
