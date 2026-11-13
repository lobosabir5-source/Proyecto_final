import { Component, computed, input } from '@angular/core';
import { Configuracion } from '../../../services/configuracion.service';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const hora = (v: string | null) => (v ? v.slice(0, 5) : '');

@Component({
  selector: 'app-horarios-section',
  standalone: true,
  host: { class: 'relative z-10 block' },
  template: `
    <section id="horarios" class="px-6 py-24 bg-neutral-900/30 scroll-mt-24">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-12">
          <p class="text-yellow-400 text-xs tracking-[0.4em] font-bold mb-3">ATENCIÓN</p>
          <h2 class="font-bebas text-5xl sm:text-6xl">HORARIOS</h2>
        </div>

        @if (filas().length) {
          <ul class="divide-y divide-neutral-800 border border-neutral-800">
            @for (h of filas(); track h.dia) {
              <li class="flex items-center justify-between px-6 py-4">
                <span class="font-semibold">{{ h.dia }}</span>
                <span [class]="h.cerrado ? 'text-neutral-500' : 'text-yellow-300'">{{ h.texto }}</span>
              </li>
            }
          </ul>
        } @else {
          <p class="text-center text-neutral-400">Consulta nuestros horarios en recepción.</p>
        }
      </div>
    </section>
  `
})
export class HorariosSection {
  config = input<Configuracion | null>(null);

  filas = computed(() =>
    [...(this.config()?.horarios ?? [])]
      .sort((a, b) => a.diaSemana - b.diaSemana)
      .map(h => ({
        dia: DIAS[h.diaSemana - 1] ?? `Día ${h.diaSemana}`,
        cerrado: h.cerrado || !h.apertura || !h.cierre,
        texto: h.cerrado || !h.apertura || !h.cierre ? 'Cerrado' : `${hora(h.apertura)} - ${hora(h.cierre)}`
      }))
  );
}