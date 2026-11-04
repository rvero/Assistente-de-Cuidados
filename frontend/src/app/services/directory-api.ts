import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import type { Papel } from './api';
import type { CuidadorPerfil, FamiliaPerfil } from './profile-api';

export interface CuidadorPublico {
  id: number;
  nome: string;
  descricao: string | null;
  curriculoUrl: string | null;
  perfilCompleto: boolean;
}
export interface ContaAdmin {
  id: number;
  nome: string;
  email: string;
  cpf: string | null;
  role: Papel;
  familia: FamiliaPerfil | null;
  cuidador: CuidadorPerfil | null;
}
@Injectable({ providedIn: 'root' })
export class DirectoryApi {
  private readonly http = inject(HttpClient);
  cuidadores(): Observable<CuidadorPublico[]> {
    return this.http.get<CuidadorPublico[]>(environment.apiUrl + '/cuidadores');
  }
  cuidador(id: string): Observable<CuidadorPublico> {
    return this.http.get<CuidadorPublico>(environment.apiUrl + '/cuidadores/' + encodeURIComponent(id));
  }
  contatar(id: number): Observable<{ email: string }> {
    return this.http.post<{ email: string }>(environment.apiUrl + '/cuidadores/' + id + '/contato', {});
  }
  contas(): Observable<ContaAdmin[]> {
    return this.http.get<ContaAdmin[]>(environment.apiUrl + '/admin/contas');
  }
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + '/admin/contas/' + id);
  }
}
