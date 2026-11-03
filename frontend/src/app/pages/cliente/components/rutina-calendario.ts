import { Component, computed, input, signal } from '@angular/core';
import { AsistenciaCliente, RutinaCliente } from '../../../services/cliente.service';
import { parsearDias } from '../../../utils/rutina-dias';

interface Celda { iso: string; dia: number; delMes: boolean; hoy: boolean; plan: boolean; asistio: boolean; }

const aIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

@Component({
  selector: 'app-rutina-calendario',
  standalone: true,
  host: { class: 'block bg-[#111] border border-yellow-500/20 p-6' },
  template: `
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-xl font-black text-yellow-300 capitalize">{{ titulo() }}</h2>
      <div class="flex gap-2 text-sm">
        <button type="button" (click)="cambiarMes(-1)" class="px-3 py-1 border border-white/10 hover:border-yellow-400">‹</button>
        <button type="button" (click)="irHoy()" class="px-3 py-1 border border-white/10 hover:border-yellow-400">Hoy</button>
        <button type="button" (click)="cambiarMes(1)" class="px-3 py-1 border border-white/10 hover:border-yellow-400">›</button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 mb-1 text-center text-[11px] tracking-widest text-neutral-500">
      @for (h of cabeceras; track h) { <span>{{ h }}</span> }
    </div>
    <div class="grid grid-cols-7 gap-1">
      @for (c of celdas(); track c.iso) {
        <button type="button" [class]="clase(c)" (click)="seleccionado.set(c.iso)">
          {{ c.dia }}
          <span class="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            @if (c.plan && c.delMes) { <i class="w-1.5 h-1.5 rounded-full bg-yellow-400"></i> }
            @if (c.asistio) { <i class="w-1.5 h-1.5 rounded-full bg-green-400"></i> }
          </span>
        </button>
      }
    </div>

    <div class="mt-3 flex gap-4 text-[11px] text-neutral-500">
      <span class="flex items-center gap-1.5"><i class="w-2 h-2 rounded-full bg-yellow-400"></i> Día de entrenamiento</span>
      <span class="flex items-center gap-1.5"><i class="w-2 h-2 rounded-full bg-green-400"></i> Asististe</span>
    </div>

    <div class="mt-5 border-t border-white/10 pt-4">
      <p class="text-sm font-bold capitalize text-white">
        {{ detalle().titulo }}
        @if (detalle().asistio) { <span class="ml-2 text-xs text-green-400">✓ Asististe</span> }
      </p>
      @for (it of detalle().items; track $index) {
        <div class="mt-3">
          <p class="text-[11px] tracking-widest uppercase text-yellow-400">{{ it.rutina }}</p>
          <p class="whitespace-pre-line text-sm leading-7 text-neutral-300">{{ it.texto }}</p>
        </div>
      } @empty {
        <p class="mt-2 text-sm text-neutral-500">Sin rutina para este día.</p>
      }
    </div>
  `
})
export class RutinaCalendario {
  rutinas = input.required<RutinaCliente[]>();
  asistencias = input<AsistenciaCliente[]>([]);

  readonly cabeceras = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  private readonly hoyIso = aIso(new Date());
  readonly mes = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly seleccionado = signal(this.hoyIso);

  readonly titulo = computed(() =>
    this.mes().toLocaleDateString('es-BO', { month: 'long', year: 'numeric' }));

  private readonly plan = computed(() => {
    const porDia = new Map<number, { rutina: string; texto: string }[]>();
    for (const r of this.rutinas()) {
      for (const [dia, texto] of parsearDias(r.contenido)) {
        if (!texto) continue;
        porDia.set(dia, [...(porDia.get(dia) ?? []), { rutina: r.nombre, texto }]);
      }
    }
    return porDia;
  });

  readonly celdas = computed<Celda[]>(() => {
    const m = this.mes();
    const asistio = new Set(this.asistencias().map(a => a.fecha));
    const inicio = new Date(m.getFullYear(), m.getMonth(), 1 - ((m.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
      const iso = aIso(d);
      return {
        iso, dia: d.getDate(), delMes: d.getMonth() === m.getMonth(),
        hoy: iso === this.hoyIso, plan: this.plan().has(d.getDay()), asistio: asistio.has(iso),
      };
    });
  });

  readonly detalle = computed(() => {
    const iso = this.seleccionado();
    const d = new Date(`${iso}T00:00:00`);
    return {
      titulo: d.toLocaleDateString('es-BO', { weekday: 'long', day: '2-digit', month: 'long' }),
      items: this.plan().get(d.getDay()) ?? [],
      asistio: this.asistencias().some(a => a.fecha === iso),
    };
  });

  cambiarMes(delta: number) {
    this.mes.update(m => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  irHoy() {
    const h = new Date();
    this.mes.set(new Date(h.getFullYear(), h.getMonth(), 1));
    this.seleccionado.set(this.hoyIso);
  }

  clase(c: Celda): string {
    const sel = c.iso === this.seleccionado();
    return 'relative h-14 border text-sm transition '
      + (sel ? 'border-yellow-400 bg-yellow-400/10 ' : 'border-white/10 hover:border-yellow-500/40 ')
      + (c.delMes ? 'text-white' : 'text-neutral-600')
      + (c.hoy ? ' font-black text-yellow-300' : '');
  }
}