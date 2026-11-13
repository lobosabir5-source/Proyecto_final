import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { InvestigacionService } from '../../../services/investigacion.service';
import { ColasRespuesta, EoqRespuesta } from '../../../models/investigacion.models';
import { leerErrorApi } from '../../../utils/api-error';

@Component({
  selector: 'app-admin-investigacion',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
<section class="space-y-6">
  <header>
    <h1 class="text-2xl font-bold text-slate-900">Investigación Operativa</h1>
    <p class="mt-1 text-sm text-slate-500">Introduce los parámetros, ejecuta el modelo y revisa los resultados</p>
  </header>

  <div class="flex gap-2" role="tablist">
    <button type="button" role="tab" [attr.aria-selected]="tab() === 'colas'" (click)="tab.set('colas')"
      [class]="tab() === 'colas' ? 'rounded-lg bg-yellow-400 px-4 py-2 font-semibold' : 'rounded-lg border border-slate-300 px-4 py-2'">Teoría de colas</button>
    <button type="button" role="tab" [attr.aria-selected]="tab() === 'eoq'" (click)="tab.set('eoq')"
      [class]="tab() === 'eoq' ? 'rounded-lg bg-yellow-400 px-4 py-2 font-semibold' : 'rounded-lg border border-slate-300 px-4 py-2'">Inventario (EOQ)</button>
  </div>

  @if (error()) { <div role="alert" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error() }}</div> }

  @if (tab() === 'colas') {
    <form [formGroup]="colasForm" (ngSubmit)="calcularColas()" class="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
      <label class="text-sm font-medium">Tasa de llegadas (λ)<input type="number" step="any" formControlName="tasaLlegadas" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label class="text-sm font-medium">Tasa de servicio (μ)<input type="number" step="any" formControlName="tasaServicio" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label class="text-sm font-medium">Servidores (s)<input type="number" formControlName="servidores" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label class="text-sm font-medium">Clientes en el sistema (n)<input type="number" formControlName="clientes" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label class="text-sm font-medium">Capacidad del sistema (opcional)<input type="number" formControlName="capacidadSistema" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <div class="flex items-end"><button type="submit" [disabled]="cargando()" class="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-slate-950 disabled:opacity-50">{{ cargando() ? 'Calculando...' : 'Ejecutar modelo' }}</button></div>
    </form>
    @if (colas(); as r) {
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="mb-3 font-semibold">Resultados: {{ r.modelo }}</h2>
        <dl class="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <div><dt class="text-slate-500">Utilización (ρ)</dt><dd class="font-semibold">{{ r.utilizacion | number:'1.0-4' }}</dd></div>
          <div><dt class="text-slate-500">P(sistema vacío)</dt><dd class="font-semibold">{{ r.probabilidadSistemaVacio | number:'1.0-4' }}</dd></div>
          <div><dt class="text-slate-500">P(esperar)</dt><dd class="font-semibold">{{ r.probabilidadEsperar | number:'1.0-4' }}</dd></div>
          <div><dt class="text-slate-500">P(n clientes)</dt><dd class="font-semibold">{{ r.probabilidadNClientes | number:'1.0-4' }}</dd></div>
          <div><dt class="text-slate-500">Clientes en cola (Lq)</dt><dd class="font-semibold">{{ r.clientesPromedioCola | number:'1.0-4' }}</dd></div>
          <div><dt class="text-slate-500">Clientes en sistema (L)</dt><dd class="font-semibold">{{ r.clientesPromedioSistema | number:'1.0-4' }}</dd></div>
          <div><dt class="text-slate-500">Tiempo en cola (Wq, min)</dt><dd class="font-semibold">{{ r.tiempoPromedioColaMinutos | number:'1.0-2' }}</dd></div>
          <div><dt class="text-slate-500">Tiempo en sistema (W, min)</dt><dd class="font-semibold">{{ r.tiempoPromedioSistemaMinutos | number:'1.0-2' }}</dd></div>
          @if (r.probabilidadBloqueo !== null) {
            <div><dt class="text-slate-500">P(bloqueo)</dt><dd class="font-semibold">{{ r.probabilidadBloqueo | number:'1.0-4' }}</dd></div>
          }
        </dl>
      </div>
    }
  } @else {
    <form [formGroup]="eoqForm" (ngSubmit)="calcularEoq()" class="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
      <label class="text-sm font-medium">Demanda anual (D)<input type="number" step="any" formControlName="demandaAnual" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label class="text-sm font-medium">Costo por pedido (S)<input type="number" step="any" formControlName="costoPorPedido" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <label class="text-sm font-medium">Costo de mantenimiento anual (H)<input type="number" step="any" formControlName="costoMantenimientoAnual" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      <div><button type="submit" [disabled]="cargando()" class="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-slate-950 disabled:opacity-50">{{ cargando() ? 'Calculando...' : 'Ejecutar modelo' }}</button></div>
    </form>
    @if (eoq(); as r) {
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="mb-3 font-semibold">Resultados EOQ</h2>
        <dl class="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <div><dt class="text-slate-500">Cantidad económica (Q*)</dt><dd class="font-semibold">{{ r.cantidadEconomica | number:'1.0-2' }}</dd></div>
          <div><dt class="text-slate-500">Unidades sugeridas</dt><dd class="font-semibold">{{ r.cantidadSugeridaUnidades }}</dd></div>
          <div><dt class="text-slate-500">Pedidos por año</dt><dd class="font-semibold">{{ r.pedidosPorAnio | number:'1.0-2' }}</dd></div>
          <div><dt class="text-slate-500">Días entre pedidos</dt><dd class="font-semibold">{{ r.diasEntrePedidos | number:'1.0-2' }}</dd></div>
          <div><dt class="text-slate-500">Costo anual de pedidos</dt><dd class="font-semibold">{{ r.costoAnualPedidos | number:'1.2-2' }}</dd></div>
          <div><dt class="text-slate-500">Costo anual de mantenimiento</dt><dd class="font-semibold">{{ r.costoAnualMantenimiento | number:'1.2-2' }}</dd></div>
          <div><dt class="text-slate-500">Costo anual relevante</dt><dd class="font-semibold">{{ r.costoAnualRelevante | number:'1.2-2' }}</dd></div>
        </dl>
      </div>
    }
  }
