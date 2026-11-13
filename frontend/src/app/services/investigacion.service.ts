import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { ColasRequest, ColasRespuesta, EoqRequest, EoqRespuesta } from '../models/investigacion.models';

@Injectable({ providedIn: 'root' })
export class InvestigacionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_URL}/admin`;

  calcularColas(r: ColasRequest): Observable<ColasRespuesta> {
    return this.http.post<ColasRespuesta>(`${this.base}/investigacion-operativa/colas/calcular`, r);
  }
  calcularEoq(r: EoqRequest): Observable<EoqRespuesta> {
    return this.http.post<EoqRespuesta>(`${this.base}/inventario/modelos/eoq`, r);
  }
}