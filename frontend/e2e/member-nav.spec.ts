import { expect, test, type Page } from '@playwright/test';

async function session(page: Page, role: string): Promise<void> {
  await page.route('**/api/cuidadores', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/contatos', (route) => route.fulfill({ json: [] }));
  await page.addInitScript(() => localStorage.setItem('assistente-token', 'member-nav-test'));
  await page.route('**/users/me', (route) =>
    route.fulfill({ json: { nome: 'Conta teste', email: 'conta@example.test', role } }),
  );
}
for (const role of ['CLIENTE', 'CUIDADOR']) {
  test('barra fixa e opções de ' + role, async ({ page }) => {
    await session(page, role);
    await page.goto(role === 'CLIENTE' ? '/busca' : '/home-cuidador');
    const nav = page.getByRole('navigation', { name: 'Navegação da conta' });
    await expect(nav).toBeVisible();
    await nav.getByRole('link', { name: 'Histórico', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Histórico de transações' })).toBeVisible();
    await expect(nav).toBeVisible();
    if (role === 'CUIDADOR') {
      await page.route('**/api/contatos', (route) => route.fulfill({ json: [] }));
      await nav.getByRole('link', { name: 'Contatos', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Contatos recebidos' })).toBeVisible();
    }
    await nav.getByRole('link', { name: 'Opções', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Opções da conta' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Excluir minha conta', exact: true })).toBeVisible();
  });
}
test('família edita somente dados da conta e recebe sessão atualizada', async ({ page }) => {
  await session(page, 'CLIENTE');
  await page.route('**/api/conta', (route) => {
    if (route.request().method() === 'PUT') {
      expect(route.request().postDataJSON()).toMatchObject({
        nome: 'Nome alterado',
        cpf: '52998224725',
        senhaAtual: '123456',
      });
      return route.fulfill({
        json: { nome: 'Nome alterado', email: 'conta@example.test', role: 'CLIENTE', token: 'novo-token' },
      });
    }
    return route.fulfill({ json: { nome: 'Conta teste', email: 'conta@example.test', cpf: '52998224725' } });
  });
  await page.goto('/opcoes/conta');
  await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue('Conta teste');
  await expect(page.getByLabel('Nome do paciente', { exact: false })).toHaveCount(0);
  await page.getByLabel('Nome completo', { exact: true }).fill('Nome alterado');
  await page.getByLabel('Senha atual', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Dados da conta atualizados');
  expect(await page.evaluate(() => localStorage.getItem('assistente-token'))).toBe('novo-token');
});
test('excluir a própria conta exige confirmação de senha e encerra sessão', async ({ page }) => {
  await session(page, 'CLIENTE');
  let deleted = 0;
  await page.route('**/api/conta', (route) => {
    expect(route.request().method()).toBe('DELETE');
    expect(route.request().postDataJSON()).toEqual({ senhaAtual: '123456' });
    deleted++;
    return route.fulfill({ status: 204 });
  });
  await page.goto('/opcoes');
  await page.getByRole('button', { name: 'Excluir minha conta', exact: true }).click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  expect(deleted).toBe(0);
  await page.getByRole('button', { name: 'Excluir minha conta', exact: true }).click();
  await page.getByLabel('Senha atual para excluir a conta', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(deleted).toBe(1);
  await expect(page.getByRole('navigation', { name: 'Navegação da conta' })).toHaveCount(0);
});

test('salvar conta atualiza sessão mesmo ao navegar para outra aba', async ({ page }) => {
  await session(page, 'CLIENTE');
  let finishSave: (() => void) | undefined;
  await page.route('**/api/conta', async (route) => {
    if (route.request().method() === 'PUT') {
      await new Promise<void>((resolve) => {
        finishSave = resolve;
      });
      return route.fulfill({
        json: { nome: 'Conta teste', email: 'novo@example.test', role: 'CLIENTE', token: 'token-apos-navegar' },
      });
    }
    return route.fulfill({ json: { nome: 'Conta teste', email: 'conta@example.test', cpf: '52998224725' } });
  });
  await page.goto('/opcoes/conta');
  await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue('Conta teste');
  await page.getByLabel('E-mail', { exact: true }).fill('novo@example.test');
  await page.getByLabel('Senha atual', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect.poll(() => !!finishSave).toBe(true);
  await page
    .getByRole('navigation', { name: 'Navegação da conta' })
    .getByRole('link', { name: 'Histórico', exact: true })
    .click();
  await expect(page).toHaveURL(/\/historico$/);
  await expect(page.locator('app-conta')).toBeHidden();
  finishSave?.();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('assistente-token'))).toBe('token-apos-navegar');
});
