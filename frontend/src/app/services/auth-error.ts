import { HttpErrorResponse } from '@angular/common/http';

type ErrorContext = 'login' | 'cadastro' | 'perfil';

export function authError(error: unknown, context: ErrorContext = 'login'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Não foi possível acessar o serviço. Tente novamente em instantes.';
    if (error.status === 401)
      return context === 'login' ? 'E-mail ou senha inválidos.' : 'Sua sessão expirou. Entre novamente para continuar.';
    if (error.status === 403) return 'Sua conta não tem permissão para acessar estes dados.';
    if (error.status === 409) return 'Este e-mail já está cadastrado.';
    if (error.status === 400) return 'Verifique os dados preenchidos e tente novamente.';
    return 'Não foi possível concluir a solicitação. Tente novamente em instantes.';
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir a solicitação. Tente novamente.';
}
