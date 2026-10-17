import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { API_URL } from '../config/api.config';

export interface PerfilCliente {
  id: number;
  usuarioId: number;
  usuario: string;
  nombre: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  fechaAlta: string;
  activo: boolean;
}

export interface MembresiaCliente {
  id: number;
  clienteId: number;
  cliente: string;
  planId: number;
  plan: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'PENDIENTE' | 'ACTIVA' | 'POR_VENCER' | 'VENCIDA' | 'CANCELADA';
  precioTotal: number;
  pagado: number;
  saldo: number;
  precioPlan: number;
  descuento: number;
  precioRenovacion: number;
}

export interface AsistenciaCliente {
  id: number;
  clienteId: number;
  cliente: string;
  fecha: string;
  horaEntrada: string;
  registradaPor: string;
}

export interface PagoCliente {
  id: number;
  membresiaId: number;
  cliente: string;
  monto: number;
  metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  fechaPago: string;
  registradoPor: string;
}

export interface RutinaCliente {
  id: number;
  clienteId: number;
  cliente: string;
  nombre: string;
  contenido: string;
  fechaCreacion: string;
  activa: boolean;
}

export interface PromocionCliente {
  id: number;
  nombre: string;
  tipo: 'PORCENTAJE' | 'MONTO';
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  planId: number | null;
  activo: boolean;
}

export interface PermisoCliente {
  id: number;
  membresiaId: number;
  motivo: string;
  diasAgregados: number;
  solicitadoEn: string;
}

interface Pagina<T> {
  content: T[];
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_URL}/cliente`;

  readonly perfil = signal<PerfilCliente | null>(null);
  readonly membresias = signal<MembresiaCliente[]>([]);
  readonly asistencias = signal<AsistenciaCliente[]>([]);
  readonly pagos = signal<PagoCliente[]>([]);
  readonly rutinas = signal<RutinaCliente[]>([]);
  readonly permisos = signal<PermisoCliente[]>([]);
  readonly promociones = signal<PromocionCliente[]>([]);
  readonly cargando = signal(true);

  private cargado = false;

  cargar(): void {
    if (this.cargado) return;
    this.cargado = true;
    let pendientes = 7;
    const terminado = () => {
      pendientes--;
      if (pendientes === 0) this.cargando.set(false);
    };

    this.http.get<PerfilCliente>(`${this.apiUrl}/perfil`).subscribe({
      next: perfil => this.perfil.set(perfil),
      error: () => { this.perfil.set(null); terminado(); },
      complete: terminado
    });
    this.cargarPagina<MembresiaCliente>('membresias', datos => this.membresias.set(datos), terminado);
    this.cargarPagina<AsistenciaCliente>('asistencias', datos => this.asistencias.set(datos), terminado);
    this.cargarPagina<PagoCliente>('pagos', datos => this.pagos.set(datos), terminado);
    this.cargarPagina<RutinaCliente>('rutinas', datos => this.rutinas.set(datos), terminado);
    this.http.get<PermisoCliente[]>(`${this.apiUrl}/permisos`).subscribe({
      next: datos => this.permisos.set(datos),
      error: () => { this.permisos.set([]); terminado(); },
      complete: terminado
    });
    this.http.get<PromocionCliente[]>(`${this.apiUrl}/promociones`).subscribe({
      next: datos => this.promociones.set(datos),
      error: () => { this.promociones.set([]); terminado(); },
      complete: terminado
    });
  }

  membresiaActual(): MembresiaCliente | null {
    return this.membresias().find(m => m.estado === 'ACTIVA' || m.estado === 'POR_VENCER')
      ?? this.membresias()[0]
      ?? null;
  }

  diasRestantes(): number {
    const fin = this.membresiaActual()?.fechaFin;
    if (!fin) return 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaFin = new Date(`${fin}T00:00:00`);
    return Math.max(0, Math.ceil((fechaFin.getTime() - hoy.getTime()) / 86_400_000));
  }

  totalPagado(): number {
    return this.pagos().reduce((total, pago) => total + Number(pago.monto), 0);
  }

  metodoPago(metodo: PagoCliente['metodo']): string {
    return ({ EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' })[metodo];
  }

  private cargarPagina<T>(ruta: string, guardar: (datos: T[]) => void, terminado: () => void): void {
    this.http.get<Pagina<T>>(`${this.apiUrl}/${ruta}?page=0&size=100`).subscribe({
      next: pagina => guardar(pagina.content ?? []),
      error: () => { guardar([]); terminado(); },
      complete: terminado
    });
  }
}
