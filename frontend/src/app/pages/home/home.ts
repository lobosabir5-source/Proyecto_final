import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Plan } from '../../models/admin.models';
import { SERVER_URL } from '../../config/api.config';
import { PlanPublicoService } from '../../services/plan-publico.service';
import { ConfiguracionService, Configuracion } from '../../services/configuracion.service';
import { PromocionPublicaService, PromocionPublica } from '../../services/promocion-publica.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private readonly planPublicoService = inject(PlanPublicoService);
  private readonly configuracionService = inject(ConfiguracionService);
  private readonly promocionService = inject(PromocionPublicaService);
  configuracion: Configuracion | null = null;
  promociones: PromocionPublica[] = [];
  errorConfiguracion = false;
  planes: Plan[] = [];
  cargandoPlanes = true;
  errorPlanes = false;

  ngOnInit(): void {
    this.cargarPlanes();
    this.cargarConfiguracion();
    this.cargarPromociones();
  }

  cargarConfiguracion(): void {
    this.configuracionService.obtenerPublica().subscribe({
      next: datos => { this.configuracion = datos; this.errorConfiguracion = false; },
      error: () => { this.errorConfiguracion = true; }
    });
  }

  cargarPromociones(): void {
    this.promocionService.listarVigentes().subscribe({
      next: datos => { this.promociones = datos; },
      error: () => { this.promociones = []; }
    });
  }

  urlImagen(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^https:\/\//i.test(url)) return url;
    if (url.startsWith('/') && !url.startsWith('//')) return `${SERVER_URL}${url}`;
    return null;
  }

  enlaceWhatsapp(numero: string): string {
    return `https://wa.me/${numero.replace(/\D/g, '')}`;
  }

  dias: Record<number, string> = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };

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
