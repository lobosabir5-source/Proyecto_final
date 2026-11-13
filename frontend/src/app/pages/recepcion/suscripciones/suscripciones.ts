import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Paginador } from '../../../shared/ui/paginador/paginador';
import { API_URL } from '../../../config/api.config';
import { Plan } from '../../../models/admin.models';
import { ClienteRecepcion, EstadoMembresia, HistorialMembresia, Membresia } from '../../../models/recepcion.models';
import { ClienteRecepcionService } from '../../../services/cliente-recepcion.service';
import { MembresiaRecepcionService, TAMANO_PAGINA_MEMBRESIAS } from '../../../services/membresia-recepcion.service';
import { leerErrorApi } from '../../../utils/api-error';
import { Alerta } from '../components/alerta';
import { Boton, Campo, Entrada } from '../components/formulario';
import { PageHeader } from '../components/page-header';
import { Panel } from '../components/panel';
import { TablaDatos, FilaTabla, CeldaTabla, Columna } from '../components/tabla-datos';

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
  imports: [FormsModule, Paginador, DatePipe, DecimalPipe, PageHeader, Alerta, Panel, Campo, Entrada, Boton, TablaDatos, FilaTabla, CeldaTabla],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Recepción / Suscripciones" titulo="Membresías">
      <button type="button" appBoton="primario" (click)="mostrarContratar.set(!mostrarContratar())">
        {{ mostrarContratar() ? 'Cerrar' : '+ Añadir' }}
      </button>
    </app-page-header>

    @if (exito()) { <app-alerta tipo="exito">{{ exito() }}</app-alerta> }
    @if (error()) { <app-alerta>{{ error() }}</app-alerta> }

    @if (mostrarContratar()) {
      <app-panel class="mb-6 grid gap-4 md:grid-cols-4 items-end">
        <app-campo etiqueta="Buscar cliente" para="m-buscar">
          <div class="flex gap-2">
            <input id="m-buscar" name="m-buscar" appEntrada [(ngModel)]="busqueda" (keyup.enter)="buscarClientes()" placeholder="Nombre" autocomplete="off" />
            <button type="button" appBoton="acento" (click)="buscarClientes()">Buscar</button>
          </div>
        </app-campo>
        <app-campo etiqueta="Cliente" para="m-cliente">
          <select id="m-cliente" name="m-cliente" appEntrada [(ngModel)]="clienteId">
            <option [ngValue]="null">Selecciona…</option>
            @for (c of clientesEncontrados(); track c.id) { <option [ngValue]="c.id">{{ c.nombre }}</option> }
          </select>
        </app-campo>
        <app-campo etiqueta="Plan" para="m-plan">
          <select id="m-plan" name="m-plan" appEntrada [(ngModel)]="planId">
            <option [ngValue]="null">Selecciona…</option>
            @for (p of planes(); track p.id) { <option [ngValue]="p.id">{{ p.nombre }} · Bs {{ p.precio | number:'1.2-2' }}</option> }
          </select>
        </app-campo>
        <button type="button" appBoton="primario" (click)="contratar()">Contratar</button>
      </app-panel>
    }

    @if (editando(); as e) {
      <app-panel class="mb-6 grid gap-4 md:grid-cols-4 items-end">
        <p class="md:col-span-4 text-sm text-neutral-300">
          Editando: <strong>{{ e.cliente }}</strong> · {{ e.plan }}
          <span class="text-neutral-500">(el estado se recalcula según la fecha de fin)</span>
        </p>
        <app-campo etiqueta="Fecha inicio" para="e-inicio">
          <input id="e-inicio" name="e-inicio" type="date" appEntrada [(ngModel)]="fechaInicioEdit" />
        </app-campo>
        <app-campo etiqueta="Fecha fin" para="e-fin">
          <input id="e-fin" name="e-fin" type="date" appEntrada [(ngModel)]="fechaFinEdit" />
        </app-campo>
        <button type="button" appBoton="primario" (click)="guardarEdicion()">Guardar</button>
        <button type="button" appBoton="secundario" (click)="cerrarEditar()">Cancelar</button>
      </app-panel>
    }

    <app-panel class="mb-4">
      <app-campo etiqueta="Estado (página actual)" para="m-estado" class="max-w-xs">
        <select id="m-estado" name="m-estado" appEntrada [ngModel]="filtroEstado()" (ngModelChange)="filtroEstado.set($event)">
          <option value="">Todos</option>
          @for (e of estados; track e) { <option [value]="e">{{ etiqueta(e) }}</option> }
        </select>
      </app-campo>
    </app-panel>

    <app-tabla-datos [columnas]="columnas" [vacia]="visibles().length === 0"
                     [mensajeVacio]="cargando() ? 'Cargando…' : 'No hay membresías para mostrar.'">
      @for (m of visibles(); track m.id) {
        <tr app-fila>
          <td app-celda class="font-semibold">{{ m.cliente }}</td>
          <td app-celda>{{ m.plan }}</td>
          <td app-celda>
            {{ m.fechaFin | date:'dd/MM/yyyy' }}
            @if (m.estado === 'ACTIVA' || m.estado === 'POR_VENCER') { <span class="block text-xs text-neutral-500">{{ diasRestantes(m) }} días</span> }
          </td>
          <td app-celda><span class="border px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase" [class]="clase(m.estado)">{{ etiqueta(m.estado) }}</span></td>
          <td app-celda class="text-right">Bs {{ m.precioPlan | number:'1.2-2' }}</td>
          <td app-celda class="text-right text-emerald-300">{{ m.descuento > 0 ? '- Bs ' + (m.descuento | number:'1.2-2') : '—' }}</td>
          <td app-celda class="text-right text-yellow-400 font-bold">Bs {{ m.precioRenovacion | number:'1.2-2' }}</td>
          <td app-celda class="text-right">Bs {{ m.saldo | number:'1.2-2' }}</td>
          <td app-celda class="text-right whitespace-nowrap">
            @if (puedeRenovar(m)) { <button type="button" appBoton="acento" class="mr-2" (click)="renovar(m)">Renovar</button> }
            @if (m.estado !== 'CANCELADA') { <button type="button" appBoton="neutro" class="mr-2" (click)="abrirEditar(m)">Editar</button> }
            <button type="button" appBoton="neutro" (click)="verHistorial(m)">Historial</button>
          </td>
        </tr>
      }
    </app-tabla-datos>
    <app-paginador tema="oscuro" [pagina]="pagina()" [totalPaginas]="totalPaginas()"
                   [totalElementos]="totalElementos()" [tamano]="tamanoPagina" (cambiar)="irAPagina($event)" />

    @if (historialDe()) {
      <app-panel [titulo]="'Historial de ' + historialDe()" class="mt-6">
        <app-tabla-datos [columnas]="columnasHistorial" [vacia]="historial().length === 0" mensajeVacio="Sin renovaciones registradas.">
          @for (h of historial(); track h.id) {
            <tr app-fila>
              <td app-celda>{{ h.fechaOperacion | date:'dd/MM/yyyy HH:mm' }}</td>
              <td app-celda>{{ etiquetaOperacion(h.operacion) }}</td>
              <td app-celda>{{ h.fechaAnterior | date:'dd/MM/yyyy' }}</td>
              <td app-celda>{{ h.fechaNueva | date:'dd/MM/yyyy' }}</td>
              <td app-celda class="text-right text-emerald-300">{{ h.descuento > 0 ? '- Bs ' + (h.descuento | number:'1.2-2') : '—' }}</td>
              <td app-celda class="text-right">Bs {{ h.precioAplicado | number:'1.2-2' }}</td>
            </tr>
          }
        </app-tabla-datos>
      </app-panel>
    }
  `
})
export class SuscripcionesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly membresiasApi = inject(MembresiaRecepcionService);
  private readonly clientesApi = inject(ClienteRecepcionService);

  readonly tamanoPagina = TAMANO_PAGINA_MEMBRESIAS;
    readonly columnas: Columna[] = [
    { titulo: 'Cliente' }, { titulo: 'Plan' }, { titulo: 'Vencimiento' }, { titulo: 'Estado' },
    { titulo: 'Precio plan', derecha: true }, { titulo: 'Descuento', derecha: true },
    { titulo: 'Renovación', derecha: true }, { titulo: 'Saldo', derecha: true }, { titulo: '', derecha: true },
  ];
  readonly columnasHistorial: Columna[] = [
    { titulo: 'Fecha' }, { titulo: 'Operación' }, { titulo: 'Vencía' }, { titulo: 'Nuevo vencimiento' },
    { titulo: 'Descuento', derecha: true }, { titulo: 'Precio aplicado', derecha: true },
  ];
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