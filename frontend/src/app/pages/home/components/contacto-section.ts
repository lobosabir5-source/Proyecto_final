import { Component, input } from '@angular/core';
import { Configuracion } from '../../../services/configuracion.service';

@Component({
  selector: 'app-contacto-section',
  standalone: true,
  host: { class: 'relative z-10 block' },
  template: `
    <section id="contacto" class="px-6 py-24 bg-neutral-900/30 scroll-mt-24">
      <div class="max-w-4xl mx-auto text-center mb-14">
        <p class="text-yellow-400 text-xs tracking-[0.4em] font-bold mb-3">HABLEMOS</p>
        <h2 class="font-bebas text-5xl sm:text-6xl">CONTACTO</h2>
      </div>

      <div class="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6 text-center">
        @for (t of config()?.telefonos ?? []; track t.id) {
          <div class="p-6 border border-neutral-800">
            <p class="text-yellow-400 font-bold mb-1">{{ t.etiqueta || 'Teléfono' }}</p>
            <a [href]="t.whatsapp ? whatsapp(t.numero) : 'tel:' + t.numero"
               class="text-neutral-300 hover:text-yellow-400">{{ t.numero }}{{ t.whatsapp ? ' · WhatsApp' : '' }}</a>
          </div>
        }
        @for (r of config()?.redesSociales ?? []; track r.id) {
          <a [href]="r.url" target="_blank" rel="noopener noreferrer"
             class="p-6 border border-neutral-800 hover:border-yellow-500/50 transition-colors">
            <p class="text-yellow-400 font-bold">{{ r.plataforma }}</p>
            <p class="text-neutral-300 text-sm">{{ r.nombreUsuario || r.url }}</p>
          </a>
        }
        @if (config()?.correoContacto; as correo) {
          <a [href]="'mailto:' + correo" class="p-6 border border-neutral-800 text-neutral-300">Correo: {{ correo }}</a>
        }
      </div>

      @if ((config()?.horarios?.length ?? 0) > 0) {
        <div class="max-w-2xl mx-auto mt-12">
          <h3 class="text-yellow-400 font-bold text-center mb-4">HORARIOS DE ATENCIÓN</h3>
          @for (h of config()?.horarios ?? []; track h.id) {
            <div class="flex justify-between border-b border-neutral-800 py-2 text-sm">
              <span>{{ dias[h.diaSemana] || 'Día' }}</span>
              <span>{{ h.cerrado ? 'Cerrado' : h.apertura?.slice(0, 5) + ' – ' + h.cierre?.slice(0, 5) }}</span>
            </div>
          }
        </div>
      }
    </section>
  `
})
export class ContactoSection {
  config = input<Configuracion | null>(null);
  dias: Record<number, string> = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };
  whatsapp = (n: string) => `https://wa.me/${n.replace(/\D/g, '')}`;
}