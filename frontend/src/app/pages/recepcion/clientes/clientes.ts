import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_URL } from '../../../config/api.config';
import { leerErrorApi } from '../../../utils/api-error';

interface ClienteApi {
  id: number;
  usuarioId: number;
  usuario: string;
  nombre: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  fechaAlta: string;
  activo: boolean;
}

interface Pagina<T> { content: T[]; }

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clientes.html'
})
export class ClientesComponent implements OnInit {
  private http = inject(HttpClient);
  private url = `${API_URL}/recepcion/clientes`;

  clientes = signal<ClienteApi[]>([]);
  busqueda = signal('');
  cargando = signal(true);
  errorLista = signal('');

  lista = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    return this.clientes().filter(c =>
      !q ||
      c.nombre.toLowerCase().includes(q) ||
      c.usuario.toLowerCase().includes(q) ||
      c.correo.toLowerCase().includes(q) ||
      c.telefono.includes(q));
  });

  // ---- Formulario "Nuevo cliente" ----
  mostrarForm = signal(false);
  hoy = new Date().toISOString().split('T')[0];
  mostrarPassword = false;
  guardando = false;
  error = '';
  campos: Record<string, string> = {};

  form = this.formVacio();

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.http.get<Pagina<ClienteApi>>(`${this.url}?size=200`).subscribe({
      next: (r) => {
        this.clientes.set(r.content);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.errorLista.set(leerErrorApi(e).mensaje);
        this.cargando.set(false);
      }
    });
  }

  abrirForm(): void {
    this.form = this.formVacio();
    this.error = '';
    this.campos = {};
    this.mostrarPassword = false;
    this.mostrarForm.set(true);
  }

  cerrarForm(): void {
    this.mostrarForm.set(false);
  }

  guardar(): void {
    this.error = '';
    this.campos = {};

    if (this.form.password.length < 8) {
      this.campos['password'] = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }
    if (this.form.password !== this.form.confirmar) {
      this.campos['confirmar'] = 'Las contraseñas no coinciden';
      return;
    }

    const { confirmar, ...datos } = this.form;
    this.guardando = true;
    this.http.post<ClienteApi>(this.url, datos).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarForm.set(false);
        this.cargar();
      },
      error: (e: HttpErrorResponse) => {
        this.guardando = false;
        const err = leerErrorApi(e);
        this.error = err.mensaje;
        this.campos = err.campos;
      }
    });
  }

  private formVacio() {
    return {
      usuario: '',
      password: '',
      confirmar: '',
      nombre: '',
      correo: '',
      telefono: '',
      fechaNacimiento: ''
    };
  }
}