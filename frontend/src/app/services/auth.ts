import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { Usuario } from './api';
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
  get home(): string {
    return this.usuario()?.role === 'CUIDADOR' ? '/home-cuidador' : '/home-cliente';
  }
  private validate(user: Usuario): void {
    if (!user || !user.nome || !user.email || !['CLIENTE', 'CUIDADOR'].includes(user.role))
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
    } catch {
      await this.logout();
    }
  }
  async entrar(email: string, senha: string): Promise<void> {
    const response = await firstValueFrom(this.api.login(email.trim().toLowerCase(), senha));
    this.validate(response);
    if (!response.token?.trim()) throw new Error('Não foi possível concluir a entrada. Tente novamente.');
    await this.storage.set(response.token);
    this.token = response.token;
    this.currentUser.set({ nome: response.nome, email: response.email, role: response.role });
  }
  async logout(): Promise<void> {
    this.token = null;
    this.currentUser.set(null);
    await this.storage.clear();
  }
}
