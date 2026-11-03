import { Component, input } from '@angular/core';

@Component({
  selector: 'app-corner-card',
  standalone: true,
  host: { class: 'block relative bg-[#111] border border-yellow-500/20' },
  template: `
    <div [class]="'absolute top-0 right-0 border-t border-r border-yellow-400 ' + esquina()"></div>
    <ng-content />
  `
})
export class CornerCard {
  esquina = input('w-6 h-6');
}