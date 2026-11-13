import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ClienteBusqueda } from '../models/asistencia.models';
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

  /**
   * El backend solo pagina (page/size) y no filtra, así que se traen los clientes
   * y los filtros se aplican aquí; luego se vuelve a paginar de a 10.
   */
  listar(filtros: FiltrosCliente, pagina: number): Observable<Pagina<ClienteRecepcion>> {
    const params = new HttpParams().set('page', 0).set('size', 1000);
    const incluye = (valor: string | null | undefined, buscado: string) => {
      const t = buscado.trim().toLowerCase();
      return !t || (valor ?? '').toLowerCase().includes(t);
    };

    return this.http.get<Pagina<ClienteRecepcion>>(this.url, { params }).pipe(
      map(r => {
        const filtrados = (r.content ?? []).filter(c =>
          incluye(c.nombre, filtros.nombre) &&
          incluye(c.correo, filtros.correo) &&
          incluye(c.telefono, filtros.telefono) &&
          incluye(c.numeroDocumento, filtros.documento) &&
          (filtros.estado === '' || c.activo === (filtros.estado === 'true'))
        );
        const totalPages = Math.max(1, Math.ceil(filtrados.length / TAMANO_PAGINA_CLIENTES));
        const number = Math.min(Math.max(0, pagina), totalPages - 1);
        const desde = number * TAMANO_PAGINA_CLIENTES;
        return {
          content: filtrados.slice(desde, desde + TAMANO_PAGINA_CLIENTES),
          totalElements: filtrados.length,
          totalPages,
          number,
          size: TAMANO_PAGINA_CLIENTES,
          first: number === 0,
          last: number >= totalPages - 1
        };
      })
    );
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
    /** Lista amplia para búsquedas locales en recepción (asistencias). */
  listarParaBusqueda(tamano = 1000): Observable<ClienteBusqueda[]> {
    return this.http
      .get<Pagina<ClienteBusqueda>>(this.url, { params: new HttpParams().set('size', tamano) })
      .pipe(map(p => p.content));
  }
}