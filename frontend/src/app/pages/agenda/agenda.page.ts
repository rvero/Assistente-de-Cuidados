import { AppIcon } from '../../components/app-icon';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../services/auth';
import { AgendaApi, DIAS } from '../../services/agenda-api';
import { accountError } from '../../services/account-error';
@Component({
  selector:'app-agenda', imports: [AppIcon, RouterLink,IonContent,IonButton],
  styleUrls:['../directory.scss'],
  styles:[`.days{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:16px 0;} .days label{display:flex;align-items:center;gap:10px;min-height:48px;} input{width:20px;height:20px;accent-color:#2f7d6e;}`],
  template:`<ion-content><main class="app-shell directory-screen"><header class="directory-header"><div class="header-title-row">
    <a routerLink="/opcoes" class="back-arrow" aria-label="Voltar"><app-icon name="back" /></a><h1>Editar agenda</h1>
    </div></header><div class="page-body">
    @if(carregando()){<p role="status">Carregando agenda…</p>}
    @else if(erroCarga()){<p class="notice notice-error" role="alert">{{erroCarga()}}</p><ion-button fill="outline" (click)="carregar()">Tentar novamente</ion-button>}
    @else {
      @if(cuidador()) { <section class="content-card"><h2>Dias de atendimento</h2>
        @if(mensagem()){<p class="notice notice-success" role="status">{{mensagem()}}</p>}
        @if(erroSalvar()){<p class="notice notice-error" role="alert">{{erroSalvar()}}</p>}
        <div class="days">@for(dia of semana;track dia.valor){<label><input type="checkbox" [checked]="dias().includes(dia.valor)" (change)="alternar(dia.valor)" [disabled]="salvando()"/>{{dia.nome}}</label>}</div>
        <ion-button expand="block" (click)="salvar()" [disabled]="salvando()">{{salvando()?'Salvando…':'Salvar dias'}}</ion-button></section> }
    }
    </div></main></ion-content>`
})
export class AgendaPage {
  private readonly auth = inject(Auth);
  private readonly api = inject(AgendaApi);
  private version = 0;
  readonly semana = DIAS;
  readonly dias = signal<string[]>([]);

  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly erroCarga = signal('');
  readonly erroSalvar = signal('');
  readonly mensagem = signal('');

  cuidador(): boolean { return this.auth.usuario()?.role === 'CUIDADOR'; }
  ionViewWillEnter(): void { void this.carregar(); }
  ionViewWillLeave(): void {
    this.version++;
    this.dias.set([]);
    this.mensagem.set('');
    this.erroSalvar.set('');
    this.salvando.set(false);
  }
  async carregar(): Promise<void> {
    const version = ++this.version;
    const token = this.auth.token;
    this.carregando.set(true);
    this.erroCarga.set('');
    this.mensagem.set('');
    this.erroSalvar.set('');
    try {
      const dados = await firstValueFrom(this.api.dias());
      if (version !== this.version || token !== this.auth.token) return;
      this.dias.set(dados.dias);
    } catch (e) {
      if (version === this.version && token === this.auth.token) this.erroCarga.set(accountError(e));
    } finally {
      if (version === this.version && token === this.auth.token) this.carregando.set(false);
    }
  }
  alternar(dia: string): void {
    this.mensagem.set('');
    this.dias.update(v => v.includes(dia) ? v.filter(d => d !== dia) : [...v, dia]);
  }
  async salvar(): Promise<void> {
    if (this.salvando()) return;
    const version = this.version;
    const token = this.auth.token;
    this.salvando.set(true);
    this.mensagem.set('');
    this.erroSalvar.set('');
    try {
      const dados = await firstValueFrom(this.api.salvarDias(this.dias()));
      if (version !== this.version || token !== this.auth.token) return;
      this.dias.set(dados.dias);
      this.mensagem.set('Dias atualizados.');
    } catch (e) {
      if (version === this.version && token === this.auth.token) this.erroSalvar.set(accountError(e));
    } finally {
      if (version === this.version && token === this.auth.token) this.salvando.set(false);
    }
  }
}
