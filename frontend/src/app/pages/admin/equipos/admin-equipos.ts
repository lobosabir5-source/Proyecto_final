import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, debounceTime, forkJoin, map, merge, switchMap, tap } from 'rxjs';

import {
  DIAS_SEMANA,
  DiaSemana,
  ESTADOS_EQUIPO,
  Equipo,
  EstadoEquipo,
  FiltrosEquipos,
  GuardarEquipo,
} from '../../../models/equipos.models';
import { Mantenimiento } from '../../../models/mantenimiento.models';
import { PersonalAdmin } from '../../../models/personal-admin.models';
import { EquiposService } from '../../../services/equipos.service';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { PersonalAdminService } from '../../../services/personal-admin.service';
import { Icon } from '../../../shared/ui/icon/icon';
import { Paginador } from '../../../shared/ui/paginador/paginador';
import { StatCard } from '../../../shared/ui/stat-card/stat-card';
import { UiButton } from '../../../shared/ui/ui-button/ui-button';
import { UiTable } from '../../../shared/ui/ui-table/ui-table';
import { leerErrorApi } from '../../../utils/api-error';
import { fechaConDia, fechaCorta } from '../../../utils/fecha';
import { hoyIso, lunesDe, sumarDias } from '../../../utils/semana';

/** El backend rechaza que los dos días de mantenimiento sean el mismo. */
function diasDistintos(grupo: AbstractControl): ValidationErrors | null {
  const uno = grupo.get('diaUno')?.value;
  const dos = grupo.get('diaDos')?.value;
  return uno && dos && uno === dos ? { diasIguales: true } : null;
}

