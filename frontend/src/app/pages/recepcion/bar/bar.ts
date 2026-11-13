import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductoBarService } from '../../../services/producto-bar.service';
import { MetodoPagoBarService } from '../../../services/metodo-pago-bar.service';
import { PedidoBarService } from '../../../services/pedido-bar.service';
import { ClienteRecepcionService } from '../../../services/cliente-recepcion.service';
import { ProductoBar } from '../../../models/producto-bar.models';
import { MetodoPagoBar } from '../../../models/metodo-pago-bar.models';
import { PedidoBar } from '../../../models/pedido-bar.models';
import { ClienteRecepcion } from '../../../models/recepcion.models';
import { leerErrorApi } from '../../../utils/api-error';
import { PageHeader } from '../components/page-header';
import { EstadoVacio } from '../components/estado-vacio';

interface LineaCarrito { producto: ProductoBar; cantidad: number; }

@Component({
  selector: 'app-bar-recepcion',
  standalone: true,
  imports: [FormsModule, PageHeader, EstadoVacio],
  host: { class: 'block' },
  template: `
<app-page-header eyebrow="Recepción" titulo="Ventas del bar" subtitulo="Selecciona productos, cliente y método de pago" />

@if (error()) { <p role="alert" class="mb-4 text-red-400">{{ error() }}</p> }
@if (exito()) { <p role="status" class="mb-4 text-green-400">{{ exito() }}</p> }

<div class="grid gap-6 lg:grid-cols-3">
  <section class="lg:col-span-2">
    <input type="search" [ngModel]="texto()" (ngModelChange)="buscar($event)" maxlength="60" placeholder="Buscar producto"
      class="mb-4 w-full max-w-md border border-white/10 bg-[#111] px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-yellow-400 focus:outline-none" />
    @if (cargando()) { <p class="text-neutral-400">Cargando productos...</p> }
    @else if (!productos().length) { <app-estado-vacio>No hay productos disponibles.</app-estado-vacio> }
    @else {
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        @for (p of productos(); track p.id) {
          <article class="border border-white/10 bg-[#111] p-4">
            <h3 class="font-bold">{{ p.nombre }}</h3>
            <p class="text-xs text-neutral-400">{{ p.categoriaNombre }}</p>
            <p class="mt-2 text-yellow-400">Bs {{ p.precio }}</p>
            <p class="text-xs" [class.text-red-400]="p.stock <= 0">Existencias: {{ p.stock }}</p>
            <button type="button" [disabled]="p.stock <= 0" (click)="agregar(p)"
              class="mt-3 w-full bg-yellow-400 py-1.5 text-xs font-bold text-black disabled:opacity-40">Agregar</button>
          </article>
        }
      </div>
      <div class="mt-4 flex items-center justify-between text-sm text-neutral-400">
        <button type="button" [disabled]="pag() === 0" (click)="irA(pag() - 1)" class="border border-white/20 px-3 py-1 disabled:opacity-40">Anterior</button>
        <span>Página {{ pag() + 1 }} de {{ totalPag() }}</span>
        <button type="button" [disabled]="pag() >= totalPag() - 1" (click)="irA(pag() + 1)" class="border border-white/20 px-3 py-1 disabled:opacity-40">Siguiente</button>
      </div>
    }
  </section>

  <aside class="border border-yellow-500/30 bg-[#0d0d0d] p-4">
    <h2 class="mb-3 text-[11px] uppercase tracking-[0.3em] text-yellow-400">Venta actual</h2>

    <label class="mb-1 block text-xs text-neutral-400" for="cli">Cliente</label>
    <select id="cli" [(ngModel)]="clienteUsuarioId" class="mb-3 w-full border border-white/10 bg-[#111] px-3 py-2 text-sm">
      <option [ngValue]="null">Selecciona un cliente</option>
      @for (c of clientes(); track c.id) { <option [ngValue]="c.usuarioId">{{ c.nombre }}</option> }
    </select>

    <label class="mb-1 block text-xs text-neutral-400" for="mp">Método de pago</label>
    <select id="mp" [(ngModel)]="metodoId" class="mb-4 w-full border border-white/10 bg-[#111] px-3 py-2 text-sm">
      <option [ngValue]="null">Selecciona un método</option>
      @for (m of metodos(); track m.id) { <option [ngValue]="m.id">{{ m.nombre }}</option> }
    </select>

    @if (!carrito().length) { <p class="text-sm text-neutral-500">Aún no agregaste productos.</p> }
    @for (l of carrito(); track l.producto.id) {
      <div class="mb-2 flex items-center justify-between gap-2 text-sm">
        <span class="flex-1">{{ l.producto.nombre }}</span>
        <button type="button" (click)="cambiar(l, -1)" class="h-6 w-6 border border-white/20" aria-label="Quitar uno">−</button>
        <span>{{ l.cantidad }}</span>
        <button type="button" (click)="cambiar(l, 1)" [disabled]="l.cantidad >= l.producto.stock" class="h-6 w-6 border border-white/20 disabled:opacity-40" aria-label="Agregar uno">+</button>
        <span class="w-16 text-right">Bs {{ l.producto.precio * l.cantidad }}</span>
      </div>
    }

    <p class="mt-4 border-t border-white/10 pt-3 text-lg font-black">Total: <span class="text-yellow-400">Bs {{ total() }}</span></p>
    <button type="button" [disabled]="!puedeConfirmar() || enviando()" (click)="confirmar()"
      class="mt-3 w-full bg-yellow-400 py-2 text-sm font-bold text-black disabled:opacity-40">
      {{ enviando() ? 'Registrando...' : 'Confirmar venta' }}
    </button>
    @if (carrito().length) { <button type="button" (click)="vaciar()" class="mt-2 w-full border border-white/20 py-2 text-xs text-neutral-300">Vaciar</button> }
  </aside>
</div>

@if (ultima(); as u) {
  <section class="mt-8 border border-green-500/30 bg-[#0d0d0d] p-4">
    <h3 class="mb-2 font-bold">Venta #{{ u.id }} registrada</h3>
    @for (i of u.items; track i.productoId) { <p class="text-sm">{{ i.cantidad }} × {{ i.nombre }} — Bs {{ i.subtotal }}</p> }
    <p class="mt-2 font-black">Total: Bs {{ u.total }}</p>
  </section>
}`,
})
export class BarRecepcionComponent {
  private readonly productosApi = inject(ProductoBarService);
  private readonly metodosApi = inject(MetodoPagoBarService);
  private readonly pedidosApi = inject(PedidoBarService);
  private readonly clientesApi = inject(ClienteRecepcionService);

