export function redirectRules(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Configure API_BASE_URL no Netlify com a URL HTTPS do Render.');
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('API_BASE_URL deve conter apenas a origem HTTPS do backend, sem /api, credenciais ou parâmetros.');
  }
  return `/api/* ${url.origin}/api/:splat 200\n/* /index.html 200\n`;
}
