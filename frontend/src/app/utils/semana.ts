const pad = (n: number) => String(n).padStart(2, '0');

/** Date local -> "YYYY-MM-DD" (sin desfase de zona horaria). */
export function isoDe(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "YYYY-MM-DD" -> Date a medianoche local. */
export function dateDe(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const hoyIso = (): string => isoDe(new Date());

export function sumarDias(iso: string, dias: number): string {
  const d = dateDe(iso);
  d.setDate(d.getDate() + dias);
  return isoDe(d);
}

/** Lunes de la semana que contiene la fecha (igual que el backend: previousOrSame(MONDAY)). */
export function lunesDe(iso: string): string {
  const d = dateDe(iso);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return isoDe(d);
}