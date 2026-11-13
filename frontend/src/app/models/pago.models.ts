export type MetodoPagoMembresia = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export interface PagoMembresia {
  id: number;
  membresiaId: number;
  cliente: string;
  monto: number;
  metodo: MetodoPagoMembresia;
  fechaPago: string;
  registradoPor: string;
}