import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Pagina } from '../models/admin.models';
import { HistorialMembresia, Membresia, ResumenRecepcion } from '../models/recepcion.models';

export const TAMANO_PAGINA_MEMBRESIAS = 10;

@Injectable({ providedIn: 'root' })
export class MembresiaRecepcionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/recepcion/membresias`;

  listar(pagina: number): Observable<Pagina<Membresia>> {
    const params = new HttpParams().set('page', pagina).set('size', TAMANO_PAGINA_MEMBRESIAS);
    return this.http.get<Pagina<Membresia>>(this.url, { params });
  }
  contratar(clienteId: number, planId: number): Observable<Membresia> {
    return this.http.post<Membresia>(this.url, { clienteId, planId });
  }
  editar(id: number, fechaInicio: string, fechaFin: string): Observable<Membresia> {
    return this.http.patch<Membresia>(`${this.url}/${id}`, { fechaInicio, fechaFin });
  }
  renovar(id: number): Observable<HistorialMembresia> {
    return this.http.post<HistorialMembresia>(`${this.url}/${id}/renovar`, {});
  }
  historial(clienteId: number): Observable<HistorialMembresia[]> {
    return this.http.get<HistorialMembresia[]>(`${this.url}/historial/cliente/${clienteId}`);
  }
  resumen(): Observable<ResumenRecepcion> {
    return this.http.get<ResumenRecepcion>(`${API_URL}/recepcion/reportes/resumen`);
  }
}