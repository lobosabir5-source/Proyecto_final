import { Component, computed, inject } from '@angular/core';
import { ClienteService } from '../../../services/cliente.service';
import { AuthService } from '../../../services/auth.service';
import { KpiCard } from '../components/kpi-card';
import { AccesoCard } from '../components/acceso-card';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [KpiCard, AccesoCard],
  host: { class: 'block' },
  template: `
    <header class="mb-10">
      <p class="text-[11px] tracking-[0.4em] text-yellow-400 uppercase mb-3">Gold's Gym / Mi panel</p>
      <h1 class="text-5xl font-black tracking-tight leading-none">
        Hola,<br><span class="text-yellow-400">{{ nombre() }}</span>
      </h1>
      <p class="text-neutral-400 mt-3">Tu resumen de entrenamiento y cuenta.</p>
    </header>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      <app-kpi-card etiqueta="Plan actual">{{ srv.membresiaActual()?.plan || 'Sin membresía' }}</app-kpi-card>
      <app-kpi-card etiqueta="Días restantes" grande>{{ srv.diasRestantes() }}</app-kpi-card>
      <app-kpi-card etiqueta="Visitas este mes" grande>{{ visitasMes() }}</app-kpi-card>
      <app-kpi-card etiqueta="Total pagado" grande>Bs {{ srv.totalPagado() }}</app-kpi-card>
    </section>

    <h2 class="text-[11px] tracking-[0.4em] text-yellow-400 uppercase mb-4">Accesos rápidos</h2>
    <section class="grid grid-cols-1 md:grid-cols-3 gap-5">
      @for (a of accesos; track a.ruta) {
        <app-acceso-card [ruta]="a.ruta" [titulo]="a.titulo" [detalle]="a.detalle" />
      }
    </section>
  `
})
export class InicioComponent {
  protected readonly srv = inject(ClienteService);
  private readonly auth = inject(AuthService);

  nombre = computed(() => this.auth.nombreVisible().split(/\s+/)[0] || '');

  visitasMes = computed(() => {
    const hoy = new Date();
    return this.srv.asistencias().filter(a => {
      const f = new Date(`${a.fecha}T00:00:00`);
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    }).length;
  });

  accesos = [
    { ruta: '/cliente/rutinas', titulo: 'Ver mi rutina', detalle: 'Ejercicios de la semana' },
    { ruta: '/cliente/suscripcion', titulo: 'Mi suscripción', detalle: 'Renovaciones y vencimiento' },
    { ruta: '/cliente/promociones', titulo: 'Promociones', detalle: 'Descuentos activos' },
  ];
}