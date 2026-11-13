import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Pagina } from '../models/admin.models';
import { Caja, MovimientoCaja, NuevoMovimientoCaja, ResumenCaja } from '../models/caja.models';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/recepcion/cajas`;

  actual(): Observable<Caja> { return this.http.get<Caja>(`${this.url}/actual`); }
  abrir(montoInicial: number): Observable<Caja> { return this.http.post<Caja>(`${this.url}/abrir`, { montoInicial }); }
  historial(pagina: number): Observable<Pagina<Caja>> {
    return this.http.get<Pagina<Caja>>(this.url, { params: new HttpParams().set('pagina', pagina) });
  }
  movimientos(id: number, pagina: number): Observable<Pagina<MovimientoCaja>> {
    return this.http.get<Pagina<MovimientoCaja>>(`${this.url}/${id}/movimientos`, { params: new HttpParams().set('pagina', pagina) });
  }
  registrarMovimiento(id: number, m: NuevoMovimientoCaja): Observable<MovimientoCaja> {
    return this.http.post<MovimientoCaja>(`${this.url}/${id}/movimientos`, m);
  }
  resumen(id: number): Observable<ResumenCaja> { return this.http.get<ResumenCaja>(`${this.url}/${id}/resumen`); }
  cerrar(id: number, efectivoContado: number, observaciones: string | null): Observable<ResumenCaja> {
    return this.http.post<ResumenCaja>(`${this.url}/${id}/cerrar`, { efectivoContado, observaciones });
  }
}