
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { UiTable } from '../../../components/ui-table/ui-table';
import { Paginador } from '../../../components/paginador/paginador';
import { CategoriaBarService } from '../../../services/categoria-bar.service';
import {
  CategoriaBar,
  GuardarCategoriaBar,
} from '../../../models/categoria-bar.models';

@Component({
  selector: 'app-categorias-bar',
  standalone: true,
  imports: [ReactiveFormsModule, UiTable, Paginador],
  templateUrl: './categorias-bar.html',
  styleUrl: './categorias-bar.css',
})
export class CategoriasBar implements OnInit {
  private readonly servicio = inject(CategoriaBarService);
  private readonly fb = inject(FormBuilder);

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

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: [''],
  });

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(pagina = 0): void {
    this.cargando.set(true);
    this.error.set('');

    this.servicio.listar(pagina).subscribe({
      next: (respuesta) => {
        this.categorias.set(respuesta.content);
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

  nuevaCategoria(): void {
    this.formulario.reset({
      nombre: '',
      descripcion: '',
    });

    this.editandoId.set(null);
    this.error.set('');
    this.mensaje.set('');
    this.formularioVisible.set(true);
  }

  editar(categoria: CategoriaBar): void {
    this.formulario.reset({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
    });

    this.editandoId.set(categoria.id);
    this.error.set('');
    this.mensaje.set('');
    this.formularioVisible.set(true);
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

    const datos: GuardarCategoriaBar = {
      nombre: this.formulario.controls.nombre.value.trim(),
      descripcion: this.formulario.controls.descripcion.value.trim(),
    };

    if (!datos.nombre) {
      this.error.set('El nombre de la categoría es obligatorio.');
      return;
    }

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
            ? 'Categoría registrada correctamente.'
            : 'Categoría actualizada correctamente.'
        );

        this.cargarCategorias(id === null ? 0 : this.pagina());
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.obtenerError(error));
        this.guardando.set(false);
      },
    });
  }

  eliminar(categoria: CategoriaBar): void {
    const confirmado = window.confirm(
      `¿Deseas eliminar la categoría "${categoria.nombre}"?`
    );

    if (!confirmado) {
      return;
    }

    this.error.set('');
    this.mensaje.set('');

    this.servicio.eliminar(categoria.id).subscribe({
      next: () => {
        this.mensaje.set('Categoría eliminada correctamente.');

        const paginaDestino =
          this.categorias().length === 1 && this.pagina() > 0
            ? this.pagina() - 1
            : this.pagina();

        this.cargarCategorias(paginaDestino);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.obtenerError(error));
      },
    });
  }

  cambiarPagina(pagina: number): void {
    this.cargarCategorias(pagina);
  }

  private obtenerError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }

    if (error.status === 403) {
      return 'No tienes permisos para realizar esta operación.';
    }

    if (error.status === 409) {
      return 'La categoría ya existe o está siendo utilizada.';
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
