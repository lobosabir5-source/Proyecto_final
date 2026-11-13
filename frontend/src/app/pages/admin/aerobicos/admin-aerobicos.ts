import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, switchMap, tap } from 'rxjs';

import {
  ClaseAerobica,
  ESTADOS_CLASE,
  EstadoClase,
  GuardarClaseAerobica,
  InscripcionAerobica,
} from '../../../models/aerobicos.models';
import { DIAS_SEMANA } from '../../../models/equipos.models';
import { PersonalAdmin } from '../../../models/personal-admin.models';
import { AerobicosService } from '../../../services/aerobicos.service';
import { PersonalAdminService } from '../../../services/personal-admin.service';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { Icon } from '../../../shared/ui/icon/icon';
import { Paginador } from '../../../shared/ui/paginador/paginador';
import { StatCard } from '../../../shared/ui/stat-card/stat-card';
import { UiButton } from '../../../shared/ui/ui-button/ui-button';
import { UiTable } from '../../../shared/ui/ui-table/ui-table';
import { leerErrorApi } from '../../../utils/api-error';
import { fechaCorta, horaCorta } from '../../../utils/fecha';
import { hoyIso, lunesDe, sumarDias } from '../../../utils/semana';

/** El backend exige que la hora de fin sea posterior a la de inicio. */
function horasValidas(grupo: AbstractControl): ValidationErrors | null {
  const inicio = grupo.get('horaInicio')?.value;
  const fin = grupo.get('horaFin')?.value;
  return inicio && fin && fin <= inicio ? { horasInvalidas: true } : null;
}

interface DiaAgenda {
  iso: string;
  etiqueta: string;
  esHoy: boolean;
  clases: ClaseAerobica[];
}

