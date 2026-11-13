import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, reduce } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Equipo, FiltrosEquipos, GuardarEquipo, PaginaEquipos } from '../models/equipos.models';
import { Mantenimiento } from '../models/mantenimiento.models';

@Injectable({ providedIn: 'root' })
export class EquiposService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/mantenimiento-equipos/equipos`;

  listar(pagina = 0, filtros: Partial<FiltrosEquipos> = {}): Observable<PaginaEquipos> {
    let params = new HttpParams().set('pagina', pagina);
    const texto = filtros.texto?.trim();
    if (texto) params = params.set('texto', texto);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    return this.http.get<PaginaEquipos>(this.url, { params });
  }

  /** Todos los equipos (el backend pagina de a 10). Sirve para selectores y nombres. */
  todos(): Observable<Equipo[]> {
    return this.listar(0).pipe(
      expand(r => (r.last ? EMPTY : this.listar(r.number + 1))),
      reduce((acc, r) => acc.concat(r.content), [] as Equipo[]),
    );
  }

  crear(cuerpo: GuardarEquipo): Observable<Equipo> {
    return this.http.post<Equipo>(this.url, cuerpo);
  }

  editar(id: number, cuerpo: GuardarEquipo): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.url}/${id}`, cuerpo);
  }

  /**
   * POST equipos/{id}/programar-semana?fecha=YYYY-MM-DD
   * Crea los mantenimientos PENDIENTES de los dos días configurados del equipo en la semana
   * (lunes a domingo) que contiene `fecha` (hoy si se omite). Omite los que ya existen y
   * devuelve solo los creados. Responde 400 si el equipo tiene la programación desactivada.
   */
  programarSemana(id: number, fecha?: string): Observable<Mantenimiento[]> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.post<Mantenimiento[]>(`${this.url}/${id}/programar-semana`, null, { params });
  }
}