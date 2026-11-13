import { Component, computed, input } from '@angular/core';
import { Configuracion } from '../../../services/configuracion.service';

@Component({
  selector: 'app-nosotros-section',
  standalone: true,
  host: { class: 'relative z-10 block' },
  template: `
    <section id="nosotros" class="px-6 py-24 max-w-5xl mx-auto scroll-mt-24 text-center">
      <p class="text-yellow-400 text-xs tracking-[0.4em] font-bold mb-3">CONÓCENOS</p>
      <h2 class="font-bebas text-5xl sm:text-6xl">NOSOTROS</h2>

      @if (config()?.descripcion) {
        <p class="text-neutral-400 mt-6 whitespace-pre-line">{{ config()?.descripcion }}</p>
      }

      @for (s of secciones(); track s.id) {
        <article class="mt-10 text-left border border-neutral-800 p-6">
          @if (s.titulo) { <h3 class="text-yellow-400 font-bold text-xl mb-2">{{ s.titulo }}</h3> }
          @if (s.contenido) { <p class="text-neutral-300 whitespace-pre-line">{{ s.contenido }}</p> }
        </article>
      }
    </section>
  `
})
export class NosotrosSection {
  config = input<Configuracion | null>(null);

  /** Secciones del admin que no son de galería (clave que no empieza con "galeria"). */
  secciones = computed(() =>
    (this.config()?.secciones ?? [])
      .filter(s => !s.clave.toLowerCase().startsWith('galeria') && (s.titulo || s.contenido))
      .sort((a, b) => a.orden - b.orden)
  );
}