import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Pagina } from '../models/admin.models';
import {
  AsistenciaPersonal,
  FiltrosAsistenciaPersonal,
  GuardarAsistenciaPersonal,
} from '../models/asistencia-personal.models';

/** Asistencia del personal (/api/admin/asistencias-personal). */
@Injectable({ providedIn: 'root' })
export class AsistenciaPersonalService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/asistencias-personal`;

  listar(pagina = 0, filtros: Partial<FiltrosAsistenciaPersonal> = {}): Observable<Pagina<AsistenciaPersonal>> {
    let params = new HttpParams().set('pagina', pagina);
    if (filtros.personalId) params = params.set('personalId', filtros.personalId);
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.turno) params = params.set('turno', filtros.turno);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    return this.http.get<Pagina<AsistenciaPersonal>>(this.url, { params });
  }

  crear(cuerpo: GuardarAsistenciaPersonal): Observable<AsistenciaPersonal> {
    return this.http.post<AsistenciaPersonal>(this.url, cuerpo);
  }

  editar(id: number, cuerpo: GuardarAsistenciaPersonal): Observable<AsistenciaPersonal> {
    return this.http.put<AsistenciaPersonal>(`${this.url}/${id}`, cuerpo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}