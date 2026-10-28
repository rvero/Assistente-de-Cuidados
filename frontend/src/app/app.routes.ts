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
  {
    path: 'home-cliente',
    canActivate: [authGuard],
    data: { tipo: 'CLIENTE' },
    loadComponent: () => import('./pages/home-cliente/home-cliente.page').then((m) => m.HomeClientePage),
  },
  {
    path: 'home-cuidador',
    canActivate: [authGuard],
    data: { tipo: 'CUIDADOR' },
    loadComponent: () => import('./pages/home-cuidador/home-cuidador.page').then((m) => m.HomeCuidadorPage),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil.page').then((m) => m.PerfilPage),
  },
  { path: '**', redirectTo: 'inicio' },
];
