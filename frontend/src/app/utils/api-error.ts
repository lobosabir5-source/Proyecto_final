import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorApi {
  mensaje: string;
  campos: Record<string, string>;
}

interface CuerpoError {
  message?: string;
  fields?: Record<string, string>;
}

export function leerErrorApi(error: HttpErrorResponse): ErrorApi {
  if (error.status === 0) {
    return { mensaje: 'No se pudo conectar con el servidor.', campos: {} };
  }

  if (error.status === 401 || error.status === 403) {
    return { mensaje: 'Tu sesión expiró o no tienes permisos para esta acción.', campos: {} };
  }

  const cuerpo = error.error as CuerpoError | null;
  return {
    mensaje: cuerpo?.message || 'Ocurrió un error inesperado.',
    campos: cuerpo?.fields ?? {}
  };
}
