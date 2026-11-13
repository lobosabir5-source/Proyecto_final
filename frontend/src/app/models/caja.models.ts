export type MetodoPago = 'EFECTIVO' | 'QR';
export type TipoMovimiento = 'INGRESO' | 'EGRESO';

export interface Caja {
  id: number;
  estado: 'ABIERTA' | 'CERRADA';
  montoInicial: number;
  fechaApertura: string;
  fechaCierre: string | null;
  efectivoContado: number | null;
  abiertaPor: string;
  cerradaPor: string | null;
  observaciones: string | null;
}

export interface MovimientoCaja {
  id: number;
  cajaId: number;
  tipo: TipoMovimiento;
  metodo: MetodoPago;
  monto: number;
  concepto: string;
  fecha: string;
  usuario: string;
}

export interface ResumenCaja {
  cajaId: number;
  estado: string;
  montoInicial: number;
  ingresosEfectivo: number;
  ingresosQr: number;
  egresosEfectivo: number;
  egresosQr: number;
  efectivoEsperado: number;
  efectivoContado: number | null;
  diferencia: number | null;
}

export interface NuevoMovimientoCaja {
  tipo: TipoMovimiento;
  metodo: MetodoPago;
  monto: number;
  concepto: string;
}