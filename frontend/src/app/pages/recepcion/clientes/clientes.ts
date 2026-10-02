import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecepcionService } from '../../../services/recepcion.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clientes.html'
})
export class ClientesComponent {
  private srv = inject(RecepcionService);
  busqueda = signal('');

  lista = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    return this.srv.perfiles().filter(p => {
      if (!q) return true;
      return p.nombres.toLowerCase().includes(q)
          || p.apellidos.toLowerCase().includes(q)
          || p.identificacion.includes(q);
    });
  });

  planDe(idUsuario: number) {
    const s = this.srv.getSuscripcionActiva(idUsuario);
    return s ? this.srv.getPlan(s.idPlan)?.nombre : 'Sin plan';
  }

  estadoDe(idUsuario: number) {
    return this.srv.usuarios().find(u => u.id === idUsuario)?.estado === 1
      ? 'Activo' : 'Inactivo';
  }
}