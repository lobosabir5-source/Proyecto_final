import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject, catchError, debounceTime, map, merge, switchMap, tap } from 'rxjs';
import { Paginador } from '../../../components/paginador/paginador';
import { ClienteRecepcion, FiltrosCliente } from '../../../models/recepcion.models';
import { ClienteRecepcionService, TAMANO_PAGINA_CLIENTES } from '../../../services/cliente-recepcion.service';
import { leerErrorApi } from '../../../utils/api-error';

// Mismas reglas que el backend (CrearClienteRequest / ActualizarClienteRequest)
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[+0-9 ()-]{7,30}$/;
const REGEX_DOCUMENTO = /^[A-Za-z0-9.-]{5,40}$/;
const TIPOS_FOTO = ['image/jpeg', 'image/png'];
const MAX_FOTO_BYTES = 5 * 1024 * 1024;

interface FormCliente {
  usuario: string;
  password: string;
  confirmar: string;
  nombre: string;
  numeroDocumento: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, Paginador],
  templateUrl: './clientes.html'
})
export class ClientesComponent implements OnInit {
  private readonly service = inject(ClienteRecepcionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tamanoPagina = TAMANO_PAGINA_CLIENTES;

  // - Listado (desde el backend) --
  readonly clientes = signal<ClienteRecepcion[]>([]);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);
  readonly cargando = signal(true);
  readonly errorLista = signal('');
  readonly exito = signal('');

  // ---- Filtros independientes y combinables ----
  filtros: FiltrosCliente = this.filtrosVacios();

  /** Los filtros de texto esperan 350 ms desde la última tecla antes de consultar. */
  private readonly filtrosEscritos$ = new Subject<void>();
  /** Estado y cambios de página consultan de inmediato. */
  private readonly irAPagina$ = new Subject<number>();

  // ---- Formulario (crear / editar) ----
  readonly mostrarForm = signal(false);
  readonly clienteEditando = signal<ClienteRecepcion | null>(null);
  readonly vistaPrevia = signal<string | null>(null);
  readonly hoy = this.fechaLocal();
  mostrarPassword = false;
  guardando = false;
  error = '';
  campos: Record<string, string> = {};
  form: FormCliente = this.formVacio();
  archivo: File | null = null;

  get hayFiltros(): boolean {
    const f = this.filtros;
    return !!(f.nombre.trim() || f.correo.trim() || f.telefono.trim() || f.documento.trim() || f.estado);
  }

