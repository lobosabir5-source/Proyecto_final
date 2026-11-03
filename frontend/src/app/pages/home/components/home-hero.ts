import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'relative z-10 block' },
  template: `
    <section class="flex flex-col items-center text-center px-6 py-24 sm:py-36">
      <p class="text-yellow-400 text-xs tracking-[0.4em] font-bold mb-4">
        {{ esCliente() ? 'BIENVENIDO DE NUEVO' : 'DESDE 2019 · SIN EXCUSAS' }}
      </p>

      <h1 class="font-bebas text-6xl sm:text-8xl leading-[0.9] mb-6">
        @if (esCliente()) {
          HOLA,<br />
          <span class="text-yellow-400 uppercase drop-shadow-[0_0_25px_rgba(250,204,21,0.35)]">{{ nombre() }}</span>
        } @else {
          TU MEJOR VERSIÓN<br />
          <span class="text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.35)]">EMPIEZA HOY</span>
        }
      </h1>

      <p class="text-neutral-400 text-lg max-w-xl mb-10">
        {{ descripcion() || 'Entrena con nosotros. Conoce nuestros planes y alcanza tus objetivos.' }}
      </p>

      <a [routerLink]="esCliente() ? '/cliente/rutinas' : '/login'"
         class="bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black tracking-[0.2em] px-10 py-4
                transition-all shadow-[0_0_30px_rgba(250,204,21,0.25)] hover:shadow-[0_0_40px_rgba(250,204,21,0.55)]">
        {{ esCliente() ? 'VER MI RUTINA →' : 'COMENZAR AHORA →' }}
      </a>
    </section>

    <section class="grid grid-cols-3 max-w-2xl mx-auto gap-6 border-t border-yellow-500/20 pt-8 pb-24 px-6">
      @for (s of stats(); track s.texto) {
        <div class="text-center">
          <p class="font-bebas text-4xl sm:text-5xl text-yellow-400">{{ s.valor }}</p>
          <p class="text-[10px] text-neutral-500 tracking-[0.2em] uppercase font-semibold">{{ s.texto }}</p>
        </div>
      }
    </section>
  `
})
export class HomeHero {
  nombre = input('');
  esCliente = input(false);
  descripcion = input<string | null | undefined>('');
  totalPlanes = input(0);

  stats = computed(() => [
    { valor: "GOLD'S", texto: 'Entrena con nosotros' },
    { valor: 'GYM', texto: 'Tu espacio fitness' },
    { valor: String(this.totalPlanes()), texto: 'Planes activos' },
  ]);
}