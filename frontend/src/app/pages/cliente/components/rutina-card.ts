import { Component, input } from '@angular/core';
import { RutinaCliente } from '../../../services/cliente.service';
import { fechaLarga } from '../../../utils/fecha';

@Component({
  selector: 'app-rutina-card',
  standalone: true,
  host: { class: 'block bg-[#111] border border-yellow-500/20 p-6' },
  template: `
    <div class="flex items-start justify-between gap-4">
      <h2 class="text-2xl font-black text-yellow-300">{{ rutina().nombre }}</h2>
      <span class="text-xs text-neutral-500">{{ fecha(rutina().fechaCreacion) }}</span>
    </div>
    <p class="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-300">{{ rutina().contenido }}</p>
  `
})
export class RutinaCard {
  rutina = input.required<RutinaCliente>();
  fecha = fechaLarga;
}