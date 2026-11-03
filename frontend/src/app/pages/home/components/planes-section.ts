import { Component, input, output } from '@angular/core';
import { Plan } from '../../../models/admin.models';
import { PlanCard } from './plan-card';

@Component({
  selector: 'app-planes-section',
  standalone: true,
  imports: [PlanCard],
  host: { class: 'relative z-10 block' },
  template: `
    <section id="planes" class="px-6 py-24 max-w-7xl mx-auto scroll-mt-24">
      <div class="text-center mb-14">
        <p class="text-yellow-400 text-xs tracking-[0.4em] font-bold mb-3">MEMBRESÍAS</p>
        <h2 class="font-bebas text-5xl sm:text-6xl">ELIGE TU PLAN</h2>
      </div>

      @if (cargando()) {
        <p class="text-center text-neutral-400" role="status">Cargando planes disponibles...</p>
      } @else if (error()) {
        <div class="text-center" role="alert">
          <p class="text-neutral-300 mb-4">No se pudieron cargar los planes. Inténtalo de nuevo.</p>
          <button type="button" (click)="reintentar.emit()"
                  class="bg-yellow-400 text-neutral-950 font-semibold px-5 py-3 hover:bg-yellow-300">Reintentar</button>
        </div>
      } @else if (planes().length === 0) {
        <p class="text-center text-neutral-400">No hay planes disponibles por el momento.</p>
      }

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (p of planes(); track p.id) {
          <app-plan-card [plan]="p" [esCliente]="esCliente()" [planActual]="planActual()" />
        }
      </div>
    </section>
  `
})
export class PlanesSection {
  planes = input<Plan[]>([]);
  cargando = input(false);
  error = input(false);
  esCliente = input(false);
  planActual = input<string | null>(null);
  reintentar = output<void>();
}