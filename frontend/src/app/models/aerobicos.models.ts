import { Pagina } from './admin.models';

export type EstadoClase = 'PROGRAMADA' | 'CANCELADA' | 'FINALIZADA';

export const ESTADOS_CLASE: { valor: EstadoClase; etiqueta: string }[] = [
  { valor: 'PROGRAMADA', etiqueta: 'Programada' },
  { valor: 'FINALIZADA', etiqueta: 'Finalizada' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada' },
];

export interface ClaseAerobica {
  id: number;
  nombre: string;
  descripcion: string | null;
  instructorId: number;
  instructor: string;
  /** "YYYY-MM-DD" */
  fecha: string;
  /** "HH:mm:ss" */
  horaInicio: string;
  horaFin: string;
  cupoMaximo: number;
  inscritos: number;
  cuposDisponibles: number;
  estado: EstadoClase;
  llegadaInstructor: string | null;
  minutosRetrasoInstructor: number | null;
}

export interface GuardarClaseAerobica {
  nombre: string;
  descripcion: string | null;
  instructorId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  cupoMaximo: number;
}

export interface InscripcionAerobica {
  id: number;
  claseId: number;
  clienteId: number;
  cliente: string;
  fechaInscripcion: string;
  llegadaCliente: string | null;
  asistio: boolean | null;
  estado: 'INSCRITO' | 'CANCELADO';
  ordenLlegada: number | null;
}

export type PaginaClases = Pagina<ClaseAerobica>;
export type PaginaInscripciones = Pagina<InscripcionAerobica>;