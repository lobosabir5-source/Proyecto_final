import { Component, computed, input } from '@angular/core';
import { PerfilCliente } from '../../../services/cliente.service';
import { fechaLarga } from '../../../utils/fecha';
import { CornerCard } from './corner-card';
import { CampoDato } from './campo-dato';

@Component({
  selector: 'app-perfil-card',
  standalone: true,
  imports: [CornerCard, CampoDato],
  host: { class: 'block max-w-3xl' },
  template: `
    <app-corner-card class="p-8" esquina="w-10 h-10">
      <div class="flex items-center gap-6 mb-8">
        <div class="w-20 h-20 bg-yellow-400 flex items-center justify-center">
          <span class="text-black font-black text-3xl">{{ iniciales() }}</span>
        </div>
        <div>
          <h2 class="text-2xl font-black">{{ perfil().nombre }}</h2>
          <p class="text-neutral-500 text-sm">Miembro desde {{ fecha(perfil().fechaAlta) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (c of campos(); track c.etiqueta) {
          <app-campo-dato [etiqueta]="c.etiqueta" linea valorClase="text-lg font-semibold">{{ c.valor }}</app-campo-dato>
        }
        <app-campo-dato etiqueta="Estado de la cuenta" linea
          [valorClase]="perfil().activo ? 'text-lg font-semibold text-emerald-400' : 'text-lg font-semibold text-amber-300'">
          {{ perfil().activo ? 'Activa' : 'Pendiente de activación' }}
        </app-campo-dato>
      </div>
    </app-corner-card>
  `
})
export class PerfilCard {
  perfil = input.required<PerfilCliente>();
  fecha = fechaLarga;

  iniciales = computed(() =>
    this.perfil().nombre.split(/\s+/).slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase()
  );

  campos = computed(() => {
    const p = this.perfil();
    return [
      { etiqueta: 'Usuario', valor: p.usuario },
      { etiqueta: 'Correo', valor: p.correo },
      { etiqueta: 'Teléfono', valor: p.telefono },
      { etiqueta: 'Fecha de nacimiento', valor: fechaLarga(p.fechaNacimiento) },
    ];
  });
}