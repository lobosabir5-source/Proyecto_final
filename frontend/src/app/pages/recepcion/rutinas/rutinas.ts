import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Paginador } from '../../../components/paginador/paginador';
import { ClienteRecepcion } from '../../../models/recepcion.models';
import { Rutina } from '../../../models/rutina.models';
import { ClienteRecepcionService } from '../../../services/cliente-recepcion.service';
import { RutinaRecepcionService, TAMANO_PAGINA_RUTINAS } from '../../../services/rutina-recepcion.service';
import { leerErrorApi } from '../../../utils/api-error';
import { Alerta } from '../components/alerta';
import { Dialogo } from '../components/dialogo';
import { DialogoConfirmacion } from '../components/dialogo-confirmacion';
import { EstadoVacio } from '../components/estado-vacio';
import { Boton, Campo, Entrada } from '../components/formulario';
import { PageHeader } from '../components/page-header';
import { Panel } from '../components/panel';

@Component({
  selector: 'app-rutinas-recepcion',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, Paginador, PageHeader, Alerta, Panel, Campo, Entrada, Boton,
            Dialogo, DialogoConfirmacion, EstadoVacio],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Recepción / Rutinas" titulo="Rutinas"
                     subtitulo="Asigna y administra las rutinas de entrenamiento de cada cliente" />

    @if (mensaje()) { <app-alerta tipo="exito">{{ mensaje() }}</app-alerta> }
    @if (error()) { <app-alerta>{{ error() }}</app-alerta> }

    <app-panel class="mb-6">
      <app-campo etiqueta="Buscar cliente por nombre" para="buscar">
        <div class="flex gap-2">
          <input id="buscar" appEntrada type="search" #q (keyup.enter)="buscar(q.value)" placeholder="Nombre" />
          <button type="button" appBoton="primario" (click)="buscar(q.value)">Buscar</button>
        </div>
      </app-campo>
      @if (resultados().length) {
        <ul class="mt-3 divide-y divide-white/5 border border-white/10">
          @for (c of resultados(); track c.id) {
            <li>
              <button type="button" (click)="elegir(c)" class="w-full px-3 py-2 text-left text-sm hover:bg-yellow-400/10">
                {{ c.nombre }} <span class="text-neutral-500">· {{ c.numeroDocumento ?? 'sin documento' }}</span>
              </button>
            </li>
          }
        </ul>
      }
    </app-panel>

    @if (cliente(); as c) {
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 class="text-[11px] tracking-[0.4em] text-yellow-400 uppercase">Rutinas de {{ c.nombre }}</h2>
        <button type="button" appBoton="primario" (click)="nueva()">+ Nueva rutina</button>
      </div>

      <div class="space-y-4">
        @for (r of rutinas(); track r.id) {
          <app-panel class="p-6">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 class="text-xl font-black">{{ r.nombre }}</h3>
                <p class="text-xs text-neutral-500">{{ r.fechaCreacion | date:'dd/MM/yyyy HH:mm' }} · {{ r.activa ? 'Activa' : 'Inactiva' }}</p>
              </div>
              <div class="flex gap-2">
                <button type="button" appBoton="acento" (click)="editar(r)">Editar</button>
                <button type="button" appBoton="peligro" (click)="porDesactivar.set(r)">Desactivar</button>
              </div>
            </div>
            <pre class="mt-4 whitespace-pre-wrap text-sm text-neutral-300 font-sans">{{ r.contenido }}</pre>
          </app-panel>
        } @empty {
          <app-estado-vacio>Este cliente no tiene rutinas.</app-estado-vacio>
        }
      </div>
      <app-paginador tema="oscuro" [pagina]="pagina()" [totalPaginas]="totalPaginas()"
                     [totalElementos]="total()" [tamano]="tamano" (cambiar)="cargar($event)" />
    }

    @if (formVisible()) {
      <app-dialogo [titulo]="editandoId() === null ? 'Nueva rutina' : 'Editar rutina'" ancho="max-w-xl"
                   (cerrar)="formVisible.set(false)">
        <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-4" novalidate>
          <app-campo etiqueta="Nombre" para="nombre"
                     [error]="form.controls.nombre.touched && form.controls.nombre.invalid ? 'El nombre es obligatorio.' : ''">
            <input id="nombre" appEntrada formControlName="nombre" maxlength="120" />
          </app-campo>
          <app-campo etiqueta="Contenido" para="contenido"
                     [error]="form.controls.contenido.touched && form.controls.contenido.invalid ? 'El contenido es obligatorio.' : ''">
            <textarea id="contenido" appEntrada rows="8" formControlName="contenido" maxlength="10000"></textarea>
          </app-campo>
          <div class="flex gap-3 pt-2">
            <button type="button" appBoton="secundario" class="flex-1" (click)="formVisible.set(false)">Cancelar</button>
            <button type="submit" appBoton="primario" class="flex-1" [disabled]="guardando()">
              {{ guardando() ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </app-dialogo>
    }

    @if (porDesactivar(); as r) {
      <app-dialogo-confirmacion [texto]="'¿Desactivar la rutina &quot;' + r.nombre + '&quot;?'"
                                (confirmar)="desactivar(r)" (cancelar)="porDesactivar.set(null)" />
    }
  `
})
export class RutinasRecepcionComponent {
  private readonly clientes = inject(ClienteRecepcionService);
  private readonly api = inject(RutinaRecepcionService);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly tamano = TAMANO_PAGINA_RUTINAS;

  readonly resultados = signal<ClienteRecepcion[]>([]);
  readonly cliente = signal<ClienteRecepcion | null>(null);
  readonly rutinas = signal<Rutina[]>([]);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(1);
  readonly total = signal(0);
  readonly formVisible = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly guardando = signal(false);
  readonly porDesactivar = signal<Rutina | null>(null);
  readonly mensaje = signal('');
  readonly error = signal('');

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    contenido: ['', [Validators.required, Validators.maxLength(10000)]],
  });

  buscar(texto: string): void {
    this.error.set('');
    this.clientes.listar({ nombre: texto, correo: '', telefono: '', documento: '', estado: 'true' }, 0).subscribe({
      next: d => this.resultados.set(d.content),
      error: (e: HttpErrorResponse) => this.error.set(leerErrorApi(e).mensaje),
    });
  }

  elegir(c: ClienteRecepcion): void { this.cliente.set(c); this.resultados.set([]); this.cargar(0); }

  cargar(p: number): void {
    const c = this.cliente(); if (!c) return;
    this.api.listarDeCliente(c.id, p).subscribe({
      next: d => { this.rutinas.set(d.content); this.pagina.set(d.number); this.totalPaginas.set(d.totalPages); this.total.set(d.totalElements); },
      error: (e: HttpErrorResponse) => this.error.set(leerErrorApi(e).mensaje),
    });
  }

  nueva(): void { this.form.reset({ nombre: '', contenido: '' }); this.editandoId.set(null); this.formVisible.set(true); }
  editar(r: Rutina): void { this.form.reset({ nombre: r.nombre, contenido: r.contenido }); this.editandoId.set(r.id); this.formVisible.set(true); }

  guardar(): void {
    const c = this.cliente();
    if (!c || this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue(); const id = this.editandoId();
    this.guardando.set(true); this.error.set(''); this.mensaje.set('');
    const op = id === null ? this.api.crear({ clienteId: c.id, nombre: v.nombre, contenido: v.contenido }) : this.api.actualizar(id, v);
    op.subscribe({
      next: () => { this.guardando.set(false); this.formVisible.set(false); this.mensaje.set(id === null ? 'Rutina creada correctamente.' : 'Rutina actualizada.'); this.cargar(this.pagina()); },
      error: (e: HttpErrorResponse) => { this.guardando.set(false); this.error.set(leerErrorApi(e).mensaje); },
    });
  }

  desactivar(r: Rutina): void {
    this.porDesactivar.set(null); this.error.set(''); this.mensaje.set('');
    this.api.desactivar(r.id).subscribe({
      next: () => { this.mensaje.set('Rutina desactivada.'); this.cargar(this.pagina()); },
      error: (e: HttpErrorResponse) => this.error.set(leerErrorApi(e).mensaje),
    });
  }
}