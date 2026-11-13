import { Routes } from '@angular/router';
import { roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ---------- LANDING PAGE (pública) ----------
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro) },

  // ---------- ADMIN ----------
  {
    path: 'admin',
    canActivate: [roleGuard(['ADMIN'])],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'usuarios', loadComponent: () => import('./pages/admin/usuarios/admin-usuarios').then(m => m.AdminUsuarios) },
      { path: 'planes', loadComponent: () => import('./pages/admin/planes/admin-planes').then(m => m.AdminPlanes) },
      { path: 'promociones', loadComponent: () => import('./pages/admin/promociones/admin-promociones').then(m => m.AdminPromociones) },
      { path: 'herramientas', loadComponent: () => import('./pages/admin/herramientas/admin-herramientas').then(m => m.AdminHerramientas) },
      { path: 'configuracion', loadComponent: () => import('./pages/admin/configuracion/admin-configuracion').then(m => m.AdminConfiguracion) },
      { path: 'categorias-bar', loadComponent: () => import('./pages/admin/categorias-bar/categorias-bar').then(m => m.CategoriasBar) },
      { path: 'productos-bar', loadComponent: () => import('./pages/admin/productos-bar/productos-bar').then(m => m.ProductosBar) },
      { path: 'clientes', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminClientes) },
      { path: 'membresias', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminMembresias) },
      { path: 'pagos', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminPagos) },
      { path: 'caja', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminCaja) },
      { path: 'secciones', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminSecciones) },
      { path: 'personal', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminPersonal) },
      { path: 'asistencia-personal', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminAsistenciaPersonal) },
      { path: 'inventario', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminInventario) },
      { path: 'equipos', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminEquipos) },
      { path: 'mantenimiento', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminMantenimiento) },
      { path: 'aerobicos', loadComponent: () => import('./pages/admin/modulos/admin-modulos').then(m => m.AdminAerobicos) },
      { path: 'investigacion', loadComponent: () => import('./pages/admin/investigacion/investigacion').then(m => m.AdminInvestigacion) },
      { path: 'pedidos-bar', loadComponent: () => import('./pages/admin/pedidos-bar/pedidos-bar').then(m => m.PedidosBar) },
    ]
  },

  // ---------- RECEPCIÓN ----------
  {
    path: 'recepcion',
    canActivate: [roleGuard(['RECEPCIONISTA'])],
    loadComponent: () => import('./pages/recepcion/recepcion-layout').then(m => m.RecepcionLayoutComponent),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', loadComponent: () => import('./pages/recepcion/inicio/inicio').then(m => m.InicioComponent) },
      { path: 'clientes', loadComponent: () => import('./pages/recepcion/clientes/clientes').then(m => m.ClientesComponent) },
      { path: 'asistencias', loadComponent: () => import('./pages/recepcion/asistencias/asistencias').then(m => m.AsistenciasComponent) },
      { path: 'suscripciones', loadComponent: () => import('./pages/recepcion/suscripciones/suscripciones').then(m => m.SuscripcionesComponent) },
      { path: 'rutinas', loadComponent: () => import('./pages/recepcion/rutinas/rutinas').then(m => m.RutinasRecepcionComponent) },
      { path: 'pagos', loadComponent: () => import('./pages/recepcion/pagos/pagos').then(m => m.PagosComponent) },
      { path: 'caja', loadComponent: () => import('./pages/recepcion/caja/caja').then(m => m.CajaComponent) },
      { path: 'permisos', loadComponent: () => import('./pages/recepcion/permisos/permisos').then(m => m.PermisosRecepcionComponent) },
      { path: 'planes', loadComponent: () => import('./pages/recepcion/planes/planes').then(m => m.PlanesComponent) },
      { path: 'carnet', loadComponent: () => import('./pages/recepcion/carnet/carnet').then(m => m.CarnetRecepcionComponent) },
      { path: 'bar', loadComponent: () => import('./pages/recepcion/bar/bar').then(m => m.BarRecepcionComponent) },
      { path: 'aerobicos', loadComponent: () => import('./pages/recepcion/aerobicos/aerobicos').then(m => m.AerobicosRecepcionComponent) },
    ]
  },

  // ---------- CLIENTE ----------
  {
    path: 'cliente',
    canActivate: [roleGuard(['CLIENTE'])],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
      {
        path: '',
        loadComponent: () => import('./pages/cliente/cliente-layout').then(m => m.ClienteLayoutComponent),
        children: [
          { path: 'panel', loadComponent: () => import('./pages/cliente/inicio/inicio').then(m => m.InicioComponent) },
          { path: 'carnet', loadComponent: () => import('./pages/cliente/carnet/carnet').then(m => m.CarnetComponent) },
          { path: 'suscripcion', loadComponent: () => import('./pages/cliente/suscripcion/suscripcion').then(m => m.SuscripcionComponent) },
          { path: 'asistencias', loadComponent: () => import('./pages/cliente/asistencias/asistencias').then(m => m.AsistenciasComponent) },
          { path: 'pagos', loadComponent: () => import('./pages/cliente/pagos/pagos').then(m => m.PagosComponent) },
          { path: 'rutinas', loadComponent: () => import('./pages/cliente/rutinas/rutinas').then(m => m.RutinasComponent) },
          { path: 'permisos', loadComponent: () => import('./pages/cliente/permisos/permisos').then(m => m.PermisosComponent) },
          { path: 'promociones', loadComponent: () => import('./pages/cliente/promociones/promociones').then(m => m.PromocionesComponent) },
          { path: 'perfil', loadComponent: () => import('./pages/cliente/perfil/perfil').then(m => m.PerfilComponent) },
        ]
      },
    ]
  },

  { path: '**', redirectTo: '' }
];