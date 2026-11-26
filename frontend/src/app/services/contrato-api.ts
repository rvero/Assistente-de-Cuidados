import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal, DestroyRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
export interface Contrato {
  id:number; clienteId:number; cuidadorId:number; familia:string; cuidador:string;
  cidade:string|null; valorHora:number|null; status:string; criadoEm:string;
  aceitoEm:string|null; encerradoEm:string|null; legado:boolean; datas:string[];
}
export interface PedidoDetalhe {
  contrato:Contrato;
  paciente:{nomePaciente:string;finalidade:string;alergias:string;recomendacoes:string}|null;
}
export const ESTADOS:Record<string,string> = {
  PENDENTE:'Aguardando aceite', ACEITO:'Aceito', RECUSADO:'Recusado', CANCELADO:'Cancelado', CONCLUIDO:'Concluído', EXPIRADO:'Expirado',
};
@Injectable({providedIn:'root'})
export class ContratoApi {
  private readonly http=inject(HttpClient);
  private readonly auth=inject(Auth);
  private readonly router=inject(Router);
  private readonly destroyRef=inject(DestroyRef);
  readonly atual=signal<Contrato|null>(null);
  private version=0;
  definirAtual(c: Contrato|null): void {
    this.atual.set(c);
    this.auth.definirContratoAtivo(!!c && ['PENDENTE','ACEITO'].includes(c.status));
  }
  constructor(){
    effect(()=>{
      const user=this.auth.usuario(); this.version++; this.atual.set(null);
      if(user?.role==='CLIENTE') void this.atualizarAtual().catch(()=>{});
    });
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event=>{
      if(event instanceof NavigationEnd && this.auth.usuario()?.role==='CLIENTE') void this.atualizarAtual().catch(()=>{});
    });
  }
  async atualizarAtual():Promise<Contrato|null>{
    const version=++this.version;const token=this.auth.token;
    const c=await firstValueFrom(this.http.get<Contrato|null>(environment.apiUrl+'/cliente/contratos/atual'));
    if(version===this.version && token===this.auth.token) this.definirAtual(c);
    return c;
  }
  solicitar(cuidadorId:number,datas:string[]){return this.http.post<Contrato>(environment.apiUrl+'/cliente/contratos',{cuidadorId,datas});}
  cancelar(id:number){return this.http.post<Contrato>(`${environment.apiUrl}/cliente/contratos/${id}/cancelar`,{});}
  listar(cuidador:boolean){return this.http.get<Contrato[]>(environment.apiUrl+(cuidador?'/cuidador':'/cliente')+'/contratos');}
  detalhe(id:string){return this.http.get<PedidoDetalhe>(environment.apiUrl+'/cuidador/contratos/'+encodeURIComponent(id));}
  responder(id:number,aceitar:boolean){return this.http.post<Contrato>(`${environment.apiUrl}/cuidador/contratos/${id}/${aceitar?'aceitar':'recusar'}`,{});}
  historicoAdmin(){return this.http.get<Contrato[]>(environment.apiUrl+'/admin/contratos');}
}
