import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  usuario = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  login() {

    if (this.usuario === 'admin' && this.password === '1234') {

      localStorage.setItem('logueado', 'true');

      this.router.navigate(['/dashboard']);

    } else {

      this.error = 'Usuario o contraseña incorrectos';

    }
  }
}
