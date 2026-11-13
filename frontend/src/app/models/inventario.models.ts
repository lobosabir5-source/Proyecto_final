import { Pagina } from './admin.models';

export type CategoriaInventario = 'LIMPIEZA' | 'BEBIDA' | 'LACTEO' | 'OTRO';
export type UnidadInventario = 'UNIDAD' | 'LITRO' | 'MILILITRO' | 'KILOGRAMO' | 'GRAMO' | 'PAQUETE';
export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

/** Mismos valores que valida el backend (InventarioGeneralService). */
export const CATEGORIAS_INVENTARIO: { valor: CategoriaInventario; etiqueta: string }[] = [
  { valor: 'LIMPIEZA', etiqueta: 'Limpieza' },
  { valor: 'BEBIDA', etiqueta: 'Bebida' },
  { valor: 'LACTEO', etiqueta: 'Lácteo' },
  { valor: 'OTRO', etiqueta: 'Otro' },
];

export const UNIDADES_INVENTARIO: { valor: UnidadInventario; etiqueta: string }[] = [
  { valor: 'UNIDAD', etiqueta: 'Unidad' },
  { valor: 'LITRO', etiqueta: 'Litro' },
  { valor: 'MILILITRO', etiqueta: 'Mililitro' },
  { valor: 'KILOGRAMO', etiqueta: 'Kilogramo' },
  { valor: 'GRAMO', etiqueta: 'Gramo' },
  { valor: 'PAQUETE', etiqueta: 'Paquete' },
];

export interface ItemInventario {
  id: number;
  nombre: string;
  categoria: CategoriaInventario;
  unidad: UnidadInventario;
  existencia: number;
  minimo: number;
  /** El backend lo calcula como existencia <= mínimo. */
  alertaMinimo: boolean;
  descripcion: string | null;
  activo: boolean;
}

export interface GuardarItemInventario {
  nombre: string;
  categoria: CategoriaInventario;
  unidad: UnidadInventario;
  minimo: number;
  descripcion: string | null;
}

export interface MovimientoInventario {
  id: number;
  itemId: number;
  tipo: TipoMovimiento;
  cantidad: number;
  saldoAnterior: number;
  saldoPosterior: number;
  responsable: string | null;
  motivo: string | null;
  fecha: string;
}

export interface RegistrarMovimientoInventario {
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string | null;
}

export interface FiltrosInventario {
  nombre: string;
  categoria: '' | CategoriaInventario;
  /** '' = todos, 'true' = activos, 'false' = inactivos */
  activo: '' | 'true' | 'false';
  bajoMinimo: boolean;
}

export type PaginaInventario = Pagina<ItemInventario>;
export type PaginaMovimientos = Pagina<MovimientoInventario>;