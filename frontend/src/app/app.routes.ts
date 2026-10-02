import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  // ---------- RECEPCIÓN ----------
  {
    path: 'recepcion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/recepcion/recepcion-layout').then(m => m.RecepcionLayoutComponent),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio',       loadComponent: () => import('./pages/recepcion/inicio/inicio').then(m => m.InicioComponent) },
      { path: 'clientes',     loadComponent: () => import('./pages/recepcion/clientes/clientes').then(m => m.ClientesComponent) },
      { path: 'asistencias',  loadComponent: () => import('./pages/recepcion/asistencias/asistencias').then(m => m.AsistenciasComponent) },
      { path: 'pagos',        loadComponent: () => import('./pages/recepcion/pagos/pagos').then(m => m.PagosComponent) },
      { path: 'planes',       loadComponent: () => import('./pages/recepcion/planes/planes').then(m => m.PlanesComponent) },
    ]
  },
  // ---------- CLIENTE ----------
  {
    path: 'cliente',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/cliente/cliente-layout').then(m => m.ClienteLayoutComponent),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio',       loadComponent: () => import('./pages/cliente/inicio/inicio').then(m => m.InicioComponent) },
      { path: 'suscripcion',  loadComponent: () => import('./pages/cliente/suscripcion/suscripcion').then(m => m.SuscripcionComponent) },
      { path: 'asistencias',  loadComponent: () => import('./pages/cliente/asistencias/asistencias').then(m => m.AsistenciasComponent) },
      { path: 'pagos',        loadComponent: () => import('./pages/cliente/pagos/pagos').then(m => m.PagosComponent) },
      { path: 'rutinas',      loadComponent: () => import('./pages/cliente/rutinas/rutinas').then(m => m.RutinasComponent) },
      { path: 'permisos',     loadComponent: () => import('./pages/cliente/permisos/permisos').then(m => m.PermisosComponent) },
      { path: 'promociones',  loadComponent: () => import('./pages/cliente/promociones/promociones').then(m => m.PromocionesComponent) },
      { path: 'perfil',       loadComponent: () => import('./pages/cliente/perfil/perfil').then(m => m.PerfilComponent) },
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];