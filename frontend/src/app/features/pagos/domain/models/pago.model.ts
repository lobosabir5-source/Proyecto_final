export type MetodoPago = 'EFECTIVO' | 'QR';

export interface Pago {
  id: number;
  membresiaId: number;
  cliente: string;
  monto: number;
  metodo: MetodoPago;
  fechaPago: string;
  registradoPor: string;
}

/** Datos mínimos de una membresía para saber cuánto se debe. */
export interface MembresiaConSaldo {
  id: number;
  cliente: string;
  plan: string;
  estado: string;
  saldo: number;
}

export interface NuevoPago {
  membresiaId: number;
  monto: number;
  metodo: MetodoPago;
}