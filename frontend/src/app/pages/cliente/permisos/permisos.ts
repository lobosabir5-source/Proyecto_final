import { Component, computed, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-permisos',
  standalone: true,
  templateUrl: './permisos.html'
})
export class PermisosComponent {
  srv = inject(ClienteService);
  lista = computed(() => [...this.srv.permisos()].sort((a, b) => b.solicitadoEn.localeCompare(a.solicitadoEn)));

  fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-BO');
  }
}
