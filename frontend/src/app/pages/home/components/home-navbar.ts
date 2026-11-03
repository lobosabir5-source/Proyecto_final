import { Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Configuracion } from '../../../services/configuracion.service';

const MENU_CLIENTE = [
  { seccion: 'Mi cuenta', items: [
    { label: 'Mi panel',       route: '/cliente/panel' },
    { label: 'Mi suscripción', route: '/cliente/suscripcion' },
    { label: 'Mi perfil',      route: '/cliente/perfil' },
  ]},
  { seccion: 'Entrenamiento', items: [
    { label: 'Mis rutinas',     route: '/cliente/rutinas' },
    { label: 'Mis asistencias', route: '/cliente/asistencias' },
  ]},
  { seccion: 'Pagos y trámites', items: [
    { label: 'Mis pagos', route: '/cliente/pagos' },
    { label: 'Permisos',  route: '/cliente/permisos' },
  ]},
  { seccion: 'Beneficios', items: [
    { label: 'Promociones', route: '/cliente/promociones' },
  ]},
];

@Component({
  selector: 'app-home-navbar',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'block' },
  template: `
    <header class="relative z-20 flex items-center justify-between px-6 sm:px-8 py-6 border-b border-yellow-500/10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-yellow-400 flex items-center justify-center shadow-[0_0_25px_rgba(250,204,21,0.4)]">
          <span class="text-neutral-950 font-black text-xl">G</span>
        </div>
        <div>
          <p class="font-bebas text-xl tracking-widest leading-none">{{ config()?.nombreComercial || "GOLD'S FITNESS" }}</p>
          <p class="text-yellow-400 text-[9px] tracking-[0.3em] font-semibold">GIMNASIO PREMIUM</p>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-300">
        @for (l of links; track l.href) {
          <a [href]="l.href" class="hover:text-yellow-400 transition-colors">{{ l.texto }}</a>
        }
      </nav>

      <div class="flex items-center gap-4">
        @for (red of config()?.redesSociales ?? []; track red.id) {
          <a [href]="red.url" target="_blank" rel="noopener noreferrer"
             class="text-sm text-neutral-300 hover:text-yellow-400">{{ red.plataforma }}</a>
        }

        @if (esCliente()) {
          <div class="relative">
            <button type="button" (click)="abierto.set(!abierto())"
              class="rounded-md border border-yellow-400 px-5 py-2.5 font-semibold text-yellow-400 hover:bg-yellow-400 hover:text-neutral-950 transition-colors">
              👤 {{ nombre() }} {{ abierto() ? '▴' : '▾' }}
            </button>

            @if (abierto()) {
              <div class="absolute right-0 mt-2 w-60 bg-neutral-900 border border-yellow-500/30 shadow-2xl">
                @for (g of menu; track g.seccion) {
                  <p class="px-4 pt-3 pb-1 text-[10px] tracking-[0.3em] text-yellow-400/70 uppercase">{{ g.seccion }}</p>
                  @for (i of g.items; track i.route) {
                    <a [routerLink]="i.route" (click)="abierto.set(false)"
                       class="block px-4 py-2 text-sm text-neutral-300 hover:bg-yellow-400/10 hover:text-yellow-300">{{ i.label }}</a>
                  }
                }
                <button type="button" (click)="logout.emit()"
                  class="w-full text-left px-4 py-3 mt-2 border-t border-yellow-500/20 text-sm text-yellow-300 hover:bg-yellow-400 hover:text-neutral-950">
                  Cerrar sesión
                </button>
              </div>
            }
          </div>
        } @else {
          <a routerLink="/registro"
             class="hidden sm:inline-flex rounded-md bg-yellow-400 px-6 py-2.5 font-semibold text-neutral-950 hover:bg-yellow-300 transition-colors">Registrarme</a>
          <a routerLink="/login"
             class="rounded-md border border-yellow-400 px-6 py-2.5 font-semibold text-yellow-400 hover:bg-yellow-400 hover:text-neutral-950 transition-colors">Iniciar sesión</a>
        }
      </div>
    </header>
  `
})
export class HomeNavbar {
  config = input<Configuracion | null>(null);
  nombre = input('');
  esCliente = input(false);
  logout = output<void>();

  abierto = signal(false);
  menu = MENU_CLIENTE;
  links = [
    { href: '#planes', texto: 'Planes' },
    { href: '#ubicacion', texto: 'Ubicación' },
    { href: '#contacto', texto: 'Contacto' },
  ];
}