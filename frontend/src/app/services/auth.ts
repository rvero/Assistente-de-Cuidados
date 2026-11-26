import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';

import type { Usuario, Sessao } from './api';
import { Api } from './api';
import { SessionStorage } from './session-storage';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly api = inject(Api);
  private readonly storage = inject(SessionStorage);
  private readonly currentUser = signal<Usuario | null>(null);
  readonly usuario = this.currentUser.asReadonly();
  token: string | null = null;
  private restoration?: Promise<void>;
  private contratoAtivo = false;
  definirContratoAtivo(ativo: boolean): void { this.contratoAtivo = ativo; }
  private async atualizarDestino(): Promise<void> {
    const token = this.token;
    this.contratoAtivo = false;
    if (this.usuario()?.role !== 'CLIENTE') return;
    try {
      const contrato = await firstValueFrom(this.api.obterContratoAtual().pipe(timeout(5000)));
      if (token === this.token) this.contratoAtivo = !!contrato && ['PENDENTE', 'ACEITO'].includes(contrato.status);
    } catch {
      // Falha na consulta de contratos não impede o acesso à busca.
    }
  }
  get home(): string {
    if (this.usuario()?.role === 'ADMIN') return '/admin';
    return this.usuario()?.role === 'CUIDADOR' ? '/home-cuidador' : this.contratoAtivo ? '/contrato' : '/busca';
  }
  private validate(user: Usuario): void {
    if (!user || !user.nome || !user.email || !['CLIENTE', 'CUIDADOR', 'ADMIN'].includes(user.role))
      throw new Error('Não foi possível identificar o tipo desta conta. Entre novamente.');
  }
  restaurar(): Promise<void> {
    return (this.restoration ??= this.restore());
  }
  private async restore(): Promise<void> {
    try {
      this.token = await this.storage.get();
      if (!this.token) return;
      const user = await firstValueFrom(this.api.obterUsuario());
      this.validate(user);
      this.currentUser.set(user);
      await this.atualizarDestino();
    } catch {
      await this.logout();
    }
  }
  async entrar(email: string, senha: string): Promise<void> {
    const response = await firstValueFrom(this.api.login(email.trim().toLowerCase(), senha));
    await this.atualizarSessao(response);
  }
  async atualizarSessao(response: Sessao): Promise<void> {
    this.validate(response);
    if (!response.token?.trim()) throw new Error('Não foi possível concluir a entrada. Tente novamente.');
    await this.storage.set(response.token);
    this.token = response.token;
    this.currentUser.set({ nome: response.nome, email: response.email, role: response.role });
    await this.atualizarDestino();
  }
  async logout(): Promise<void> {
    this.token = null;
    this.contratoAtivo = false;
    this.currentUser.set(null);
    await this.storage.clear();
  }
}
