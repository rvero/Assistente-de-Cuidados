import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../services/auth';
import { ContratoApi, ESTADOS, type PedidoDetalhe } from '../../services/contrato-api';
import { accountError } from '../../services/account-error';
@Component({selector:'app-solicitacao',imports:[DatePipe,RouterLink,IonContent,IonButton],styleUrls:['../directory.scss'],
 template:`<ion-content><main class="app-shell directory-screen"><header class="directory-header"><div class="header-title-row"><a routerLink="/home-cuidador" class="back-arrow" aria-label="Voltar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg></a><h1>Solicitação</h1></div></header><div class="page-body">
 @if(erro()){<p class="notice notice-error" role="alert">{{erro()}}</p><ion-button fill="outline" (click)="carregar()" [disabled]="ocupado()">Atualizar</ion-button>}
 @if(carregando()){<p role="status">Carregando pedido…</p>}
 @if(dados();as d){<section class="content-card"><span class="profile-label">Família</span><h2>{{d.contrato.familia}}</h2><p class="contract-status" [attr.data-status]="d.contrato.status" role="status">{{estados[d.contrato.status]}}</p></section>
 @if(d.paciente;as p){<section class="content-card profile-section"><h2>Paciente</h2><dl><dt>Nome</dt><dd>{{p.nomePaciente}}</dd><dt>Motivo do cuidado</dt><dd>{{p.finalidade==='pos_operatorio'?'Recuperação após cirurgia':'Apoio nas atividades diárias'}}</dd><dt>Alergias</dt><dd class="preserve-lines">{{p.alergias||'Não informadas'}}</dd><dt>Orientações para o cuidado</dt><dd class="preserve-lines">{{p.recomendacoes||'Não informadas'}}</dd></dl></section>}
 <section class="content-card profile-section"><h2>Dias solicitados</h2><ul class="date-list">@for(data of d.contrato.datas;track data){<li>{{data|date:'dd/MM/yyyy':'UTC'}}</li>}</ul></section>
 @if(d.contrato.status==='PENDENTE'){
 <ion-button expand="block" (click)="responder(true)" [disabled]="ocupado()">{{ocupado()?'Aguarde…':'Aceitar'}}</ion-button>
 @if(confirmando()){<section class="content-card profile-section"><h2>Recusar pedido?</h2><ion-button expand="block" color="danger" (click)="responder(false)" [disabled]="ocupado()">Confirmar recusa</ion-button><ion-button expand="block" fill="outline" (click)="confirmando.set(false)" [disabled]="ocupado()">Voltar</ion-button></section>}
 @else{<ion-button expand="block" fill="outline" color="danger" (click)="confirmando.set(true)" [disabled]="ocupado()">Recusar</ion-button>}
 }
 }
 </div></main></ion-content>`})
export class SolicitacaoPage {
 private readonly api=inject(ContratoApi);private readonly route=inject(ActivatedRoute);private readonly auth=inject(Auth);
 readonly estados=ESTADOS;readonly dados=signal<PedidoDetalhe|null>(null);readonly carregando=signal(true);readonly erro=signal('');readonly ocupado=signal(false);readonly confirmando=signal(false);private version=0;
 ionViewWillEnter():void{void this.carregar();}
 ionViewWillLeave():void{this.version++;this.dados.set(null);this.ocupado.set(false);this.confirmando.set(false);}
 async carregar():Promise<void>{const v=++this.version;const token=this.auth.token;this.carregando.set(true);this.erro.set('');
 try{const d=await firstValueFrom(this.api.detalhe(this.route.snapshot.paramMap.get('id')||''));if(v===this.version&&token===this.auth.token)this.dados.set(d);}
 catch(e){if(v===this.version&&token===this.auth.token)this.erro.set(accountError(e));}finally{if(v===this.version&&token===this.auth.token)this.carregando.set(false);}}
 async responder(aceitar:boolean):Promise<void>{const d=this.dados();if(!d||this.ocupado())return;const v=this.version;const token=this.auth.token;this.ocupado.set(true);this.erro.set('');
 try{const c=await firstValueFrom(this.api.responder(d.contrato.id,aceitar));if(v!==this.version||token!==this.auth.token)return;this.dados.set({contrato:c,paciente:aceitar?d.paciente:null});this.confirmando.set(false);}
 catch(e){if(v===this.version&&token===this.auth.token)this.erro.set(accountError(e));}finally{if(v===this.version&&token===this.auth.token)this.ocupado.set(false);}}
}
