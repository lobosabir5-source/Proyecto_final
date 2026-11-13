import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ClienteRecepcionService } from '../../../services/cliente-recepcion.service';
import { MembresiaRecepcionService } from '../../../services/membresia-recepcion.service';
import { ClienteRecepcion, Membresia } from '../../../models/recepcion.models';
import { resolverImagen } from '../../../utils/imagen';
import { leerErrorApi } from '../../../utils/api-error';
import { PageHeader } from '../components/page-header';
import { EstadoVacio } from '../components/estado-vacio';

const POR_PAGINA = 10;

@Component({
  selector: 'app-carnet-recepcion',
  standalone: true,
  imports: [DatePipe, FormsModule, PageHeader, EstadoVacio],
  host: { class: 'block' },
  template: `
<app-page-header eyebrow="Recepción" titulo="Carnet digital" subtitulo="Busca un cliente por nombre o documento" />

<div class="mb-6 flex flex-wrap items-center gap-3">
  <input type="search" [ngModel]="texto()" (ngModelChange)="buscar($event)" maxlength="80"
    placeholder="Nombre, documento o correo"
    class="w-full max-w-md border border-white/10 bg-[#111] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-yellow-400 focus:outline-none" />
  @if (seleccionado()) {
    <button type="button" (click)="cerrar()" class="border border-white/20 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5">Volver a la lista</button>
  }
</div>

@if (error()) { <p role="alert" class="mb-4 text-red-400">{{ error() }}</p> }

@if (cargando()) {
  <p class="text-neutral-400">Cargando...</p>
} @else if (seleccionado(); as c) {
  @if (cargandoCarnet()) {
    <p class="text-neutral-400">Cargando carnet...</p>
  } @else {
    <article class="mx-auto max-w-md rounded-2xl border border-yellow-400/40 bg-neutral-900 p-6 text-white shadow-xl">
      <p class="mb-4 text-[10px] uppercase tracking-[0.4em] text-yellow-400">Gold's Gym · Carnet</p>
      <div class="flex items-center gap-4">
        @if (foto(c); as f) { <img [src]="f" alt="Fotografía del cliente" class="h-20 w-20 rounded-full object-cover" /> }
        @else { <div class="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-2xl font-black text-black">{{ c.nombre.charAt(0) }}</div> }
        <div>
          <h2 class="text-xl font-bold">{{ c.nombre }}</h2>
          <p class="text-sm text-neutral-400">Documento: {{ c.numeroDocumento || '—' }}</p>
          <p class="text-sm text-neutral-400">{{ c.activo ? 'Cuenta activa' : 'Cuenta inactiva' }}</p>
        </div>
      </div>
      @if (membresia(); as m) {
        <dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div><dt class="text-neutral-400">Plan</dt><dd class="font-semibold">{{ m.plan }}</dd></div>
          <div><dt class="text-neutral-400">Estado</dt><dd class="font-semibold">{{ m.estado.replace('_', ' ') }}</dd></div>
          <div><dt class="text-neutral-400">Inicio</dt><dd>{{ m.fechaInicio | date:'dd/MM/yyyy' }}</dd></div>
          <div><dt class="text-neutral-400">Vence</dt><dd>{{ m.fechaFin | date:'dd/MM/yyyy' }}</dd></div>
          <div><dt class="text-neutral-400">Saldo pendiente</dt><dd>Bs {{ m.saldo }}</dd></div>
        </dl>
      } @else {
        <p class="mt-5 text-sm text-neutral-400">Este cliente no tiene membresías registradas.</p>
      }
    </article>
    <div class="mt-4 text-center print:hidden">
      <button type="button" (click)="imprimir()" class="bg-yellow-400 px-5 py-2 text-sm font-bold text-black hover:bg-yellow-300">Imprimir carnet</button>
    </div>
  }
} @else if (!filtrados().length) {
  <app-estado-vacio>{{ texto().trim() ? 'No se encontraron clientes.' : 'Aún no hay clientes registrados.' }}</app-estado-vacio>
} @else {
  <div class="overflow-x-auto border border-white/10">
    <table class="w-full min-w-[560px] text-left text-sm">
      <thead class="bg-[#111] text-[11px] uppercase tracking-widest text-yellow-400">
        <tr><th class="px-4 py-3">Nombre</th><th class="px-4 py-3">Documento</th><th class="px-4 py-3">Correo</th><th class="px-4 py-3"></th></tr>
      </thead>
      <tbody>
        @for (c of pagina(); track c.id) {
          <tr class="border-t border-white/5 hover:bg-white/5">
            <td class="px-4 py-3">{{ c.nombre }}</td>
            <td class="px-4 py-3">{{ c.numeroDocumento || '—' }}</td>
            <td class="px-4 py-3">{{ c.correo }}</td>
            <td class="px-4 py-3 text-right"><button type="button" (click)="abrir(c)" class="rounded-md bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black">Ver carnet</button></td>
          </tr>
        }
      </tbody>
    </table>
  </div>
  <div class="mt-4 flex items-center justify-between text-sm text-neutral-400">
    <span>{{ filtrados().length }} cliente(s)</span>
    <div class="flex items-center gap-3">
      <button type="button" [disabled]="numPagina() === 0" (click)="numPagina.set(numPagina() - 1)" class="border border-white/20 px-3 py-1 disabled:opacity-40">Anterior</button>
      <span>Página {{ numPagina() + 1 }} de {{ totalPaginas() }}</span>
      <button type="button" [disabled]="numPagina() >= totalPaginas() - 1" (click)="numPagina.set(numPagina() + 1)" class="border border-white/20 px-3 py-1 disabled:opacity-40">Siguiente</button>
    </div>
  </div>
}`,
})
export class CarnetRecepcionComponent {
  private readonly clientesApi = inject(ClienteRecepcionService);
  private readonly membresiasApi = inject(MembresiaRecepcionService);

