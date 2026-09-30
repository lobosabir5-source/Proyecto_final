import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';
import { Icon } from '../../../components/icon/icon';
import { CrearUsuario, Pagina, UsuarioAdmin } from '../../../models/admin.models';
import { AuthService, Rol } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { leerErrorApi } from '../../../utils/api-error';

@Component({
  selector: 'app-admin-usuarios',
  imports: [FormsModule, Icon, ConfirmDialog],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css'
})
export class AdminUsuarios implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);

  private readonly tamanoPagina = 10;

  /** Los clientes se registran solos; el backend no permite crearlos desde aquí. */
  readonly rolesCreables: Rol[] = ['ADMIN', 'RECEPCIONISTA'];

  readonly pagina = signal<Pagina<UsuarioAdmin> | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  // Modal de creación
  readonly modalAbierto = signal(false);
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');
  readonly camposError = signal<Record<string, string>>({});
  formulario: CrearUsuario = this.formularioVacio();

  // Confirmación de cambio de estado
  readonly usuarioPendiente = signal<UsuarioAdmin | null>(null);
  readonly cambiando = signal(false);

  ngOnInit(): void {
    this.cargar(0);
  }

  cargar(numeroPagina: number): void {
    this.cargando.set(true);
    this.error.set('');

    this.usuarioService.listar(numeroPagina, this.tamanoPagina).subscribe({
      next: pagina => {
        this.pagina.set(pagina);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(leerErrorApi(error).mensaje);
        this.cargando.set(false);
      }
    });
  }

  paginaAnterior(): void {
    const actual = this.pagina();
    if (actual && !actual.first) {
      this.cargar(actual.number - 1);
    }
  }

  paginaSiguiente(): void {
    const actual = this.pagina();
    if (actual && !actual.last) {
      this.cargar(actual.number + 1);
    }
  }

  // ---------- Crear ----------
  abrirModal(): void {
    this.formulario = this.formularioVacio();
    this.errorFormulario.set('');
    this.camposError.set({});
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  guardar(): void {
    this.guardando.set(true);
    this.errorFormulario.set('');
    this.camposError.set({});

    this.usuarioService.crear(this.formulario).subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.mostrarExito(`Usuario "${this.formulario.usuario}" creado correctamente.`);
        this.cargar(this.pagina()?.number ?? 0);
      },
      error: (error: HttpErrorResponse) => {
        const detalle = leerErrorApi(error);
        this.errorFormulario.set(detalle.mensaje);
        this.camposError.set(detalle.campos);
        this.guardando.set(false);
      }
    });
  }

  // ---------- Activar / desactivar ----------
  esCuentaPropia(usuario: UsuarioAdmin): boolean {
    return usuario.usuario === this.authService.user()?.usuario;
  }

  pedirCambioEstado(usuario: UsuarioAdmin): void {
    this.usuarioPendiente.set(usuario);
  }

  cancelarCambio(): void {
    this.usuarioPendiente.set(null);
  }

  confirmarCambio(): void {
    const usuario = this.usuarioPendiente();
    if (!usuario) {
      return;
    }

    this.cambiando.set(true);
    this.usuarioService.cambiarEstado(usuario.id, !usuario.activo).subscribe({
      next: actualizado => {
        this.cambiando.set(false);
        this.usuarioPendiente.set(null);
        this.mostrarExito(
          `Usuario "${actualizado.usuario}" ${actualizado.activo ? 'activado' : 'desactivado'}.`
        );
        this.cargar(this.pagina()?.number ?? 0);
      },
      error: (error: HttpErrorResponse) => {
        this.cambiando.set(false);
        this.usuarioPendiente.set(null);
        this.error.set(leerErrorApi(error).mensaje);
      }
    });
  }

  mensajeCambio(usuario: UsuarioAdmin): string {
    return usuario.activo
      ? `"${usuario.usuario}" ya no podrá iniciar sesión hasta que lo actives de nuevo.`
      : `"${usuario.usuario}" podrá volver a iniciar sesión.`;
  }

  // ---------- Presentación ----------
  etiquetaRol(rol: Rol): string {
    const etiquetas: Record<Rol, string> = {
      ADMIN: 'Administrador',
      RECEPCIONISTA: 'Recepcionista',
      CLIENTE: 'Cliente'
    };
    return etiquetas[rol];
  }

  claseRol(rol: Rol): string {
    const clases: Record<Rol, string> = {
      ADMIN: 'badge badge-warning',
      RECEPCIONISTA: 'badge badge-info',
      CLIENTE: 'badge badge-muted'
    };
    return clases[rol];
  }

  private mostrarExito(mensaje: string): void {
    this.exito.set(mensaje);
    setTimeout(() => this.exito.set(''), 4000);
  }

  private formularioVacio(): CrearUsuario {
    return { usuario: '', password: '', rol: 'RECEPCIONISTA' };
  }
}