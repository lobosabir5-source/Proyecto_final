import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { NuevoPago, Pago } from '../../domain/models/pago.model';
import { PagoRepository } from '../../domain/repositories/pago.repository';

/** Caso de uso: registrar un pago (valida antes de llamar al backend). */
@Injectable({ providedIn: 'root' })
export class RegistrarPagoUseCase {
  private readonly repo = inject(PagoRepository);

  execute(pago: NuevoPago): Observable<Pago> {
    if (!pago.membresiaId || !(pago.monto > 0)) {
      return throwError(() => new Error('Selecciona una membresía e ingresa un monto mayor a cero.'));
    }
    return this.repo.registrar(pago);
  }
}