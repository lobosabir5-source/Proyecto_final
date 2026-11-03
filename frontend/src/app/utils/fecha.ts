const LOCALE = 'es-BO';

// Las fechas sin hora ("2026-11-02") se leen como locales para evitar el desfase de un día.
const aFecha = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);

export const fechaCorta = (iso: string) => aFecha(iso).toLocaleDateString(LOCALE);
export const fechaMedia = (iso: string) =>
  aFecha(iso).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' });
export const fechaLarga = (iso: string) =>
  aFecha(iso).toLocaleDateString(LOCALE, { day: '2-digit', month: 'long', year: 'numeric' });
export const fechaConDia = (iso: string) =>
  aFecha(iso).toLocaleDateString(LOCALE, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
export const horaCorta = (iso: string) =>
  new Date(iso).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });