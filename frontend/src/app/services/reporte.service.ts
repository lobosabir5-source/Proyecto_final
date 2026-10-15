import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { ReporteResumen } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/reportes`;

  resumen(): Observable<ReporteResumen> {
    return this.http.get<ReporteResumen>(`${this.url}/resumen`);
  }
}