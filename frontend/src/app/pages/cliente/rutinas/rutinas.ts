import { Component, inject, signal } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { PageHeader } from '../components/page-header';
import { RutinaCard } from '../components/rutina-card';
import { EstadoVacio } from '../components/estado-vacio';
import { RutinaCalendario } from '../components/rutina-calendario';
import { RutinaForm } from '../components/rutina-form';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [PageHeader, RutinaCard, EstadoVacio, RutinaCalendario, RutinaForm],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Entrenamiento / Rutinas" titulo="Mis rutinas"
                     subtitulo="Tu calendario de entrenamiento y tus planes." />

    <div class="mb-6">
      <button type="button" (click)="mostrarForm.set(!mostrarForm())"
              [class]="mostrarForm()
                ? 'px-5 py-2 text-sm font-bold border transition bg-yellow-400 text-neutral-950 border-yellow-400'
                : 'px-5 py-2 text-sm font-bold border transition border-yellow-500/40 text-yellow-300 hover:bg-yellow-400/10'">
        + Crear mi rutina
      </button>
    </div>

    @if (mostrarForm()) {
      <app-rutina-form class="mb-6" (creada)="mostrarForm.set(false)" />
    }

    <app-rutina-calendario class="mb-8" [rutinas]="srv.rutinas()" [asistencias]="srv.asistencias()" />

    <section class="grid gap-5 lg:grid-cols-2">
      @for (r of srv.rutinas(); track r.id) {
        <app-rutina-card [rutina]="r" />
      } @empty {
        <app-estado-vacio class="lg:col-span-2">
          Aún no tienes una rutina. Crea una con el botón de arriba.
        </app-estado-vacio>
      }
    </section>
  `
})
export class RutinasComponent {
  protected readonly srv = inject(ClienteService);
  readonly mostrarForm = signal(false);
}