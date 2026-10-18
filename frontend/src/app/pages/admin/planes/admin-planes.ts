import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButton } from '../../../components/ui-button/ui-button';
import { UiTable } from '../../../components/ui-table/ui-table';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';
import { Icon } from '../../../components/icon/icon';
import { GuardarPlan, Plan } from '../../../models/admin.models';
import { PlanAdminService } from '../../../services/plan-admin.service';
import { leerErrorApi } from '../../../utils/api-error';

const MAX_BENEFICIOS = 8;

@Component({
  selector: 'app-admin-planes',
  imports: [UiButton, UiTable, FormsModule, DecimalPipe, Icon, ConfirmDialog],
  templateUrl: './admin-planes.html',
  styleUrl: './admin-planes.css'
})
export class AdminPlanes implements OnInit {
  private readonly planService = inject(PlanAdminService);

  readonly maxBeneficios = MAX_BENEFICIOS;

  readonly planes = signal<Plan[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  readonly mostrarInactivos = signal(false);

  readonly planesVisibles = computed(() =>
    this.mostrarInactivos() ? this.planes() : this.planes().filter(plan => plan.activo)
  );

  // Modal de crear o editar
  readonly modalAbierto = signal(false);
  readonly editando = signal<Plan | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');
  readonly camposError = signal<Record<string, string>>({});
  formulario: GuardarPlan = this.formularioVacio();

  // Confirmación de desactivación desde la lista
  readonly planPendiente = signal<Plan | null>(null);
  readonly desactivando = signal(false);

  // Confirmación al guardar un plan marcado como inactivo desde la edición
  readonly confirmandoInactivo = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.planService.listar().subscribe({
      next: planes => {
        this.planes.set(planes);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(leerErrorApi(error).mensaje);
        this.cargando.set(false);
      }
    });
  }

  alternarInactivos(): void {
    this.mostrarInactivos.update(valor => !valor);
  }

  // ===================== Crear o editar =====================
  abrirCrear(): void {
    this.editando.set(null);
    this.formulario = this.formularioVacio();
    this.abrirModal();
  }

  abrirEditar(plan: Plan): void {
    this.editando.set(plan);
    // Se cargan TODOS los campos del plan: el backend reemplaza horario, beneficios,
    // destacado y orden en cada PUT, así que omitirlos los borraría.
    this.formulario = {
      nombre: plan.nombre,
      descripcion: plan.descripcion ?? '',
      duracionDias: plan.duracionDias,
      precio: plan.precio,
      horario: plan.horario ?? '',
      beneficios: [...(plan.beneficios ?? [])],
      destacado: plan.destacado ?? false,
      orden: plan.orden ?? 0,
      activo: plan.activo
    };
    this.abrirModal();
  }

  cerrarModal(): void {
    this.confirmandoInactivo.set(false);
    this.modalAbierto.set(false);
  }

  agregarBeneficio(): void {
    if (this.formulario.beneficios.length < MAX_BENEFICIOS) {
      this.formulario.beneficios.push('');
    }
  }

  quitarBeneficio(indice: number): void {
    this.formulario.beneficios.splice(indice, 1);
  }

  /** Error de un campo: primero los del servidor, luego los de validación local. */
  errorDe(campo: string): string {
    const servidor = this.camposError();
    if (campo === 'beneficios') {
      const clave = Object.keys(servidor).find(k => k.startsWith('beneficios'));
      return (clave ? servidor[clave] : '') || this.erroresLocales['beneficios'] || '';
    }
    return servidor[campo] || this.erroresLocales[campo] || '';
  }

  private erroresLocales: Record<string, string> = {};

  guardar(): void {
    this.errorFormulario.set('');
    this.camposError.set({});
    this.erroresLocales = this.validar();
    if (Object.keys(this.erroresLocales).length) {
      return;
    }

    // Si se está dejando inactivo un plan que estaba activo, se pide confirmación.
    const plan = this.editando();
    if (plan && plan.activo && !this.formulario.activo) {
      this.confirmandoInactivo.set(true);
      return;
    }
    this.enviar();
  }

  confirmarGuardadoInactivo(): void {
    this.confirmandoInactivo.set(false);
    this.enviar();
  }

  cancelarGuardadoInactivo(): void {
    this.confirmandoInactivo.set(false);
  }

  private enviar(): void {
    const plan = this.editando();
    const datos = this.normalizar();
    const peticion = plan
      ? this.planService.actualizar(plan.id, datos)
      : this.planService.crear(datos);

    this.guardando.set(true);

    peticion.subscribe({
      next: guardado => {
        if (plan && guardado.activo !== datos.activo) {
          this.reconciliarEstado(guardado, datos.activo);
          return;
        }
        this.finalizarGuardado(`Plan "${guardado.nombre}" ${plan ? 'actualizado' : 'creado'} correctamente.`);
      },
      error: (error: HttpErrorResponse) => {
        const detalle = leerErrorApi(error);
        const campos = { ...detalle.campos };
        if (error.status === 409 && !campos['nombre']) {
          campos['nombre'] = detalle.mensaje.toLowerCase().includes('nombre')
            ? detalle.mensaje
            : 'Ya existe un plan con ese nombre.';
        }
        this.errorFormulario.set(detalle.mensaje);
        this.camposError.set(campos);
        this.guardando.set(false);
      }
    });
  }

