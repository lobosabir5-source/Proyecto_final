import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, forkJoin, map, reduce } from 'rxjs';

import { API_URL } from '../config/api.config';
import {
  ClaseAerobica,
  EstadoClase,
  GuardarClaseAerobica,
  PaginaClases,
  PaginaInscripciones,
} from '../models/aerobicos.models';
import { sumarDias } from '../utils/semana';

@Injectable({ providedIn: 'root' })
export class AerobicosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/aerobicos`;

  listar(pagina = 0, fecha?: string): Observable<PaginaClases> {
    let params = new HttpParams().set('pagina', pagina);
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<PaginaClases>(this.url, { params });
  }

  /** Todas las clases de un día (el backend pagina de a 10). */
  porFecha(fecha: string): Observable<ClaseAerobica[]> {
    return this.listar(0, fecha).pipe(
      expand(r => (r.last ? EMPTY : this.listar(r.number + 1, fecha))),
      reduce((acc, r) => acc.concat(r.content), [] as ClaseAerobica[]),
    );
  }

  /** El backend solo filtra por un día: la semana se arma con 7 consultas (lunes a domingo). */
  semana(lunes: string): Observable<ClaseAerobica[]> {
    const dias = Array.from({ length: 7 }, (_, i) => this.porFecha(sumarDias(lunes, i)));
    return forkJoin(dias).pipe(map(grupos => grupos.flat()));
  }

  crear(cuerpo: GuardarClaseAerobica): Observable<ClaseAerobica> {
    return this.http.post<ClaseAerobica>(this.url, cuerpo);
  }

  /** Solo se editan clases PROGRAMADAS (regla del backend). */
  editar(id: number, cuerpo: GuardarClaseAerobica): Observable<ClaseAerobica> {
    return this.http.put<ClaseAerobica>(`${this.url}/${id}`, cuerpo);
  }

  /** El backend acepta CANCELADA o FINALIZADA desde PROGRAMADA. */
  cambiarEstado(id: number, estado: EstadoClase): Observable<ClaseAerobica> {
    return this.http.patch<ClaseAerobica>(`${this.url}/${id}/estado`, { estado });
  }

  registrarLlegadaInstructor(id: number): Observable<ClaseAerobica> {
    return this.http.patch<ClaseAerobica>(`${this.url}/${id}/llegada-instructor`, {});
  }

  inscripciones(id: number, pagina = 0): Observable<PaginaInscripciones> {
    const params = new HttpParams().set('pagina', pagina);
    return this.http.get<PaginaInscripciones>(`${this.url}/${id}/inscripciones`, { params });
  }
}