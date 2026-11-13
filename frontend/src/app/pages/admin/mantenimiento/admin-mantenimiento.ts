import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subject, catchError, forkJoin, switchMap, tap } from 'rxjs';

import { ESTADOS_EQUIPO, Equipo, EstadoEquipo } from '../../../models/equipos.models';
import {
  AlertasMantenimiento,
  ESTADOS_MANTENIMIENTO,
  EstadoMantenimiento,
  FiltrosMantenimiento,
  Mantenimiento,
} from '../../../models/mantenimiento.models';
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
import { fechaCorta } from '../../../utils/fecha';
import { hoyIso } from '../../../utils/semana';

@Component({
  selector: 'app-admin-mantenimiento',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, UiButton, UiTable, Icon, StatCard, Paginador],
  templateUrl: './admin-mantenimiento.html',
  styleUrl: './admin-mantenimiento.css',
})
export class AdminMantenimiento implements OnInit {
  private readonly api = inject(MantenimientoService);
  private readonly equiposApi = inject(EquiposService);
  private readonly personalApi = inject(PersonalAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly ruta = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly estados = ESTADOS_MANTENIMIENTO;
  readonly estadosEquipo = ESTADOS_EQUIPO;
  readonly tamanoPagina = 10;
  readonly fecha = fechaCorta;

  // ---------- Bitácora ----------
  readonly registros = signal<Mantenimiento[]>([]);
  readonly cargando = signal(false);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly error = signal('');
  readonly exito = signal('');
  readonly alertas = signal<AlertasMantenimiento | null>(null);

  /** Filtros que resuelve el backend. */
  filtros: FiltrosMantenimiento = { equipoId: '', estado: '', vencidos: false };

  /** El backend no filtra por fecha ni texto: se aplican sobre la página cargada. */
  readonly filtroDesde = signal('');
  readonly filtroHasta = signal('');
  readonly filtroTexto = signal('');

  private readonly cargar$ = new Subject<number>();
  private temporizadorExito: ReturnType<typeof setTimeout> | undefined;

  // ---------- Catálogos (equipos y personal) ----------
  readonly equipos = signal<Equipo[]>([]);
  private readonly personal = signal<PersonalAdmin[]>([]);
  readonly tecnicosActivos = computed(() => this.personal().filter(p => p.estadoLaboral === 'ACTIVO'));

  readonly registrosVisibles = computed(() => {
    const desde = this.filtroDesde();
    const hasta = this.filtroHasta();
    const texto = this.filtroTexto().trim().toLowerCase();
    return this.registros().filter(r => {
      if (desde && r.fechaProgramada < desde) return false;
      if (hasta && r.fechaProgramada > hasta) return false;
      if (texto) {
        const eq = this.equipos().find(e => e.id === r.equipoId);
        const pista = `${eq?.codigo ?? ''} ${eq?.nombre ?? ''} ${this.nombreTecnico(r.tecnicoId)} ${r.trabajoRealizado ?? ''} ${r.observaciones ?? ''}`;
        if (!pista.toLowerCase().includes(texto)) return false;
      }
      return true;
    });
  });

  readonly hayFiltrosLocales = computed(() => !!(this.filtroDesde() || this.filtroHasta() || this.filtroTexto().trim()));

  get hayFiltros(): boolean {
    return !!(this.filtros.equipoId || this.filtros.estado || this.filtros.vencidos) || this.hayFiltrosLocales();
  }

  // ---------- Programar ----------
  readonly modalProgramar = signal(false);
  readonly programando = signal(false);
  readonly errorProgramar = signal('');
  readonly formProgramar = this.fb.nonNullable.group({
    equipoId: ['', Validators.required],
    fechaProgramada: ['', Validators.required],
    tecnicoId: [''],
    observaciones: ['', Validators.maxLength(1000)],
  });

  // ---------- Completar ----------
  readonly completando = signal<Mantenimiento | null>(null);
  readonly guardandoCompletar = signal(false);
  readonly errorCompletar = signal('');
  readonly formCompletar = this.fb.nonNullable.group({
    fechaRealizada: [hoyIso(), Validators.required],
    trabajoRealizado: ['', [Validators.required, Validators.maxLength(1000)]],
    observaciones: ['', Validators.maxLength(1000)],
    estadoEquipo: [''],
  });

  // ---------- Cancelar ----------
  readonly cancelando = signal<Mantenimiento | null>(null);
  readonly guardandoCancelar = signal(false);
  readonly errorCancelar = signal('');
  readonly formCancelar = this.fb.nonNullable.group({
    motivo: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    // Enlaces desde Equipos: /admin/mantenimiento?equipoId=3 o ?vencidos=true
    const q = this.ruta.snapshot.queryParamMap;
    if (q.get('equipoId')) this.filtros.equipoId = q.get('equipoId') as string;
    if (q.get('vencidos') === 'true') this.filtros.vencidos = true;

    this.cargar$
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
        this.registros.set(r.content);
        this.pagina.set(r.number);
        this.totalPaginas.set(r.totalPages);
        this.totalElementos.set(r.totalElements);
        this.cargando.set(false);
      });

    this.cargar$.next(0);
    this.cargarAlertas();
    forkJoin({ equipos: this.equiposApi.todos(), personal: this.personalApi.todos() }).subscribe({
      next: r => { this.equipos.set(r.equipos); this.personal.set(r.personal); },
      error: (e: HttpErrorResponse) => this.error.set(leerErrorApi(e).mensaje),
    });
  }

