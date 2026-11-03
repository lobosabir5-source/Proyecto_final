import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClienteService } from '../../services/cliente.service';
import { HomeNavbar } from '../home/components/home-navbar';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HomeNavbar],
  templateUrl: './cliente-layout.html'
})
export class ClienteLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly clienteService = inject(ClienteService);
  usuario = computed(() => this.auth.nombreVisible());

  constructor() {
    this.clienteService.cargar();
  }

  cerrarSesion() {
    this.auth.logout();
  }
}