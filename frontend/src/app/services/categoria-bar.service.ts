
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import {
  CategoriaBar,
  GuardarCategoriaBar,
  PaginaCategoriasBar,
} from '../models/categoria-bar.models';

@Injectable({
  providedIn: 'root',
})
export class CategoriaBarService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/categorias-bar`;

  listar(pagina = 0): Observable<PaginaCategoriasBar> {
    const params = new HttpParams()
      .set('page', pagina)
      .set('size', 10);

    return this.http.get<PaginaCategoriasBar>(
      this.url,
      { params }
    );
  }

  obtener(id: number): Observable<CategoriaBar> {
    return this.http.get<CategoriaBar>(
      `${this.url}/${id}`
    );
  }

  crear(datos: GuardarCategoriaBar): Observable<CategoriaBar> {
    return this.http.post<CategoriaBar>(
      this.url,
      datos
    );
  }

  actualizar(
    id: number,
    datos: GuardarCategoriaBar
  ): Observable<CategoriaBar> {
    return this.http.put<CategoriaBar>(
      `${this.url}/${id}`,
      datos
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${id}`
    );
  }
}
