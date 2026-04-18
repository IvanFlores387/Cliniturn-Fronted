import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { filter, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../services/auth.service';
import { MenuItem } from '../../../core/models/menu-item.model';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.currentUrl.set(this.router.url);
      });
  }

  readonly currentUser = computed(() => this.authService.user());

  readonly currentRole = computed<UserRole | null>(() => {
    const authRole = this.authService.role();
    if (authRole) return authRole;

    const url = this.currentUrl();

    if (url.startsWith('/paciente')) return 'paciente';
    if (url.startsWith('/medico')) return 'medico';
    if (url.startsWith('/admin')) return 'admin';

    return null;
  });

  readonly menu = computed<MenuItem[]>(() => {
    const role = this.currentRole();

    if (role === 'paciente') {
      return [
        { label: 'Dashboard', route: '/paciente/dashboard', icon: 'layout-dashboard' },
        { label: 'Nueva Cita', route: '/paciente/nueva-cita', icon: 'calendar-plus' },
        { label: 'Mis Citas', route: '/paciente/mis-citas', icon: 'calendar-days' },
      ];
    }

    if (role === 'medico') {
      return [
        { label: 'Dashboard', route: '/medico/dashboard', icon: 'layout-dashboard' },
        { label: 'Mis Citas', route: '/medico/mis-citas', icon: 'calendar-days' },
        { label: 'Expedientes', route: '/medico/expedientes', icon: 'file-text' },
      ];
    }

    if (role === 'admin') {
      return [
        { label: 'Dashboard', route: '/admin/dashboard', icon: 'layout-dashboard' },
        { label: 'Citas', route: '/admin/citas', icon: 'calendar-days' },
        { label: 'Médicos', route: '/admin/gestion-medicos', icon: 'stethoscope' },
        { label: 'Consultorios', route: '/admin/gestion-consultorios', icon: 'building-2' },
        { label: 'Reportes', route: '/admin/reportes', icon: 'bar-chart-3' },
        { label: 'Horarios Médicos', route: '/admin/horarios-medicos', icon: 'clock-3' },
      ];
    }

    return [];
  });

  get userName(): string {
    const user = this.currentUser();

    if (user?.nombre?.trim()) {
      return `${user.nombre}${user.apellidos ? ' ' + user.apellidos : ''}`;
    }

    if (this.currentRole() === 'paciente') return 'Paciente';
    if (this.currentRole() === 'medico') return 'Médico';
    if (this.currentRole() === 'admin') return 'Administrador';

    return 'Usuario';
  }

  get userRoleLabel(): string {
    const role = this.currentRole();
    if (role === 'paciente') return 'Paciente';
    if (role === 'medico') return 'Médico';
    if (role === 'admin') return 'Administrador';
    return 'Usuario';
  }

  get extraInfo(): string {
    const user = this.currentUser();

    if (!user) return '';

    if (user.role === 'paciente') {
      return user.matricula ? `Matrícula: ${user.matricula}` : '';
    }

    if (user.role === 'medico') {
      return user.especialidad ? `Especialidad: ${user.especialidad}` : '';
    }

    return user.email ?? '';
  }
}
