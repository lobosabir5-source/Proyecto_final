import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';
import { EMPTY, catchError, Subject, switchMap, tap } from 'rxjs';

import {
  AsistenciaPersonal,
  ESTADOS_ASISTENCIA_PERSONAL,
  EstadoAsistenciaPersonal,
  FiltrosAsistenciaPersonal,
  GuardarAsistenciaPersonal,
  TURNOS_PERSONAL,
  TurnoPersonal,
} from '../../../models/asistencia-personal.models';
import { PersonalAdmin } from '../../../models/personal-admin.models';
import { CARGOS_PERSONAL } from '../../../models/personal.models';
import { AsistenciaPersonalService } from '../../../services/asistencia-personal.service';
import { PersonalAdminService } from '../../../services/personal-admin.service';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { Icon } from '../../../shared/ui/icon/icon';
import { Paginador } from '../../../shared/ui/paginador/paginador';
import { UiButton } from '../../../shared/ui/ui-button/ui-button';
import { UiTable } from '../../../shared/ui/ui-table/ui-table';
import { leerErrorApi } from '../../../utils/api-error';
import { fechaMedia } from '../../../utils/fecha';

type CampoAsistencia = 'personalId' | 'fecha' | 'turno' | 'estado' | 'horaEntrada' | 'horaSalida' | 'observaciones';

/** Ausencia y permiso no llevan horas (regla del backend). */
const sinHorasEstado = (e: string): boolean => e === 'AUSENTE' || e === 'PERMISO';

/** Mismas reglas que AsistenciaPersonalService: entrada obligatoria salvo ausencia/permiso; salida >= entrada. */
function horasValidas(g: AbstractControl): ValidationErrors | null {
  const estado = g.get('estado')?.value as string;
  const entrada = (g.get('horaEntrada')?.value as string) ?? '';
  const salida = (g.get('horaSalida')?.value as string) ?? '';
  if (!sinHorasEstado(estado) && estado && !entrada) return { entradaRequerida: true };
  if (entrada && salida && salida < entrada) return { salidaAnterior: true };
  return null;
}

@Component({
  selector: 'app-admin-asistencia-personal',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, UiButton, UiTable, Icon, Paginador, ConfirmDialog],
  templateUrl: './admin-asistencia-personal.html',
  styleUrl: './admin-asistencia-personal.css',
})
export class AdminAsistenciaPersonal implements OnInit {
  private readonly api = inject(AsistenciaPersonalService);
  private readonly personalApi = inject(PersonalAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly turnos = TURNOS_PERSONAL;
  readonly estados = ESTADOS_ASISTENCIA_PERSONAL;
  readonly tamanoPagina = 10;

  // ---------- Empleados (para filtro y formulario) ----------
  readonly empleados = signal<PersonalAdmin[]>([]);
  readonly empleadosForm = computed(() => {
    const editando = this.editando();
    return this.empleados().filter(e => e.estadoLaboral === 'ACTIVO' || e.id === editando?.personalId);
  });

  // ---------- Listado ----------
  readonly asistencias = signal<AsistenciaPersonal[]>([]);
  readonly cargando = signal(false);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly error = signal('');
  readonly exito = signal('');

  filtros: FiltrosAsistenciaPersonal = this.filtrosIniciales();
  private readonly cargar$ = new Subject<number>();
  private temporizadorExito: ReturnType<typeof setTimeout> | undefined;

  get hayFiltros(): boolean {
    const f = this.filtros;
    return !!(f.personalId || f.desde || f.hasta || f.turno || f.estado);
  }
  get rangoInvalido(): boolean {
    return !!(this.filtros.desde && this.filtros.hasta && this.filtros.desde > this.filtros.hasta);
  }

  // ---------- Formulario ----------
  readonly modalForm = signal(false);
  readonly editando = signal<AsistenciaPersonal | null>(null);
  readonly guardando = signal(false);
  readonly errorModal = signal('');
  readonly form = this.fb.nonNullable.group(
    {
      personalId: ['', Validators.required],
      fecha: ['', Validators.required],
      turno: ['', Validators.required],
      estado: ['', Validators.required],
      horaEntrada: [''],
      horaSalida: [''],
      observaciones: ['', Validators.maxLength(500)],
    },
    { validators: [horasValidas] },
  );

  get sinHoras(): boolean { return sinHorasEstado(this.form.controls.estado.value); }

  // ---------- Eliminar ----------
  readonly pendienteEliminar = signal<AsistenciaPersonal | null>(null);
  readonly eliminando = signal(false);

  ngOnInit(): void {
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
        // Si la última página quedó vacía (p. ej. tras eliminar), retrocede una.
        if (r.content.length === 0 && r.number > 0) {
          this.cargar$.next(r.number - 1);
          return;
        }
        this.asistencias.set(r.content);
        this.pagina.set(r.number);
        this.totalPaginas.set(r.totalPages);
        this.totalElementos.set(r.totalElements);
        this.cargando.set(false);
      });

