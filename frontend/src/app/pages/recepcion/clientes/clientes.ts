import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject, catchError, debounceTime, map, merge, switchMap, tap } from 'rxjs';
import { SERVER_URL } from '../../../config/api.config';
import { Paginador } from '../../../shared/ui/paginador/paginador';
import { ClienteRecepcion, FiltrosCliente } from '../../../models/recepcion.models';
import { ClienteRecepcionService, TAMANO_PAGINA_CLIENTES } from '../../../services/cliente-recepcion.service';
import { leerErrorApi } from '../../../utils/api-error';
import { Alerta } from '../components/alerta';
import { Dialogo } from '../components/dialogo';
import { Boton, Campo, Entrada } from '../components/formulario';
import { PageHeader } from '../components/page-header';
import { Panel } from '../components/panel';
import { TablaDatos, FilaTabla, CeldaTabla, Columna } from '../components/tabla-datos';

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
  imports: [FormsModule, Paginador, PageHeader, Alerta, Panel, Campo, Entrada, Boton, Dialogo, TablaDatos, FilaTabla, CeldaTabla],
  host: { class: 'block' },
  template: `
    <app-page-header eyebrow="Recepción / Clientes" titulo="Clientes">
      <button type="button" appBoton="primario" (click)="abrirCrear()">+ Nuevo</button>
    </app-page-header>

    @if (exito()) { <app-alerta tipo="exito">{{ exito() }}</app-alerta> }
    @if (errorLista()) { <app-alerta>{{ errorLista() }}</app-alerta> }

    <app-panel class="mb-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <app-campo etiqueta="Nombre" para="f-nombre">
          <input id="f-nombre" name="f-nombre" appEntrada [(ngModel)]="filtros.nombre" (ngModelChange)="alEscribirFiltro()" autocomplete="off" placeholder="Ej. Juan" />
        </app-campo>
        <app-campo etiqueta="Correo" para="f-correo">
          <input id="f-correo" name="f-correo" appEntrada [(ngModel)]="filtros.correo" (ngModelChange)="alEscribirFiltro()" autocomplete="off" placeholder="correo@dominio.com" />
        </app-campo>
        <app-campo etiqueta="Teléfono" para="f-telefono">
          <input id="f-telefono" name="f-telefono" appEntrada [(ngModel)]="filtros.telefono" (ngModelChange)="alEscribirFiltro()" autocomplete="off" placeholder="70000000" />
        </app-campo>
        <app-campo etiqueta="Documento" para="f-documento">
          <input id="f-documento" name="f-documento" appEntrada [(ngModel)]="filtros.documento" (ngModelChange)="alEscribirFiltro()" autocomplete="off" placeholder="N.º de documento" />
        </app-campo>
        <app-campo etiqueta="Estado" para="f-estado">
          <select id="f-estado" name="f-estado" appEntrada [(ngModel)]="filtros.estado" (ngModelChange)="alCambiarEstado()">
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </app-campo>
      </div>
      @if (hayFiltros) {
        <div class="mt-4 flex justify-end">
          <button type="button" (click)="limpiarFiltros()"
                  class="text-[11px] font-bold tracking-[0.2em] uppercase text-yellow-400 hover:text-yellow-300">Limpiar filtros</button>
        </div>
      }
    </app-panel>

    <app-tabla-datos [columnas]="columnas" [vacia]="clientes().length === 0"
                     [mensajeVacio]="cargando() ? 'Cargando…' : 'No se encontraron clientes.'">
      @for (c of clientes(); track c.id) {
        <tr app-fila>
          <td app-celda>
            <div class="flex items-center gap-3">
              @if (fotoSrc(c); as src) {
                <img [src]="src" [alt]="'Foto de ' + c.nombre" class="w-10 h-10 rounded-full object-cover border border-yellow-500/40" />
              } @else {
                <span class="w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold grid place-items-center">{{ iniciales(c.nombre) }}</span>
              }
              <span class="font-semibold">{{ c.nombre }}</span>
            </div>
          </td>
          <td app-celda class="text-neutral-300">{{ c.numeroDocumento || '—' }}</td>
          <td app-celda class="text-yellow-300">{{ c.usuario }}</td>
          <td app-celda class="text-neutral-400">{{ c.correo }}</td>
          <td app-celda class="text-neutral-400">{{ c.telefono }}</td>
          <td app-celda>
            <span [class]="c.activo
              ? 'px-2 py-1 text-[10px] tracking-widest uppercase border border-yellow-400/60 text-yellow-300'
              : 'px-2 py-1 text-[10px] tracking-widest uppercase border border-neutral-600 text-neutral-500'">{{ c.activo ? 'Activo' : 'Inactivo' }}</span>
          </td>
          <td app-celda class="text-right whitespace-nowrap">
            <button type="button" appBoton="neutro" class="mr-2" (click)="cambiarEstado(c)">{{ c.activo ? 'Desactivar' : 'Activar' }}</button>
            <button type="button" appBoton="acento" (click)="abrirEditar(c)">Editar</button>
          </td>
        </tr>
      }
    </app-tabla-datos>
    <app-paginador tema="oscuro" [pagina]="pagina()" [totalPaginas]="totalPaginas()"
                   [totalElementos]="totalElementos()" [tamano]="tamanoPagina" (cambiar)="irAPagina($event)" />

    @if (mostrarForm()) {
      <app-dialogo [titulo]="clienteEditando() ? 'Editar cliente' : 'Nuevo cliente'" (cerrar)="cerrarForm()">
        <form (ngSubmit)="guardar()" class="space-y-5" novalidate>

          <div class="flex items-center gap-5">
            @if (vistaPrevia(); as src) {
              <img [src]="src" alt="Vista previa de la fotografía" class="w-24 h-24 rounded-full object-cover border-2 border-yellow-500/50" />
            } @else {
              <span class="w-24 h-24 rounded-full bg-neutral-900 border-2 border-dashed border-neutral-700 text-neutral-600 text-[10px] tracking-widest grid place-items-center text-center">SIN FOTO</span>
            }
            <div class="flex-1">
              <app-campo etiqueta="Fotografía" para="foto" [error]="campos['foto']">
                <input id="foto" name="foto" type="file" accept="image/jpeg,image/png" (change)="alElegirFoto($event)"
                       class="block w-full text-xs text-neutral-400 file:mr-4 file:border-0 file:bg-yellow-400 file:text-black file:font-bold file:text-[11px] file:tracking-widest file:uppercase file:px-4 file:py-2 file:cursor-pointer hover:file:bg-yellow-300" />
              </app-campo>
              <p class="text-neutral-600 text-xs mt-1">JPEG o PNG, máximo 5 MB.</p>
            </div>
          </div>

          @if (!clienteEditando()) {
            <div class="grid sm:grid-cols-2 gap-4">
              <app-campo etiqueta="Usuario" para="usuario" [error]="campos['usuario']">
                <input id="usuario" name="usuario" appEntrada [invalido]="!!campos['usuario']" [(ngModel)]="form.usuario" autocomplete="off" placeholder="Usuario para iniciar sesión" maxlength="80" />
              </app-campo>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <app-campo etiqueta="Contraseña" para="password" [error]="campos['password']">
                <div class="relative">
                  <input id="password" name="password" appEntrada class="pr-16" [invalido]="!!campos['password']"
                         [type]="mostrarPassword ? 'text' : 'password'" [(ngModel)]="form.password"
                         autocomplete="new-password" placeholder="Mínimo 8 caracteres" maxlength="100" />
                  <button type="button" (click)="mostrarPassword = !mostrarPassword"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wider text-neutral-500 hover:text-yellow-400">{{ mostrarPassword ? 'OCULTAR' : 'VER' }}</button>
                </div>
              </app-campo>
              <app-campo etiqueta="Repetir contraseña" para="confirmar" [error]="campos['confirmar']">
                <input id="confirmar" name="confirmar" appEntrada [invalido]="!!campos['confirmar']"
                       [type]="mostrarPassword ? 'text' : 'password'" [(ngModel)]="form.confirmar" autocomplete="new-password" />
              </app-campo>
            </div>
          } @else {
            <p class="text-xs text-neutral-500">Usuario de acceso: <span class="text-yellow-300 font-semibold">{{ form.usuario }}</span></p>
          }

          <div class="grid sm:grid-cols-2 gap-4">
            <app-campo etiqueta="Nombre completo" para="nombre" [error]="campos['nombre']">
              <input id="nombre" name="nombre" appEntrada [invalido]="!!campos['nombre']" [(ngModel)]="form.nombre" maxlength="120" />
            </app-campo>
            <app-campo etiqueta="N.º de documento" para="numeroDocumento" [error]="campos['numeroDocumento']">
              <input id="numeroDocumento" name="numeroDocumento" appEntrada [invalido]="!!campos['numeroDocumento']" [(ngModel)]="form.numeroDocumento" maxlength="40" autocomplete="off" placeholder="CI / Pasaporte" />
            </app-campo>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <app-campo etiqueta="Correo" para="correo" [error]="campos['correo']">
              <input id="correo" name="correo" type="email" appEntrada [invalido]="!!campos['correo']" [(ngModel)]="form.correo" maxlength="160" />
            </app-campo>
            <app-campo etiqueta="Teléfono" para="telefono" [error]="campos['telefono']">
              <input id="telefono" name="telefono" type="tel" appEntrada [invalido]="!!campos['telefono']" [(ngModel)]="form.telefono" placeholder="+591 70000000" />
            </app-campo>
          </div>

          <div class="sm:w-1/2">
            <app-campo etiqueta="Fecha de nacimiento" para="fechaNacimiento" [error]="campos['fechaNacimiento']">
              <input id="fechaNacimiento" name="fechaNacimiento" type="date" appEntrada [invalido]="!!campos['fechaNacimiento']" [max]="hoy" [(ngModel)]="form.fechaNacimiento" />
            </app-campo>
          </div>

          @if (error) { <app-alerta>{{ error }}</app-alerta> }

          <div class="flex gap-3 pt-2">
            <button type="button" appBoton="secundario" class="flex-1" (click)="cerrarForm()">Cancelar</button>
            <button type="submit" appBoton="primario" class="flex-1" [disabled]="guardando">
              {{ guardando ? 'Guardando…' : (clienteEditando() ? 'Guardar cambios' : 'Crear cliente') }}
            </button>
          </div>
        </form>
      </app-dialogo>
    }
  `
})
export class ClientesComponent implements OnInit {
  private readonly service = inject(ClienteRecepcionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tamanoPagina = TAMANO_PAGINA_CLIENTES;

  // - Listado (desde el backend) --
    readonly columnas: Columna[] = [
    { titulo: 'Cliente' }, { titulo: 'Documento' }, { titulo: 'Usuario' }, { titulo: 'Correo' },
    { titulo: 'Teléfono' }, { titulo: 'Estado' }, { titulo: 'Acciones', derecha: true },
  ];
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

  // =========================== ESTADO (ACTIVAR / DESACTIVAR) ===========================
  /** Solo recepción puede activar a un cliente; los clientes nuevos nacen inactivos. */
  cambiarEstado(cliente: ClienteRecepcion): void {
    const nuevo = !cliente.activo;
    if (!confirm(`¿${nuevo ? 'Activar' : 'Desactivar'} a ${cliente.nombre}?`)) {
      return;
    }
    this.errorLista.set('');
    this.service.cambiarEstado(cliente.id, nuevo).subscribe({
      next: () => {
        this.mostrarExito(`Cliente "${cliente.nombre}" ${nuevo ? 'activado' : 'desactivado'}.`);
        this.irAPagina$.next(this.pagina());
      },
      error: (e: HttpErrorResponse) => this.errorLista.set(leerErrorApi(e).mensaje)
    });
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