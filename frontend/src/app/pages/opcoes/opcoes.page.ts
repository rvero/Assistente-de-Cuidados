import { Component, inject, signal, viewChild, afterRenderEffect, type ElementRef } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonButton, IonInput } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { AccountApi } from '../../services/account-api';
import { accountError } from '../../services/account-error';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-opcoes',
  imports: [FormsModule, RouterLink, IonContent, IonButton, IonInput],
  templateUrl: './opcoes.page.html',
  styleUrls: ['../directory.scss'],
})
export class OpcoesPage {
  readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly api = inject(AccountApi);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('deleteDialog');
  readonly confirmando = signal(false);
  readonly excluindo = signal(false);
  readonly erro = signal('');
  senhaAtual = '';
  constructor() {
    afterRenderEffect(() => {
      const d = this.dialog().nativeElement;
      if (this.confirmando() && !d.open) d.showModal();
      if (!this.confirmando() && d.open) d.close();
    });
  }
  ionViewWillEnter(): void {
    this.erro.set('');
    this.senhaAtual = '';
  }
  ionViewWillLeave(): void {
    this.confirmando.set(false);
    this.senhaAtual = '';
  }
  cancelar(event?: Event): void {
    event?.preventDefault();
    if (!this.excluindo()) {
      this.confirmando.set(false);
      this.senhaAtual = '';
      this.erro.set('');
    }
  }
  async sair(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
  async excluir(form: NgForm): Promise<void> {
    if (this.excluindo()) return;
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.erro.set('Informe sua senha atual para confirmar a exclusão.');
      return;
    }
    this.excluindo.set(true);
    this.erro.set('');
    try {
      await firstValueFrom(this.api.excluir(this.senhaAtual));
      this.confirmando.set(false);
      this.senhaAtual = '';
      await this.sair();
    } catch (e) {
      this.erro.set(accountError(e));
    } finally {
      this.excluindo.set(false);
    }
  }
}
