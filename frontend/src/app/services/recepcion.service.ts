import { Injectable, signal } from '@angular/core';
import {
  Asistencia, Pago, PerfilUsuario, Plan, Suscripcion, Usuario
} from '../models/recepcion.models';

@Injectable({ providedIn: 'root' })
export class RecepcionService {

  // Precios en Bolivianos (Bs)
  planes = signal<Plan[]>([
    { idPlan: 1, nombre: 'Mensual Básico', descripcion: 'Acceso libre en horario normal', precio: 150,  duracionDias: 30,  estado: 1 },
    { idPlan: 2, nombre: 'Trimestral Pro', descripcion: 'Acceso total + 2 clases',       precio: 350,  duracionDias: 90,  estado: 1 },
    { idPlan: 3, nombre: 'Anual Elite',    descripcion: 'Acceso total + rutinas',     precio: 1400, duracionDias: 365, estado: 1 },
  ]);

  usuarios = signal<Usuario[]>([
    { id: 1, email: 'juan@mail.com',   estado: 1, creadoEn: '2026-01-10' },
    { id: 2, email: 'maria@mail.com',  estado: 1, creadoEn: '2026-02-14' },
    { id: 3, email: 'carlos@mail.com', estado: 1, creadoEn: '2026-03-02' },
    { id: 4, email: 'ana@mail.com',    estado: 0, creadoEn: '2026-04-20' },
  ]);

  perfiles = signal<PerfilUsuario[]>([
    { idPerfil: 1, idUsuario: 1, identificacion: '12345678', nombres: 'Juan',   apellidos: 'Pérez',  telefono: '12345678', pesoKg: 78, alturaCm: 178, diasDisponibles: 20 },
    { idPerfil: 2, idUsuario: 2, identificacion: '87654321', nombres: 'María',  apellidos: 'Gómez',  telefono: '77889944', pesoKg: 62, alturaCm: 165, diasDisponibles: 15 },
    { idPerfil: 3, idUsuario: 3, identificacion: '11223344', nombres: 'Carlos', apellidos: 'Ruiz',   telefono: '11223344', pesoKg: 85, alturaCm: 182, diasDisponibles: 25 },
    { idPerfil: 4, idUsuario: 4, identificacion: '44332211', nombres: 'Ana',    apellidos: 'Torres', telefono: '99663322', pesoKg: 55, alturaCm: 160, diasDisponibles: 10 },
  ]);

  suscripciones = signal<Suscripcion[]>([
    { idSuscripcion: 1, idUsuario: 1, idPlan: 1, fechaInicio: '2026-09-01', fechaFin: '2026-10-01', estado: 1 },
    { idSuscripcion: 2, idUsuario: 2, idPlan: 2, fechaInicio: '2026-08-15', fechaFin: '2026-11-15', estado: 1 },
    { idSuscripcion: 3, idUsuario: 3, idPlan: 3, fechaInicio: '2026-01-01', fechaFin: '2027-01-01', estado: 1 },
    { idSuscripcion: 4, idUsuario: 4, idPlan: 1, fechaInicio: '2026-06-01', fechaFin: '2026-07-01', estado: 0 },
  ]);

  asistencias = signal<Asistencia[]>([
    { idAsistencia: 1, idUsuario: 1, fechaEntrada: '2026-10-02T08:30:00', fechaSalida: '2026-10-02T10:15:00' },
    { idAsistencia: 2, idUsuario: 2, fechaEntrada: '2026-10-02T09:00:00' },
    { idAsistencia: 3, idUsuario: 3, fechaEntrada: '2026-10-02T07:45:00', fechaSalida: '2026-10-02T09:30:00' },
  ]);

  // Montos en Bolivianos (Bs) — coinciden con el precio del plan de cada suscripción
  pagos = signal<Pago[]>([
    { idPago: 1, idSuscripcion: 1, idMetodoPago: 1, monto: 150,  estado: 1, fechaPago: '2026-09-01' },
    { idPago: 2, idSuscripcion: 2, idMetodoPago: 2, monto: 350,  estado: 1, fechaPago: '2026-08-15' },
    { idPago: 3, idSuscripcion: 3, idMetodoPago: 1, monto: 1400, estado: 1, fechaPago: '2026-01-01' },
    { idPago: 4, idSuscripcion: 4, idMetodoPago: 3, monto: 150,  estado: 0, fechaPago: '2026-06-01' },
  ]);

  // ---- Helpers ----
  getPerfil(idUsuario: number) {
    return this.perfiles().find(p => p.idUsuario === idUsuario);
  }

  getPlan(idPlan: number) {
    return this.planes().find(p => p.idPlan === idPlan);
  }

  getSuscripcionActiva(idUsuario: number) {
    return this.suscripciones().find(s => s.idUsuario === idUsuario && s.estado === 1);
  }

  registrarEntrada(idUsuario: number) {
    this.asistencias.update(a => [
      ...a,
      { idAsistencia: Date.now(), idUsuario, fechaEntrada: new Date().toISOString() }
    ]);
  }

  registrarSalida(idUsuario: number) {
    this.asistencias.update(a =>
      a.map(x => x.idUsuario === idUsuario && !x.fechaSalida
        ? { ...x, fechaSalida: new Date().toISOString() }
        : x)
    );
  }
}