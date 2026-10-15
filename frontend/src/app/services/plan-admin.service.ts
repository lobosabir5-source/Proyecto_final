import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { GuardarPlan, Plan } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class PlanAdminService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/planes`;

  listar(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.url);
  }

  crear(datos: GuardarPlan): Observable<Plan> {
    return this.http.post<Plan>(this.url, datos);
  }

  actualizar(id: number, datos: GuardarPlan): Observable<Plan> {
    return this.http.put<Plan>(`${this.url}/${id}`, datos);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}