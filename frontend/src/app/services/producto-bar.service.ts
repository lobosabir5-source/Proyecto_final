
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';

import {
  ProductoBar,
  GuardarProductoBar,
  PaginaProductosBar,
  FiltrosProductosBar,
} from '../models/producto-bar.models';

@Injectable({
  providedIn: 'root',
})
export class ProductoBarService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/productos-bar`;

  listar(
    pagina = 0,
    filtros: FiltrosProductosBar = {},
  ): Observable<PaginaProductosBar> {
    let params = new HttpParams()
      .set('page', pagina)
      .set('size', 10);

    if (filtros.nombre?.trim()) {
      params = params.set('nombre', filtros.nombre.trim());
    }

    if (filtros.categoriaId != null) {
      params = params.set('categoriaId', filtros.categoriaId);
    }

    if (filtros.estado != null) {
      params = params.set('estado', filtros.estado);
    }

    return this.http.get<PaginaProductosBar>(
      this.url,
      { params },
    );
  }

  obtener(id: number): Observable<ProductoBar> {
    return this.http.get<ProductoBar>(`${this.url}/${id}`);
  }

  crear(datos: GuardarProductoBar): Observable<ProductoBar> {
    return this.http.post<ProductoBar>(this.url, datos);
  }

  actualizar(
    id: number,
    datos: GuardarProductoBar,
  ): Observable<ProductoBar> {
    return this.http.put<ProductoBar>(
      `${this.url}/${id}`,
      datos,
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
