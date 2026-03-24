import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as UserRole[] | undefined;
  const currentRole = authService.getRole();

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!expectedRoles?.length) {
    return true;
  }

  if (currentRole && expectedRoles.includes(currentRole)) {
    return true;
  }

  authService.redirectByRole(currentRole);
  return false;
};
