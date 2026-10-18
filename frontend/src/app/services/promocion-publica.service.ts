import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../config/api.config';

export interface PromocionPublica {
  id: number;
  nombre: string;
  tipo: string;
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  planId: number | null;
  activo: boolean;
  imagenUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class PromocionPublicaService {
  private readonly http = inject(HttpClient);
  listarVigentes() {
    return this.http.get<PromocionPublica[]>(`${API_URL}/public/promociones`);
  }
}
