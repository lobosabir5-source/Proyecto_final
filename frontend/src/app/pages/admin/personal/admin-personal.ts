import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, debounceTime, forkJoin, map, merge, switchMap, tap } from 'rxjs';

import { CargoPersonal, EstadoLaboral } from '../../../models/personal-admin.models';
import {
  CARGOS_PERSONAL,
  ESTADOS_LABORALES,
  FiltrosPersonal,
  GuardarPersonal,
  Personal,
} from '../../../models/personal.models';
import { PersonalService } from '../../../services/personal.service';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { Icon } from '../../../shared/ui/icon/icon';
import { Paginador } from '../../../shared/ui/paginador/paginador';
import { StatCard } from '../../../shared/ui/stat-card/stat-card';
import { UiButton } from '../../../shared/ui/ui-button/ui-button';
import { UiTable } from '../../../shared/ui/ui-table/ui-table';
import { leerErrorApi } from '../../../utils/api-error';
import { fechaMedia } from '../../../utils/fecha';

type CampoPersonal =
  'nombres' | 'apellidos' | 'documento' | 'telefono' | 'correo' | 'cargo' | 'fechaIngreso' | 'observaciones';

@Component({
  selector: 'app-admin-personal',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, UiButton, UiTable, Icon, StatCard, Paginador, ConfirmDialog],
  templateUrl: './admin-personal.html',
  styleUrl: './admin-personal.css',
})
export class AdminPersonal implements OnInit {
  private readonly api = inject(PersonalService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargos = CARGOS_PERSONAL;
  readonly estados = ESTADOS_LABORALES;
  readonly tamanoPagina = 10;

  // ---------- Listado ----------
  readonly personal = signal<Personal[]>([]);
  readonly cargando = signal(false);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly error = signal('');
  readonly exito = signal('');

  filtros: FiltrosPersonal = this.filtrosIniciales();
  private readonly escribiendo$ = new Subject<void>();
  private readonly cargar$ = new Subject<number>();
  private temporizadorExito: ReturnType<typeof setTimeout> | undefined;

  /** Totales reales del servidor (no dependen de la página ni de los filtros). */
  readonly resumen = signal<{ total: number; activos: number } | null>(null);
  readonly noActivos = computed(() => {
    const r = this.resumen();
    return r ? Math.max(r.total - r.activos, 0) : '—';
  });

  get hayFiltros(): boolean {
    const f = this.filtros;
    return !!(f.texto.trim() || f.cargo || f.estado);
  }

  // ---------- Formulario ----------
  readonly modalForm = signal(false);
  readonly editando = signal<Personal | null>(null);
  readonly guardando = signal(false);
  readonly errorModal = signal('');
  readonly form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    documento: ['', [Validators.required, Validators.maxLength(30)]],
    telefono: ['', Validators.maxLength(30)],
    correo: ['', [Validators.maxLength(150), Validators.email]],
    cargo: ['', Validators.required],
    fechaIngreso: ['', Validators.required],
    observaciones: ['', Validators.maxLength(500)],
  });

  // ---------- Detalle ----------
  readonly detalle = signal<Personal | null>(null);

  // ---------- Activar / desactivar ----------
  readonly pendienteEstado = signal<{ persona: Personal; nuevo: EstadoLaboral } | null>(null);
  readonly cambiandoEstado = signal(false);

  ngOnInit(): void {
    merge(this.escribiendo$.pipe(debounceTime(350), map(() => 0)), this.cargar$)
      .pipe(
        tap(() => { this.cargando.set(true); this.error.set(''); }),
        switchMap(pagina =>
          this.api.buscar(pagina, this.filtros).pipe(
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
        // Si la última página quedó vacía (p. ej. tras cambiar de estado), retrocede una.
        if (r.content.length === 0 && r.number > 0) {
          this.cargar$.next(r.number - 1);
          return;
        }
        this.personal.set(r.content);
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

  // =========================== REGISTRAR / EDITAR ===========================
  abrirNuevo(): void {
    this.editando.set(null);
    this.form.reset({
      nombres: '', apellidos: '', documento: '', telefono: '', correo: '',
      cargo: '', fechaIngreso: this.hoy(), observaciones: '',
    });
    this.errorModal.set('');
    this.modalForm.set(true);
  }

  abrirEditar(p: Personal): void {
    this.detalle.set(null);
    this.editando.set(p);
    this.form.reset({
      nombres: p.nombres,
      apellidos: p.apellidos,
      documento: p.documento,
      telefono: p.telefono ?? '',
      correo: p.correo ?? '',
      cargo: p.cargo,
      fechaIngreso: p.fechaIngreso,
      observaciones: p.observaciones ?? '',
    });
    this.errorModal.set('');
    this.modalForm.set(true);
  }

  cerrarModalForm(): void {
    if (this.guardando()) return;
    this.modalForm.set(false);
  }

  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const cuerpo: GuardarPersonal = {
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      documento: v.documento.trim(),
      telefono: v.telefono.trim() || null,
      correo: v.correo.trim() || null,
      cargo: v.cargo as CargoPersonal,
      fechaIngreso: v.fechaIngreso,
      observaciones: v.observaciones.trim() || null,
    };
    if (!cuerpo.nombres || !cuerpo.apellidos || !cuerpo.documento) {
      this.errorModal.set('Nombres, apellidos y documento no pueden estar vacíos.');
      return;
    }

    const editando = this.editando();
    this.guardando.set(true);
    this.errorModal.set('');
    const peticion = editando ? this.api.editar(editando.id, cuerpo) : this.api.crear(cuerpo);

    peticion.subscribe({
      next: p => {
        this.guardando.set(false);
        this.modalForm.set(false);
        this.mostrarExito(`${p.nombres} ${p.apellidos} ${editando ? 'actualizado' : 'registrado'} correctamente.`);
        this.cargar$.next(editando ? this.pagina() : 0);
        this.cargarResumen();
      },
      error: (e: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorModal.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== DETALLE ===========================
  verDetalle(p: Personal): void { this.detalle.set(p); }
  cerrarDetalle(): void { this.detalle.set(null); }

  // =========================== ACTIVAR / DESACTIVAR ===========================
  pedirCambioEstado(persona: Personal): void {
    this.pendienteEstado.set({ persona, nuevo: persona.estadoLaboral === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' });
  }

  cancelarCambioEstado(): void {
    if (!this.cambiandoEstado()) this.pendienteEstado.set(null);
  }

  mensajeCambioEstado(p: { persona: Personal; nuevo: EstadoLaboral }): string {
    const nombre = `${p.persona.nombres} ${p.persona.apellidos}`;
    if (p.nuevo === 'INACTIVO') {
      return `¿Desactivar a ${nombre}? Dejará de figurar como personal activo. Su historial de asistencia se conserva.`;
    }
    const extra = p.persona.estadoLaboral === 'RETIRADO' ? ' Se quitará su fecha de salida.' : '';
    return `¿Activar a ${nombre}?${extra}`;
  }

  confirmarCambioEstado(): void {
    const p = this.pendienteEstado();
    if (!p) return;
    this.cambiandoEstado.set(true);
    this.api.cambiarEstado(p.persona.id, p.nuevo).subscribe({
      next: r => {
        this.cambiandoEstado.set(false);
        this.pendienteEstado.set(null);
        this.mostrarExito(`${r.nombres} ${r.apellidos} ${p.nuevo === 'ACTIVO' ? 'activado' : 'desactivado'}.`);
        this.cargar$.next(this.pagina());
        this.cargarResumen();
      },
      error: (e: HttpErrorResponse) => {
        this.cambiandoEstado.set(false);
        this.pendienteEstado.set(null);
        this.error.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== ETIQUETAS Y MENSAJES ===========================
  etiquetaCargo(v: string): string { return this.cargos.find(c => c.valor === v)?.etiqueta ?? v; }
  etiquetaEstado(v: string): string { return this.estados.find(e => e.valor === v)?.etiqueta ?? v; }
  fecha(v: string | null): string { return v ? fechaMedia(v) : '—'; }

  claseEstado(e: EstadoLaboral): string {
    switch (e) {
      case 'ACTIVO': return 'badge badge-success';
      case 'SUSPENDIDO': return 'badge badge-warning';
      case 'RETIRADO': return 'badge badge-danger';
      default: return 'badge badge-muted';
    }
  }

  mensaje(campo: CampoPersonal): string {
    return this.mensajeDe(this.form.controls[campo]);
  }

  private mensajeDe(c: AbstractControl): string {
    if (!c.touched || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio';
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres`;
    if (c.errors['email']) return 'Ingresa un correo válido';
    return 'Valor no válido';
  }

  // =========================== INTERNOS ===========================
  private cargarResumen(): void {
    forkJoin({
      total: this.api.buscar(0),
      activos: this.api.buscar(0, { estado: 'ACTIVO' }),
    }).subscribe({
      next: r => this.resumen.set({ total: r.total.totalElements, activos: r.activos.totalElements }),
      error: () => this.resumen.set(null),
    });
  }

  private mostrarExito(mensaje: string): void {
    this.exito.set(mensaje);
    clearTimeout(this.temporizadorExito);
    this.temporizadorExito = setTimeout(() => this.exito.set(''), 5000);
  }

  private hoy(): string {
    const d = new Date();
    const dos = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
  }

  private filtrosIniciales(): FiltrosPersonal {
    return { texto: '', cargo: '', estado: '' };
  }
}