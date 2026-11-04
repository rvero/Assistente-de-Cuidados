import type { Routes } from '@angular/router';

import { authGuard, guestGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'cadastro',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/cadastro/cadastro.page').then((m) => m.CadastroPage),
  },
  { path: 'home-cliente', redirectTo: 'busca', pathMatch: 'full' },
  {
    path: 'home-cuidador',
    canActivate: [authGuard],
    data: { tipo: 'CUIDADOR' },
    loadComponent: () => import('./pages/home-cuidador/home-cuidador.page').then((m) => m.HomeCuidadorPage),
  },
  { path: 'perfil', redirectTo: 'opcoes/conta', pathMatch: 'full' },
  {
    path: 'busca',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/busca/busca.page').then((m) => m.BuscaPage),
  },
  {
    path: 'cuidadores/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/cuidador-publico/cuidador-publico.page').then((m) => m.CuidadorPublicoPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { tipo: 'ADMIN' },
    loadComponent: () => import('./pages/admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: 'historico',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/historico/historico.page').then((m) => m.HistoricoPage),
  },
  { path: 'contatos', redirectTo: 'home-cuidador', pathMatch: 'full' },
  {
    path: 'opcoes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/opcoes/opcoes.page').then((m) => m.OpcoesPage),
  },
  {
    path: 'opcoes/conta',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/conta/conta.page').then((m) => m.ContaPage),
  },
  { path: '**', redirectTo: 'inicio' },
];
