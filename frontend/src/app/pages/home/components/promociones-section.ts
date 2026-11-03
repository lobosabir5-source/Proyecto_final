import { Component, input } from '@angular/core';
import { PromocionPublica } from '../../../services/promocion-publica.service';
import { resolverImagen } from '../../../utils/imagen';

@Component({
  selector: 'app-promociones-section',
  standalone: true,
  host: { class: 'relative z-10 block' },
  template: `
    @if (promociones().length > 0) {
      <section id="promociones" class="px-6 py-20 max-w-7xl mx-auto">
        <h2 class="font-bebas text-5xl text-center mb-10">PROMOCIONES VIGENTES</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (p of promociones(); track p.id) {
            <article class="border border-neutral-800 bg-neutral-900/60 overflow-hidden">
              @if (foto(p.imagenUrl); as src) {
                <img [src]="src" [alt]="p.nombre" loading="lazy" class="h-48 w-full object-cover" />
              }
              <div class="p-6">
                <h3 class="text-xl font-bold text-yellow-400">{{ p.nombre }}</h3>
                <p class="text-neutral-300 mt-2">Descuento: {{ p.valor }} {{ p.tipo === 'PORCENTAJE' ? '%' : 'Bs' }}</p>
                <p class="text-neutral-400 text-sm mt-2">Hasta {{ p.fechaFin }}</p>
              </div>
            </article>
          }
        </div>
      </section>
    }
  `
})
export class PromocionesSection {
  promociones = input<PromocionPublica[]>([]);
  foto = resolverImagen;
}