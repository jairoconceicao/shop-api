import { inject } from '@angular/core';

import { CatalogService } from '@core/catalog/catalog.service';

import { createIncrementalSectionState } from '../home/home-featured-products.context';

export function createProductsCatalogState() {
  const catalogService = inject(CatalogService);

  return createIncrementalSectionState(
    ({ page, size }) => catalogService.listPublicProducts({ page, size }),
    'Nao foi possivel carregar o catalogo de produtos. Tente novamente.',
    8,
  );
}
