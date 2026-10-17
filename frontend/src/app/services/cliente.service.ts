import { Injectable, signal } from '@angular/core';

export interface Plan {
  idPlan: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionDias: number;
}

export interface Suscripcion {
  idSuscripcion: number;
  idPlan: number;
  fechaInicio: string;
  fechaFin: string;
  estado: number;
}

export interface Asistencia {
  idAsistencia: number;
  fechaEntrada: string;
  fechaSalida?: string;
}

export interface Pago {
  idPago: number;
  idMetodoPago: number;
  monto: number;
  estado: number;
  fechaPago: string;
}

export interface EjercicioRutina {
  idEjercicio: number;
  diaNum: number;
  grupoMuscular: string;
  nombreEjercicio: string;
  series: number;
  repeticiones: string;
  descansoSeg: number;
  notas: string;
}

export interface RutinaIA {
  idRutina: number;
  titulo: string;
  contexto: string;
  respuesta: string;
  duracionSemana: number;
  creadoEn: string;
  ejercicios: EjercicioRutina[];
}

export interface PermisoAusencia {
  idPermiso: number;
  motivo: string;
  diasAgregados: number;
  solicitadoEn: string;
}

export interface PromocionIA {
  idPromocion: number;
  titulo: string;
  texto: string;
  codigoCupon: string;
  descuentoPorcentaje: number;
  fechaInicio: string;
  fechaFin: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {

  // ======= DATOS DEL CLIENTE (vacíos hasta conectar con la base de datos) =======
  cliente = signal({
    identificacion: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    pesoKg: 0,
    alturaCm: 0,
    diasDisponibles: 0,
    miembroDesde: ''
  });

  plan = signal<Plan>({
    idPlan: 0,
    nombre: '',
    descripcion: '',
    precio: 0,
    duracionDias: 0
  });

  suscripcion = signal<Suscripcion>({
    idSuscripcion: 0,
    idPlan: 0,
    fechaInicio: '',
    fechaFin: '',
    estado: 0
  });

  asistencias = signal<Asistencia[]>([]);

  pagos = signal<Pago[]>([]);

  rutina = signal<RutinaIA>({
    idRutina: 0,
    titulo: '',
    contexto: '',
    respuesta: '',
    duracionSemana: 0,
    creadoEn: '',
    ejercicios: []
  });

  permisos = signal<PermisoAusencia[]>([]);

  promociones = signal<PromocionIA[]>([]);

  // ======= HELPERS =======
  diasRestantes(): number {
    const fechaFin = this.suscripcion().fechaFin;
    if (!fechaFin) return 0;
    const fin = new Date(fechaFin).getTime();
    if (isNaN(fin)) return 0;
    const diff = Math.ceil((fin - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  metodoPago(id: number): string {
    return { 1: 'Efectivo', 2: 'Tarjeta', 3: 'Transferencia' }[id] ?? '—';
  }
}