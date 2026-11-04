import { HttpErrorResponse } from '@angular/common/http';

import { authError } from './auth-error';

export function accountError(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 400) {
    const fields = Object.values(error.error?.errors ?? {}).filter((v): v is string => typeof v === 'string');
    if (fields.length) return fields.join(' ');
    if (typeof error.error?.message === 'string') return error.error.message;
  }
  if (error instanceof HttpErrorResponse && error.status === 409 && typeof error.error?.message === 'string')
    return error.error.message;
  return authError(error, 'perfil');
}
