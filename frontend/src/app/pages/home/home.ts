import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Plan } from '../../models/admin.models';
import { SERVER_URL } from '../../config/api.config';
import { PlanPublicoService } from '../../services/plan-publico.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private readonly planPublicoService = inject(PlanPublicoService);
  planes: Plan[] = [];
  cargandoPlanes = true;
  errorPlanes = false;

  ngOnInit(): void {
    this.cargarPlanes();
  }

  cargarPlanes(): void {
    this.cargandoPlanes = true;
    this.errorPlanes = false;
    this.planPublicoService.listarActivos().subscribe({
      next: planes => {
        this.planes = planes
          .filter(plan => plan.activo)
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.nombre.localeCompare(b.nombre));
        this.cargandoPlanes = false;
      },
      error: () => {
        this.errorPlanes = true;
        this.cargandoPlanes = false;
      }
    });
  }

  imagenPlan(plan: Plan): string | null {
    const url = plan.imagenUrl?.trim();
    if (!url) return null;
    if (/^https:\/\//i.test(url)) return url;
    if (url.startsWith('/') && !url.startsWith('//')) return `${SERVER_URL}${url}`;
    return null;
  }

  beneficiosPlan(plan: Plan): string[] {
    return plan.beneficios?.filter(beneficio => !!beneficio?.trim()) ?? [];
  }
}
