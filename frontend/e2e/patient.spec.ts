import { expect, test } from '@playwright/test';

const paciente = {
  nomePaciente: 'Ana exemplo',
  finalidade: 'pos_operatorio',
  alergias: 'Alergia exemplo',
  recomendacoes: 'Orientação exemplo',
};
test('família edita dados do paciente pelo novo botão', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('assistente-token', 'teste'));
  await page.route('**/users/me', (r) =>
    r.fulfill({ json: { nome: 'Família', email: 'familia@example.test', role: 'CLIENTE' } }),
  );
  let saved = false;
  await page.route('**/api/cliente/paciente', (r) => {
    if (r.request().method() === 'PUT') {
      expect(r.request().postDataJSON().nomePaciente).toBe('Nome atualizado');
      saved = true;
    }
    return r.fulfill({ json: paciente });
  });
  await page.goto('/opcoes');
  await page.getByRole('link', { name: 'Editar dados do paciente', exact: true }).click();
  await expect(page.getByLabel('Nome do paciente', { exact: true })).toHaveValue('Ana exemplo');
  await page.getByLabel('Nome do paciente', { exact: true }).fill('Nome atualizado');
  await page.getByRole('button', { name: 'Salvar dados do paciente', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Dados do paciente atualizados');
  expect(saved).toBe(true);
});
test('cuidador abre dados do paciente pelo contato recebido', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('assistente-token', 'teste'));
  await page.route('**/users/me', (r) =>
    r.fulfill({ json: { nome: 'Cuidador', email: 'cuidador@example.test', role: 'CUIDADOR' } }),
  );
  await page.route('**/api/contatos', (r) =>
    r.fulfill({
      json: [{ id: 77, nome: 'Família exemplo', email: 'familia@example.test', criadoEm: '2026-11-18T12:00:00Z' }],
    }),
  );
  await page.route('**/api/contatos/77', (r) =>
    r.fulfill({ json: { nome: 'Família exemplo', email: 'familia@example.test', paciente } }),
  );
  await page.goto('/home-cuidador');
  await expect(page.getByRole('link', { name: /Escrever e-mail/ })).toHaveCount(0);
  await page.getByRole('link', { name: /Ver dados do paciente/ }).click();
  await expect(page).toHaveURL(/\/contatos\/77$/);
  await expect(page.getByRole('link', { name: /Escrever e-mail/ })).toHaveAttribute(
    'href',
    'mailto:familia@example.test',
  );
  await expect(page.getByText('Ana exemplo', { exact: true })).toBeVisible();
  await expect(page.getByText('Alergia exemplo', { exact: true })).toBeVisible();
  await expect(page.getByText('Orientação exemplo', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Salvar dados do paciente' })).toHaveCount(0);
});
