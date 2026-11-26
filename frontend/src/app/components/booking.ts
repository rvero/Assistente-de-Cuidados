import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AgendaApi, DIAS, dataLocal, type Calendario } from '../services/agenda-api';
import { accountError } from '../services/account-error';
@Component({
  selector: 'app-booking', imports: [IonButton, DatePipe],
  template: `<section class="content-card profile-section">
    <h2>Agendar cuidado</h2>
    @if (sucesso()) { <p class="notice notice-success" role="status">{{sucesso()}}</p> }
    @if (erro()) { <p class="notice notice-error" role="alert">{{erro()}}</p><ion-button fill="outline" (click)="carregar()" [disabled]="enviando()">Atualizar datas</ion-button> }
    <div class="month-nav"><button type="button" aria-label="Mês anterior" (click)="mudarMes(-1)" [disabled]="primeiroMes() || carregando() || enviando()">‹</button>
      <h3 aria-live="polite">{{titulo()}}</h3>
      <button type="button" aria-label="Próximo mês" (click)="mudarMes(1)" [disabled]="carregando() || enviando()">›</button></div>
    <p class="legend">Cinza: indisponível</p>
    @if(carregando()) { <p role="status">Carregando datas…</p> }
    <div class="calendar" [attr.aria-busy]="carregando()">
      @for (nome of semana; track $index) { <span class="weekday" aria-hidden="true">{{nome}}</span> }
      @for (dia of celulas(); track $index) {
        @if(dia) { <button type="button" [disabled]="indisponivel(dia) || enviando()" [class.chosen]="selecionadas().includes(dia)" [attr.aria-pressed]="selecionadas().includes(dia)" [attr.aria-label]="dia | date:'dd/MM/yyyy':'UTC'" (click)="alternar(dia)">{{numero(dia)}}</button> }
        @else { <span></span> }
      }
    </div>
    @if(selecionadas().length) {
      <h3>Datas selecionadas</h3><div class="selected-days">
        @for(data of selecionadas(); track data) { <button type="button" (click)="alternar(data)" [disabled]="enviando()" [attr.aria-label]="'Remover '+data">{{data | date:'dd/MM/yyyy':'UTC'}} ×</button> }
      </div>
    }
    <ion-button expand="block" (click)="confirmar()" [disabled]="!selecionadas().length || carregando() || enviando() || !!erro()">{{enviando() ? 'Agendando…' : 'Confirmar datas'}}</ion-button>
  </section>`,
  styles: [`
    :host { display:block; } h2 {font-size:18px;} h3 {font-size:16px;} .month-nav {display:flex;align-items:center;justify-content:space-between;gap:8px;}
    button {font:inherit;border:1px solid #c9d6d3;background:white;color:#245f54;border-radius:10px;min-height:44px;cursor:pointer;}
    .month-nav button {width:44px;font-size:28px;} .calendar {display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;margin:12px 0 20px;}
    .calendar button {width:100%;padding:0;} .weekday {text-align:center;font-size:12px;padding:8px 0;color:#52666b;}
    button:disabled {background:#edf0ef;color:#a4aaa8;border-color:#e4e8e6;cursor:default;}
    .calendar button.chosen {background:#2f7d6e;color:white;border-color:#2f7d6e;}
    button:focus-visible {outline:3px solid #6c63a8;outline-offset:2px;}
    .legend {font-size:12px;color:#52666b;} .selected-days {display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
    .selected-days button {padding:8px;font-size:14px;}
  `],
})
export class BookingComponent implements OnInit {
  readonly cuidadorId = input.required<number>();
  private readonly api = inject(AgendaApi);
  readonly semana = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  readonly mes = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly dados = signal<Calendario>({dias:[], datasOcupadas:[]});
  readonly selecionadas = signal<string[]>([]);
  readonly carregando = signal(true); readonly enviando = signal(false);
  readonly erro = signal(''); readonly sucesso = signal('');
  ngOnInit(): void { void this.carregar(); }
  titulo(): string { return this.mes().toLocaleDateString('pt-BR',{month:'long',year:'numeric'}); }
  numero(data: string): number { return Number(data.slice(8)); }
  primeiroMes(): boolean { const hoje = new Date(); return this.mes().getFullYear()===hoje.getFullYear() && this.mes().getMonth()===hoje.getMonth(); }
  celulas(): string[] {
    const m=this.mes(); const offset=(m.getDay()+6)%7;
    return [...Array<string>(offset).fill(''),...Array.from({length:new Date(m.getFullYear(),m.getMonth()+1,0).getDate()},(_,i)=>dataLocal(new Date(m.getFullYear(),m.getMonth(),i+1)))];
  }
  indisponivel(data: string): boolean {
    const dia = DIAS[(new Date(data+'T12:00:00').getDay()+6)%7].valor;
    return this.carregando() || !!this.erro() || data<dataLocal(new Date()) || !this.dados().dias.includes(dia) || this.dados().datasOcupadas.includes(data);
  }
  alternar(data: string): void {
    if(this.enviando()) return;
    if(this.selecionadas().includes(data)) { this.selecionadas.update(v=>v.filter(d=>d!==data)); return; }
    if(this.indisponivel(data)) return;
    if(this.selecionadas().length>=31) { this.sucesso.set('Selecione até 31 datas por agendamento.'); return; }
    this.sucesso.set(''); this.selecionadas.update(v=>[...v,data].sort());
  }
  mudarMes(delta:number): void {
    if(this.carregando() || this.enviando() || (delta<0 && this.primeiroMes())) return;
    const m=this.mes();this.mes.set(new Date(m.getFullYear(),m.getMonth()+delta,1));void this.carregar();
  }
  async carregar(): Promise<void> {
    this.carregando.set(true);this.erro.set('');
    const m=this.mes();const inicio=dataLocal(m);const fim=dataLocal(new Date(m.getFullYear(),m.getMonth()+1,0));
    try {
      this.dados.set(await firstValueFrom(this.api.calendario(this.cuidadorId(),inicio,fim)));
      const d=this.dados();
      this.selecionadas.update(v=>v.filter(data=>data>=dataLocal(new Date()) && d.dias.includes(DIAS[(new Date(data+'T12:00:00').getDay()+6)%7].valor) && !(data>=inicio && data<=fim && d.datasOcupadas.includes(data))));
    } catch(e) { this.erro.set(accountError(e)); }
    finally { this.carregando.set(false); }
  }
  async confirmar(): Promise<void> {
    if(!this.selecionadas().length || this.enviando() || this.carregando() || this.erro()) return;
    this.enviando.set(true);this.sucesso.set('');
    try {
      const itens=await firstValueFrom(this.api.agendar(this.cuidadorId(),this.selecionadas()));
      this.selecionadas.set([]);this.sucesso.set(itens.length===1?'Data agendada.':'Datas agendadas.');await this.carregar();
    } catch(e) { await this.carregar();this.erro.set(accountError(e)); }
    finally { this.enviando.set(false); }
  }
}
