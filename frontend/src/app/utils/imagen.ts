import { SERVER_URL } from '../config/api.config';

export function resolverImagen(url?: string | null): string | null {
  const u = url?.trim();
  if (!u) return null;
  if (/^https:\/\//i.test(u)) return u;
  if (u.startsWith('/uploads/')) return `${SERVER_URL}${u}`; // subidas desde el admin (backend)
  if (u.startsWith('/') && !u.startsWith('//')) return u;    // public/ de Angular (ej. /planes/x.jpg)
  return null;
}