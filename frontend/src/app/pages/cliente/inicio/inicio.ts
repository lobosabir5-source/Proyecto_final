import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.html'
})
export class InicioComponent {
  srv = inject(ClienteService);
  private readonly auth = inject(AuthService);

  nombre = computed(() => this.auth.nombreVisible().split(/\s+/)[0] || '');
  diasRestantes = computed(() => this.srv.diasRestantes());
  visitasMes = computed(() => {
    const hoy = new Date();
    return this.srv.asistencias().filter(a => {
      const fecha = new Date(`${a.fecha}T00:00:00`);
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    }).length;
  });
  totalPagado = computed(() => this.srv.totalPagado());
}
