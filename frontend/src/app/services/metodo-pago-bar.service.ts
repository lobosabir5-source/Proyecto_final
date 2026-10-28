
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import {
  PaginaMetodosPagoBar,
} from '../models/metodo-pago-bar.models';

@Injectable({
  providedIn: 'root',
})
export class MetodoPagoBarService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/metodos-pago-bar`;

  listar(pagina = 0): Observable<PaginaMetodosPagoBar> {
    const params = new HttpParams().set('page', pagina);

    return this.http.get<PaginaMetodosPagoBar>(
      this.url,
      { params },
    );
  }
}
