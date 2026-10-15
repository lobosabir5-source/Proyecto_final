import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.html'
})
export class InicioComponent {
  srv = inject(ClienteService);

  nombre = computed(() => this.srv.cliente().nombres);
  diasRestantes = computed(() => this.srv.diasRestantes());
  visitasMes = computed(() => this.srv.asistencias().length);
  totalPagado = computed(() =>
    this.srv.pagos().filter(p => p.estado === 1).reduce((a, p) => a + p.monto, 0)
  );
}