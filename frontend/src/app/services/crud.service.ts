import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class CrudService {
  private readonly http = inject(HttpClient);

  listar(ruta: string, params: Record<string, string | number | undefined | null>): Observable<any> {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    }
    return this.http.get<any>(`${API_URL}${ruta}`, { params: p });
  }
  crear(ruta: string, cuerpo: unknown) { return this.http.post<any>(`${API_URL}${ruta}`, cuerpo); }
  actualizar(ruta: string, id: number | string, cuerpo: unknown) { return this.http.put<any>(`${API_URL}${ruta}/${id}`, cuerpo); }
  eliminar(ruta: string, id: number | string) { return this.http.delete<void>(`${API_URL}${ruta}/${id}`); }
  patch(ruta: string, cuerpo?: unknown) { return this.http.patch<any>(`${API_URL}${ruta}`, cuerpo ?? {}); }
  post(ruta: string, cuerpo?: unknown) { return this.http.post<any>(`${API_URL}${ruta}`, cuerpo ?? {}); }
}