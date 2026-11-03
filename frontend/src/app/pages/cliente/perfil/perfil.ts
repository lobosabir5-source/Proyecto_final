import { Component, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { PageHeader } from '../components/page-header';
import { PerfilCard } from '../components/perfil-card';
import { EstadoVacio } from '../components/estado-vacio';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [PageHeader, PerfilCard, EstadoVacio],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Mi cuenta / Perfil" titulo="Mi perfil" />

    @if (srv.cargando()) {
      <p class="text-neutral-400">Cargando tu perfil…</p>
    } @else if (srv.perfil(); as perfil) {
      <app-perfil-card [perfil]="perfil" />
    } @else {
      <app-estado-vacio class="max-w-3xl">No encontramos un perfil asociado a esta cuenta.</app-estado-vacio>
    }
  `
})
export class PerfilComponent {
  protected readonly srv = inject(ClienteService);
}