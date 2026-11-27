import { AppIcon } from '../../components/app-icon';
import { Component, inject, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ContratoApi, ESTADOS, type Contrato } from '../../services/contrato-api';
import { Auth } from '../../services/auth';
import { iniciarAtualizacao } from '../../services/live-refresh';
import { accountError } from '../../services/account-error';
@Component({
  selector:'app-contrato',imports: [AppIcon, DatePipe,CurrencyPipe,RouterLink,IonContent,IonButton],styleUrls:['../directory.scss'],
  template:`<ion-content><main class="app-shell directory-screen"><header class="directory-header"><h1>Contrato atual</h1></header><div class="page-body">
    @if(erro()){<p class="notice notice-error" role="alert">{{erro()}}</p><ion-button fill="outline" (click)="carregar()" [disabled]="ocupado()">Tentar novamente</ion-button>}
    @if(carregando()){<p role="status">Carregando contrato…</p>}
    @if(contrato();as c){
      <section class="content-card public-profile"><span class="avatar large" aria-hidden="true">{{c.cuidador.charAt(0)}}</span><h2>{{c.cuidador}}</h2>
        @if(c.cidade){<p>{{c.cidade}}</p>}
        @if(c.valorHora!==null){<p>{{c.valorHora | currency:'BRL':'symbol':'1.2-2':'pt-BR'}} / hora</p>}
        <p class="contract-status" [attr.data-status]="c.status" role="status">{{estados[c.status]}}</p>
        @if(c.legado){<p>Contrato anterior</p>}@else{<p>{{c.aceitoEm?'Contratado em':'Solicitado em'}} {{(c.aceitoEm||c.criadoEm)|date:'dd/MM/yyyy'}}</p>}
        <a [routerLink]="['/cuidadores',c.cuidadorId]">Ver perfil <app-icon name="forward" /></a>
      </section>
      <section class="content-card profile-section"><h2>Dias contratados</h2><ul class="date-list">@for(data of c.datas;track data){<li>{{data|date:'dd/MM/yyyy':'UTC'}}</li>}</ul></section>
      <section class="content-card profile-section action-stack">
        @if(c.status==='ACEITO'){
          @if(c.conclusaoFamiliaEm){<p role="status">Aguardando confirmação do cuidador.</p>}
          @else if(c.conclusaoCuidadorEm){<p role="status">O cuidador confirmou a conclusão.</p>}
          <ion-button expand="block" (click)="concluir()" [disabled]="ocupado() || !!c.conclusaoFamiliaEm">{{c.conclusaoFamiliaEm?'Conclusão confirmada':'Concluir'}}</ion-button>
        }
        @if(confirmando()){
          <h2>Cancelar contrato?</h2>
          <ion-button expand="block" color="danger" (click)="cancelar()" [disabled]="ocupado()">{{ocupado()?'Cancelando…':'Confirmar cancelamento'}}</ion-button>
          <ion-button expand="block" fill="outline" (click)="confirmando.set(false)" [disabled]="ocupado()">Voltar</ion-button>
        }@else{<ion-button expand="block" fill="outline" color="danger" (click)="confirmando.set(true)" [disabled]="ocupado()">Cancelar contrato</ion-button>}
      </section>
    }
  </div></main></ion-content>`
})
export class ContratoPage {
  readonly api=inject(ContratoApi);
  private readonly auth=inject(Auth);
  private readonly router=inject(Router);
  readonly estados=ESTADOS;
  readonly contrato=signal<Contrato|null>(null);
  readonly carregando=signal(true);
  readonly erro=signal('');
  readonly ocupado=signal(false);
  readonly confirmando=signal(false);
  private version=0;
  private consultando=false;
  private pararAtualizacao?:()=>void;
  ionViewWillEnter():void {
    this.pararAtualizacao?.();
    void this.carregar();
    this.pararAtualizacao=iniciarAtualizacao(()=>void this.carregar(true));
  }
  ionViewWillLeave():void {
    this.pararAtualizacao?.();this.pararAtualizacao=undefined;
    this.version++;this.contrato.set(null);this.confirmando.set(false);this.ocupado.set(false);this.consultando=false;
  }
  ngOnDestroy():void { this.pararAtualizacao?.(); }
  async carregar(silencioso=false):Promise<void>{
    if(this.ocupado()||this.consultando)return;
    const version=++this.version;const token=this.auth.token;this.consultando=true;
    if(!silencioso)this.carregando.set(true);
    try{
      const c=await this.api.atualizarAtual();
      if(version!==this.version||token!==this.auth.token)return;
      this.erro.set('');this.contrato.set(c);
      if(!c)await this.router.navigateByUrl('/busca',{replaceUrl:true});
    }catch(e){if(version===this.version&&token===this.auth.token)this.erro.set(accountError(e));}
    finally{this.consultando=false;if(version===this.version&&token===this.auth.token)this.carregando.set(false);}
  }
  async cancelar():Promise<void>{await this.encerrar(false);}
  async concluir():Promise<void>{await this.encerrar(true);}
  private async encerrar(concluir:boolean):Promise<void>{
    const c=this.contrato();if(!c||this.ocupado()||(concluir&&!!c.conclusaoFamiliaEm))return;
    const version=++this.version;const token=this.auth.token;
    this.ocupado.set(true);this.carregando.set(false);this.erro.set('');
    try{
      const resultado=await firstValueFrom(concluir?this.api.concluir(c.id):this.api.cancelar(c.id));
      if(version!==this.version||token!==this.auth.token)return;
      if(['CANCELADO','CONCLUIDO'].includes(resultado.status)){
        this.api.definirAtual(null);
        await this.router.navigateByUrl(concluir?'/historico':'/busca',{replaceUrl:true});
      }else{this.api.definirAtual(resultado);this.contrato.set(resultado);}
    }catch(e){if(version===this.version&&token===this.auth.token)this.erro.set(accountError(e));}
    finally{if(version===this.version&&token===this.auth.token)this.ocupado.set(false);}
  }
}
