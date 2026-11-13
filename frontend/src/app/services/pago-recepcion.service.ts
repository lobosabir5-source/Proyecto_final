import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { PagoMembresia } from '../models/pago.models';

@Injectable({ providedIn: 'root' })
export class PagoRecepcionService {
  private readonly http = inject(HttpClient);
  listarPorMembresia(membresiaId: number): Observable<PagoMembresia[]> {
    return this.http.get<PagoMembresia[]>(`${API_URL}/recepcion/pagos/membresia/${membresiaId}`);
  }
}