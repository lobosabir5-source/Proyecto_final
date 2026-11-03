import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Plan } from '../../../models/admin.models';
import { resolverImagen } from '../../../utils/imagen';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'block' },
  template: `
    <div class="group border overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]
                hover:border-yellow-400 hover:shadow-[0_0_35px_rgba(250,204,21,0.35)]"
         [class]="plan().destacado
           ? 'bg-yellow-400 text-neutral-950 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.35)] lg:-translate-y-4'
           : 'bg-neutral-900/60 border-neutral-800 text-white'">

      <div class="relative h-40 overflow-hidden">
        @if (imagen(); as src) {
          <img [src]="src" [alt]="plan().nombre" loading="lazy"
               class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        } @else {
          <div class="w-full h-full flex items-center justify-center bg-neutral-800 text-yellow-400 font-bebas text-3xl">GOLD'S GYM</div>
        }
        <div class="absolute inset-0 bg-linear-to-t from-neutral-950/80 to-transparent"></div>
      </div>

      <div class="p-6">
        <p class="font-bebas text-2xl mb-1">{{ plan().nombre }}</p>
        <p class="text-xs mb-4" [class]="plan().destacado ? 'text-neutral-800' : 'text-neutral-400'">
          {{ plan().horario || plan().descripcion || 'Consulta los horarios en recepción' }}
        </p>
        <p class="mb-5">
          <span class="font-bebas text-4xl">{{ plan().precio }}</span>
          <span class="text-xs"> Bs / {{ plan().duracionDias }} días</span>
        </p>

        <ul class="space-y-2 mb-6 text-xs">
          @for (b of beneficios(); track $index) {
            <li class="flex items-start gap-2">
              <span [class]="plan().destacado ? 'text-neutral-800' : 'text-yellow-400'">✓</span>
              <span>{{ b }}</span>
            </li>
          }
        </ul>

        @if (planActual(); as actual) {
          <p class="text-center w-full py-3 text-sm font-bold border border-current opacity-80">
            {{ actual === plan().nombre ? '✓ TU PLAN ACTUAL' : 'Usted ya eligió un plan' }}
          </p>
        } @else {
          <a [routerLink]="esCliente() ? '/cliente/suscripcion' : '/registro'"
             class="block text-center w-full py-3 font-bold tracking-wide text-sm transition-all duration-300 hover:scale-[1.03]"
             [class]="plan().destacado
               ? 'bg-neutral-950 text-yellow-400 hover:bg-neutral-800'
               : 'bg-yellow-400 text-neutral-950 hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]'">
            ELEGIR PLAN
          </a>
        }
      </div>
    </div>
  `
})
export class PlanCard {
  plan = input.required<Plan>();
  esCliente = input(false);
  planActual = input<string | null>(null);

  imagen = computed(() => resolverImagen(this.plan().imagenUrl));
  beneficios = computed(() => this.plan().beneficios?.filter(b => !!b?.trim()) ?? []);
}