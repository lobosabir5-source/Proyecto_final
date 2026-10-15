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

  // ======= DATOS SIMULADOS DEL CLIENTE LOGUEADO =======
  cliente = signal({
    identificacion: '12345678',
    nombres: 'Juan',
    apellidos: 'Pérez',
    email: 'juan@mail.com',
    telefono: '12345678',
    pesoKg: 78,
    alturaCm: 178,
    diasDisponibles: 20,
    miembroDesde: '2026-01-10'
  });

  plan = signal<Plan>({
    idPlan: 1,
    nombre: 'Mensual Básico',
    descripcion: 'Acceso libre en horario normal',
    precio: 150,
    duracionDias: 30
  });

  suscripcion = signal<Suscripcion>({
    idSuscripcion: 1,
    idPlan: 1,
    fechaInicio: '2026-09-01',
    fechaFin: '2026-10-01',
    estado: 1
  });

  asistencias = signal<Asistencia[]>([
    { idAsistencia: 1, fechaEntrada: '2026-10-02T08:30:00', fechaSalida: '2026-10-02T10:15:00' },
    { idAsistencia: 2, fechaEntrada: '2026-09-30T09:00:00', fechaSalida: '2026-09-30T11:00:00' },
    { idAsistencia: 3, fechaEntrada: '2026-09-28T07:45:00', fechaSalida: '2026-09-28T09:30:00' },
    { idAsistencia: 4, fechaEntrada: '2026-09-25T08:00:00', fechaSalida: '2026-09-25T10:00:00' },
    { idAsistencia: 5, fechaEntrada: '2026-09-23T18:30:00', fechaSalida: '2026-09-23T20:15:00' },
  ]);

  pagos = signal<Pago[]>([
    { idPago: 1, idMetodoPago: 1, monto: 150, estado: 1, fechaPago: '2026-09-01' },
    { idPago: 2, idMetodoPago: 2, monto: 150, estado: 1, fechaPago: '2026-08-01' },
    { idPago: 3, idMetodoPago: 1, monto: 150, estado: 1, fechaPago: '2026-07-01' },
    { idPago: 4, idMetodoPago: 1, monto: 150, estado: 1, fechaPago: '2026-06-01' },
  ]);

  rutina = signal<RutinaIA>({
    idRutina: 1,
    titulo: 'Plan de Hipertrofia — 4 semanas',
    contexto: 'Objetivo: ganar masa muscular en tren superior.',
    respuesta: 'Rutina dividida en 4 días con énfasis en press y jalones.',
    duracionSemana: 4,
    creadoEn: '2026-09-20',
    ejercicios: [
      { idEjercicio: 1, diaNum: 1, grupoMuscular: 'Pecho',      nombreEjercicio: 'Press banca',        series: 4, repeticiones: '8-10', descansoSeg: 90, notas: 'Codos a 45°' },
      { idEjercicio: 2, diaNum: 1, grupoMuscular: 'Pecho',      nombreEjercicio: 'Press inclinado mancuernas', series: 3, repeticiones: '10-12', descansoSeg: 60, notas: 'Controlar bajada' },
      { idEjercicio: 3, diaNum: 1, grupoMuscular: 'Tríceps',    nombreEjercicio: 'Fondos en paralelas', series: 3, repeticiones: '10',   descansoSeg: 60, notas: 'Peso corporal' },
      { idEjercicio: 4, diaNum: 2, grupoMuscular: 'Espalda',    nombreEjercicio: 'Dominadas',           series: 4, repeticiones: '6-8',  descansoSeg: 90, notas: 'Completas' },
      { idEjercicio: 5, diaNum: 2, grupoMuscular: 'Espalda',    nombreEjercicio: 'Remo con barra',      series: 4, repeticiones: '8-10', descansoSeg: 90, notas: 'Espalda recta' },
      { idEjercicio: 6, diaNum: 2, grupoMuscular: 'Bíceps',     nombreEjercicio: 'Curl barra',          series: 3, repeticiones: '10-12', descansoSeg: 60, notas: 'Sin balanceo' },
      { idEjercicio: 7, diaNum: 3, grupoMuscular: 'Piernas',    nombreEjercicio: 'Sentadilla',          series: 4, repeticiones: '8-10', descansoSeg: 120, notas: 'Profundidad paralela' },
      { idEjercicio: 8, diaNum: 3, grupoMuscular: 'Piernas',    nombreEjercicio: 'Peso muerto rumano',  series: 3, repeticiones: '10',   descansoSeg: 90, notas: 'Sentir isquios' },
      { idEjercicio: 9, diaNum: 4, grupoMuscular: 'Hombros',    nombreEjercicio: 'Press militar',       series: 4, repeticiones: '8-10', descansoSeg: 90, notas: 'Core activo' },
      { idEjercicio: 10, diaNum: 4, grupoMuscular: 'Hombros',   nombreEjercicio: 'Elevaciones laterales', series: 3, repeticiones: '12-15', descansoSeg: 45, notas: 'Ligero' },
    ]
  });

  permisos = signal<PermisoAusencia[]>([
    { idPermiso: 1, motivo: 'Viaje familiar',       diasAgregados: 5, solicitadoEn: '2026-08-15' },
    { idPermiso: 2, motivo: 'Lesión de rodilla',    diasAgregados: 10, solicitadoEn: '2026-05-20' },
  ]);

  promociones = signal<PromocionIA[]>([
    { idPromocion: 1, titulo: 'Trae un amigo',        texto: '20% de descuento en tu próxima renovación al traer un amigo.', codigoCupon: 'AMIGO',  descuentoPorcentaje: 20, fechaInicio: '2026-09-01', fechaFin: '2026-10-31' },
    { idPromocion: 2, titulo: 'Renovación anticipada', texto: 'Renueva 15 días antes y llévate 1 mes de regalo.',           codigoCupon: 'ANTICIPA', descuentoPorcentaje: 15, fechaInicio: '2026-09-15', fechaFin: '2026-12-31' },
    { idPromocion: 3, titulo: 'Plan Anual Elite',      texto: 'Cambia al plan anual y ahorra 30% respecto al mensual.',      codigoCupon: 'ELITE30',  descuentoPorcentaje: 30, fechaInicio: '2026-08-01', fechaFin: '2026-12-31' },
  ]);

  // ======= HELPERS =======
  diasRestantes(): number {
    const fin = new Date(this.suscripcion().fechaFin).getTime();
    const hoy = Date.now();
    const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  metodoPago(id: number): string {
    return { 1: 'Efectivo', 2: 'Tarjeta', 3: 'Transferencia' }[id] ?? '—';
  }
}