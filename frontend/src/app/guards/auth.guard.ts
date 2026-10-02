import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rol } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const roleGuard = (allowedRoles: Rol[]): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.hasRole(...allowedRoles)
    ? true
    : router.createUrlTree(['/dashboard']);
};
