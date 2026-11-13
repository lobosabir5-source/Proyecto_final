import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dialogo',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div class="bg-[#111] border border-yellow-500/30 w-full p-8 max-h-[90vh] overflow-y-auto"
           [class]="ancho()" role="dialog" aria-modal="true">
        <div class="flex items-start justify-between mb-6">
          <div>
            <p class="text-[11px] tracking-[0.35em] text-yellow-400 uppercase mb-1">{{ eyebrow() }}</p>
            <h2 class="text-2xl font-black">{{ titulo() }}</h2>
          </div>
          <button type="button" (click)="cerrar.emit()" aria-label="Cerrar"
                  class="text-neutral-500 hover:text-yellow-400 text-xl leading-none">✕</button>
        </div>
        <ng-content />
      </div>
    </div>
  `
})
export class Dialogo {
  eyebrow = input('Recepción');
  titulo = input.required<string>();
  ancho = input('max-w-2xl');
  cerrar = output<void>();
}