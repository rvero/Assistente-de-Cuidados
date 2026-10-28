import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = async (route) => {
  const auth = inject(Auth);
  const router = inject(Router);
  await auth.restaurar();
  if (!auth.usuario()) return router.parseUrl('/login');
  return !route.data['tipo'] || auth.usuario()?.role === route.data['tipo'] ? true : router.parseUrl(auth.home);
};
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  await auth.restaurar();
  return auth.usuario() ? router.parseUrl(auth.home) : true;
};
