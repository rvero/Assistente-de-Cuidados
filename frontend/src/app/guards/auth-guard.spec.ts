import { TestBed } from '@angular/core/testing';
import type { RouterStateSnapshot } from '@angular/router';
import { ActivatedRouteSnapshot, Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { Auth } from '../services/auth';

import { authGuard, guestGuard } from './auth-guard';

describe('guards de autenticação', () => {
  const auth = { restaurar: vi.fn().mockResolvedValue(undefined), usuario: vi.fn(), home: '/home-cliente' };
  beforeEach(() => {
    auth.usuario.mockReturnValue(null);
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: Auth, useValue: auth }] });
  });
  async function check(tipo: string) {
    const route = new ActivatedRouteSnapshot();
    route.data = { tipo };
    return TestBed.runInInjectionContext(() => authGuard(route, {} as RouterStateSnapshot));
  }
  it('envia visitante ao login', async () => {
    expect(TestBed.inject(Router).serializeUrl((await check('CLIENTE')) as never)).toBe('/login');
  });
  it('permite acesso à home do próprio tipo', async () => {
    auth.usuario.mockReturnValue({ role: 'CLIENTE' });
    expect(await check('CLIENTE')).toBe(true);
  });
  it('redireciona quando tenta acessar a home do outro tipo', async () => {
    auth.usuario.mockReturnValue({ role: 'CLIENTE' });
    expect(TestBed.inject(Router).serializeUrl((await check('CUIDADOR')) as never)).toBe('/home-cliente');
  });
  it('abre a home ao restaurar usuário em rota pública', async () => {
    auth.usuario.mockReturnValue({ role: 'CLIENTE' });
    const result = await TestBed.runInInjectionContext(() =>
      guestGuard(new ActivatedRouteSnapshot(), {} as RouterStateSnapshot),
    );
    expect(TestBed.inject(Router).serializeUrl(result as never)).toBe('/home-cliente');
  });
});
