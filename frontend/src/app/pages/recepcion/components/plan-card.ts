import { Component, input } from '@angular/core';
import { Plan } from '../../../models/admin.models';
import { CornerCard } from './corner-card';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [CornerCard],
  host: { class: 'block' },
  template: `
    <app-corner-card class="p-7 hover:border-yellow-400 transition" esquina="w-8 h-8">
      <p class="text-[10px] tracking-[0.3em] text-yellow-400/80 uppercase mb-3">{{ plan().duracionDias }} días</p>
      <h3 class="text-2xl font-black mb-2">{{ plan().nombre }}</h3>
      <p class="text-sm text-neutral-500 mb-6 min-h-10">{{ plan().descripcion }}</p>
      <p class="text-4xl font-black text-yellow-400">Bs {{ plan().precio }}</p>
    </app-corner-card>
  `
})
export class PlanCard {
  plan = input.required<Plan>();
}