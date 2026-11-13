import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { CarnetService } from '../../../services/carnet.service';
import { Carnet } from '../../../models/carnet.models';
import { resolverImagen } from '../../../utils/imagen';
import { leerErrorApi } from '../../../utils/api-error';
import { PageHeader } from '../components/page-header';

@Component({
  selector: 'app-carnet-cliente',
  standalone: true,
  imports: [DatePipe, PageHeader],
  template: `
<app-page-header eyebrow="Mi cuenta" titulo="Mi carnet" subtitulo="Carnet digital con tu información y permisos" />
@if (error()) { <p role="alert" class="text-red-400">{{ error() }}</p> }
@else if (cargando()) { <p class="text-neutral-400">Cargando...</p> }
@else if (carnet(); as c) {
  <article class="mx-auto max-w-md rounded-2xl border border-yellow-400/40 bg-neutral-900 p-6 text-white shadow-xl">
    <div class="flex items-center gap-4">
      @if (foto(c); as f) { <img [src]="f" alt="Fotografía del cliente" class="h-20 w-20 rounded-full object-cover" /> }
      @else { <div class="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-2xl font-black text-black">{{ c.nombreCompleto.charAt(0) }}</div> }
      <div>
        <h2 class="text-xl font-bold">{{ c.nombreCompleto }}</h2>
        <p class="text-sm text-neutral-400">Documento: {{ c.numeroDocumento ?? '—' }}</p>
      </div>
    </div>
    <dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
      <div><dt class="text-neutral-400">Plan</dt><dd class="font-semibold">{{ c.plan ?? 'Sin plan' }}</dd></div>
      <div><dt class="text-neutral-400">Estado</dt><dd class="font-semibold">{{ c.estado ?? '—' }}</dd></div>
      <div><dt class="text-neutral-400">Inicio</dt><dd>{{ c.fechaInicio ? (c.fechaInicio | date:'dd/MM/yyyy') : '—' }}</dd></div>
      <div><dt class="text-neutral-400">Vence</dt><dd>{{ c.fechaFin ? (c.fechaFin | date:'dd/MM/yyyy') : '—' }}</dd></div>
    </dl>
    <div class="mt-5">
      <p class="mb-2 text-sm text-neutral-400">Permisos del mes: {{ c.permisosUsadosMes }} usados · {{ c.permisosDisponiblesMes }} disponibles</p>
      <div class="flex gap-2" aria-hidden="true">
        @for (usado of c.circulosPermisos; track $index) {
          <span [class]="usado ? 'h-5 w-5 rounded-full bg-yellow-400' : 'h-5 w-5 rounded-full border border-yellow-400'"></span>
        }
      </div>
    </div>
  </article>
}`,
})
export class CarnetComponent implements OnInit {
  private readonly api = inject(CarnetService);
  readonly carnet = signal<Carnet | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.api.obtener().subscribe({
      next: c => { this.carnet.set(c); this.cargando.set(false); },
      error: (e: HttpErrorResponse) => { this.error.set(leerErrorApi(e).mensaje); this.cargando.set(false); },
    });
  }
  foto(c: Carnet): string | null { return resolverImagen(c.fotoUrl); }
}