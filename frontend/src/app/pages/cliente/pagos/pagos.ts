import { Component, computed, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { fechaCorta } from '../../../utils/fecha';
import { PageHeader } from '../components/page-header';
import { KpiCard } from '../components/kpi-card';
import { TablaDatos, FilaTabla, CeldaTabla, Columna } from '../components/tabla-datos';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [PageHeader, KpiCard, TablaDatos, FilaTabla, CeldaTabla],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Pagos / Historial" titulo="Mis pagos" />

    <app-kpi-card etiqueta="Total pagado" grande class="mb-8 md:w-80">Bs {{ srv.totalPagado() }}</app-kpi-card>

    <app-tabla-datos [columnas]="columnas" [vacia]="lista().length === 0"
                     mensajeVacio="Todavía no tienes pagos registrados.">
      @for (p of lista(); track p.id) {
        <tr app-fila>
          <td app-celda class="font-semibold">{{ fecha(p.fechaPago) }}</td>
          <td app-celda class="text-neutral-400">{{ srv.metodoPago(p.metodo) }}</td>
          <td app-celda class="text-right text-yellow-300 font-semibold">Bs {{ p.monto }}</td>
          <td app-celda class="text-right">
            <span class="px-2 py-1 text-[10px] tracking-widest uppercase border border-yellow-400/60 text-yellow-300">Registrado</span>
          </td>
        </tr>
      }
    </app-tabla-datos>
  `
})
export class PagosComponent {
  protected readonly srv = inject(ClienteService);

  columnas: Columna[] = [
    { titulo: 'Fecha' }, { titulo: 'Método' },
    { titulo: 'Monto', derecha: true }, { titulo: 'Estado', derecha: true },
  ];
  lista = computed(() => [...this.srv.pagos()].sort((a, b) => b.fechaPago.localeCompare(a.fechaPago)));
  fecha = fechaCorta;
}