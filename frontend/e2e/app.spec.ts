import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/cuidadores', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/contatos', (route) => route.fulfill({ json: [] }));
});

test('mostra início e protege as homes sem sessão', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Assistente de Cuidados' })).toBeVisible();
  await page.goto('/home-cliente');
  await expect(page).toHaveURL(/\/login$/);
});

for (const role of ['CLIENTE', 'CUIDADOR']) {
  test('login, restauração, guard e logout de ' + role, async ({ page }) => {
    const user = { nome: 'Maria', email: 'maria@exemplo.com', role };
    await page.route('**/auth/login', async (route) => {
      expect(route.request().postDataJSON()).toEqual({ email: user.email, password: '123456' });
      await route.fulfill({ json: { ...user, token: 'teste-token' } });
    });
    await page.route('**/users/me', async (route) => {
      expect(route.request().headers()['authorization']).toBe('Bearer teste-token');
      await route.fulfill({ json: user });
    });
    await page.goto('/login');
    await page.getByLabel('E-mail', { exact: true }).fill(user.email);
    await page.getByLabel('Senha', { exact: true }).fill('123456');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    const home = role === 'CLIENTE' ? 'busca' : 'home-cuidador';
    const title = role === 'CLIENTE' ? 'Buscar cuidador' : 'Contatos recebidos';
    await expect(page).toHaveURL(new RegExp('/' + home + '$'));
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await page.goto(role === 'CLIENTE' ? '/home-cuidador' : '/admin');
    await expect(page).toHaveURL(new RegExp('/' + home + '$'));
    await page
      .getByRole('navigation', { name: 'Navegação da conta' })
      .getByRole('link', { name: 'Opções', exact: true })
      .click();
    await page.getByRole('button', { name: 'Sair da conta', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(await page.evaluate(() => localStorage.getItem('assistente-token'))).toBeNull();
  });

  test('cadastra ' + role + ' usando o contrato da API do projeto', async ({ page }) => {
    await page.route('**/auth/register', async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        cpf: '52998224725',
        nome: 'Maria',
        email: 'maria@exemplo.com',
        password: '123456',
        tipo: role,
      });
      await route.fulfill({ status: 201, json: { message: 'Usuário cadastrado com sucesso' } });
    });
    await page.goto('/cadastro');
    if (role === 'CUIDADOR') await page.getByRole('radio', { name: 'Cuidador', exact: true }).click();
    await page.getByLabel('Nome completo', { exact: true }).fill('Maria');
    await page.getByLabel('CPF', { exact: true }).fill('529.982.247-25');
    await page.getByLabel('E-mail', { exact: true }).fill('maria@exemplo.com');
    await page.getByLabel('Senha', { exact: true }).fill('123456');
    await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('status')).toContainText('Conta criada');
  });
}
test('limpa sessão expirada na abertura', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('assistente-token', 'expirado'));
  await page.route('**/users/me', (route) => route.fulfill({ status: 401 }));
  await page.goto('/home-cliente');
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('assistente-token'))).toBeNull();
});
test('cadastro com erro não mostra sucesso', async ({ page }) => {
  await page.route('**/auth/register', (route) => route.fulfill({ status: 409 }));
  await page.goto('/cadastro');
  await page.getByLabel('Nome completo', { exact: true }).fill('Maria');
  await page.getByLabel('CPF', { exact: true }).fill('529.982.247-25');
  await page.getByLabel('E-mail', { exact: true }).fill('maria@exemplo.com');
  await page.getByLabel('Senha', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Este e-mail já está cadastrado');
  await expect(page).toHaveURL(/\/cadastro$/);
});

test('início permite escolher imagens e acessar login e cadastro', async ({ page }) => {
  await page.goto('/inicio');
  await page.getByRole('button', { name: 'Mostrar imagem 3' }).click();
  await expect(page.getByRole('button', { name: 'Pausar imagens' })).toHaveCount(0);
  await expect(page.locator('.hero-copy')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Mostrar imagem 3' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /Entrar com (Google|Facebook|Apple)/ })).toHaveCount(0);
  await page.getByRole('link', { name: 'Entrar com e-mail' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/inicio');
  await page.getByRole('link', { name: 'Criar conta', exact: true }).click();
  await expect(page).toHaveURL(/\/cadastro$/);
});
