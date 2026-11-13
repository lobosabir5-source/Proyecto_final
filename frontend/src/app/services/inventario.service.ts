import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import {
  FiltrosInventario,
  GuardarItemInventario,
  ItemInventario,
  MovimientoInventario,
  PaginaInventario,
  PaginaMovimientos,
  RegistrarMovimientoInventario,
} from '../models/inventario.models';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/inventario-general`;

  listar(pagina = 0, filtros: Partial<FiltrosInventario> = {}): Observable<PaginaInventario> {
    let params = new HttpParams().set('page', pagina);
    const nombre = filtros.nombre?.trim();
    if (nombre) params = params.set('nombre', nombre);
    if (filtros.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros.activo) params = params.set('activo', filtros.activo);
    if (filtros.bajoMinimo) params = params.set('bajoMinimo', true);
    return this.http.get<PaginaInventario>(this.url, { params });
  }

  crear(cuerpo: GuardarItemInventario): Observable<ItemInventario> {
    return this.http.post<ItemInventario>(this.url, cuerpo);
  }

  editar(id: number, cuerpo: GuardarItemInventario): Observable<ItemInventario> {
    return this.http.put<ItemInventario>(`${this.url}/${id}`, cuerpo);
  }

  /** El backend no borra: marca el insumo como inactivo. */
  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  registrarMovimiento(id: number, cuerpo: RegistrarMovimientoInventario): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.url}/${id}/movimientos`, cuerpo);
  }

  historial(id: number, pagina = 0): Observable<PaginaMovimientos> {
    const params = new HttpParams().set('page', pagina);
    return this.http.get<PaginaMovimientos>(`${this.url}/${id}/movimientos`, { params });
  }
}