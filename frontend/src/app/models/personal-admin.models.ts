export type CargoPersonal = 'ADMINISTRATIVO' | 'INSTRUCTOR' | 'LIMPIEZA';
export type EstadoLaboral = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'RETIRADO';

/** Campos de /api/admin/personal que usan los módulos de equipos, mantenimiento y aeróbicos. */
export interface PersonalAdmin {
  id: number;
  nombres: string;
  apellidos: string;
  cargo: CargoPersonal;
  estadoLaboral: EstadoLaboral;
}