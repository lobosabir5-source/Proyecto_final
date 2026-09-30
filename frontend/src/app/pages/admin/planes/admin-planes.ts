import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';
import { Icon } from '../../../components/icon/icon';
import { GuardarPlan, Plan } from '../../../models/admin.models';
import { PlanAdminService } from '../../../services/plan-admin.service';
import { leerErrorApi } from '../../../utils/api-error';

@Component({
  selector: 'app-admin-planes',
  imports: [FormsModule, DecimalPipe, Icon, ConfirmDialog],
  templateUrl: './admin-planes.html',
  styleUrl: './admin-planes.css'
})
export class AdminPlanes implements OnInit {
  private readonly planService = inject(PlanAdminService);

  readonly planes = signal<Plan[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  readonly mostrarInactivos = signal(false);

  readonly planesVisibles = computed(() =>
    this.mostrarInactivos() ? this.planes() : this.planes().filter(plan => plan.activo)
  );

  // Modal de crear / editar
  readonly modalAbierto = signal(false);
  readonly editando = signal<Plan | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');
  readonly camposError = signal<Record<string, string>>({});
  formulario: GuardarPlan = this.formularioVacio();

  // Confirmación de desactivación
  readonly planPendiente = signal<Plan | null>(null);
  readonly desactivando = signal(false);

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

  // ---------- Crear / editar ----------
  abrirCrear(): void {
    this.editando.set(null);
    this.formulario = this.formularioVacio();
    this.abrirModal();
  }

  abrirEditar(plan: Plan): void {
    this.editando.set(plan);
    this.formulario = {
      nombre: plan.nombre,
      descripcion: plan.descripcion ?? '',
      duracionDias: plan.duracionDias,
      precio: plan.precio
    };
    this.abrirModal();
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  guardar(): void {
    const plan = this.editando();
    const peticion = plan
      ? this.planService.actualizar(plan.id, this.formulario)
      : this.planService.crear(this.formulario);

    this.guardando.set(true);
    this.errorFormulario.set('');
    this.camposError.set({});

    peticion.subscribe({
      next: guardado => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.mostrarExito(`Plan "${guardado.nombre}" ${plan ? 'actualizado' : 'creado'} correctamente.`);
        this.cargar();
      },
      error: (error: HttpErrorResponse) => {
        const detalle = leerErrorApi(error);
        this.errorFormulario.set(detalle.mensaje);
        this.camposError.set(detalle.campos);
        this.guardando.set(false);
      }
    });
  }

  // ---------- Desactivar ----------
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

  private abrirModal(): void {
    this.errorFormulario.set('');
    this.camposError.set({});
    this.modalAbierto.set(true);
  }

  private mostrarExito(mensaje: string): void {
    this.exito.set(mensaje);
    setTimeout(() => this.exito.set(''), 4000);
  }

  private formularioVacio(): GuardarPlan {
    return { nombre: '', descripcion: '', duracionDias: 30, precio: null };
  }
}