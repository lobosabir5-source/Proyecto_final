import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Paginador } from '../../../components/paginador/paginador';
import { Caja, MovimientoCaja, ResumenCaja } from '../../../models/caja.models';
import { CajaService } from '../../../services/caja.service';
import { leerErrorApi } from '../../../utils/api-error';
import { Alerta } from '../components/alerta';
import { DialogoConfirmacion } from '../components/dialogo-confirmacion';
import { Boton, Campo, Entrada } from '../components/formulario';
import { KpiCard } from '../components/kpi-card';
import { PageHeader } from '../components/page-header';
import { Panel } from '../components/panel';
import { TablaDatos, FilaTabla, CeldaTabla, Columna } from '../components/tabla-datos';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, Paginador, PageHeader, Alerta, Panel, KpiCard,
            Campo, Entrada, Boton, DialogoConfirmacion, TablaDatos, FilaTabla, CeldaTabla],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Finanzas / Caja" titulo="Caja"
                     subtitulo="Apertura, ingresos y egresos, arqueo y cierre" />

    @if (mensaje()) { <app-alerta tipo="exito">{{ mensaje() }}</app-alerta> }
    @if (error()) { <app-alerta>{{ error() }}</app-alerta> }
    @if (cargando()) { <p class="text-neutral-500">Cargando…</p> }

    @if (!cargando() && !caja()) {
      <app-panel titulo="No hay caja abierta" class="max-w-sm">
        <form [formGroup]="aperturaForm" (ngSubmit)="abrir()" class="space-y-4">
          <app-campo etiqueta="Monto inicial (Bs)" para="montoInicial"
                     [error]="aperturaForm.controls.montoInicial.touched && aperturaForm.controls.montoInicial.invalid ? 'Ingresa un monto válido (0 o mayor).' : ''">
            <input id="montoInicial" appEntrada type="number" step="0.01" min="0" formControlName="montoInicial" />
          </app-campo>
          <button type="submit" appBoton="primario" [disabled]="guardando()">Abrir caja</button>
        </form>
      </app-panel>
    }

    @if (caja(); as c) {
      <p class="text-sm text-neutral-500 mb-4">
        Caja #{{ c.id }} abierta por {{ c.abiertaPor }} el {{ c.fechaApertura | date:'dd/MM/yyyy HH:mm' }}
      </p>

      @if (resumen(); as r) {
        <section class="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <app-kpi-card etiqueta="Monto inicial">Bs {{ r.montoInicial | number:'1.2-2' }}</app-kpi-card>
          <app-kpi-card etiqueta="Ingresos efectivo">Bs {{ r.ingresosEfectivo | number:'1.2-2' }}</app-kpi-card>
          <app-kpi-card etiqueta="Ingresos QR">Bs {{ r.ingresosQr | number:'1.2-2' }}</app-kpi-card>
          <app-kpi-card etiqueta="Egresos efectivo">Bs {{ r.egresosEfectivo | number:'1.2-2' }}</app-kpi-card>
          <app-kpi-card etiqueta="Egresos QR">Bs {{ r.egresosQr | number:'1.2-2' }}</app-kpi-card>
          <app-kpi-card etiqueta="Efectivo esperado">Bs {{ r.efectivoEsperado | number:'1.2-2' }}</app-kpi-card>
        </section>
      }

      <app-panel titulo="Registrar movimiento" class="mb-6">
        <form [formGroup]="movForm" (ngSubmit)="registrarMovimiento()" class="grid gap-4 md:grid-cols-5 items-end">
          <app-campo etiqueta="Tipo" para="mov-tipo">
            <select id="mov-tipo" appEntrada formControlName="tipo">
              <option value="INGRESO">Ingreso</option><option value="EGRESO">Egreso</option>
            </select>
          </app-campo>
          <app-campo etiqueta="Método" para="mov-metodo">
            <select id="mov-metodo" appEntrada formControlName="metodo">
              <option value="EFECTIVO">Efectivo</option><option value="QR">QR</option>
            </select>
          </app-campo>
          <app-campo etiqueta="Monto" para="mov-monto">
            <input id="mov-monto" appEntrada type="number" step="0.01" min="0.01" formControlName="monto" />
          </app-campo>
          <app-campo etiqueta="Concepto" para="mov-concepto">
            <input id="mov-concepto" appEntrada formControlName="concepto" maxlength="150" />
          </app-campo>
          <button type="submit" appBoton="primario" [disabled]="guardando()">Registrar</button>
        </form>
      </app-panel>

      <app-tabla-datos [columnas]="columnas" [vacia]="movimientos().length === 0" mensajeVacio="No existen movimientos.">
        @for (m of movimientos(); track m.id) {
          <tr app-fila>
            <td app-celda class="text-neutral-400">{{ m.fecha | date:'dd/MM HH:mm' }}</td>
            <td app-celda>{{ m.tipo }}</td>
            <td app-celda class="text-neutral-400">{{ m.metodo }}</td>
            <td app-celda>{{ m.concepto }}</td>
            <td app-celda class="text-right text-yellow-300 font-semibold">Bs {{ m.monto | number:'1.2-2' }}</td>
            <td app-celda class="text-neutral-400">{{ m.usuario }}</td>
          </tr>
        }
      </app-tabla-datos>
      <app-paginador tema="oscuro" [pagina]="pagina()" [totalPaginas]="totalPaginas()"
                     [totalElementos]="totalMov()" [tamano]="10" (cambiar)="cargarMovimientos($event)" />

      <app-panel titulo="Arqueo y cierre de caja" class="mt-6">
        <form [formGroup]="cierreForm" (ngSubmit)="pedirCierre()" class="space-y-4 max-w-md">
          <app-campo etiqueta="Efectivo contado (Bs)" para="contado">
            <input id="contado" appEntrada type="number" step="0.01" min="0" formControlName="efectivoContado" />
          </app-campo>
          <app-campo etiqueta="Observaciones" para="obs">
            <textarea id="obs" appEntrada rows="2" formControlName="observaciones"></textarea>
          </app-campo>
          <button type="submit" appBoton="peligro" [disabled]="guardando()">Cerrar caja</button>
        </form>
      </app-panel>
    }

    @if (cierre(); as r) {
      <app-panel titulo="Resultado del cierre" class="mt-6">
        <p class="text-sm">
          Esperado: <strong>Bs {{ r.efectivoEsperado | number:'1.2-2' }}</strong> ·
          Contado: <strong>Bs {{ r.efectivoContado | number:'1.2-2' }}</strong> ·
          Diferencia: <strong class="text-yellow-300">Bs {{ r.diferencia | number:'1.2-2' }}</strong>
        </p>
      </app-panel>
    }

    @if (confirmando()) {
      <app-dialogo-confirmacion texto="¿Deseas cerrar la caja? Esta acción no se puede deshacer."
                                (confirmar)="cerrar()" (cancelar)="confirmando.set(false)" />
    }
  `
})
export class CajaComponent implements OnInit {
  private readonly api = inject(CajaService);
  private readonly fb = inject(FormBuilder).nonNullable;

  columnas: Columna[] = [
    { titulo: 'Fecha' }, { titulo: 'Tipo' }, { titulo: 'Método' }, { titulo: 'Concepto' },
    { titulo: 'Monto', derecha: true }, { titulo: 'Usuario' },
  ];

  readonly caja = signal<Caja | null>(null);
  readonly resumen = signal<ResumenCaja | null>(null);
  readonly cierre = signal<ResumenCaja | null>(null);
  readonly movimientos = signal<MovimientoCaja[]>([]);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(1);
  readonly totalMov = signal(0);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly confirmando = signal(false);
  readonly mensaje = signal('');
  readonly error = signal('');

  readonly aperturaForm = this.fb.group({ montoInicial: [0, [Validators.required, Validators.min(0)]] });
  readonly movForm = this.fb.group({
    tipo: ['INGRESO' as 'INGRESO' | 'EGRESO', Validators.required],
    metodo: ['EFECTIVO' as 'EFECTIVO' | 'QR', Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    concepto: ['', [Validators.required, Validators.maxLength(150)]],
  });
  readonly cierreForm = this.fb.group({
    efectivoContado: [0, [Validators.required, Validators.min(0)]],
    observaciones: [''],
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.api.actual().subscribe({
      next: c => { this.caja.set(c); this.cargando.set(false); this.refrescar(c.id); },
      error: (e: HttpErrorResponse) => {
        this.caja.set(null); this.cargando.set(false);
        if (e.status !== 404) this.error.set(leerErrorApi(e).mensaje);
      },
    });
  }

  private refrescar(id: number): void {
    this.api.resumen(id).subscribe(r => this.resumen.set(r));
    this.cargarMovimientos(0);
  }

  cargarMovimientos(p: number): void {
    const c = this.caja(); if (!c) return;
    this.api.movimientos(c.id, p).subscribe(d => {
      this.movimientos.set(d.content); this.pagina.set(d.number);
      this.totalPaginas.set(d.totalPages); this.totalMov.set(d.totalElements);
    });
  }

  abrir(): void {
    if (this.aperturaForm.invalid) { this.aperturaForm.markAllAsTouched(); return; }
    this.guardando.set(true); this.limpiar();
    this.api.abrir(this.aperturaForm.getRawValue().montoInicial).subscribe({
      next: () => { this.guardando.set(false); this.mensaje.set('Caja abierta correctamente.'); this.cierre.set(null); this.cargar(); },
      error: (e: HttpErrorResponse) => { this.guardando.set(false); this.error.set(leerErrorApi(e).mensaje); },
    });
  }

  registrarMovimiento(): void {
    const c = this.caja();
    if (!c || this.movForm.invalid) { this.movForm.markAllAsTouched(); return; }
    this.guardando.set(true); this.limpiar();
    this.api.registrarMovimiento(c.id, this.movForm.getRawValue()).subscribe({
      next: () => { this.guardando.set(false); this.mensaje.set('Movimiento registrado.'); this.movForm.patchValue({ monto: 0, concepto: '' }); this.refrescar(c.id); },
      error: (e: HttpErrorResponse) => { this.guardando.set(false); this.error.set(leerErrorApi(e).mensaje); },
    });
  }

  pedirCierre(): void {
    if (this.cierreForm.invalid) { this.cierreForm.markAllAsTouched(); return; }
    this.confirmando.set(true);
  }

  cerrar(): void {
    const c = this.caja(); if (!c) return;
    this.confirmando.set(false); this.guardando.set(true); this.limpiar();
    const v = this.cierreForm.getRawValue();
    this.api.cerrar(c.id, v.efectivoContado, v.observaciones.trim() || null).subscribe({
      next: r => { this.guardando.set(false); this.cierre.set(r); this.caja.set(null); this.resumen.set(null); this.mensaje.set('Caja cerrada correctamente.'); },
      error: (e: HttpErrorResponse) => { this.guardando.set(false); this.error.set(leerErrorApi(e).mensaje); },
    });
  }

  private limpiar(): void { this.mensaje.set(''); this.error.set(''); }
}