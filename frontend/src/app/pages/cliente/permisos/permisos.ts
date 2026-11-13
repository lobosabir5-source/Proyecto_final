import { Component, computed, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { fechaCorta } from '../../../utils/fecha';
import { PageHeader } from '../components/page-header';
import { TablaDatos, FilaTabla, CeldaTabla, Columna } from '../components/tabla-datos';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [PageHeader, TablaDatos, FilaTabla, CeldaTabla],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Trámites / Permisos" titulo="Mis permisos de ausencia"
                     subtitulo="Aquí aparecen los permisos registrados para tus membresías." />

    <app-tabla-datos [columnas]="columnas" [vacia]="lista().length === 0"
                     mensajeVacio="No tienes permisos registrados.">
      @for (p of lista(); track p.id) {
        <tr app-fila>
          <td app-celda class="text-neutral-400">{{ fecha(p.solicitadoEn) }}</td>
          <td app-celda class="text-neutral-400">{{ p.fechaInicio ? fecha(p.fechaInicio) : '—' }} - {{ p.fechaFin ? fecha(p.fechaFin) : '—' }}</td>
          <td app-celda class="font-semibold">{{ p.motivo }}</td>
          <td app-celda class="text-neutral-300">{{ p.estado }}</td>
          <td app-celda class="text-right text-yellow-300">+{{ p.diasAgregados ?? 0 }}</td>
        </tr>
      }
    </app-tabla-datos>
  `
})
export class PermisosComponent {
  private readonly srv = inject(ClienteService);

  columnas: Columna[] = [
    { titulo: 'Solicitado' }, { titulo: 'Periodo' }, { titulo: 'Motivo' },
    { titulo: 'Estado' }, { titulo: 'Días agregados', derecha: true },
  ];
  lista = computed(() => [...this.srv.permisos()].sort((a, b) => b.solicitadoEn.localeCompare(a.solicitadoEn)));
  fecha = fechaCorta;
}