  /**
   * El backend actual no recibe "activo" en el PUT: solo puede desactivar (DELETE).
   * - Si se pidió inactivo y sigue activo → se llama a desactivar().
   * - Si se pidió activo y sigue inactivo → se avisa que el servidor aún no lo permite.
   */
  private reconciliarEstado(guardado: Plan, activoDeseado: boolean): void {
    if (!activoDeseado) {
      this.planService.desactivar(guardado.id).subscribe({
        next: () => this.finalizarGuardado(`Plan "${guardado.nombre}" actualizado y desactivado.`),
        error: (error: HttpErrorResponse) => {
          this.guardando.set(false);
          this.errorFormulario.set(
            `Los datos se guardaron, pero no se pudo desactivar el plan: ${leerErrorApi(error).mensaje}`
          );
          this.cargar();
        }
      });
      return;
    }

    this.finalizarGuardado(`Plan "${guardado.nombre}" actualizado.`);
    this.error.set('Los datos se guardaron, pero el servidor todavía no permite reactivar un plan inactivo.');
  }

  private finalizarGuardado(mensaje: string): void {
    this.guardando.set(false);
    this.modalAbierto.set(false);
    this.mostrarExito(mensaje);
    this.cargar();
  }

  // ===================== Desactivar desde la lista =====================
  pedirDesactivar(plan: Plan): void {
    this.planPendiente.set(plan);
  }

  cancelarDesactivar(): void {
    this.planPendiente.set(null);
  }

  confirmarDesactivar(): void {
    const plan = this.planPendiente();
    if (!plan) {
      return;
    }

    this.desactivando.set(true);
    this.planService.desactivar(plan.id).subscribe({
      next: () => {
        this.desactivando.set(false);
        this.planPendiente.set(null);
        this.mostrarExito(`Plan "${plan.nombre}" desactivado.`);
        this.cargar();
      },
      error: (error: HttpErrorResponse) => {
        this.desactivando.set(false);
        this.planPendiente.set(null);
        this.error.set(leerErrorApi(error).mensaje);
      }
    });
  }

  // ===================== Internos =====================
  /** Mismas reglas que GuardarPlanRequest del backend. */
  private validar(): Record<string, string> {
    const f = this.formulario;
    const errores: Record<string, string> = {};

    if (!f.nombre.trim()) errores['nombre'] = 'El nombre del plan es obligatorio';
    else if (f.nombre.trim().length > 80) errores['nombre'] = 'El nombre no puede superar 80 caracteres';

    if (f.descripcion.trim().length > 500) errores['descripcion'] = 'La descripción no puede superar 500 caracteres';

    if (f.duracionDias === null || f.duracionDias === undefined || `${f.duracionDias}` === '')
      errores['duracionDias'] = 'La duración es obligatoria';
    else if (!Number.isInteger(Number(f.duracionDias)) || Number(f.duracionDias) < 1)
      errores['duracionDias'] = 'La duración debe ser un número entero de al menos 1 día';

    if (f.precio === null || f.precio === undefined || `${f.precio}` === '') errores['precio'] = 'El precio es obligatorio';
    else if (Number(f.precio) < 0.01) errores['precio'] = 'El precio debe ser mayor a cero';
    else if (!/^\d{1,8}(\.\d{1,2})?$/.test(String(f.precio)))
      errores['precio'] = 'El precio admite hasta 8 enteros y 2 decimales';

    if (f.horario.trim().length > 200) errores['horario'] = 'El horario no puede superar 200 caracteres';

    const beneficios = f.beneficios.map(b => b.trim()).filter(Boolean);
    if (beneficios.length > MAX_BENEFICIOS) errores['beneficios'] = `Un plan admite hasta ${MAX_BENEFICIOS} beneficios`;
    else if (beneficios.some(b => b.length > 120)) errores['beneficios'] = 'Cada beneficio admite hasta 120 caracteres';

    const orden = Number(f.orden ?? 0);
    if (!Number.isInteger(orden) || orden < 0 || orden > 999) errores['orden'] = 'El orden debe ser un entero entre 0 y 999';

    return errores;
  }

  private normalizar(): GuardarPlan {
    const f = this.formulario;
    return {
      nombre: f.nombre.trim(),
      descripcion: f.descripcion.trim(),
      duracionDias: Number(f.duracionDias),
      precio: Number(f.precio),
      horario: f.horario.trim(),
      beneficios: f.beneficios.map(b => b.trim()).filter(Boolean),
      destacado: f.destacado,
      orden: Number(f.orden ?? 0),
      activo: this.editando() ? f.activo : true
    };
  }

  private abrirModal(): void {
    this.erroresLocales = {};
    this.errorFormulario.set('');
    this.camposError.set({});
    this.modalAbierto.set(true);
  }

  private mostrarExito(mensaje: string): void {
    this.exito.set(mensaje);
    setTimeout(() => this.exito.set(''), 4000);
  }

  private formularioVacio(): GuardarPlan {
    return {
      nombre: '',
      descripcion: '',
      duracionDias: 30,
      precio: null,
      horario: '',
      beneficios: [],
      destacado: false,
      orden: 0,
      activo: true
    };
  }
}