import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { GuardarPromocion, Pagina, Promocion } from '../models/admin.models';

/** El backend admite como máximo 10 registros por página. */
export const TAMANO_PAGINA_PROMOCIONES = 10;

@Injectable({ providedIn: 'root' })
export class PromocionAdminService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/promociones`;

  listar(pagina: number): Observable<Pagina<Promocion>> {
    const params = new HttpParams().set('page', pagina).set('size', TAMANO_PAGINA_PROMOCIONES);
    return this.http.get<Pagina<Promocion>>(this.url, { params });
  }

  crear(datos: GuardarPromocion): Observable<Promocion> {
    return this.http.post<Promocion>(this.url, datos);
  }

  actualizar(id: number, datos: GuardarPromocion): Observable<Promocion> {
    return this.http.put<Promocion>(`${this.url}/${id}`, datos);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}