  // =========================== FILTROS ===========================
  aplicarFiltros(): void { this.cargar$.next(0); }
  irAPagina(pagina: number): void { this.cargar$.next(pagina); }

  limpiarFiltros(): void {
    this.filtros = { equipoId: '', estado: '', vencidos: false };
    this.filtroDesde.set('');
    this.filtroHasta.set('');
    this.filtroTexto.set('');
    this.cargar$.next(0);
  }

  verSoloVencidos(): void {
    this.filtros = { equipoId: '', estado: '', vencidos: true };
    this.cargar$.next(0);
  }

  // =========================== PROGRAMAR ===========================
  abrirProgramar(): void {
    this.formProgramar.reset({
      equipoId: this.filtros.equipoId, fechaProgramada: hoyIso(), tecnicoId: '', observaciones: '',
    });
    this.errorProgramar.set('');
    this.modalProgramar.set(true);
  }

  cerrarProgramar(): void {
    if (this.programando()) return;
    this.modalProgramar.set(false);
  }

  guardarProgramacion(): void {
    this.formProgramar.markAllAsTouched();
    if (this.formProgramar.invalid) return;
    const v = this.formProgramar.getRawValue();
    this.programando.set(true);
    this.errorProgramar.set('');
    this.api.programar({
      equipoId: Number(v.equipoId),
      fechaProgramada: v.fechaProgramada,
      tecnicoId: v.tecnicoId ? Number(v.tecnicoId) : null,
      observaciones: v.observaciones.trim() || null,
    }).subscribe({
      next: m => {
        this.programando.set(false);
        this.modalProgramar.set(false);
        this.mostrarExito(`Mantenimiento programado para el ${fechaCorta(m.fechaProgramada)}.`);
        this.cargar$.next(0);
        this.cargarAlertas();
      },
      error: (e: HttpErrorResponse) => {
        this.programando.set(false);
        this.errorProgramar.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== COMPLETAR ===========================
  abrirCompletar(m: Mantenimiento): void {
    this.formCompletar.reset({
      fechaRealizada: hoyIso(), trabajoRealizado: '', observaciones: m.observaciones ?? '', estadoEquipo: '',
    });
    this.errorCompletar.set('');
    this.completando.set(m);
  }

  cerrarCompletar(): void {
    if (this.guardandoCompletar()) return;
    this.completando.set(null);
  }

  guardarCompletar(): void {
    const m = this.completando();
    if (!m) return;
    this.formCompletar.markAllAsTouched();
    if (this.formCompletar.invalid) return;
    const v = this.formCompletar.getRawValue();
    if (!v.trabajoRealizado.trim()) { this.errorCompletar.set('Describe el trabajo realizado.'); return; }

    this.guardandoCompletar.set(true);
    this.errorCompletar.set('');
    this.api.completar(m.id, {
      fechaRealizada: v.fechaRealizada || null,
      trabajoRealizado: v.trabajoRealizado.trim(),
      observaciones: v.observaciones.trim() || null,
      estadoEquipo: (v.estadoEquipo || null) as EstadoEquipo | null,
    }).subscribe({
      next: () => {
        this.guardandoCompletar.set(false);
        this.completando.set(null);
        this.mostrarExito('Mantenimiento registrado como realizado.');
        this.cargar$.next(this.pagina());
        this.cargarAlertas();
        // El estado del equipo pudo cambiar.
        this.equiposApi.todos().subscribe({ next: e => this.equipos.set(e) });
      },
      error: (e: HttpErrorResponse) => {
        this.guardandoCompletar.set(false);
        this.errorCompletar.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== CANCELAR ===========================
  abrirCancelar(m: Mantenimiento): void {
    this.formCancelar.reset({ motivo: '' });
    this.errorCancelar.set('');
    this.cancelando.set(m);
  }

  cerrarCancelar(): void {
    if (this.guardandoCancelar()) return;
    this.cancelando.set(null);
  }

  guardarCancelar(): void {
    const m = this.cancelando();
    if (!m) return;
    this.formCancelar.markAllAsTouched();
    if (this.formCancelar.invalid) return;
    const motivo = this.formCancelar.getRawValue().motivo.trim();
    if (!motivo) { this.errorCancelar.set('Indica el motivo de la cancelación.'); return; }

    this.guardandoCancelar.set(true);
    this.errorCancelar.set('');
    this.api.cancelar(m.id, motivo).subscribe({
      next: () => {
        this.guardandoCancelar.set(false);
        this.cancelando.set(null);
        this.mostrarExito('Mantenimiento cancelado.');
        this.cargar$.next(this.pagina());
        this.cargarAlertas();
      },
      error: (e: HttpErrorResponse) => {
        this.guardandoCancelar.set(false);
        this.errorCancelar.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== ETIQUETAS ===========================
  equipoDe(id: number): Equipo | undefined { return this.equipos().find(e => e.id === id); }

  nombreEquipo(id: number): string {
    const e = this.equipoDe(id);
    return e ? e.nombre : `Equipo #${id}`;
  }

  nombreTecnico(id: number | null): string {
    if (id == null) return 'Sin asignar';
    const p = this.personal().find(x => x.id === id);
    return p ? `${p.nombres} ${p.apellidos}` : `Personal #${id}`;
  }

  etiquetaEstado(v: EstadoMantenimiento): string { return this.estados.find(x => x.valor === v)?.etiqueta ?? v; }

  claseEstado(m: Mantenimiento): string {
    if (m.vencido) return 'badge-danger';
    return m.estado === 'REALIZADO' ? 'badge-success' : m.estado === 'PENDIENTE' ? 'badge-warning' : 'badge-muted';
  }

  mensaje(grupo: 'programar' | 'completar' | 'cancelar', campo: string): string {
    const form: AbstractControl =
      grupo === 'programar' ? this.formProgramar : grupo === 'completar' ? this.formCompletar : this.formCancelar;
    const c = form.get(campo);
    if (!c || !c.touched || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio';
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres`;
    return 'Valor no válido';
  }

  // =========================== INTERNOS ===========================
  private cargarAlertas(): void {
    this.api.alertas().subscribe({ next: a => this.alertas.set(a), error: () => this.alertas.set(null) });
  }

  private mostrarExito(mensaje: string): void {
    this.exito.set(mensaje);
    clearTimeout(this.temporizadorExito);
    this.temporizadorExito = setTimeout(() => this.exito.set(''), 5000);
  }
}