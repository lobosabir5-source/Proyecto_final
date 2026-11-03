import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { PageHeader } from '../components/page-header';
import { MembresiaCard } from '../components/membresia-card';
import { EstadoVacio } from '../components/estado-vacio';
import { CornerCard } from '../components/corner-card';

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  imports: [RouterLink, PageHeader, MembresiaCard, EstadoVacio, CornerCard],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Mi cuenta / Suscripción" titulo="Mis membresías" />

    <section class="grid gap-5 lg:grid-cols-2">
      @for (m of srv.membresias(); track m.id) {
        <app-membresia-card [membresia]="m" />
      } @empty {
        <app-estado-vacio class="lg:col-span-2">Aún no tienes membresías registradas.</app-estado-vacio>
      }
    </section>

    <app-corner-card class="mt-6 p-6">
      <p class="text-[10px] tracking-[0.3em] text-yellow-400/80 uppercase mb-3">¿Quieres cambiar de plan?</p>
      <p class="text-neutral-400 text-sm mb-4">Acércate a recepción para consultar renovaciones y promociones vigentes.</p>
      <a routerLink="/cliente/promociones"
         class="inline-block bg-yellow-400 text-black px-6 py-2.5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-yellow-300 transition">
        Ver promociones
      </a>
    </app-corner-card>
  `
})
export class SuscripcionComponent {
  protected readonly srv = inject(ClienteService);
}