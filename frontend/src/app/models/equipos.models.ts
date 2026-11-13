import { Pagina } from './admin.models';

export type EstadoEquipo = 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO';
export type DiaSemana = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

/** Mismos valores que el enum Equipo.Estado del backend. */
export const ESTADOS_EQUIPO: { valor: EstadoEquipo; etiqueta: string }[] = [
  { valor: 'OPERATIVO', etiqueta: 'Operativo' },
  { valor: 'EN_MANTENIMIENTO', etiqueta: 'En mantenimiento' },
  { valor: 'FUERA_DE_SERVICIO', etiqueta: 'Fuera de servicio' },
];

/** `indice` = posición desde el lunes (0..6), igual que DayOfWeek.getValue() - 1. */
export const DIAS_SEMANA: { valor: DiaSemana; etiqueta: string; indice: number }[] = [
  { valor: 'MONDAY', etiqueta: 'Lunes', indice: 0 },
  { valor: 'TUESDAY', etiqueta: 'Martes', indice: 1 },
  { valor: 'WEDNESDAY', etiqueta: 'Miércoles', indice: 2 },
  { valor: 'THURSDAY', etiqueta: 'Jueves', indice: 3 },
  { valor: 'FRIDAY', etiqueta: 'Viernes', indice: 4 },
  { valor: 'SATURDAY', etiqueta: 'Sábado', indice: 5 },
  { valor: 'SUNDAY', etiqueta: 'Domingo', indice: 6 },
];

export interface Equipo {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion: string | null;
  descripcion: string | null;
  estado: EstadoEquipo;
  mantenimientoActivo: boolean;
  diaUno: DiaSemana;
  diaDos: DiaSemana;
  tecnicoId: number | null;
  fechaAlta: string;
}

export interface GuardarEquipo {
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion: string | null;
  descripcion: string | null;
  estado: EstadoEquipo;
  mantenimientoActivo: boolean;
  diaUno: DiaSemana;
  diaDos: DiaSemana;
  tecnicoId: number | null;
  fechaAlta: string | null;
}

export interface FiltrosEquipos {
  texto: string;
  estado: '' | EstadoEquipo;
}

export type PaginaEquipos = Pagina<Equipo>;