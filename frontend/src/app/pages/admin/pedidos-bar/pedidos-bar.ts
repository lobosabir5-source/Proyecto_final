
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { UsuarioService } from '../../../services/usuario.service';
import { ProductoBarService } from '../../../services/producto-bar.service';
import { PedidoBarService } from '../../../services/pedido-bar.service';
import { MetodoPagoBarService } from '../../../services/metodo-pago-bar.service';

import { ProductoBar } from '../../../models/producto-bar.models';
import { PedidoBar } from '../../../models/pedido-bar.models';
import { MetodoPagoBar } from '../../../models/metodo-pago-bar.models';

import { UiTable } from '../../../components/ui-table/ui-table';
import { Paginador } from '../../../components/paginador/paginador';

interface UsuarioSeleccionable {
  id: number;
  usuario: string;
  activo: boolean;
}

interface ItemCarrito {
  producto: ProductoBar;
  cantidad: number;
}

@Component({
  selector: 'app-pedidos-bar',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, UiTable, Paginador],
  templateUrl: './pedidos-bar.html',
  styleUrl: './pedidos-bar.css',
})
export class PedidosBar implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly productoService = inject(ProductoBarService);
  private readonly pedidoService = inject(PedidoBarService);
  private readonly metodoService = inject(MetodoPagoBarService);

  readonly usuarios = signal<UsuarioSeleccionable[]>([]);
  readonly productos = signal<ProductoBar[]>([]);
  readonly metodos = signal<MetodoPagoBar[]>([]);
  readonly carrito = signal<ItemCarrito[]>([]);
  readonly pedidos = signal<PedidoBar[]>([]);

  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');

  readonly paginaPedidos = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);

  readonly paginaUsuarios = signal(0);
  readonly totalPaginasUsuarios = signal(0);

  readonly paginaProductos = signal(0);
  readonly totalPaginasProductos = signal(0);

  usuarioId: number | null = null;
  metodoPagoId: number | null = null;
  busquedaProducto = '';
  readonly pedidoSeleccionado = signal<PedidoBar | null>(null);

  readonly totalEstimado = computed(() =>
    this.carrito().reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0,
    ),
  );

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarMetodos();
    this.buscarProductos();
    this.cargarPedidos();
  }

  cargarUsuarios(pagina = 0): void {
    this.usuarioService.listar(pagina, 10).subscribe({
      next: respuesta => {
        this.usuarios.set(
          respuesta.content.filter(usuario => usuario.activo),
        );
        this.paginaUsuarios.set(respuesta.number);
        this.totalPaginasUsuarios.set(respuesta.totalPages);
      },
      error: error => this.error.set(this.obtenerError(error)),
    });
  }

  cargarMetodos(pagina = 0): void {
    this.metodoService.listar(pagina).subscribe({
      next: respuesta => {
        this.metodos.update(actuales => [
          ...actuales,
          ...respuesta.content.filter(
            metodo => !actuales.some(a => a.id === metodo.id),
          ),
        ]);

        if (pagina + 1 < respuesta.totalPages) {
          this.cargarMetodos(pagina + 1);
        }
      },
      error: error => this.error.set(this.obtenerError(error)),
    });
  }

  buscarProductos(pagina = 0): void {
    this.productoService.listar(pagina, {
      nombre: this.busquedaProducto,
      estado: 1,
    }).subscribe({
      next: respuesta => {
        this.productos.set(respuesta.content);
        this.paginaProductos.set(respuesta.number);
        this.totalPaginasProductos.set(respuesta.totalPages);
      },
      error: error => this.error.set(this.obtenerError(error)),
    });
  }

  agregarProducto(producto: ProductoBar): void {
    const existente = this.carrito().find(
      item => item.producto.id === producto.id,
    );

    if (existente) {
      if (existente.cantidad >= producto.stock) {
        this.error.set('No hay suficiente stock disponible.');
        return;
      }

      this.carrito.update(items =>
        items.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        ),
      );
    } else {
      if (producto.stock <= 0) {
        this.error.set('El producto no tiene stock.');
        return;
      }

      this.carrito.update(items => [
        ...items,
        { producto, cantidad: 1 },
      ]);
    }

    this.error.set('');
  }

  cambiarCantidad(productoId: number, cantidad: number): void {
    const item = this.carrito().find(
      i => i.producto.id === productoId,
    );

    if (!item) return;

    const cantidadValida = Math.trunc(cantidad);

    if (!Number.isFinite(cantidadValida) || cantidadValida < 1) {
      return;
    }

    if (cantidadValida > item.producto.stock) {
      this.error.set('La cantidad supera el stock disponible.');
      return;
    }

    this.carrito.update(items =>
      items.map(i =>
        i.producto.id === productoId
          ? { ...i, cantidad: cantidadValida }
          : i,
      ),
    );

    this.error.set('');
  }

  quitarProducto(productoId: number): void {
    this.carrito.update(items =>
      items.filter(item => item.producto.id !== productoId),
    );
  }

  registrarPedido(): void {
    if (this.guardando()) return;

    if (!this.usuarioId || !this.metodoPagoId) {
      this.error.set('Selecciona un usuario y un método de pago.');
      return;
    }

    if (this.carrito().length === 0) {
      this.error.set('Agrega al menos un producto.');
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');

    this.pedidoService.crear({
      usuarioId: this.usuarioId,
      metodoPagoId: this.metodoPagoId,
      items: this.carrito().map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
      })),
    }).subscribe({
      next: pedido => {
        this.guardando.set(false);
        this.carrito.set([]);
        this.mensaje.set(
          `Pedido #${pedido.id} registrado. Pago pendiente.`,
        );
        this.pedidoSeleccionado.set(pedido);
        this.buscarProductos(this.paginaProductos());
        this.cargarPedidos(0);
      },
      error: (error: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(this.obtenerError(error));
        this.buscarProductos(this.paginaProductos());
      },
    });
  }

  cargarPedidos(pagina = 0): void {
    this.cargando.set(true);

    this.pedidoService.listar(pagina).subscribe({
      next: respuesta => {
        this.pedidos.set(respuesta.content);
        this.paginaPedidos.set(respuesta.number);
        this.totalPaginas.set(respuesta.totalPages);
        this.totalElementos.set(respuesta.totalElements);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.obtenerError(error));
        this.cargando.set(false);
      },
    });
  }

  verDetalle(pedido: PedidoBar): void {
    this.pedidoService.obtener(pedido.id).subscribe({
      next: respuesta => this.pedidoSeleccionado.set(respuesta),
      error: error => this.error.set(this.obtenerError(error)),
    });
  }

  private obtenerError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
    if (error.status === 403) {
      return 'No tienes permisos para realizar esta operación.';
    }
    if (error.status === 409) {
      return 'Conflicto al registrar el pedido. Verifica el stock.';
    }
    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }
    return 'Ocurrió un error al procesar la solicitud.';
  }
}
