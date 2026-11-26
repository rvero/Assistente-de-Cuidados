// Atualiza páginas abertas sem manter consultas em abas ocultas.
export function iniciarAtualizacao(atualizar: () => void): () => void {
  const executar = () => { if (document.visibilityState !== 'hidden') atualizar(); };
  const timer = globalThis.setInterval(executar, 5000);
  globalThis.addEventListener('focus', executar);
  document.addEventListener('visibilitychange', executar);
  return () => {
    globalThis.clearInterval(timer);
    globalThis.removeEventListener('focus', executar);
    document.removeEventListener('visibilitychange', executar);
  };
}
