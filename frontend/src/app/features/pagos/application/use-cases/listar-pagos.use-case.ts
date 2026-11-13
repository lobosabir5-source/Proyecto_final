import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { MembresiaConSaldo, Pago } from '../../domain/models/pago.model';
import { PagoRepository } from '../../domain/repositories/pago.repository';

export interface ResumenPagos {
  membresias: MembresiaConSaldo[];
  pagos: Pago[];
}

/** Caso de uso: obtener las membresías y todos sus pagos. */
@Injectable({ providedIn: 'root' })
export class ListarPagosUseCase {
  private readonly repo = inject(PagoRepository);

  execute(): Observable<ResumenPagos> {
    return this.repo.listarMembresias().pipe(
      switchMap(membresias =>
        membresias.length === 0
          ? of({ membresias, pagos: [] as Pago[] })
          : forkJoin(membresias.map(m => this.repo.listarPorMembresia(m.id))).pipe(
              map(porMembresia => ({ membresias, pagos: porMembresia.flat() }))
            )
      )
    );
  }
}