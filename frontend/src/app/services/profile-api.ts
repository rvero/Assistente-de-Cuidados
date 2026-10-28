import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface FamiliaPerfil {
  nomePaciente: string;
  dataNascimento: string;
  finalidade: '' | 'assistencia_incapaz' | 'pos_operatorio';
  alergias: string;
  recomendacoes: string;
}
export interface CuidadorPerfil {
  nomeCuidador: string;
  nomeSocial: string;
  genero: '' | 'masculino' | 'feminino' | 'outro';
  dataNascimento: string;
  descricao: string;
  curriculoUrl: string;
}
@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly http = inject(HttpClient);
  obterFamilia(): Observable<FamiliaPerfil | null> {
    return this.http.get<FamiliaPerfil | null>(environment.apiUrl + '/cliente/perfil');
  }
  salvarFamilia(data: FamiliaPerfil): Observable<FamiliaPerfil> {
    return this.http.put<FamiliaPerfil>(environment.apiUrl + '/cliente/perfil', data);
  }
  obterCuidador(): Observable<CuidadorPerfil | null> {
    return this.http.get<CuidadorPerfil | null>(environment.apiUrl + '/cuidador/perfil');
  }
  salvarCuidador(data: CuidadorPerfil): Observable<CuidadorPerfil> {
    return this.http.put<CuidadorPerfil>(environment.apiUrl + '/cuidador/perfil', data);
  }
}
