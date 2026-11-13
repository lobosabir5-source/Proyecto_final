import { Component, booleanAttribute, input } from '@angular/core';
import { CornerCard } from './corner-card';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CornerCard],
  host: { class: 'block' },
  template: `
    <app-corner-card class="p-6">
      <p class="text-[10px] tracking-[0.3em] text-neutral-500 uppercase mb-2">{{ etiqueta() }}</p>
      <p class="font-black text-yellow-400" [class]="grande() ? 'text-4xl' : 'text-2xl'"><ng-content /></p>
    </app-corner-card>
  `
})
export class KpiCard {
  etiqueta = input.required<string>();
  grande = input(false, { transform: booleanAttribute });
}