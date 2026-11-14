export type TurnoPersonal = 'MANANA' | 'TARDE' | 'NOCHE';
export type EstadoAsistenciaPersonal = 'PRESENTE' | 'RETRASO' | 'AUSENTE' | 'PERMISO';

/** Mismos valores que AsistenciaPersonal.Turno / Estado del backend. */
export const TURNOS_PERSONAL: { valor: TurnoPersonal; etiqueta: string }[] = [
  { valor: 'MANANA', etiqueta: 'Mañana' },
  { valor: 'TARDE', etiqueta: 'Tarde' },
  { valor: 'NOCHE', etiqueta: 'Noche' },
];

export const ESTADOS_ASISTENCIA_PERSONAL: { valor: EstadoAsistenciaPersonal; etiqueta: string }[] = [
  { valor: 'PRESENTE', etiqueta: 'Presente' },
  { valor: 'RETRASO', etiqueta: 'Retraso' },
  { valor: 'AUSENTE', etiqueta: 'Ausente' },
  { valor: 'PERMISO', etiqueta: 'Permiso' },
];

/** Respuesta de /api/admin/asistencias-personal (AsistenciaPersonalRespuesta). */
export interface AsistenciaPersonal {
  id: number;
  personalId: number;
  nombreCompleto: string;
  cargo: string;
  fecha: string;
  turno: TurnoPersonal;
  estado: EstadoAsistenciaPersonal;
  /** "HH:mm:ss" o null. */
  horaEntrada: string | null;
  horaSalida: string | null;
  observaciones: string | null;
}

/** Cuerpo de POST y PUT (GuardarAsistenciaPersonalRequest). Horas en "HH:mm". */
export interface GuardarAsistenciaPersonal {
  personalId: number;
  fecha: string;
  turno: TurnoPersonal;
  estado: EstadoAsistenciaPersonal;
  horaEntrada: string | null;
  horaSalida: string | null;
  observaciones: string | null;
}

export interface FiltrosAsistenciaPersonal {
  personalId: string;
  desde: string;
  hasta: string;
  turno: '' | TurnoPersonal;
  estado: '' | EstadoAsistenciaPersonal;
}