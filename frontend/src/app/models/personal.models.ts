import { CargoPersonal, EstadoLaboral, PersonalAdmin } from './personal-admin.models';

export const CARGOS_PERSONAL: { valor: CargoPersonal; etiqueta: string }[] = [
  { valor: 'ADMINISTRATIVO', etiqueta: 'Administrativo' },
  { valor: 'INSTRUCTOR', etiqueta: 'Instructor' },
  { valor: 'LIMPIEZA', etiqueta: 'Limpieza' },
];

/** Mismos valores que el enum Personal.EstadoLaboral del backend. */
export const ESTADOS_LABORALES: { valor: EstadoLaboral; etiqueta: string }[] = [
  { valor: 'ACTIVO', etiqueta: 'Activo' },
  { valor: 'INACTIVO', etiqueta: 'Inactivo' },
  { valor: 'SUSPENDIDO', etiqueta: 'Suspendido' },
  { valor: 'RETIRADO', etiqueta: 'Retirado' },
];

/** Respuesta completa de /api/admin/personal (PersonalRespuesta). */
export interface Personal extends PersonalAdmin {
  documento: string;
  telefono: string | null;
  correo: string | null;
  fechaIngreso: string;
  fechaSalida: string | null;
  observaciones: string | null;
}

/** Cuerpo de POST y PUT (GuardarPersonalRequest). */
export interface GuardarPersonal {
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string | null;
  correo: string | null;
  cargo: CargoPersonal;
  fechaIngreso: string;
  observaciones: string | null;
}

export interface FiltrosPersonal {
  /** El backend busca por nombres, apellidos o documento. */
  texto: string;
  cargo: '' | CargoPersonal;
  estado: '' | EstadoLaboral;
}