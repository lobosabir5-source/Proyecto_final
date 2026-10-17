import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { API_URL } from '../../../config/api.config';

interface PlanApi {
  id: number;
  nombre: string;
  descripcion: string;
  duracionDias: number;
  precio: number;
}

@Component({
  selector: 'app-planes',
  standalone: true,
  templateUrl: './planes.html'
})
export class PlanesComponent implements OnInit {
  private http = inject(HttpClient);

  planes = signal<PlanApi[]>([]);

  ngOnInit(): void {
    this.http.get<PlanApi[]>(`${API_URL}/recepcion/planes`)
      .subscribe(p => this.planes.set(p));
  }
}