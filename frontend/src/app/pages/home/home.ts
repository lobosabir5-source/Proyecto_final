import { Component, OnInit, computed, inject } from '@angular/core';
import { Plan } from '../../models/admin.models';
import { AuthService } from '../../services/auth.service';
import { ClienteService } from '../../services/cliente.service';
import { PlanPublicoService } from '../../services/plan-publico.service';
import { ConfiguracionService, Configuracion } from '../../services/configuracion.service';
import { PromocionPublicaService, PromocionPublica } from '../../services/promocion-publica.service';
import { HomeNavbar } from './components/home-navbar';
import { HomeHero } from './components/home-hero';
import { PlanesSection } from './components/planes-section';
import { PromocionesSection } from './components/promociones-section';
import { UbicacionSection } from './components/ubicacion-section';
import { ContactoSection } from './components/contacto-section';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeNavbar, HomeHero, PlanesSection, PromocionesSection, UbicacionSection, ContactoSection],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly clienteSrv = inject(ClienteService);
  private readonly planService = inject(PlanPublicoService);
  private readonly configService = inject(ConfiguracionService);
  private readonly promoService = inject(PromocionPublicaService);

  nombre = computed(() => this.auth.nombreVisible());
  esCliente = computed(() => this.auth.hasRole('CLIENTE'));

  // Nombre del plan que el cliente ya tiene (null si no es cliente o si no tiene ninguno asignado)
  planActual = computed(() =>
    this.esCliente()
      ? this.clienteSrv.membresias().find(m => ['PENDIENTE', 'ACTIVA', 'POR_VENCER'].includes(m.estado))?.plan ?? null
      : null
  );

  configuracion: Configuracion | null = null;
  promociones: PromocionPublica[] = [];
  planes: Plan[] = [];
  cargandoPlanes = true;
  errorPlanes = false;

  ngOnInit(): void {
    if (this.esCliente()) this.clienteSrv.cargar();
    this.cargarPlanes();
    this.configService.obtenerPublica().subscribe({ next: d => (this.configuracion = d) });
    this.promoService.listarVigentes().subscribe({ next: d => (this.promociones = d), error: () => (this.promociones = []) });
  }

  cargarPlanes(): void {
    this.cargandoPlanes = true;
    this.errorPlanes = false;
    this.planService.listarActivos().subscribe({
      next: planes => {
        this.planes = planes
          .filter(p => p.activo)
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.nombre.localeCompare(b.nombre));
        this.cargandoPlanes = false;
      },
      error: () => { this.errorPlanes = true; this.cargandoPlanes = false; }
    });
  }

  cerrarSesion(): void {
    this.auth.logout();
  }
}