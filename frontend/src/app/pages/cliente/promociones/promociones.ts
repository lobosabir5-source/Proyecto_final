import { Component, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-promociones',
  standalone: true,
  templateUrl: './promociones.html'
})
export class PromocionesComponent {
  srv = inject(ClienteService);

  fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}