import { Rol } from '../services/auth.service';

export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface UsuarioAdmin {
  id: number;
  usuario: string;
  rol: Rol;
  activo: boolean;
}

export interface CrearUsuario {
  usuario: string;
  password: string;
  rol: Rol;
}
export interface ActualizarUsuario {
  usuario: string;
  password: string | null;
  rol: Rol;
}

export interface CrearCliente {
  usuario: string;
  password: string;
  nombre: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
}

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracionDias: number;
  precio: number;
  activo: boolean;
  horario?: string | null;
  beneficios?: string[];
  imagenUrl?: string | null;
  destacado?: boolean;
  orden?: number;
}

export interface GuardarPlan {
  nombre: string;
  descripcion: string;
  duracionDias: number | null;
  precio: number | null;
  horario: string;
  beneficios: string[];
  destacado: boolean;
  orden: number | null;
  /** El backend actual lo ignora; el frontend lo usa para decidir si hay que desactivar/reactivar. */
  activo: boolean;
}

export type TipoDescuento = 'PORCENTAJE' | 'MONTO';

export interface Promocion {
  id: number;
  nombre: string;
  tipo: TipoDescuento;
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  planId: number | null;
  activo: boolean;
}

export interface GuardarPromocion {
  nombre: string;
  tipo: TipoDescuento;
  valor: number | null;
  fechaInicio: string;
  fechaFin: string;
  planId: number | null;
  activo: boolean;
}

export interface ReporteResumen {
  clientesActivos: number;
  membresiasActivas: number;
  membresiasPendientes: number;
  asistenciasDeHoy: number;
  ingresosDelMes: number;
}