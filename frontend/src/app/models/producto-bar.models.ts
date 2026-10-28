
export interface ProductoBar {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  estado: number;
  creadoEn: string;
  categoriaId: number;
  categoriaNombre: string;
}

export interface GuardarProductoBar {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  categoriaId: number;
}

export interface PaginaProductosBar {
  content: ProductoBar[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface FiltrosProductosBar {
  nombre?: string;
  categoriaId?: number | null;
  estado?: number | null;
}
