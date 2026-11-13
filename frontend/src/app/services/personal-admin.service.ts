import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, reduce } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Pagina } from '../models/admin.models';
import { PersonalAdmin } from '../models/personal-admin.models';

/** Consulta de personal (GET /api/admin/personal) para elegir técnicos e instructores. */
@Injectable({ providedIn: 'root' })
export class PersonalAdminService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/personal`;

  listar(pagina = 0): Observable<Pagina<PersonalAdmin>> {
    return this.http.get<Pagina<PersonalAdmin>>(this.url, { params: new HttpParams().set('pagina', pagina) });
  }

  /** El backend pagina de a 10: recorre todas las páginas. */
  todos(): Observable<PersonalAdmin[]> {
    return this.listar(0).pipe(
      expand(r => (r.last ? EMPTY : this.listar(r.number + 1))),
      reduce((acc, r) => acc.concat(r.content), [] as PersonalAdmin[]),
    );
  }
}