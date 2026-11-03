import { Component, computed, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { fechaConDia, horaCorta } from '../../../utils/fecha';
import { PageHeader } from '../components/page-header';
import { TablaDatos, FilaTabla, CeldaTabla, Columna } from '../components/tabla-datos';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [PageHeader, TablaDatos, FilaTabla, CeldaTabla],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Entrenamiento / Asistencias" titulo="Mis asistencias" />

    <app-tabla-datos [columnas]="columnas" [vacia]="lista().length === 0"
                     mensajeVacio="Todavía no tienes asistencias registradas.">
      @for (a of lista(); track a.id) {
        <tr app-fila>
          <td app-celda class="font-semibold">{{ dia(a.fecha) }}</td>
          <td app-celda class="text-neutral-400">{{ hora(a.horaEntrada) }}</td>
          <td app-celda class="text-neutral-400">{{ a.registradaPor }}</td>
        </tr>
      }
    </app-tabla-datos>
  `
})
export class AsistenciasComponent {
  private readonly srv = inject(ClienteService);

  columnas: Columna[] = [{ titulo: 'Fecha' }, { titulo: 'Entrada' }, { titulo: 'Registrada por' }];
  lista = computed(() => [...this.srv.asistencias()].sort((a, b) => b.horaEntrada.localeCompare(a.horaEntrada)));
  dia = fechaConDia;
  hora = horaCorta;
}