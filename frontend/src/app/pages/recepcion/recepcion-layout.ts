import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem { label: string; route: string; }

@Component({
  selector: 'app-recepcion-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  host: { class: 'block' },
  templateUrl: './recepcion-layout.html'
})
export class RecepcionLayoutComponent {
  private readonly auth = inject(AuthService);

  usuario = computed(() => this.auth.nombreVisible());

  menu: { seccion: string; items: NavItem[] }[] = [
    {
      seccion: 'Recepción',
      items: [
        { label: 'Inicio',        route: '/recepcion/inicio' },
        { label: 'Clientes',      route: '/recepcion/clientes' },
        { label: 'Asistencias',   route: '/recepcion/asistencias' },
        { label: 'Suscripciones', route: '/recepcion/suscripciones' },
        { label: 'Rutinas',       route: '/recepcion/rutinas' },
      ]
    },
    {
      seccion: 'Finanzas',
      items: [
        { label: 'Pagos',    route: '/recepcion/pagos' },
        { label: 'Caja',     route: '/recepcion/caja' },
        { label: 'Permisos', route: '/recepcion/permisos' },
      ]
    },
    {
      seccion: 'Catálogo',
      items: [
        { label: 'Planes', route: '/recepcion/planes' },
      ]
    },
  ];

  cerrarSesion() {
    this.auth.logout();
  }
}