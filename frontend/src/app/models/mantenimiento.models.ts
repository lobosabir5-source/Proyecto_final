import { Pagina } from './admin.models';
import { EstadoEquipo } from './equipos.models';

export type EstadoMantenimiento = 'PENDIENTE' | 'REALIZADO' | 'CANCELADO';

export const ESTADOS_MANTENIMIENTO: { valor: EstadoMantenimiento; etiqueta: string }[] = [
  { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
  { valor: 'REALIZADO', etiqueta: 'Realizado' },
  { valor: 'CANCELADO', etiqueta: 'Cancelado' },
];

export interface Mantenimiento {
  id: number;
  equipoId: number;
  tecnicoId: number | null;
  fechaProgramada: string;
  fechaRealizada: string | null;
  estado: EstadoMantenimiento;
  trabajoRealizado: string | null;
  observaciones: string | null;
  /** El backend lo calcula: pendiente con fecha programada anterior a hoy. */
  vencido: boolean;
}

export interface GuardarMantenimiento {
  equipoId: number;
  fechaProgramada: string;
  tecnicoId: number | null;
  observaciones: string | null;
}

export interface CompletarMantenimiento {
  fechaRealizada: string | null;
  trabajoRealizado: string;
  observaciones: string | null;
  estadoEquipo: EstadoEquipo | null;
}

/** Filtros que sí resuelve el backend (GET /registros). */
export interface FiltrosMantenimiento {
  equipoId: string;
  estado: '' | EstadoMantenimiento;
  vencidos: boolean;
}

export interface AlertasMantenimiento {
  mantenimientosVencidos: number;
  mantenimientosHoy: number;
  equiposFueraServicio: number;
  equiposEnMantenimiento: number;
}

export type PaginaMantenimientos = Pagina<Mantenimiento>;