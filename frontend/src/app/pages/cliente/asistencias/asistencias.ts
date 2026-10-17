import { Component, computed, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  templateUrl: './asistencias.html'
})
export class AsistenciasComponent {
  srv = inject(ClienteService);

  lista = computed(() =>
    [...this.srv.asistencias()].sort((a, b) => b.horaEntrada.localeCompare(a.horaEntrada))
  );

  fecha(iso: string) {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('es-BO', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  hora(iso: string) {
    return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  }
}
