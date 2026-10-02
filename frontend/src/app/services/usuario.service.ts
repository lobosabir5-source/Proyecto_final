import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { CrearUsuario, Pagina, UsuarioAdmin } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/usuarios`;

  listar(pagina = 0, tamano = 10): Observable<Pagina<UsuarioAdmin>> {
    const params = new HttpParams().set('page', pagina).set('size', tamano);
    return this.http.get<Pagina<UsuarioAdmin>>(this.url, { params });
  }

  crear(datos: CrearUsuario): Observable<unknown> {
    return this.http.post(this.url, datos);
  }

  cambiarEstado(id: number, activo: boolean): Observable<UsuarioAdmin> {
    return this.http.patch<UsuarioAdmin>(`${this.url}/${id}/estado`, { activo });
  }
}