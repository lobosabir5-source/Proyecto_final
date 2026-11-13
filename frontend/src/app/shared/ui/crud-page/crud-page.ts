import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CrudService } from '../../../services/crud.service';
import { Paginador } from '../paginador/paginador';

export interface CampoCfg {
  key: string; label: string;
  tipo: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'select' | 'textarea';
  requerido?: boolean; max?: number; min?: number; minLen?: number;
  /** el campo solo existe al crear (ej. usuario/contraseña): se oculta y no se valida al editar */
  soloCrear?: boolean;
  opciones?: { valor: string; etiqueta: string }[];
  /** opciones cargadas desde otro endpoint (ej. instructores) */
  opcionesRemotas?: { ruta: string; valor: (x: any) => string; etiqueta: (x: any) => string };
}
export interface ColCfg { key: string; label: string; fmt?: (v: any, fila: any) => string; badge?: boolean;
  /** key de un campo con opcionesRemotas: muestra su etiqueta en vez del id */
  refCampo?: string; }
export interface AccionCfg {
  etiqueta: string; clase?: string;
  visible?: (f: any) => boolean;
  ruta: (f: any) => string; metodo?: 'patch' | 'post';
  cuerpo?: (f: any) => unknown; confirmar?: string; exito: string;
}
export interface CrudCfg {
  titulo: string; subtitulo: string; singular: string; ruta: string;
  paramBusqueda?: string;
  filtros?: { param: string; label: string; opciones: { valor: string; etiqueta: string }[] }[];
  campos: CampoCfg[]; columnas: ColCfg[];
  puedeCrear?: boolean; puedeEditar?: boolean; puedeEliminar?: boolean;
  acciones?: AccionCfg[];
  aCuerpo?: (v: any) => unknown;
  deFila?: (f: any) => Record<string, unknown>;
}

@Component({
  selector: 'app-crud-page',
  standalone: true,
  imports: [ReactiveFormsModule, Paginador],
  template: `
<section class="space-y-6">
  <header class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ cfg().titulo }}</h1>
      <p class="mt-1 text-sm text-slate-500">{{ cfg().subtitulo }}</p>
    </div>
    @if (cfg().puedeCrear !== false) {
      <button type="button" (click)="nuevo()" class="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-slate-950 hover:bg-yellow-300">
        + Nuevo {{ cfg().singular }}
      </button>
    }
  </header>

  @if (mensaje()) { <div role="status" class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{{ mensaje() }}</div> }
  @if (error()) { <div role="alert" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ error() }}</div> }

  <div class="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="min-w-50 flex-1">
      <label class="mb-1 block text-xs font-medium text-slate-600">Buscar</label>
      <input type="search" [value]="texto()" (input)="onTexto($any($event.target).value)" placeholder="Buscar registros..."
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-yellow-500" />
    </div>
    @for (f of cfg().filtros ?? []; track f.param) {
      <div>
        <label class="mb-1 block text-xs font-medium text-slate-600">{{ f.label }}</label>
        <select (change)="onFiltro(f.param, $any($event.target).value)" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Todos</option>
          @for (o of f.opciones; track o.valor) { <option [value]="o.valor">{{ o.etiqueta }}</option> }
        </select>
      </div>
    }
  </div>

  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-200 p-5 text-sm text-slate-500">Total de registros: {{ total() }}</div>
    @if (cargando()) {
      <p class="p-6 text-sm text-slate-500">Cargando...</p>
    } @else {
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              @for (c of cfg().columnas; track c.key) { <th scope="col" class="px-4 py-3">{{ c.label }}</th> }
              <th scope="col" class="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (fila of visibles(); track $index) {
              <tr>
                @for (c of cfg().columnas; track c.key) {
                  <td class="px-4 py-3">{{ valor(c, fila) }}</td>
                }
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-2">
                    @if (cfg().puedeEditar !== false) {
                      <button type="button" (click)="editar(fila)" class="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Editar</button>
                    }
                    @for (a of cfg().acciones ?? []; track a.etiqueta) {
                      @if (!a.visible || a.visible(fila)) {
                        <button type="button" (click)="pedirAccion(a, fila)" [class]="a.clase ?? 'rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700'">{{ a.etiqueta }}</button>
                      }
                    }
                    @if (cfg().puedeEliminar) {
                      <button type="button" (click)="pedirEliminar(fila)" class="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">Eliminar</button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td [attr.colspan]="cfg().columnas.length + 1" class="py-8 text-center text-slate-500">No existen registros.</td></tr>
            }
          </tbody>
        </table>
      </div>
      <app-paginador [pagina]="pagina()" [totalPaginas]="totalPaginas()" [totalElementos]="total()" [tamano]="10" (cambiar)="ir($event)" />
    }
  </div>

  @if (formVisible()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 class="mb-5 text-lg font-bold text-slate-900">{{ editandoId() === null ? 'Nuevo' : 'Editar' }} {{ cfg().singular }}</h2>
        <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-4">
          @for (c of cfg().campos; track c.key) {
            @if (!c.soloCrear || editandoId() === null) {
            <div>
              <label [for]="'f-' + c.key" class="mb-1 block text-sm font-medium text-slate-700">{{ c.label }}@if (c.requerido) {<span class="text-red-600"> *</span>}</label>
              @switch (c.tipo) {
                @case ('select') {
                  <select [id]="'f-' + c.key" [formControlName]="c.key" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">Seleccione...</option>
                    @for (o of opcionesDe(c); track o.valor) { <option [value]="o.valor">{{ o.etiqueta }}</option> }
                  </select>
                }
                @case ('textarea') {
                  <textarea [id]="'f-' + c.key" [formControlName]="c.key" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2"></textarea>
                }
                @default {
                  <input [id]="'f-' + c.key" [type]="c.tipo" [formControlName]="c.key" [attr.maxlength]="c.max ?? null"
                    [attr.min]="c.min ?? null" step="any" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
                }
              }
              @if (form.get(c.key)?.touched && form.get(c.key)?.invalid) {
                <p class="mt-1 text-xs text-red-600">Campo obligatorio o con formato no válido.</p>
              }
            </div>
            }
          }
          <div class="flex flex-wrap gap-3 pt-2">
            <button type="submit" [disabled]="guardando()" class="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-slate-950 disabled:opacity-50">{{ guardando() ? 'Guardando...' : 'Guardar' }}</button>
            <button type="button" (click)="cerrar()" [disabled]="guardando()" class="rounded-lg border border-slate-300 px-5 py-2 text-slate-700">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  }

  @if (confirmacion(); as c) {
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="alertdialog" aria-modal="true">
      <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <p class="mb-5 text-slate-800">{{ c.texto }}</p>
        <div class="flex justify-end gap-3">
          <button type="button" (click)="confirmacion.set(null)" class="rounded-lg border border-slate-300 px-4 py-2">Cancelar</button>
          <button type="button" (click)="c.ok()" class="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">Confirmar</button>
        </div>
      </div>
    </div>
  }
</section>`,
})
export class CrudPage implements OnInit {
  readonly cfg = input.required<CrudCfg>();
  private readonly api = inject(CrudService);

