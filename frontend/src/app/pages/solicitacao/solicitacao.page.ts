import { AppIcon } from '../../components/app-icon';
import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../services/auth';
import { ContratoApi, ESTADOS, type PedidoDetalhe } from '../../services/contrato-api';
import { iniciarAtualizacao } from '../../services/live-refresh';
import { accountError } from '../../services/account-error';
@Component({selector:'app-solicitacao',imports: [AppIcon, DatePipe,RouterLink,IonContent,IonButton],styleUrls:['../directory.scss'],
 template:`<ion-content><main class="app-shell directory-screen"><header class="directory-header"><div class="header-title-row"><a routerLink="/home-cuidador" class="back-arrow" aria-label="Voltar"><app-icon name="back" /></a><h1>Solicitação</h1></div></header><div class="page-body">
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
 @if(d.contrato.status==='ACEITO'){
 <section class="content-card profile-section action-stack">
   @if(d.contrato.conclusaoCuidadorEm){<p role="status">Aguardando confirmação da família.</p>}
   @else if(d.contrato.conclusaoFamiliaEm){<p role="status">A família confirmou a conclusão.</p>}
   <ion-button expand="block" (click)="concluir()" [disabled]="ocupado()||!!d.contrato.conclusaoCuidadorEm">{{d.contrato.conclusaoCuidadorEm?'Conclusão confirmada':'Concluir'}}</ion-button>
   @if(cancelando()){
     <h2>Cancelar contrato?</h2>
     <ion-button expand="block" color="danger" (click)="cancelar()" [disabled]="ocupado()">Confirmar cancelamento</ion-button>
     <ion-button expand="block" fill="outline" (click)="cancelando.set(false)" [disabled]="ocupado()">Voltar</ion-button>
   }@else{<ion-button expand="block" fill="outline" color="danger" (click)="cancelando.set(true)" [disabled]="ocupado()">Cancelar contrato</ion-button>}
 </section>
 }
 }
 </div></main></ion-content>`})
export class SolicitacaoPage {
 private readonly api=inject(ContratoApi);
 private readonly route=inject(ActivatedRoute);
 private readonly auth=inject(Auth);
 readonly estados=ESTADOS;
 readonly dados=signal<PedidoDetalhe|null>(null);
 readonly carregando=signal(true);readonly erro=signal('');readonly ocupado=signal(false);
 readonly confirmando=signal(false);readonly cancelando=signal(false);
 private version=0;private consultando=false;private pararAtualizacao?:()=>void;
 ionViewWillEnter():void{
   this.pararAtualizacao?.();void this.carregar();
   this.pararAtualizacao=iniciarAtualizacao(()=>void this.carregar(true));
 }
 ionViewWillLeave():void{
   this.pararAtualizacao?.();this.pararAtualizacao=undefined;
   this.version++;this.dados.set(null);this.ocupado.set(false);this.confirmando.set(false);this.cancelando.set(false);this.consultando=false;
 }
 ngOnDestroy():void{this.pararAtualizacao?.();}
 async carregar(silencioso=false):Promise<void>{
   if(this.ocupado()||this.consultando)return;
   const v=++this.version;const token=this.auth.token;this.consultando=true;
   if(!silencioso)this.carregando.set(true);
   try{const d=await firstValueFrom(this.api.detalhe(this.route.snapshot.paramMap.get('id')||''));
     if(v===this.version&&token===this.auth.token){this.dados.set(d);this.erro.set('');}
   }catch(e){if(v===this.version&&token===this.auth.token)this.erro.set(accountError(e));}
   finally{this.consultando=false;if(v===this.version&&token===this.auth.token)this.carregando.set(false);}
 }
 async responder(aceitar:boolean):Promise<void>{await this.executar(aceitar?'aceitar':'recusar');}
 async concluir():Promise<void>{await this.executar('concluir');}
 async cancelar():Promise<void>{await this.executar('cancelar');}
 private async executar(acao:'aceitar'|'recusar'|'concluir'|'cancelar'):Promise<void>{
   const d=this.dados();if(!d||this.ocupado()||(acao==='concluir'&&!!d.contrato.conclusaoCuidadorEm))return;
   const v=++this.version;const token=this.auth.token;this.ocupado.set(true);this.carregando.set(false);this.erro.set('');
   try{
     const pedido=acao==='concluir'?this.api.concluir(d.contrato.id,true):acao==='cancelar'?this.api.cancelar(d.contrato.id,true):this.api.responder(d.contrato.id,acao==='aceitar');
     const c=await firstValueFrom(pedido);if(v!==this.version||token!==this.auth.token)return;
     this.dados.set({contrato:c,paciente:['PENDENTE','ACEITO'].includes(c.status)?d.paciente:null});
     this.confirmando.set(false);this.cancelando.set(false);
   }catch(e){if(v===this.version&&token===this.auth.token)this.erro.set(accountError(e));}
   finally{if(v===this.version&&token===this.auth.token)this.ocupado.set(false);}
 }
}
