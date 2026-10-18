import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { API_URL } from "../config/api.config";

export interface Telefono {
  id: number;
  numero: string;
  etiqueta: string;
  whatsapp: boolean;
  principal: boolean;
  activo: boolean;
  orden: number;
}
export interface RedSocial {
  id: number;
  plataforma: string;
  url: string;
  nombreUsuario: string;
  icono: string;
  activo: boolean;
  orden: number;
}
export interface Horario {
  id: number;
  diaSemana: number;
  apertura: string | null;
  cierre: string | null;
  cerrado: boolean;
}
export interface Seccion {
  id: number;
  clave: string;
  titulo: string;
  contenido: string;
  imagenUrl: string;
  orden: number;
}
export interface Configuracion {
  id: number | null;
  nombreComercial: string;
  correoContacto: string;
  descripcion: string;
  direccion: string;
  logoUrl: string | null;
  portadaUrl: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  telefonos: Telefono[];
  redesSociales: RedSocial[];
  horarios: Horario[];
  secciones: Seccion[];
}
export type DatosGenerales = Pick<
  Configuracion,
  | "nombreComercial"
  | "correoContacto"
  | "descripcion"
  | "direccion"
  | "logoUrl"
  | "portadaUrl"
  | "colorPrimario"
  | "colorSecundario"
>;
export type DatosTelefono = Omit<Telefono, "id">;
export type DatosRed = Omit<RedSocial, "id">;
export type DatosHorario = Omit<Horario, "id">;

@Injectable({ providedIn: "root" })
export class ConfiguracionService {
  private readonly http = inject(HttpClient);
  private readonly admin = `${API_URL}/admin/configuracion`;
  obtenerPublica() {
    return this.http.get<Configuracion>(`${API_URL}/public/configuracion`);
  }
  obtener() {
    return this.http.get<Configuracion>(this.admin);
  }
  guardarGeneral(datos: DatosGenerales) {
    return this.http.put<Configuracion>(this.admin, datos);
  }
  listarTelefonos() {
    return this.http.get<Telefono[]>(`${this.admin}/telefonos`);
  }
  crearTelefono(datos: DatosTelefono) {
    return this.http.post<Telefono>(`${this.admin}/telefonos`, datos);
  }
  editarTelefono(id: number, datos: DatosTelefono) {
    return this.http.put<Telefono>(`${this.admin}/telefonos/${id}`, datos);
  }
  eliminarTelefono(id: number) {
    return this.http.delete<void>(`${this.admin}/telefonos/${id}`);
  }
  listarRedes() {
    return this.http.get<RedSocial[]>(`${this.admin}/redes-sociales`);
  }
  crearRed(datos: DatosRed) {
    return this.http.post<RedSocial>(`${this.admin}/redes-sociales`, datos);
  }
  editarRed(id: number, datos: DatosRed) {
    return this.http.put<RedSocial>(
      `${this.admin}/redes-sociales/${id}`,
      datos,
    );
  }
  eliminarRed(id: number) {
    return this.http.delete<void>(`${this.admin}/redes-sociales/${id}`);
  }
  listarHorarios() {
    return this.http.get<Horario[]>(`${this.admin}/horarios`);
  }
  crearHorario(datos: DatosHorario) {
    return this.http.post<Horario>(`${this.admin}/horarios`, datos);
  }
  editarHorario(id: number, datos: DatosHorario) {
    return this.http.put<Horario>(`${this.admin}/horarios/${id}`, datos);
  }
  eliminarHorario(id: number) {
    return this.http.delete<void>(`${this.admin}/horarios/${id}`);
  }
}
