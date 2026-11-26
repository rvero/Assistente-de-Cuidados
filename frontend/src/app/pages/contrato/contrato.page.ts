import { Component, inject, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ContratoApi, ESTADOS, type Contrato } from '../../services/contrato-api';
import { Auth } from '../../services/auth';
import { accountError } from '../../services/account-error';
@Component({
  selector:'app-contrato',imports:[DatePipe,CurrencyPipe,RouterLink,IonContent,IonButton],styleUrls:['../directory.scss'],
  template:`<ion-content><main class="app-shell directory-screen"><header class="directory-header"><h1>Contrato atual</h1></header><div class="page-body">
    @if(erro()){<p class="notice notice-error" role="alert">{{erro()}}</p><ion-button fill="outline" (click)="carregar()" [disabled]="ocupado()">Tentar novamente</ion-button>}
    @if(carregando()){<p role="status">Carregando contrato…</p>}
    @if(contrato();as c){
      <ion-button fill="outline" (click)="carregar()" [disabled]="ocupado()||carregando()">Atualizar</ion-button>
      <section class="content-card public-profile"><span class="avatar large" aria-hidden="true">{{c.cuidador.charAt(0)}}</span><h2>{{c.cuidador}}</h2>
        @if(c.cidade){<p>{{c.cidade}}</p>}
        @if(c.valorHora!==null){<p>{{c.valorHora | currency:'BRL':'symbol':'1.2-2':'pt-BR'}} / hora</p>}
        <p class="notice notice-success" role="status">{{estados[c.status]}}</p>
        @if(c.legado){<p>Contrato anterior</p>}@else{<p>{{c.aceitoEm?'Contratado em':'Solicitado em'}} {{(c.aceitoEm||c.criadoEm)|date:'dd/MM/yyyy'}}</p>}
        <a [routerLink]="['/cuidadores',c.cuidadorId]">Ver perfil →</a>
      </section>
      <section class="content-card profile-section"><h2>Dias contratados</h2><ul>@for(data of c.datas;track data){<li>{{data|date:'dd/MM/yyyy':'UTC'}}</li>}</ul></section>
      @if(confirmando()){
        <section class="content-card profile-section"><h2>Cancelar contrato?</h2><ion-button expand="block" color="danger" (click)="cancelar()" [disabled]="ocupado()">{{ocupado()?'Cancelando…':'Confirmar cancelamento'}}</ion-button><ion-button expand="block" fill="outline" (click)="confirmando.set(false)" [disabled]="ocupado()">Voltar</ion-button></section>
      }@else{<ion-button expand="block" fill="outline" color="danger" (click)="confirmando.set(true)" [disabled]="ocupado()">Cancelar contrato</ion-button>}
    }
  </div></main></ion-content>`
})
export class ContratoPage {
  readonly api=inject(ContratoApi);private readonly auth=inject(Auth);private readonly router=inject(Router);
  readonly estados=ESTADOS;readonly contrato=signal<Contrato|null>(null);readonly carregando=signal(true);
  readonly erro=signal('');readonly ocupado=signal(false);readonly confirmando=signal(false);private version=0;
  ionViewWillEnter():void{void this.carregar();}
  ionViewWillLeave():void{this.version++;this.contrato.set(null);this.confirmando.set(false);this.ocupado.set(false);}
  async carregar():Promise<void>{
    const version=++this.version;const token=this.auth.token;this.carregando.set(true);this.erro.set('');
    try{const c=await this.api.atualizarAtual();if(version!==this.version||token!==this.auth.token)return;
      this.contrato.set(c);if(!c)await this.router.navigateByUrl('/busca',{replaceUrl:true});
    }catch(e){if(version===this.version&&token===this.auth.token)this.erro.set(accountError(e));}
    finally{if(version===this.version&&token===this.auth.token)this.carregando.set(false);}
  }
  async cancelar():Promise<void>{
    const c=this.contrato();if(!c||this.ocupado())return;
    const version=this.version;const token=this.auth.token;this.ocupado.set(true);this.erro.set('');
    try{await firstValueFrom(this.api.cancelar(c.id));if(version!==this.version||token!==this.auth.token)return;
      this.api.atual.set(null);await this.router.navigateByUrl('/busca',{replaceUrl:true});
    }catch(e){if(version===this.version&&token===this.auth.token)this.erro.set(accountError(e));}
    finally{if(version===this.version&&token===this.auth.token)this.ocupado.set(false);}
  }
}
