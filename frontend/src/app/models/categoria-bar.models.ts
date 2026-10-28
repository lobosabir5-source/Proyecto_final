
export interface CategoriaBar {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: number;
}

export interface GuardarCategoriaBar {
  nombre: string;
  descripcion: string;
}

export interface PaginaCategoriasBar {
  content: CategoriaBar[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
