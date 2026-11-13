import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { API_URL } from '../../../config/api.config';
import { ClienteRecepcionService } from '../../../services/cliente-recepcion.service';
import { ClienteRecepcion } from '../../../models/recepcion.models';
import { leerErrorApi } from '../../../utils/api-error';
import { PageHeader } from '../components/page-header';
import { EstadoVacio } from '../components/estado-vacio';

interface Clase {
  id: number; nombre: string; instructor: string; fecha: string; horaInicio: string; horaFin: string;
  cupoMaximo: number; inscritos: number; cuposDisponibles: number; estado: string;
}
interface Inscripcion { id: number; claseId: number; clienteId: number; cliente: string; asistio: boolean | null; estado: string; }
interface Pagina<T> { content: T[]; totalPages: number; }

@Component({
  selector: 'app-aerobicos-recepcion',
  standalone: true,
  imports: [FormsModule, PageHeader, EstadoVacio],
  host: { class: 'block' },
  template: `
<app-page-header eyebrow="Recepción" titulo="Aeróbicos" subtitulo="Clases, cupos, inscripciones y asistencia" />
<div class="mb-6 flex flex-wrap items-center gap-3">
  <label for="f" class="text-sm text-neutral-400">Fecha</label>
  <input id="f" type="date" [ngModel]="fecha()" (ngModelChange)="cambiarFecha($event)"
    class="border border-white/10 bg-[#111] px-3 py-2 text-sm" />
  @if (fecha()) { <button type="button" (click)="cambiarFecha('')" class="border border-white/20 px-3 py-2 text-xs">Ver todas</button> }
</div>

@if (error()) { <p role="alert" class="mb-4 text-red-400">{{ error() }}</p> }
@if (exito()) { <p role="status" class="mb-4 text-green-400">{{ exito() }}</p> }

@if (cargando()) { <p class="text-neutral-400">Cargando...</p> }
@else if (!clases().length) { <app-estado-vacio>No hay clases para mostrar.</app-estado-vacio> }
@else {
  <div class="overflow-x-auto border border-white/10">
    <table class="w-full min-w-[680px] text-left text-sm">
      <thead class="bg-[#111] text-[11px] uppercase tracking-widest text-yellow-400">
        <tr><th class="px-4 py-3">Clase</th><th class="px-4 py-3">Instructor</th><th class="px-4 py-3">Fecha</th><th class="px-4 py-3">Horario</th><th class="px-4 py-3">Cupos</th><th class="px-4 py-3">Estado</th><th></th></tr>
      </thead>
      <tbody>
        @for (c of clases(); track c.id) {
          <tr class="border-t border-white/5">
            <td class="px-4 py-3">{{ c.nombre }}</td><td class="px-4 py-3">{{ c.instructor }}</td>
            <td class="px-4 py-3">{{ c.fecha }}</td>
            <td class="px-4 py-3">{{ c.horaInicio.slice(0,5) }} - {{ c.horaFin.slice(0,5) }}</td>
            <td class="px-4 py-3">{{ c.inscritos }}/{{ c.cupoMaximo }}</td>
            <td class="px-4 py-3">{{ c.estado }}</td>
            <td class="px-4 py-3 text-right"><button type="button" (click)="abrir(c)" class="rounded-md bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black">Gestionar</button></td>
          </tr>
        }
      </tbody>
    </table>
  </div>
  <div class="mt-4 flex items-center justify-between text-sm text-neutral-400">
    <button type="button" [disabled]="pag() === 0" (click)="irA(pag() - 1)" class="border border-white/20 px-3 py-1 disabled:opacity-40">Anterior</button>
    <span>Página {{ pag() + 1 }} de {{ totalPag() }}</span>
    <button type="button" [disabled]="pag() >= totalPag() - 1" (click)="irA(pag() + 1)" class="border border-white/20 px-3 py-1 disabled:opacity-40">Siguiente</button>
  </div>
}

@if (sel(); as c) {
  <section class="mt-8 border border-yellow-500/30 bg-[#0d0d0d] p-4">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="font-bold">{{ c.nombre }} · {{ c.fecha }} · {{ c.cuposDisponibles }} cupo(s) libre(s)</h2>
      <button type="button" (click)="sel.set(null)" class="text-xs text-neutral-400">Cerrar</button>
    </div>
    @if (c.estado === 'PROGRAMADA') {
      <div class="mb-4 flex flex-wrap gap-2">
        <select [(ngModel)]="clienteId" class="min-w-60 border border-white/10 bg-[#111] px-3 py-2 text-sm">
          <option [ngValue]="null">Selecciona un cliente</option>
          @for (cl of clientes(); track cl.id) { <option [ngValue]="cl.id">{{ cl.nombre }}</option> }
        </select>
        <button type="button" [disabled]="clienteId == null || c.cuposDisponibles <= 0" (click)="inscribir(c)"
          class="bg-yellow-400 px-4 py-2 text-xs font-bold text-black disabled:opacity-40">Inscribir</button>
      </div>
    }
    @if (!inscripciones().length) { <p class="text-sm text-neutral-500">Sin inscripciones.</p> }
    @for (i of inscripciones(); track i.id) {
      <div class="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 py-2 text-sm">
        <span>{{ i.cliente }} · {{ i.estado }} · {{ i.asistio === true ? 'Asistió' : i.asistio === false ? 'No asistió' : 'Sin registrar' }}</span>
        @if (i.estado !== 'CANCELADA') {
          <span class="flex gap-2">
            <button type="button" (click)="asistencia(i, true)" class="rounded-md bg-green-500/20 px-3 py-1 text-xs text-green-300">Asistió</button>
            <button type="button" (click)="asistencia(i, false)" class="rounded-md bg-white/10 px-3 py-1 text-xs">No asistió</button>
            <button type="button" (click)="cancelar(i, c)" class="rounded-md bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Cancelar</button>
          </span>
        }
      </div>
    }
  </section>
}`,
})
export class AerobicosRecepcionComponent {
  private readonly http = inject(HttpClient);
  private readonly clientesApi = inject(ClienteRecepcionService);
  private readonly url = `${API_URL}/admin/aerobicos`;

