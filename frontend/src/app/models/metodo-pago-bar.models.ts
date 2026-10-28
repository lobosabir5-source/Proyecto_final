
export interface MetodoPagoBar {
  id: number;
  nombre: string;
}

export interface PaginaMetodosPagoBar {
  content: MetodoPagoBar[];
  number: number;
  totalPages: number;
  totalElements: number;
}
