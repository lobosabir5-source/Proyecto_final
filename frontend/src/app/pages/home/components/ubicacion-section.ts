import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ubicacion-section',
  standalone: true,
  host: { class: 'relative z-10 block' },
  template: `
    <section id="ubicacion" class="px-6 py-24 max-w-6xl mx-auto scroll-mt-24 text-center">
      <p class="text-yellow-400 text-xs tracking-[0.4em] font-bold mb-3">CÓMO LLEGAR</p>
      <h2 class="font-bebas text-5xl sm:text-6xl">UBICACIÓN</h2>
      <p class="text-neutral-400 mt-4">📍 {{ direccion() || 'Consulta nuestra dirección en recepción' }}</p>
    </section>
  `
})
export class UbicacionSection {
  direccion = input<string | null | undefined>('');
}