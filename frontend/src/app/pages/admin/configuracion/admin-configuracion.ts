import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import {
  ConfiguracionService,
  Configuracion,
  DatosGenerales,
  DatosTelefono,
  DatosRed,
  DatosHorario,
  Telefono,
  RedSocial,
  Horario,
} from "../../../services/configuracion.service";
import { leerErrorApi } from "../../../utils/api-error";

@Component({
  selector: "app-admin-configuracion",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./admin-configuracion.html",
  styleUrl: "./admin-configuracion.css",
})
export class AdminConfiguracion implements OnInit {
  private readonly api = inject(ConfiguracionService);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal("");
  readonly mensaje = signal("");
  readonly telefonos = signal<Telefono[]>([]);
  readonly redes = signal<RedSocial[]>([]);
  readonly horarios = signal<Horario[]>([]);
  readonly dias = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  general: DatosGenerales = {
    nombreComercial: "",
    correoContacto: "",
    descripcion: "",
    direccion: "",
    logoUrl: null,
    portadaUrl: null,
    colorPrimario: "#D4AF37",
    colorSecundario: "#171717",
  };
  telefono: DatosTelefono = this.telefonoVacio();
  red: DatosRed = this.redVacia();
  horario: DatosHorario = this.horarioVacio();
  telefonoId: number | null = null;
  redId: number | null = null;
  horarioId: number | null = null;

  ngOnInit(): void {
    this.recargar();
  }
  recargar(): void {
    this.cargando.set(true);
    this.error.set("");
    this.api.obtener().subscribe({
      next: (data: Configuracion) => {
        this.general = {
          nombreComercial: data.nombreComercial ?? "",
          correoContacto: data.correoContacto ?? "",
          descripcion: data.descripcion ?? "",
          direccion: data.direccion ?? "",
          logoUrl: data.logoUrl,
          portadaUrl: data.portadaUrl,
          colorPrimario: data.colorPrimario,
          colorSecundario: data.colorSecundario,
        };
        this.refrescarListas();
        this.cargando.set(false);
      },
      error: (e) => {
        this.fallo(e);
        this.cargando.set(false);
      },
    });
  }
  private refrescarListas(): void {
    this.api
      .listarTelefonos()
      .subscribe({
        next: (x) => this.telefonos.set(x),
        error: (e) => this.fallo(e),
      });
    this.api
      .listarRedes()
      .subscribe({
        next: (x) => this.redes.set(x),
        error: (e) => this.fallo(e),
      });
    this.api
      .listarHorarios()
      .subscribe({
        next: (x) => this.horarios.set(x),
        error: (e) => this.fallo(e),
      });
  }
  private fallo(e: HttpErrorResponse): void {
    this.error.set(leerErrorApi(e).mensaje);
    this.guardando.set(false);
  }
  private exito(mensaje: string): void {
    this.mensaje.set(mensaje);
    this.error.set("");
    this.guardando.set(false);
    this.refrescarListas();
  }
  guardarGeneral(): void {
    this.guardando.set(true);
    this.mensaje.set("");
    this.api
      .guardarGeneral(this.general)
      .subscribe({
        next: () => this.exito("Datos generales guardados."),
        error: (e) => this.fallo(e),
      });
  }
  guardarTelefono(): void {
    this.guardando.set(true);
    this.mensaje.set("");
    const req =
      this.telefonoId === null
        ? this.api.crearTelefono(this.telefono)
        : this.api.editarTelefono(this.telefonoId, this.telefono);
    req.subscribe({
      next: () => {
        this.cancelarTelefono();
        this.exito("Teléfono guardado.");
      },
      error: (e) => this.fallo(e),
    });
  }
  editarTelefono(x: Telefono): void {
    this.telefonoId = x.id;
    this.telefono = {
      numero: x.numero,
      etiqueta: x.etiqueta,
      whatsapp: x.whatsapp,
      principal: x.principal,
      activo: x.activo,
      orden: x.orden,
    };
  }
  cancelarTelefono(): void {
    this.telefonoId = null;
    this.telefono = this.telefonoVacio();
  }
  borrarTelefono(x: Telefono): void {
    if (!confirm(`¿Eliminar el teléfono ${x.numero}?`)) return;
    this.api
      .eliminarTelefono(x.id)
      .subscribe({
        next: () => this.exito("Teléfono eliminado."),
        error: (e) => this.fallo(e),
      });
  }
  guardarRed(): void {
    this.guardando.set(true);
    this.mensaje.set("");
    const req =
      this.redId === null
        ? this.api.crearRed(this.red)
        : this.api.editarRed(this.redId, this.red);
    req.subscribe({
      next: () => {
        this.cancelarRed();
        this.exito("Red social guardada.");
      },
      error: (e) => this.fallo(e),
    });
  }
  editarRed(x: RedSocial): void {
    this.redId = x.id;
    this.red = {
      plataforma: x.plataforma,
      url: x.url,
      nombreUsuario: x.nombreUsuario,
      icono: x.icono,
      activo: x.activo,
      orden: x.orden,
    };
  }
  cancelarRed(): void {
    this.redId = null;
    this.red = this.redVacia();
  }
  borrarRed(x: RedSocial): void {
    if (!confirm(`¿Eliminar ${x.plataforma}?`)) return;
    this.api
      .eliminarRed(x.id)
      .subscribe({
        next: () => this.exito("Red social eliminada."),
        error: (e) => this.fallo(e),
      });
  }
  guardarHorario(): void {
    this.guardando.set(true);
    this.mensaje.set("");
    const datos = {
      ...this.horario,
      apertura: this.horario.cerrado ? null : this.horario.apertura,
      cierre: this.horario.cerrado ? null : this.horario.cierre,
    };
    const req =
      this.horarioId === null
        ? this.api.crearHorario(datos)
        : this.api.editarHorario(this.horarioId, datos);
    req.subscribe({
      next: () => {
        this.cancelarHorario();
        this.exito("Horario guardado.");
      },
      error: (e) => this.fallo(e),
    });
  }
  editarHorario(x: Horario): void {
    this.horarioId = x.id;
    this.horario = {
      diaSemana: x.diaSemana,
      apertura: x.apertura?.slice(0, 5) ?? null,
      cierre: x.cierre?.slice(0, 5) ?? null,
      cerrado: x.cerrado,
    };
  }
  cancelarHorario(): void {
    this.horarioId = null;
    this.horario = this.horarioVacio();
  }
  borrarHorario(x: Horario): void {
    if (!confirm(`¿Eliminar horario de ${this.dias[x.diaSemana - 1]}?`)) return;
    this.api
      .eliminarHorario(x.id)
      .subscribe({
        next: () => this.exito("Horario eliminado."),
        error: (e) => this.fallo(e),
      });
  }
  private telefonoVacio(): DatosTelefono {
    return {
      numero: "",
      etiqueta: "",
      whatsapp: false,
      principal: false,
      activo: true,
      orden: 0,
    };
  }
  private redVacia(): DatosRed {
    return {
      plataforma: "",
      url: "",
      nombreUsuario: "",
      icono: "",
      activo: true,
      orden: 0,
    };
  }
  private horarioVacio(): DatosHorario {
    return { diaSemana: 1, apertura: "06:00", cierre: "22:00", cerrado: false };
  }
}
