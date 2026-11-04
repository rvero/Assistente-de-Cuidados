import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export type TipoConta = 'CLIENTE' | 'CUIDADOR';
export type Papel = TipoConta | 'ADMIN';
export interface Usuario {
  nome: string;
  email: string;
  role: Papel;
}
export interface Sessao extends Usuario {
  token: string;
}
export interface Cadastro {
  cpf: string;
  nome: string;
  email: string;
  password: string;
  tipo: TipoConta;
}
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  login(email: string, senha: string): Observable<Sessao> {
    return this.http.post<Sessao>(environment.apiUrl + '/auth/login', { email, password: senha });
  }
  cadastrar(dados: Cadastro): Observable<object> {
    return this.http.post(environment.apiUrl + '/auth/register', dados);
  }
  obterUsuario(): Observable<Usuario> {
    return this.http.get<Usuario>(environment.apiUrl + '/users/me');
  }
}