  readonly clientes = signal<ClienteRecepcion[]>([]);
  readonly texto = signal('');
  readonly numPagina = signal(0);
  readonly cargando = signal(true);
  readonly cargandoCarnet = signal(false);
  readonly error = signal('');
  readonly seleccionado = signal<ClienteRecepcion | null>(null);
  readonly membresia = signal<Membresia | null>(null);

  readonly filtrados = computed(() => {
    const t = this.texto().trim().toLowerCase();
    if (!t) return this.clientes();
    return this.clientes().filter(c =>
      [c.nombre, c.numeroDocumento, c.correo].some(v => (v ?? '').toLowerCase().includes(t)));
  });
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / POR_PAGINA)));
  readonly pagina = computed(() => {
    const desde = Math.min(this.numPagina(), this.totalPaginas() - 1) * POR_PAGINA;
    return this.filtrados().slice(desde, desde + POR_PAGINA);
  });

  constructor() {
    this.clientesApi.listarParaBusqueda().subscribe({
      next: lista => { this.clientes.set(lista as unknown as ClienteRecepcion[]); this.cargando.set(false); },
      error: (e: HttpErrorResponse) => { this.error.set(leerErrorApi(e).mensaje); this.cargando.set(false); },
    });
  }

  buscar(valor: string): void { this.texto.set(valor); this.numPagina.set(0); }

  abrir(c: ClienteRecepcion): void {
    this.seleccionado.set(c);
    this.membresia.set(null);
    this.error.set('');
    this.cargandoCarnet.set(true);
    this.membresiasApi.listarTodas().subscribe({
      next: membresias => {
        const propias = membresias.filter(m => m.clienteId === c.id)
          .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));
        this.membresia.set(propias[0] ?? null);
        this.cargandoCarnet.set(false);
      },
      error: (e: HttpErrorResponse) => { this.error.set(leerErrorApi(e).mensaje); this.cargandoCarnet.set(false); },
    });
  }

  cerrar(): void { this.seleccionado.set(null); this.membresia.set(null); }
  foto(c: ClienteRecepcion): string | null { return resolverImagen(c.fotoUrl); }
  imprimir(): void { window.print(); }
}