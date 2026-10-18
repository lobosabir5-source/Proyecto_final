import { Component, input } from '@angular/core';

/** Reutiliza el diseño global de tablas sin imponer columnas ni lógica de datos. */
@Component({
  selector: 'app-table',
  standalone: true,
  template: `
    <div class="table-wrap" [attr.aria-label]="etiqueta()">
      <table class="table">
        <ng-content />
      </table>
    </div>
  `
})
export class UiTable {
  readonly etiqueta = input<string>('Tabla de datos');
}
