import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-alerta',
  standalone: true,
  host: { '[class]': 'clase()', '[attr.role]': "tipo() === 'error' ? 'alert' : 'status'" },
  template: `<ng-content />`
})
export class Alerta {
  tipo = input<'exito' | 'error'>('error');
  clase = computed(() =>
    'block mb-4 p-4 border-l-4 text-sm ' + (this.tipo() === 'exito'
      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
      : 'bg-red-950/40 border-red-500 text-red-300'));
}