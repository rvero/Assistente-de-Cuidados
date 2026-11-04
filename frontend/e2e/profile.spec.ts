import { expect, test, type Page } from '@playwright/test';

async function entrar(page: Page): Promise<void> {
  await page.route('**/api/contatos', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/conta', (route) =>
    route.fulfill({ json: { nome: 'Carlos Silva', email: 'perfil@example.test', cpf: '52998224725' } }),
  );
  await page.route('**/auth/login', (route) =>
    route.fulfill({
      json: { nome: 'Carlos Silva', email: 'perfil@example.test', role: 'CUIDADOR', token: 'token-teste' },
    }),
  );
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('perfil@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Navegação da conta' })
    .getByRole('link', { name: 'Opções', exact: true })
    .click();
  await expect(page.getByRole('link', { name: 'Editar perfil', exact: true })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Editar perfil profissional', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Editar perfil', exact: true }).click();
}
const profile = {
  nomeCuidador: 'Carlos cuidador',
  nomeSocial: '',
  dataNascimento: '1985-01-01',
  genero: 'outro',
  descricao: 'Apresentação inicial',
  curriculoUrl: '',
};
test('cuidador edita dados sensíveis e públicos em uma única tela e salvamento', async ({ page }) => {
  await page.route('**/cuidador/perfil', (route) => route.fulfill({ json: profile }));
  let saved = false;
  await page.route('**/api/conta/perfil-cuidador', (route) => {
    const body = route.request().postDataJSON();
    expect(body.conta).toMatchObject({ nome: 'Carlos Silva', cpf: '52998224725', senhaAtual: '123456' });
    expect(body.perfil.descricao).toBe('Atualização do perfil');
    saved = true;
    return route.fulfill({
      json: { nome: 'Carlos Silva', email: 'perfil@example.test', role: 'CUIDADOR', token: 'token-atualizado' },
    });
  });
  await entrar(page);
  const sensitive = page.getByRole('region', { name: 'Dados sensíveis', exact: true });
  const publicData = page.getByRole('region', { name: 'Dados públicos', exact: true });
  await expect(sensitive.getByLabel('CPF', { exact: true })).toHaveValue('52998224725');
  await expect(sensitive.getByLabel('Data de nascimento', { exact: true })).toHaveValue('1985-01-01');
  await expect(publicData.getByLabel('Experiência profissional', { exact: true })).toHaveValue('Apresentação inicial');
  await expect(publicData.getByLabel('CPF', { exact: true })).toHaveCount(0);
  await publicData.getByLabel('Experiência profissional', { exact: true }).fill('Atualização do perfil');
  await sensitive.getByLabel('Senha atual', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Perfil atualizado');
  expect(saved).toBe(true);
});
test('falha ao carregar perfil profissional bloqueia o salvamento conjunto', async ({ page }) => {
  let failed = true;
  await page.route('**/cuidador/perfil', (route) => route.fulfill(failed ? { status: 503 } : { json: profile }));
  await entrar(page);
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Salvar alterações', exact: true })).toHaveCount(0);
  failed = false;
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Salvar alterações', exact: true })).toBeVisible();
});
