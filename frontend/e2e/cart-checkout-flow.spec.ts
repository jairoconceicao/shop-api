import { expect, test } from '@playwright/test';

const session = {
  token: 'jwt-token',
  tipo: 'Bearer',
  expiraEm: '2026-07-11T12:00:00Z',
  usuarioId: 10,
  clienteId: 20,
  email: 'cliente@shopapi.dev',
};

test('adds a product to the cart and finalizes the order', async ({ page }) => {
  await page.addInitScript((authSession) => {
    localStorage.setItem('shop-api.auth.session', JSON.stringify(authSession));
  }, session);

  await page.route('**/api/v1/produto/101', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Produto carregado com sucesso.',
        data: {
          produtoId: 101,
          titulo: 'Notebook Gamer',
          descricao: 'Notebook para jogos',
          modelo: 'RTX',
          foto: 'https://cdn.shopapi.dev/notebook.jpg',
          preco: 5999.9,
          estoque: 12,
          categoria: {
            categoriaId: 1,
            titulo: 'Informática',
          },
        },
      }),
    });
  });

  await page.route('**/api/v1/carrinho/items', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Item adicionado ao carrinho.',
        data: {
          itemId: 55,
        },
      }),
    });
  });

  await page.route('**/api/v1/cliente/20', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Cliente carregado com sucesso.',
        data: {
          clienteId: 20,
          cpf: '12345678901',
          nome: 'Cliente Shop',
          dataNascimento: '1990-01-01',
          email: 'cliente@shopapi.dev',
          endereco: {
            logradouro: 'Rua Central',
            numero: '100',
            complemento: 'Apto 12',
            cep: '01001000',
            bairro: 'Centro',
            cidade: 'Sao Paulo',
            uf: 'SP',
          },
          celular: {
            ddd: '11',
            numero: '999999999',
            whatsApp: true,
          },
        },
      }),
    });
  });

  await page.route('**/api/v1/pedido', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Pedido criado com sucesso.',
        data: {
          pedidoId: 9999,
          clienteId: 20,
          dataPedido: '2026-07-10T12:00:00-03:00',
          formaPagamento: 'Boleto',
          status: 'Criado',
          valorTotal: 5999.9,
        },
      }),
    });
  });

  await page.goto('/products/101');

  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

  await page.getByRole('link', { name: 'Carrinho' }).click();

  await expect(page.getByRole('heading', { name: 'Produtos no carrinho' })).toBeVisible();
  await expect(page.getByText('Produto #101')).toBeVisible();
  await expect(page.getByText('Item #55')).toBeVisible();
  await expect(page.getByText('R$ 5.999,90').first()).toBeVisible();

  await page.getByRole('button', { name: 'Finalizar compra' }).click();

  await expect(page.getByRole('heading', { name: 'Finalize sua compra com segurança.' })).toBeVisible();
  await expect(page.getByText('Rua Central')).toBeVisible();
  const paymentMethod = page.getByRole('combobox', { name: 'Forma de pagamento' });
  await expect(paymentMethod).toHaveValue('Pix');

  await paymentMethod.selectOption('Boleto');
  await expect(paymentMethod).toHaveValue('Boleto');

  await page.getByRole('button', { name: 'Finalizar pedido' }).click();

  await expect(page.getByRole('heading', { name: 'Seu pedido foi criado com sucesso' })).toBeVisible();
  await expect(page.getByText('Pedido confirmado')).toBeVisible();
  await expect(page.getByText(/O pedido #9999 foi confirmado/i)).toBeVisible();
  await expect(page.getByText('Boleto', { exact: true })).toBeVisible();
});
