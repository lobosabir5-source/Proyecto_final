import { Component, Directive, computed, input } from '@angular/core';

/** Etiqueta + control + mensaje de error. Uso: <app-campo etiqueta="NOMBRE" para="nombre" [error]="...">…</app-campo> */
@Component({
  selector: 'app-campo',
  standalone: true,
  host: { class: 'block' },
  template: `
    <label [attr.for]="para()" class="block text-[10px] tracking-[0.2em] text-neutral-400 mb-1.5 uppercase">{{ etiqueta() }}</label>
    <ng-content />
    @if (error()) { <p class="text-red-400 text-xs mt-1">{{ error() }}</p> }
  `
})
export class Campo {
  etiqueta = input.required<string>();
  para = input('');
  error = input('');
}

/** Estilo único para input / select / textarea. */
@Directive({
  selector: 'input[appEntrada], select[appEntrada], textarea[appEntrada]',
  standalone: true,
  host: { '[class]': 'clase()' }
})
export class Entrada {
  invalido = input(false);
  clase = computed(() =>
    'w-full bg-neutral-900 border px-3 py-2 text-sm outline-none focus:border-yellow-400 placeholder:text-neutral-600 '
    + (this.invalido() ? 'border-red-500' : 'border-neutral-800'));
}

type Variante = 'primario' | 'secundario' | 'acento' | 'neutro' | 'peligro' | 'exito';

const BASE = 'text-[10px] font-bold tracking-[0.2em] uppercase transition disabled:opacity-50 disabled:cursor-not-allowed ';
const VARIANTES: Record<Variante, string> = {
  primario: 'bg-yellow-400 text-black px-5 py-2.5 text-xs hover:bg-yellow-300',
  secundario: 'border border-neutral-700 text-neutral-300 px-5 py-2.5 hover:border-yellow-400',
  acento: 'border border-yellow-500/40 text-yellow-300 px-3 py-1.5 hover:bg-yellow-400 hover:text-black',
  neutro: 'border border-neutral-600 text-neutral-300 px-3 py-1.5 hover:bg-white/10',
  peligro: 'border border-red-500/50 text-red-300 px-3 py-1.5 hover:bg-red-500/10',
  exito: 'border border-emerald-500/50 text-emerald-300 px-3 py-1.5 hover:bg-emerald-500/10'
};

/** Botón con estilo del panel. Uso: <button appBoton="acento">Editar</button> (sin valor = primario) */
@Directive({
  selector: 'button[appBoton]',
  standalone: true,
  host: { '[class]': 'clase()' }
})
export class Boton {
  variante = input<string>('primario', { alias: 'appBoton' });
  clase = computed(() => BASE + (VARIANTES[(this.variante() || 'primario') as Variante] ?? VARIANTES.primario));
}