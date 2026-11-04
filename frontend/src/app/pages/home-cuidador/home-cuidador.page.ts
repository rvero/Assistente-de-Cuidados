import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { AccountApi, type ContatoRecebido } from '../../services/account-api';
import { accountError } from '../../services/account-error';

@Component({
  selector: 'app-home-cuidador',
  imports: [DatePipe, IonContent, IonButton],
  styleUrls: ['../directory.scss'],
  template: `<ion-content
    ><main class="app-shell directory-screen">
      <header class="directory-header">
        <h1>Contatos recebidos</h1>
        <p>Famílias que demonstraram interesse no seu trabalho.</p>
      </header>
      <div class="page-body">
        @if (carregando()) {
          <p role="status">Carregando contatos…</p>
        } @else if (erro()) {
          <p class="notice notice-error" role="alert">{{ erro() }}</p>
          <ion-button fill="outline" (click)="carregar()">Tentar novamente</ion-button>
        } @else {
          <div class="carer-list">
            @for (contato of contatos(); track contato.id) {
              <article class="content-card admin-card">
                <span class="profile-label">Família</span>
                <h2>{{ contato.nome }}</h2>
                <p class="account-email">{{ contato.email }}</p>
                <p class="field-note">Contato em {{ contato.criadoEm | date: 'dd/MM/yyyy' }}</p>
                <a class="curriculum-link" [href]="'mailto:' + contato.email">Escrever e-mail ↗</a>
              </article>
            } @empty {
              <section class="content-card empty-state">
                <h2>Nenhum contato recebido</h2>
                <p>Quando uma família solicitar contato pelo seu perfil, o nome e o e-mail dela aparecerão aqui.</p>
              </section>
            }
          </div>
        }
      </div>
    </main></ion-content
  >`,
})
export class HomeCuidadorPage {
  private readonly api = inject(AccountApi);
  readonly contatos = signal<ContatoRecebido[]>([]);
  readonly erro = signal('');
  readonly carregando = signal(true);
  private version = 0;
  ionViewWillEnter(): void {
    void this.carregar();
  }
  ionViewWillLeave(): void {
    this.version++;
    this.contatos.set([]);
  }
  async carregar(): Promise<void> {
    const version = ++this.version;
    this.erro.set('');
    this.carregando.set(true);
    try {
      const data = await firstValueFrom(this.api.contatos());
      if (version === this.version) this.contatos.set(data);
    } catch (e) {
      if (version === this.version) this.erro.set(accountError(e));
    } finally {
      if (version === this.version) this.carregando.set(false);
    }
  }
}
