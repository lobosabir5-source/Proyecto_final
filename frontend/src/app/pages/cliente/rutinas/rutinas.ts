import { Component, computed, inject, signal } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  templateUrl: './rutinas.html'
})
export class RutinasComponent {
  srv = inject(ClienteService);
  diaActivo = signal(1);

  dias = computed(() => {
    const set = new Set(this.srv.rutina().ejercicios.map(e => e.diaNum));
    return Array.from(set).sort();
  });

  ejerciciosDia = computed(() =>
    this.srv.rutina().ejercicios.filter(e => e.diaNum === this.diaActivo())
  );
}