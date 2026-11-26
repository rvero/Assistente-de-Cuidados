import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../services/auth';
import { ContratoApi, ESTADOS, type Contrato } from '../../services/contrato-api';
import { accountError } from '../../services/account-error';
@Component({selector:'app-historico',imports:[DatePipe,RouterLink,IonContent,IonButton],styleUrls:['../directory.scss'],
 template:`<ion-content><main class="app-shell directory-screen"><header class="directory-header"><div class="header-title-row">
 @if(admin){<a routerLink="/admin" class="back-arrow" aria-label="Voltar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg></a>}
 <h1>Histórico de contratações</h1></div></header><div class="page-body">
 @if(carregando()){<p role="status">Carregando histórico…</p>}@else if(erro()){<p class="notice notice-error" role="alert">{{erro()}}</p><ion-button fill="outline" (click)="carregar()">Tentar novamente</ion-button>}
 @else{<div class="carer-list">@for(c of itens();track c.id){<article class="content-card">
 <h2>{{cuidador()?c.familia:c.cuidador}}</h2>@if(admin){<p>Família: {{c.familia}}</p>}
 <span class="contract-status" [attr.data-status]="c.status">{{estados[c.status]}}</span>
 @if(c.legado){<p>Registro anterior</p>}@else{<p>{{c.criadoEm|date:'dd/MM/yyyy'}}</p>}
 <ul class="date-list">@for(data of c.datas;track data){<li>{{data|date:'dd/MM/yyyy':'UTC'}}</li>}</ul>
 @if(cuidador() && (c.status==='PENDENTE'||c.status==='ACEITO')){<a [routerLink]="['/solicitacoes',c.id]">Ver pedido →</a>}
 </article>}@empty{<section class="content-card empty-state"><h2>Nenhuma contratação</h2></section>}</div>}
 </div></main></ion-content>`})
export class HistoricoPage {
 private readonly api=inject(ContratoApi);private readonly auth=inject(Auth);private readonly route=inject(ActivatedRoute);
 readonly admin=this.route.snapshot.data['admin']===true;readonly estados=ESTADOS;
 readonly itens=signal<Contrato[]>([]);readonly carregando=signal(true);readonly erro=signal('');private version=0;
 cuidador():boolean{return this.auth.usuario()?.role==='CUIDADOR';}
 ionViewWillEnter():void{void this.carregar();}
 ionViewWillLeave():void{this.version++;this.itens.set([]);}
 async carregar():Promise<void>{const v=++this.version;const token=this.auth.token;this.carregando.set(true);this.erro.set('');
 try{const itens=await firstValueFrom(this.admin?this.api.historicoAdmin():this.api.listar(this.cuidador()));if(v===this.version&&token===this.auth.token)this.itens.set(itens);}
 catch(e){if(v===this.version&&token===this.auth.token)this.erro.set(accountError(e));}finally{if(v===this.version&&token===this.auth.token)this.carregando.set(false);}}
}
