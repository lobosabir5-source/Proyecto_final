import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Pagina } from '../models/admin.models';
import { EstadoLaboral } from '../models/personal-admin.models';
import { FiltrosPersonal, GuardarPersonal, Personal } from '../models/personal.models';

/**
 * Gestión de personal (/api/admin/personal) para la vista de administración.
 * La consulta simple de empleados (listar/todos) sigue en PersonalAdminService.
 */
@Injectable({ providedIn: 'root' })
export class PersonalService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/personal`;

  /** Listado paginado con búsqueda y filtros (el backend pagina con el parámetro `pagina`). */
  buscar(pagina = 0, filtros: Partial<FiltrosPersonal> = {}): Observable<Pagina<Personal>> {
    let params = new HttpParams().set('pagina', pagina);
    const texto = filtros.texto?.trim();
    if (texto) params = params.set('texto', texto);
    if (filtros.cargo) params = params.set('cargo', filtros.cargo);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    return this.http.get<Pagina<Personal>>(this.url, { params });
  }

  crear(cuerpo: GuardarPersonal): Observable<Personal> {
    return this.http.post<Personal>(this.url, cuerpo);
  }

  editar(id: number, cuerpo: GuardarPersonal): Observable<Personal> {
    return this.http.put<Personal>(`${this.url}/${id}`, cuerpo);
  }

  /** PATCH /{id}/estado. `fechaSalida` solo es obligatoria para RETIRADO. */
  cambiarEstado(id: number, estadoLaboral: EstadoLaboral, fechaSalida: string | null = null): Observable<Personal> {
    return this.http.patch<Personal>(`${this.url}/${id}/estado`, { estadoLaboral, fechaSalida });
  }
}