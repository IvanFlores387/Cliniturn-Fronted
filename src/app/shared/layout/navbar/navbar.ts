import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
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

  readonly effectiveRole = computed<UserRole | null>(() => {
    return this.authService.getRole() ?? this.resolveRoleFromUrl();
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

  private resolveRoleFromUrl(): UserRole | null {
    const url = this.router.url || '';

    if (url.startsWith('/paciente')) return 'paciente';
    if (url.startsWith('/medico')) return 'medico';
    if (url.startsWith('/admin')) return 'admin';

    return null;
  }
}
