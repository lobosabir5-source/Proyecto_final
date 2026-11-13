export interface AsistenciaRegistrada {
  id: number;
  clienteId: number;
  cliente: string;
  fecha: string;
  horaEntrada: string;
  registradaPor: string;
}

export interface ClienteBusqueda {
  id: number;
  usuario: string;
  nombre: string;
  correo: string;
}