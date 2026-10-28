
export interface CrearPedidoBarItem {
  productoId: number;
  cantidad: number;
}

export interface CrearPedidoBarRequest {
  usuarioId: number;
  metodoPagoId: number;
  items: CrearPedidoBarItem[];
}

export interface PedidoBarItem {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoBar {
  id: number;
  usuarioId: number;
  metodoPagoId: number;
  total: number;
  estado: number;
  estadoPago: number;
  fechaPedido: string;
  items: PedidoBarItem[];
}

export interface PaginaPedidosBar {
  content: PedidoBar[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
