import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Plan } from '../models/admin.models';

/** Catálogo público: solo planes activos, sin requerir iniciar sesión. */
@Injectable({ providedIn: 'root' })
export class PlanPublicoService {
  private readonly http = inject(HttpClient);

  listarActivos(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${API_URL}/public/planes`);
  }
}
