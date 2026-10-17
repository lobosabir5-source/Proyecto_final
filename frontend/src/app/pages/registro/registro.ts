import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { API_URL } from '../../config/api.config';

interface PlanRegistro {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracionDias: number;
  precio: number;
  destacado: boolean;
}

interface RegistroRequest {
  usuario: string;
  password: string;
  nombre: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  planId: number | null;
}

interface ApiError {
  message?: string;
  detail?: string;
  error?: string;
  title?: string;
  fields?: Record<string, string>;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authUrl = `${API_URL}/auth`;

  readonly hoy = new Date().toISOString().slice(0, 10);
  readonly registro: RegistroRequest = {
    usuario: '', password: '', nombre: '', correo: '', telefono: '', fechaNacimiento: '', planId: null
  };
  planes: PlanRegistro[] = [];
  paso: 'datos' | 'codigo' | 'completado' = 'datos';
  codigo = '';
  error = '';
  exito = '';
  cargandoPlanes = true;
  enviando = false;
  mostrarPassword = false;
  mostrarConfirmacion = false;
  confirmacionPassword = '';
  segundosReenvio = 0;
  telefonoTocado = false;

  ngOnInit(): void {
    this.http.get<PlanRegistro[]>(`${API_URL}/public/planes`).subscribe({
      next: planes => { this.planes = planes; this.cargandoPlanes = false; },
      error: () => { this.error = 'No se pudieron cargar los planes. Actualiza la página e inténtalo de nuevo.'; this.cargandoPlanes = false; }
    });
  }

  elegirPlan(id: number): void {
    this.registro.planId = id;
    this.error = '';
  }

  nombreValido(): boolean {
    return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]{1,119}$/.test(this.registro.nombre.trim());
  }

  contrasenaSegura(): boolean {
    const password = this.registro.password;
    return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password)
      && /\d/.test(password) && /[^A-Za-z0-9\s]/.test(password);
  }

  tieneMayusculaYMinuscula(): boolean {
    return /[A-Z]/.test(this.registro.password) && /[a-z]/.test(this.registro.password);
  }

  tieneNumeroYSimbolo(): boolean {
    return /\d/.test(this.registro.password) && /[^A-Za-z0-9\s]/.test(this.registro.password);
  }

  contrasenasCoinciden(): boolean {
    return !!this.confirmacionPassword && this.registro.password === this.confirmacionPassword;
  }

  correoValido(): boolean {
    return /^[a-z0-9._%+-]+@gmail\.com$/i.test(this.registro.correo.trim());
  }

  telefonoValido(): boolean {
    return /^[67]\d{7}$/.test(this.registro.telefono);
  }

  marcarTelefonoTocado(): void {
    this.telefonoTocado = true;
  }

  enviarCodigo(formulario: NgForm): void {
    this.error = '';
    formulario.form.markAllAsTouched();
    if (!this.nombreValido()) {
      this.error = 'Revisa tu nombre: usa solo letras y espacios.';
      return;
    }
    this.telefonoTocado = true;
    if (!this.correoValido()) {
      this.error = 'Escribe una dirección @gmail.com válida para recibir el código.';
      return;
    }
    if (!this.telefonoValido()) {
      this.error = 'Escribe un celular boliviano válido de 8 dígitos, que empiece con 6 o 7.';
      return;
    }
    if (!this.contrasenaSegura()) {
      this.error = 'Mejora tu contraseña: debe cumplir todos los requisitos indicados.';
      return;
    }
    if (!this.contrasenasCoinciden()) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (formulario.invalid) {
      this.error = 'Revisa los campos marcados y completa la información que falta.';
      return;
    }
    if (!this.registro.planId) { this.error = 'Elige un plan para continuar.'; return; }
    this.enviando = true;
    this.http.post<{ mensaje: string }>(`${this.authUrl}/register`, this.registro).subscribe({
      next: respuesta => {
        this.paso = 'codigo';
        this.exito = respuesta.mensaje;
        this.iniciarEsperaReenvio();
        this.enviando = false;
      },
      error: error => { this.error = this.mensajeError(error, 'No se pudo enviar el código. Revisa tus datos e inténtalo otra vez.'); this.enviando = false; }
    });
  }

  verificarCodigo(): void {
    this.error = '';
    if (!/^\d{6}$/.test(this.codigo)) { this.error = 'Escribe el código de seis dígitos que recibiste.'; return; }
    this.enviando = true;
    this.http.post(`${this.authUrl}/register/verify`, { registro: this.registro, codigo: this.codigo }).subscribe({
      next: () => { this.paso = 'completado'; this.enviando = false; },
      error: error => { this.error = this.mensajeError(error, 'No se pudo verificar el código. Inténtalo de nuevo.'); this.enviando = false; }
    });
  }

  reenviarCodigo(): void {
    if (this.segundosReenvio || this.enviando) return;
    this.error = '';
    this.enviando = true;
    this.http.post<{ mensaje: string }>(`${this.authUrl}/register`, this.registro).subscribe({
      next: respuesta => { this.exito = respuesta.mensaje; this.iniciarEsperaReenvio(); this.enviando = false; },
      error: error => { this.error = this.mensajeError(error, 'No se pudo reenviar el código. Inténtalo más tarde.'); this.enviando = false; }
    });
  }

  volverAEditar(): void { this.paso = 'datos'; this.codigo = ''; this.error = ''; this.exito = ''; this.segundosReenvio = 0; }

  irAlLogin(): void { this.router.navigate(['/login'], { queryParams: { registrado: '1' } }); }

  private iniciarEsperaReenvio(): void {
    this.segundosReenvio = 60;
    const temporizador = window.setInterval(() => {
      this.segundosReenvio--;
      if (!this.segundosReenvio) window.clearInterval(temporizador);
    }, 1000);
  }

  private mensajeError(error: HttpErrorResponse, respaldo: string): string {
    const body = error.error as ApiError | string | null;
    if (typeof body === 'string' && body.trim()) return body;
    if (!body || typeof body !== 'object') {
      return error.status === 0 ? 'No se pudo conectar con el servidor.' : respaldo;
    }
    const mensajeCampo = body.fields ? Object.values(body.fields).find(Boolean) : undefined;
    return mensajeCampo || body.message || body.detail || body.error
      || (error.status === 0 ? 'No se pudo conectar con el servidor.' : respaldo);
  }
}
