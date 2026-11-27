export type RedeSocial = 'instagram' | 'tiktok';

export function usuarioSocial(url: string | null | undefined, rede: RedeSocial): string {
  const prefix = rede === 'instagram' ? /^https:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9._]+)\/?$/ : /^https:\/\/(?:www\.)?tiktok\.com\/@([A-Za-z0-9._]+)\/?$/;
  return url?.match(prefix)?.[1] ?? '';
}

export function linkSocial(usuario: string, rede: RedeSocial): string {
  const value = usuario.trim().replace(/^@/, '');
  if (!value) return '';
  if (!/^[A-Za-z0-9._]+$/.test(value)) throw new Error('Usuário de rede social inválido.');
  return rede === 'instagram' ? 'https://www.instagram.com/' + value : 'https://www.tiktok.com/@' + value;
}
