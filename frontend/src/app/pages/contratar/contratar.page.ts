import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { BookingComponent } from '../../components/booking';
import { ContratoApi } from '../../services/contrato-api';
import { Auth } from '../../services/auth';
import { accountError } from '../../services/account-error';
@Component({selector:'app-contratar',imports:[RouterLink,IonContent,BookingComponent],styleUrls:['../directory.scss'],
 template:`<ion-content><main class="app-shell directory-screen"><header class="directory-header"><div class="header-title-row"><a [routerLink]="['/cuidadores',id]" class="back-arrow" aria-label="Voltar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg></a><h1>Escolher datas</h1></div></header><div class="page-body">
 @if(erro()){<p class="notice notice-error" role="alert">{{erro()}}</p><button class="cancel-button" (click)="carregar()">Tentar novamente</button>}
 @else if(pronto()){<app-booking [cuidadorId]="id"/>}@else{<p role="status">Carregando…</p>}
 </div></main></ion-content>`})
export class ContratarPage {
 private readonly route=inject(ActivatedRoute);private readonly api=inject(ContratoApi);private readonly auth=inject(Auth);private readonly router=inject(Router);
 id=0;readonly pronto=signal(false);readonly erro=signal('');private version=0;
 ionViewWillEnter():void{this.id=Number(this.route.snapshot.paramMap.get('id'));void this.carregar();}
 ionViewWillLeave():void{this.version++;this.pronto.set(false);}
 async carregar():Promise<void>{const v=++this.version;const token=this.auth.token;this.pronto.set(false);this.erro.set('');
 try{const c=await this.api.atualizarAtual();if(v!==this.version||token!==this.auth.token)return;
 if(c)await this.router.navigateByUrl('/contrato',{replaceUrl:true});else this.pronto.set(true);
 }catch(e){if(v===this.version&&token===this.auth.token)this.erro.set(accountError(e));}}
}
