import { Component, inject } from '@angular/core';
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
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  get menu(): MenuItem[] {
    const role = this.authService.getRole();

    if (role === 'paciente') {
      return [
        { label: 'Dashboard', route: '/paciente/dashboard', icon: 'layout-dashboard' },
        { label: 'Nueva Cita', route: '/paciente/nueva-cita', icon: 'badge-plus' },
        { label: 'Mis Citas', route: '/paciente/mis-citas', icon: 'calendar' }
      ];
    }

    if (role === 'medico') {
      return [
        { label: 'Dashboard', route: '/medico/dashboard', icon: 'layout-dashboard' },
        { label: 'Mis Citas', route: '/medico/mis-citas', icon: 'calendar' },
        { label: 'Expedientes', route: '/medico/expedientes', icon: 'file-text' }
      ];
    }

    if (role === 'admin') {
      return [
        { label: 'Dashboard', route: '/admin/dashboard', icon: 'layout-dashboard' },
        { label: 'Expedientes', route: '/admin/expedientes', icon: 'file-text' },
        { label: 'Reportes', route: '/admin/reportes', icon: 'trending-up' },
        { label: 'Gestión Médicos', route: '/admin/gestion-medicos', icon: 'users' },
        { label: 'Gestión Consultorios', route: '/admin/gestion-consultorios', icon: 'building2' }
      ];
    }

    return [];
  }

  get userName(): string {
    return this.authService.getCurrentUser()?.nombre ?? 'Usuario';
  }

  get roleLabel(): string {
    const role = this.authService.getRole();
    if (role === 'admin') return 'Admin';
    if (role === 'medico') return 'Médico';
    if (role === 'paciente') return 'Paciente';
    return 'Usuario';
  }
}
