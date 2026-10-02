import { Component, computed, inject } from '@angular/core';
import { RecepcionService } from '../../../services/recepcion.service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  templateUrl: './pagos.html'
})
export class PagosComponent {
  private srv = inject(RecepcionService);

  pagos = computed(() =>
    [...this.srv.pagos()].sort((a, b) => b.fechaPago.localeCompare(a.fechaPago))
  );

  totalCobrado = computed(() =>
    this.srv.pagos().filter(p => p.estado === 1)
      .reduce((a, p) => a + p.monto, 0)
  );
  totalPendiente = computed(() =>
    this.srv.pagos().filter(p => p.estado === 0)
      .reduce((a, p) => a + p.monto, 0)
  );

  nombreCliente(idSuscripcion: number) {
    const s = this.srv.suscripciones().find(x => x.idSuscripcion === idSuscripcion);
    if (!s) return '—';
    const p = this.srv.getPerfil(s.idUsuario);
    return p ? `${p.nombres} ${p.apellidos}` : '—';
  }

  metodo(id: number) {
    return { 1: 'Efectivo', 2: 'Tarjeta', 3: 'Transferencia' }[id] ?? '—';
  }

  fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX');
  }
}