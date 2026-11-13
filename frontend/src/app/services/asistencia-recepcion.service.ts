import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Pagina } from '../models/admin.models';
import { AsistenciaRegistrada } from '../models/asistencia.models';

@Injectable({ providedIn: 'root' })
export class AsistenciaRecepcionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/recepcion/asistencias`;

  listar(tamano = 200): Observable<AsistenciaRegistrada[]> {
    return this.http
      .get<Pagina<AsistenciaRegistrada>>(this.url, { params: new HttpParams().set('size', tamano) })
      .pipe(map(p => p.content));
  }
  registrar(clienteId: number): Observable<AsistenciaRegistrada> {
    return this.http.post<AsistenciaRegistrada>(this.url, { clienteId });
  }
}