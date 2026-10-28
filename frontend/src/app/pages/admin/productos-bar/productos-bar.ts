
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { UiTable } from '../../../components/ui-table/ui-table';
import { Paginador } from '../../../components/paginador/paginador';

import { ProductoBarService } from '../../../services/producto-bar.service';
import { CategoriaBarService } from '../../../services/categoria-bar.service';

import {
  ProductoBar,
  GuardarProductoBar,
  FiltrosProductosBar,
} from '../../../models/producto-bar.models';
import { CategoriaBar } from '../../../models/categoria-bar.models';

@Component({
  selector: 'app-productos-bar',
  standalone: true,
  imports: [ReactiveFormsModule, UiTable, Paginador],
  templateUrl: './productos-bar.html',
  styleUrl: './productos-bar.css',
})
export class ProductosBar implements OnInit {
  private readonly servicio = inject(ProductoBarService);
  private readonly categoriasServicio = inject(CategoriaBarService);
  private readonly fb = inject(FormBuilder);

  readonly productos = signal<ProductoBar[]>([]);
  readonly categorias = signal<CategoriaBar[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly formularioVisible = signal(false);
  readonly editandoId = signal<number | null>(null);

  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly totalElementos = signal(0);

  readonly error = signal('');
  readonly mensaje = signal('');

  readonly filtros = this.fb.nonNullable.group({
    nombre: [''],
    categoriaId: [''],
    estado: ['1'],
  });

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', Validators.maxLength(255)],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    imagenUrl: ['', Validators.maxLength(500)],
    categoriaId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias(): void {
    this.categoriasServicio.listar(0).subscribe({
      next: respuesta => {
        this.categorias.set(respuesta.content);
      },
      error: error => {
        this.error.set(this.obtenerError(error));
      },
    });
  }

  cargarProductos(pagina = 0): void {
    const valores = this.filtros.getRawValue();

    const filtros: FiltrosProductosBar = {
      nombre: valores.nombre,
      categoriaId: valores.categoriaId
        ? Number(valores.categoriaId)
        : null,
      estado: valores.estado === ''
        ? null
        : Number(valores.estado),
    };

    this.cargando.set(true);
    this.error.set('');

    this.servicio.listar(pagina, filtros).subscribe({
      next: respuesta => {
        this.productos.set(respuesta.content);
        this.pagina.set(respuesta.number);
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

  buscar(): void {
    this.cargarProductos(0);
  }

  limpiarFiltros(): void {
    this.filtros.reset({
      nombre: '',
      categoriaId: '',
      estado: '1',
    });
    this.cargarProductos(0);
  }

  nuevoProducto(): void {
    this.formulario.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      imagenUrl: '',
      categoriaId: 0,
    });

    this.editandoId.set(null);
    this.formularioVisible.set(true);
    this.error.set('');
    this.mensaje.set('');
  }

  editar(producto: ProductoBar): void {
    this.formulario.reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precio: producto.precio,
      stock: producto.stock,
      imagenUrl: producto.imagenUrl ?? '',
      categoriaId: producto.categoriaId,
    });

    this.editandoId.set(producto.id);
    this.formularioVisible.set(true);
    this.error.set('');
    this.mensaje.set('');
  }

  cancelar(): void {
    this.formularioVisible.set(false);
    this.editandoId.set(null);
    this.formulario.reset();
  }

  guardar(): void {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();

    const datos: GuardarProductoBar = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      imagenUrl: valores.imagenUrl.trim(),
      categoriaId: Number(valores.categoriaId),
    };

    this.guardando.set(true);
    this.error.set('');

    const id = this.editandoId();

    const operacion = id === null
      ? this.servicio.crear(datos)
      : this.servicio.actualizar(id, datos);

    operacion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cancelar();
        this.mensaje.set(
          id === null
            ? 'Producto registrado correctamente.'
            : 'Producto actualizado correctamente.',
        );
        this.cargarProductos(id === null ? 0 : this.pagina());
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.obtenerError(error));
        this.guardando.set(false);
      },
    });
  }

  eliminar(producto: ProductoBar): void {
    if (!window.confirm(
      `¿Deseas desactivar el producto "${producto.nombre}"?`,
    )) {
      return;
    }

    this.servicio.eliminar(producto.id).subscribe({
      next: () => {
        this.mensaje.set('Producto desactivado correctamente.');

        const destino =
          this.productos().length === 1 && this.pagina() > 0
            ? this.pagina() - 1
            : this.pagina();

        this.cargarProductos(destino);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.obtenerError(error));
      },
    });
  }

  cambiarPagina(pagina: number): void {
    this.cargarProductos(pagina);
  }

  private obtenerError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }

    if (error.status === 403) {
      return 'No tienes permisos para realizar esta operación.';
    }

    if (error.status === 409) {
      return 'El producto ya existe o presenta un conflicto.';
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }

    return 'Ocurrió un error al procesar la solicitud.';
  }
}
