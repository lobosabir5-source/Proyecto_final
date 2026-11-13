import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Carnet } from '../models/carnet.models';

@Injectable({ providedIn: 'root' })
export class CarnetService {
  private readonly http = inject(HttpClient);
  obtener(): Observable<Carnet> { return this.http.get<Carnet>(`${API_URL}/cliente/carnet`); }
}