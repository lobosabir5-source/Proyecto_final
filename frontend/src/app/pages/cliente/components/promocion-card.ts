import { Component, computed, input } from '@angular/core';
import { PromocionCliente } from '../../../services/cliente.service';
import { fechaMedia } from '../../../utils/fecha';
import { CornerCard } from './corner-card';

@Component({
  selector: 'app-promocion-card',
  standalone: true,
  imports: [CornerCard],
  host: { class: 'block' },
  template: `
    <app-corner-card class="p-7 hover:border-yellow-400 transition" esquina="w-8 h-8">
      <p class="text-[10px] tracking-[0.3em] text-yellow-400/80 uppercase mb-3">{{ descuento() }}</p>
      <h2 class="text-2xl font-black mb-2">{{ promocion().nombre }}</h2>
      <p class="text-sm text-neutral-400 mb-6">
        {{ promocion().planId ? 'Válida para el plan #' + promocion().planId : 'Válida para los planes disponibles' }}
      </p>
      <div class="border-t border-yellow-500/20 pt-4">
        <p class="text-[10px] text-neutral-500 tracking-widest uppercase">Vigencia</p>
        <p class="mt-1 text-sm text-neutral-300">{{ fecha(promocion().fechaInicio) }} — {{ fecha(promocion().fechaFin) }}</p>
      </div>
    </app-corner-card>
  `
})
export class PromocionCard {
  promocion = input.required<PromocionCliente>();
  fecha = fechaMedia;

  descuento = computed(() => {
    const p = this.promocion();
    return p.tipo === 'PORCENTAJE' ? `${p.valor}% de descuento` : `Bs ${p.valor} de descuento`;
  });
}