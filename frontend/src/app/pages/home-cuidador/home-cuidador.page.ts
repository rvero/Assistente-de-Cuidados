import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../services/auth';
import { ContratoApi, ESTADOS, type Contrato } from '../../services/contrato-api';
import { accountError } from '../../services/account-error';
@Component({selector:'app-home-cuidador',imports:[DatePipe,RouterLink,IonContent,IonButton],styleUrls:['../directory.scss'],
 template:`<ion-content><main class="app-shell directory-screen"><header class="directory-header"><h1>Solicitações</h1></header><div class="page-body">
 @if(carregando()){<p role="status">Carregando pedidos…</p>}@else if(erro()){<p class="notice notice-error" role="alert">{{erro()}}</p><ion-button fill="outline" (click)="carregar()">Tentar novamente</ion-button>}
 @else{<div class="carer-list">@for(c of ativos();track c.id){<article class="content-card"><a class="contact-notification" [routerLink]="['/solicitacoes',c.id]"><span class="profile-label">{{estados[c.status]}}</span><h2>{{c.familia}}</h2><p>{{c.datas.length===1?'1 dia':c.datas.length+' dias'}}</p><p>{{c.criadoEm|date:'dd/MM/yyyy'}}</p><span class="view-profile">Ver pedido →</span></a></article>}
 @empty{<section class="content-card empty-state"><h2>Nenhuma solicitação</h2></section>}</div>}
 </div></main></ion-content>`})
export class HomeCuidadorPage {
 private readonly api=inject(ContratoApi);private readonly auth=inject(Auth);readonly estados=ESTADOS;
 readonly itens=signal<Contrato[]>([]);readonly ativos=computed(()=>this.itens().filter(c=>['PENDENTE','ACEITO'].includes(c.status)));
 readonly carregando=signal(true);readonly erro=signal('');private version=0;
 ionViewWillEnter():void{void this.carregar();}ionViewWillLeave():void{this.version++;this.itens.set([]);}
 async carregar():Promise<void>{const v=++this.version;const token=this.auth.token;this.carregando.set(true);this.erro.set('');
 try{const itens=await firstValueFrom(this.api.listar(true));if(v===this.version&&token===this.auth.token)this.itens.set(itens);}
 catch(e){if(v===this.version&&token===this.auth.token)this.erro.set(accountError(e));}finally{if(v===this.version&&token===this.auth.token)this.carregando.set(false);}}
}
