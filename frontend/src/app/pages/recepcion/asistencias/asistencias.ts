import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenciaRegistrada, ClienteBusqueda } from '../../../models/asistencia.models';
import { AsistenciaRecepcionService } from '../../../services/asistencia-recepcion.service';
import { ClienteRecepcionService } from '../../../services/cliente-recepcion.service';
import { leerErrorApi } from '../../../utils/api-error';
import { Boton, Entrada } from '../components/formulario';
import { PageHeader } from '../components/page-header';
import { Panel } from '../components/panel';
import { TablaDatos, FilaTabla, CeldaTabla, Columna } from '../components/tabla-datos';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [FormsModule, PageHeader, Panel, Entrada, Boton, TablaDatos, FilaTabla, CeldaTabla],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Recepción / Asistencias" titulo="Asistencias de hoy" />

    <app-panel titulo="Registrar entrada" class="mb-8">
      <div class="flex gap-3">
        <input appEntrada class="flex-1" [(ngModel)]="busqueda" (keyup.enter)="entrar()"
               placeholder="Usuario, correo o nombre del cliente" aria-label="Buscar cliente" />
        <button type="button" appBoton="primario" (click)="entrar()">Registrar</button>
      </div>
    </app-panel>

    <app-tabla-datos [columnas]="columnas" [vacia]="asistencias().length === 0" mensajeVacio="Aún no hay asistencias registradas.">
      @for (a of asistencias(); track a.id) {
        <tr app-fila>
          <td app-celda class="font-semibold">{{ a.cliente }}</td>
          <td app-celda class="text-neutral-400">{{ hora(a.horaEntrada) }}</td>
          <td app-celda class="text-neutral-400">{{ a.registradaPor }}</td>
        </tr>
      }
    </app-tabla-datos>
  `
})
export class AsistenciasComponent implements OnInit {
  private readonly asistenciasApi = inject(AsistenciaRecepcionService);
  private readonly clientesApi = inject(ClienteRecepcionService);

  columnas: Columna[] = [{ titulo: 'Cliente' }, { titulo: 'Entrada' }, { titulo: 'Registrada por' }];

  busqueda = signal('');
  clientes = signal<ClienteBusqueda[]>([]);
  asistencias = signal<AsistenciaRegistrada[]>([]);

  ngOnInit(): void {
    this.clientesApi.listarParaBusqueda().subscribe(c => this.clientes.set(c));
    this.cargar();
  }

  cargar(): void {
    this.asistenciasApi.listar().subscribe(a => this.asistencias.set(a));
  }

  hora(iso?: string) {
    return iso ? new Date(iso).toLocaleTimeString('es-BO',
      { hour: '2-digit', minute: '2-digit' }) : '—';
  }

  entrar(): void {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return;

    const exactos = this.clientes().filter(c =>
      c.usuario.toLowerCase() === q || c.correo.toLowerCase() === q);
    const coincidencias = exactos.length
      ? exactos
      : this.clientes().filter(c => c.nombre.toLowerCase().includes(q));

    if (coincidencias.length === 0) { alert('Cliente no encontrado'); return; }
    if (coincidencias.length > 1) { alert('Hay varios clientes con ese dato, sé más específico'); return; }

    this.asistenciasApi.registrar(coincidencias[0].id).subscribe({
      next: () => { this.busqueda.set(''); this.cargar(); },
      error: (e: HttpErrorResponse) => alert(leerErrorApi(e).mensaje)
    });
  }
}