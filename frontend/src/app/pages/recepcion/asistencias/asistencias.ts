import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_URL } from '../../../config/api.config';
import { leerErrorApi } from '../../../utils/api-error';

interface Pagina<T> { content: T[]; }
interface ClienteApi { id: number; usuario: string; nombre: string; correo: string; }
interface AsistenciaApi {
  id: number;
  clienteId: number;
  cliente: string;
  fecha: string;
  horaEntrada: string;
  registradaPor: string;
}

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './asistencias.html'
})
export class AsistenciasComponent implements OnInit {
  private http = inject(HttpClient);
  private url = `${API_URL}/recepcion/asistencias`;

  busqueda = signal('');
  clientes = signal<ClienteApi[]>([]);
  asistencias = signal<AsistenciaApi[]>([]);

  ngOnInit(): void {
    this.http.get<Pagina<ClienteApi>>(`${API_URL}/recepcion/clientes?size=1000`)
      .subscribe(p => this.clientes.set(p.content));
    this.cargar();
  }

  cargar(): void {
    this.http.get<Pagina<AsistenciaApi>>(`${this.url}?size=200`)
      .subscribe(p => this.asistencias.set(p.content));
  }

  hora(iso?: string) {
    return iso ? new Date(iso).toLocaleTimeString('es-BO',
      { hour: '2-digit', minute: '2-digit' }) : '—';
  }

  entrar(): void {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return;

    const exactos = this.clientes().filter(c =>
      c.usuario.toLowerCase() === q || c.correo.toLowerCase() === q);
    const coincidencias = exactos.length
      ? exactos
      : this.clientes().filter(c => c.nombre.toLowerCase().includes(q));

    if (coincidencias.length === 0) { alert('Cliente no encontrado'); return; }
    if (coincidencias.length > 1) { alert('Hay varios clientes con ese dato, sé más específico'); return; }

    this.http.post<AsistenciaApi>(this.url, { clienteId: coincidencias[0].id }).subscribe({
      next: () => { this.busqueda.set(''); this.cargar(); },
      error: (e: HttpErrorResponse) => alert(leerErrorApi(e).mensaje)
    });
  }
}