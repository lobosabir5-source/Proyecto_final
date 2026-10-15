import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem { label: string; route: string; }

@Component({
  selector: 'app-recepcion-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './recepcion-layout.html',
  styleUrls: ['./recepcion-layout.css']
})
export class RecepcionLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  usuario = computed(() => this.auth.user()?.usuario ?? '');

  menu: { seccion: string; items: NavItem[] }[] = [
    {
      seccion: 'Recepción',
      items: [
        { label: 'Inicio',        route: '/recepcion/inicio' },
        { label: 'Clientes',      route: '/recepcion/clientes' },
        { label: 'Asistencias',   route: '/recepcion/asistencias' },
        { label: 'Suscripciones', route: '/recepcion/suscripciones' },
      ]
    },
    {
      seccion: 'Finanzas',
      items: [
        { label: 'Pagos', route: '/recepcion/pagos' },
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
    this.auth.logout(); // ya limpia localStorage y navega a /login
  }
}