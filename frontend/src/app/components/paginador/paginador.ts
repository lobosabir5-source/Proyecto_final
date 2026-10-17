import { Component, computed, input, output } from '@angular/core';

/**
 * Paginador reutilizable. `pagina` es base 0 (como Spring Data).
 * tema "claro" usa las clases de ui.css (admin); "oscuro" usa el estilo dorado de recepción.
 */
@Component({
  selector: 'app-paginador',
  template: `
    @if (totalElementos() > 0) {
      <div [class]="contenedor()">
        <span [class]="textoClase()">
          Mostrando {{ desde() }}–{{ hasta() }} de {{ totalElementos() }}
        </span>

        <nav class="flex items-center gap-1" aria-label="Paginación">
          <button type="button" [class]="botonClase(false)" [disabled]="pagina() === 0"
                  (click)="ir(pagina() - 1)">Anterior</button>

          @for (n of numeros(); track n) {
            <button type="button" [class]="botonClase(n === pagina())"
                    [attr.aria-current]="n === pagina() ? 'page' : null"
                    (click)="ir(n)">{{ n + 1 }}</button>
          }

          <button type="button" [class]="botonClase(false)"
                  [disabled]="pagina() >= totalPaginas() - 1"
                  (click)="ir(pagina() + 1)">Siguiente</button>
        </nav>
      </div>
    }
  `
})
export class Paginador {
  readonly pagina = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly totalElementos = input.required<number>();
  readonly tamano = input(10);
  readonly tema = input<'claro' | 'oscuro'>('claro');

  readonly cambiar = output<number>();

  readonly desde = computed(() => this.pagina() * this.tamano() + 1);
  readonly hasta = computed(() => Math.min((this.pagina() + 1) * this.tamano(), this.totalElementos()));

  /** Ventana de hasta 5 números centrada en la página actual. */
  readonly numeros = computed(() => {
    const total = this.totalPaginas();
    const inicio = Math.max(0, Math.min(this.pagina() - 2, total - 5));
    const fin = Math.min(total, inicio + 5);
    return Array.from({ length: fin - inicio }, (_, i) => inicio + i);
  });

  readonly contenedor = computed(() =>
    this.tema() === 'oscuro'
      ? 'flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-yellow-500/20'
      : 'panel-footer'
  );

  readonly textoClase = computed(() =>
    this.tema() === 'oscuro' ? 'text-xs text-neutral-400' : 'text-sm text-slate-500'
  );

  botonClase(activo: boolean): string {
    if (this.tema() === 'oscuro') {
      const base = 'min-w-9 px-3 py-1.5 text-xs font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed ';
      return base + (activo
        ? 'bg-yellow-400 text-black border-yellow-400'
        : 'border-neutral-700 text-neutral-300 hover:border-yellow-400');
    }
    return 'btn btn-sm ' + (activo ? 'btn-primary' : 'btn-secondary');
  }

  ir(destino: number): void {
    if (destino >= 0 && destino < this.totalPaginas() && destino !== this.pagina()) {
      this.cambiar.emit(destino);
    }
  }
}