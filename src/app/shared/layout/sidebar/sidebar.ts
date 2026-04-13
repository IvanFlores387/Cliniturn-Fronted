import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../../services/auth.service';
import { MenuItem } from '../../../core/models/menu-item.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  readonly currentUser = computed(() => this.authService.getCurrentUser());
  readonly currentRole = computed(() => this.authService.getRole());

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
    if (!user) return 'Usuario';
    return `${user.nombre}${user.apellidos ? ' ' + user.apellidos : ''}`;
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
