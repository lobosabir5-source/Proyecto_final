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

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracionDias: number;
  precio: number;
  activo: boolean;
}

export interface GuardarPlan {
  nombre: string;
  descripcion: string;
  duracionDias: number;
  precio: number | null;
}

export interface ReporteResumen {
  clientesActivos: number;
  membresiasActivas: number;
  membresiasPendientes: number;
  asistenciasDeHoy: number;
  ingresosDelMes: number;
}