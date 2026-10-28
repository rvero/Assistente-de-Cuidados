import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function entrar(page: Page, role: string): Promise<void> {
  await page.route('**/auth/login', (route) =>
    route.fulfill({ json: { nome: 'Pessoa teste', email: 'perfil@example.test', role, token: 'token-teste' } }),
  );
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('perfil@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByText('Meu perfil', { exact: true }).click();
}

for (const role of ['CLIENTE', 'CUIDADOR']) {
  test('carrega e salva perfil de ' + role, async ({ page }) => {
    let saved =
      role === 'CLIENTE'
        ? {
            nomePaciente: 'Paciente teste',
            dataNascimento: '1950-01-01',
            finalidade: 'pos_operatorio',
            alergias: '',
            recomendacoes: 'Orientações iniciais',
          }
        : {
            nomeCuidador: 'Cuidador teste',
            nomeSocial: '',
            dataNascimento: '1985-01-01',
            genero: 'outro',
            descricao: 'Apresentação inicial',
            curriculoUrl: '',
          };
    const endpoint = role === 'CLIENTE' ? '**/cliente/perfil' : '**/cuidador/perfil';
    await page.route(endpoint, async (route) => {
      if (route.request().method() === 'PUT') {
        const body = route.request().postDataJSON();
        expect(body.user_id).toBeUndefined();
        saved = body;
      }
      await route.fulfill({ json: saved });
    });
    await entrar(page, role);
    const label = role === 'CLIENTE' ? 'Orientações para o cuidado' : 'Experiência profissional';
    const field = page.locator('app-perfil').getByLabel(label, { exact: true });
    await expect(field).toHaveValue(role === 'CLIENTE' ? 'Orientações iniciais' : 'Apresentação inicial');
    await field.fill('Atualização do perfil');
    await page.getByRole('button', { name: 'Salvar perfil', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Dados do perfil salvos');
    expect(role === 'CLIENTE' ? saved.recomendacoes : saved.descricao).toBe('Atualização do perfil');
  });
}

test('falha ao carregar o perfil permite tentar novamente sem sobrescrever dados', async ({ page }) => {
  let failed = true;
  await page.route('**/cliente/perfil', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill(failed ? { status: 503 } : { status: 204 });
  });
  await entrar(page, 'CLIENTE');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Salvar perfil', exact: true })).toHaveCount(0);
  failed = false;
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Salvar perfil', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Salvar perfil', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('campos obrigatórios');
});
