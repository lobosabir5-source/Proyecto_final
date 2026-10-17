import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';
import { Icon } from '../../../components/icon/icon';
import { Pagina, UsuarioAdmin } from '../../../models/admin.models';
import { AuthService, Rol } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { leerErrorApi } from '../../../utils/api-error';

interface FormularioUsuario {
  usuario: string;
  password: string;
  rol: Rol;
  nombre: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
}

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

  /** El administrador puede crear personal y clientes. */
  readonly rolesCreables: Rol[] = ['ADMIN', 'RECEPCIONISTA', 'CLIENTE'];

  /** Fecha máxima de nacimiento: hoy. */
  readonly hoy = new Date().toISOString().split('T')[0];

  readonly pagina = signal<Pagina<UsuarioAdmin> | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  // Modal crear / editar (si "editando" tiene valor, es edición)
  readonly modalAbierto = signal(false);
  readonly editando = signal<UsuarioAdmin | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');
  readonly camposError = signal<Record<string, string>>({});
  formulario: FormularioUsuario = this.formularioVacio();

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

  // ---------- Crear / Editar ----------
  abrirModal(): void {
    this.editando.set(null);
    this.formulario = this.formularioVacio();
    this.errorFormulario.set('');
    this.camposError.set({});
    this.modalAbierto.set(true);
  }

  abrirEdicion(usuario: UsuarioAdmin): void {
    this.editando.set(usuario);
    this.formulario = { ...this.formularioVacio(), usuario: usuario.usuario, rol: usuario.rol };
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

    const editando = this.editando();
    const datos = this.formulario;
    let peticion: Observable<unknown>;

    if (editando) {
      peticion = this.usuarioService.actualizar(editando.id, {
        usuario: datos.usuario,
        password: datos.password || null,
        rol: datos.rol
      });
    } else if (datos.rol === 'CLIENTE') {
      peticion = this.usuarioService.crearCliente({
        usuario: datos.usuario,
        password: datos.password,
        nombre: datos.nombre,
        correo: datos.correo,
        telefono: datos.telefono,
        fechaNacimiento: datos.fechaNacimiento
      });
    } else {
      peticion = this.usuarioService.crear({
        usuario: datos.usuario,
        password: datos.password,
        rol: datos.rol
      });
    }

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.mostrarExito(
          editando
            ? `Usuario "${datos.usuario}" actualizado.`
            : `Usuario "${datos.usuario}" creado correctamente.`
        );
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

  esCliente(): boolean {
    return !this.editando() && this.formulario.rol === 'CLIENTE';
  }

  /** Editando mi propia cuenta: no se puede cambiar rol ni nombre de usuario. */
  editandoCuentaPropia(): boolean {
    const usuario = this.editando();
    return !!usuario && this.esCuentaPropia(usuario);
  }

  // ---------- Activar / desactivar ----------
  esCuentaPropia(usuario: UsuarioAdmin): boolean {
    return usuario.usuario === this.authService.user()?.usuario;
  }

  esPersonal(usuario: UsuarioAdmin): boolean {
    return usuario.rol !== 'CLIENTE';
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

  private formularioVacio(): FormularioUsuario {
    return {
      usuario: '', password: '', rol: 'RECEPCIONISTA',
      nombre: '', correo: '', telefono: '', fechaNacimiento: ''
    };
  }
}