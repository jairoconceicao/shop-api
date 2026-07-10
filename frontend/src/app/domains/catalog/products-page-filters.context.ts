import { inject, signal, type Signal } from '@angular/core';

import { CategoryService } from '@core/category/category.service';
import type { Category } from '@shared/models';

import { createRemoteSectionState } from '../home/home-page.context';

export interface ProductsPageFiltersState {
  readonly categories: Signal<readonly Category[]>;
  readonly isLoadingCategories: Signal<boolean>;
  readonly categoriesError: Signal<string | null>;
  readonly isCategoriesEmpty: Signal<boolean>;
  readonly selectedCategoryId: Signal<number | null>;
  reloadCategories(): void;
  selectCategory(categoryId: number | null): void;
}

export function createProductsPageFiltersState(
  initialCategoryId: number | null = null,
): ProductsPageFiltersState {
  const categoryService = inject(CategoryService);
  const selectedCategoryId = signal<number | null>(initialCategoryId);

  const categoriesState = createRemoteSectionState<Category>(
    () => categoryService.listPublicCategories(),
    'Nao foi possivel carregar as categorias. Tente novamente.',
  );

  return {
    categories: categoriesState.items,
    isLoadingCategories: categoriesState.isLoading,
    categoriesError: categoriesState.error,
    isCategoriesEmpty: categoriesState.isEmpty,
    selectedCategoryId,
    reloadCategories: categoriesState.reload,
    selectCategory(categoryId: number | null): void {
      selectedCategoryId.set(categoryId);
    },
  };
}
