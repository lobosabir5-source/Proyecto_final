import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Plan } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class PlanRecepcionService {
  private readonly http = inject(HttpClient);
  listar(): Observable<Plan[]> { return this.http.get<Plan[]>(`${API_URL}/recepcion/planes`); }
}