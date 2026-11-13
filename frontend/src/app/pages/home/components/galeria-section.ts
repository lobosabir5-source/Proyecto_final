import { Component, computed, input } from '@angular/core';
import { Configuracion } from '../../../services/configuracion.service';
import { resolverImagen } from '../../../utils/imagen';

@Component({
  selector: 'app-galeria-section',
  standalone: true,
  host: { class: 'relative z-10 block' },
  template: `
    @if (fotos().length) {
      <section id="galeria" class="px-6 py-24 max-w-6xl mx-auto scroll-mt-24">
        <div class="text-center mb-12">
          <p class="text-yellow-400 text-xs tracking-[0.4em] font-bold mb-3">NUESTRAS INSTALACIONES</p>
          <h2 class="font-bebas text-5xl sm:text-6xl">GALERÍA</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          @for (f of fotos(); track f.id) {
            <figure class="overflow-hidden border border-neutral-800">
              <img [src]="f.url" [alt]="f.titulo || 'Instalaciones del gimnasio'" loading="lazy"
                   class="w-full h-56 object-cover hover:scale-105 transition-transform duration-300" />
            </figure>
          }
        </div>
      </section>
    }
  `
})
export class GaleriaSection {
  config = input<Configuracion | null>(null);

  /** Secciones con clave "galeria..." que tengan imagen. */
  fotos = computed(() =>
    (this.config()?.secciones ?? [])
      .filter(s => s.clave.toLowerCase().startsWith('galeria'))
      .sort((a, b) => a.orden - b.orden)
      .map(s => ({ id: s.id, titulo: s.titulo, url: resolverImagen(s.imagenUrl) }))
      .filter((f): f is { id: number; titulo: string; url: string } => !!f.url)
  );
}