import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Pagina } from '../models/admin.models';
import { ActualizarRutina, GuardarRutina, Rutina } from '../models/rutina.models';

export const TAMANO_PAGINA_RUTINAS = 10;

@Injectable({ providedIn: 'root' })
export class RutinaRecepcionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/recepcion/rutinas`;

  listarDeCliente(clienteId: number, pagina: number): Observable<Pagina<Rutina>> {
    const params = new HttpParams().set('page', pagina).set('size', TAMANO_PAGINA_RUTINAS);
    return this.http.get<Pagina<Rutina>>(`${this.url}/cliente/${clienteId}`, { params });
  }
  crear(r: GuardarRutina): Observable<Rutina> { return this.http.post<Rutina>(this.url, r); }
  actualizar(id: number, r: ActualizarRutina): Observable<Rutina> { return this.http.put<Rutina>(`${this.url}/${id}`, r); }
  desactivar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}