import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ResumenRecepcion } from '../../../models/recepcion.models';
import { MembresiaRecepcionService } from '../../../services/membresia-recepcion.service';
import { leerErrorApi } from '../../../utils/api-error';
import { AccesoCard } from '../components/acceso-card';
import { Alerta } from '../components/alerta';
import { KpiCard } from '../components/kpi-card';
import { Panel } from '../components/panel';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [DatePipe, DecimalPipe, KpiCard, AccesoCard, Alerta, Panel],
  host: { class: 'block' },
  template: `
    <header class="mb-10">
      <p class="text-[11px] tracking-[0.4em] text-yellow-400 uppercase mb-3">Gold's Gym / Panel</p>
      <h1 class="text-5xl font-black tracking-tight leading-none">
        Bienvenido,<br><span class="text-yellow-400">Recepción</span>
      </h1>
      <p class="text-neutral-400 mt-3">Resumen operativo del día.</p>
    </header>

    @if (error()) { <app-alerta>{{ error() }}</app-alerta> }

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      <app-kpi-card etiqueta="Clientes activos" grande>{{ resumen()?.clientesActivos ?? 0 }}</app-kpi-card>
      <app-kpi-card etiqueta="Asistencias hoy" grande>{{ resumen()?.asistenciasDeHoy ?? 0 }}</app-kpi-card>
      <app-kpi-card etiqueta="Membresías por vencer" grande>{{ resumen()?.membresiasPorVencer ?? 0 }}</app-kpi-card>
      <app-kpi-card etiqueta="Cobrado del mes" grande>Bs {{ (resumen()?.ingresosDelMes ?? 0) | number:'1.2-2' }}</app-kpi-card>
    </section>

    <section class="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-10">
      <app-panel titulo="Próximas a vencer" class="p-6">
        <ul class="space-y-3 text-sm">
          @for (m of resumen()?.proximasAVencer ?? []; track m.id) {
            <li class="flex justify-between gap-3">
              <span>{{ m.cliente }} <span class="text-neutral-500">· {{ m.plan }}</span></span>
              <span class="text-amber-300 whitespace-nowrap">{{ m.fechaFin | date:'dd/MM' }}</span>
            </li>
          } @empty { <li class="text-neutral-500">Ninguna en los próximos 7 días.</li> }
        </ul>
      </app-panel>

      <app-panel titulo="Clientes recientes" class="p-6">
        <ul class="space-y-3 text-sm">
          @for (c of resumen()?.clientesRecientes ?? []; track c.id) {
            <li class="flex justify-between gap-3">
              <span>{{ c.nombre }}</span>
              <span class="text-neutral-500 whitespace-nowrap">{{ c.fechaAlta | date:'dd/MM/yyyy' }}</span>
            </li>
          } @empty { <li class="text-neutral-500">Aún no hay registros.</li> }
        </ul>
      </app-panel>

      <app-panel titulo="Pagos recientes" class="p-6">
        <ul class="space-y-3 text-sm">
          @for (p of resumen()?.pagosRecientes ?? []; track p.id) {
            <li class="flex justify-between gap-3">
              <span>{{ p.cliente }} <span class="text-neutral-500">· {{ p.fechaPago | date:'dd/MM HH:mm' }}</span></span>
              <span class="text-yellow-400 whitespace-nowrap">Bs {{ p.monto | number:'1.2-2' }}</span>
            </li>
          } @empty { <li class="text-neutral-500">Aún no hay pagos.</li> }
        </ul>
      </app-panel>
    </section>

    <h2 class="text-[11px] tracking-[0.4em] text-yellow-400 uppercase mb-4">Accesos rápidos</h2>
    <section class="grid grid-cols-1 md:grid-cols-3 gap-5">
      @for (a of accesos; track a.ruta) {
        <app-acceso-card [ruta]="a.ruta" [titulo]="a.titulo" [detalle]="a.detalle" />
      }
    </section>
  `
})
export class InicioComponent implements OnInit {
  private readonly api = inject(MembresiaRecepcionService);
  readonly resumen = signal<ResumenRecepcion | null>(null);
  readonly error = signal('');

  accesos = [
    { ruta: '/recepcion/asistencias', titulo: 'Registrar asistencia', detalle: 'Entrada de clientes' },
    { ruta: '/recepcion/clientes', titulo: 'Nuevo cliente', detalle: 'Registrar y editar miembros del gym' },
    { ruta: '/recepcion/suscripciones', titulo: 'Suscripciones', detalle: 'Contratar y renovar membresías' },
  ];

  ngOnInit(): void {
    this.api.resumen().subscribe({
      next: r => this.resumen.set(r),
      error: e => this.error.set(leerErrorApi(e).mensaje)
    });
  }
}