  readonly clases = signal<Clase[]>([]);
  readonly clientes = signal<ClienteRecepcion[]>([]);
  readonly inscripciones = signal<Inscripcion[]>([]);
  readonly sel = signal<Clase | null>(null);
  readonly fecha = signal('');
  readonly pag = signal(0);
  readonly totalPag = signal(1);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly exito = signal('');
  clienteId: number | null = null;

  constructor() {
    this.cargar();
    this.clientesApi.listarParaBusqueda().subscribe({
      next: l => this.clientes.set(l as unknown as ClienteRecepcion[]), error: e => this.fallo(e),
    });
  }

  private fallo(e: HttpErrorResponse) { this.error.set(leerErrorApi(e).mensaje); this.cargando.set(false); }

  cargar() {
    this.cargando.set(true);
    let params = new HttpParams().set('pagina', this.pag());
    if (this.fecha()) params = params.set('fecha', this.fecha());
    this.http.get<Pagina<Clase>>(this.url, { params }).subscribe({
      next: r => { this.clases.set(r.content); this.totalPag.set(Math.max(1, r.totalPages)); this.cargando.set(false); },
      error: e => this.fallo(e),
    });
  }
  cambiarFecha(v: string) { this.fecha.set(v); this.pag.set(0); this.cargar(); }
  irA(n: number) { this.pag.set(n); this.cargar(); }

  abrir(c: Clase) { this.sel.set(c); this.clienteId = null; this.cargarInscripciones(c.id); }
  private cargarInscripciones(id: number) {
    this.http.get<Pagina<Inscripcion>>(`${this.url}/${id}/inscripciones`, { params: { pagina: 0 } }).subscribe({
      next: r => this.inscripciones.set(r.content), error: e => this.fallo(e),
    });
  }
  private refrescar(c: Clase, msg: string) {
    this.error.set(''); this.exito.set(msg); this.cargarInscripciones(c.id); this.cargar();
    this.http.get<Clase>(`${this.url}/${c.id}`).subscribe(n => this.sel.set(n));
  }

  inscribir(c: Clase) {
    this.http.post(`${this.url}/${c.id}/inscripciones`, { clienteId: this.clienteId }).subscribe({
      next: () => { this.clienteId = null; this.refrescar(c, 'Cliente inscrito.'); }, error: e => this.fallo(e),
    });
  }
  asistencia(i: Inscripcion, asistio: boolean) {
    this.http.patch(`${this.url}/inscripciones/${i.id}/asistencia`, { asistio }).subscribe({
      next: () => this.refrescar(this.sel()!, 'Asistencia registrada.'), error: e => this.fallo(e),
    });
  }
  cancelar(i: Inscripcion, c: Clase) {
    if (!confirm('¿Cancelar esta inscripción?')) return;
    this.http.patch(`${this.url}/inscripciones/${i.id}/cancelar`, {}).subscribe({
      next: () => this.refrescar(c, 'Inscripción cancelada.'), error: e => this.fallo(e),
    });
  }
}