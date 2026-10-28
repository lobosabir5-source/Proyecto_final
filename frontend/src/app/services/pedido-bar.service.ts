
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';

import {
  CrearPedidoBarRequest,
  PedidoBar,
  PaginaPedidosBar,
} from '../models/pedido-bar.models';

@Injectable({
  providedIn: 'root',
})
export class PedidoBarService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/pedidos-bar`;

  listar(pagina = 0): Observable<PaginaPedidosBar> {
    const params = new HttpParams().set('page', pagina);

    return this.http.get<PaginaPedidosBar>(
      this.url,
      { params },
    );
  }

  obtener(id: number): Observable<PedidoBar> {
    return this.http.get<PedidoBar>(`${this.url}/${id}`);
  }

  crear(datos: CrearPedidoBarRequest): Observable<PedidoBar> {
    return this.http.post<PedidoBar>(this.url, datos);
  }
}
