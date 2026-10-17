import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Pagina } from '../models/admin.models';
import {
  ActualizarClienteRecepcion,
  ClienteRecepcion,
  CrearClienteRecepcion,
  FiltrosCliente
} from '../models/recepcion.models';

/** El backend admite como máximo 10 registros por página. */
export const TAMANO_PAGINA_CLIENTES = 10;

@Injectable({ providedIn: 'root' })
export class ClienteRecepcionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/recepcion/clientes`;

  /** Lista paginada desde el backend. Solo se envían los filtros que tengan valor. */
  listar(filtros: FiltrosCliente, pagina: number): Observable<Pagina<ClienteRecepcion>> {
    let params = new HttpParams()
      .set('page', pagina)
      .set('size', TAMANO_PAGINA_CLIENTES);

    const texto: (keyof Omit<FiltrosCliente, 'estado'>)[] = ['nombre', 'correo', 'telefono', 'documento'];
    for (const clave of texto) {
      const valor = filtros[clave].trim();
      if (valor) {
        params = params.set(clave, valor);
      }
    }
    if (filtros.estado !== '') {
      params = params.set('activo', filtros.estado);
    }

    return this.http.get<Pagina<ClienteRecepcion>>(this.url, { params });
  }

  crear(datos: CrearClienteRecepcion): Observable<ClienteRecepcion> {
    return this.http.post<ClienteRecepcion>(this.url, datos);
  }

  actualizar(id: number, datos: ActualizarClienteRecepcion): Observable<ClienteRecepcion> {
    return this.http.put<ClienteRecepcion>(`${this.url}/${id}`, datos);
  }

  /** Solo recepción activa o desactiva clientes. */
  cambiarEstado(id: number, activo: boolean): Observable<ClienteRecepcion> {
    return this.http.patch<ClienteRecepcion>(`${this.url}/${id}/estado`, { activo });
  }

  /** Sube la fotografía (JPEG/PNG, máx. 5 MB). El campo multipart se llama "archivo". */
  subirFotografia(id: number, archivo: File): Observable<{ fotoUrl: string }> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.http.post<{ fotoUrl: string }>(`${this.url}/${id}/fotografia`, datos);
  }
}