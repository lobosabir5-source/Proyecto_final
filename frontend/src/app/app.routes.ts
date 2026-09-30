import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard | Gold\'s Gym',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'usuarios',
        title: 'Usuarios | Gold\'s Gym',
        loadComponent: () => import('./pages/admin/usuarios/admin-usuarios').then(m => m.AdminUsuarios)
      },
      {
        path: 'planes',
        title: 'Planes | Gold\'s Gym',
        loadComponent: () => import('./pages/admin/planes/admin-planes').then(m => m.AdminPlanes)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];