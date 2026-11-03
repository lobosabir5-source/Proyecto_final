import { Component, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { PageHeader } from '../components/page-header';
import { PromocionCard } from '../components/promocion-card';
import { EstadoVacio } from '../components/estado-vacio';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [PageHeader, PromocionCard, EstadoVacio],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Beneficios / Promociones" titulo="Promociones vigentes" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      @for (p of srv.promociones(); track p.id) {
        <app-promocion-card [promocion]="p" />
      } @empty {
        <app-estado-vacio class="md:col-span-2 lg:col-span-3">
          No hay promociones vigentes en este momento.
        </app-estado-vacio>
      }
    </div>
  `
})
export class PromocionesComponent {
  protected readonly srv = inject(ClienteService);
}