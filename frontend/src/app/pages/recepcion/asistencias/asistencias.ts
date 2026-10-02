import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecepcionService } from '../../../services/recepcion.service';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './asistencias.html'
})
export class AsistenciasComponent {
  private srv = inject(RecepcionService);
  cedula = signal('');

  nombreDe(idUsuario: number) {
    const p = this.srv.getPerfil(idUsuario);
    return p ? `${p.nombres} ${p.apellidos}` : '—';
  }

  asistenciasHoy = computed(() =>
    [...this.srv.asistencias()].sort((a, b) =>
      b.fechaEntrada.localeCompare(a.fechaEntrada))
  );

  hora(iso?: string) {
    return iso ? new Date(iso).toLocaleTimeString('es-MX',
      { hour: '2-digit', minute: '2-digit' }) : '—';
  }

  entrar() {
    const perfil = this.srv.perfiles()
      .find(p => p.identificacion === this.cedula().trim());
    if (!perfil) { alert('Cliente no encontrado'); return; }
    this.srv.registrarEntrada(perfil.idUsuario);
    this.cedula.set('');
  }

  salir(idUsuario: number) {
    this.srv.registrarSalida(idUsuario);
  }
}