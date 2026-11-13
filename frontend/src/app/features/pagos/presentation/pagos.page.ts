import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListarPagosUseCase } from '../application/use-cases/listar-pagos.use-case';
import { RegistrarPagoUseCase } from '../application/use-cases/registrar-pago.use-case';
import { MembresiaConSaldo, MetodoPago, Pago } from '../domain/models/pago.model';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pagos.page.html'
})
export class PagosPage implements OnInit {
  private readonly listarPagos = inject(ListarPagosUseCase);
  private readonly registrarPago = inject(RegistrarPagoUseCase);

  private readonly lista = signal<Pago[]>([]);
  readonly membresias = signal<MembresiaConSaldo[]>([]);

  readonly pagos = computed(() =>
    [...this.lista()].sort((a, b) => b.fechaPago.localeCompare(a.fechaPago))
  );
  readonly totalCobrado = computed(() => this.lista().reduce((a, p) => a + Number(p.monto), 0));
  readonly totalPendiente = computed(() => this.membresias().reduce((a, m) => a + Number(m.saldo), 0));
  readonly conSaldo = computed(() =>
    this.membresias().filter(m => Number(m.saldo) > 0 && m.estado !== 'CANCELADA')
  );

  // formulario
  membresiaId: number | null = null;
  monto: number | null = null;
  metodoSel: MetodoPago = 'EFECTIVO';
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  readonly error = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.listarPagos.execute().subscribe(r => {
      this.membresias.set(r.membresias);
      this.lista.set(r.pagos);
    });
  }

  alElegirMembresia(): void {
    const m = this.membresias().find(x => x.id === Number(this.membresiaId));
    this.monto = m ? Number(m.saldo) : null;
  }

  registrar(): void {
    this.mensaje.set('');
    this.error.set('');
    this.guardando.set(true);
    this.registrarPago.execute({
      membresiaId: Number(this.membresiaId),
      monto: Number(this.monto),
      metodo: this.metodoSel
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensaje.set('Pago registrado correctamente.');
        this.membresiaId = null;
        this.monto = null;
        this.metodoSel = 'EFECTIVO';
        this.cargar();
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.error.set(this.mensajeDeError(e));
      }
    });
  }

  metodo(m: string): string {
    return ({ EFECTIVO: 'Efectivo', QR: 'QR' } as Record<string, string>)[m] ?? '—';
  }

  fecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-BO');
  }

  private mensajeDeError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 0) return 'No se pudo conectar con el servidor.';
      const det = Object.values(e.error?.fields ?? {}).join(' · ');
      return e.error?.message
        ? (det ? `${e.error.message}: ${det}` : e.error.message)
        : 'No se pudo registrar el pago.';
    }
    return e instanceof Error ? e.message : 'No se pudo registrar el pago.';
  }
}