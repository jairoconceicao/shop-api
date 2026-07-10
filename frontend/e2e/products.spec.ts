import { expect, test } from '@playwright/test';

test('shows the public products catalog', async ({ page }) => {
  await page.route('**/api/v1/produto**', async (route) => {
    const url = new URL(route.request().url());
    const searchword = url.searchParams.get('searchword');

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(
        searchword === 'notebook gamer'
          ? {
              status: true,
              message: 'Catalogo de produtos carregado com sucesso.',
              pagination: {
                pages: 1,
                size: 8,
                totalItems: 1,
                data: [
                  {
                    produtoId: 102,
                    titulo: 'Notebook Gamer Pro',
                    thumb: null,
                    preco: 7999.9,
                    estoque: 4,
                    categoria: {
                      categoriaId: 1,
                      titulo: 'Informática',
                    },
                  },
                ],
              },
            }
          : {
              status: true,
              message: 'Catalogo de produtos carregado com sucesso.',
              pagination: {
                pages: 1,
                size: 8,
                totalItems: 1,
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
                ],
              },
            },
      ),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/products');

  await expect(page.getByRole('heading', { name: /Explore produtos/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver produto' })).toBeVisible();

  await page.getByLabel('Buscar produtos').fill('notebook gamer');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Notebook Gamer Pro' })).toBeVisible();
  await expect(page).toHaveURL(/searchword=notebook%20gamer/);
});

test('restores catalog filters from the URL query params', async ({ page }) => {
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
          {
            categoriaId: 2,
            titulo: 'Celulares',
            descricao: 'Smartphones e acessórios',
          },
        ],
      }),
    });
  });

  await page.route('**/api/v1/produto**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.includes('/categoria/2')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          message: 'Catalogo de produtos carregado com sucesso.',
          pagination: {
            pages: 1,
            size: 8,
            totalItems: 1,
            data: [
              {
                produtoId: 202,
                titulo: 'Smartphone Gamer',
                thumb: null,
                preco: 3999.9,
                estoque: 7,
                categoria: {
                  categoriaId: 2,
                  titulo: 'Celulares',
                },
              },
            ],
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Catalogo de produtos carregado com sucesso.',
        pagination: {
          pages: 1,
          size: 8,
          totalItems: 1,
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
          ],
        },
      }),
    });
  });

  await page.goto('/products?searchword=notebook%20gamer&categoriaId=2');

  await expect(page.getByLabel('Buscar produtos')).toHaveValue('notebook gamer');
  await expect(page.getByRole('button', { name: 'Celulares' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('heading', { name: 'Smartphone Gamer' })).toBeVisible();
  await expect(page).toHaveURL(/searchword=notebook%20gamer/);
  await expect(page).toHaveURL(/categoriaId=2/);
});
