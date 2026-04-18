import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly currentPath = signal(this.getCurrentPath());

  constructor() {
    this.syncCurrentPath();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.syncCurrentPath();
      });
  }

  readonly effectiveRole = computed<UserRole | null>(() => {
    const authRole = this.authService.user()?.role;
    if (authRole) return authRole;

    const path = this.currentPath();

    if (path.startsWith('/paciente')) return 'paciente';
    if (path.startsWith('/medico')) return 'medico';
    if (path.startsWith('/admin')) return 'admin';

    return null;
  });

  logout(): void {
    this.authService.logout();
  }

  get userName(): string {
    const user = this.authService.getCurrentUser();

    if (user?.nombre?.trim()) {
      return `${user.nombre}${user.apellidos ? ' ' + user.apellidos : ''}`;
    }

    if (this.effectiveRole() === 'paciente') return 'Paciente';
    if (this.effectiveRole() === 'medico') return 'Médico';
    if (this.effectiveRole() === 'admin') return 'Administrador';

    return 'Usuario';
  }

  get roleLabel(): string {
    const role = this.effectiveRole();

    if (role === 'admin') return 'Admin';
    if (role === 'medico') return 'Médico';
    if (role === 'paciente') return 'Paciente';
    return 'Usuario';
  }

  private syncCurrentPath(): void {
    this.currentPath.set(this.getCurrentPath());
  }

  private getCurrentPath(): string {
    if (typeof window !== 'undefined' && window.location?.pathname) {
      return window.location.pathname;
    }

    return this.router.url || '';
  }
}
