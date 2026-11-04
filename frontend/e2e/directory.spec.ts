import { expect, test, type Page } from '@playwright/test';

const carers = [
  { id: 10, nome: 'Carlos Silva', descricao: 'Experiência com idosos.', curriculoUrl: null, perfilCompleto: true },
  { id: 11, nome: 'Ana Santos', descricao: null, curriculoUrl: null, perfilCompleto: false },
];
async function session(page: Page, role = 'CLIENTE') {
  await page.route('**/api/cuidadores', (route) => route.fulfill({ json: [] }));
  await page.addInitScript(() => localStorage.setItem('assistente-token', 'teste-directory'));
  await page.route('**/users/me', (route) =>
    route.fulfill({ json: { nome: 'Teste', email: 'teste@example.test', role } }),
  );
}

test('busca inclui perfis incompletos, filtra por experiência e abre o perfil individual', async ({ page }) => {
  await session(page);
  await page.route('**/api/cuidadores', (route) => route.fulfill({ json: carers }));
  await page.route('**/api/cuidadores/10', (route) => route.fulfill({ json: carers[0] }));
  await page.goto('/busca');
  await expect(page.getByRole('heading', { name: 'Carlos Silva' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ana Santos' })).toBeVisible();
  await page.getByLabel('Nome ou experiência').fill('idosos');
  await expect(page.getByRole('heading', { name: 'Ana Santos' })).toHaveCount(0);
  await page.getByRole('link', { name: /Carlos Silva/ }).click();
  await expect(page).toHaveURL(/\/cuidadores\/10$/);
  await expect(page.getByText('Experiência com idosos.', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('Avaliações', { exact: true })).toHaveCount(0);
});

test('somente administrador acessa o painel', async ({ page }) => {
  await session(page);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/busca$/);
});

test('administrador consulta dados e confirma exclusão de conta', async ({ page }) => {
  await session(page, 'ADMIN');
  const accounts = [
    {
      id: 10,
      nome: 'Carlos Silva',
      email: 'carlos@example.test',
      cpf: '52998224725',
      role: 'CUIDADOR',
      cuidador: null,
      familia: null,
    },
    {
      id: 11,
      nome: 'Maria Santos',
      email: 'maria@example.test',
      cpf: null,
      role: 'CLIENTE',
      cuidador: null,
      familia: {
        nomePaciente: 'Paciente exemplo',
        dataNascimento: '1950-01-01',
        finalidade: 'assistencia_incapaz',
        alergias: 'Nenhuma',
        recomendacoes: 'Orientação exemplo',
      },
    },
  ];
  await page.route('**/api/admin/contas', (route) => route.fulfill({ json: accounts }));
  let deleted = 0;
  await page.route('**/api/admin/contas/10', (route) => {
    expect(route.request().method()).toBe('DELETE');
    deleted++;
    return route.fulfill({ status: 204 });
  });
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Gerenciar contas' })).toBeVisible();
  const family = page.locator('article').filter({ hasText: 'Maria Santos' });
  await family.getByText('Ver dados do perfil').click();
  await expect(page.getByText('Paciente exemplo', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Excluir conta de Carlos Silva', exact: true }).click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  expect(deleted).toBe(0);
  await page.getByRole('button', { name: 'Excluir conta de Carlos Silva', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('foi excluída');
  await expect(page.getByRole('heading', { name: 'Carlos Silva', exact: true })).toHaveCount(0);
  expect(deleted).toBe(1);
});