  readonly productos = signal<ProductoBar[]>([]);
  readonly metodos = signal<MetodoPagoBar[]>([]);
  readonly clientes = signal<ClienteRecepcion[]>([]);
  readonly carrito = signal<LineaCarrito[]>([]);
  readonly texto = signal('');
  readonly pag = signal(0);
  readonly totalPag = signal(1);
  readonly cargando = signal(true);
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  readonly ultima = signal<PedidoBar | null>(null);
  clienteUsuarioId: number | null = null;
  metodoId: number | null = null;

  readonly total = computed(() => this.carrito().reduce((s, l) => s + l.producto.precio * l.cantidad, 0));
  readonly puedeConfirmar = computed(() => this.carrito().length > 0);

  constructor() {
    this.cargarProductos();
    this.metodosApi.listar(0).subscribe({ next: r => this.metodos.set(r.content), error: e => this.fallo(e) });
    this.clientesApi.listarParaBusqueda().subscribe({
      next: l => this.clientes.set(l as unknown as ClienteRecepcion[]), error: e => this.fallo(e),
    });
  }

  private fallo(e: HttpErrorResponse) { this.error.set(leerErrorApi(e).mensaje); this.cargando.set(false); this.enviando.set(false); }

  cargarProductos(): void {
    this.cargando.set(true);
    this.productosApi.listar(this.pag(), { nombre: this.texto(), estado: 1 }).subscribe({
      next: r => { this.productos.set(r.content); this.totalPag.set(Math.max(1, r.totalPages)); this.cargando.set(false); },
      error: e => this.fallo(e),
    });
  }
  buscar(v: string) { this.texto.set(v); this.pag.set(0); this.cargarProductos(); }
  irA(n: number) { this.pag.set(n); this.cargarProductos(); }

  agregar(p: ProductoBar) {
    this.carrito.update(c => {
      const ex = c.find(l => l.producto.id === p.id);
      if (!ex) return [...c, { producto: p, cantidad: 1 }];
      return c.map(l => l.producto.id === p.id ? { ...l, cantidad: Math.min(l.cantidad + 1, p.stock) } : l);
    });
  }
  cambiar(l: LineaCarrito, d: number) {
    this.carrito.update(c => c
      .map(x => x.producto.id === l.producto.id ? { ...x, cantidad: Math.min(x.cantidad + d, x.producto.stock) } : x)
      .filter(x => x.cantidad > 0));
  }
  vaciar() { this.carrito.set([]); }

  confirmar() {
    this.error.set(''); this.exito.set('');
    if (this.clienteUsuarioId == null) { this.error.set('Selecciona un cliente.'); return; }
    if (this.metodoId == null) { this.error.set('Selecciona un método de pago.'); return; }
    if (!confirm(`¿Confirmar la venta por Bs ${this.total()}?`)) return;
    this.enviando.set(true);
    this.pedidosApi.crear({
      usuarioId: this.clienteUsuarioId, metodoPagoId: this.metodoId,
      items: this.carrito().map(l => ({ productoId: l.producto.id, cantidad: l.cantidad })),
    }).subscribe({
      next: p => {
        this.ultima.set(p); this.exito.set('Venta registrada correctamente.');
        this.carrito.set([]); this.enviando.set(false); this.cargarProductos();
      },
      error: e => this.fallo(e),
    });
  }
}