  readonly filas = signal<any[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalServidor = signal(0);
  readonly texto = signal('');
  readonly filtros = signal<Record<string, string>>({});
  readonly formVisible = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly confirmacion = signal<{ texto: string; ok: () => void } | null>(null);
  readonly remotas = signal<Record<string, { valor: string; etiqueta: string }[]>>({});
  private paginadoServidor = true;
  form = new FormGroup<Record<string, FormControl>>({});

  /** búsqueda local cuando el backend no ofrece parámetro de texto, o la respuesta no es paginada */
  private readonly filtradas = computed(() => {
    const t = this.texto().trim().toLowerCase();
    const cols = this.cfg().columnas;
    if (!t || (this.paginadoServidor && this.cfg().paramBusqueda)) return this.filas();
    return this.filas().filter(f => cols.some(c => this.valor(c, f).toLowerCase().includes(t)));
  });
  readonly visibles = computed(() => {
    if (this.paginadoServidor) return this.filtradas();
    const i = this.pagina() * 10;
    return this.filtradas().slice(i, i + 10);
  });
  readonly total = computed(() => this.paginadoServidor ? this.totalServidor() : this.filtradas().length);

  ngOnInit(): void {
    this.construirForm();
    for (const c of this.cfg().campos) {
      const r = c.opcionesRemotas;
      if (r) this.api.listar(r.ruta, { size: 100 }).subscribe({
        next: d => this.remotas.update(m => ({ ...m, [c.key]: (Array.isArray(d) ? d : d.content ?? []).map((x: any) => ({ valor: r.valor(x), etiqueta: r.etiqueta(x) })) })),
      });
    }
    this.cargar();
  }

  opcionesDe(c: CampoCfg) { return c.opciones ?? this.remotas()[c.key] ?? []; }

  valor(c: ColCfg, f: any): string {
    const v = f[c.key];
    if (c.refCampo) {
      if (v === null || v === undefined) return '—';
      return this.remotas()[c.refCampo]?.find(o => o.valor === String(v))?.etiqueta ?? String(v);
    }
    if (c.fmt) return c.fmt(v, f);
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'boolean') return v ? 'Sí' : 'No';
    return String(v);
  }

  private construirForm(creando = true): void {
    const g: Record<string, FormControl> = {};
    for (const c of this.cfg().campos) {
      const aplica = creando || !c.soloCrear;
      const v = c.requerido && aplica ? [Validators.required] : [];
      if (c.minLen && aplica) v.push(Validators.minLength(c.minLen));
      if (c.tipo === 'email') v.push(Validators.email);
      if (c.tipo === 'number' && c.min !== undefined) v.push(Validators.min(c.min));
      g[c.key] = new FormControl('', v);
    }
    this.form = new FormGroup(g);
  }

