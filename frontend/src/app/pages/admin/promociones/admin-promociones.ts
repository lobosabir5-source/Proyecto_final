import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';
import { Icon } from '../../../components/icon/icon';
import { Paginador } from '../../../components/paginador/paginador';
import { GuardarPromocion, Plan, Promocion } from '../../../models/admin.models';
import { PlanAdminService } from '../../../services/plan-admin.service';
import { PromocionAdminService, TAMANO_PAGINA_PROMOCIONES } from '../../../services/promocion-admin.service';
import { leerErrorApi } from '../../../utils/api-error';

type EstadoVigencia = 'VIGENTE' | 'PROGRAMADA' | 'VENCIDA' | 'INACTIVA';

const ETIQUETAS_VIGENCIA: Record<EstadoVigencia, { texto: string; clase: string }> = {
  VIGENTE: { texto: 'Vigente', clase: 'badge badge-success' },
  PROGRAMADA: { texto: 'Programada', clase: 'badge badge-info' },
  VENCIDA: { texto: 'Vencida', clase: 'badge badge-warning' },
  INACTIVA: { texto: 'Inactiva', clase: 'badge badge-muted' }
};

@Component({
  selector: 'app-admin-promociones',
  imports: [FormsModule, DecimalPipe, Icon, ConfirmDialog, Paginador],
  templateUrl: './admin-promociones.html',
  styleUrl: './admin-promociones.css'
})
export class AdminPromociones implements OnInit {
  private readonly promocionService = inject(PromocionAdminService);
  private readonly planService = inject(PlanAdminService);

  readonly tamanoPagina = TAMANO_PAGINA_PROMOCIONES;
  readonly hoy = this.fechaLocal();

  // ---- Listado paginado (backend, máx. 10 por página) ----
  readonly promociones = signal<Promocion[]>([]);
  readonly planes = signal<Plan[]>([]);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  // ---- Modal crear / editar ----
  readonly modalAbierto = signal(false);
  readonly editando = signal<Promocion | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');
  readonly camposError = signal<Record<string, string>>({});
  formulario: GuardarPromocion = this.formularioVacio();
  private erroresLocales: Record<string, string> = {};

  // ---- Desactivar ----
  readonly promocionPendiente = signal<Promocion | null>(null);
  readonly desactivando = signal(false);

  /** Planes activos; si se edita una promoción de un plan inactivo, ese plan también aparece. */
  readonly planesSeleccionables = computed(() => {
    const actual = this.editando()?.planId;
    return this.planes().filter(plan => plan.activo || plan.id === actual);
  });

  ngOnInit(): void {
    this.cargarPlanes();
    this.cargar(0);
  }

  // =========================== LISTADO ===========================
  cargar(pagina: number): void {
    this.cargando.set(true);
    this.error.set('');

    this.promocionService.listar(pagina).subscribe({
      next: respuesta => {
        this.promociones.set(respuesta.content);
        this.pagina.set(respuesta.number);
        this.totalPaginas.set(respuesta.totalPages);
        this.totalElementos.set(respuesta.totalElements);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(leerErrorApi(error).mensaje);
        this.cargando.set(false);
      }
    });
  }

  private cargarPlanes(): void {
    this.planService.listar().subscribe({
      next: planes => this.planes.set(planes),
      error: (error: HttpErrorResponse) =>
        this.error.set(`No se pudieron cargar los planes: ${leerErrorApi(error).mensaje}`)
    });
  }

  nombrePlan(planId: number | null): string {
    if (planId === null) {
      return 'Todos los planes';
    }
    return this.planes().find(plan => plan.id === planId)?.nombre ?? `Plan #${planId}`;
  }

  descuento(promocion: Promocion): string {
    return promocion.tipo === 'PORCENTAJE'
      ? `${promocion.valor} %`
      : `Bs ${Number(promocion.valor).toFixed(2)}`;
  }

  /** Estado de vigencia calculado con las fechas (YYYY-MM-DD se compara como texto). */
  estadoVigencia(promocion: Promocion): { texto: string; clase: string } {
    let estado: EstadoVigencia;
    if (!promocion.activo) estado = 'INACTIVA';
    else if (this.hoy < promocion.fechaInicio) estado = 'PROGRAMADA';
    else if (this.hoy > promocion.fechaFin) estado = 'VENCIDA';
    else estado = 'VIGENTE';
    return ETIQUETAS_VIGENCIA[estado];
  }

