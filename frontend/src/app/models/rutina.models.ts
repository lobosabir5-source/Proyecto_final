export interface Rutina {
  id: number;
  clienteId: number;
  cliente: string;
  nombre: string;
  contenido: string;
  fechaCreacion: string;
  activa: boolean;
}

export interface GuardarRutina {
  clienteId: number;
  nombre: string;
  contenido: string;
}

export interface ActualizarRutina {
  nombre: string;
  contenido: string;
}