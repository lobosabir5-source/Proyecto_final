import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-card',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'block' },
  template: `
    <a [routerLink]="ruta()" class="group block bg-[#111] border border-yellow-500/20 p-6 hover:border-yellow-400 transition">
      <p class="text-2xl font-black mb-1 group-hover:text-yellow-400 transition">{{ titulo() }}</p>
      <p class="text-sm text-neutral-500">{{ detalle() }}</p>
    </a>
  `
})
export class AccesoCard {
  ruta = input.required<string>();
  titulo = input.required<string>();
  detalle = input('');
}