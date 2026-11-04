import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import type { Sessao } from './api';
import type { CuidadorPerfil } from './profile-api';

export interface ContaData {
  nome: string;
  email: string;
  cpf: string | null;
}
export interface ContaUpdate {
  nome: string;
  email: string;
  cpf: string;
  senhaAtual: string;
  novaSenha?: string;
}
export interface ContatoRecebido {
  id: number;
  nome: string;
  email: string;
  criadoEm: string;
}
@Injectable({ providedIn: 'root' })
export class AccountApi {
  private readonly http = inject(HttpClient);
  obter(): Observable<ContaData> {
    return this.http.get<ContaData>(environment.apiUrl + '/conta');
  }
  salvar(data: ContaUpdate): Observable<Sessao> {
    return this.http.put<Sessao>(environment.apiUrl + '/conta', data);
  }
  salvarCuidador(conta: ContaUpdate, perfil: CuidadorPerfil): Observable<Sessao> {
    return this.http.put<Sessao>(environment.apiUrl + '/conta/perfil-cuidador', { conta, perfil });
  }
  excluir(senhaAtual: string): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + '/conta', { body: { senhaAtual } });
  }
  contatos(): Observable<ContatoRecebido[]> {
    return this.http.get<ContatoRecebido[]>(environment.apiUrl + '/contatos');
  }
}
