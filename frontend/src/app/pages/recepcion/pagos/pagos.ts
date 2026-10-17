import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { API_URL } from '../../../config/api.config';

interface Pagina<T> { content: T[]; }
interface MembresiaApi { id: number; saldo: number; }
interface PagoApi {
  id: number;
  membresiaId: number;
  cliente: string;
  monto: number;
  metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  fechaPago: string;
  registradoPor: string;
}

@Component({
  selector: 'app-pagos',
  standalone: true,
  templateUrl: './pagos.html'
})
export class PagosComponent implements OnInit {
  private http = inject(HttpClient);

  private lista = signal<PagoApi[]>([]);
  private saldos = signal<number[]>([]);

  pagos = computed(() =>
    [...this.lista()].sort((a, b) => b.fechaPago.localeCompare(a.fechaPago))
  );
  totalCobrado = computed(() =>
    this.lista().reduce((a, p) => a + Number(p.monto), 0)
  );
  totalPendiente = computed(() =>
    this.saldos().reduce((a, s) => a + Number(s), 0)
  );

  ngOnInit(): void {
    this.http.get<Pagina<MembresiaApi>>(`${API_URL}/recepcion/membresias?size=1000`)
      .subscribe(p => {
        const membresias = p.content;
        this.saldos.set(membresias.map(m => m.saldo));
        if (!membresias.length) return;
        forkJoin(membresias.map(m =>
          this.http.get<PagoApi[]>(`${API_URL}/recepcion/pagos/membresia/${m.id}`)
        )).subscribe(r => this.lista.set(r.flat()));
      });
  }

  metodo(m: string) {
    return { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' }[m] ?? '—';
  }

  fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-BO');
  }
}