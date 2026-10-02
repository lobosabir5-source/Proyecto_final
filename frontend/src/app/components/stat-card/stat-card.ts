import { Component, computed, input } from '@angular/core';
import { Icon, NombreIcono } from '../icon/icon';

export type VarianteTarjeta = 'cyan' | 'green' | 'red' | 'gray';

@Component({
  selector: 'app-stat-card',
  imports: [Icon],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCard {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly icono = input.required<NombreIcono>();
  readonly detalle = input('');
  readonly variante = input<VarianteTarjeta>('cyan');

  readonly clase = computed(() => `stat-card stat-card--${this.variante()}`);
}