import { Component, computed, inject, signal, viewChild, afterRenderEffect, type ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { Auth } from '../../services/auth';
import { authError } from '../../services/auth-error';
import { DirectoryApi, type ContaAdmin } from '../../services/directory-api';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, RouterLink, IonContent, IonButton],
  templateUrl: './admin.page.html',
  styleUrls: ['../directory.scss'],
})
export class AdminPage {
  private readonly api = inject(DirectoryApi);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('deleteDialog');
  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.pendente() && !dialog.open) dialog.showModal();
      if (!this.pendente() && dialog.open) dialog.close();
    });
  }
  cancelar(event: Event): void {
    event.preventDefault();
    if (!this.excluindo()) this.pendente.set(null);
  }
  private loadVersion = 0;
  readonly contas = signal<ContaAdmin[]>([]);
  readonly termo = signal('');
  readonly tipo = signal('');
  readonly carregando = signal(true);
  readonly erro = signal('');
  readonly sucesso = signal('');
  readonly pendente = signal<ContaAdmin | null>(null);
  readonly excluindo = signal(false);
  readonly resultados = computed(() =>
    this.contas().filter(
      (c) =>
        (!this.tipo() || c.role === this.tipo()) &&
        [c.nome, c.email, c.cpf ?? ''].join(' ').toLowerCase().includes(this.termo().trim().toLowerCase()),
    ),
  );
  readonly familias = computed(() => this.contas().filter((c) => c.role === 'CLIENTE').length);
  readonly cuidadores = computed(() => this.contas().filter((c) => c.role === 'CUIDADOR').length);
  ionViewWillEnter(): void {
    void this.carregar();
  }
  ionViewWillLeave(): void {
    this.loadVersion++;
    this.contas.set([]);
    this.pendente.set(null);
  }
  async carregar(): Promise<void> {
    const version = ++this.loadVersion;
    this.carregando.set(true);
    this.erro.set('');
    try {
      const contas = await firstValueFrom(this.api.contas());
      if (version === this.loadVersion) this.contas.set(contas);
    } catch (e) {
      if (version === this.loadVersion) this.erro.set(authError(e));
    } finally {
      if (version === this.loadVersion) this.carregando.set(false);
    }
  }
  async sair(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
  async excluir(): Promise<void> {
    const conta = this.pendente();
    if (!conta || this.excluindo()) return;
    this.excluindo.set(true);
    this.erro.set('');
    this.sucesso.set('');
    try {
      await firstValueFrom(this.api.excluir(conta.id));
      this.contas.update((list) => list.filter((c) => c.id !== conta.id));
      this.pendente.set(null);
      this.sucesso.set('A conta de ' + conta.nome + ' foi excluída.');
    } catch (e) {
      this.erro.set(authError(e));
      this.pendente.set(null);
    } finally {
      this.excluindo.set(false);
    }
  }
}
