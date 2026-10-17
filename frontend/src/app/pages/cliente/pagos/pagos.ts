import { Component, computed, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  templateUrl: './pagos.html'
})
export class PagosComponent {
  srv = inject(ClienteService);
  lista = computed(() => [...this.srv.pagos()].sort((a, b) => b.fechaPago.localeCompare(a.fechaPago)));
  total = computed(() => this.srv.totalPagado());

  fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-BO');
  }
}
