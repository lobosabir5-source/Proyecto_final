import { Component, input } from '@angular/core';

/** Botón compartido. Permite contenido proyectado (texto e iconos). */
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button [type]="tipo()" [disabled]="deshabilitado() || cargando()"
            [class]="clases()" [attr.aria-busy]="cargando()">
      @if (cargando()) { <span class="ui-button-spinner" aria-hidden="true"></span> }
      <ng-content />
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }
    button { width: 100%; }
    .ui-button-spinner { width: 0.9rem; height: 0.9rem; border: 2px solid currentColor;
      border-right-color: transparent; border-radius: 50%; animation: giro .7s linear infinite; }
    @keyframes giro { to { transform: rotate(360deg); } }
  `]
})
export class UiButton {
  readonly variante = input<'primary' | 'secondary' | 'danger' | 'success'>('primary');
  readonly tamano = input<'normal' | 'sm'>('normal');
  readonly tipo = input<'button' | 'submit' | 'reset'>('button');
  readonly deshabilitado = input(false);
  readonly cargando = input(false);

  clases(): string {
    return `btn btn-${this.variante()}${this.tamano() === 'sm' ? ' btn-sm' : ''}`;
  }
}
