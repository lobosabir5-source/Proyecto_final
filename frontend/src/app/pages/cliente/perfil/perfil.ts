import { Component, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.html'
})
export class PerfilComponent {
  srv = inject(ClienteService);
}