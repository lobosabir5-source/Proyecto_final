import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, type ChartData, type ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { Icon } from '../../../components/icon/icon';
import { StatCard } from '../../../components/stat-card/stat-card';
import { Plan, PuntoMensual, ReporteResumen, UsuarioAdmin } from '../../../models/admin.models';
import { AuthService, Rol } from '../../../services/auth.service';
import { PlanAdminService } from '../../../services/plan-admin.service';
import { ReporteService } from '../../../services/reporte.service';
import { UsuarioService } from '../../../services/usuario.service';
import { leerErrorApi } from '../../../utils/api-error';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DecimalPipe, Icon, StatCard, BaseChartDirective],
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

  readonly opcionesBarras: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };
  readonly opcionesLineas: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } }
  };
  readonly opcionesDona: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  readonly datosIngresos = computed<ChartData<'bar'>>(() => {
    const puntos = this.resumen()?.ingresosPorMes ?? [];
    return {
      labels: puntos.map(p => p.mes),
      datasets: [{ label: 'Ingresos (Bs)', data: puntos.map(p => Number(p.valor)), backgroundColor: '#eab308' }]
    };
  });

  readonly datosTendencia = computed<ChartData<'line'>>(() => {
    const resumen = this.resumen();
    const clientes = resumen?.clientesPorMes ?? [];
    const renovaciones = resumen?.renovacionesPorMes ?? [];
    const meses = [...new Set([...clientes.map(p => p.mes), ...renovaciones.map(p => p.mes)])];
    return {
      labels: meses,
      datasets: [
        { label: 'Clientes nuevos', data: this.valoresPorMes(clientes, meses), borderColor: '#0ea5e9', backgroundColor: '#0ea5e9', tension: 0.3 },
        { label: 'Renovaciones', data: this.valoresPorMes(renovaciones, meses), borderColor: '#eab308', backgroundColor: '#eab308', tension: 0.3 }
      ]
    };
  });

  readonly datosEstados = computed<ChartData<'doughnut'>>(() => {
    const datos = this.resumen();
    return {
      labels: ['Activas', 'Por vencer', 'Vencidas'],
      datasets: [{
        data: datos ? [datos.membresiasActivas, datos.membresiasPorVencer, datos.membresiasVencidas] : [],
        backgroundColor: ['#16a34a', '#f59e0b', '#dc2626']
      }]
    };
  });

  readonly hayEstados = computed(() => (this.datosEstados().datasets[0]?.data ?? []).some(valor => Number(valor) > 0));
  private readonly precioMaximo = computed(() => Math.max(0, ...this.planesActivos().map(plan => plan.precio)));

  ngOnInit(): void { this.cargar(); }

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

  private valoresPorMes(puntos: PuntoMensual[], meses: string[]): number[] {
    const valores = new Map(puntos.map(p => [p.mes, Number(p.valor)]));
    return meses.map(mes => valores.get(mes) ?? 0);
  }

  porcentajePrecio(plan: Plan): number {
    const maximo = this.precioMaximo();
    return maximo > 0 ? Math.round((plan.precio / maximo) * 100) : 0;
  }

  inicial(nombre: string): string { return nombre.charAt(0).toUpperCase(); }

  etiquetaRol(rol: Rol): string {
    const etiquetas: Record<Rol, string> = { ADMIN: 'Administrador', RECEPCIONISTA: 'Recepcionista', CLIENTE: 'Cliente' };
    return etiquetas[rol];
  }
}
