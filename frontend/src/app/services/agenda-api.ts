import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
export const DIAS = [
  { valor: 'SEGUNDA', nome: 'Segunda' }, { valor: 'TERCA', nome: 'Terça' },
  { valor: 'QUARTA', nome: 'Quarta' }, { valor: 'QUINTA', nome: 'Quinta' },
  { valor: 'SEXTA', nome: 'Sexta' }, { valor: 'SABADO', nome: 'Sábado' },
  { valor: 'DOMINGO', nome: 'Domingo' },
];
export interface Agendamento { id: number; cuidadorId: number; cuidador: string; clienteId: number; cliente: string; data: string; status: string; }
export interface Calendario { dias: string[]; datasOcupadas: string[]; }
export function dataLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
@Injectable({ providedIn: 'root' })
export class AgendaApi {
  private readonly http = inject(HttpClient);
  dias() { return this.http.get<{dias: string[]}>(environment.apiUrl + '/cuidador/disponibilidade'); }
  salvarDias(dias: string[]) { return this.http.put<{dias: string[]}>(environment.apiUrl + '/cuidador/disponibilidade', { dias }); }
  calendario(id: number, inicio: string, fim: string) {
    return this.http.get<Calendario>(`${environment.apiUrl}/cuidadores/${id}/agenda`, { params: { inicio, fim } });
  }
  agendar(cuidadorId: number, datas: string[]) {
    return this.http.post<Agendamento[]>(environment.apiUrl + '/cliente/agendamentos/lote', { cuidadorId, datas });
  }
  listar(cuidador: boolean) {
    return this.http.get<Agendamento[]>(environment.apiUrl + (cuidador ? '/cuidador' : '/cliente') + '/agendamentos');
  }
}
