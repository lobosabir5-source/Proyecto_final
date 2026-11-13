import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PagoMembresia } from '../../../models/pago.models';
import { MembresiaRecepcionService } from '../../../services/membresia-recepcion.service';
import { PagoRecepcionService } from '../../../services/pago-recepcion.service';
import { KpiCard } from '../components/kpi-card';
import { PageHeader } from '../components/page-header';
import { TablaDatos, FilaTabla, CeldaTabla, Columna } from '../components/tabla-datos';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [PageHeader, KpiCard, TablaDatos, FilaTabla, CeldaTabla],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Finanzas / Pagos" titulo="Pagos" />

    <section class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      <app-kpi-card etiqueta="Total cobrado" grande>Bs {{ totalCobrado() }}</app-kpi-card>
      <app-kpi-card etiqueta="Pendiente" grande>Bs {{ totalPendiente() }}</app-kpi-card>
    </section>

    <app-tabla-datos [columnas]="columnas" [vacia]="pagos().length === 0" mensajeVacio="Aún no hay pagos registrados.">
      @for (p of pagos(); track p.id) {
        <tr app-fila>
          <td app-celda class="text-neutral-500">#{{ p.id }}</td>
          <td app-celda class="font-semibold">{{ p.cliente }}</td>
          <td app-celda class="text-neutral-400">{{ metodo(p.metodo) }}</td>
          <td app-celda class="text-neutral-400">{{ fecha(p.fechaPago) }}</td>
          <td app-celda class="text-right text-yellow-300 font-semibold">Bs {{ p.monto }}</td>
        </tr>
      }
    </app-tabla-datos>
  `
})
export class PagosComponent implements OnInit {
  private readonly membresiasApi = inject(MembresiaRecepcionService);
  private readonly pagosApi = inject(PagoRecepcionService);

  columnas: Columna[] = [
    { titulo: '#' }, { titulo: 'Cliente' }, { titulo: 'Método' }, { titulo: 'Fecha' }, { titulo: 'Monto', derecha: true },
  ];

  private lista = signal<PagoMembresia[]>([]);
  private saldos = signal<number[]>([]);

  pagos = computed(() =>
    [...this.lista()].sort((a, b) => b.fechaPago.localeCompare(a.fechaPago))
  );
  totalCobrado = computed(() =>
    this.lista().reduce((a, p) => a + Number(p.monto), 0)
  );
  totalPendiente = computed(() =>
    this.saldos().reduce((a, s) => a + Number(s), 0)
  );

  ngOnInit(): void {
    this.membresiasApi.listarTodas().subscribe(membresias => {
      this.saldos.set(membresias.map(m => m.saldo));
      if (!membresias.length) return;
      forkJoin(membresias.map(m => this.pagosApi.listarPorMembresia(m.id)))
        .subscribe(r => this.lista.set(r.flat()));
    });
  }

  metodo(m: string) {
    return { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' }[m] ?? '—';
  }

  fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-BO');
  }
}