</section>`,
})
export class AdminInvestigacion {
  private readonly api = inject(InvestigacionService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly tab = signal<'colas' | 'eoq'>('colas');
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly colas = signal<ColasRespuesta | null>(null);
  readonly eoq = signal<EoqRespuesta | null>(null);

  readonly colasForm = this.fb.group({
    tasaLlegadas: [0, [Validators.required, Validators.min(0.0001)]],
    tasaServicio: [0, [Validators.required, Validators.min(0.0001)]],
    servidores: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
    clientes: [0, [Validators.required, Validators.min(0), Validators.max(100000)]],
    capacidadSistema: [null as number | null],
  });
  readonly eoqForm = this.fb.group({
    demandaAnual: [0, [Validators.required, Validators.min(0.0001)]],
    costoPorPedido: [0, [Validators.required, Validators.min(0.0001)]],
    costoMantenimientoAnual: [0, [Validators.required, Validators.min(0.0001)]],
  });

  calcularColas(): void {
    if (this.colasForm.invalid) { this.colasForm.markAllAsTouched(); this.error.set('Revisa los parámetros: deben ser positivos y estar en rango.'); return; }
    this.ejecutar(this.api.calcularColas(this.colasForm.getRawValue()), r => this.colas.set(r));
  }
  calcularEoq(): void {
    if (this.eoqForm.invalid) { this.eoqForm.markAllAsTouched(); this.error.set('Revisa los parámetros: deben ser mayores a cero.'); return; }
    this.ejecutar(this.api.calcularEoq(this.eoqForm.getRawValue()), r => this.eoq.set(r));
  }

  private ejecutar<T>(obs: import('rxjs').Observable<T>, ok: (r: T) => void): void {
    this.cargando.set(true); this.error.set('');
    obs.subscribe({
      next: r => { ok(r); this.cargando.set(false); },
      error: (e: HttpErrorResponse) => { this.cargando.set(false); this.error.set(leerErrorApi(e).mensaje); },
    });
  }
}