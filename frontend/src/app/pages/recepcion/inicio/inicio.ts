import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { API_URL } from '../../../config/api.config';

interface Pagina<T> { content: T[]; }
interface ClienteApi { id: number; activo: boolean; }
interface AsistenciaApi { id: number; }
interface MembresiaApi { id: number; pagado: number; }

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.html'
})
export class InicioComponent implements OnInit {
  private http = inject(HttpClient);

  private clientes = signal<ClienteApi[]>([]);
  private asistenciasHoy = signal<AsistenciaApi[]>([]);
  private membresias = signal<MembresiaApi[]>([]);

  totalClientes = computed(() => this.clientes().length);
  activos = computed(() => this.clientes().filter(c => c.activo).length);
  presentes = computed(() => this.asistenciasHoy().length);
  ingresosMes = computed(() =>
    this.membresias().reduce((acc, m) => acc + Number(m.pagado ?? 0), 0)
  );

  ngOnInit(): void {
    forkJoin({
      clientes: this.http.get<Pagina<ClienteApi>>(`${API_URL}/recepcion/clientes?size=1000`),
      asistencias: this.http.get<Pagina<AsistenciaApi>>(`${API_URL}/recepcion/asistencias?size=1000`),
      membresias: this.http.get<Pagina<MembresiaApi>>(`${API_URL}/recepcion/membresias?size=1000`)
    }).subscribe(r => {
      this.clientes.set(r.clientes.content);
      this.asistenciasHoy.set(r.asistencias.content);
      this.membresias.set(r.membresias.content);
    });
  }
}