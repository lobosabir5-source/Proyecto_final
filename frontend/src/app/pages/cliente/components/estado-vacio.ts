import { Component } from '@angular/core';

@Component({
  selector: 'app-estado-vacio',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div class="border border-white/10 bg-[#111] p-8 text-center text-neutral-400"><ng-content /></div>
  `
})
export class EstadoVacio {}