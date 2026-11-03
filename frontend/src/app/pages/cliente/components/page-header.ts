import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  host: { class: 'block mb-8' },
  template: `
    <p class="text-[11px] tracking-[0.4em] text-yellow-400 uppercase mb-2">{{ eyebrow() }}</p>
    <h1 class="text-4xl font-black tracking-tight">{{ titulo() }}</h1>
    @if (subtitulo()) {
      <p class="mt-2 text-sm text-neutral-400">{{ subtitulo() }}</p>
    }
  `
})
export class PageHeader {
  eyebrow = input('');
  titulo = input.required<string>();
  subtitulo = input('');
}