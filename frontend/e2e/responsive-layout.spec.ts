import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'mobile pequeno', width: 375, height: 812 },
  { name: 'mobile grande', width: 428, height: 926 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1440, height: 1024 },
] as const;

test.describe('responsive layout', () => {
  for (const viewport of viewports) {
    test(`adapts the shell and catalog at ${viewport.name}`, async ({ page }) => {
      await page.route('**/api/v1/categoria**', async (route) => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            status: true,
            message: 'Categorias carregadas com sucesso.',
            data: [
              {
                categoriaId: 1,
                titulo: 'Informática',
                descricao: 'Produtos de tecnologia',
              },
            ],
          }),
        });
      });

      await page.route('**/api/v1/produto**', async (route) => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            status: true,
            message: 'Catalogo de produtos carregado com sucesso.',
            pagination: {
              pages: 1,
              size: 8,
              totalItems: 3,
              data: [
                {
                  produtoId: 101,
                  titulo: 'Notebook Gamer',
                  thumb: null,
                  preco: 5999.9,
                  estoque: 12,
                  categoria: {
                    categoriaId: 1,
                    titulo: 'Informática',
                  },
                },
                {
                  produtoId: 102,
                  titulo: 'Mouse Gamer',
                  thumb: null,
                  preco: 129.9,
                  estoque: 20,
                  categoria: {
                    categoriaId: 1,
                    titulo: 'Informática',
                  },
                },
                {
                  produtoId: 103,
                  titulo: 'Teclado Mecânico',
                  thumb: null,
                  preco: 299.9,
                  estoque: 8,
                  categoria: {
                    categoriaId: 1,
                    titulo: 'Informática',
                  },
                },
              ],
            },
          }),
        });
      });

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/products');

      await expect(page.getByRole('heading', { name: /Explore produtos/i })).toBeVisible();
      await expect(page.getByLabel('Buscar produtos')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();

      const grid = page
        .locator('section')
        .filter({ has: page.getByRole('heading', { name: /Seleção pública/i }) })
        .locator('div.grid')
        .first();
      const gridColumns = await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns);

      if (viewport.width < 768) {
        await expect(page.getByRole('navigation', { name: 'Navegacao principal mobile' })).toBeVisible();
        expect(gridColumns.split(' ').length).toBe(2);
      } else if (viewport.width < 1024) {
        await expect(page.getByRole('navigation', { name: 'Navegacao principal mobile' })).toBeVisible();
        expect(gridColumns.split(' ').length).toBe(3);
      } else {
        await expect(page.getByRole('navigation', { name: 'Navegacao principal mobile' })).toBeHidden();
        await expect(page.getByRole('link', { name: 'Catalogo' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Carrinho' })).toBeVisible();
        expect(gridColumns.split(' ').length).toBe(5);
      }
    });
  }
});
