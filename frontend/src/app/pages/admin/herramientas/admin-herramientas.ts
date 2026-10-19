import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../config/api.config';

interface Backup { nombre: string; bytes: number }
@Component({
  selector: 'app-admin-herramientas',
  standalone: true,
  templateUrl: './admin-herramientas.html',
  styleUrl: './admin-herramientas.scss'
})
export class AdminHerramientas {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/admin/herramientas`;
  readonly logs = signal<string[]>([]);
  readonly backups = signal<Backup[]>([]);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly ocupado = signal(false);
  constructor() { this.actualizar(); }
  actualizar(): void {
    this.http.get<{lineas:string[]}>(`${this.url}/logs?limite=100`).subscribe({
      next: r => this.logs.set(r.lineas), error: () => this.error.set('No se pudieron cargar los logs')
    });
    this.http.get<Backup[]>(`${this.url}/backups`).subscribe({
      next: r => this.backups.set(r), error: () => this.error.set('No se pudieron cargar los respaldos')
    });
  }
  crearBackup(): void {
    this.ocupado.set(true); this.error.set(''); this.mensaje.set('');
    this.http.post<Backup>(`${this.url}/backups`, {}).subscribe({
      next: b => {this.ocupado.set(false); this.mensaje.set(`Respaldo creado: ${b.nombre}`); this.actualizar();},
      error: () => {this.ocupado.set(false); this.error.set('No se pudo crear el respaldo. Comprueba que pg_dump esté instalado y accesible.');}
    });
  }
  descargarReporte(formato: 'pdf'|'xlsx'|'csv'): void {
    this.descargar(`${this.url}/reportes/${formato}`, `golds-gym-reporte.${formato}`);
  }
  descargarBackup(nombre: string): void {
    this.descargar(`${this.url}/backups/${encodeURIComponent(nombre)}`, nombre);
  }
  private descargar(url: string, nombre: string): void {
    this.error.set('');
    this.http.get(url, {responseType:'blob'}).subscribe({
      next: blob => {
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl; link.download = nombre; link.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }, error: () => this.error.set(`No se pudo descargar ${nombre}`)
    });
  }
}