  ngOnInit(): void {
    merge(
      this.filtrosEscritos$.pipe(debounceTime(350), map(() => 0)),
      this.irAPagina$
    )
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.errorLista.set('');
        }),
        switchMap(pagina =>
          this.service.listar(this.filtros, pagina).pipe(
            catchError((e: HttpErrorResponse) => {
              this.errorLista.set(leerErrorApi(e).mensaje);
              this.cargando.set(false);
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(respuesta => {
        this.clientes.set(respuesta.content);
        this.pagina.set(respuesta.number);
        this.totalPaginas.set(respuesta.totalPages);
        this.totalElementos.set(respuesta.totalElements);
        this.cargando.set(false);
      });

    this.irAPagina$.next(0);
  }

  //  FILTROS ==
  alEscribirFiltro(): void {
    this.filtrosEscritos$.next();
  }

  alCambiarEstado(): void {
    this.irAPagina$.next(0);
  }

  limpiarFiltros(): void {
    this.filtros = this.filtrosVacios();
    this.irAPagina$.next(0);
  }

  irAPagina(pagina: number): void {
    this.irAPagina$.next(pagina);
  }

  // =========================== FORMULARIO ===========================
  abrirCrear(): void {
    this.clienteEditando.set(null);
    this.abrirForm(this.formVacio(), null);
  }

  abrirEditar(cliente: ClienteRecepcion): void {
    this.clienteEditando.set(cliente);
    this.abrirForm(
      {
        usuario: cliente.usuario,
        password: '',
        confirmar: '',
        nombre: cliente.nombre,
        numeroDocumento: cliente.numeroDocumento ?? '',
        correo: cliente.correo,
        telefono: cliente.telefono,
        fechaNacimiento: cliente.fechaNacimiento
      },
      this.fotoSrc(cliente)
    );
  }

  cerrarForm(): void {
    this.liberarVistaPrevia();
    this.mostrarForm.set(false);
  }

  alElegirFoto(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    delete this.campos['foto'];

    if (!archivo) {
      return;
    }
    if (!TIPOS_FOTO.includes(archivo.type)) {
      this.campos['foto'] = 'Solo se permiten imágenes JPEG o PNG';
      input.value = '';
      return;
    }
    if (archivo.size > MAX_FOTO_BYTES) {
      this.campos['foto'] = 'La imagen no puede superar 5 MB';
      input.value = '';
      return;
    }

    this.liberarVistaPrevia();
    this.archivo = archivo;
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }

  guardar(): void {
    this.error = '';
    this.campos = this.validar();
    if (Object.keys(this.campos).length) {
      return;
    }

    const f = this.form;
    const datos = {
      nombre: f.nombre.trim(),
      numeroDocumento: f.numeroDocumento.trim(),
      correo: f.correo.trim().toLowerCase(),
      telefono: f.telefono.trim(),
      fechaNacimiento: f.fechaNacimiento
    };
    const editando = this.clienteEditando();

    this.guardando = true;
    const peticion = editando
      ? this.service.actualizar(editando.id, datos)
      : this.service.crear({ ...datos, usuario: f.usuario.trim(), password: f.password });

    peticion.subscribe({
      next: cliente => this.despuesDeGuardar(cliente, !!editando),
      error: (e: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError(e);
      }
    });
  }

  fotoSrc(cliente: ClienteRecepcion): string | null {
    if (!cliente.fotoUrl) {
      return null;
    }
    return cliente.fotoUrl.startsWith('http') ? cliente.fotoUrl : `${SERVER_URL}${cliente.fotoUrl}`;
  }

  iniciales(nombre: string): string {
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  }

  // =========================== INTERNOS ===========================
  private despuesDeGuardar(cliente: ClienteRecepcion, edicion: boolean): void {
    const accion = edicion ? 'actualizado' : 'registrado';

    // Sin foto nueva: terminamos aquí.
    if (!this.archivo) {
      this.terminar(`Cliente "${cliente.nombre}" ${accion} correctamente.`);
      return;
    }

    // La foto se sube en una segunda petición porque el endpoint es multipart.
    this.service.subirFotografia(cliente.id, this.archivo).subscribe({
      next: () => this.terminar(`Cliente "${cliente.nombre}" ${accion} correctamente, con su fotografía.`),
      error: (e: HttpErrorResponse) => {
        // El cliente ya existe: pasamos a modo edición para que pueda reintentar la foto.
        this.guardando = false;
        this.clienteEditando.set(cliente);
        this.form.password = '';
        this.form.confirmar = '';
        this.archivo = null;
        this.irAPagina$.next(this.pagina());
        this.mostrarError(e, `El cliente se ${edicion ? 'actualizó' : 'registró'}, pero la fotografía no se pudo subir.`);
      }
    });
  }

  private terminar(mensaje: string): void {
    this.guardando = false;
    this.cerrarForm();
    this.mostrarExito(mensaje);
    this.irAPagina$.next(this.pagina());
  }

  /** Validación en el cliente con las mismas reglas del backend. */
  private validar(): Record<string, string> {
    const f = this.form;
    const errores: Record<string, string> = {};
    const creando = !this.clienteEditando();

    if (creando) {
      if (!f.usuario.trim()) errores['usuario'] = 'El usuario es obligatorio';
      else if (f.usuario.trim().length > 80) errores['usuario'] = 'El usuario no puede superar 80 caracteres';

      if (!f.password) errores['password'] = 'La contraseña es obligatoria';
      else if (f.password.length < 8 || f.password.length > 100)
        errores['password'] = 'La contraseña debe tener entre 8 y 100 caracteres';

      if (f.password !== f.confirmar) errores['confirmar'] = 'Las contraseñas no coinciden';
    }

    if (!f.nombre.trim()) errores['nombre'] = 'El nombre es obligatorio';
    else if (f.nombre.trim().length > 120) errores['nombre'] = 'El nombre no puede superar 120 caracteres';

    if (!f.numeroDocumento.trim()) errores['numeroDocumento'] = 'El documento es obligatorio';
    else if (!REGEX_DOCUMENTO.test(f.numeroDocumento.trim()))
      errores['numeroDocumento'] = 'Entre 5 y 40 caracteres: letras, números, punto o guion';

    if (!f.correo.trim()) errores['correo'] = 'El correo es obligatorio';
    else if (!REGEX_CORREO.test(f.correo.trim()) || f.correo.trim().length > 160)
      errores['correo'] = 'El correo no tiene un formato válido';

    if (!f.telefono.trim()) errores['telefono'] = 'El teléfono es obligatorio';
    else if (!REGEX_TELEFONO.test(f.telefono.trim()))
      errores['telefono'] = 'El teléfono no tiene un formato válido (7 a 30 dígitos)';

    if (!f.fechaNacimiento) errores['fechaNacimiento'] = 'La fecha de nacimiento es obligatoria';
    else if (f.fechaNacimiento >= this.hoy) errores['fechaNacimiento'] = 'La fecha de nacimiento debe ser anterior a hoy';
    else if (f.fechaNacimiento < '1900-01-01') errores['fechaNacimiento'] = 'La fecha de nacimiento no es válida';

    return errores;
  }

  /** Convierte la respuesta del backend en mensajes por campo (incluye documento duplicado). */
  private mostrarError(e: HttpErrorResponse, prefijo = ''): void {
    const detalle = leerErrorApi(e);
    const campos = { ...detalle.campos };

    // El backend puede nombrar el campo "documento" o "numeroDocumento".
    if (campos['documento'] && !campos['numeroDocumento']) {
      campos['numeroDocumento'] = campos['documento'];
    }

    let mensaje = detalle.mensaje;

    if (!Object.keys(campos).length) {
      const texto = mensaje.toLowerCase();
      if (texto.includes('documento')) campos['numeroDocumento'] = mensaje;
      else if (texto.includes('correo')) campos['correo'] = mensaje;
      else if (texto.includes('usuario')) campos['usuario'] = mensaje;
      else if (e.status === 409) {
        mensaje = 'Ya existe un cliente con esos datos (documento, correo o usuario duplicado).';
      }
    }

    this.campos = campos;
    this.error = prefijo ? `${prefijo} ${mensaje}` : mensaje;
  }

  private abrirForm(form: FormCliente, vistaPrevia: string | null): void {
    this.liberarVistaPrevia();
    this.form = form;
    this.archivo = null;
    this.vistaPrevia.set(vistaPrevia);
    this.error = '';
    this.campos = {};
    this.mostrarPassword = false;
    this.mostrarForm.set(true);
  }

  private liberarVistaPrevia(): void {
    const actual = this.vistaPrevia();
    if (actual?.startsWith('blob:')) {
      URL.revokeObjectURL(actual);
    }
    this.vistaPrevia.set(null);
  }

  private mostrarExito(mensaje: string): void {
    this.exito.set(mensaje);
    setTimeout(() => this.exito.set(''), 5000);
  }

  private filtrosVacios(): FiltrosCliente {
    return { nombre: '', correo: '', telefono: '', documento: '', estado: '' };
  }

  private formVacio(): FormCliente {
    return {
      usuario: '',
      password: '',
      confirmar: '',
      nombre: '',
      numeroDocumento: '',
      correo: '',
      telefono: '',
      fechaNacimiento: ''
    };
  }

  private fechaLocal(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}