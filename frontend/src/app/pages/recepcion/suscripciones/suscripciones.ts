import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Paginador } from '../../../components/paginador/paginador';
import { API_URL } from '../../../config/api.config';
import { Plan } from '../../../models/admin.models';
import { ClienteRecepcion, EstadoMembresia, HistorialMembresia, Membresia } from '../../../models/recepcion.models';
import { ClienteRecepcionService } from '../../../services/cliente-recepcion.service';
import { MembresiaRecepcionService, TAMANO_PAGINA_MEMBRESIAS } from '../../../services/membresia-recepcion.service';
import { leerErrorApi } from '../../../utils/api-error';

const ETIQUETAS: Record<EstadoMembresia, string> = {
  PENDIENTE: 'Pendiente de pago', ACTIVA: 'Activa', POR_VENCER: 'Por vencer', VENCIDA: 'Vencida', CANCELADA: 'Cancelada'
};
const CLASES: Record<EstadoMembresia, string> = {
  PENDIENTE: 'border-neutral-500 text-neutral-300', ACTIVA: 'border-emerald-500 text-emerald-300',
  POR_VENCER: 'border-amber-500 text-amber-300', VENCIDA: 'border-red-500 text-red-300',
  CANCELADA: 'border-neutral-700 text-neutral-500'
};
// Ajusta las claves a los valores reales que devuelve tu backend en "operacion".
const OPERACIONES: Record<string, string> = {
  RENOVACION: 'Renovación', CONTRATACION: 'Contratación', CANCELACION: 'Cancelación'
};

@Component({
  selector: 'app-suscripciones',
  standalone: true,
  imports: [FormsModule, Paginador, DatePipe, DecimalPipe],
  templateUrl: './suscripciones.html'
})
export class SuscripcionesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly membresiasApi = inject(MembresiaRecepcionService);
  private readonly clientesApi = inject(ClienteRecepcionService);

  readonly tamanoPagina = TAMANO_PAGINA_MEMBRESIAS;
  readonly estados = Object.keys(ETIQUETAS) as EstadoMembresia[];
  readonly membresias = signal<Membresia[]>([]);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly filtroEstado = signal<'' | EstadoMembresia>('');
  readonly visibles = computed(() =>
    this.membresias().filter(m => !this.filtroEstado() || m.estado === this.filtroEstado()));

  readonly planes = signal<Plan[]>([]);
  readonly clientesEncontrados = signal<ClienteRecepcion[]>([]);
  readonly mostrarContratar = signal(false);
  busqueda = '';
  clienteId: number | null = null;
  planId: number | null = null;

  readonly editando = signal<Membresia | null>(null);
  fechaInicioEdit = '';
  fechaFinEdit = '';

  readonly historial = signal<HistorialMembresia[]>([]);
  readonly historialDe = signal('');
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  ngOnInit(): void {
    this.cargar();
    this.http.get<Plan[]>(`${API_URL}/recepcion/planes`).subscribe({
      next: p => this.planes.set(p.filter(x => x.activo !== false)),
      error: e => this.fallar(e)
    });
  }

  cargar(pagina = this.pagina()): void {
    this.cargando.set(true);
    this.membresiasApi.listar(pagina).subscribe({
      next: r => {
        this.membresias.set(r.content);
        this.pagina.set(r.number);
        this.totalPaginas.set(r.totalPages);
        this.totalElementos.set(r.totalElements);
        this.cargando.set(false);
      },
      error: e => { this.fallar(e); this.cargando.set(false); }
    });
  }

  irAPagina(pagina: number): void { this.cargar(pagina); }

  buscarClientes(): void {
    this.clientesApi.listar({ nombre: this.busqueda, correo: '', telefono: '', documento: '', estado: 'true' }, 0)
      .subscribe({
        next: r => {
          this.clientesEncontrados.set(r.content);
          this.clienteId = r.content.length === 1 ? r.content[0].id : null;
        },
        error: e => this.fallar(e)
      });
  }

  contratar(): void {
    if (this.clienteId === null || this.planId === null) { this.error.set('Selecciona un cliente y un plan.'); return; }
    this.limpiar();
    this.membresiasApi.contratar(this.clienteId, this.planId).subscribe({
      next: () => {
        this.exito.set('Membresía contratada. Queda pendiente hasta registrar el pago.');
        this.mostrarContratar.set(false);
        this.clienteId = this.planId = null;
        this.busqueda = '';
        this.clientesEncontrados.set([]);
        this.cargar(0);
      },
      error: e => this.fallar(e)
    });
  }

  renovar(m: Membresia): void {
    if (!confirm(`¿Renovar el plan ${m.plan} de ${m.cliente} por Bs ${Number(m.precioRenovacion).toFixed(2)}?`)) return;
    this.limpiar();
    this.membresiasApi.renovar(m.id).subscribe({
      next: () => { this.exito.set('Membresía renovada. Registra el pago desde Finanzas.'); this.cargar(); this.verHistorial(m); },
      error: e => this.fallar(e)
    });
  }

  abrirEditar(m: Membresia): void {
    this.limpiar();
    this.mostrarContratar.set(false);
    this.editando.set(m);
    this.fechaInicioEdit = m.fechaInicio;
    this.fechaFinEdit = m.fechaFin;
  }

  cerrarEditar(): void { this.editando.set(null); }

  guardarEdicion(): void {
    const m = this.editando();
    if (!m) return;
    if (!this.fechaInicioEdit || !this.fechaFinEdit) { this.error.set('Completa ambas fechas.'); return; }
    this.limpiar();
    this.membresiasApi.editar(m.id, this.fechaInicioEdit, this.fechaFinEdit).subscribe({
      next: () => {
        this.exito.set('Membresía actualizada. El estado se ajustó según la fecha.');
        this.editando.set(null);
        this.cargar();
      },
      error: e => this.fallar(e)
    });
  }

  verHistorial(m: Membresia): void {
    this.membresiasApi.historial(m.clienteId).subscribe({
      next: h => { this.historial.set(h); this.historialDe.set(m.cliente); },
      error: e => this.fallar(e)
    });
  }

  puedeRenovar(m: Membresia): boolean {
    return m.estado === 'ACTIVA' || m.estado === 'POR_VENCER' || m.estado === 'VENCIDA';
  }

  etiqueta(e: EstadoMembresia): string { return ETIQUETAS[e]; }
  clase(e: EstadoMembresia): string { return CLASES[e]; }
  etiquetaOperacion(op: string): string { return OPERACIONES[op] ?? op; }

  diasRestantes(m: Membresia): number {
    const fin = new Date(`${m.fechaFin}T00:00:00`).getTime();
    return Math.round((fin - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  }

  private limpiar(): void { this.error.set(''); this.exito.set(''); }
  private fallar(e: HttpErrorResponse): void { this.exito.set(''); this.error.set(leerErrorApi(e).mensaje); }
}