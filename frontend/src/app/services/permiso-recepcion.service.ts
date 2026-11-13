import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Pagina } from '../models/admin.models';
import { PermisoAusencia } from '../models/permiso.models';

export const TAMANO_PAGINA_PERMISOS = 10;

@Injectable({ providedIn: 'root' })
export class PermisoRecepcionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/recepcion/permisos`;

  listar(pagina: number): Observable<Pagina<PermisoAusencia>> {
    const params = new HttpParams().set('page', pagina).set('size', TAMANO_PAGINA_PERMISOS);
    return this.http.get<Pagina<PermisoAusencia>>(this.url, { params });
  }
  aprobar(id: number): Observable<PermisoAusencia> {
    return this.http.post<PermisoAusencia>(`${this.url}/${id}/aprobar`, {});
  }
  rechazar(id: number): Observable<PermisoAusencia> {
    return this.http.post<PermisoAusencia>(`${this.url}/${id}/rechazar`, {});
  }
}