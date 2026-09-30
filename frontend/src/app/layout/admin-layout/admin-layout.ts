import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon, NombreIcono } from '../../components/icon/icon';
import { AuthService } from '../../services/auth.service';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: NombreIcono;
}

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  readonly authService = inject(AuthService);

  readonly menu: ItemMenu[] = [
    { ruta: '/admin/dashboard', etiqueta: 'Dashboard', icono: 'dashboard' },
    { ruta: '/admin/usuarios', etiqueta: 'Usuarios', icono: 'users' },
    { ruta: '/admin/planes', etiqueta: 'Planes', icono: 'tag' }
  ];

  readonly menuAbierto = signal(this.esPantallaGrande());

  readonly inicial = computed(() =>
    (this.authService.user()?.usuario ?? '?').charAt(0).toUpperCase()
  );

  alternarMenu(): void {
    this.menuAbierto.update(abierto => !abierto);
  }

  cerrarEnMovil(): void {
    if (!this.esPantallaGrande()) {
      this.menuAbierto.set(false);
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
  }

  private esPantallaGrande(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  }
}