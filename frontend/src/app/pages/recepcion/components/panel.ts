import { Component, input } from '@angular/core';

@Component({
  selector: 'app-panel',
  standalone: true,
  host: { class: 'block bg-[#111] border border-yellow-500/20 p-5' },
  template: `
    @if (titulo()) {
      <h2 class="text-[11px] tracking-[0.4em] text-yellow-400 uppercase mb-4">{{ titulo() }}</h2>
    }
    <ng-content />
  `
})
export class Panel {
  titulo = input('');
}