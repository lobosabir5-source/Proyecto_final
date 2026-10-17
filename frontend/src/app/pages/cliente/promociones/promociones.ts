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
    return new Date(`${iso}T00:00:00`).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