@Component({
  selector: 'app-admin-aerobicos',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, UiButton, UiTable, Icon, StatCard, Paginador, ConfirmDialog],
  templateUrl: './admin-aerobicos.html',
  styleUrl: './admin-aerobicos.css',
})
export class AdminAerobicos implements OnInit {
  private readonly api = inject(AerobicosService);
  private readonly personalApi = inject(PersonalAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly estados = ESTADOS_CLASE;
  readonly tamanoPagina = 10;
  readonly fecha = fechaCorta;
  readonly horaDe = horaCorta;

  // ---------- Semana mostrada ----------
  readonly semanaInicio = signal(lunesDe(hoyIso()));
  readonly semanaFin = computed(() => sumarDias(this.semanaInicio(), 6));
  readonly esSemanaActual = computed(() => this.semanaInicio() === lunesDe(hoyIso()));

  readonly clases = signal<ClaseAerobica[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  private readonly cargar$ = new Subject<void>();
  private temporizadorExito: ReturnType<typeof setTimeout> | undefined;

  // ---------- Filtros (sobre la semana cargada) ----------
  readonly filtroTexto = signal('');
  readonly filtroInstructor = signal('');
  readonly filtroEstado = signal<'' | EstadoClase>('');
  readonly hayFiltros = computed(() => !!(this.filtroTexto().trim() || this.filtroInstructor() || this.filtroEstado()));

  /** Instructores presentes en la semana (para el filtro). */
  readonly instructoresSemana = computed(() => {
    const mapa = new Map<number, string>();
    this.clases().forEach(c => mapa.set(c.instructorId, c.instructor));
    return [...mapa.entries()].map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  readonly agenda = computed<DiaAgenda[]>(() => {
    const texto = this.filtroTexto().trim().toLowerCase();
    const instructor = this.filtroInstructor();
    const estado = this.filtroEstado();
    const filtradas = this.clases().filter(c => {
      if (instructor && String(c.instructorId) !== instructor) return false;
      if (estado && c.estado !== estado) return false;
      if (texto && !`${c.nombre} ${c.instructor} ${c.descripcion ?? ''}`.toLowerCase().includes(texto)) return false;
      return true;
    });
    const hoy = hoyIso();
    return Array.from({ length: 7 }, (_, i) => {
      const iso = sumarDias(this.semanaInicio(), i);
      return {
        iso,
        etiqueta: DIAS_SEMANA[i].etiqueta,
        esHoy: iso === hoy,
        clases: filtradas.filter(c => c.fecha === iso).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
      };
    });
  });

  readonly visibles = computed(() => this.agenda().reduce((n, d) => n + d.clases.length, 0));

  // ---------- Resumen de la semana ----------
  readonly resumen = computed(() => {
    const todas = this.clases();
    const activas = todas.filter(c => c.estado !== 'CANCELADA');
    const cupo = activas.reduce((n, c) => n + c.cupoMaximo, 0);
    const inscritos = activas.reduce((n, c) => n + c.inscritos, 0);
    return {
      total: todas.length,
      programadas: todas.filter(c => c.estado === 'PROGRAMADA').length,
      canceladas: todas.filter(c => c.estado === 'CANCELADA').length,
      ocupacion: cupo > 0 ? Math.round((inscritos / cupo) * 100) : 0,
    };
  });

  // ---------- Instructores ----------
  private readonly personal = signal<PersonalAdmin[]>([]);
  /** El backend solo acepta instructores activos. */
  readonly instructoresActivos = computed(() =>
    this.personal().filter(p => p.cargo === 'INSTRUCTOR' && p.estadoLaboral === 'ACTIVO'));

  // ---------- Formulario ----------
  readonly modalClase = signal(false);
  readonly editando = signal<ClaseAerobica | null>(null);
  readonly guardando = signal(false);
  readonly errorModal = signal('');
  readonly formClase = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      descripcion: [''],
      instructorId: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      cupoMaximo: [20, [Validators.required, Validators.min(1), Validators.max(1000)]],
    },
    { validators: horasValidas },
  );

  // ---------- Detalle ----------
  readonly detalle = signal<ClaseAerobica | null>(null);
  readonly inscritos = signal<InscripcionAerobica[]>([]);
  readonly insPagina = signal(0);
  readonly insTotalPaginas = signal(0);
  readonly insTotal = signal(0);
  readonly cargandoInscritos = signal(false);
  readonly errorDetalle = signal('');
  readonly registrandoLlegada = signal(false);

  // ---------- Confirmar cambio de estado ----------
  readonly pendienteEstado = signal<{ clase: ClaseAerobica; estado: EstadoClase } | null>(null);
  readonly cambiandoEstado = signal(false);

  ngOnInit(): void {
    this.cargar$
      .pipe(
        tap(() => { this.cargando.set(true); this.error.set(''); }),
        switchMap(() =>
          this.api.semana(this.semanaInicio()).pipe(
            catchError((e: HttpErrorResponse) => {
              this.error.set(leerErrorApi(e).mensaje);
              this.cargando.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(clases => {
        this.clases.set(clases);
        this.cargando.set(false);
      });

    this.cargar$.next();
    this.personalApi.todos().subscribe({ next: p => this.personal.set(p), error: () => this.personal.set([]) });
  }

  // =========================== SEMANA ===========================
  semanaAnterior(): void { this.irASemana(sumarDias(this.semanaInicio(), -7)); }
  semanaSiguiente(): void { this.irASemana(sumarDias(this.semanaInicio(), 7)); }
  irHoy(): void { this.irASemana(hoyIso()); }
  irAFecha(iso: string): void { if (iso) this.irASemana(iso); }
  recargar(): void { this.cargar$.next(); }

  private irASemana(iso: string): void {
    this.semanaInicio.set(lunesDe(iso));
    this.cargar$.next();
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroInstructor.set('');
    this.filtroEstado.set('');
  }

  // =========================== CREAR / EDITAR ===========================
  abrirNuevo(fechaIso?: string): void {
    this.editando.set(null);
    this.formClase.reset({
      nombre: '', descripcion: '', instructorId: '', fecha: fechaIso ?? hoyIso(),
      horaInicio: '', horaFin: '', cupoMaximo: 20,
    });
    this.errorModal.set('');
    this.modalClase.set(true);
  }

  abrirEditar(c: ClaseAerobica): void {
    this.detalle.set(null);
    this.editando.set(c);
    this.formClase.reset({
      nombre: c.nombre, descripcion: c.descripcion ?? '', instructorId: String(c.instructorId),
      fecha: c.fecha, horaInicio: c.horaInicio.slice(0, 5), horaFin: c.horaFin.slice(0, 5), cupoMaximo: c.cupoMaximo,
    });
    this.errorModal.set('');
    this.modalClase.set(true);
  }

  cerrarModalClase(): void {
    if (this.guardando()) return;
    this.modalClase.set(false);
  }

  guardarClase(): void {
    this.formClase.markAllAsTouched();
    if (this.formClase.invalid) return;

    const v = this.formClase.getRawValue();
    const cuerpo: GuardarClaseAerobica = {
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim() || null,
      instructorId: Number(v.instructorId),
      fecha: v.fecha,
      horaInicio: v.horaInicio,
      horaFin: v.horaFin,
      cupoMaximo: Number(v.cupoMaximo),
    };
    if (!cuerpo.nombre) { this.errorModal.set('El nombre no puede estar vacío.'); return; }

    const editando = this.editando();
    this.guardando.set(true);
    this.errorModal.set('');
    const peticion = editando ? this.api.editar(editando.id, cuerpo) : this.api.crear(cuerpo);

    peticion.subscribe({
      next: clase => {
        this.guardando.set(false);
        this.modalClase.set(false);
        this.mostrarExito(`Clase "${clase.nombre}" ${editando ? 'actualizada' : 'registrada'} correctamente.`);
        // Muestra la semana de la clase guardada (puede ser otra distinta a la actual).
        this.irASemana(clase.fecha);
      },
      error: (e: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorModal.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== DETALLE ===========================
  verDetalle(c: ClaseAerobica): void {
    this.detalle.set(c);
    this.errorDetalle.set('');
    this.inscritos.set([]);
    this.cargarInscritos(0);
  }

  cerrarDetalle(): void {
    this.detalle.set(null);
    this.inscritos.set([]);
  }

  cargarInscritos(pagina = this.insPagina()): void {
    const c = this.detalle();
    if (!c) return;
    this.cargandoInscritos.set(true);
    this.api.inscripciones(c.id, pagina).subscribe({
      next: r => {
        if (this.detalle()?.id !== c.id) return;
        this.inscritos.set(r.content);
        this.insPagina.set(r.number);
        this.insTotalPaginas.set(r.totalPages);
        this.insTotal.set(r.totalElements);
        this.cargandoInscritos.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.errorDetalle.set(leerErrorApi(e).mensaje);
        this.cargandoInscritos.set(false);
      },
    });
  }

  registrarLlegadaInstructor(c: ClaseAerobica): void {
    this.registrandoLlegada.set(true);
    this.errorDetalle.set('');
    this.api.registrarLlegadaInstructor(c.id).subscribe({
      next: actualizada => {
        this.registrandoLlegada.set(false);
        this.reemplazar(actualizada);
        this.mostrarExito('Llegada del instructor registrada.');
      },
      error: (e: HttpErrorResponse) => {
        this.registrandoLlegada.set(false);
        this.errorDetalle.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== CAMBIO DE ESTADO ===========================
  pedirEstado(clase: ClaseAerobica, estado: EstadoClase): void { this.pendienteEstado.set({ clase, estado }); }
  cancelarEstado(): void { if (!this.cambiandoEstado()) this.pendienteEstado.set(null); }

  confirmarEstado(): void {
    const p = this.pendienteEstado();
    if (!p) return;
    this.cambiandoEstado.set(true);
    this.api.cambiarEstado(p.clase.id, p.estado).subscribe({
      next: actualizada => {
        this.cambiandoEstado.set(false);
        this.pendienteEstado.set(null);
        this.reemplazar(actualizada);
        this.mostrarExito(`Clase "${actualizada.nombre}" ${p.estado === 'CANCELADA' ? 'cancelada' : 'finalizada'}.`);
      },
      error: (e: HttpErrorResponse) => {
        this.cambiandoEstado.set(false);
        this.pendienteEstado.set(null);
        this.error.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== ETIQUETAS ===========================
  etiquetaEstado(v: string): string { return this.estados.find(x => x.valor === v)?.etiqueta ?? v; }

  claseEstado(v: EstadoClase): string {
    return v === 'PROGRAMADA' ? 'badge-info' : v === 'FINALIZADA' ? 'badge-success' : 'badge-danger';
  }

  hora(v: string): string { return v.slice(0, 5); }

  porcentaje(c: ClaseAerobica): number {
    return c.cupoMaximo > 0 ? Math.min(100, Math.round((c.inscritos / c.cupoMaximo) * 100)) : 0;
  }

  mensajeClase(campo: 'nombre' | 'instructorId' | 'fecha' | 'horaInicio' | 'horaFin' | 'cupoMaximo'): string {
    const c = this.formClase.controls[campo];
    if (!c.touched || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio';
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres`;
    if (c.errors['min']) return 'El cupo mínimo es 1';
    if (c.errors['max']) return 'Cupo demasiado alto';
    return 'Valor no válido';
  }

  get horasInvalidas(): boolean {
    return !!this.formClase.errors?.['horasInvalidas'] && (this.formClase.controls.horaFin.touched || this.formClase.controls.horaInicio.touched);
  }

  // =========================== INTERNOS ===========================
  private reemplazar(c: ClaseAerobica): void {
    this.clases.update(lista => lista.map(x => (x.id === c.id ? c : x)));
    if (this.detalle()?.id === c.id) this.detalle.set(c);
  }

  private mostrarExito(mensaje: string): void {
    this.exito.set(mensaje);
    clearTimeout(this.temporizadorExito);
    this.temporizadorExito = setTimeout(() => this.exito.set(''), 5000);
  }
}