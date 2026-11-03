import { Component, booleanAttribute, input } from '@angular/core';

@Component({
  selector: 'app-campo-dato',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div [class]="linea() ? 'border-b border-white/5 pb-3' : ''">
      <p class="text-[10px] tracking-[0.3em] text-neutral-500 uppercase mb-1">{{ etiqueta() }}</p>
      <p [class]="valorClase()"><ng-content /></p>
    </div>
  `
})
export class CampoDato {
  etiqueta = input.required<string>();
  valorClase = input('font-bold');
  linea = input(false, { transform: booleanAttribute });
}