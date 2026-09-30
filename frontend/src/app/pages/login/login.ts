import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
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

  login() {
    this.error = '';

    if (!this.usuario.trim() || !this.password) {
      this.error = 'Escribe tu usuario y contraseña.';
      return;
    }

    this.loading = true;
    this.authService.login({ usuario: this.usuario, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.error = error.status === 0
          ? 'No se pudo conectar con el servidor.'
          : 'Usuario o contraseña incorrectos.';
      },
      complete: () => this.loading = false
    });
  }
}