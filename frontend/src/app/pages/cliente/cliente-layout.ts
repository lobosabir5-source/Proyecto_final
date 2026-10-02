import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem { label: string; route: string; }

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './cliente-layout.html',
  styleUrls: ['./cliente-layout.css']
})
export class ClienteLayoutComponent {
  private readonly auth = inject(AuthService);
  usuario = computed(() => this.auth.user()?.usuario ?? '');

  menu: { seccion: string; items: NavItem[] }[] = [
    {
      seccion: 'Mi cuenta',
      items: [
        { label: 'Inicio',          route: '/cliente/inicio' },
        { label: 'Mi suscripción',  route: '/cliente/suscripcion' },
        { label: 'Mi perfil',       route: '/cliente/perfil' },
      ]
    },
    {
      seccion: 'Entrenamiento',
      items: [
        { label: 'Mis rutinas',     route: '/cliente/rutinas' },
        { label: 'Mis asistencias', route: '/cliente/asistencias' },
      ]
    },
    {
      seccion: 'Pagos y trámites',
      items: [
        { label: 'Mis pagos',       route: '/cliente/pagos' },
        { label: 'Permisos',        route: '/cliente/permisos' },
      ]
    },
    {
      seccion: 'Beneficios',
      items: [
        { label: 'Promociones',     route: '/cliente/promociones' },
      ]
    },
  ];

  cerrarSesion() {
    this.auth.logout();
  }
}