// getDay(): 0=Domingo ... 6=Sábado
export const DIAS_FORM = [
  { n: 1, label: 'Lunes' }, { n: 2, label: 'Martes' }, { n: 3, label: 'Miércoles' },
  { n: 4, label: 'Jueves' }, { n: 5, label: 'Viernes' }, { n: 6, label: 'Sábado' },
  { n: 0, label: 'Domingo' },
];

const CLAVE: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
};
const REGEX = /^[\s#*>_-]*(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b[\s*:–—-]*(.*)$/i;
const sinTildes = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Lee "Lunes: pecho..." línea por línea y devuelve el texto de cada día de la semana. */
export function parsearDias(contenido: string): Map<number, string> {
  const mapa = new Map<number, string>();
  let dia: number | null = null;
  for (const linea of contenido.split(/\r?\n/)) {
    const m = linea.match(REGEX);
    if (m) {
      dia = CLAVE[sinTildes(m[1])];
      mapa.set(dia, m[2].trim());
    } else if (dia !== null) {
      mapa.set(dia, `${mapa.get(dia) ?? ''}\n${linea}`.trim());
    }
  }
  return mapa;
}

export function armarContenido(textos: Record<number, string>): string {
  return DIAS_FORM
    .filter(d => (textos[d.n] ?? '').trim())
    .map(d => `${d.label}: ${textos[d.n].trim()}`)
    .join('\n');
}