  cargar(pagina = 0): void {
    this.cargando.set(true);
    this.error.set('');
    const c = this.cfg();
    const params: Record<string, any> = { page: pagina, pagina, size: 10, ...this.filtros() };
    if (c.paramBusqueda && this.texto().trim()) params[c.paramBusqueda] = this.texto().trim();
    this.api.listar(c.ruta, params).subscribe({
      next: d => {
        if (Array.isArray(d)) { this.paginadoServidor = false; this.filas.set(d); this.pagina.set(pagina); this.totalPaginas.set(Math.max(1, Math.ceil(this.filtradas().length / 10))); }
        else {
          this.paginadoServidor = true;
          this.filas.set(d.content ?? []);
          this.pagina.set(d.number ?? pagina);
          this.totalPaginas.set(d.totalPages ?? 1);
          this.totalServidor.set(d.totalElements ?? (d.content?.length ?? 0));
        }
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => { this.error.set(this.msg(e)); this.cargando.set(false); },
    });
  }

  private timer: any;
  onTexto(v: string): void {
    this.texto.set(v);
    if (this.cfg().paramBusqueda) { clearTimeout(this.timer); this.timer = setTimeout(() => this.cargar(0), 350); }
    else this.pagina.set(0);
  }
  onFiltro(param: string, v: string): void { this.filtros.update(f => ({ ...f, [param]: v })); this.cargar(0); }
  ir(p: number): void { this.paginadoServidor ? this.cargar(p) : this.pagina.set(p); }

  nuevo(): void { this.construirForm(); this.editandoId.set(null); this.limpiar(); this.formVisible.set(true); }
  editar(f: any): void {
    this.construirForm(false);
    const base = this.cfg().deFila ? this.cfg().deFila!(f) : f;
    const v: Record<string, unknown> = {};
    for (const c of this.cfg().campos) v[c.key] = base[c.key] ?? '';
    this.form.patchValue(v);
    this.editandoId.set(f.id ?? null);
    this.limpiar();
    this.formVisible.set(true);
  }
  cerrar(): void { this.formVisible.set(false); this.editandoId.set(null); }
  private limpiar(): void { this.error.set(''); this.mensaje.set(''); }

  guardar(): void {
    if (this.form.invalid || this.guardando()) { this.form.markAllAsTouched(); return; }
    const crudo: Record<string, any> = {};
    for (const c of this.cfg().campos) {
      const v = this.form.get(c.key)!.value;
      crudo[c.key] = v === '' ? null : c.tipo === 'number' ? Number(v) : (typeof v === 'string' ? v.trim() : v);
    }
    const cuerpo = this.cfg().aCuerpo ? this.cfg().aCuerpo!(crudo) : crudo;
    const id = this.editandoId();
    this.guardando.set(true);
    const op = id === null ? this.api.crear(this.cfg().ruta, cuerpo) : this.api.actualizar(this.cfg().ruta, id, cuerpo);
    op.subscribe({
      next: () => { this.guardando.set(false); this.cerrar(); this.mensaje.set(id === null ? 'Registro creado correctamente.' : 'Registro actualizado correctamente.'); this.cargar(id === null ? 0 : this.pagina()); },
      error: (e: HttpErrorResponse) => { this.guardando.set(false); this.error.set(this.msg(e)); },
    });
  }

  pedirEliminar(f: any): void {
    this.confirmacion.set({ texto: `¿Deseas eliminar este ${this.cfg().singular}?`, ok: () => {
      this.confirmacion.set(null); this.limpiar();
      this.api.eliminar(this.cfg().ruta, f.id).subscribe({
        next: () => { this.mensaje.set('Registro eliminado correctamente.'); this.cargar(this.visibles().length === 1 && this.pagina() > 0 ? this.pagina() - 1 : this.pagina()); },
        error: (e: HttpErrorResponse) => this.error.set(this.msg(e)),
      });
    } });
  }

  pedirAccion(a: AccionCfg, f: any): void {
    const run = () => {
      this.confirmacion.set(null); this.limpiar();
      const ruta = a.ruta(f), cuerpo = a.cuerpo?.(f);
      (a.metodo === 'post' ? this.api.post(ruta, cuerpo) : this.api.patch(ruta, cuerpo)).subscribe({
        next: () => { this.mensaje.set(a.exito); this.cargar(this.pagina()); },
        error: (e: HttpErrorResponse) => this.error.set(this.msg(e)),
      });
    };
    a.confirmar ? this.confirmacion.set({ texto: a.confirmar, ok: run }) : run();
  }

  private msg(e: HttpErrorResponse): string {
    if (e.status === 0) return 'No se pudo conectar con el servidor.';
    if (e.status === 403) return 'No tienes permisos para realizar esta operación.';
    if (typeof e.error === 'string' && e.error.trim()) return e.error;
    if (typeof e.error?.message === 'string') {
      const det = Object.values(e.error?.fields ?? {}).join(' · ');
      return det ? `${e.error.message}: ${det}` : e.error.message;
    }
    return 'Ocurrió un error al procesar la solicitud.';
  }
}