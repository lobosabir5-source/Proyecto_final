export interface Usuario {
  id: number;
  email: string;
  estado: number;
  creadoEn: string;
}

export interface PerfilUsuario {
  idPerfil: number;
  idUsuario: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  pesoKg?: number;
  alturaCm?: number;
  diasDisponibles?: number;
}

export interface Plan {
  idPlan: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionDias: number;
  estado: number;
}

export interface Suscripcion {
  idSuscripcion: number;
  idUsuario: number;
  idPlan: number;
  fechaInicio: string;
  fechaFin: string;
  estado: number;
}

export interface Asistencia {
  idAsistencia: number;
  idUsuario: number;
  fechaEntrada: string;
  fechaSalida?: string;
}

export interface Pago {
  idPago: number;
  idSuscripcion: number;
  idMetodoPago: number;
  monto: number;
  estado: number;
  fechaPago: string;
}