    // Ausencia / permiso: se bloquean y vacían las horas.
    this.form.controls.estado.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.ajustarHoras());

    this.personalApi.todos().subscribe({
      next: lista => this.empleados.set(
        [...lista].sort((a, b) => `${a.apellidos} ${a.nombres}`.localeCompare(`${b.apellidos} ${b.nombres}`, 'es')),
      ),
      error: (e: HttpErrorResponse) => this.error.set(leerErrorApi(e).mensaje),
    });

    this.cargar$.next(0);
  }

  // =========================== FILTROS Y PAGINACIÓN ===========================
  aplicarFiltros(): void {
    if (this.rangoInvalido) {
      this.error.set('La fecha "Desde" no puede ser posterior a "Hasta".');
      return;
    }
    this.cargar$.next(0);
  }

  irAPagina(pagina: number): void { this.cargar$.next(pagina); }

  filtrarHoy(): void {
    const hoy = this.hoy();
    this.filtros = { ...this.filtros, desde: hoy, hasta: hoy };
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtros = this.filtrosIniciales();
    this.cargar$.next(0);
  }

  // =========================== REGISTRAR / EDITAR ===========================
  abrirNuevo(): void {
    this.editando.set(null);
    this.form.reset({
      personalId: this.filtros.personalId, fecha: this.hoy(), turno: '', estado: '',
      horaEntrada: '', horaSalida: '', observaciones: '',
    });
    this.ajustarHoras();
    this.errorModal.set('');
    this.modalForm.set(true);
  }

  abrirEditar(a: AsistenciaPersonal): void {
    this.editando.set(a);
    this.form.reset({
      personalId: String(a.personalId),
      fecha: a.fecha,
      turno: a.turno,
      estado: a.estado,
      horaEntrada: a.horaEntrada?.slice(0, 5) ?? '',
      horaSalida: a.horaSalida?.slice(0, 5) ?? '',
      observaciones: a.observaciones ?? '',
    });
    this.ajustarHoras();
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
    const sinHoras = sinHorasEstado(v.estado);
    const cuerpo: GuardarAsistenciaPersonal = {
      personalId: Number(v.personalId),
      fecha: v.fecha,
      turno: v.turno as TurnoPersonal,
      estado: v.estado as EstadoAsistenciaPersonal,
      horaEntrada: sinHoras ? null : v.horaEntrada || null,
      horaSalida: sinHoras ? null : v.horaSalida || null,
      observaciones: v.observaciones.trim() || null,
    };

    const editando = this.editando();
    this.guardando.set(true);
    this.errorModal.set('');
    const peticion = editando ? this.api.editar(editando.id, cuerpo) : this.api.crear(cuerpo);

    peticion.subscribe({
      next: a => {
        this.guardando.set(false);
        this.modalForm.set(false);
        this.mostrarExito(
          `Asistencia de ${a.nombreCompleto} (${this.fecha(a.fecha)}) ${editando ? 'actualizada' : 'registrada'} correctamente.`);
        this.cargar$.next(editando ? this.pagina() : 0);
      },
      error: (e: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorModal.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== ELIMINAR ===========================
  pedirEliminar(a: AsistenciaPersonal): void { this.pendienteEliminar.set(a); }
  cancelarEliminar(): void { if (!this.eliminando()) this.pendienteEliminar.set(null); }

  confirmarEliminar(): void {
    const a = this.pendienteEliminar();
    if (!a) return;
    this.eliminando.set(true);
    this.api.eliminar(a.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.pendienteEliminar.set(null);
        this.mostrarExito('Registro de asistencia eliminado.');
        this.cargar$.next(this.pagina());
      },
      error: (e: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.pendienteEliminar.set(null);
        this.error.set(leerErrorApi(e).mensaje);
      },
    });
  }

  // =========================== ETIQUETAS Y MENSAJES ===========================
  etiquetaTurno(v: string): string { return this.turnos.find(t => t.valor === v)?.etiqueta ?? v; }
  etiquetaEstado(v: string): string { return this.estados.find(e => e.valor === v)?.etiqueta ?? v; }
  etiquetaCargo(v: string): string { return CARGOS_PERSONAL.find(c => c.valor === v)?.etiqueta ?? v; }
  nombreEmpleado(e: PersonalAdmin): string { return `${e.apellidos} ${e.nombres} · ${this.etiquetaCargo(e.cargo)}`; }
  fecha(v: string): string { return fechaMedia(v); }
  hora(v: string | null): string { return v ? v.slice(0, 5) : '—'; }

  claseEstado(e: EstadoAsistenciaPersonal): string {
    switch (e) {
      case 'PRESENTE': return 'badge badge-success';
      case 'RETRASO': return 'badge badge-warning';
      case 'AUSENTE': return 'badge badge-danger';
      default: return 'badge badge-info';
    }
  }

  mensaje(campo: CampoAsistencia): string {
    const c = this.form.controls[campo];
    if (!c.touched || !c.errors) return '';
    if (c.errors['required']) return 'Este campo es obligatorio';
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres`;
    return 'Valor no válido';
  }

  mensajeHoras(): string {
    const e = this.form.errors;
    if (!e || !this.form.touched) return '';
    if (e['entradaRequerida']) return 'La hora de entrada es obligatoria para este estado';
    if (e['salidaAnterior']) return 'La hora de salida no puede ser anterior a la de entrada';
    return '';
  }

  // =========================== INTERNOS ===========================
  private ajustarHoras(): void {
    const { horaEntrada, horaSalida, estado } = this.form.controls;
    if (sinHorasEstado(estado.value)) {
      horaEntrada.setValue('', { emitEvent: false });
      horaSalida.setValue('', { emitEvent: false });
      horaEntrada.disable({ emitEvent: false });
      horaSalida.disable({ emitEvent: false });
    } else {
      horaEntrada.enable({ emitEvent: false });
      horaSalida.enable({ emitEvent: false });
    }
    this.form.updateValueAndValidity({ emitEvent: false });
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

  private filtrosIniciales(): FiltrosAsistenciaPersonal {
    return { personalId: '', desde: '', hasta: '', turno: '', estado: '' };
  }
}