export interface RachaAsistencia {
  [clave: string]: unknown;
}

export interface Carnet {
  clienteId: number;
  nombreCompleto: string;
  numeroDocumento: string | null;
  fotoUrl: string | null;
  membresiaId: number | null;
  plan: string | null;
  estado: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  permisosUsadosMes: number;
  permisosDisponiblesMes: number;
  circulosPermisos: boolean[];
  rachaAsistencia: RachaAsistencia | null;
}