import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { rutaInicio } from '../../guards/auth.guard';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  usuario = '';
  password = '';
  error = '';
  loading = false;
  mostrarPassword = false;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    if (inject(ActivatedRoute).snapshot.queryParamMap.get('expirada')) {
      this.error = 'Tu sesión expiró. Inicia sesión nuevamente.';
    }
  }

  login() {
    this.error = '';

    if (!this.usuario.trim() || !this.password) {
      this.error = 'Escribe tu usuario y contraseña.';
      return;
    }

    this.loading = true;
    this.authService.login({ usuario: this.usuario, password: this.password }).subscribe({
      next: (respuesta) => {
        // Guardamos datos de sesión
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuario', respuesta.usuario);
        localStorage.setItem('rol', respuesta.rol);

        // Redirigimos según el rol
        this.router.navigate([rutaInicio(respuesta.rol)]);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        const respuesta = error.error as { message?: string; detail?: string } | null;
        this.error = error.status === 0
          ? 'No se pudo conectar con el servidor.'
          : respuesta?.message || respuesta?.detail || (error.status === 403
            ? 'Tu cuenta está inactiva. Un administrador debe activarla antes de que puedas iniciar sesión.'
            : 'Usuario o contraseña incorrectos.');
      },
      complete: () => this.loading = false
    });
  }
}