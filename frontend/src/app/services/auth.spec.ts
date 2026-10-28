import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import type { Sessao, Usuario } from './api';
import { Api } from './api';
import { Auth } from './auth';
import { SessionStorage } from './session-storage';

describe('Auth', () => {
  const user: Usuario = { nome: 'Maria', email: 'maria@exemplo.com', role: 'CLIENTE' };
  let auth: Auth;
  let api: { login: ReturnType<typeof vi.fn>; obterUsuario: ReturnType<typeof vi.fn> };
  let storage: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn>; clear: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    api = { login: vi.fn(), obterUsuario: vi.fn() };
    storage = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: Api, useValue: api },
        { provide: SessionStorage, useValue: storage },
      ],
    });
    auth = TestBed.inject(Auth);
  });
  it('salva a sessão e identifica a home após login', async () => {
    api.login.mockReturnValue(of({ ...user, token: 'token' } satisfies Sessao));
    await auth.entrar(' Maria@Exemplo.com ', 'senha');
    expect(api.login).toHaveBeenCalledWith('maria@exemplo.com', 'senha');
    expect(storage.set).toHaveBeenCalledWith('token');
    expect(auth.home).toBe('/home-cliente');
    expect(auth.usuario()).toEqual(user);
  });
  it('não salva sessão quando as credenciais falham', async () => {
    api.login.mockReturnValue(throwError(() => new Error('inválido')));
    await expect(auth.entrar('email', 'senha')).rejects.toThrow();
    expect(storage.set).not.toHaveBeenCalled();
    expect(auth.usuario()).toBeNull();
  });
  it('rejeita tipo de conta desconhecido', async () => {
    api.login.mockReturnValue(of({ ...user, role: 'USER', token: 'token' }));
    await expect(auth.entrar('email', 'senha')).rejects.toThrow('Não foi possível identificar o tipo desta conta');
    expect(storage.set).not.toHaveBeenCalled();
  });
  it('valida a sessão salva no backend apenas uma vez', async () => {
    storage.get.mockResolvedValue('token');
    api.obterUsuario.mockReturnValue(of(user));
    await Promise.all([auth.restaurar(), auth.restaurar()]);
    expect(api.obterUsuario).toHaveBeenCalledTimes(1);
    expect(auth.usuario()).toEqual(user);
  });
  it('limpa a sessão inválida ao restaurar', async () => {
    storage.get.mockResolvedValue('expirado');
    api.obterUsuario.mockReturnValue(throwError(() => new Error('401')));
    await auth.restaurar();
    expect(auth.token).toBeNull();
    expect(auth.usuario()).toBeNull();
    expect(storage.clear).toHaveBeenCalled();
  });
  it('remove os dados ao sair', async () => {
    api.login.mockReturnValue(of({ ...user, token: 'token' }));
    await auth.entrar('email', 'senha');
    await auth.logout();
    expect(auth.usuario()).toBeNull();
    expect(auth.token).toBeNull();
    expect(storage.clear).toHaveBeenCalled();
  });
});