  fecha(iso: string): string {
    const [anio, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  // =========================== CREAR / EDITAR ===========================
  abrirCrear(): void {
    this.editando.set(null);
    this.formulario = this.formularioVacio();
    this.abrirModal();
  }

  abrirEditar(promocion: Promocion): void {
    this.editando.set(promocion);
    this.formulario = {
      nombre: promocion.nombre,
      tipo: promocion.tipo,
      valor: promocion.valor,
      fechaInicio: promocion.fechaInicio,
      fechaFin: promocion.fechaFin,
      planId: promocion.planId,
      activo: promocion.activo
    };
    this.abrirModal();
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  errorDe(campo: string): string {
    return this.camposError()[campo] || this.erroresLocales[campo] || '';
  }

  /** Texto de ayuda con el efecto del descuento sobre el plan elegido. */
  resumenDescuento(): string {
    const f = this.formulario;
    const valor = Number(f.valor);
    const plan = this.planes().find(p => p.id === f.planId);
    if (!plan || !valor || valor <= 0) {
      return '';
    }
    const descuento = f.tipo === 'PORCENTAJE' ? (plan.precio * Math.min(valor, 100)) / 100 : valor;
    const final = Math.max(plan.precio - descuento, 0);
    return `Plan ${plan.nombre}: de Bs ${plan.precio.toFixed(2)} a Bs ${final.toFixed(2)}.`;
  }

  guardar(): void {
    this.errorFormulario.set('');
    this.camposError.set({});
    this.erroresLocales = this.validar();
    if (Object.keys(this.erroresLocales).length) {
      return;
    }

    const promocion = this.editando();
    const datos: GuardarPromocion = {
      ...this.formulario,
      nombre: this.formulario.nombre.trim(),
      valor: Number(this.formulario.valor),
      planId: this.formulario.planId ?? null
    };
    const peticion = promocion
      ? this.promocionService.actualizar(promocion.id, datos)
      : this.promocionService.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: guardada => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.mostrarExito(`Promoción "${guardada.nombre}" ${promocion ? 'actualizada' : 'creada'} correctamente.`);
        this.cargar(promocion ? this.pagina() : 0);
      },
      error: (error: HttpErrorResponse) => {
        const detalle = leerErrorApi(error);
        this.errorFormulario.set(detalle.mensaje);
        this.camposError.set(detalle.campos);
        this.guardando.set(false);
      }
    });
  }

  // =========================== DESACTIVAR ===========================
  pedirDesactivar(promocion: Promocion): void {
    this.promocionPendiente.set(promocion);
  }

  cancelarDesactivar(): void {
    this.promocionPendiente.set(null);
  }

  confirmarDesactivar(): void {
    const promocion = this.promocionPendiente();
    if (!promocion) {
      return;
    }

    this.desactivando.set(true);
    this.promocionService.desactivar(promocion.id).subscribe({
      next: () => {
        this.desactivando.set(false);
        this.promocionPendiente.set(null);
        this.mostrarExito(`Promoción "${promocion.nombre}" desactivada.`);
        this.cargar(this.pagina());
      },
      error: (error: HttpErrorResponse) => {
        this.desactivando.set(false);
        this.promocionPendiente.set(null);
        this.error.set(leerErrorApi(error).mensaje);
      }
    });
  }

  // =========================== INTERNOS ===========================
  /** Mismas reglas que GuardarPromocionSolicitud + PromocionService del backend. */
  private validar(): Record<string, string> {
    const f = this.formulario;
    const errores: Record<string, string> = {};

    if (!f.nombre.trim()) errores['nombre'] = 'El nombre es obligatorio';
    else if (f.nombre.trim().length > 100) errores['nombre'] = 'El nombre no puede superar 100 caracteres';

    const valor = Number(f.valor);
    if (f.valor === null || `${f.valor}` === '') errores['valor'] = 'El valor del descuento es obligatorio';
    else if (!(valor >= 0.01)) errores['valor'] = 'El valor debe ser mayor a cero';
    else if (!/^\d{1,8}(\.\d{1,2})?$/.test(String(f.valor)))
      errores['valor'] = 'Admite hasta 8 enteros y 2 decimales';
    else if (f.tipo === 'PORCENTAJE' && valor > 100) errores['valor'] = 'El porcentaje no puede superar 100';

    if (!f.fechaInicio) errores['fechaInicio'] = 'La fecha de inicio es obligatoria';
    if (!f.fechaFin) errores['fechaFin'] = 'La fecha de finalización es obligatoria';

    if (f.fechaInicio && f.fechaFin) {
      if (f.fechaFin < f.fechaInicio) {
        errores['fechaFin'] = 'La fecha de finalización no puede ser anterior a la de inicio';
      } else if (!this.editando() && f.fechaFin < this.hoy) {
        errores['fechaFin'] = 'No se puede crear una promoción que ya terminó';
      }
    }

    return errores;
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

  private formularioVacio(): GuardarPromocion {
    return {
      nombre: '',
      tipo: 'PORCENTAJE',
      valor: null,
      fechaInicio: this.hoy,
      fechaFin: '',
      planId: null,
      activo: true
    };
  }

  /** Fecha local YYYY-MM-DD (toISOString usaría UTC y podría adelantar un día). */
  private fechaLocal(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}