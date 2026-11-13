import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import {
  AlertasMantenimiento,
  CompletarMantenimiento,
  FiltrosMantenimiento,
  GuardarMantenimiento,
  Mantenimiento,
  PaginaMantenimientos,
} from '../models/mantenimiento.models';

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/mantenimiento-equipos`;

  listar(pagina = 0, filtros: Partial<FiltrosMantenimiento> = {}): Observable<PaginaMantenimientos> {
    let params = new HttpParams().set('pagina', pagina);
    if (filtros.equipoId) params = params.set('equipoId', filtros.equipoId);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.vencidos) params = params.set('vencidos', true);
    return this.http.get<PaginaMantenimientos>(`${this.url}/registros`, { params });
  }

  programar(cuerpo: GuardarMantenimiento): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(`${this.url}/registros`, cuerpo);
  }

  completar(id: number, cuerpo: CompletarMantenimiento): Observable<Mantenimiento> {
    return this.http.patch<Mantenimiento>(`${this.url}/registros/${id}/completar`, cuerpo);
  }

  cancelar(id: number, motivo: string): Observable<Mantenimiento> {
    return this.http.patch<Mantenimiento>(`${this.url}/registros/${id}/cancelar`, { motivo });
  }

  alertas(): Observable<AlertasMantenimiento> {
    return this.http.get<AlertasMantenimiento>(`${this.url}/alertas`);
  }
}