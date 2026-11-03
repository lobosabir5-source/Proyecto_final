import { Component, input } from '@angular/core';

export interface Columna {
  titulo: string;
  derecha?: boolean;
}

@Component({
  selector: 'app-tabla-datos',
  standalone: true,
  host: { class: 'block bg-[#111] border border-yellow-500/20 overflow-x-auto' },
  template: `
    <table class="w-full text-sm">
      <thead>
        <tr class="text-[10px] tracking-[0.3em] uppercase text-yellow-400/80 border-b border-yellow-500/20">
          @for (c of columnas(); track c.titulo) {
            <th class="px-6 py-4" [class]="c.derecha ? 'text-right' : 'text-left'">{{ c.titulo }}</th>
          }
        </tr>
      </thead>
      <tbody>
        <ng-content />
        @if (vacia()) {
          <tr>
            <td [attr.colspan]="columnas().length" class="px-6 py-10 text-center text-neutral-500">{{ mensajeVacio() }}</td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class TablaDatos {
  columnas = input.required<Columna[]>();
  vacia = input(false);
  mensajeVacio = input('No hay registros.');
}

@Component({
  selector: 'tr[app-fila]',
  standalone: true,
  host: { class: 'border-b border-white/5 hover:bg-yellow-400/5 transition' },
  template: `<ng-content />`
})
export class FilaTabla {}

@Component({
  selector: 'td[app-celda]',
  standalone: true,
  host: { class: 'px-6 py-4' },
  template: `<ng-content />`
})
export class CeldaTabla {}