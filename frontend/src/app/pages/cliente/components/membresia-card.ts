import { Component, input } from '@angular/core';
import { MembresiaCliente } from '../../../services/cliente.service';
import { fechaLarga } from '../../../utils/fecha';
import { CornerCard } from './corner-card';
import { CampoDato } from './campo-dato';

@Component({
  selector: 'app-membresia-card',
  standalone: true,
  imports: [CornerCard, CampoDato],
  host: { class: 'block' },
  template: `
    <app-corner-card class="p-8" esquina="w-10 h-10">
      <p class="text-[10px] tracking-[0.3em] text-yellow-400/80 uppercase mb-3">{{ membresia().estado.replace('_', ' ') }}</p>
      <h2 class="text-3xl font-black mb-2">{{ membresia().plan }}</h2>
      <div class="grid grid-cols-2 gap-5 mt-6">
        <app-campo-dato etiqueta="Inicio">{{ fecha(membresia().fechaInicio) }}</app-campo-dato>
        <app-campo-dato etiqueta="Vence">{{ fecha(membresia().fechaFin) }}</app-campo-dato>
        <app-campo-dato etiqueta="Precio total" valorClase="font-bold text-yellow-400">Bs {{ membresia().precioTotal }}</app-campo-dato>
        <app-campo-dato etiqueta="Saldo" valorClase="font-bold text-yellow-400">Bs {{ membresia().saldo }}</app-campo-dato>
      </div>
    </app-corner-card>
  `
})
export class MembresiaCard {
  membresia = input.required<MembresiaCliente>();
  fecha = fechaLarga;
}