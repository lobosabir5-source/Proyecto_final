import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../../config/api.config';
import { MembresiaConSaldo, NuevoPago, Pago } from '../domain/models/pago.model';
import { PagoRepository } from '../domain/repositories/pago.repository';

interface Pagina<T> { content: T[]; }

/** Implementación del contrato usando el backend real. */
@Injectable()
export class PagoHttpRepository extends PagoRepository {
  private readonly http = inject(HttpClient);

  listarMembresias(): Observable<MembresiaConSaldo[]> {
    return this.http
      .get<Pagina<MembresiaConSaldo>>(`${API_URL}/recepcion/membresias?size=1000`)
      .pipe(map(p => p.content ?? []));
  }

  listarPorMembresia(membresiaId: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${API_URL}/recepcion/pagos/membresia/${membresiaId}`);
  }

  registrar(pago: NuevoPago): Observable<Pago> {
    return this.http.post<Pago>(`${API_URL}/recepcion/pagos`, pago);
  }
}