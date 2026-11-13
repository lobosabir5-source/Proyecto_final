import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, debounceTime, forkJoin, map, merge, switchMap, tap } from 'rxjs';

import {
  CATEGORIAS_INVENTARIO,
  CategoriaInventario,
  FiltrosInventario,
  GuardarItemInventario,
  ItemInventario,
  MovimientoInventario,
  TipoMovimiento,
  UNIDADES_INVENTARIO,
  UnidadInventario,
} from '../../../models/inventario.models';
import { InventarioService } from '../../../services/inventario.service';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { Icon } from '../../../shared/ui/icon/icon';
import { Paginador } from '../../../shared/ui/paginador/paginador';
import { StatCard } from '../../../shared/ui/stat-card/stat-card';
import { UiButton } from '../../../shared/ui/ui-button/ui-button';
import { UiTable } from '../../../shared/ui/ui-table/ui-table';
import { leerErrorApi } from '../../../utils/api-error';

/** Límite del backend: 11 dígitos enteros y 3 decimales. */
const MAX_CANTIDAD = 99_999_999_999;

function maxTresDecimales(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === undefined || valor === '') return null;
  const decimales = String(valor).split('.')[1];
  return decimales && decimales.length > 3 ? { decimales: true } : null;
}

@Component({
  selector: 'app-admin-inventario',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DecimalPipe, DatePipe, UiButton, UiTable, Icon, StatCard, Paginador, ConfirmDialog],
  templateUrl: './admin-inventario.html',
  styleUrl: './admin-inventario.css',
})
export class AdminInventario implements OnInit {
  private readonly api = inject(InventarioService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly categorias = CATEGORIAS_INVENTARIO;
  readonly unidades = UNIDADES_INVENTARIO;
  readonly tamanoPagina = 10;

  // ---------- Listado de insumos ----------
  readonly items = signal<ItemInventario[]>([]);
  readonly cargando = signal(false);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly error = signal('');
  readonly exito = signal('');

  filtros: FiltrosInventario = this.filtrosIniciales();
  private readonly escribiendo$ = new Subject<void>();
  private readonly cargar$ = new Subject<number>();
  private temporizadorExito: ReturnType<typeof setTimeout> | undefined;

  /** Totales reales del servidor (no dependen de la página ni de los filtros). */
  readonly resumen = signal<{ activos: number; bajo: number } | null>(null);
  readonly stockSuficiente = computed(() => {
    const r = this.resumen();
    return r ? Math.max(r.activos - r.bajo, 0) : '—';
  });

  get hayFiltros(): boolean {
    const f = this.filtros;
    return !!(f.nombre.trim() || f.categoria || f.bajoMinimo || f.activo !== 'true');
  }

  // ---------- Formulario de insumo ----------
  readonly modalItem = signal(false);
  readonly editando = signal<ItemInventario | null>(null);
  readonly guardando = signal(false);
  readonly errorModal = signal('');
  readonly formItem = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    categoria: ['', Validators.required],
    unidad: ['', Validators.required],
    minimo: [0, [Validators.required, Validators.min(0), Validators.max(MAX_CANTIDAD), maxTresDecimales]],
    descripcion: ['', Validators.maxLength(255)],
  });

  // ---------- Entradas y salidas ----------
  readonly movimientoActual = signal<{ item: ItemInventario; tipo: TipoMovimiento } | null>(null);
  readonly registrando = signal(false);
  readonly errorMovimiento = signal('');
  readonly formMov = this.fb.group({
    cantidad: this.fb.control<number | null>(null, [
      Validators.required, Validators.min(0.001), Validators.max(MAX_CANTIDAD), maxTresDecimales,
    ]),
    motivo: this.fb.nonNullable.control('', Validators.maxLength(255)),
  });

  // ---------- Historial de movimientos ----------
  readonly historialItem = signal<ItemInventario | null>(null);
  readonly movimientos = signal<MovimientoInventario[]>([]);
  readonly histPagina = signal(0);
  readonly histTotalPaginas = signal(0);
  readonly histTotal = signal(0);
  readonly cargandoHistorial = signal(false);
  readonly errorHistorial = signal('');
  readonly filtroTipo = signal<'' | TipoMovimiento>('');
  readonly filtroTexto = signal('');
  readonly filtroDesde = signal('');
  readonly filtroHasta = signal('');

  /** El backend solo pagina el historial: estos filtros se aplican a la página cargada. */
  readonly movimientosVisibles = computed(() => {
    const tipo = this.filtroTipo();
    const texto = this.filtroTexto().trim().toLowerCase();
    const desde = this.filtroDesde();
    const hasta = this.filtroHasta();
    return this.movimientos().filter(m => {
      if (tipo && m.tipo !== tipo) return false;
      const dia = String(m.fecha).slice(0, 10);
      if (desde && dia < desde) return false;
      if (hasta && dia > hasta) return false;
      if (texto && !`${m.motivo ?? ''} ${m.responsable ?? ''}`.toLowerCase().includes(texto)) return false;
      return true;
    });
  });
  readonly hayFiltrosMov = computed(() =>
    !!(this.filtroTipo() || this.filtroTexto().trim() || this.filtroDesde() || this.filtroHasta()));

  // ---------- Desactivar ----------
  readonly pendienteDesactivar = signal<ItemInventario | null>(null);
  readonly desactivando = signal(false);

  ngOnInit(): void {
    merge(this.escribiendo$.pipe(debounceTime(350), map(() => 0)), this.cargar$)
      .pipe(
        tap(() => { this.cargando.set(true); this.error.set(''); }),
        switchMap(pagina =>
          this.api.listar(pagina, this.filtros).pipe(
            catchError((e: HttpErrorResponse) => {
              this.error.set(leerErrorApi(e).mensaje);
              this.cargando.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(r => {
        // Si la última página quedó vacía (p. ej. tras desactivar), retrocede una.
        if (r.content.length === 0 && r.number > 0) {
          this.cargar$.next(r.number - 1);
          return;
        }
        this.items.set(r.content);
        this.pagina.set(r.number);
        this.totalPaginas.set(r.totalPages);
        this.totalElementos.set(r.totalElements);
        this.cargando.set(false);
      });

    this.cargar$.next(0);
    this.cargarResumen();
  }

  // =========================== FILTROS Y PAGINACIÓN ===========================
  alEscribir(): void { this.escribiendo$.next(); }
  aplicarFiltros(): void { this.cargar$.next(0); }
  irAPagina(pagina: number): void { this.cargar$.next(pagina); }

  limpiarFiltros(): void {
    this.filtros = this.filtrosIniciales();
    this.cargar$.next(0);
  }

  verSoloBajoMinimo(): void {
    this.filtros = { ...this.filtrosIniciales(), bajoMinimo: true };
    this.cargar$.next(0);
  }

  // =========================== INSUMOS (CREAR / EDITAR) ===========================
  abrirNuevo(): void {
    this.editando.set(null);
    this.formItem.reset({ nombre: '', categoria: '', unidad: '', minimo: 0, descripcion: '' });
    this.formItem.controls.unidad.enable();
    this.errorModal.set('');
    this.modalItem.set(true);
  }

  abrirEditar(item: ItemInventario): void {
    this.editando.set(item);
    this.formItem.reset({
      nombre: item.nombre,
      categoria: item.categoria,
      unidad: item.unidad,
      minimo: item.minimo,
      descripcion: item.descripcion ?? '',
    });
    // El backend rechaza cambiar la unidad cuando hay existencias.
    if (item.existencia !== 0) this.formItem.controls.unidad.disable();
    else this.formItem.controls.unidad.enable();
    this.errorModal.set('');
    this.modalItem.set(true);
  }

  cerrarModalItem(): void {
    if (this.guardando()) return;
    this.modalItem.set(false);
  }

  guardarItem(): void {
    this.formItem.markAllAsTouched();
    if (this.formItem.invalid) return;

    const v = this.formItem.getRawValue();
    const cuerpo: GuardarItemInventario = {
      nombre: v.nombre.trim(),
      categoria: v.categoria as CategoriaInventario,
      unidad: v.unidad as UnidadInventario,
      minimo: Number(v.minimo),
      descripcion: v.descripcion.trim() || null,
    };
    if (!cuerpo.nombre) { this.errorModal.set('El nombre no puede estar vacío.'); return; }

    const editando = this.editando();
    this.guardando.set(true);
    this.errorModal.set('');
    const peticion = editando ? this.api.editar(editando.id, cuerpo) : this.api.crear(cuerpo);

    peticion.subscribe({
      next: item => {
        this.guardando.set(false);
        this.modalItem.set(false);
        this.mostrarExito(`Insumo "${item.nombre}" ${editando ? 'actualizado' : 'registrado'} correctamente.`);
        this.cargar$.next(editando ? this.pagina() : 0);
        this.cargarResumen();
        if (this.historialItem()?.id === item.id) this.historialItem.set(item);
      },
      error: (e: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorModal.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== ENTRADAS Y SALIDAS ===========================
  abrirMovimiento(item: ItemInventario, tipo: TipoMovimiento): void {
    this.formMov.reset({ cantidad: null, motivo: '' });
    this.errorMovimiento.set('');
    this.movimientoActual.set({ item, tipo });
  }

  cerrarMovimiento(): void {
    if (this.registrando()) return;
    this.movimientoActual.set(null);
  }

  /** Existencia que quedaría tras el movimiento, redondeada a 3 decimales. */
  saldoResultante(): number | null {
    const mov = this.movimientoActual();
    const cantidad = this.formMov.controls.cantidad.value;
    if (!mov || cantidad === null || Number.isNaN(Number(cantidad))) return null;
    const base = mov.item.existencia;
    const resultado = mov.tipo === 'ENTRADA' ? base + Number(cantidad) : base - Number(cantidad);
    return Math.round(resultado * 1000) / 1000;
  }

  excedeExistencia(): boolean {
    const mov = this.movimientoActual();
    const cantidad = this.formMov.controls.cantidad.value;
    return !!mov && mov.tipo === 'SALIDA' && cantidad !== null && Number(cantidad) > mov.item.existencia;
  }

  registrarMovimiento(): void {
    const mov = this.movimientoActual();
    if (!mov) return;
    this.formMov.markAllAsTouched();
    if (this.formMov.invalid) return;
    if (this.excedeExistencia()) {
      this.errorMovimiento.set('Existencias insuficientes: la salida supera lo disponible.');
      return;
    }

    const { cantidad, motivo } = this.formMov.getRawValue();
    this.registrando.set(true);
    this.errorMovimiento.set('');

    this.api.registrarMovimiento(mov.item.id, {
      tipo: mov.tipo,
      cantidad: Number(cantidad),
      motivo: motivo.trim() || null,
    }).subscribe({
      next: m => {
        this.registrando.set(false);
        this.movimientoActual.set(null);
        this.mostrarExito(
          `${m.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} registrada en "${mov.item.nombre}". Nueva existencia: ${m.saldoPosterior}.`);
        this.cargar$.next(this.pagina());
        this.cargarResumen();
        if (this.historialItem()?.id === m.itemId) {
          this.historialItem.update(h =>
            h ? { ...h, existencia: m.saldoPosterior, alertaMinimo: m.saldoPosterior <= h.minimo } : h);
          this.cargarHistorial(0);
        }
      },
      error: (e: HttpErrorResponse) => {
        this.registrando.set(false);
        this.errorMovimiento.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== HISTORIAL ===========================
  verHistorial(item: ItemInventario): void {
    this.historialItem.set(item);
    this.limpiarFiltrosMov();
    this.cargarHistorial(0);
    setTimeout(() => document.getElementById('inv-historial')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }

  cerrarHistorial(): void {
    this.historialItem.set(null);
    this.movimientos.set([]);
  }

  cargarHistorial(pagina = this.histPagina()): void {
    const item = this.historialItem();
    if (!item) return;
    this.cargandoHistorial.set(true);
    this.errorHistorial.set('');
    this.api.historial(item.id, pagina).subscribe({
      next: r => {
        if (this.historialItem()?.id !== item.id) return; // el usuario cambió de insumo
        this.movimientos.set(r.content);
        this.histPagina.set(r.number);
        this.histTotalPaginas.set(r.totalPages);
        this.histTotal.set(r.totalElements);
        this.cargandoHistorial.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.errorHistorial.set(leerErrorApi(e).mensaje);
        this.cargandoHistorial.set(false);
      },
    });
  }

  limpiarFiltrosMov(): void {
    this.filtroTipo.set('');
    this.filtroTexto.set('');
    this.filtroDesde.set('');
    this.filtroHasta.set('');
  }

  // =========================== DESACTIVAR ===========================
  pedirDesactivar(item: ItemInventario): void { this.pendienteDesactivar.set(item); }
  cancelarDesactivar(): void { if (!this.desactivando()) this.pendienteDesactivar.set(null); }

  confirmarDesactivar(): void {
    const item = this.pendienteDesactivar();
    if (!item) return;
    this.desactivando.set(true);
    this.api.desactivar(item.id).subscribe({
      next: () => {
        this.desactivando.set(false);
        this.pendienteDesactivar.set(null);
        this.mostrarExito(`Insumo "${item.nombre}" desactivado.`);
        this.cargar$.next(this.pagina());
        this.cargarResumen();
        if (this.historialItem()?.id === item.id) this.historialItem.update(h => (h ? { ...h, activo: false } : h));
      },
      error: (e: HttpErrorResponse) => {
        this.desactivando.set(false);
        this.pendienteDesactivar.set(null);
        this.error.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== ETIQUETAS Y MENSAJES ===========================
  etiquetaCategoria(v: string): string { return this.categorias.find(c => c.valor === v)?.etiqueta ?? v; }
  etiquetaUnidad(v: string): string { return this.unidades.find(u => u.valor === v)?.etiqueta ?? v; }

  mensajeItem(campo: 'nombre' | 'categoria' | 'unidad' | 'minimo' | 'descripcion'): string {
    return this.mensajeDe(this.formItem.controls[campo]);
  }

  mensajeMovimiento(campo: 'cantidad' | 'motivo'): string {
    const control = this.formMov.controls[campo];
    if (campo === 'cantidad' && control.touched && control.errors?.['min']) return 'La cantidad debe ser mayor que 0';
    return this.mensajeDe(control);
  }

  private mensajeDe(c: AbstractControl): string {
    if (!c.touched || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio';
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres`;
    if (c.errors['min']) return 'No puede ser negativo';
    if (c.errors['max']) return 'El valor es demasiado grande';
    if (c.errors['decimales']) return 'Máximo 3 decimales';
    return 'Valor no válido';
  }

  // =========================== INTERNOS ===========================
  private cargarResumen(): void {
    forkJoin({
      activos: this.api.listar(0, { activo: 'true' }),
      bajo: this.api.listar(0, { activo: 'true', bajoMinimo: true }),
    }).subscribe({
      next: r => this.resumen.set({ activos: r.activos.totalElements, bajo: r.bajo.totalElements }),
      error: () => this.resumen.set(null),
    });
  }

  private mostrarExito(mensaje: string): void {
    this.exito.set(mensaje);
    clearTimeout(this.temporizadorExito);
    this.temporizadorExito = setTimeout(() => this.exito.set(''), 5000);
  }

  private filtrosIniciales(): FiltrosInventario {
    return { nombre: '', categoria: '', activo: 'true', bajoMinimo: false };
  }
}