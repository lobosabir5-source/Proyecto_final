import { Component, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.html'
})
export class PerfilComponent {
  readonly srv = inject(ClienteService);
  readonly auth = inject(AuthService);

  iniciales(): string {
    const nombre = this.srv.perfil()?.nombre || this.auth.nombreVisible();
    return nombre.split(/\s+/).slice(0, 2).map(parte => parte.charAt(0)).join('').toUpperCase();
  }

  fecha(iso: string): string {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('es-BO', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}
