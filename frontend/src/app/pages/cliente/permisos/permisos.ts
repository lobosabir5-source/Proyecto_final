import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './permisos.html'
})
export class PermisosComponent {
  srv = inject(ClienteService);

  motivo = signal('');
  dias = signal(1);

  lista = computed(() =>
    [...this.srv.permisos()].sort((a, b) => b.solicitadoEn.localeCompare(a.solicitadoEn))
  );

  enviar() {
    if (!this.motivo().trim() || this.dias() < 1) return;
    this.srv.permisos.update(p => [
      ...p,
      {
        idPermiso: Date.now(),
        motivo: this.motivo().trim(),
        diasAgregados: this.dias(),
        solicitadoEn: new Date().toISOString().substring(0, 10)
      }
    ]);
    this.motivo.set('');
    this.dias.set(1);
  }

  fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX');
  }
}