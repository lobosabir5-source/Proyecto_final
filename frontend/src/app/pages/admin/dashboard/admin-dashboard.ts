import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Icon } from '../../../components/icon/icon';
import { StatCard } from '../../../components/stat-card/stat-card';
import { Plan, ReporteResumen, UsuarioAdmin } from '../../../models/admin.models';
import { AuthService, Rol } from '../../../services/auth.service';
import { PlanAdminService } from '../../../services/plan-admin.service';
import { ReporteService } from '../../../services/reporte.service';
import { UsuarioService } from '../../../services/usuario.service';
import { leerErrorApi } from '../../../utils/api-error';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DecimalPipe, Icon, StatCard],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly planService = inject(PlanAdminService);
  private readonly usuarioService = inject(UsuarioService);
  readonly authService = inject(AuthService);

  readonly cargando = signal(false);
  readonly error = signal('');
  readonly resumen = signal<ReporteResumen | null>(null);
  readonly planes = signal<Plan[]>([]);
  readonly usuarios = signal<UsuarioAdmin[]>([]);

  readonly planesActivos = computed(() => this.planes().filter(plan => plan.activo));

  readonly porcentajeActivas = computed(() => {
    const datos = this.resumen();
    if (!datos) {
      return 0;
    }
    const total = datos.membresiasActivas + datos.membresiasPendientes;
    return total > 0 ? Math.round((datos.membresiasActivas / total) * 100) : 0;
  });

  private readonly precioMaximo = computed(() =>
    Math.max(0, ...this.planesActivos().map(plan => plan.precio))
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');

    forkJoin({
      resumen: this.reporteService.resumen(),
      planes: this.planService.listar(),
      usuarios: this.usuarioService.listar(0, 5)
    }).subscribe({
      next: ({ resumen, planes, usuarios }) => {
        this.resumen.set(resumen);
        this.planes.set(planes);
        this.usuarios.set(usuarios.content);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(leerErrorApi(error).mensaje);
        this.cargando.set(false);
      }
    });
  }

  porcentajePrecio(plan: Plan): number {
    const maximo = this.precioMaximo();
    return maximo > 0 ? Math.round((plan.precio / maximo) * 100) : 0;
  }

  inicial(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }

  etiquetaRol(rol: Rol): string {
    const etiquetas: Record<Rol, string> = {
      ADMIN: 'Administrador',
      RECEPCIONISTA: 'Recepcionista',
      CLIENTE: 'Cliente'
    };
    return etiquetas[rol];
  }
}