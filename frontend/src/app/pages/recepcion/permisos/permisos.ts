import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Paginador } from '../../../components/paginador/paginador';
import { PermisoAusencia } from '../../../models/permiso.models';
import { PermisoRecepcionService, TAMANO_PAGINA_PERMISOS } from '../../../services/permiso-recepcion.service';
import { leerErrorApi } from '../../../utils/api-error';
import { Alerta } from '../components/alerta';
import { DialogoConfirmacion } from '../components/dialogo-confirmacion';
import { Boton } from '../components/formulario';
import { PageHeader } from '../components/page-header';
import { TablaDatos, FilaTabla, CeldaTabla, Columna } from '../components/tabla-datos';

type Accion = { permiso: PermisoAusencia; tipo: 'aprobar' | 'rechazar' };

@Component({
  selector: 'app-permisos-recepcion',
  standalone: true,
  imports: [DatePipe, Paginador, PageHeader, Alerta, Boton, DialogoConfirmacion, TablaDatos, FilaTabla, CeldaTabla],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Finanzas / Permisos" titulo="Permisos"
                     subtitulo="Solicitudes de permiso de ausencia de los clientes" />

    @if (mensaje()) { <app-alerta tipo="exito">{{ mensaje() }}</app-alerta> }
    @if (error()) { <app-alerta>{{ error() }}</app-alerta> }

    <app-tabla-datos [columnas]="columnas" [vacia]="permisos().length === 0"
                     [mensajeVacio]="cargando() ? 'Cargando…' : 'No existen solicitudes.'">
      @for (p of permisos(); track p.id) {
        <tr app-fila>
          <td app-celda class="text-neutral-500">#{{ p.membresiaId }}</td>
          <td app-celda>{{ p.motivo }}</td>
          <td app-celda class="text-neutral-400">{{ p.fechaInicio | date:'dd/MM/yyyy' }}</td>
          <td app-celda class="text-neutral-400">{{ p.fechaFin | date:'dd/MM/yyyy' }}</td>
          <td app-celda>{{ p.diasAgregados }}</td>
          <td app-celda>
            <span class="px-2 py-1 text-[10px] tracking-widest uppercase border border-yellow-400/60 text-yellow-300">{{ p.estado }}</span>
          </td>
          <td app-celda class="text-right whitespace-nowrap">
            @if (p.estado === 'PENDIENTE') {
              <button type="button" appBoton="exito" class="mr-2" (click)="pedir(p, 'aprobar')">Aprobar</button>
              <button type="button" appBoton="peligro" (click)="pedir(p, 'rechazar')">Rechazar</button>
            }
          </td>
        </tr>
      }
    </app-tabla-datos>
    <app-paginador tema="oscuro" [pagina]="pagina()" [totalPaginas]="totalPaginas()"
                   [totalElementos]="total()" [tamano]="tamano" (cambiar)="cargar($event)" />

    @if (pendiente(); as a) {
      <app-dialogo-confirmacion
        [texto]="'¿Deseas ' + a.tipo + ' el permiso de la membresía #' + a.permiso.membresiaId + '?'"
        (confirmar)="confirmar()" (cancelar)="pendiente.set(null)" />
    }
  `
})
export class PermisosRecepcionComponent implements OnInit {
  private readonly api = inject(PermisoRecepcionService);
  readonly tamano = TAMANO_PAGINA_PERMISOS;

  columnas: Columna[] = [
    { titulo: 'Membresía' }, { titulo: 'Motivo' }, { titulo: 'Desde' }, { titulo: 'Hasta' },
    { titulo: 'Días' }, { titulo: 'Estado' }, { titulo: 'Acciones', derecha: true },
  ];

  readonly permisos = signal<PermisoAusencia[]>([]);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(1);
  readonly total = signal(0);
  readonly cargando = signal(true);
  readonly mensaje = signal('');
  readonly error = signal('');
  readonly pendiente = signal<Accion | null>(null);

  ngOnInit(): void { this.cargar(0); }

  cargar(p: number): void {
    this.cargando.set(true);
    this.api.listar(p).subscribe({
      next: d => {
        this.permisos.set(d.content); this.pagina.set(d.number);
        this.totalPaginas.set(d.totalPages); this.total.set(d.totalElements); this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => { this.error.set(leerErrorApi(e).mensaje); this.cargando.set(false); },
    });
  }

  pedir(permiso: PermisoAusencia, tipo: 'aprobar' | 'rechazar'): void { this.pendiente.set({ permiso, tipo }); }

  confirmar(): void {
    const a = this.pendiente(); if (!a) return;
    this.pendiente.set(null); this.mensaje.set(''); this.error.set('');
    const op = a.tipo === 'aprobar' ? this.api.aprobar(a.permiso.id) : this.api.rechazar(a.permiso.id);
    op.subscribe({
      next: () => { this.mensaje.set(a.tipo === 'aprobar' ? 'Permiso aprobado.' : 'Permiso rechazado.'); this.cargar(this.pagina()); },
      error: (e: HttpErrorResponse) => this.error.set(leerErrorApi(e).mensaje),
    });
  }
}