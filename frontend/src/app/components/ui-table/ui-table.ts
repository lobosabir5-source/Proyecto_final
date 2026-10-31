import { Component, input } from '@angular/core';

/** Reutiliza el diseño de tablas . */
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
