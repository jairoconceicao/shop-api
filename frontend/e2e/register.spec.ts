import { expect, test } from '@playwright/test';

import { registerClientForm, registerClientSession } from './register.context';

test('allows a customer to create an account and redirects to login', async ({ page }) => {
  await page.route('**/api/v1/cliente', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Conta criada com sucesso.',
        data: registerClientSession,
      }),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/cadastro');

  await expect(page).toHaveURL('/cadastro');
  await expect(page.getByRole('heading', { name: 'Dados pessoais, endereco e celular' })).toBeVisible();

  await page.getByLabel('Nome completo').fill(registerClientForm.nome);
  await page.getByLabel('CPF').fill(registerClientForm.cpf);
  await page.getByLabel('Data de nascimento').fill(registerClientForm.dataNascimento);
  await page.getByLabel('E-mail').fill(registerClientForm.email);
  await page.getByLabel('Senha').fill(registerClientForm.senha);
  await page.getByLabel('CEP').fill(registerClientForm.endereco.cep);
  await page.getByLabel('Logradouro').fill(registerClientForm.endereco.logradouro);
  await page.getByRole('textbox', { name: 'Numero' }).fill(registerClientForm.endereco.numero);
  await page.getByLabel('Complemento').fill(registerClientForm.endereco.complemento);
  await page.getByLabel('Bairro').fill(registerClientForm.endereco.bairro);
  await page.getByLabel('Cidade').fill(registerClientForm.endereco.cidade);
  await page.getByLabel('UF').selectOption(registerClientForm.endereco.uf);
  await page.getByLabel('DDD').fill(registerClientForm.celular.ddd);
  await page.getByLabel('Telefone celular').fill(registerClientForm.celular.numero);
  await page.getByRole('checkbox', { name: 'Este numero usa WhatsApp' }).check();

  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: /Acesse sua conta/i })).toBeVisible();
});
