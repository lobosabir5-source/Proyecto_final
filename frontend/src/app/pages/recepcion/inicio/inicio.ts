import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecepcionService } from '../../../services/recepcion.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.html'
})
export class InicioComponent {
  private srv = inject(RecepcionService);

  totalClientes = computed(() => this.srv.usuarios().length);
  activos = computed(() => this.srv.usuarios().filter(u => u.estado === 1).length);
  presentes = computed(() =>
    this.srv.asistencias().filter(a => !a.fechaSalida).length
  );
  ingresosMes = computed(() =>
    this.srv.pagos().filter(p => p.estado === 1)
      .reduce((acc, p) => acc + p.monto, 0)
  );
}