@Component({
  selector: 'app-admin-equipos',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, UiButton, UiTable, Icon, StatCard, Paginador],
  templateUrl: './admin-equipos.html',
  styleUrl: './admin-equipos.css',
})
export class AdminEquipos implements OnInit {
  private readonly api = inject(EquiposService);
  private readonly mantenimiento = inject(MantenimientoService);
  private readonly personalApi = inject(PersonalAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly estados = ESTADOS_EQUIPO;
  readonly dias = DIAS_SEMANA;
  readonly tamanoPagina = 10;
  readonly fecha = fechaCorta;
  readonly fechaDia = fechaConDia;

  // ---------- Listado ----------
  readonly equipos = signal<Equipo[]>([]);
  readonly cargando = signal(false);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly error = signal('');
  readonly exito = signal('');

  filtros: FiltrosEquipos = this.filtrosIniciales();
  private readonly escribiendo$ = new Subject<void>();
  private readonly cargar$ = new Subject<number>();
  private temporizadorExito: ReturnType<typeof setTimeout> | undefined;

  get hayFiltros(): boolean {
    return !!(this.filtros.texto.trim() || this.filtros.estado);
  }

  // ---------- Resumen (totales reales del servidor) ----------
  readonly resumen = signal<{ total: number; enMantenimiento: number; fuera: number; vencidos: number } | null>(null);
  readonly operativos = computed(() => {
    const r = this.resumen();
    return r ? Math.max(r.total - r.enMantenimiento - r.fuera, 0) : '—';
  });

  // ---------- Personal (técnicos) ----------
  private readonly personal = signal<PersonalAdmin[]>([]);
  /** El backend solo admite técnicos activos al guardar. */
  readonly tecnicosActivos = computed(() => this.personal().filter(p => p.estadoLaboral === 'ACTIVO'));

  // ---------- Formulario de equipo ----------
  readonly modalEquipo = signal(false);
  readonly editando = signal<Equipo | null>(null);
  readonly guardando = signal(false);
  readonly errorModal = signal('');
  readonly formEquipo = this.fb.nonNullable.group(
    {
      codigo: ['', [Validators.required, Validators.maxLength(40)]],
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      tipo: ['', [Validators.required, Validators.maxLength(60)]],
      ubicacion: ['', Validators.maxLength(120)],
      descripcion: ['', Validators.maxLength(500)],
      estado: ['OPERATIVO'],
      mantenimientoActivo: [true],
      diaUno: ['MONDAY'],
      diaDos: ['THURSDAY'],
      tecnicoId: [''],
      fechaAlta: [''],
    },
    { validators: diasDistintos },
  );

  // ---------- Ficha ----------
  readonly ficha = signal<Equipo | null>(null);

  // ---------- Programar semana ----------
  readonly semanaEquipo = signal<Equipo | null>(null);
  readonly fechaSemana = signal(hoyIso());
  readonly programando = signal(false);
  readonly errorSemana = signal('');
  readonly resultadoSemana = signal<Mantenimiento[] | null>(null);

  /** Fechas que generará el backend para la semana elegida (lunes + posición del día). */
  readonly previsualizacion = computed(() => {
    const eq = this.semanaEquipo();
    if (!eq) return [];
    const lunes = lunesDe(this.fechaSemana() || hoyIso());
    return [eq.diaUno, eq.diaDos]
      .map(d => DIAS_SEMANA.find(x => x.valor === d))
      .filter((d): d is (typeof DIAS_SEMANA)[number] => !!d)
      .map(d => ({ etiqueta: d.etiqueta, iso: sumarDias(lunes, d.indice) }))
      .sort((a, b) => a.iso.localeCompare(b.iso));
  });

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
        if (r.content.length === 0 && r.number > 0) {
          this.cargar$.next(r.number - 1);
          return;
        }
        this.equipos.set(r.content);
        this.pagina.set(r.number);
        this.totalPaginas.set(r.totalPages);
        this.totalElementos.set(r.totalElements);
        this.cargando.set(false);
      });

    this.cargar$.next(0);
    this.cargarResumen();
    this.personalApi.todos().subscribe({ next: p => this.personal.set(p), error: () => this.personal.set([]) });
  }

  // =========================== FILTROS Y PAGINACIÓN ===========================
  alEscribir(): void { this.escribiendo$.next(); }
  aplicarFiltros(): void { this.cargar$.next(0); }
  irAPagina(pagina: number): void { this.cargar$.next(pagina); }

  limpiarFiltros(): void {
    this.filtros = this.filtrosIniciales();
    this.cargar$.next(0);
  }

  // =========================== CREAR / EDITAR ===========================
  abrirNuevo(): void {
    this.editando.set(null);
    this.formEquipo.reset({
      codigo: '', nombre: '', tipo: '', ubicacion: '', descripcion: '', estado: 'OPERATIVO',
      mantenimientoActivo: true, diaUno: 'MONDAY', diaDos: 'THURSDAY', tecnicoId: '', fechaAlta: hoyIso(),
    });
    this.errorModal.set('');
    this.modalEquipo.set(true);
  }

  abrirEditar(e: Equipo): void {
    this.ficha.set(null);
    this.editando.set(e);
    this.formEquipo.reset({
      codigo: e.codigo, nombre: e.nombre, tipo: e.tipo, ubicacion: e.ubicacion ?? '',
      descripcion: e.descripcion ?? '', estado: e.estado, mantenimientoActivo: e.mantenimientoActivo,
      diaUno: e.diaUno, diaDos: e.diaDos, tecnicoId: e.tecnicoId == null ? '' : String(e.tecnicoId),
      fechaAlta: e.fechaAlta ?? '',
    });
    this.errorModal.set('');
    this.modalEquipo.set(true);
  }

  cerrarModalEquipo(): void {
    if (this.guardando()) return;
    this.modalEquipo.set(false);
  }

  guardarEquipo(): void {
    this.formEquipo.markAllAsTouched();
    if (this.formEquipo.invalid) return;

    const v = this.formEquipo.getRawValue();
    const cuerpo: GuardarEquipo = {
      codigo: v.codigo.trim(),
      nombre: v.nombre.trim(),
      tipo: v.tipo.trim(),
      ubicacion: v.ubicacion.trim() || null,
      descripcion: v.descripcion.trim() || null,
      estado: v.estado as EstadoEquipo,
      mantenimientoActivo: v.mantenimientoActivo,
      diaUno: v.diaUno as DiaSemana,
      diaDos: v.diaDos as DiaSemana,
      tecnicoId: v.tecnicoId ? Number(v.tecnicoId) : null,
      fechaAlta: v.fechaAlta || null,
    };
    if (!cuerpo.codigo || !cuerpo.nombre || !cuerpo.tipo) {
      this.errorModal.set('Código, nombre y tipo no pueden estar vacíos.');
      return;
    }

    const editando = this.editando();
    this.guardando.set(true);
    this.errorModal.set('');
    const peticion = editando ? this.api.editar(editando.id, cuerpo) : this.api.crear(cuerpo);

    peticion.subscribe({
      next: eq => {
        this.guardando.set(false);
        this.modalEquipo.set(false);
        this.mostrarExito(`Equipo "${eq.nombre}" ${editando ? 'actualizado' : 'registrado'} correctamente.`);
        this.cargar$.next(editando ? this.pagina() : 0);
        this.cargarResumen();
      },
      error: (e: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorModal.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== FICHA ===========================
  verFicha(e: Equipo): void { this.ficha.set(e); }
  cerrarFicha(): void { this.ficha.set(null); }

  // =========================== PROGRAMAR SEMANA ===========================
  abrirSemana(e: Equipo): void {
    this.ficha.set(null);
    this.semanaEquipo.set(e);
    this.fechaSemana.set(hoyIso());
    this.errorSemana.set('');
    this.resultadoSemana.set(null);
  }

  cerrarSemana(): void {
    if (this.programando()) return;
    this.semanaEquipo.set(null);
  }

  confirmarSemana(): void {
    const eq = this.semanaEquipo();
    if (!eq || !this.fechaSemana()) return;
    this.programando.set(true);
    this.errorSemana.set('');
    this.api.programarSemana(eq.id, this.fechaSemana()).subscribe({
      next: creados => {
        this.programando.set(false);
        this.resultadoSemana.set(creados);
        this.cargarResumen();
      },
      error: (e: HttpErrorResponse) => {
        this.programando.set(false);
        this.errorSemana.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== ETIQUETAS ===========================
  etiquetaEstado(v: string): string { return this.estados.find(x => x.valor === v)?.etiqueta ?? v; }
  etiquetaDia(v: string): string { return this.dias.find(x => x.valor === v)?.etiqueta ?? v; }

  claseEstado(v: EstadoEquipo): string {
    return v === 'OPERATIVO' ? 'badge-success' : v === 'EN_MANTENIMIENTO' ? 'badge-warning' : 'badge-danger';
  }

  nombreTecnico(id: number | null): string {
    if (id == null) return 'Sin asignar';
    const p = this.personal().find(x => x.id === id);
    return p ? `${p.nombres} ${p.apellidos}` : `Personal #${id}`;
  }

  mensajeEquipo(campo: 'codigo' | 'nombre' | 'tipo' | 'ubicacion' | 'descripcion'): string {
    const c = this.formEquipo.controls[campo];
    if (!c.touched || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio';
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres`;
    return 'Valor no válido';
  }

  get diasIguales(): boolean {
    return !!this.formEquipo.errors?.['diasIguales'];
  }

  // =========================== INTERNOS ===========================
  private cargarResumen(): void {
    forkJoin({ total: this.api.listar(0), alertas: this.mantenimiento.alertas() }).subscribe({
      next: r => this.resumen.set({
        total: r.total.totalElements,
        enMantenimiento: r.alertas.equiposEnMantenimiento,
        fuera: r.alertas.equiposFueraServicio,
        vencidos: r.alertas.mantenimientosVencidos,
      }),
      error: () => this.resumen.set(null),
    });
  }

  private mostrarExito(mensaje: string): void {
    this.exito.set(mensaje);
    clearTimeout(this.temporizadorExito);
    this.temporizadorExito = setTimeout(() => this.exito.set(''), 5000);
  }

  private filtrosIniciales(): FiltrosEquipos {
    return { texto: '', estado: '' };
  }
}