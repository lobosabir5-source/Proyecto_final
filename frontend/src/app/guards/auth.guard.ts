import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rol } from '../services/auth.service';

export function rutaInicio(rol?: Rol | null): string {
  switch (rol) {
    case 'ADMIN':         return '/admin/usuarios';
    case 'RECEPCIONISTA': return '/recepcion/inicio';
    case 'CLIENTE':       return '/cliente/inicio';
    default:              return '/login';
  }
}

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const roleGuard = (allowedRoles: Rol[]): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  return authService.hasRole(...allowedRoles)
    ? true
    : router.createUrlTree([rutaInicio(authService.user()?.rol)]);
};