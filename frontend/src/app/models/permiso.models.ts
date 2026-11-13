export type EstadoPermiso = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | string;

export interface PermisoAusencia {
  id: number;
  membresiaId: number;
  motivo: string;
  diasAgregados: number;
  solicitadoEn: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPermiso;
  resueltoEn: string | null;
}