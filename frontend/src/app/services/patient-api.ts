import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface Paciente {
  nomePaciente: string;
  finalidade: '' | 'assistencia_incapaz' | 'pos_operatorio';
  alergias: string;
  recomendacoes: string;
}
export interface ContatoDetalhe {
  nome: string;
  email: string;
  paciente: Paciente | null;
}
@Injectable({ providedIn: 'root' })
export class PatientApi {
  private readonly http = inject(HttpClient);
  obter(): Observable<Paciente | null> {
    return this.http.get<Paciente | null>(environment.apiUrl + '/cliente/paciente');
  }
  salvar(data: Paciente): Observable<Paciente> {
    return this.http.put<Paciente>(environment.apiUrl + '/cliente/paciente', data);
  }
  contato(id: string): Observable<ContatoDetalhe> {
    return this.http.get<ContatoDetalhe>(environment.apiUrl + '/contatos/' + encodeURIComponent(id));
  }
}
