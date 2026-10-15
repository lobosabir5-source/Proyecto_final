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
    [...this.srv.asistencias()].sort((a, b) => b.fechaEntrada.localeCompare(a.fechaEntrada))
  );

  fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  hora(iso?: string) {
    return iso
      ? new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      : '—';
  }

  duracion(a: any): string {
    if (!a.fechaSalida) return '—';
    const ms = new Date(a.fechaSalida).getTime() - new Date(a.fechaEntrada).getTime();
    const min = Math.round(ms / 60000);
    const h = Math.floor(min / 60);
    return `${h}h ${min % 60}m`;
  }
}