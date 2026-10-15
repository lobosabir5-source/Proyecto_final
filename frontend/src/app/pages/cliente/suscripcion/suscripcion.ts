import { Component, computed, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-suscripcion',
  standalone: true,
  templateUrl: './suscripcion.html'
})
export class SuscripcionComponent {
  srv = inject(ClienteService);
  diasRestantes = computed(() => this.srv.diasRestantes());

  fechaBonita(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}