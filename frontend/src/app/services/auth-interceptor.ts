import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment';

import { Auth } from './auth';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const protectedApi =
    request.url.startsWith(environment.apiUrl + '/') && !request.url.startsWith(environment.apiUrl + '/auth/');
  const token = auth.token;
  if (protectedApi && token) request = request.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
  return next(request).pipe(
    catchError((error: unknown) => {
      if (protectedApi && token && auth.token === token && error instanceof HttpErrorResponse && error.status === 401) {
        void auth.logout().finally(() => router.navigateByUrl('/login', { replaceUrl: true }));
      }
      return throwError(() => error);
    }),
  );
};
