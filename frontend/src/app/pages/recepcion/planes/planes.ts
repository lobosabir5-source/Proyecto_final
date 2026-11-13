import { Component, OnInit, inject, signal } from '@angular/core';
import { Plan } from '../../../models/admin.models';
import { PlanRecepcionService } from '../../../services/plan-recepcion.service';
import { EstadoVacio } from '../components/estado-vacio';
import { PageHeader } from '../components/page-header';
import { PlanCard } from '../components/plan-card';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [PageHeader, PlanCard, EstadoVacio],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Catálogo / Planes" titulo="Planes" />

    @if (planes().length === 0) {
      <app-estado-vacio>No hay planes disponibles.</app-estado-vacio>
    } @else {
      <section class="grid grid-cols-1 md:grid-cols-3 gap-5">
        @for (plan of planes(); track plan.id) {
          <app-plan-card [plan]="plan" />
        }
      </section>
    }
  `
})
export class PlanesComponent implements OnInit {
  private readonly api = inject(PlanRecepcionService);

  planes = signal<Plan[]>([]);

  ngOnInit(): void {
    this.api.listar().subscribe(p => this.planes.set(p));
  }
}