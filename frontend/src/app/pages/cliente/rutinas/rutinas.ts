import { Component, computed, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  templateUrl: './rutinas.html'
})
export class RutinasComponent {
  srv = inject(ClienteService);
  lista = computed(() => this.srv.rutinas());

  fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
