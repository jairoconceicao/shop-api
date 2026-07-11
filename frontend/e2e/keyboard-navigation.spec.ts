import { expect, test } from '@playwright/test';

import {
  keyboardNavigationProduct,
  keyboardNavigationSession,
} from './keyboard-navigation.context';

test('supports keyboard-only login flow', async ({ page }) => {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Login realizado com sucesso.',
        data: keyboardNavigationSession,
      }),
    });
  });

  await page.goto('/login');

  await page.getByLabel('E-mail').focus();
  await expect(page.getByLabel('E-mail')).toBeFocused();
  await page.keyboard.type('cliente@shopapi.dev');

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Senha')).toBeFocused();
  await page.keyboard.type('12345678');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('checkbox', { name: 'Manter-me conectado' })).toBeFocused();
  await page.keyboard.press('Space');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL('/');
});

test('supports keyboard-only catalog search flow', async ({ page }) => {
  await page.route('**/api/v1/produto**', async (route) => {
    const url = new URL(route.request().url());
    const searchword = url.searchParams.get('searchword');

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Catalogo de produtos carregado com sucesso.',
        pagination: {
          pages: 1,
          size: 8,
          totalItems: 1,
          data:
            searchword === 'notebook gamer'
              ? [
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
                ]
              : [
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

  await page.goto('/products');

  const catalogSearchInput = page.locator('input[placeholder="Procure por nome, marca ou categoria"]');
  await catalogSearchInput.focus();
  await expect(catalogSearchInput).toBeFocused();
  await page.keyboard.type('notebook gamer');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Notebook Gamer Pro' })).toBeVisible();
  await expect(page).toHaveURL(/searchword=notebook%20gamer/);
});

test('supports keyboard-only product details actions', async ({ page }) => {
  await page.route('**/api/v1/produto/101', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Produto carregado com sucesso.',
        data: keyboardNavigationProduct,
      }),
    });
  });

  await page.goto('/products/101');

  await page.getByRole('button', { name: 'Comprar agora' }).focus();
  await expect(page.getByRole('button', { name: 'Comprar agora' })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeFocused();
  await page.keyboard.press('Space');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Voltar ao catalogo' })).toBeFocused();
});
