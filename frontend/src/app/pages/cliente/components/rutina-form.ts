import { Component, inject, output, signal } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { DIAS_FORM, armarContenido } from '../../../utils/rutina-dias';

@Component({
  selector: 'app-rutina-form',
  standalone: true,
  host: { class: 'block bg-[#111] border border-yellow-500/20 p-6' },
  template: `
    <h2 class="text-xl font-black text-yellow-300 mb-4">Crear mi rutina</h2>

    <label class="block text-xs tracking-widest uppercase text-neutral-400 mb-1">Nombre</label>
    <input type="text" maxlength="120" [value]="nombre()" (input)="nombre.set($any($event.target).value)"
           placeholder="Ej: Hipertrofia 4 días"
           class="w-full bg-neutral-950 border border-white/10 px-3 py-2 text-sm focus:border-yellow-400 outline-none" />

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      @for (d of dias; track d.n) {
        <div>
          <label class="block text-xs tracking-widest uppercase text-neutral-400 mb-1">{{ d.label }}</label>
          <textarea rows="3" [value]="textos()[d.n]" (input)="setDia(d.n, $any($event.target).value)"
                    placeholder="Ej: Pecho y tríceps, 4x10 press banca..."
                    class="w-full bg-neutral-950 border border-white/10 px-3 py-2 text-sm focus:border-yellow-400 outline-none"></textarea>
        </div>
      }
    </div>
    <p class="mt-2 text-xs text-neutral-500">Deja vacíos los días de descanso.</p>

    @if (error()) { <p class="mt-3 text-sm text-red-400">{{ error() }}</p> }

    <button type="button" (click)="guardar()" [disabled]="guardando()"
            class="mt-4 px-5 py-2 bg-yellow-400 text-neutral-950 font-bold text-sm disabled:opacity-50">
      {{ guardando() ? 'Guardando...' : 'Guardar rutina' }}
    </button>
  `
})
export class RutinaForm {
  private readonly srv = inject(ClienteService);
  readonly creada = output<void>();

  readonly dias = DIAS_FORM;
  readonly nombre = signal('');
  readonly textos = signal<Record<number, string>>({});
  readonly guardando = signal(false);
  readonly error = signal('');

  setDia(n: number, valor: string) {
    this.textos.update(t => ({ ...t, [n]: valor }));
  }

  guardar() {
    const contenido = armarContenido(this.textos());
    if (!this.nombre().trim() || !contenido) {
      this.error.set('Escribe un nombre y al menos un día de entrenamiento.');
      return;
    }
    this.error.set('');
    this.guardando.set(true);
    this.srv.crearRutina(this.nombre().trim(), contenido).subscribe({
      next: () => {
        this.guardando.set(false);
        this.nombre.set('');
        this.textos.set({});
        this.creada.emit();
      },
      error: e => {
        this.guardando.set(false);
        this.error.set(e?.error?.message ?? 'No se pudo guardar la rutina.');
      },
    });
  }
}